/**
 * Branded transfer PDFs for the client portal (pdf-lib + same assets/palette as formal proposals / sample branded PDF).
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { pdfEmailTheme } from './pdf-email-brand.mjs'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { getGsolSiteUrl } from './site-url.mjs'
import { balanceAmountEur, normalizedDepositPercent } from './transfer-payment-amounts.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  drawUnifiedDocumentFooter,
  drawUnifiedDocumentHeader,
  embedUnifiedLogo,
  loadUnifiedPdfFonts
} from './gsol-unified-pdf-template.mjs'

const W = 595.28
const H = 841.89
const m = 48

const IRISH_VAT_STANDARD = 0.23
const IRISH_VAT_TOURISM = 0.135

const round2 = (n) => Math.round(n * 100) / 100

const vatFromGross = (gross, treatment) => {
  const rate = treatment === 'services' ? IRISH_VAT_STANDARD : IRISH_VAT_TOURISM
  const g = round2(gross)
  const net = round2(g / (1 + rate))
  const vat = round2(g - net)
  return { rate, gross: g, net, vat }
}

const formatEur = (n) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

const wrapLines = (text, font, size, maxW) => {
  const paragraphs = sanitizeStandardFontText(String(text ?? '')).split('\n')
  const out = []
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      out.push('')
      continue
    }
    let line = words[0]
    for (let i = 1; i < words.length; i += 1) {
      const next = `${line} ${words[i]}`
      if (font.widthOfTextAtSize(next, size) <= maxW) {
        line = next
      } else {
        out.push(line)
        line = words[i]
      }
    }
    out.push(line)
  }
  return out
}

const humanizeFieldKey = (key) =>
  String(key ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

const loadPdfShell = async (doc) => ({
  ...(await loadUnifiedPdfFonts(doc)),
  ...(await embedUnifiedLogo(doc))
})

const drawHeaderBand = (page, shell, title) => {
  drawUnifiedDocumentHeader(page, shell, { title: sanitizeStandardFontText(title) })
}

const BODY_START_Y = H - UNIFIED_PDF_LAYOUT.headerBandHeight - UNIFIED_PDF_LAYOUT.margin - 52

const drawFooterLine = (page, shell, text, pageInfo = null) => {
  drawUnifiedDocumentFooter(page, 52, shell, text ? [text] : [], pageInfo)
}

const drawGoldRule = (page, y) => {
  const contentW = W - m * 2
  page.drawRectangle({ x: m, y: y - 1, width: contentW * 0.3, height: 2, color: pdfEmailTheme.gold })
  page.drawRectangle({ x: m + contentW * 0.3 + 6, y: y - 0.5, width: contentW * 0.7 - 6, height: 0.5, color: pdfEmailTheme.sand })
  return y - 20
}

/**
 * @param {{ booking: Record<string, unknown>, packageBuild: Record<string, unknown> | null, profileName: string, profileEmail: string }} ctx
 */
