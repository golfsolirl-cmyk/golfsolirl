import { ctaGold, emailFonts, gs } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml, getGsolSiteUrl } from './email-layout.mjs'

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')

/**
 * @param {Record<string, unknown>} booking
 * @param {number} depositPercent
 */
export const buildTransferDepositThankYouEmail = (booking, depositPercent) => {
  const site = getGsolSiteUrl()
  const route = `${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)}`
  const subject = `Golf Sol Ireland — thank you for your ${depositPercent}% deposit`
  const heroTitle = 'Deposit received — thank you'
  const heroLead = `We have recorded your ${depositPercent}% deposit for your Costa transfer. Your route: ${route}. We will hold your date and keep everything moving smoothly.`
  const bodyHtml = `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">If anything changes on your side, just reply to this email or WhatsApp us — we are happy to adjust timings where we can.</p>
    <p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">You will receive a short <strong>friendly reminder</strong> about the outstanding balance when it is due — no surprises, just a gentle nudge.</p>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Questions? Call <a href="tel:+353874464766" style="color:${gs.green};font-weight:600;">+353 87 446 4766</a> or open your <a href="${site}/dashboard" style="color:${gs.green};font-weight:600;">client dashboard</a>.</p>`

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: heroLead.slice(0, 120),
    heroKicker: 'Golf Sol Ireland',
    heroTitle,
    heroLead,
    heroMetaHtml: `<div style="font-size:12px;line-height:1.6;color:rgba(255,255,255,0.82);">Costa del Sol transfers · Irish-owned</div>`,
    bodyHtml
  })
  return { subject, html: finalizeGsolEmailHtml(htmlRaw) }
}

/**
 * @param {Record<string, unknown>} booking
 */
export const buildTransferFullPaymentThankYouEmail = (booking) => {
  const site = getGsolSiteUrl()
  const route = `${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)}`
  const subject = 'Golf Sol Ireland — thank you, your transfer is fully paid'
  const heroTitle = 'Payment received in full'
  const heroLead = `Thank you — we have recorded full payment for your Costa transfer (${route}). That is one less thing for you to think about before you travel.`
  const bodyHtml = `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">We will confirm pick-up details closer to travel. If you need to tweak times or passenger numbers, message the team any time.</p>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Warm regards from the Golf Sol Ireland desk · <a href="${site}/dashboard" style="color:${gs.green};font-weight:600;">Your dashboard</a></p>`

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: heroLead.slice(0, 120),
    heroKicker: 'Golf Sol Ireland',
    heroTitle,
    heroLead,
    heroMetaHtml: `<div style="font-size:12px;line-height:1.6;color:rgba(255,255,255,0.82);">Costa del Sol · premium golf transport</div>`,
    bodyHtml
  })
  return { subject, html: finalizeGsolEmailHtml(htmlRaw) }
}

/**
 * @param {Record<string, unknown>} booking
 * @param {number} depositPercent
 */
/**
 * Admin-triggered: ask guest to pay for a specific transfer (preview link until checkout is wired).
 * @param {Record<string, unknown>} booking
 */
export const buildTransferPaymentRequestEmail = (booking) => {
  const site = getGsolSiteUrl()
  const route = `${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)}`
  const idShort = String(booking.id ?? '').slice(0, 8)
  const rawPrice = booking.admin_price_eur
  const hasPrice = typeof rawPrice === 'number' && Number.isFinite(rawPrice) && rawPrice >= 0
  const priceTxt = hasPrice
    ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(rawPrice)
    : null
  /** Placeholder: opens client dashboard; replace with Stripe when ready. */
  const payHref = `${site}/dashboard?transfer_payment_preview=${encodeURIComponent(String(booking.id ?? ''))}`
  const subject = `Golf Sol Ireland — payment for your transfer (${idShort}…)`
  const heroTitle = 'Payment request · Costa transfer'
  const heroLead = hasPrice
    ? `Please arrange payment for your transfer (${route}). Quoted amount: ${priceTxt}. Use the button below to open your client area — we will connect live checkout here soon.`
    : `Please arrange payment for your transfer (${route}). We quoted this run separately — use the button below to open your client area; reply to this email if you need bank details or a breakdown.`
  const amountBlock = hasPrice
    ? `<p style="margin:0 0 18px 0;font-family:${emailFonts.sans};font-size:18px;line-height:1.5;color:${gs.text};"><strong style="color:${gs.green};">${priceTxt}</strong> <span style="color:#6b7280;font-size:14px;">(quoted EUR)</span></p>`
    : `<p style="margin:0 0 18px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">We will confirm the exact figure if needed — reply to this email or WhatsApp us.</p>`

  const bodyHtml = `${amountBlock}
    <p style="margin:0 0 18px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">This link opens your <strong>dashboard preview</strong> for this transfer. Online card checkout will appear here when activated — for now you can also pay by arrangement with our desk.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;border-collapse:collapse;">
      <tr>
        <td style="padding:0;">
          <a href="${payHref}" style="${ctaGold}">Open payment preview</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 12px 0;font-family:${emailFonts.sans};font-size:12px;line-height:1.6;color:#6b7280;">Preview URL (placeholder): <a href="${payHref}" style="color:#2d6a4a;word-break:break-all;">${esc(payHref)}</a></p>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Questions? <a href="tel:+353874464766" style="color:${gs.green};font-weight:600;">+353 87 446 4766</a> · <a href="${site}/dashboard" style="color:${gs.green};font-weight:600;">Client dashboard</a></p>`

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: heroLead.slice(0, 118),
    heroKicker: 'Golf Sol Ireland',
    heroTitle,
    heroLead,
    heroMetaHtml: `<div style="font-size:12px;line-height:1.6;color:rgba(255,255,255,0.82);">Transfers desk · Irish-owned · Costa del Sol</div>`,
    bodyHtml
  })
  return { subject, html: finalizeGsolEmailHtml(htmlRaw) }
}

