import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml } from './email-layout.mjs'
import { getTransactionalEmailImageAttachments } from './enquiry-service.mjs'

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

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

const buildMagicLinkBodyHtml = (actionLink) => {
  const safe = escapeHtml(actionLink)
  return `<tr>
                  <td style="padding:32px 36px 40px 36px;background-color:#ffffff;" class="p-m">
                    <p style="margin:0 0 16px 0;font-family:'DM Sans',Arial,sans-serif;font-size:15px;line-height:1.65;color:#374151;">Use the button below to complete sign-in. The link expires after a short time for your security.</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0 0;border-collapse:collapse;">
                      <tr>
                        <td style="border-radius:999px;background-color:#dc5801;">
                          <a href="${safe}" style="display:inline-block;padding:16px 32px;font-family:'DM Sans',Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Sign in to Golf Sol Ireland</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:28px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;line-height:1.55;color:#6b7280;">If the button does not work, copy and paste this URL into your browser:</p>
                    <p style="margin:8px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;line-height:1.45;word-break:break-all;color:#163a13;">${safe}</p>
                  </td>
                </tr>`
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

  const raw = buildGsolTransactionalEmail({
    documentTitle: 'Sign in to Golf Sol Ireland',
    preheader: 'Your secure Golf Sol Ireland sign-in link.',
    heroKicker: 'Secure sign-in',
    heroTitle: 'Your magic link',
    heroLead:
      'Tap the button below once to open your account. If you did not request this email, you can safely ignore it.',
    heroMetaHtml: `<p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong>Email:</strong> ${escapeHtml(email)}</p>`,
    bodyHtml: buildMagicLinkBodyHtml(actionLink)
  })

  const html = finalizeGsolEmailHtml(raw)
  const attachments = await getTransactionalEmailImageAttachments()
  const resend = new Resend(resendKey)

  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: 'Your Golf Sol Ireland sign-in link',
    html,
    attachments
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