export const createTransferFormSubmissionPdf = async (ctx) => {
  const doc = await PDFDocument.create()
  const shell = await loadPdfShell(doc)
  const font = shell.font
  const fontBold = shell.fontBold
  const t = pdfEmailTheme
  const b = ctx.booking
  const rows = []

  rows.push(['Route', `${String(b.pickup_label ?? '')} → ${String(b.dropoff_label ?? '')}`])
  if (b.scheduled_at) {
    rows.push(['Scheduled', new Date(String(b.scheduled_at)).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' })])
  }
  if (String(b.client_timing_note ?? '').trim()) {
    rows.push(['Timing note', String(b.client_timing_note).trim()])
  }
  if (String(b.enquiry_reference_id ?? '').trim()) {
    rows.push(['Enquiry reference', String(b.enquiry_reference_id).trim()])
  }
  rows.push(['Guest name', String(b.client_display_name ?? '').trim() || '—'])
  rows.push(['Phone', String(b.client_phone ?? '').trim() || '—'])
  rows.push(['Source', String(b.booking_source ?? '')])

  const pkg = ctx.packageBuild
  const cfg = pkg && typeof pkg.config === 'object' && pkg.config !== null ? pkg.config : null
  if (cfg && cfg.type === 'website_form' && cfg.fields && typeof cfg.fields === 'object') {
    for (const [k, v] of Object.entries(cfg.fields)) {
      const val = typeof v === 'string' || typeof v === 'number' ? String(v) : JSON.stringify(v)
      rows.push([humanizeFieldKey(k), val.trim() || '—'])
    }
  }

  let page = doc.addPage([W, H])
  drawHeaderBand(page, shell, 'Your original request (snapshot)')

  let y = BODY_START_Y
  page.drawText('Submitted details as on file when Golf Sol Ireland quoted this transfer.', {
    x: m,
    y,
    size: 11,
    font,
    color: t.ink
  })
  y -= 22
  y = drawGoldRule(page, y)

  const colW = (W - 2 * m - 12) * 0.34
  const valW = W - 2 * m - 12 - colW

  for (const [label, value] of rows) {
    const lab = sanitizeStandardFontText(label)
    const valLines = wrapLines(value, font, 10, valW)
    const blockH = Math.max(22, 12 + valLines.length * 12 + 10)
    if (y < m + blockH + 40) {
      drawFooterLine(page, shell, 'Golf Sol Ireland · Continued on next page.')
      page = doc.addPage([W, H])
      drawHeaderBand(page, shell, 'Your original request (continued)')
      y = BODY_START_Y
    }
    page.drawRectangle({
      x: m,
      y: y - blockH,
      width: W - 2 * m,
      height: blockH,
      color: t.paleGreen,
      borderColor: t.sand,
      borderWidth: 0.5
    })
    page.drawText(lab, { x: m + 10, y: y - 16, size: 9, font: fontBold, color: t.greenSoft })
    let vy = y - 28
    for (const ln of valLines) {
      page.drawText(sanitizeStandardFontText(ln), { x: m + colW + 10, y: vy, size: 10, font, color: t.ink })
      vy -= 12
    }
    y -= blockH + 8
  }

  drawFooterLine(page, shell, 'Golf Sol Ireland · This snapshot reflects the information supplied for this transfer. It is not a contract or invoice by itself.')

  return doc.save()
}

/**
 * @param {{ booking: Record<string, unknown>, profileName: string, profileEmail: string, accountRef: string | null, siteOrigin: string }} ctx
 */
export const createTransferVatQuotePdf = async (ctx) => {
  const gross = Number(ctx.booking.admin_price_eur)
  if (!Number.isFinite(gross) || gross <= 0) {
    throw new Error('Missing admin price for VAT PDF')
  }
  const treatment = String(ctx.booking.admin_price_vat_treatment ?? 'tourism').toLowerCase() === 'services' ? 'services' : 'tourism'
  const { net, vat } = vatFromGross(gross, treatment)
  const pay = String(ctx.booking.payment_status ?? 'unpaid').toLowerCase()
  const payLine =
    pay === 'paid' ? 'Paid in full' : pay === 'deposit' ? 'Deposit recorded — balance outstanding' : 'Outstanding — quote only until paid'

  const doc = await PDFDocument.create()
  const shell = await loadPdfShell(doc)
  const font = shell.font
  const fontBold = shell.fontBold
  const t = pdfEmailTheme
  const page = doc.addPage([W, H])
  drawHeaderBand(page, shell, 'Transfer quote & VAT summary')

  let y = BODY_START_Y
  page.drawText(sanitizeStandardFontText(`Bill to: ${ctx.profileName}`), { x: m, y, size: 11, font: fontBold, color: t.ink })
  y -= 16
  if (ctx.profileEmail?.trim()) {
    page.drawText(sanitizeStandardFontText(ctx.profileEmail.trim()), { x: m, y, size: 10, font, color: t.muted })
    y -= 14
  }
  if (ctx.accountRef?.trim()) {
    page.drawText(sanitizeStandardFontText(`Account: ${ctx.accountRef.trim()}`), { x: m, y, size: 10, font, color: t.muted })
    y -= 14
  }
  y -= 6
  y = drawGoldRule(page, y)

  page.drawRectangle({
    x: m,
    y: y - 118,
    width: W - 2 * m,
    height: 118,
    color: t.white,
    borderColor: t.sand,
    borderWidth: 0.75
  })
  let ty = y - 18
  page.drawText('TRANSFER DETAILS', { x: m + 14, y: ty, size: 8, font: fontBold, color: t.greenSoft })
  ty -= 18
  const route = `${String(ctx.booking.pickup_label)} → ${String(ctx.booking.dropoff_label)}`
  page.drawText(sanitizeStandardFontText(route), { x: m + 14, y: ty, size: 10, font, color: t.ink })
  ty -= 14
  page.drawText(sanitizeStandardFontText(`Payment: ${payLine}`), { x: m + 14, y: ty, size: 10, font, color: t.ink })
  ty -= 14
  page.drawText(sanitizeStandardFontText(`Reference: ${String(ctx.booking.id)}`), { x: m + 14, y: ty, size: 8, font, color: t.muted })
  y -= 132

  page.drawRectangle({
    x: m,
    y: y - 108,
    width: W - 2 * m,
    height: 108,
    color: t.paleGreen,
    borderColor: t.sand,
    borderWidth: 0.5
  })
  let vy = y - 18
  page.drawText('VAT summary (Irish VAT)', { x: m + 14, y: vy, size: 11, font: fontBold, color: t.ink })
  vy -= 18
  const rateLabel =
    treatment === 'services'
      ? `Standard rate (${(IRISH_VAT_STANDARD * 100).toFixed(0)}%) — services`
      : `Reduced tourism-related rate (${(IRISH_VAT_TOURISM * 100).toFixed(1)}%)`
  page.drawText(sanitizeStandardFontText(`Treatment: ${rateLabel}`), { x: m + 14, y: vy, size: 10, font, color: t.ink })
  vy -= 14
  page.drawText('Total quoted is VAT-inclusive (gross).', { x: m + 14, y: vy, size: 10, font, color: t.ink })
  vy -= 16
  page.drawText(sanitizeStandardFontText(`Net (ex VAT): ${formatEur(net)}`), { x: m + 14, y: vy, size: 10, font, color: t.ink })
  vy -= 14
  page.drawText(sanitizeStandardFontText(`VAT: ${formatEur(vat)}`), { x: m + 14, y: vy, size: 10, font, color: t.ink })
  vy -= 14
  page.drawText(sanitizeStandardFontText(`Total (incl. VAT): ${formatEur(gross)}`), { x: m + 14, y: vy, size: 11, font: fontBold, color: t.goldDeep })
  y -= 120

  if (pay === 'unpaid') {
    const dash = `${ctx.siteOrigin.replace(/\/+$/, '')}/dashboard`
    page.drawRectangle({
      x: m,
      y: y - 92,
      width: W - 2 * m,
      height: 92,
      color: t.paleGold,
      borderColor: t.gold,
      borderWidth: 0.6
    })
    let py = y - 18
    page.drawText('Pay online (secure card payment)', { x: m + 14, y: py, size: 11, font: fontBold, color: t.ink })
    py -= 16
    const hint = wrapLines(
      'Sign in to your client dashboard and use Pay now next to this transfer.',
      font,
      10,
      W - 2 * m - 28
    )
    for (const ln of hint) {
      page.drawText(sanitizeStandardFontText(ln), { x: m + 14, y: py, size: 10, font, color: t.ink })
      py -= 12
    }
    py -= 4
    const urlLines = wrapLines(dash, font, 10, W - 2 * m - 28)
    for (const ln of urlLines) {
      page.drawText(sanitizeStandardFontText(ln), { x: m + 14, y: py, size: 10, font: fontBold, color: rgb(0, 0.4, 0.8) })
      py -= 12
    }
    y -= 100
  }

  drawFooterLine(page, shell, 'Golf Sol Ireland · VAT-transparent quote for this transfer. After payment, download your paid invoice PDF from the same dashboard.')

  return doc.save()
}

/**
 * Card payment receipt for portal paper trail (after Stripe Checkout succeeds).
 * @param {{
 *   booking: Record<string, unknown>
 *   profileName: string
 *   profileEmail: string
 *   accountRef: string | null
 *   receiptType: 'deposit' | 'paid_in_full'
 *   amountChargedEur: number
 *   stripeSessionId?: string | null
 *   stripePaymentIntentId?: string | null
 * }} ctx
 */
export const createTransferPaymentReceiptPdf = async (ctx) => {
  const gross = Number(ctx.booking.admin_price_eur)
  const pct = normalizedDepositPercent(ctx.booking.deposit_percent)
  const amt = round2(Number(ctx.amountChargedEur))
  const doc = await PDFDocument.create()
  const shell = await loadPdfShell(doc)
  const font = shell.font
  const fontBold = shell.fontBold
  const t = pdfEmailTheme
  const page = doc.addPage([W, H])
  const headerTitle =
    ctx.receiptType === 'deposit' ? 'Deposit payment confirmation' : 'Payment received in full'
  drawHeaderBand(page, shell, headerTitle)

  let y = BODY_START_Y
  page.drawText(sanitizeStandardFontText(`Bill to: ${ctx.profileName}`), { x: m, y, size: 11, font: fontBold, color: t.ink })
  y -= 16
  if (ctx.profileEmail?.trim()) {
    page.drawText(sanitizeStandardFontText(ctx.profileEmail.trim()), { x: m, y, size: 10, font, color: t.muted })
    y -= 14
  }
  if (ctx.accountRef?.trim()) {
    page.drawText(sanitizeStandardFontText(`Account: ${ctx.accountRef.trim()}`), { x: m, y, size: 10, font, color: t.muted })
    y -= 14
  }
  y -= 10

  const route = `${String(ctx.booking.pickup_label ?? '')} → ${String(ctx.booking.dropoff_label ?? '')}`
  page.drawRectangle({
    x: m,
    y: y - 100,
    width: W - 2 * m,
    height: 100,
    color: t.paleGreen,
    borderColor: t.sand,
    borderWidth: 0.5
  })
  let ty = y - 18
  page.drawText('Transfer', { x: m + 14, y: ty, size: 11, font: fontBold, color: t.ink })
  ty -= 18
  page.drawText(sanitizeStandardFontText(route), { x: m + 14, y: ty, size: 10, font, color: t.ink })
  ty -= 14
  page.drawText(sanitizeStandardFontText(`Booking reference: ${String(ctx.booking.id)}`), {
    x: m + 14,
    y: ty,
    size: 9,
    font,
    color: t.muted
  })
  y -= 112

  page.drawText(sanitizeStandardFontText(`Amount paid (this card charge): ${formatEur(amt)}`), {
    x: m,
    y,
    size: 14,
    font: fontBold,
    color: t.goldDeep
  })
  y -= 22

  if (Number.isFinite(gross) && gross > 0) {
    page.drawText(sanitizeStandardFontText(`Quoted total (VAT incl.): ${formatEur(gross)}`), {
      x: m,
      y,
      size: 11,
      font,
      color: t.ink
    })
    y -= 16
  }

  if (ctx.receiptType === 'deposit' && Number.isFinite(gross) && gross > 0) {
    const rem = balanceAmountEur(gross, pct)
    page.drawText(
      sanitizeStandardFontText(
        `Outstanding balance after this deposit: ${formatEur(rem)} (${100 - pct}% of quoted total).`
      ),
      { x: m, y, size: 10, font, color: t.ink }
    )
    y -= 28
  } else if (ctx.receiptType === 'paid_in_full' && Number.isFinite(gross) && gross > 0) {
    page.drawText(sanitizeStandardFontText('This transfer is fully paid against the quoted total above.'), {
      x: m,
      y,
      size: 10,
      font,
      color: t.ink
    })
    y -= 28
  }

  const stripeBits = []
  const cs = ctx.stripeSessionId ? String(ctx.stripeSessionId).trim() : ''
  const pi = ctx.stripePaymentIntentId ? String(ctx.stripePaymentIntentId).trim() : ''
  if (cs.startsWith('cs_')) {
    stripeBits.push(`Stripe Checkout session …${cs.slice(-12)}`)
  }
  if (pi.startsWith('pi_')) {
    stripeBits.push(`PaymentIntent …${pi.slice(-12)}`)
  }
  if (stripeBits.length) {
    page.drawText(sanitizeStandardFontText(stripeBits.join(' · ')), { x: m, y, size: 9, font, color: t.muted })
    y -= 28
  }

  const dash = `${getGsolSiteUrl().replace(/\/+$/, '')}/dashboard`
  drawFooterLine(page, shell, `Golf Sol Ireland · This document confirms the card payment recorded above. Your dashboard: ${dash}`)

  return doc.save()
}

const TERMS_SUMMARY_PARAS = [
  'This summary highlights key parts of Golf Sol Ireland booking terms. It does not replace the full terms document in your portal when enabled.',
  '1. Who we are: we coordinate golf travel services on the Costa del Sol as a booking coordinator for third-party suppliers.',
  '2. Quotes: a quote is not a confirmed booking until we confirm in writing and required payment is received.',
  '3. Deposits: unless your proposal states otherwise, a 20% deposit secures the booking; balance timing follows your written confirmation.',
  '4. Cancellations: supplier rules apply; deposits may be non-refundable after the cooling-off window described in the full terms.',
  '5. Liability: third-party suppliers deliver hotels, golf, and transport; our liability is limited to reasonable care in arranging services.',
  'For the complete wording, open Terms & conditions in your client dashboard (when Golf Sol Ireland has enabled access for your account).'
]

export const createTermsSummaryPdf = async () => {
  const doc = await PDFDocument.create()
  const shell = await loadPdfShell(doc)
  const font = shell.font
  const t = pdfEmailTheme
  let page = doc.addPage([W, H])
  drawHeaderBand(page, shell, 'Terms & conditions (summary)')
  let y = BODY_START_Y
  y = drawGoldRule(page, y)
  const maxW = W - 2 * m
  for (const para of TERMS_SUMMARY_PARAS) {
    const lines = wrapLines(para, font, 11, maxW)
    for (const ln of lines) {
      if (y < m + 60) {
        drawFooterLine(page, shell, 'Golf Sol Ireland · Continued on next page.')
        page = doc.addPage([W, H])
        drawHeaderBand(page, shell, 'Terms & conditions (continued)')
        y = BODY_START_Y
      }
      page.drawText(sanitizeStandardFontText(ln), { x: m, y, size: 11, font, color: t.ink })
      y -= 14
    }
    y -= 8
  }
  drawFooterLine(page, shell, `Golf Sol Ireland · Full terms: ${getGsolSiteUrl()}/documents/terms`)
  return doc.save()
}
