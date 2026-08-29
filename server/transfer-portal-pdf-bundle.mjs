/**
 * Branded transfer PDFs for the client portal (pdf-lib + same assets/palette as formal proposals / sample branded PDF).
 */
import { PDFDocument, rgb } from 'pdf-lib'
import { pdfEmailTheme } from './pdf-email-brand.mjs'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { getGsolSiteUrl } from './site-url.mjs'
import {
  balanceAmountEur,
  depositAmountEur,
  isTransferFullUpfront,
  normalizedDepositPercent
} from './transfer-payment-amounts.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  drawUnifiedDocumentFooter,
  drawUnifiedDocumentHeader,
  drawUnifiedGoldRule,
  drawUnifiedKeyValueTable,
  embedUnifiedLogo,
  estimateUnifiedKeyValueTableHeight,
  loadUnifiedPdfFonts
} from './gsol-unified-pdf-template.mjs'
import { buildGsolMasterDocumentPdf } from './gsol-master-document-pdf.mjs'

const W = UNIFIED_PDF_LAYOUT.pageWidth
const H = UNIFIED_PDF_LAYOUT.pageHeight
const m = UNIFIED_PDF_LAYOUT.margin
const FOOTER_SAFE = UNIFIED_PDF_LAYOUT.footerReserve + 28

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

