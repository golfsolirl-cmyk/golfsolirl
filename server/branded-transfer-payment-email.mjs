import { ctaGold, emailFonts, gs } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml, getGsolSiteUrl } from './email-layout.mjs'

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')

const fmtEur = (n) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(n) || 0)

const amountSummaryHtml = ({ amountPaidEur, grossEur, balanceEur, labelPaid = 'Amount paid today' }) => {
  const lines = []
  if (amountPaidEur != null && Number.isFinite(amountPaidEur)) {
    lines.push(
      `<tr><td style="padding:8px 0;font-family:${emailFonts.sans};font-size:14px;color:#6b7280;">${labelPaid}</td><td style="padding:8px 0;font-family:${emailFonts.sans};font-size:16px;font-weight:700;color:${gs.green};text-align:right;">${fmtEur(amountPaidEur)}</td></tr>`
    )
  }
  if (grossEur != null && Number.isFinite(grossEur) && grossEur > 0) {
    lines.push(
      `<tr><td style="padding:8px 0;font-family:${emailFonts.sans};font-size:14px;color:#6b7280;">Trip total quoted</td><td style="padding:8px 0;font-family:${emailFonts.sans};font-size:15px;font-weight:600;color:${gs.text};text-align:right;">${fmtEur(grossEur)}</td></tr>`
    )
  }
  if (balanceEur != null && Number.isFinite(balanceEur) && balanceEur > 0) {
    lines.push(
      `<tr><td style="padding:8px 0;font-family:${emailFonts.sans};font-size:14px;color:#6b7280;">Balance remaining</td><td style="padding:8px 0;font-family:${emailFonts.sans};font-size:16px;font-weight:700;color:${gs.text};text-align:right;">${fmtEur(balanceEur)}</td></tr>`
    )
  }
  if (lines.length === 0) {
    return ''
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px 0;border-collapse:collapse;background:${gs.rowA};border-radius:12px;">
    <tr><td style="padding:16px 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">${lines.join('')}</table>
    </td></tr>
  </table>`
}

const refLineHtml = (booking) => {
  const ref = String(booking.enquiry_reference_id ?? '').trim()
  if (!ref) {
    return ''
  }
  return `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.6;color:#6b7280;">Reference: <strong style="color:${gs.text};">${esc(ref)}</strong></p>`
}

/**
 * @param {Record<string, unknown>} booking
 * @param {number} depositPercent
 * @param {{ amountPaidEur?: number, grossEur?: number, balanceEur?: number }} [amounts]
 */
export const buildTransferDepositThankYouEmail = (booking, depositPercent, amounts = {}) => {
  const site = getGsolSiteUrl()
  const route = `${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)}`
  const paidTxt = amounts.amountPaidEur != null ? fmtEur(amounts.amountPaidEur) : `${depositPercent}% deposit`
  const subject = `Golf Sol Ireland — payment received (${paidTxt})`
  const heroTitle = 'Deposit received — thank you'
  const heroLead = `We have recorded your ${depositPercent}% deposit (${paidTxt}) for your Costa transfer. Your route: ${route}.`
  const bodyHtml = `${refLineHtml(booking)}
    ${amountSummaryHtml({ ...amounts, labelPaid: 'Deposit paid today' })}
    <p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">If anything changes on your side, just reply to this email or WhatsApp us — we are happy to adjust timings where we can.</p>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">You will receive a <strong>separate email</strong> with a link to pay the remaining balance from your dashboard.</p>`

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
 * @param {{ amountPaidEur?: number, grossEur?: number }} [amounts]
 */
export const buildTransferFullPaymentThankYouEmail = (booking, amounts = {}) => {
  const site = getGsolSiteUrl()
  const route = `${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)}`
  const paidTxt = amounts.amountPaidEur != null ? fmtEur(amounts.amountPaidEur) : 'your payment'
  const subject =
    amounts.amountPaidEur != null
      ? `Golf Sol Ireland — payment received (${paidTxt})`
      : 'Golf Sol Ireland — thank you, your transfer is fully paid'
  const heroTitle = 'Payment received in full'
  const heroLead = `Thank you — we have recorded payment of ${paidTxt} for your Costa transfer (${route}). That is one less thing for you to think about before you travel.`
  const bodyHtml = `${refLineHtml(booking)}
    ${amountSummaryHtml({ ...amounts, balanceEur: 0, labelPaid: 'Amount paid' })}
    <p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">We will confirm pick-up details closer to travel. If you need to tweak times or passenger numbers, message the team any time.</p>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Warm regards from the Golf Sol Ireland desk · <a href="${site}/dashboard" style="color:${gs.green};font-weight:600;">Your dashboard</a> · Trip pass barcode available after payment.</p>`

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
 * Sent immediately after a deposit — prompts guest to pay the remaining balance online.
 * @param {Record<string, unknown>} booking
 * @param {number} depositPercent
 * @param {{ depositPaidEur?: number, balanceEur?: number, grossEur?: number }} amounts
 */
export const buildTransferBalancePayNowEmail = (booking, depositPercent, amounts = {}) => {
  const site = getGsolSiteUrl()
  const route = `${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)}`
  const balanceTxt =
    amounts.balanceEur != null && Number.isFinite(amounts.balanceEur)
      ? fmtEur(amounts.balanceEur)
      : `the remaining ${Math.max(1, 100 - depositPercent)}%`
  const payHref = `${site}/dashboard`
  const subject = `Golf Sol Ireland — please pay your balance (${balanceTxt})`
  const heroTitle = 'Balance due — pay from your dashboard'
  const heroLead = `Your deposit for (${route}) is on file. Please pay the outstanding balance of ${balanceTxt} when you can so we can hold your driver and activate your full trip pass.`
  const bodyHtml = `${refLineHtml(booking)}
    ${amountSummaryHtml({
      amountPaidEur: amounts.depositPaidEur,
      grossEur: amounts.grossEur,
      balanceEur: amounts.balanceEur,
      labelPaid: 'Deposit already paid'
    })}
    <p style="margin:0 0 18px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Open <strong>Your trip → Transfers</strong> and tap <strong>Pay balance</strong>. We will also remind you again before pickup if the balance is still outstanding.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;border-collapse:collapse;">
      <tr>
        <td style="padding:0;">
          <a href="${payHref}" style="${ctaGold}">Pay balance in dashboard</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Questions? <a href="tel:+353874464766" style="color:${gs.green};font-weight:600;">+353 87 446 4766</a> · <a href="${site}/dashboard" style="color:${gs.green};font-weight:600;">Client dashboard</a></p>`

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: heroLead.slice(0, 118),
    heroKicker: 'Golf Sol Ireland',
    heroTitle,
    heroLead,
    heroMetaHtml: `<div style="font-size:12px;line-height:1.6;color:rgba(255,255,255,0.82);">Outstanding balance · secure card payment</div>`,
    bodyHtml
  })
  return { subject, html: finalizeGsolEmailHtml(htmlRaw) }
}

/**
 * Trip invoice paid in full (portal invoice checkout).
 * @param {{ enquiryReferenceId?: string, clientName?: string, amountPaidEur: number, route?: string }} detail
 */
export const buildPortalInvoicePaidThankYouEmail = (detail) => {
  const site = getGsolSiteUrl()
  const ref = detail.enquiryReferenceId?.trim()
  const amountTxt = fmtEur(detail.amountPaidEur)
  const subject = `Golf Sol Ireland — payment received (${amountTxt})`
  const heroTitle = 'Thank you — your trip payment is confirmed'
  const heroLead = ref
    ? `We have received ${amountTxt} for trip reference ${ref}. Your client dashboard and trip pass are updated.`
    : `We have received ${amountTxt} for your Golf Sol Ireland trip. Your client dashboard is updated.`
  const routeLine = detail.route?.trim()
    ? `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Route: <strong>${esc(detail.route)}</strong></p>`
    : ''
  const bodyHtml = `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Amount paid: <strong style="color:${gs.green};font-size:18px;">${amountTxt}</strong></p>
    ${routeLine}
    <p style="margin:0 0 18px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Open your dashboard for receipts, your trip pass barcode, and any balance steps if your booking is on a deposit plan.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;border-collapse:collapse;">
      <tr><td style="padding:0;"><a href="${site}/dashboard" style="${ctaGold}">Open your dashboard</a></td></tr>
    </table>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Questions? <a href="tel:+353874464766" style="color:${gs.green};font-weight:600;">+353 87 446 4766</a></p>`

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: heroLead.slice(0, 118),
    heroKicker: 'Golf Sol Ireland',
    heroTitle,
    heroLead,
    heroMetaHtml: `<div style="font-size:12px;line-height:1.6;color:rgba(255,255,255,0.82);">Payment confirmation · Costa del Sol</div>`,
    bodyHtml
  })
  return { subject, html: finalizeGsolEmailHtml(htmlRaw) }
}

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
  const subject = 'Golf Sol Ireland — action needed: transfer balance before pickup'
  const heroTitle = 'Balance due — please pay to keep your booking'
  const heroLead = `Your ${depositPercent}% deposit for (${route}) is on file. The remaining ${remainder}% is now due (48 hours before your scheduled pickup). Please pay the balance from your client dashboard without delay.`
  const bodyHtml = `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};"><strong style="color:${gs.green};">Important:</strong> if the balance is not received by the due time, we may treat the booking as cancelled and <strong>the deposit may be forfeited</strong> under our payment terms. If you need help, reply to this email or WhatsApp us straight away.</p>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Pay securely on your <a href="${site}/dashboard" style="color:${gs.green};font-weight:600;">client dashboard</a> (Pay balance) · <a href="tel:+353874464766" style="color:${gs.green};font-weight:600;">+353 87 446 4766</a></p>`

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
