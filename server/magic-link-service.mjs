import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildBrandedPortalMagicLinkEmailHtml } from './branded-client-portal-email.mjs'
import { finalizeGsolEmailHtml } from './email-layout.mjs'
import { isAuthEmailBlocked } from './email-address-registry.mjs'
import { resolveResendToAddress, resendSandboxRecipientHint } from './resend-delivery-email.mjs'
import {
  ensureSingleAdminProfile,
  isAllowedAdminLoginEmail
} from './admin-login-email.mjs'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

/** Strip whitespace and optional wrapping quotes from `.env` / Vercel values. */
const normalizeOperatorPasscode = (value) => {
  let s = String(value ?? '').trim()
  if (
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith('"') && s.endsWith('"'))
  ) {
    s = s.slice(1, -1)
  }
  return s
}

/** When `ADMIN_OPERATOR_PASSCODE` is set, `/dashboard/admin/login` requests must include matching `operatorCode` (same string, UTF-8, length-sensitive compare). */
const operatorPasscodeMatches = (provided, expected) => {
  const p = Buffer.from(normalizeOperatorPasscode(provided), 'utf8')
  const e = Buffer.from(normalizeOperatorPasscode(expected), 'utf8')
  if (p.length !== e.length || p.length === 0) {
    return false
  }
  try {
    return timingSafeEqual(p, e)
  } catch {
    return false
  }
}

import { assertApiRateLimit, parsePositiveInt } from './api-rate-limit.mjs'

const assertMagicLinkRateLimit = (clientIp, email, env) => {
  const max = parsePositiveInt(env.MAGIC_LINK_RATE_LIMIT_PER_WINDOW, 8)
  const windowMs = parsePositiveInt(env.MAGIC_LINK_RATE_WINDOW_MS, 900_000)

  assertApiRateLimit('magic-link-ip', clientIp || 'unknown', env, {
    max,
    windowMs,
    message: 'Too many sign-in attempts. Please wait a few minutes and try again.'
  })

  assertApiRateLimit('magic-link-email', email, env, {
    max: Math.min(max, 4),
    windowMs,
    message: 'Too many sign-in attempts for this email. Please wait a few minutes and try again.'
  })
}

/**
 * Admin magic links: keep localhost/127.0.0.1 when requested (local testing).
 * Otherwise land on production (SITE_URL). Preserves `?next=` (defaults to /dashboard/admin).
 *
 * @param {string} redirectTo
 * @param {'client' | 'admin' | 'driver'} portal
 * @param {NodeJS.ProcessEnv} env
 */
const resolveMagicLinkRedirectTo = (redirectTo, portal, env) => {
  if (portal !== 'admin') {
    return redirectTo
  }

  try {
    const requested = new URL(redirectTo)
    const isLocalHost =
      requested.hostname === 'localhost' ||
      requested.hostname === '127.0.0.1' ||
      requested.hostname === '[::1]'
    if (isLocalHost) {
      if (!requested.searchParams.has('next')) {
        requested.searchParams.set('next', '/dashboard/admin')
      }
      return requested.toString()
    }
  } catch {
    /* fall through to SITE_URL */
  }

  const siteRaw = env.SITE_URL?.trim() || 'https://golfsolirl.com'
  const siteUrl = siteRaw.startsWith('http') ? siteRaw : `https://${siteRaw}`
  let siteOrigin
  try {
    siteOrigin = new URL(siteUrl).origin
  } catch {
    siteOrigin = 'https://golfsolirl.com'
  }

  try {
    const requested = new URL(redirectTo)
    const out = new URL(`${siteOrigin}/auth/callback`)
    for (const [key, value] of requested.searchParams.entries()) {
      out.searchParams.set(key, value)
    }
    if (!out.searchParams.has('next')) {
      out.searchParams.set('next', '/dashboard/admin')
    }
    return out.toString()
  } catch {
    return `${siteOrigin}/auth/callback?next=${encodeURIComponent('/dashboard/admin')}`
  }
}

/**
 * @param {string} redirectTo
 * @param {NodeJS.ProcessEnv} env
 */
const isAllowedRedirectTo = (redirectTo, env) => {
  try {
    const u = new URL(redirectTo)
    const path = u.pathname.replace(/\/+$/, '') || '/'
    if (!path.endsWith('/auth/callback')) {
      return false
    }

    const site = env.SITE_URL?.trim()
    if (site) {
      const siteUrl = site.startsWith('http') ? site : `https://${site}`
      const siteOrigin = new URL(siteUrl)
      if (u.origin === siteOrigin.origin) {
        return true
      }
      const host = siteOrigin.hostname
      const port = siteOrigin.port ? `:${siteOrigin.port}` : ''
      const altHost = host.startsWith('www.') ? host.slice(4) : `www.${host}`
      if (u.origin === `${siteOrigin.protocol}//${altHost}${port}`) {
        return true
      }
    }

    if (
      u.hostname === 'localhost' ||
      u.hostname === '127.0.0.1' ||
      u.hostname === '[::1]'
    ) {
      return true
    }

    const vercel = env.VERCEL_URL?.trim()
    if (vercel) {
      const vo = vercel.startsWith('http') ? new URL(vercel).origin : `https://${vercel}`
      if (u.origin === vo) {
        return true
      }
    }

    const extra = env.MAGIC_LINK_REDIRECT_ORIGINS?.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    for (const entry of extra) {
      try {
        const o = entry.startsWith('http') ? entry : `https://${entry}`
        if (u.origin === new URL(o).origin) {
          return true
        }
      } catch {
        /* skip */
      }
    }

    return false
  } catch {
    return false
  }
}

