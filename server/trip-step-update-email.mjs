/**
 * Branded trip-tracker stage update email (enquiry or customer).
 */
import { Resend } from 'resend'
import {
  buildLeanTransactionalEmailHtml,
  finalizeGsolEmailHtml,
  getGsolSiteUrl,
  leanAnswerTableHtml,
  leanEmailButtonHtml
} from './email-layout.mjs'
import { resolveResendToAddress } from './resend-delivery-email.mjs'
import { TRIP_TRACKER_STEPS } from '../shared/trip-tracker-steps.mjs'

const statusLabel = (s) =>
  s === 'done' ? 'Done' : s === 'doing' ? 'In progress' : s === 'skip' ? 'Skipped' : 'To do'

/**
 * @param {{
 *   firstName: string
 *   email: string
 *   reference: string
 *   stepId: string
 *   status: string
 *   tracker: Record<string, string>
 *   portalUrl?: string | null
 * }} input
 */
export function buildTripStepUpdateEmail(input) {
  const step = TRIP_TRACKER_STEPS.find((s) => s.id === input.stepId) || {
    id: input.stepId,
    label: input.stepId
  }
  const st = statusLabel(input.status)
  const done = TRIP_TRACKER_STEPS.filter((s) => (input.tracker?.[s.id] || 'todo') === 'done').length
  const total = TRIP_TRACKER_STEPS.length
  const pct = Math.round((done / total) * 100)
  const first = String(input.firstName || 'there').split(/\s+/)[0] || 'there'
  const site = getGsolSiteUrl().replace(/\/+$/, '')
  const portal = input.portalUrl || `${site}/portal`
  const rows = TRIP_TRACKER_STEPS.map((s) => [
    s.label,
    statusLabel(input.tracker?.[s.id] || (s.id === step.id ? input.status : 'todo'))
  ])

  const subject = `Golf Sol Ireland — ${step.label} (${st})`
  const html = finalizeGsolEmailHtml(
    buildLeanTransactionalEmailHtml({
      documentTitle: subject,
      preheader: `${step.label}: ${st} · ${done} of ${total} steps`,
      kicker: `Trip update · ${done}/${total} (${pct}%) · ${input.reference}`,
      title: `${step.label} — ${st.toLowerCase()}`,
      lead: `Hi ${first}, a quick update on your Costa del Sol trip. ${step.label} is now marked ${st.toLowerCase()}.`,
      rows: rows.slice(0, 5),
      bodyHtml: `${rows.length > 5 ? leanAnswerTableHtml(rows.slice(5)) : ''}
        <div style="margin-top:20px;">${leanEmailButtonHtml({ href: portal, label: 'Open your trip desk' })}</div>
        <p style="margin:24px 0 0;font-size:16px;line-height:24px;color:#3d4a44;">Talk soon,<br><b>Golf Sol Ireland</b></p>`,
      footerHtml: `Trip tracker update · ref ${input.reference}. All payments handled in Ireland.`
    })
  )

  const text = [
    `Hi ${first},`,
    '',
    `${step.label} is now marked ${st.toLowerCase()}.`,
    `Progress: ${done} of ${total} steps (${pct}%).`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    `Open your trip desk: ${portal}`,
    '',
    'Talk soon,',
    'Golf Sol Ireland',
    'All payments handled in Ireland.'
  ].join('\n')

  return { subject, html, text }
}

/**
 * @param {import('node:process').ProcessEnv} env
 * @param {Parameters<typeof buildTripStepUpdateEmail>[0]} input
 */
export async function sendTripStepUpdateEmail(env, input) {
  const to = String(input.email || '').trim().toLowerCase()
  if (!to) return { sent: false, reason: 'no-email' }
  const key = env.RESEND_API_KEY?.trim()
  const from = env.RESEND_FROM_EMAIL?.trim()
  if (!key || !from) return { sent: false, reason: 'resend-not-configured' }

  const built = buildTripStepUpdateEmail(input)
  const resend = new Resend(key)
  const delivery = resolveResendToAddress(to, env)
  const { error } = await resend.emails.send({
    from,
    to: delivery,
    subject: built.subject,
    html: built.html,
    text: built.text
  })
  if (error) {
    console.error('[trip-step-update-email]', error)
    return { sent: false, reason: error.message || 'send-failed', subject: built.subject }
  }
  return { sent: true, subject: built.subject, to: delivery }
}
