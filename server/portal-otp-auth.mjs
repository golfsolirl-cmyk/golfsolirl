/**
 * Client portal email OTP + HMAC cookie (gsol_portal) bound to profile id + portal token fingerprint.
 */
import { createHmac, createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml } from './email-layout.mjs'
import { resolveResendToAddress } from './resend-delivery-email.mjs'
import { parseCookies, safeEqual, verifySessionToken as verifyAdminSession, adminCookieFromHeader } from './admin-session.mjs'
import { getGsolSiteUrl } from './site-url.mjs'
import { assertApiRateLimit } from './api-rate-limit.mjs'
import { isAuthEmailBlocked } from './email-address-registry.mjs'
import { createEnquiryReferenceId } from '../shared/document-templates.mjs'

export const PORTAL_COOKIE = 'gsol_portal'
export const PORTAL_SESSION_SECONDS = 60 * 60 * 24 * 30
export const PORTAL_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 180
export const CODE_TTL_MS = 10 * 60_000
export const CODE_MAX_TRIES = 5
export const CODE_MAX_SENDS_PER_HOUR = 5

const b64url = (buf) => Buffer.from(buf).toString('base64url')

const throwStatus = (message, statusCode, code) => {
  const err = new Error(message)
  err.statusCode = statusCode
  if (code) {
    err.code = code
  }
  throw err
}

/** @param {Record<string, string | undefined>} [env] */
const portalSecret = (env = process.env) => {
  const s = env.PORTAL_SESSION_SECRET?.trim() || env.ADMIN_SESSION_SECRET?.trim()
  if (s && s.length >= 32) {
    return `portal-v1:${s}`
  }
  if (env.NODE_ENV !== 'production' || env.PORTAL_LOCAL_TEST === '1') {
    return 'portal-v1:local-development-only-secret-not-for-prod'
  }
  return ''
}

/** @param {string} data @param {Record<string, string | undefined>} env */
const hmac = (data, env) => {
  const s = portalSecret(env)
  if (!s) {
    throw new Error('Portal secret not configured')
  }
  return b64url(createHmac('sha256', s).update(data).digest())
}

/** @param {string} token @param {Record<string, string | undefined>} env */
const tokenFp = (token, env) =>
  b64url(createHash('sha256').update(`portal-token:${token}`).digest()).slice(0, 22)

/**
 * @param {{ id: string; portal_token?: string | null; portal_token_issued_at?: string | null; portal_revoked_at?: string | null; created_at?: string }} profile
 * @param {string} token
 */
export const portalTokenLive = (profile, token) => {
  const stored = typeof profile.portal_token === 'string' ? profile.portal_token.trim() : ''
  if (!stored || !safeEqual(stored, token.trim())) {
    return false
  }
  if (profile.portal_revoked_at) {
    return false
  }
  const issued = Date.parse(profile.portal_token_issued_at || profile.created_at || '') || 0
  return Date.now() - issued < PORTAL_TOKEN_TTL_MS
}

/**
 * @param {{ id: string }} profile
 * @param {string} token
 * @param {Record<string, string | undefined>} env
 */
export const makePortalCookie = (profile, token, env = process.env) => {
  const exp = Math.floor(Date.now() / 1000) + PORTAL_SESSION_SECONDS
  const fp = tokenFp(token, env)
  const body = `${profile.id}.${exp}.${fp}`
  return `${body}.${hmac(body, env)}`
}

/**
 * @param {string | undefined} value
 * @param {{ id: string; portal_token?: string | null }} profile
 * @param {string} token
 * @param {Record<string, string | undefined>} env
 */
export const portalCookieValid = (value, profile, token, env = process.env) => {
  if (!value || !portalSecret(env)) {
    return false
  }
  const parts = value.split('.')
  if (parts.length !== 4) {
    return false
  }
  const [id, exp, fp, sig] = parts
  if (id !== profile.id || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) {
    return false
  }
  if (!safeEqual(fp, tokenFp(token, env))) {
    return false
  }
  return safeEqual(sig, hmac(`${id}.${exp}.${fp}`, env))
}

export const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0')

/**
 * @param {{ id: string }} profile
 * @param {string} token
 * @param {string} code
 * @param {Record<string, string | undefined>} env
 */
