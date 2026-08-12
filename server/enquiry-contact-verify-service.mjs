/**
 * Email OTP to confirm contact details on website enquiry forms.
 * SMS OTP is not wired (needs Twilio / Supabase phone provider) — email code via Resend.
 */
import { createHash, randomBytes, randomInt } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml } from './email-layout.mjs'
import { validateMobilePhoneInput } from './phone-e164.mjs'
import { assertApiRateLimit, parsePositiveInt } from './api-rate-limit.mjs'
import { resolveResendToAddress } from './resend-delivery-email.mjs'

const throwStatus = (message, statusCode, code) => {
  const err = new Error(message)
  err.statusCode = statusCode
  if (code) {
    err.code = code
  }
  throw err
}

const hashCode = (code) => createHash('sha256').update(String(code)).digest('hex')

const getAdmin = (env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throwStatus('Supabase is not configured on the server.', 500)
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const normalizeEmail = (raw) => (typeof raw === 'string' ? raw.trim().toLowerCase() : '')

const contactVerifyDisabled = (env) => {
  const v = String(env.ENQUIRY_CONTACT_VERIFY_DISABLE ?? '').trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

/** Opt-in: set ENQUIRY_CONTACT_VERIFY_REQUIRE=true after applying the verifications migration. */
const contactVerifyRequired = (env) => {
  if (contactVerifyDisabled(env)) {
    return false
  }
  const v = String(env.ENQUIRY_CONTACT_VERIFY_REQUIRE ?? '').trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ clientIp?: string }} [runtime]
 */
export const handleEnquiryContactVerifySend = async (body, env = process.env, runtime = {}) => {
  if (contactVerifyDisabled(env)) {
    throwStatus('Contact verification is temporarily disabled.', 503, 'CONTACT_VERIFY_DISABLED')
  }

  assertApiRateLimit('enquiry-verify-send', runtime.clientIp ?? 'unknown', env, {
    max: parsePositiveInt(env.ENQUIRY_VERIFY_RATE_LIMIT_PER_WINDOW, 8),
    windowMs: parsePositiveInt(env.ENQUIRY_VERIFY_RATE_WINDOW_MS, 900_000),
    message: 'Too many verification codes requested. Please wait a few minutes and try again.'
  })

  const email = normalizeEmail(body?.email)
  const phoneRaw = typeof body?.phoneWhatsApp === 'string' ? body.phoneWhatsApp : ''
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throwStatus('Enter a valid email address first.', 400)
  }
  const phoneCheck = validateMobilePhoneInput(phoneRaw)
  if (!phoneCheck.ok) {
    throwStatus(phoneCheck.message, 400)
  }

  const resendApiKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendApiKey || !fromEmail) {
    throwStatus('Email sending is not configured (Resend).', 500)
  }

  const admin = getAdmin(env)
  const code = String(randomInt(100000, 999999))
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const { error: insErr } = await admin.from('enquiry_contact_verifications').insert({
    email,
    phone_e164: phoneCheck.phoneE164,
    code_hash: hashCode(code),
    expires_at: expiresAt
  })

  if (insErr) {
    const msg = String(insErr.message || '')
    if (msg.toLowerCase().includes('enquiry_contact_verifications') || msg.toLowerCase().includes('schema cache')) {
      throwStatus(
        'Contact verification table is missing. Apply migration 20260527120000_enquiry_contact_verifications.sql in Supabase.',
        503
      )
    }
    throwStatus(insErr.message, 500)
  }

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: 'Verification code · Golf Sol Ireland',
    preheader: `Your Golf Sol verification code is ${code}`,
    heroKicker: 'Contact check',
    heroTitle: 'Your verification code',
    heroLead: 'Enter this code on the website form to confirm your email and mobile. It expires in 15 minutes.',
    bodyHtml: `<p style="margin:0 0 12px 0;font-size:28px;font-weight:800;letter-spacing:0.28em;color:#063B2A;">${code}</p>
      <p style="margin:0;font-size:14px;color:#4a5c54;">Mobile on file: ${phoneCheck.phoneE164}</p>`
  })
  const html = finalizeGsolEmailHtml(htmlRaw)
  const to = resolveResendToAddress(email, env)
  const resend = new Resend(resendApiKey)
  const { error: sendErr } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: 'Your Golf Sol verification code',
    html
  })
  if (sendErr) {
    throwStatus(sendErr.message || 'Could not send verification email.', 502)
  }

  return {
    ok: true,
    message: 'We emailed a 6-digit code to confirm your contact details. Enter it below.',
    phoneE164: phoneCheck.phoneE164,
    expiresInMinutes: 15
  }
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ clientIp?: string }} [runtime]
 */
