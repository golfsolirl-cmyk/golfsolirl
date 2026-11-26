/**
 * Invisible spam protection for public enquiry forms.
 * Honeypot + minimum time-to-submit + per-email/IP rate limit + optional Google reCAPTCHA v3.
 * Skips captcha verification when RECAPTCHA_SECRET_KEY is unset.
 */
import { assertApiRateLimit, parsePositiveInt } from './api-rate-limit.mjs'

const throwStatus = (message, statusCode, code) => {
  const err = new Error(message)
  err.statusCode = statusCode
  if (code) err.code = code
  throw err
}

/** Generic rejection — do not tip bots which check failed. */
const rejectSpam = () => {
  throwStatus('Unable to send your request right now. Please try again in a moment.', 400, 'SPAM_REJECTED')
}

const readTrimmed = (env, key) => {
  const v = env?.[key]
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * @param {unknown} payload
 * @param {NodeJS.ProcessEnv} env
 * @param {{ clientIp?: string }} [runtime]
 */
export const assertEnquirySpamProtection = async (payload, env = process.env, runtime = {}) => {
  const spam =
    payload?.spamGuard && typeof payload.spamGuard === 'object' && !Array.isArray(payload.spamGuard)
      ? payload.spamGuard
      : payload

  const honey =
    (typeof spam?.honeypot === 'string' ? spam.honeypot : null) ??
    (typeof spam?.hp === 'string' ? spam.hp : null) ??
    (typeof spam?._hp === 'string' ? spam._hp : null) ??
    (typeof payload?.companyWebsite === 'string' ? payload.companyWebsite : null) ??
    ''
  if (String(honey).trim()) {
    rejectSpam()
  }

  const openedRaw = spam?.formOpenedAt ?? spam?.openedAt ?? payload?.formOpenedAt
  const openedAt = typeof openedRaw === 'number' ? openedRaw : Number(openedRaw)
  const minMs = parsePositiveInt(env.ENQUIRY_MIN_SUBMIT_MS, 2800)
  if (Number.isFinite(openedAt) && openedAt > 0) {
    const elapsed = Date.now() - openedAt
    if (elapsed < minMs || elapsed > 86_400_000 * 2) {
      rejectSpam()
    }
  } else if (String(env.ENQUIRY_REQUIRE_FORM_OPENED_AT ?? '').toLowerCase() === 'true') {
    rejectSpam()
  }

  const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : ''
  if (email) {
    assertApiRateLimit('enquiry-email', email, env, {
      max: parsePositiveInt(env.ENQUIRY_EMAIL_RATE_LIMIT_PER_WINDOW, 4),
      windowMs: parsePositiveInt(env.ENQUIRY_RATE_WINDOW_MS, 900_000),
      message: 'Too many enquiry submissions for this email. Please wait a few minutes and try again.'
    })
  }

  const ip = runtime.clientIp ?? 'unknown'
  assertApiRateLimit('enquiry-spam-ip', ip, env, {
    max: parsePositiveInt(env.ENQUIRY_RATE_LIMIT_PER_WINDOW, 6),
    windowMs: parsePositiveInt(env.ENQUIRY_RATE_WINDOW_MS, 900_000),
    message: 'Too many enquiry submissions from this connection. Please wait a few minutes and try again.'
  })

  await assertRecaptchaV3(spam, env, runtime)
}

/**
 * Google reCAPTCHA v3 only. No-op when RECAPTCHA_SECRET_KEY is unset.
 * @param {Record<string, unknown>} spam
 * @param {NodeJS.ProcessEnv} env
 * @param {{ clientIp?: string }} runtime
 */
const assertRecaptchaV3 = async (spam, env, runtime) => {
  const secret = readTrimmed(env, 'RECAPTCHA_SECRET_KEY')
  if (!secret) {
    return
  }

  const token =
    (typeof spam?.recaptchaToken === 'string' && spam.recaptchaToken.trim()) ||
    (typeof spam?.gRecaptchaResponse === 'string' && spam.gRecaptchaResponse.trim()) ||
    ''
  if (!token) {
    // Keys on server but client sent nothing — soft-skip unless require flag set
    if (isCaptchaRequired(env)) {
      throwStatus('Security check failed. Please refresh and try again.', 400, 'CAPTCHA_REQUIRED')
    }
    return
  }

  const expectedAction =
    (typeof spam?.recaptchaAction === 'string' && spam.recaptchaAction.trim()) ||
    (typeof spam?.action === 'string' && spam.action.trim()) ||
    ''
  const minScore = Number(env.RECAPTCHA_MIN_SCORE ?? 0.5)
  const scoreFloor = Number.isFinite(minScore) ? minScore : 0.5

  const result = await verifyRecaptchaV3(token, secret, runtime.clientIp)
  if (!result.ok) {
    throwStatus('Security check failed. Please refresh and try again.', 400, 'CAPTCHA_FAILED')
  }
  if (typeof result.score === 'number' && result.score < scoreFloor) {
    throwStatus('Security check failed. Please refresh and try again.', 400, 'CAPTCHA_FAILED')
  }
  if (expectedAction && result.action && result.action !== expectedAction) {
    throwStatus('Security check failed. Please refresh and try again.', 400, 'CAPTCHA_FAILED')
  }
}

const isCaptchaRequired = (env) => {
  const v = String(env.ENQUIRY_CAPTCHA_REQUIRE ?? '').trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

/**
 * @returns {Promise<{ ok: boolean, score?: number, action?: string }>}
 */
const verifyRecaptchaV3 = async (token, secret, remoteip) => {
  try {
    const body = new URLSearchParams()
    body.set('secret', secret)
    body.set('response', token)
    if (remoteip && remoteip !== 'unknown') body.set('remoteip', remoteip)
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    const data = await res.json().catch(() => ({}))
    if (!data?.success) {
      return { ok: false }
    }
    return {
      ok: true,
      score: typeof data.score === 'number' ? data.score : undefined,
      action: typeof data.action === 'string' ? data.action : undefined
    }
  } catch (err) {
    console.error('[enquiry-spam-guard] reCAPTCHA verify error:', err)
    return { ok: false }
  }
}
