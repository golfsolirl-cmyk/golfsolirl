import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { finalizeGsolEmailHtml, getGsolSiteUrl } from './email-layout.mjs'
import { buildBrandedPostEnquiryPortalInviteHtml } from './branded-post-enquiry-portal-invite-email.mjs'
import { resolveResendToAddress } from './resend-delivery-email.mjs'
import { ensurePortalAccessForEmail } from './portal-otp-auth.mjs'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {number} delay in ms (default ~90–120s; override with POST_ENQUIRY_PORTAL_INVITE_DELAY_MS, clamped 30s–10m)
 */
const resolveDelayMs = (env) => {
  const raw = env.POST_ENQUIRY_PORTAL_INVITE_DELAY_MS?.trim()
  if (raw && /^\d+$/.test(raw)) {
    return Math.min(Math.max(Number(raw), 30_000), 600_000)
  }
  return 90_000 + Math.floor(Math.random() * 30_000)
}

/**
 * After enquiry confirmation: wait, then send a branded portal invite with reference + private link.
 * @param {{ enquiry: { fullName: string; email: string }; enquiryId: string; enquiryDate: string; env: NodeJS.ProcessEnv }} args
 */
export const runPostEnquiryPortalInviteJob = async ({ enquiry, enquiryId, enquiryDate, env }) => {
  if (env.POST_ENQUIRY_PORTAL_INVITE_DISABLE === '1' || env.POST_ENQUIRY_PORTAL_INVITE_DISABLE === 'true') {
    return
  }

  const delayMs = resolveDelayMs(env)
  await sleep(delayMs)

  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!resendKey || !fromEmail) {
    console.warn('[post-enquiry-portal-invite] skipped: missing RESEND_API_KEY / RESEND_FROM_EMAIL')
    return
  }
  if (!url || !serviceKey) {
    console.warn('[post-enquiry-portal-invite] skipped: missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
    return
  }

  const emailLower = (enquiry.email ?? '').trim().toLowerCase()
  if (!emailLower || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    return
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  let access
  try {
    access = await ensurePortalAccessForEmail(
      admin,
      {
        email: emailLower,
        fullName: enquiry.fullName,
        preferredReference: enquiryId
      },
      env
    )
  } catch (err) {
    console.error(
      '[post-enquiry-portal-invite] ensurePortalAccess failed:',
      err instanceof Error ? err.message : err
    )
    return
  }

  const site = getGsolSiteUrl().replace(/\/$/, '')
  const privateUrl = access.privateUrl || `${site}/portal/${encodeURIComponent(access.token)}`
  const portalLoginUrl = access.portalLoginUrl || `${site}/portal`

  const sentAtDisplay = new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())

  const htmlRaw = buildBrandedPostEnquiryPortalInviteHtml({
    fullName: enquiry.fullName,
    email: emailLower,
    enquiryId,
    enquiryDate,
    privateUrl,
    portalLoginUrl,
    sentAtDisplay
  })
  const html = finalizeGsolEmailHtml(htmlRaw)

  const resend = new Resend(resendKey)
  const deliveryEmail = resolveResendToAddress(emailLower, env)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: [deliveryEmail],
    subject: `Your Golf Sol trip desk is open — ${enquiryId}`,
    html
  })

  if (sendError) {
    console.error('[post-enquiry-portal-invite] Resend failed:', sendError.message ?? sendError)
  }
}