export const codeHash = (profile, token, code, env = process.env) =>
  hmac(`code:${profile.id}:${tokenFp(token, env)}:${code}`, env)

/** @param {string} email */
export const maskEmail = (email) => {
  const [user = '', domain = ''] = email.split('@')
  const dot = domain.lastIndexOf('.')
  const host = dot > 0 ? domain.slice(0, dot) : domain
  const tld = dot > 0 ? domain.slice(dot) : ''
  return `${user.slice(0, 1)}***@${host.slice(0, 1)}***${tld}`
}

const getAdmin = (env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throwStatus('Supabase is not configured on the server.', 500)
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const normalizeEmail = (raw) => (typeof raw === 'string' ? raw.trim().toLowerCase() : '')

/** @param {Record<string, string | undefined>} env @param {boolean} [clear] */
export const portalSetCookieHeader = (env = process.env, clear = false, value) => {
  const secure =
    String(env.NODE_ENV ?? '').toLowerCase() === 'production' && env.PORTAL_LOCAL_TEST !== '1'
  if (clear) {
    return `${PORTAL_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`
  }
  const base = `${PORTAL_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Max-Age=${PORTAL_SESSION_SECONDS}; SameSite=Lax`
  return secure ? `${base}; Secure` : base
}

export const ensurePortalToken = async (admin, profile) => {
  let token = typeof profile.portal_token === 'string' ? profile.portal_token.trim() : ''
  const now = new Date().toISOString()
  if (!token) {
    token = b64url(randomBytes(18))
    const { error } = await admin
      .from('profiles')
      .update({
        portal_token: token,
        portal_token_issued_at: now,
        portal_revoked_at: null,
        updated_at: now
      })
      .eq('id', profile.id)
    if (error) {
      throwStatus(error.message, 500)
    }
    profile.portal_token = token
    profile.portal_token_issued_at = now
  }
  return token
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {{ token?: string; email?: string }} input
 */
const resolveProfile = async (admin, input) => {
  const token = typeof input.token === 'string' ? input.token.trim() : ''
  const email = normalizeEmail(input.email)

  if (token) {
    const { data, error } = await admin
      .from('profiles')
      .select('id, email, full_name, portal_token, portal_token_issued_at, portal_revoked_at, portal_auth, created_at')
      .eq('portal_token', token)
      .maybeSingle()
    if (error) {
      throwStatus(error.message, 500)
    }
    if (!data) {
      throwStatus('This link is not valid.', 404, 'PORTAL_NOT_FOUND')
    }
    if (!portalTokenLive(data, token)) {
      throwStatus('This trip desk link has expired. Contact us for a fresh link.', 410, 'PORTAL_EXPIRED')
    }
    return { profile: data, token }
  }

  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const { data, error } = await admin
      .from('profiles')
      .select('id, email, full_name, portal_token, portal_token_issued_at, portal_revoked_at, portal_auth, created_at')
      .ilike('email', email)
      .maybeSingle()
    if (error) {
      throwStatus(error.message, 500)
    }
    if (!data) {
      throwStatus('No trip desk found for that email yet. Submit an enquiry first or use the email we have on file.', 404, 'PORTAL_NO_ACCOUNT')
    }
    const liveToken = await ensurePortalToken(admin, data)
    return { profile: data, token: liveToken }
  }

  throwStatus('Enter your email or open your personal trip desk link.', 400)
}

/** @typedef {{ codeHash?: string; codeExp?: string; tries?: number; sends?: string[]; verifiedAt?: string }} PortalAuthState */

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ clientIp?: string }} [runtime]
 */
/** OTP email codes — off by default; set PORTAL_OTP_ENABLE=1 to turn on. */
export const portalOtpEnabled = (env = process.env) =>
  env.PORTAL_OTP_ENABLE === '1' || env.PORTAL_OTP_ENABLE === 'true'

