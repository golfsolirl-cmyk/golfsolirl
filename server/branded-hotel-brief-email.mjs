import { emailFonts, gs } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail } from './email-layout.mjs'

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const lineBreaks = (value) => escapeHtml(value).replaceAll('\n', '<br>')

/**
 * Partner-facing hold request — same transactional shell as enquiry / client portal mail.
 * @param {{ bookingReference: string; guestCount: number; nights: number; preferencesNote?: string }} params
 */
export function buildBrandedHotelReservationEmailHtml({ bookingReference, guestCount, nights, preferencesNote }) {
  const ref = escapeHtml(bookingReference)
  const noteBlock =
    preferencesNote && preferencesNote.trim()
      ? `<div style="margin-top:22px;padding:18px 20px;border-radius:18px;border:1px solid rgba(13,61,46,0.12);background:${gs.rowA};">
          <p style="margin:0 0 8px 0;font-family:${emailFonts.sans};font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${gs.green};">Optional brief (no guest names)</p>
          <p style="margin:0;font-family:${emailFonts.sans};font-size:14px;line-height:1.65;color:${gs.text};">${lineBreaks(preferencesNote.trim().slice(0, 2000))}</p>
        </div>`
      : ''

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:0 0 16px 0;">
          <p style="margin:0;font-family:${emailFonts.sans};font-size:16px;line-height:1.75;color:${gs.muted};">
            We coordinate Costa del Sol golf travel for Irish groups. Below is what you need to quote or hold space — <strong style="color:${gs.text};font-weight:800;">reference only</strong>, guest count, and length of stay. Guest contact details stay on our side until you confirm availability.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 20px 0;">
          <p style="margin:0;font-family:${emailFonts.sans};font-size:22px;font-weight:800;letter-spacing:-0.03em;color:${gs.text};">Booking reference</p>
          <p style="margin:8px 0 0 0;font-family:ui-monospace,Menlo,monospace;font-size:24px;font-weight:800;letter-spacing:0.04em;color:${gs.green};">${ref}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 22px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(13,61,46,0.12);border-radius:16px;overflow:hidden;">
            <tr style="background:${gs.rowA};">
              <td style="padding:14px 18px;width:38%;font-family:${emailFonts.sans};font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${gs.green};">Guests (pax)</td>
              <td style="padding:14px 18px;font-family:${emailFonts.sans};font-size:18px;font-weight:800;color:${gs.text};">${escapeHtml(String(guestCount))}</td>
            </tr>
            <tr style="background:#ffffff;">
              <td style="padding:14px 18px;font-family:${emailFonts.sans};font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${gs.green};">Nights</td>
              <td style="padding:14px 18px;font-family:${emailFonts.sans};font-size:18px;font-weight:800;color:${gs.text};">${escapeHtml(String(nights))}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0;">${noteBlock}</td>
      </tr>
      <tr>
        <td style="padding:20px 0 0 0;">
          <p style="margin:0;font-family:${emailFonts.sans};font-size:14px;line-height:1.65;color:${gs.muted};">
            Please reply with availability, approximate rate band, and any deposit rules. We align tee sheets and transfers against this same reference — <strong style="color:${gs.text};font-weight:800;">no guest email, phone, or name is included by design.</strong>
          </p>
          <p style="margin:16px 0 0 0;font-family:${emailFonts.sans};font-size:14px;line-height:1.65;color:${gs.muted};">
            With thanks,<br /><strong style="color:${gs.text};font-weight:800;">Golf Sol Ireland</strong> · Partner golf travel desk
          </p>
        </td>
      </tr>
    </table>`

  return buildGsolTransactionalEmail({
    documentTitle: `Partner reservation — ${bookingReference}`,
    preheader: `Golf Sol Ireland partner request: ref ${bookingReference}, ${guestCount} guests, ${nights} nights.`,
    heroKicker: 'Partner desk',
    heroTitle: 'Reservation courtesy',
    heroLead: `Quiet room for fairways — will you save us a block? Reference ${bookingReference}, ${guestCount} guests, ${nights} nights.`,
    heroMetaHtml: `
      <p style="margin:0;font-family:${emailFonts.sans};font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong style="font-weight:700;">Booking ref:</strong> ${ref}</p>
      <p style="margin:8px 0 0 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);"><strong style="font-weight:700;">From:</strong> Golf Sol Ireland (Irish golf travel desk)</p>`,
    bodyHtml
  })
}
