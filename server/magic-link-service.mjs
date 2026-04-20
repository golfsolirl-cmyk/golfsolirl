import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { gsolEmailBrand } from './email-constants.mjs'
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

const buildMagicLinkFieldRowsHtml = (rows) =>
  rows
    .map(
      ([label, valueHtml], idx) => `
                            <tr style="background-color:${idx % 2 === 1 ? '#f9fbf7' : '#ffffff'};">
                              <td style="padding:12px 16px;font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;color:#6b7280;width:34%;vertical-align:top;border-bottom:1px solid #dfe7db;">${escapeHtml(label)}</td>
                              <td style="padding:12px 16px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;line-height:1.5;color:#374151;vertical-align:top;border-bottom:1px solid #dfe7db;">${valueHtml}</td>
                            </tr>`
    )
    .join('')

/**
 * Same white-card structure as enquiry transactional mail: summary table, CTA, security + help panels.
 * @param {string} actionLink
 * @param {string} email
 * @param {string} requestedAtDisplay
 */
const buildMagicLinkBodyHtml = (actionLink, email, requestedAtDisplay) => {
  const safeLink = escapeHtml(actionLink)
  const emailCell = `<span style="color:#163a13;font-weight:600;">${escapeHtml(email)}</span>`
  const rowsHtml = buildMagicLinkFieldRowsHtml([
    ['Signing in as', emailCell],
    ['Sign-in method', escapeHtml('Secure magic link (no password)')],
    ['Requested', escapeHtml(requestedAtDisplay)]
  ])

  const securityParagraphs = [
    'This link is unique to you, expires after a short time, and is intended for a single sign-in. Do not forward it.',
    'If you did not ask for this email, you can ignore it — your password is not stored or changed by this flow.'
  ]
  const securityHtml = securityParagraphs
    .map(
      (p, i) =>
        `<p style="margin:${i === securityParagraphs.length - 1 ? '0' : '0 0 10px 0'};font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.65;color:#374151;">${escapeHtml(p)}</p>`
    )
    .join('')

  const helpHtml = `<p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.65;color:#374151;">Questions? Email <a href="mailto:${escapeHtml(gsolEmailBrand.email)}" style="color:#dc5801;font-weight:600;text-decoration:none;">${escapeHtml(gsolEmailBrand.email)}</a> or call <a href="tel:${escapeHtml(gsolEmailBrand.phoneTel)}" style="color:#dc5801;font-weight:600;text-decoration:none;">${escapeHtml(gsolEmailBrand.phoneDisplay)}</a>.</p>`

  return `<tr>
                  <td style="padding:32px 36px 40px 36px;background-color:#ffffff;" class="p-m">
                    <p style="margin:0 0 14px 0;font-family:'DM Sans',Arial,sans-serif;font-size:15px;line-height:1.65;color:#374151;">Someone (hopefully you) just asked to open your Golf Sol Ireland account. Tap the button once on this device to finish signing in — the same polished experience as the rest of our site, without a password to remember.</p>
                    <p style="margin:0 0 18px 0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#dc5801;">Request summary</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;border:1px solid #dfe7db;border-radius:8px;overflow:hidden;">
                      <tbody>
                        ${rowsHtml}
                      </tbody>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0 0;border-collapse:collapse;">
                      <tr>
                        <td style="border-radius:999px;background-color:#dc5801;">
                          <a href="${safeLink}" style="display:inline-block;padding:16px 32px;font-family:'DM Sans',Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Sign in to Golf Sol Ireland</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:24px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;line-height:1.55;color:#6b7280;">If the button does not work, copy and paste this URL into your browser:</p>
                    <p style="margin:8px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;line-height:1.45;word-break:break-all;color:#163a13;">${safeLink}</p>
                    <div style="margin-top:28px;padding:20px 22px;border:1px solid #dc5801;border-radius:12px;background-color:#fffdfb;">
                      <p style="margin:0 0 12px 0;font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#dc5801;">Security</p>
                      ${securityHtml}
                    </div>
                    <div style="margin-top:24px;padding:20px 22px;border:1px solid #163a13;border-radius:12px;background-color:#f7f9f5;">
                      <p style="margin:0 0 12px 0;font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#163a13;">We are here to help</p>
                      ${helpHtml}
                    </div>
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

  const requestedAtDisplay = new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())

  const raw = buildGsolTransactionalEmail({
    documentTitle: 'Sign in — Golf Sol Ireland',
    preheader: `Passwordless sign-in for ${email}. Link expires shortly — use the button in this email.`,
    heroKicker: 'Account access',
    heroTitle: 'Complete your sign-in',
    heroLead:
      'Use the secure magic link below to open your dashboard, saved package builds, and documents from Golf Sol Ireland. Same trusted brand as our enquiry confirmations — built for clarity and peace of mind.',
    heroMetaHtml: `<p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong style="font-weight:700;">Email:</strong> ${escapeHtml(email)}</p>
                                      <p style="margin:8px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);"><strong style="font-weight:700;">Requested:</strong> ${escapeHtml(requestedAtDisplay)}</p>
                                      <p style="margin:8px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.68);">Source: Magic link sign-in</p>`,
    bodyHtml: buildMagicLinkBodyHtml(actionLink, email, requestedAtDisplay)
  })

  const html = finalizeGsolEmailHtml(raw)
  const attachments = await getTransactionalEmailImageAttachments()
  const resend = new Resend(resendKey)

  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: 'Sign in to Golf Sol Ireland — your secure link',
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
