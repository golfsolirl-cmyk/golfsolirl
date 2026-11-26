import { ctaGold, ctaGreen, emailFonts, gs, phoneIrelandDisplay, phoneIrelandHref } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml, getGsolSiteUrl } from './email-layout.mjs'
import { depositAmountEur, isTransferFullUpfront, normalizedDepositPercent } from './transfer-payment-amounts.mjs'

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

const tripRowsHtml = (rows) => {
  const list = Array.isArray(rows) ? rows.filter((row) => row?.label && String(row.value ?? '').trim()) : []
  if (!list.length) return ''
  const lines = list
    .map(
      (row) =>
        `<tr><td style="padding:6px 0;font-family:${emailFonts.sans};font-size:14px;color:#6b7280;">${esc(row.label)}</td><td style="padding:6px 0;font-family:${emailFonts.sans};font-size:14px;font-weight:600;color:${gs.text};text-align:right;">${esc(row.value)}</td></tr>`
    )
    .join('')
  return `<p style="margin:0 0 8px 0;font-family:${emailFonts.sans};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Your trip</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 18px 0;border-collapse:collapse;">${lines}</table>`
}

const invoiceNoteHtml = (marked) =>
  `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Your invoice is attached. It shows the trip and that this payment is marked <strong>${esc(marked)}</strong>.</p>`

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
 * @param {{ amountPaidEur?: number, grossEur?: number, balanceEur?: number, tripRows?: { label: string, value: string }[] }} [amounts]
 */