export const handlePortalOtpSend = async (body, env = process.env, runtime = {}) => {
  if (!portalOtpEnabled(env)) {
    throwStatus(
      'Email codes are turned off. Open your portal with your email and reference, or use your private link.',
      403,
      'PORTAL_OTP_DISABLED'
    )
  }
  if (!portalSecret(env)) {
    throwStatus('Portal sign-in is not configured.', 503, 'PORTAL_NOT_CONFIGURED')
  }

  const admin = getAdmin(env)
  const { profile, token } = await resolveProfile(admin, {
    token: typeof body?.token === 'string' ? body.token : undefined,
    email: typeof body?.email === 'string' ? body.email : undefined
  })

  const email = normalizeEmail(profile.email)
  if (!email) {
    throwStatus('We do not have an email on file for this account. Contact the trip desk.', 400)
  }

  /** @type {PortalAuthState} */
  const auth = profile.portal_auth && typeof profile.portal_auth === 'object' ? { ...profile.portal_auth } : {}
  const now = Date.now()
  const sends = (auth.sends ?? []).filter((t) => now - Date.parse(t) < 60 * 60_000)
  if (sends.length >= CODE_MAX_SENDS_PER_HOUR) {
    throwStatus(
      'We have sent several codes already. Check your inbox and spam, or try again in about an hour.',
      429,
      'PORTAL_SEND_LIMIT'
    )
  }

  const resendApiKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendApiKey || !fromEmail) {
    throwStatus('Email sending is not configured.', 500)
  }

  const code = newCode()
  const firstName = (profile.full_name || '').trim().split(/\s+/)[0] || 'there'

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: 'Your sign-in code · Golf Sol Ireland',
    preheader: `${code} is your Golf Sol Ireland sign-in code`,
    heroKicker: 'Trip desk',
    heroTitle: 'Your sign-in code',
    heroLead: `Hi ${firstName} — enter this code to open your trip desk. It expires in 10 minutes.`,
    bodyHtml: `<p style="margin:0 0 12px 0;font-size:28px;font-weight:800;letter-spacing:0.28em;color:#063B2A;">${code}</p>
      <p style="margin:0;font-size:14px;color:#4a5c54;">Sent to ${maskEmail(email)}</p>`
  })
  const html = finalizeGsolEmailHtml(htmlRaw)
  const to = resolveResendToAddress(email, env)
  const resend = new Resend(resendApiKey)
  const { error: sendErr } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: `${code} is your Golf Sol Ireland sign-in code`,
    html
  })
  if (sendErr) {
    if (env.PORTAL_LOCAL_TEST === '1') {
      console.log(`[portal:local-test] code ${code}`)
    } else {
      throwStatus(sendErr.message || 'Could not send email just now.', 502)
    }
  } else if (env.PORTAL_LOCAL_TEST === '1') {
    console.log(`[portal:local-test] code ${code}`)
  }

  const nextAuth = {
    ...auth,
    codeHash: codeHash(profile, token, code, env),
    codeExp: new Date(now + CODE_TTL_MS).toISOString(),
    tries: 0,
    sends: [...sends, new Date(now).toISOString()]
  }

  const { error: updErr } = await admin
    .from('profiles')
    .update({ portal_auth: nextAuth, updated_at: new Date().toISOString() })
    .eq('id', profile.id)

  if (updErr) {
    const msg = String(updErr.message || '')
    if (msg.toLowerCase().includes('portal_auth') || msg.toLowerCase().includes('portal_token')) {
      throwStatus(
        'Portal columns are missing. Apply migration 20261126120000_profiles_portal_token_auth.sql in Supabase.',
        503
      )
    }
    throwStatus(updErr.message, 500)
  }

  return { ok: true, sentTo: maskEmail(email) }
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 */
export const handlePortalOtpVerify = async (body, env = process.env) => {
  if (!portalOtpEnabled(env)) {
    throwStatus(
      'Email codes are turned off. Open your portal with your email and reference, or use your private link.',
      403,
      'PORTAL_OTP_DISABLED'
    )
  }
  if (!portalSecret(env)) {
    throwStatus('Portal sign-in is not configured.', 503, 'PORTAL_NOT_CONFIGURED')
  }

  const code = typeof body?.code === 'string' ? body.code.replace(/\D/g, '') : ''
  if (code.length !== 6) {
    throwStatus('Enter the 6-digit code from your email.', 400)
  }

  const admin = getAdmin(env)
  const { profile, token } = await resolveProfile(admin, {
    token: typeof body?.token === 'string' ? body.token : undefined,
    email: typeof body?.email === 'string' ? body.email : undefined
  })

  /** @type {PortalAuthState} */
  const a = profile.portal_auth && typeof profile.portal_auth === 'object' ? profile.portal_auth : {}
  if (!a.codeHash || !a.codeExp || Date.parse(a.codeExp) < Date.now()) {
    throwStatus('That code has expired. Tap “Email me a sign-in code” for a new one.', 400, 'PORTAL_CODE_EXPIRED')
  }
  if ((a.tries ?? 0) >= CODE_MAX_TRIES) {
    throwStatus('Too many wrong codes. Request a new sign-in code.', 429, 'PORTAL_CODE_TRIES')
  }

  const expected = a.codeHash
  const actual = codeHash(profile, token, code, env)
  const match =
    expected.length === actual.length && timingSafeEqual(Buffer.from(expected), Buffer.from(actual))

  if (!match) {
    const nextAuth = { ...a, tries: (a.tries ?? 0) + 1 }
    await admin
      .from('profiles')
      .update({ portal_auth: nextAuth, updated_at: new Date().toISOString() })
      .eq('id', profile.id)
    throwStatus('That code is not right. Check the latest email and try again.', 400, 'PORTAL_CODE_WRONG')
  }

  const verifiedAuth = { sends: a.sends, verifiedAt: new Date().toISOString() }
  await admin
    .from('profiles')
    .update({ portal_auth: verifiedAuth, updated_at: new Date().toISOString() })
    .eq('id', profile.id)

  const cookieVal = makePortalCookie(profile, token, env)
  return {
    ok: true,
    profileId: profile.id,
    setCookie: portalSetCookieHeader(env, false, cookieVal)
  }
}

