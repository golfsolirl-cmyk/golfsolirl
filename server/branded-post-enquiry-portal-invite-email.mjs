import { ctaGreen, emailFonts, escapeHtml, gs } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail } from './email-layout.mjs'

const lineBreaks = (value) => escapeHtml(value).replaceAll('\n', '<br>')

const fieldRowsPortal = (rows) =>
  rows
    .map(([label, value], index) => {
      const rowBg = index % 2 === 0 ? gs.rowA : gs.rowB
      const borderB = index < rows.length - 1 ? '1px solid rgba(6,59,42,0.08)' : 'none'
      return [
        '<tr>',
        `<td style="background:${rowBg};border-bottom:${borderB};padding:22px 26px;">`,
        `<p style="margin:0;font-family:${emailFonts.sans};font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${gs.green};">${escapeHtml(label)}</p>`,
        `<p style="margin:10px 0 0 0;font-family:${emailFonts.sans};font-size:18px;line-height:1.45;color:${gs.text};font-weight:700;">${lineBreaks(value)}</p>`,
        '</td>',
        '</tr>'
      ].join('')
    })
    .join('')

/**
 * Follow-up after enquiry confirmation — private link + email/reference login (no OTP).
 * @param {{ fullName: string; email: string; enquiryId: string; enquiryDate: string; privateUrl: string; portalLoginUrl: string; sentAtDisplay: string }} p
 */
export function buildBrandedPostEnquiryPortalInviteHtml(p) {
  const title = `Your trip desk is ready — ${p.enquiryId}`
  const preview = `Open your Golf Sol Ireland portal with reference ${p.enquiryId}.`
  const privateHref = escapeHtml(p.privateUrl)
  const loginHref = escapeHtml(p.portalLoginUrl)
  const refSafe = escapeHtml(p.enquiryId)
  const rows = fieldRowsPortal([
    ['Your reference', p.enquiryId],
    ['Guest name', p.fullName],
    ['Email on file', p.email],
    ['Originally submitted', p.enquiryDate],
    ['This note sent', p.sentAtDisplay]
  ])

  const bodyHtml = [
    `<p style="margin:0;font-family:${emailFonts.sans};font-size:11px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:${gs.green};">Your dashboard</p>`,
    `<h2 class="section-title" style="margin:14px 0 0 0;font-family:${emailFonts.sans};color:${gs.text};font-size:34px;line-height:1.12;letter-spacing:-0.03em;font-weight:800;">Welcome to your trip desk</h2>`,
    `<p style="margin:16px 0 28px 0;font-family:${emailFonts.sans};color:${gs.muted};font-size:16px;line-height:1.7;max-width:520px;font-weight:500;">Your confirmation had the paperwork. Open your private portal with the link below — or go to golfsolirl.com/portal and enter your email plus reference <strong style="color:${gs.text};">${refSafe}</strong>. No password or code needed.</p>`,
    `<table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(13,61,46,0.12);border-radius:24px;overflow:hidden;margin-bottom:28px;">${rows}</table>`,
    `<a class="cta-button" href="${privateHref}" style="${ctaGreen}">Open my private portal</a>`,
    `<p style="margin:22px 0 0 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.65;color:${gs.muted};">Private link:</p>`,
    `<p style="margin:8px 0 0 0;font-family:${emailFonts.sans};font-size:12px;line-height:1.45;word-break:break-all;color:${gs.text};">${privateHref}</p>`,
    `<p style="margin:18px 0 0 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.65;color:${gs.muted};">Or sign in any time at <a href="${loginHref}" style="color:${gs.green}; font-weight:700;">${loginHref}</a> with your email and reference.</p>`
  ].join('')

  return buildGsolTransactionalEmail({
    documentTitle: title,
    preheader: preview,
    heroKicker: 'Trip desk',
    heroTitle: 'Your portal is ready',
    heroLead:
      'Open your private client area with the link below, or with your email and reference — no password needed.',
    heroMetaHtml: [
      `<p style="margin:0;font-family:${emailFonts.sans};font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong style="font-weight:700;">Reference:</strong> ${refSafe}</p>`,
      `<p style="margin:8px 0 0 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);"><strong style="font-weight:700;">Sent:</strong> ${escapeHtml(p.sentAtDisplay)}</p>`
    ].join(''),
    bodyHtml
  })
}