export const buildTransferDepositThankYouEmail = (booking, depositPercent, amounts = {}) => {
  const site = getGsolSiteUrl()
  const route = `${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)}`
  const paidTxt = amounts.amountPaidEur != null ? fmtEur(amounts.amountPaidEur) : `${depositPercent}% deposit`
  const subject = `Golf Sol Ireland — deposit received (${paidTxt})`
  const heroTitle = 'Deposit received'
  const heroLead = `We have marked your payment as a deposit (${paidTxt}) for your Costa del Sol trip. Your route: ${route}.`
  const bodyHtml = `${refLineHtml(booking)}
    ${invoiceNoteHtml('Deposit received')}
    ${tripRowsHtml(amounts.tripRows)}
    ${amountSummaryHtml({ ...amounts, labelPaid: 'Deposit received' })}
    <p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">The balance is still due. You will get a separate note with a link to pay it from your dashboard.</p>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};"><a href="${site}/dashboard" style="color:${gs.green};font-weight:600;">Open your dashboard</a></p>`

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
 * @param {{ amountPaidEur?: number, grossEur?: number, tripRows?: { label: string, value: string }[] }} [amounts]
 */
export const buildTransferFullPaymentThankYouEmail = (booking, amounts = {}) => {
  const site = getGsolSiteUrl()
  const route = `${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)}`
  const paidTxt = amounts.amountPaidEur != null ? fmtEur(amounts.amountPaidEur) : 'your payment'
  const subject =
    amounts.amountPaidEur != null
      ? `Golf Sol Ireland — paid in full (${paidTxt})`
      : 'Golf Sol Ireland — your trip is paid in full'
  const heroTitle = 'Paid in full'
  const heroLead = `Thank you — we have marked your trip paid in full (${paidTxt}). Your route: ${route}.`
  const bodyHtml = `${refLineHtml(booking)}
    ${invoiceNoteHtml('Paid in full')}
    ${tripRowsHtml(amounts.tripRows)}
    ${amountSummaryHtml({ ...amounts, balanceEur: 0, labelPaid: 'Amount received' })}
    <p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Nothing further is due on this total. We will confirm pick-up details closer to travel.</p>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};"><a href="${site}/dashboard" style="color:${gs.green};font-weight:600;">Open your dashboard</a></p>`

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
 * Sent immediately after a deposit — prompts guest to pay the remaining balance.
 * @param {Record<string, unknown>} booking
 * @param {number} depositPercent
 * @param {{ depositPaidEur?: number, balanceEur?: number, grossEur?: number }} amounts
 * @param {object | null} [payment]
 */
export const buildTransferBalancePayNowEmail = (booking, depositPercent, amounts = {}, payment = null) => {
  const site = getGsolSiteUrl().replace(/\/+$/, '')
  const route = `${booking.pickup_label} → ${booking.dropoff_label}`
  const balanceTxt =
    amounts.balanceEur != null && Number.isFinite(amounts.balanceEur)
      ? fmtEur(amounts.balanceEur)
      : `the remaining ${Math.max(1, 100 - depositPercent)}%`
  const ref = bookingPaymentReference(booking)
  const payHref = `${site}/dashboard`
  const subject = `Golf Sol Ireland — please pay your balance (${balanceTxt})`
  const title = 'Balance due'
  const lead = `Your deposit for (${route}) is on file. Please pay the outstanding balance of ${balanceTxt} by bank transfer using the reference below, or from your trip desk.`

  const rows = []
  if (ref) rows.push(['Reference', ref])
  rows.push(['Route', route])
  if (amounts.depositPaidEur != null) rows.push(['Deposit paid', fmtEur(amounts.depositPaidEur)])
  if (amounts.grossEur != null) rows.push(['Trip total', fmtEur(amounts.grossEur)])
  rows.push(['Balance due', balanceTxt])

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: lead.slice(0, 118),
    kicker: 'Balance due',
    title,
    lead,
    rows,
    payment,
    cta: { href: payHref, label: 'Pay balance on trip desk' }
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
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Questions? <a href="${phoneIrelandHref}" style="color:${gs.green};font-weight:600;">${phoneIrelandDisplay}</a></p>`

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
 * Booking reference used as the bank-transfer payment reference.
 * @param {Record<string, unknown>} booking
 */
export const bookingPaymentReference = (booking) => {
  const ref = String(booking.enquiry_reference_id ?? booking.payment_reference ?? '').trim()
  return ref || null
}

/**
 * Admin-triggered: ask the guest to pay a transfer (lean shell + Monzo block from settings).
 * @param {Record<string, unknown>} booking
 * @param {object | null} [payment] from paymentBlockFromSettings / site_payment_settings
 */
export const buildTransferPaymentRequestEmail = (booking, payment = null) => {
  const site = getGsolSiteUrl().replace(/\/+$/, '')
  const route = `${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)}`
  const rawPrice = Number(booking.admin_price_eur)
  const hasPrice = Number.isFinite(rawPrice) && rawPrice >= 0.5
  const fullUpfront = isTransferFullUpfront(booking)
  const pct = normalizedDepositPercent(booking.deposit_percent)
  const dueNow = hasPrice ? (fullUpfront ? rawPrice : depositAmountEur(rawPrice, pct)) : null
  const dueTxt = dueNow != null ? fmtEur(dueNow) : null
  const totalTxt = hasPrice ? fmtEur(rawPrice) : null
  const ref = bookingPaymentReference(booking)
  const payHref = `${site}/dashboard`
  const subject = fullUpfront
    ? 'Golf Sol Ireland — your transfer is ready to pay'
    : `Golf Sol Ireland — ${pct}% deposit for your transfer`
  const title = fullUpfront ? 'Your transfer is ready to pay' : `${pct}% deposit is ready`
  const lead = hasPrice
    ? fullUpfront
      ? `Please pay ${dueTxt} for your transfer (${route}). Use the bank details below, or pay from your trip desk.`
      : `Please pay the ${pct}% deposit of ${dueTxt} (trip total ${totalTxt}) for your transfer (${route}). Use the bank details below, or pay from your trip desk.`
    : `Please arrange payment for your transfer (${route}). Use the bank details below, or open your trip desk.`

  const rows = []
  if (ref) rows.push(['Reference', ref])
  rows.push(['Route', `${booking.pickup_label} → ${booking.dropoff_label}`])
  if (hasPrice && dueTxt) rows.push(['Due now', dueTxt])
  if (hasPrice && totalTxt && !fullUpfront) rows.push(['Trip total', totalTxt])

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: lead.slice(0, 118),
    kicker: 'Payment request',
    title,
    lead,
    rows,
    payment,
    cta: { href: payHref, label: fullUpfront ? 'Open trip desk' : 'Pay deposit on trip desk' },
    bodyHtml: `<p style="margin:0;font-size:15px;line-height:22px;color:#66726b;">Prefer card? Sign in with this email and use <strong>${fullUpfront ? 'Pay now' : 'Pay deposit'}</strong> on your dashboard.</p>`
  })
  return { subject, html: finalizeGsolEmailHtml(htmlRaw), dueNowEur: dueNow, paymentReference: ref }
}

/**
 * @param {Record<string, unknown>} booking
 * @param {number} depositPercent
 * @param {object | null} [payment]
 */
export const buildTransferBalanceReminderEmail = (booking, depositPercent, payment = null) => {
  const site = getGsolSiteUrl().replace(/\/+$/, '')
  const route = `${booking.pickup_label} → ${booking.dropoff_label}`
  const remainder = Math.max(1, 100 - depositPercent)
  const ref = bookingPaymentReference(booking)
  const subject = 'Golf Sol Ireland — action needed: transfer balance before pickup'
  const title = 'Balance due — please pay to keep your booking'
  const lead = `Your ${depositPercent}% deposit for (${route}) is on file. The remaining ${remainder}% is now due (48 hours before pickup). Pay by bank transfer using the reference below, or from your trip desk.`

  const rows = []
  if (ref) rows.push(['Reference', ref])
  rows.push(['Route', route])
  rows.push(['Balance', `${remainder}% remaining`])

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: lead.slice(0, 118),
    kicker: 'Balance due',
    title,
    lead,
    rows,
    payment,
    cta: { href: `${site}/dashboard`, label: 'Pay balance on trip desk' },
    bodyHtml: `<p style="margin:0;font-size:15px;line-height:22px;color:#66726b;"><strong>Important:</strong> if the balance is not received by the due time, we may treat the booking as cancelled and the deposit may be forfeited under our payment terms.</p>`
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
    <p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.75;color:${gs.text};">Questions? <a href="${phoneIrelandHref}" style="color:${gs.green};font-weight:600;">${phoneIrelandDisplay}</a> · <a href="${site}/dashboard" style="color:${gs.green};font-weight:600;">Your dashboard</a></p>`

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