/** @param {NodeJS.ProcessEnv} env */
export const handlePortalOtpLogout = (env = process.env) => ({
  ok: true,
  setCookie: portalSetCookieHeader(env, true)
})

/**
 * Admin cookie or valid portal cookie for this profile+token.
 * @param {string | undefined} cookieHeader
 * @param {{ id: string; portal_token?: string | null }} profile
 * @param {string} token
 * @param {Record<string, string | undefined>} env
 */
export const portalAccessAllowed = (cookieHeader, profile, token, env = process.env) => {
  const adminTok = adminCookieFromHeader(cookieHeader)
  if (verifyAdminSession(adminTok, env)) {
    return true
  }
  const portalTok = parseCookies(cookieHeader)[PORTAL_COOKIE]
  return portalCookieValid(portalTok, profile, token, env)
}

const PROFILE_PORTAL_COLS =
  'id, email, full_name, account_reference_id, portal_token, portal_token_issued_at, portal_revoked_at, portal_auth, created_at'

const GENERIC_PORTAL_LOGIN_ERROR =
  "We couldn't open your portal. Check the email and reference from your confirmation."

/** @param {string} raw */
export const normalizePortalReference = (raw) =>
  typeof raw === 'string' ? raw.trim().replace(/\s+/g, '').toUpperCase() : ''

const portalLoginAttempts = new Map()
const PORTAL_LOGIN_LOCK_WINDOW_MS = 15 * 60_000
const PORTAL_LOGIN_LOCK_MAX = 8

/** @param {string} key */
const prunePortalLoginAttempts = (key) => {
  const now = Date.now()
  const arr = (portalLoginAttempts.get(key) ?? []).filter((t) => now - t < PORTAL_LOGIN_LOCK_WINDOW_MS)
  portalLoginAttempts.set(key, arr)
  return arr
}

/** @param {string} key */
const portalLoginLocked = (key) => prunePortalLoginAttempts(key).length >= PORTAL_LOGIN_LOCK_MAX

/** @param {string} key */
const notePortalLoginFail = (key) => {
  prunePortalLoginAttempts(key).push(Date.now())
}

/** @param {string} key */
const clearPortalLoginAttempts = (key) => {
  portalLoginAttempts.delete(key)
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} email
 * @param {string} [fullName]
 * @param {string} [preferredReference]
 */
