import { buildGsolTransactionalEmail, getGsolSiteUrl } from './email-layout.mjs'

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
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.75;color:#374151;">Hi ${safeName},</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 14px 0;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.75;color:#374151;">
            We have replied in your client area under <strong style="color:#163a13;">${safeTopic}</strong>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 22px 0;border-radius:16px;background:#f0faf4;border:1px solid #c5e0d1;">
          <p style="margin:0;padding:14px 16px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;line-height:1.65;color:#1e3d2f;font-style:italic;">
            “${safeSnippet}${snippet.length > 280 ? '…' : ''}”
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 28px 0;">
          <a href="${safeHref}" style="display:inline-block;background:#0f513c;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px;font-family:'DM Sans',Arial,sans-serif;">Open your messages</a>
        </td>
      </tr>
      <tr>
        <td style="padding:0;border-radius:18px;background:#f7faf6;border:1px solid #dfe7db;">
          <p style="margin:0;padding:16px 18px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.65;color:#4b5e49;">
            After you sign in, look for the <strong style="color:#163a13;">live pulse</strong> next to your dashboard title — it means there is something new in <strong style="color:#163a13;">Tell us what you are interested in</strong>.
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
      <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong style="font-weight:700;">Thread:</strong> ${safeTopic}</p>
      <p style="margin:8px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);"><strong style="font-weight:700;">Next step</strong> — open your dashboard to read the full message.</p>`,
    bodyHtml
  })

  return { subject, html: raw }
}
