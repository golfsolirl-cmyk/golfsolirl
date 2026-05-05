import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildBrandedPortalMagicLinkEmailHtml } from './branded-client-portal-email.mjs'
import { finalizeGsolEmailHtml } from './email-layout.mjs'
import { getTransactionalEmailImageAttachments } from './enquiry-service.mjs'
import { isAuthEmailBlocked } from './email-address-registry.mjs'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const rateBucket = new Map()

const parsePositiveInt = (value, fallback) => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

const assertMagicLinkRateLimit = (clientIp, env) => {
  const max = parsePositiveInt(env.MAGIC_LINK_RATE_LIMIT_PER_WINDOW, 8)
  const windowMs = parsePositiveInt(env.MAGIC_LINK_RATE_WINDOW_MS, 900000)
  const now = Date.now()
  const key = clientIp || 'unknown'
  const bucket = rateBucket.get(key)

  if (!bucket || bucket.resetAt < now) {
    rateBucket.set(key, { n: 1, resetAt: now + windowMs })
    return
  }

  if (bucket.n >= max) {
    const error = new Error('Too many sign-in attempts. Please wait a few minutes and try again.')
    error.statusCode = 429
    throw error
  }

  bucket.n += 1
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
      if (u.origin === new URL(siteUrl).origin) {
        return true
      }
    }

    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
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

  assertMagicLinkRateLimit(meta.clientIp ?? 'unknown', env)

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
    options: { redirectTo }
  })

  if (genError) {
    const error = new Error(genError.message ?? 'Could not create sign-in link.')
    error.statusCode = 400
    throw error
  }

  const actionLink = data?.properties?.action_link
  if (!actionLink || typeof actionLink !== 'string') {
    const error = new Error('Could not create sign-in link.')
    error.statusCode = 500
    throw error
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
  const imageAttachments = await getTransactionalEmailImageAttachments()
  const resend = new Resend(resendKey)

  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: 'Sign in to Golf Sol Ireland — your secure link',
    html,
    attachments: imageAttachments
  })

  if (sendError) {
    const error = new Error(sendError.message ?? 'Could not send sign-in email.')
    error.statusCode = 502
    throw error
  }

  return {
    success: true,
    message: 'Check your inbox for the sign-in link from Golf Sol Ireland.'
  }
}