export const ensureAuthProfileForEmail = async (admin, email, fullName = '', preferredReference = '') => {
  const em = normalizeEmail(email)
  if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
    throwStatus('Valid email is required.', 400)
  }

  const { data: existing, error: exErr } = await admin
    .from('profiles')
    .select(PROFILE_PORTAL_COLS)
    .ilike('email', em)
    .maybeSingle()
  if (exErr) {
    throwStatus(exErr.message, 500)
  }

  let profile = existing
  if (!profile?.id) {
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: em,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : undefined
    })
    if (cErr && !/already|registered|exists/i.test(String(cErr.message || ''))) {
      throwStatus(cErr.message || 'Could not create portal account.', 400)
    }

    if (created?.user?.id) {
      const now = new Date().toISOString()
      await admin
        .from('profiles')
        .update({
          email: em,
          ...(fullName ? { full_name: fullName } : {}),
          updated_at: now
        })
        .eq('id', created.user.id)
    }

    const { data: again, error: againErr } = await admin
      .from('profiles')
      .select(PROFILE_PORTAL_COLS)
      .ilike('email', em)
      .maybeSingle()
    if (againErr) {
      throwStatus(againErr.message, 500)
    }
    if (!again?.id) {
      // Fallback: mint via generateLink so auth user exists, then re-read profile.
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: em
      })
      if (linkErr || !linkData?.user?.id) {
        throwStatus('Could not prepare your portal account just now.', 502)
      }
      const now = new Date().toISOString()
      await admin
        .from('profiles')
        .upsert({
          id: linkData.user.id,
          email: em,
          ...(fullName ? { full_name: fullName } : {}),
          updated_at: now
        })
      const { data: third } = await admin.from('profiles').select(PROFILE_PORTAL_COLS).eq('id', linkData.user.id).maybeSingle()
      if (!third?.id) {
        throwStatus('Could not prepare your portal account just now.', 502)
      }
      profile = third
    } else {
      profile = again
    }
  }

  const pref = normalizePortalReference(preferredReference)
  const currentRef = normalizePortalReference(profile.account_reference_id || '')
  if (pref && !currentRef) {
    const now = new Date().toISOString()
    const { error: refErr } = await admin
      .from('profiles')
      .update({ account_reference_id: pref, updated_at: now })
      .eq('id', profile.id)
    if (!refErr) {
      profile.account_reference_id = pref
    }
  }

  return profile
}

/**
 * Ensure portal_token + private URL for confirmation / invite emails.
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {{ email: string; fullName?: string; preferredReference?: string }} input
 * @param {Record<string, string | undefined>} [env]
 */
export const ensurePortalAccessForEmail = async (admin, input, env = process.env) => {
  const profile = await ensureAuthProfileForEmail(
    admin,
    input.email,
    input.fullName || '',
    input.preferredReference || ''
  )
  const token = await ensurePortalToken(admin, profile)
  const site = getGsolSiteUrl().replace(/\/+$/, '')
  const reference =
    normalizePortalReference(profile.account_reference_id || '') ||
    normalizePortalReference(input.preferredReference || '')
  return {
    profile,
    token,
    reference,
    privatePath: `/portal/${token}`,
    privateUrl: `${site}/portal/${encodeURIComponent(token)}`,
    portalLoginUrl: `${site}/portal`
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} email
 * @param {string} nextPath
 * @param {Record<string, string | undefined>} env
 */
const buildPortalSessionRedirect = async (admin, email, nextPath, env) => {
  const site = getGsolSiteUrl().replace(/\/+$/, '')
  const redirectTo = `${site}/auth/callback?next=${encodeURIComponent(nextPath)}`
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo }
  })
  if (error || !data?.properties) {
    throwStatus('Could not open your portal just now. Please try again.', 502)
  }
  const hashed =
    typeof data.properties.hashed_token === 'string' ? data.properties.hashed_token.trim() : ''
  if (hashed) {
    const out = new URL(`${site}/auth/callback`)
    out.searchParams.set('token_hash', hashed)
    out.searchParams.set('type', 'email')
    out.searchParams.set('next', nextPath)
    return out.toString()
  }
  const action =
    typeof data.properties.action_link === 'string' ? data.properties.action_link.trim() : ''
  if (!action) {
    throwStatus('Could not open your portal just now. Please try again.', 502)
  }
  return action
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} email
 * @param {string} reference
 */
