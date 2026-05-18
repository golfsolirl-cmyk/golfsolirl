/**
 * Auto-response emails for Golf Sol Ireland:
 * 1. Form submission confirmation (enquiry / contact / quote)
 * 2. Sign-in / magic link notification
 *
 * Uses the unified branded shell via `buildGsolTransactionalEmail`.
 */
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml } from './email-layout.mjs'
import { emailFonts, escapeHtml, gs, ctaGold, assetUrl, assets, phoneIrelandDisplay, phoneIrelandHref } from './branded-email-shell.mjs'

/**
 * Form auto-response — sent immediately when a visitor submits any form.
 * @param {{ fullName: string, email: string, enquiryId?: string, interest?: string }} data
 */
export function buildFormAutoresponseEmailHtml(data) {
  const firstName = escapeHtml((data.fullName || '').split(' ')[0] || 'there')
  const refHtml = data.enquiryId
    ? `<p style="margin:20px 0 0 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.6;color:${gs.muted};">Your reference: <strong style="color:${gs.text};font-weight:800;letter-spacing:0.02em;">${escapeHtml(data.enquiryId)}</strong></p>`
    : ''

  const interestHtml = data.interest
    ? `<tr>
        <td style="padding:22px 0 0 0;">
          <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.rowA};border-radius:16px;border:1px solid ${gs.border};">
            <tr>
              <td style="padding:20px 24px;font-family:${emailFonts.sans};font-size:13px;line-height:1.65;color:${gs.muted};">
                <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${gs.green};">Your message</p>
                <p style="margin:10px 0 0 0;color:${gs.text};font-weight:600;">${escapeHtml(data.interest)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : ''

  const bodyHtml = `
    <p style="margin:0;font-family:${emailFonts.sans};font-size:16px;line-height:1.75;color:${gs.text};font-weight:600;">
      Hi ${firstName},
    </p>
    <p style="margin:18px 0 0 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">
      Thanks for getting in touch with Golf Sol Ireland. We've received your enquiry and one of our team will be back to you shortly — usually within a couple of hours during business hours.
    </p>
    ${refHtml}
    <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0">
      ${interestHtml}
      <tr>
        <td style="padding:28px 0 0 0;">
          <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.dark};border-radius:20px;overflow:hidden;border:1px solid rgba(217,194,122,0.18);">
            <tr>
              <td style="padding:28px 30px;font-family:${emailFonts.sans};color:${gs.white};">
                <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:${gs.gold};">In the meantime</p>
                <p style="margin:12px 0 0 0;font-size:15px;line-height:1.65;font-weight:600;">
                  If you'd like to talk sooner, call or WhatsApp us directly:
                </p>
                <p style="margin:14px 0 0 0;">
                  <a href="${phoneIrelandHref}" style="color:${gs.white};font-size:18px;font-weight:800;text-decoration:none;letter-spacing:0.02em;">${phoneIrelandDisplay}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 0 0 0;">
          <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:0;font-family:${emailFonts.sans};font-size:13px;line-height:1.65;color:${gs.muted};">
                <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${gs.green};">What happens next</p>
                <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 0 0;">
                  <tr>
                    <td style="padding:8px 0;font-family:${emailFonts.sans};font-size:14px;line-height:1.6;color:${gs.text};border-bottom:1px solid ${gs.border};">
                      <strong style="color:${gs.green};font-weight:800;">1.</strong>&nbsp; We review your trip details and preferences.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-family:${emailFonts.sans};font-size:14px;line-height:1.6;color:${gs.text};border-bottom:1px solid ${gs.border};">
                      <strong style="color:${gs.green};font-weight:800;">2.</strong>&nbsp; You'll receive a personalised quote — courses, hotels, transfers.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-family:${emailFonts.sans};font-size:14px;line-height:1.6;color:${gs.text};">
                      <strong style="color:${gs.green};font-weight:800;">3.</strong>&nbsp; Once confirmed, your client portal opens with full trip details.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:28px 0 0 0;font-family:${emailFonts.sans};font-size:14px;line-height:1.65;color:${gs.muted};">
      Looking forward to helping you plan the perfect Costa del Sol golf trip.
    </p>
    <p style="margin:18px 0 0 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.5;color:${gs.text};font-weight:700;">
      The Golf Sol Ireland Team
    </p>`

  return buildGsolTransactionalEmail({
    documentTitle: data.enquiryId
      ? `Golf Sol Ireland — We've received your enquiry (${data.enquiryId})`
      : 'Golf Sol Ireland — We\'ve received your enquiry',
    preheader: `Thanks ${firstName} — we'll be in touch shortly with your personalised quote.`,
    heroKicker: 'Golf Sol Ireland',
    heroTitle: 'We\'ve got your enquiry',
    heroLead: 'Your Costa del Sol golf trip is one step closer. Here\'s what to expect.',
    heroMetaHtml: data.enquiryId
      ? `<p style="margin:0;font-family:${emailFonts.sans};font-size:13px;color:rgba(255,255,255,0.9);">Reference: <strong>${escapeHtml(data.enquiryId)}</strong></p>`
      : '',
    bodyHtml
  })
}