/**
 * @param {Record<string, unknown>} payload
 * @param {NodeJS.ProcessEnv} env
 * @param {{ clientIp?: string }} [meta]
 */
export const handleMagicLinkRequest = async (payload, env = process.env, meta = {}) => {
  const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : ''
  const redirectTo = typeof payload?.redirectTo === 'string' ? payload.redirectTo.trim() : ''
  const portalRaw = typeof payload?.portal === 'string' ? payload.portal.trim().toLowerCase() : ''
  const portal = portalRaw === 'admin' || portalRaw === 'driver' ? portalRaw : 'client'
  const operatorCode = typeof payload?.operatorCode === 'string' ? payload.operatorCode.trim() : ''

  if (!email || !isValidEmail(email)) {
    const error = new Error('Please enter a valid email address.')
    error.statusCode = 400
    throw error
  }

  if (!redirectTo || !isAllowedRedirectTo(redirectTo, env)) {
    const error = new Error(
      'Invalid sign-in redirect. Add this origin to MAGIC_LINK_REDIRECT_ORIGINS or set SITE_URL to match your site.'
    )
    error.statusCode = 400
    throw error
  }

  // After allowlist check: admin keeps localhost when requested; otherwise SITE_URL.
  const effectiveRedirectTo = resolveMagicLinkRedirectTo(redirectTo, portal, env)

  if (portal === 'admin' && !isAllowedAdminLoginEmail(email, env)) {
    const error = new Error('This email is not authorized for admin sign-in.')
    error.statusCode = 403
    throw error
  }

  const adminPass = normalizeOperatorPasscode(env.ADMIN_OPERATOR_PASSCODE)
  if (portal === 'admin' && adminPass) {
    if (!operatorPasscodeMatches(operatorCode, adminPass)) {
      const error = new Error(
        'Invalid operator code. On golfsolirl.com this must match ADMIN_OPERATOR_PASSCODE in Vercel (Production), not only your local .env.'
      )
      error.statusCode = 403
      throw error
    }
  }

  const supabaseUrl = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()

  if (!supabaseUrl || !serviceKey || !resendKey || !fromEmail) {
    const error = new Error(
      'Magic link email is not configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, and RESEND_FROM_EMAIL on the server.'
    )
    error.statusCode = 500
    throw error
  }

  assertMagicLinkRateLimit(meta.clientIp ?? 'unknown', email, env)

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  if (await isAuthEmailBlocked(admin, email)) {
    const error = new Error(
      'This email address cannot receive sign-in links. Contact Golf Sol Ireland if you think this is a mistake.'
    )
    error.statusCode = 403
    throw error
  }

  const { data, error: genError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: effectiveRedirectTo }
  })

  if (genError) {
    const error = new Error(genError.message ?? 'Could not create sign-in link.')
    error.statusCode = 400
    throw error
  }

  /**
   * Prefer a direct app callback with `token_hash`.
   * Client/driver keep the requested origin; admin keeps localhost when requested,
   * otherwise SITE_URL via effectiveRedirectTo.
   * Falls back to rewriting `redirect_to` on the Supabase verify URL.
   */
  const buildMagicLinkHref = (properties, requestedRedirect) => {
    const hashed =
      typeof properties?.hashed_token === 'string' ? properties.hashed_token.trim() : ''
    const rawAction =
      typeof properties?.action_link === 'string' ? properties.action_link.trim() : ''

    if (hashed) {
      try {
        const requested = new URL(requestedRedirect)
        const out = new URL(`${requested.origin}/auth/callback`)
        out.searchParams.set('token_hash', hashed)
        // `email` matches generateLink + verifyOtp in our local test scripts
        out.searchParams.set('type', 'email')
        for (const [key, value] of requested.searchParams.entries()) {
          if (!out.searchParams.has(key)) {
            out.searchParams.set(key, value)
          }
        }
        return out.toString()
      } catch {
        /* fall through */
      }
    }

    if (rawAction) {
      try {
        const u = new URL(rawAction)
        u.searchParams.set('redirect_to', requestedRedirect)
        return u.toString()
      } catch {
        return rawAction
      }
    }

    return ''
  }

  const actionLink = buildMagicLinkHref(data?.properties, effectiveRedirectTo)
  if (!actionLink) {
    const error = new Error('Could not create sign-in link.')
    error.statusCode = 500
    throw error
  }

  if (portal === 'admin') {
    const authUserId = data?.user?.id ?? data?.properties?.user_id
    await ensureSingleAdminProfile(admin, email, typeof authUserId === 'string' ? authUserId : undefined)
  }

  const requestedAtDisplay = new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())

  const rawHtml = buildBrandedPortalMagicLinkEmailHtml({ actionLink, email, requestedAtDisplay })
  const html = finalizeGsolEmailHtml(rawHtml)
  const resend = new Resend(resendKey)

  const subject =
    portal === 'admin'
      ? 'Operator sign-in — Golf Sol Ireland — your secure link'
      : 'Sign in to Golf Sol Ireland — your secure link'

  const deliveryEmail = resolveResendToAddress(email, env)

  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: [deliveryEmail],
    subject,
    html
  })

  if (sendError) {
    const raw = sendError.message ?? 'Could not send sign-in email.'
    const message =
      raw.includes('only send testing emails to your own email address') ||
      raw.includes('verify a domain at resend.com/domains')
        ? resendSandboxRecipientHint(env)
        : raw
    const error = new Error(message)
    error.statusCode = 502
    throw error
  }

  return {
    success: true,
    message: 'Check your inbox for the sign-in link from Golf Sol Ireland.'
  }
}