export const handleEnquiryContactVerifyCheck = async (body, env = process.env, runtime = {}) => {
  if (contactVerifyDisabled(env)) {
    throwStatus('Contact verification is temporarily disabled.', 503, 'CONTACT_VERIFY_DISABLED')
  }

  assertApiRateLimit('enquiry-verify-check', runtime.clientIp ?? 'unknown', env, {
    max: parsePositiveInt(env.ENQUIRY_VERIFY_CHECK_RATE_LIMIT_PER_WINDOW, 20),
    windowMs: parsePositiveInt(env.ENQUIRY_VERIFY_RATE_WINDOW_MS, 900_000),
    message: 'Too many code checks. Please wait a few minutes and try again.'
  })

  const email = normalizeEmail(body?.email)
  const phoneRaw = typeof body?.phoneWhatsApp === 'string' ? body.phoneWhatsApp : ''
  const code = typeof body?.code === 'string' ? body.code.trim() : ''
  if (!email || !/^\d{6}$/.test(code)) {
    throwStatus('Enter the 6-digit code from your email.', 400)
  }
  const phoneCheck = validateMobilePhoneInput(phoneRaw)
  if (!phoneCheck.ok) {
    throwStatus(phoneCheck.message, 400)
  }

  const admin = getAdmin(env)
  const { data: rows, error } = await admin
    .from('enquiry_contact_verifications')
    .select('id, code_hash, expires_at, verified_at')
    .eq('email', email)
    .eq('phone_e164', phoneCheck.phoneE164)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    throwStatus(error.message, 500)
  }

  const now = Date.now()
  const match = (rows ?? []).find((row) => {
    if (row.verified_at) {
      return false
    }
    if (new Date(row.expires_at).getTime() < now) {
      return false
    }
    return row.code_hash === hashCode(code)
  })

  if (!match) {
    throwStatus('That code is incorrect or has expired. Request a new code.', 400, 'INVALID_VERIFY_CODE')
  }

  const consumeToken = randomBytes(24).toString('hex')
  const consumeExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  const verifiedAt = new Date().toISOString()

  const { error: upErr } = await admin
    .from('enquiry_contact_verifications')
    .update({
      verified_at: verifiedAt,
      consume_token: consumeToken,
      consume_token_expires_at: consumeExpires
    })
    .eq('id', match.id)

  if (upErr) {
    throwStatus(upErr.message, 500)
  }

  return {
    ok: true,
    message: 'Contact confirmed. You can send your enquiry.',
    contactVerifyToken: consumeToken,
    phoneE164: phoneCheck.phoneE164
  }
}

/**
 * Consume a one-time verify token during enquiry submit.
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {{ email: string, phoneWhatsApp: string, contactVerifyToken?: string }} enquiry
 * @param {NodeJS.ProcessEnv} env
 */
export const assertEnquiryContactVerified = async (sb, enquiry, env = process.env) => {
  if (!contactVerifyRequired(env)) {
    return
  }

  const email = normalizeEmail(enquiry.email)
  const phoneCheck = validateMobilePhoneInput(enquiry.phoneWhatsApp)
  if (!phoneCheck.ok) {
    throwStatus(phoneCheck.message, 400)
  }

  const token = typeof enquiry.contactVerifyToken === 'string' ? enquiry.contactVerifyToken.trim() : ''
  if (!token) {
    const err = new Error('Please confirm your mobile with the email verification code before sending.')
    err.statusCode = 400
    err.code = 'CONTACT_VERIFY_REQUIRED'
    throw err
  }

  const { data: row, error } = await sb
    .from('enquiry_contact_verifications')
    .select('id, email, phone_e164, verified_at, consume_token_expires_at')
    .eq('consume_token', token)
    .maybeSingle()

  if (error) {
    const msg = String(error.message || '')
    if (msg.toLowerCase().includes('enquiry_contact_verifications') || msg.toLowerCase().includes('schema cache')) {
      throwStatus(
        'Contact verification table is missing. Apply migration 20260527120000_enquiry_contact_verifications.sql, or set ENQUIRY_CONTACT_VERIFY_DISABLE=true temporarily.',
        503
      )
    }
    throwStatus(error.message, 500)
  }

  if (!row?.verified_at || row.email !== email || row.phone_e164 !== phoneCheck.phoneE164) {
    throwStatus('Contact verification expired or does not match this form. Request a new code.', 400, 'CONTACT_VERIFY_REQUIRED')
  }
  if (new Date(row.consume_token_expires_at).getTime() < Date.now()) {
    throwStatus('Contact verification expired. Request a new code.', 400, 'CONTACT_VERIFY_REQUIRED')
  }

  // One-time consume
  await sb
    .from('enquiry_contact_verifications')
    .update({ consume_token: null, consume_token_expires_at: null })
    .eq('id', row.id)
}