const findProfileByEmailAndReference = async (admin, email, reference) => {
  const em = normalizeEmail(email)
  const ref = normalizePortalReference(reference)
  if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) || ref.length < 6) {
    return null
  }

  const { data: byAcct, error: aErr } = await admin
    .from('profiles')
    .select(PROFILE_PORTAL_COLS)
    .ilike('email', em)
    .ilike('account_reference_id', ref)
    .maybeSingle()
  if (aErr) {
    throwStatus(aErr.message, 500)
  }
  if (byAcct?.id) {
    return byAcct
  }

  const { data: enq, error: eErr } = await admin
    .from('enquiries')
    .select('reference_id, email, full_name, form_payload')
    .ilike('email', em)
    .ilike('reference_id', ref)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (eErr) {
    throwStatus(eErr.message, 500)
  }
  if (enq?.reference_id) {
    const name =
      (typeof enq.full_name === 'string' && enq.full_name.trim()) ||
      (typeof enq.form_payload?.fullName === 'string' && enq.form_payload.fullName.trim()) ||
      ''
    return ensureAuthProfileForEmail(admin, em, name, normalizePortalReference(enq.reference_id))
  }

  const { data: anchor, error: anErr } = await admin
    .from('email_account_anchors')
    .select('email, account_reference_id')
    .eq('email', em)
    .ilike('account_reference_id', ref)
    .maybeSingle()
  if (anErr) {
    throwStatus(anErr.message, 500)
  }
  if (anchor?.account_reference_id) {
    return ensureAuthProfileForEmail(admin, em, '', normalizePortalReference(anchor.account_reference_id))
  }

  return null
}

/**
 * TOW-style email + booking reference login (no OTP / no password).
 * Sets httpOnly portal cookie and returns a one-shot Supabase session redirect.
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ clientIp?: string }} [runtime]
 */
export const handlePortalLogin = async (body, env = process.env, runtime = {}) => {
  if (!portalSecret(env)) {
    throwStatus('Portal sign-in is not configured.', 503, 'PORTAL_NOT_CONFIGURED')
  }

  const ip = runtime.clientIp ?? 'unknown'
  assertApiRateLimit('portal-login', ip, env, {
    max: 8,
    windowMs: 15 * 60_000,
    message: 'Too many tries. Please wait a few minutes.'
  })

  const lockKey = `portal-login:${ip}`
  if (portalLoginLocked(lockKey)) {
    throwStatus('Too many failed attempts. Try again in about 15 minutes.', 429, 'PORTAL_LOCKED')
  }

  const email = typeof body?.email === 'string' ? body.email : ''
  const reference = typeof body?.reference === 'string' ? body.reference : ''
  const nextRaw = typeof body?.next === 'string' ? body.next.trim() : ''
  const nextPath =
    nextRaw.startsWith('/') && !nextRaw.startsWith('//') && !nextRaw.includes('\\')
      ? nextRaw
      : '/dashboard'

  const admin = getAdmin(env)
  const em = normalizeEmail(email)
  if (em && (await isAuthEmailBlocked(admin, em))) {
    notePortalLoginFail(lockKey)
    await new Promise((r) => setTimeout(r, 400))
    throwStatus(GENERIC_PORTAL_LOGIN_ERROR, 404, 'PORTAL_LOGIN_MISMATCH')
  }

  let profile = null
  try {
    profile = await findProfileByEmailAndReference(admin, email, reference)
  } catch (err) {
    if (err?.statusCode && err.statusCode >= 500) {
      throw err
    }
    profile = null
  }

  if (!profile?.id) {
    notePortalLoginFail(lockKey)
    await new Promise((r) => setTimeout(r, 400))
    throwStatus(GENERIC_PORTAL_LOGIN_ERROR, 404, 'PORTAL_LOGIN_MISMATCH')
  }

  if (profile.portal_revoked_at) {
    notePortalLoginFail(lockKey)
    await new Promise((r) => setTimeout(r, 400))
    throwStatus(GENERIC_PORTAL_LOGIN_ERROR, 404, 'PORTAL_LOGIN_MISMATCH')
  }

  clearPortalLoginAttempts(lockKey)
  const token = await ensurePortalToken(admin, profile)
  const cookieVal = makePortalCookie(profile, token, env)
  const profileEmail = normalizeEmail(profile.email) || em
  const redirectTo = await buildPortalSessionRedirect(admin, profileEmail, nextPath, env)
  const site = getGsolSiteUrl().replace(/\/+$/, '')

  return {
    ok: true,
    path: `/portal/${token}`,
    url: `${site}/portal/${encodeURIComponent(token)}`,
    redirectTo,
    reference:
      normalizePortalReference(profile.account_reference_id || '') ||
      normalizePortalReference(reference),
    setCookie: portalSetCookieHeader(env, false, cookieVal)
  }
}

