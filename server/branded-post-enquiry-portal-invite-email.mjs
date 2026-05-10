import { ctaGreen, emailFonts, escapeHtml, gs } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail } from './email-layout.mjs'

const lineBreaks = (value) => escapeHtml(value).replaceAll('\n', '<br>')

const fieldRowsPortal = (rows) =>
  rows
    .map(([label, value], index) => {
      const rowBg = index % 2 === 0 ? gs.rowA : gs.rowB
      const borderB = index < rows.length - 1 ? `1px solid rgba(6,59,42,0.08)` : 'none'
      return `
                            <tr>
                              <td style="background:${rowBg};border-bottom:${borderB};padding:22px 26px;">
                                <p style="margin:0;font-family:${emailFonts.sans};font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${gs.green};">${escapeHtml(label)}</p>
                                <p style="margin:10px 0 0 0;font-family:${emailFonts.sans};font-size:18px;line-height:1.45;color:${gs.text};font-weight:700;">${lineBreaks(value)}</p>
                              </td>
                            </tr>`
    })
    .join('')

/**
 * Follow-up after enquiry confirmation — same shell as `enquiry-customer` / transactional mail.
 * @param {{ fullName: string; email: string; enquiryId: string; enquiryDate: string; actionLink: string; sentAtDisplay: string }} p
 */
export function buildBrandedPostEnquiryPortalInviteHtml(p) {
  const title = `Your trip desk is ready — ${p.enquiryId}`
  const preview = `One tap opens your Golf Sol Ireland dashboard to follow ${p.enquiryId}.`
  const href = escapeHtml(p.actionLink)
  const rows = fieldRowsPortal([
    ['Enquiry reference', p.enquiryId],
    ['Guest name', p.fullName],
    ['Email on file', p.email],
    ['Originally submitted', p.enquiryDate],
    ['This note sent', p.sentAtDisplay]
  ])

  const bodyHtml = `
                        <p style="margin:0;font-family:${emailFonts.sans};font-size:11px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:${gs.green};">Your dashboard</p>
                        <h2 class="section-title" style="margin:14px 0 0 0;font-family:${emailFonts.sans};color:${gs.text};font-size:34px;line-height:1.12;letter-spacing:-0.03em;font-weight:800;">Welcome to your trip desk</h2>
                        <p style="margin:16px 0 28px 0;font-family:${emailFonts.sans};color:${gs.muted};font-size:16px;line-height:1.7;max-width:520px;font-weight:500;">Your enquiry confirmation had the paperwork. This email opens your private client area — the same GolfSol layout as our enquiry mail — where your reference lives and quotes can land.</p>
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(13,61,46,0.12);border-radius:24px;overflow:hidden;margin-bottom:28px;">
                          ${rows}
                        </table>
                        <a class="cta-button" href="${href}" style="${ctaGreen}">Open my trip dashboard</a>
                        <p style="margin:22px 0 0 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.65;color:${gs.muted};">If the button does not open on your device, paste this link into Safari or Chrome:</p>
                        <p style="margin:8px 0 0 0;font-family:${emailFonts.sans};font-size:12px;line-height:1.45;word-break:break-all;color:${gs.text};">${href}</p>
                        <div style="margin-top:26px;padding:20px 22px;border:1px solid rgba(11,107,69,0.25);border-radius:18px;background:${gs.rowA};">
                          <p style="margin:0 0 10px 0;font-family:${emailFonts.sans};font-size:11px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:${gs.green};">Security</p>
                          <p style="margin:0;font-family:${emailFonts.sans};font-size:14px;line-height:1.65;color:${gs.text};">The magic link is single-use and expires after a short time — same security model as our usual sign-in emails.</p>
                        </div>`

  return buildGsolTransactionalEmail({
    documentTitle: title,
    preheader: preview,
    heroKicker: 'Trip desk',
    heroTitle: 'Your clubhouse lounge just opened',
    heroLead:
      'Velvet-rope access to your online trip desk — built for your phone — where your enquiry reference lives and you can shape transfers, golf and hotel when it suits.',
    heroMetaHtml: `
      <p style="margin:0;font-family:${emailFonts.sans};font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong style="font-weight:700;">Reference:</strong> ${escapeHtml(p.enquiryId)}</p>
      <p style="margin:8px 0 0 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);"><strong style="font-weight:700;">Sent:</strong> ${escapeHtml(p.sentAtDisplay)}</p>`,
    bodyHtml
  })
}