/**
 * Sign-in / magic link email — sent when a user logs in or accesses their portal.
 * @param {{ fullName: string, email: string, magicLink: string, enquiryId?: string }} data
 */
export function buildSignInEmailHtml(data) {
  const firstName = escapeHtml((data.fullName || '').split(' ')[0] || 'there')
  const refHtml = data.enquiryId
    ? `<p style="margin:16px 0 0 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.6;color:${gs.muted};">Trip reference: <strong style="color:${gs.text};font-weight:800;">${escapeHtml(data.enquiryId)}</strong></p>`
    : ''

  const bodyHtml = `
    <p style="margin:0;font-family:${emailFonts.sans};font-size:16px;line-height:1.75;color:${gs.text};font-weight:600;">
      Hi ${firstName},
    </p>
    <p style="margin:18px 0 0 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">
      Use the button below to sign in to your Golf Sol Ireland trip desk. This link is valid for 60 minutes and can only be used once.
    </p>
    ${refHtml}
    <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:32px 0;">
          <a href="${escapeHtml(data.magicLink)}" style="${ctaGold}" target="_blank">Sign in to your trip desk</a>
        </td>
      </tr>
    </table>
    <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.rowA};border-radius:16px;border:1px solid ${gs.border};">
      <tr>
        <td style="padding:22px 26px;font-family:${emailFonts.sans};font-size:13px;line-height:1.65;color:${gs.muted};">
          <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${gs.green};">Your trip desk</p>
          <p style="margin:10px 0 0 0;color:${gs.text};font-weight:500;">
            View your personalised itinerary, transfer details, golf course selections, and accommodation — all in one place.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.65;color:${gs.muted};">
      If you didn't request this sign-in link, you can safely ignore this email. If you need help, reply to this email or call us at <a href="${phoneIrelandHref}" style="color:${gs.green};font-weight:700;text-decoration:none;">${phoneIrelandDisplay}</a>.
    </p>
    <p style="margin:20px 0 0 0;font-family:${emailFonts.sans};font-size:14px;line-height:1.5;color:${gs.text};font-weight:700;">
      The Golf Sol Ireland Team
    </p>`

  return buildGsolTransactionalEmail({
    documentTitle: 'Golf Sol Ireland — Sign in to your trip desk',
    preheader: `Hi ${firstName} — here's your secure sign-in link for Golf Sol Ireland.`,
    heroKicker: 'Golf Sol Ireland',
    heroTitle: 'Sign in to your trip desk',
    heroLead: 'Tap the button below to access your personalised trip dashboard.',
    heroMetaHtml: '',
    bodyHtml
  })
}