/**
 * Open a private /portal/:token link — cookie + session redirect, no OTP.
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ clientIp?: string }} [runtime]
 */
export const handlePortalTokenOpen = async (body, env = process.env, runtime = {}) => {
  if (!portalSecret(env)) {
    throwStatus('Portal sign-in is not configured.', 503, 'PORTAL_NOT_CONFIGURED')
  }

  const ip = runtime.clientIp ?? 'unknown'
  assertApiRateLimit('portal-token-open', ip, env, {
    max: 20,
    windowMs: 15 * 60_000,
    message: 'Too many tries. Please wait a few minutes.'
  })

  const token = typeof body?.token === 'string' ? body.token.trim() : ''
  if (!token || token.length < 12) {
    throwStatus('This link is not valid.', 404, 'PORTAL_NOT_FOUND')
  }

  const nextRaw = typeof body?.next === 'string' ? body.next.trim() : ''
  const nextPath =
    nextRaw.startsWith('/') && !nextRaw.startsWith('//') && !nextRaw.includes('\\')
      ? nextRaw
      : '/dashboard'

  const admin = getAdmin(env)
  const { profile, token: liveToken } = await resolveProfile(admin, { token })
  const email = normalizeEmail(profile.email)
  if (!email) {
    throwStatus('We do not have an email on file for this account. Contact the trip desk.', 400)
  }
  if (await isAuthEmailBlocked(admin, email)) {
    throwStatus('This portal link cannot be opened right now. Contact the trip desk.', 403)
  }

  const cookieVal = makePortalCookie(profile, liveToken, env)
  const redirectTo = await buildPortalSessionRedirect(admin, email, nextPath, env)

  return {
    ok: true,
    path: nextPath,
    redirectTo,
    setCookie: portalSetCookieHeader(env, false, cookieVal)
  }
}

/**
 * Admin: revoke private link (blocks token open + email+ref until regenerated).
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} profileId
 */
export const revokePortalAccess = async (admin, profileId) => {
  const now = new Date().toISOString()
  const { error } = await admin
    .from('profiles')
    .update({ portal_revoked_at: now, updated_at: now })
    .eq('id', profileId)
  if (error) {
    throwStatus(error.message, 500)
  }
  return { ok: true, revokedAt: now }
}

/**
 * Admin: mint a new portal_token (and optionally a new account_reference_id).
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} profileId
 * @param {{ regenerateReference?: boolean }} [opts]
 * @param {Record<string, string | undefined>} [env]
 */
export const regeneratePortalAccess = async (admin, profileId, opts = {}, env = process.env) => {
  const now = new Date().toISOString()
  const token = b64url(randomBytes(18))
  /** @type {Record<string, unknown>} */
  const patch = {
    portal_token: token,
    portal_token_issued_at: now,
    portal_revoked_at: null,
    portal_auth: {},
    updated_at: now
  }
  if (opts.regenerateReference) {
    patch.account_reference_id = createEnquiryReferenceId()
  }
  const { data, error } = await admin
    .from('profiles')
    .update(patch)
    .eq('id', profileId)
    .select('id, account_reference_id, portal_token')
    .maybeSingle()
  if (error) {
    throwStatus(error.message, 500)
  }
  if (!data?.id) {
    throwStatus('Profile not found.', 404)
  }
  const site = getGsolSiteUrl().replace(/\/+$/, '')
  return {
    ok: true,
    profileId: data.id,
    accountReferenceId: data.account_reference_id,
    portalToken: data.portal_token,
    privatePath: `/portal/${data.portal_token}`,
    privateUrl: `${site}/portal/${encodeURIComponent(String(data.portal_token))}`,
    portalLoginUrl: `${site}/portal`
  }
}