/** ASCII currency for WinAnsi / Helvetica (avoid "?" for the euro glyph). */
const formatEur = (n) => {
  const num = new Intl.NumberFormat('en-IE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(n) || 0)
  return `EUR ${num}`
}

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

/** Always use the Y returned by the header — hardcoded offsets overlap the document title. */
const drawHeaderBand = (page, shell, title, subtitle = '') =>
  drawUnifiedDocumentHeader(page, shell, {
    title: sanitizeStandardFontText(title),
    ...(subtitle ? { subtitle: sanitizeStandardFontText(subtitle) } : {})
  })

const drawFooterLine = (page, shell, text, pageInfo = null) => {
  drawUnifiedDocumentFooter(page, 52, shell, text ? [text] : [], pageInfo)
}

/**
 * @param {{ booking: Record<string, unknown>, packageBuild: Record<string, unknown> | null, profileName: string, profileEmail: string }} ctx
 */
export const createTransferFormSubmissionPdf = async (ctx) => {
  const doc = await PDFDocument.create()
  const shell = await loadPdfShell(doc)
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

  const tableRows = rows.map(([label, value]) => ({
    label: String(label),
    value: String(value ?? '—')
  }))

  let page = doc.addPage([W, H])
  let y = drawHeaderBand(
    page,
    shell,
    'Your original request (snapshot)',
    'Submitted details as on file when Golf Sol Ireland quoted this transfer.'
  )
  y = drawUnifiedGoldRule(page, y)

  for (let i = 0; i < tableRows.length; i += 1) {
    const row = tableRows[i]
    const rowH = estimateUnifiedKeyValueTableHeight(shell, [row])
    if (y - rowH < FOOTER_SAFE) {
      drawFooterLine(page, shell, 'Golf Sol Ireland · Continued on next page.')
      page = doc.addPage([W, H])
      y = drawHeaderBand(page, shell, 'Your original request (continued)')
      y = drawUnifiedGoldRule(page, y)
    }
    y = drawUnifiedKeyValueTable(page, y, shell, [row])
  }

  drawFooterLine(
    page,
    shell,
    'Golf Sol Ireland · This snapshot reflects the information supplied for this transfer. It is not a contract or invoice by itself.'
  )

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
  const fullUpfront = isTransferFullUpfront(ctx.booking)
  const pct = normalizedDepositPercent(ctx.booking.deposit_percent)
  const depositDue = depositAmountEur(gross, pct)
  const payLine =
    pay === 'paid'
      ? 'Paid in full'
      : pay === 'deposit'
        ? `Deposit recorded — ${100 - pct}% balance outstanding`
        : fullUpfront
          ? 'Outstanding — pay full quoted total'
          : `Outstanding — ${pct}% deposit due now (${formatEur(depositDue)})`

  const doc = await PDFDocument.create()
  const shell = await loadPdfShell(doc)
  const font = shell.font
  const fontBold = shell.fontBold
  const t = pdfEmailTheme
  const page = doc.addPage([W, H])
  let y = drawHeaderBand(page, shell, 'Transfer quote & VAT summary')
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
  y = drawUnifiedGoldRule(page, y)

  const innerW = W - 2 * m - 28
  const route = `${String(ctx.booking.pickup_label)} → ${String(ctx.booking.dropoff_label)}`
  const routeLines = wrapLines(route, font, 10, innerW)
  const payLines = wrapLines(`Payment: ${payLine}`, font, 10, innerW)
  const refLines = wrapLines(`Reference: ${String(ctx.booking.id)}`, font, 8, innerW)
  const transferBoxH = 18 + 18 + routeLines.length * 12 + payLines.length * 12 + refLines.length * 11 + 20
  page.drawRectangle({
    x: m,
    y: y - transferBoxH,
    width: W - 2 * m,
    height: transferBoxH,
    color: t.white,
    borderColor: t.sand,
    borderWidth: 0.75
  })
  let ty = y - 18
  page.drawText('TRANSFER DETAILS', { x: m + 14, y: ty, size: 8, font: fontBold, color: t.greenSoft })
  ty -= 18
  for (const ln of routeLines) {
    page.drawText(sanitizeStandardFontText(ln), { x: m + 14, y: ty, size: 10, font, color: t.ink })
    ty -= 12
  }
  for (const ln of payLines) {
    page.drawText(sanitizeStandardFontText(ln), { x: m + 14, y: ty, size: 10, font, color: t.ink })
    ty -= 12
  }
  for (const ln of refLines) {
    page.drawText(sanitizeStandardFontText(ln), { x: m + 14, y: ty, size: 8, font, color: t.muted })
    ty -= 11
  }
  y -= transferBoxH + 14

  const showDepositDue = pay === 'unpaid' && !fullUpfront
  const rateLabel =
    treatment === 'services'
      ? `Standard rate (${(IRISH_VAT_STANDARD * 100).toFixed(0)}%) — services`
      : `Reduced tourism-related rate (${(IRISH_VAT_TOURISM * 100).toFixed(1)}%)`
  const treatmentLines = wrapLines(`Treatment: ${rateLabel}`, font, 10, innerW)
  const vatLines = [
    { text: 'VAT summary (Irish VAT)', size: 11, bold: true, gap: 18 },
    ...treatmentLines.map((ln) => ({ text: ln, size: 10, bold: false, gap: 12 })),
    { text: 'Total quoted is VAT-inclusive (gross).', size: 10, bold: false, gap: 16 },
    { text: `Net (ex VAT): ${formatEur(net)}`, size: 10, bold: false, gap: 14 },
    {
      text: `VAT @ ${(treatment === 'services' ? IRISH_VAT_STANDARD : IRISH_VAT_TOURISM) * 100}%: ${formatEur(vat)}`,
      size: 10,
      bold: false,
      gap: 14
    },
    { text: `Total (incl. VAT): ${formatEur(gross)}`, size: 11, bold: true, gap: 14, color: t.goldDeep },
    ...(showDepositDue
      ? [{ text: `Due now (${pct}% deposit): ${formatEur(depositDue)}`, size: 10, bold: true, gap: 14 }]
      : [])
  ]
  const vatBoxH = 18 + vatLines.reduce((sum, line) => sum + line.gap, 0) + 8
  page.drawRectangle({
    x: m,
    y: y - vatBoxH,
    width: W - 2 * m,
    height: vatBoxH,
    color: t.paleGreen,
    borderColor: t.sand,
    borderWidth: 0.5
  })
  let vy = y - 18
  for (const line of vatLines) {
    page.drawText(sanitizeStandardFontText(line.text), {
      x: m + 14,
      y: vy,
      size: line.size,
      font: line.bold ? fontBold : font,
      color: line.color ?? t.ink
    })
    vy -= line.gap
  }
  y -= vatBoxH + 12

  if (pay === 'unpaid') {
    const dash = `${ctx.siteOrigin.replace(/\/+$/, '')}/dashboard`
    const hint = wrapLines(
      'Sign in to your client dashboard and use Pay now next to this transfer.',
      font,
      10,
      innerW
    )
    const urlLines = wrapLines(dash, font, 10, innerW)
    const payBoxH = 18 + 16 + hint.length * 12 + 4 + urlLines.length * 12 + 20
    page.drawRectangle({
      x: m,
      y: y - payBoxH,
      width: W - 2 * m,
      height: payBoxH,
      color: t.paleGold,
      borderColor: t.gold,
      borderWidth: 0.6
    })
    let py = y - 18
    page.drawText('Pay online (secure card payment)', { x: m + 14, y: py, size: 11, font: fontBold, color: t.ink })
    py -= 16
    for (const ln of hint) {
      page.drawText(sanitizeStandardFontText(ln), { x: m + 14, y: py, size: 10, font, color: t.ink })
      py -= 12
    }
    py -= 4
    for (const ln of urlLines) {
      page.drawText(sanitizeStandardFontText(ln), { x: m + 14, y: py, size: 10, font: fontBold, color: rgb(0, 0.4, 0.8) })
      py -= 12
    }
    y -= payBoxH + 8
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
  const kind = ctx.receiptType === 'deposit' ? 'deposit_receipt' : 'paid_in_full'
  const route = `${String(ctx.booking.pickup_label ?? '')} → ${String(ctx.booking.dropoff_label ?? '')}`
  const dash = `${getGsolSiteUrl().replace(/\/+$/, '')}/dashboard`
  const notes = []
  if (Number.isFinite(gross) && gross > 0) {
    notes.push(`Quoted total (VAT incl.): ${formatEur(gross)}.`)
  }
  if (ctx.receiptType === 'deposit' && Number.isFinite(gross) && gross > 0) {
    const rem = balanceAmountEur(gross, pct)
    notes.push(`Outstanding balance after this deposit: ${formatEur(rem)} (${100 - pct}% of quoted total).`)
  } else if (ctx.receiptType === 'paid_in_full') {
    notes.push('This transfer is fully paid against the quoted total.')
  }
  const stripeBits = []
  const cs = ctx.stripeSessionId ? String(ctx.stripeSessionId).trim() : ''
  const pi = ctx.stripePaymentIntentId ? String(ctx.stripePaymentIntentId).trim() : ''
  if (cs.startsWith('cs_')) stripeBits.push(`Stripe Checkout session …${cs.slice(-12)}`)
  if (pi.startsWith('pi_')) stripeBits.push(`PaymentIntent …${pi.slice(-12)}`)
  if (stripeBits.length) notes.push(stripeBits.join(' · '))
  notes.push(`Your dashboard: ${dash}`)

  const { bytes } = await buildGsolMasterDocumentPdf({
    kind,
    subtitle:
      ctx.receiptType === 'deposit'
        ? 'Card payment recorded against your Golf Sol Ireland transfer.'
        : 'Card payment received in full for your Golf Sol Ireland transfer.',
    reference: String(ctx.booking.id),
    customerName: ctx.profileName,
    customerEmail: ctx.profileEmail,
    accountRef: ctx.accountRef,
    rows: [
      { label: 'Transfer', value: route },
      { label: 'Booking reference', value: String(ctx.booking.id) }
    ],
    amountLabel: 'Amount paid (this card charge)',
    amountValue: formatEur(amt),
    notes: notes.join('\n\n')
  })
  return bytes
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
  let y = drawHeaderBand(page, shell, 'Terms & conditions (summary)')
  y = drawUnifiedGoldRule(page, y)
  const maxW = W - 2 * m
  for (const para of TERMS_SUMMARY_PARAS) {
    const lines = wrapLines(para, font, 11, maxW)
    for (const ln of lines) {
      if (y < FOOTER_SAFE) {
        drawFooterLine(page, shell, 'Golf Sol Ireland · Continued on next page.')
        page = doc.addPage([W, H])
        y = drawHeaderBand(page, shell, 'Terms & conditions (continued)')
        y = drawUnifiedGoldRule(page, y)
      }
      page.drawText(sanitizeStandardFontText(ln), { x: m, y, size: 11, font, color: t.ink })
      y -= 14
    }
    y -= 8
  }
  drawFooterLine(page, shell, `Golf Sol Ireland · Full terms: ${getGsolSiteUrl()}/documents/terms`)
  return doc.save()
}