export const buildTransferBalanceReminderEmail = (booking, depositPercent) => {
  const site = getGsolSiteUrl()
  const route = `${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)}`
  const remainder = Math.max(1, 100 - depositPercent)
  const subject = 'Golf Sol Ireland — gentle reminder: transfer balance'
  const heroTitle = 'Balance reminder'
  const heroLead = `This is a quick, friendly reminder about the remaining balance for your Costa transfer (${route}). Your ${depositPercent}% deposit is safely on file — when you are ready, you can settle the remaining ${remainder}% with the team.`
  const bodyHtml = `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">No rush if you are still finalising flights — reply to this email or WhatsApp us and we will send payment options that suit you.</p>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Thank you for travelling with Golf Sol Ireland · <a href="${site}/dashboard" style="color:${gs.green};font-weight:600;">Dashboard</a> · <a href="tel:+353874464766" style="color:${gs.green};font-weight:600;">+353 87 446 4766</a></p>`

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: heroLead.slice(0, 118),
    heroKicker: 'Golf Sol Ireland',
    heroTitle,
    heroLead,
    heroMetaHtml: `<div style="font-size:12px;line-height:1.6;color:rgba(255,255,255,0.82);">Outstanding balance · we are here to help</div>`,
    bodyHtml
  })
  return { subject, html: finalizeGsolEmailHtml(htmlRaw) }
}

/**
 * @param {Record<string, unknown>} booking
 * @param {{ refundAmountEur: number; refundKind: 'partial' | 'full'; cumulativeEur: number }} detail
 */
export const buildTransferRefundEmail = (booking, detail) => {
  const site = getGsolSiteUrl()
  const route = `${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)}`
  const amt = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(detail.refundAmountEur)
  const cum = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(detail.cumulativeEur)
  const subject =
    detail.refundKind === 'full'
      ? 'Golf Sol Ireland — refund processed for your transfer'
      : 'Golf Sol Ireland — partial refund processed for your transfer'
  const heroTitle = detail.refundKind === 'full' ? 'Refund completed' : 'Partial refund completed'
  const heroLead =
    detail.refundKind === 'full'
      ? `We have processed a full card refund for your Costa transfer (${route}). Amount refunded this step: ${amt}.`
      : `We have processed a partial card refund for your Costa transfer (${route}). Amount refunded this step: ${amt}.`

  const bodyHtml = `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Total refunded to your card for this transfer (including any earlier steps): <strong style="color:${gs.green};">${cum}</strong>.</p>
    <p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">A <strong>PDF confirmation</strong> is attached for your records. Timing on your bank statement can vary — typically a few business days.</p>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Questions? <a href="tel:+353874464766" style="color:${gs.green};font-weight:600;">+353 87 446 4766</a> · <a href="${site}/dashboard" style="color:${gs.green};font-weight:600;">Your dashboard</a></p>`

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: heroLead.slice(0, 118),
    heroKicker: 'Golf Sol Ireland',
    heroTitle,
    heroLead,
    heroMetaHtml: `<div style="font-size:12px;line-height:1.6;color:rgba(255,255,255,0.82);">Transfers desk · refunds</div>`,
    bodyHtml
  })
  return { subject, html: finalizeGsolEmailHtml(htmlRaw) }
}
