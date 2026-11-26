/**
 * Follow-up after enquiry — private portal link (no OTP / 6-digit code).
 * Lean TOW-style shell, Golf Sol branding.
 */
import {
  buildLeanTransactionalEmailHtml,
  escapeHtml,
  getGsolSiteUrl,
  leanEmailButtonHtml
} from './email-layout.mjs'

/**
 * @param {{
 *   fullName?: string
 *   email?: string
 *   enquiryId: string
 *   enquiryDate?: string
 *   privateUrl?: string
 *   portalUrl?: string
 *   portalLoginUrl?: string
 *   sentAtDisplay?: string
 * }} p
 */
export function buildBrandedPostEnquiryPortalInviteHtml(p) {
  const site = getGsolSiteUrl().replace(/\/+$/, '')
  const first = String(p.fullName || 'there').trim().split(/\s+/)[0] || 'there'
  const ref = String(p.enquiryId || '').trim()
  const privateUrl = String(p.privateUrl || p.portalUrl || '').trim() || `${site}/portal`
  const loginUrl = String(p.portalLoginUrl || `${site}/portal`).trim()
  const sent = String(p.sentAtDisplay || p.enquiryDate || '').trim()

  return buildLeanTransactionalEmailHtml({
    documentTitle: `Your trip desk is ready — ${ref}`,
    preheader: `Open your Golf Sol Ireland portal with reference ${ref}.`,
    kicker: `Trip desk · ${ref}`,
    title: `${first}, your trip desk is open`,
    lead: 'Open your private portal with the link below — or go to golfsolirl.com/portal and enter your email plus booking reference. No password or 6-digit code needed.',
    rows: [
      ['Your reference', ref],
      ['Guest name', String(p.fullName || '')],
      ['Email on file', String(p.email || '')],
      ['Originally submitted', String(p.enquiryDate || '')],
      ['This note sent', sent]
    ].filter(([, v]) => String(v).trim()),
    cta: { href: privateUrl, label: 'Open my private portal' },
    bodyHtml: `<p style="margin:0 0 12px;font-size:14px;line-height:22px;color:#66736d;word-break:break-all;">Private link: ${escapeHtml(privateUrl)}</p>
      ${leanEmailButtonHtml({ href: loginUrl, label: 'Or open portal login', bg: '#16231d' })}
      <p style="margin:20px 0 0;font-size:16px;line-height:24px;color:#3d4a44;">Talk soon,<br><b>Golf Sol Ireland</b></p>`,
    footerHtml: `You're getting this because you enquired with Golf Sol Ireland (ref ${escapeHtml(ref)}). All payments handled in Ireland.`
  })
}
