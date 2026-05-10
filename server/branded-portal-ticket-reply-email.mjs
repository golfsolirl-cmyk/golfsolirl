import { ctaGreen, emailFonts, gs } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail } from './email-layout.mjs'

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

/**
 * @param {{ topicLabel: string; greetingName: string; dashboardHref: string; snippet: string }} opts
 */
export const buildBrandedPortalTicketReplyEmailHtml = ({ topicLabel, greetingName, dashboardHref, snippet }) => {
  const safeTopic = escapeHtml(topicLabel)
  const safeName = escapeHtml(greetingName || 'there')
  const safeHref = escapeHtml(dashboardHref)
  const safeSnippet = escapeHtml(snippet.slice(0, 280))

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:0 0 8px 0;">
          <p style="margin:0;font-family:${emailFonts.sans};font-size:16px;line-height:1.75;color:${gs.text};">Hi ${safeName},</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 14px 0;">
          <p style="margin:0;font-family:${emailFonts.sans};font-size:16px;line-height:1.75;color:${gs.muted};">
            We have replied in your client area under <strong style="color:${gs.text};font-weight:800;">${safeTopic}</strong>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 22px 0;border-radius:16px;background:${gs.rowA};border:1px solid rgba(11,107,69,0.2);">
          <p style="margin:0;padding:14px 16px;font-family:${emailFonts.sans};font-size:14px;line-height:1.65;color:${gs.text};font-style:italic;">
            “${safeSnippet}${snippet.length > 280 ? '…' : ''}”
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 28px 0;">
          <a href="${safeHref}" style="${ctaGreen}">Open your messages</a>
        </td>
      </tr>
      <tr>
        <td style="padding:0;border-radius:18px;background:${gs.rowA};border:1px solid rgba(13,61,46,0.12);">
          <p style="margin:0;padding:16px 18px;font-family:${emailFonts.sans};font-size:13px;line-height:1.65;color:${gs.muted};">
            After you sign in, look for the <strong style="color:${gs.green};font-weight:800;">live pulse</strong> next to your dashboard title — it means there is something new in <strong style="color:${gs.text};font-weight:800;">Tell us what you are interested in</strong>.
          </p>
        </td>
      </tr>
    </table>`

  const subject = `We replied — ${topicLabel}`

  const raw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: `Golf Sol Ireland replied in your ${topicLabel} thread.`,
    heroKicker: 'Client portal',
    heroTitle: 'You have a new reply',
    heroLead: `Your ${topicLabel} request has an update from the Golf Sol Ireland team.`,
    heroMetaHtml: `
      <p style="margin:0;font-family:${emailFonts.sans};font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong style="font-weight:700;">Thread:</strong> ${safeTopic}</p>
      <p style="margin:8px 0 0 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);"><strong style="font-weight:700;">Next step</strong> — open your dashboard to read the full message.</p>`,
    bodyHtml
  })

  return { subject, html: raw }
}
