import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import {
  buildWebsiteFormAdminQuote,
  IRISH_VAT_REDUCED_TOURISM_RATE,
  IRISH_VAT_STANDARD_RATE
} from './package-build'
import { GOLFSOL_BRAND_LOGO_HOSTED } from './brand-logo-assets'

export type TransferReceiptVatTreatment = 'tourism' | 'services' | null | undefined

export const vatRateForTransferTreatment = (t: TransferReceiptVatTreatment): number => {
  if (t === 'services') {
    return IRISH_VAT_STANDARD_RATE
  }
  return IRISH_VAT_REDUCED_TOURISM_RATE
}

const formatEur = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

const pctLabel = (rate: number) => `${(rate * 100).toFixed(1).replace(/\.0$/, '')}%`

export type TransferReceiptPdfTransfer = {
  readonly id: string
  readonly pickup_label: string
  readonly dropoff_label: string
  readonly status: string
  readonly scheduled_at: string | null
  readonly admin_price_eur?: number | null
  readonly admin_price_vat_treatment?: TransferReceiptVatTreatment
  readonly payment_status?: string | null
  readonly booking_source?: string | null
}

const THEME = {
  green: rgb(6 / 255, 59 / 255, 42 / 255),
  greenLight: rgb(15 / 255, 81 / 255, 60 / 255),
  ink: rgb(22 / 255, 35 / 255, 29 / 255),
  muted: rgb(102 / 255, 115 / 255, 109 / 255),
  white: rgb(1, 1, 1),
  rule: rgb(200 / 255, 210 / 255, 205 / 255),
  stripe: rgb(247 / 255, 250 / 255, 248 / 255),
  payLink: rgb(0, 102 / 255, 204 / 255)
}

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 48
const CONTENT_W = PAGE_W - MARGIN * 2

function sanitize(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x00-\xFF]/g, '?')
}

async function loadLogoPng(): Promise<Uint8Array | null> {
  try {
    const res = await fetch(GOLFSOL_BRAND_LOGO_HOSTED)
    if (!res.ok) return null
    return new Uint8Array(await res.arrayBuffer())
  } catch {
    return null
  }
}

async function renderTransferPdf(opts: {
  readonly transfer: TransferReceiptPdfTransfer
  readonly customerName: string
  readonly accountRef: string | null
  readonly customerEmail?: string | null
  readonly bannerTitle: string
  readonly paymentLine: string
  readonly paySection: { readonly dashboardPayUrl: string } | null
  readonly footerNote: string
}): Promise<Uint8Array> {
  const gross = opts.transfer.admin_price_eur
  if (typeof gross !== 'number' || !Number.isFinite(gross) || gross <= 0) {
    throw new Error('No quoted amount on file for this transfer.')
  }

  const treatment = opts.transfer.admin_price_vat_treatment
  const rate = vatRateForTransferTreatment(treatment)
  const quote = buildWebsiteFormAdminQuote(gross, rate)
  const transfer = opts.transfer

  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const page = doc.addPage([PAGE_W, PAGE_H])

  // White page fill
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: THEME.white })

  // Green top rule
  page.drawRectangle({ x: 0, y: PAGE_H - 3, width: PAGE_W, height: 3, color: THEME.green })

  const topY = PAGE_H - 24

  // v5 header: "FROM PLANE TO FAIRWAY" + company info
  page.drawText('FROM PLANE TO FAIRWAY', { x: MARGIN, y: topY, font: fontBold, size: 9, color: THEME.green })
  page.drawText(sanitize('GolfSol Ireland - Irish-owned Costa del Sol Golf Travel'), {
    x: MARGIN, y: topY - 16, font, size: 8, color: THEME.muted
  })
  page.drawText(sanitize('www.golfsolirl.com - info@golfsolirl.com'), {
    x: MARGIN, y: topY - 28, font, size: 8, color: THEME.muted
  })
  page.drawText(sanitize('Registered in Ireland - Company No. 814210'), {
    x: MARGIN, y: topY - 40, font, size: 8, color: THEME.muted
  })

  // Logo crest (top-right)
  const logoBytes = await loadLogoPng()
  if (logoBytes) {
    try {
      const logoImage = await doc.embedPng(logoBytes)
      const lh = 60
      const lw = (logoImage.width / logoImage.height) * lh
      page.drawImage(logoImage, { x: PAGE_W - MARGIN - lw, y: topY - lh + 10, width: lw, height: lh })
    } catch { /* logo optional */ }
  }

  // Rule below header
  const ruleY = topY - 52
  page.drawRectangle({ x: MARGIN, y: ruleY, width: CONTENT_W, height: 0.75, color: THEME.rule })

  // Document title
  page.drawText(sanitize(opts.bannerTitle), { x: MARGIN, y: ruleY - 22, font: fontBold, size: 16, color: THEME.green })

  let y = ruleY - 48

  // Bill to
  page.drawText('Bill to', { x: MARGIN, y, font: fontBold, size: 11, color: THEME.greenLight })
  y -= 16
  page.drawText(sanitize(opts.customerName.trim() || 'Guest'), { x: MARGIN, y, font, size: 10.5, color: THEME.ink })
  y -= 14
  if (opts.customerEmail?.trim()) {
    page.drawText(sanitize(opts.customerEmail.trim()), { x: MARGIN, y, font, size: 10, color: THEME.muted })
    y -= 14
  }
  if (opts.accountRef?.trim()) {
    page.drawText(sanitize(`Account: ${opts.accountRef.trim()}`), { x: MARGIN, y, font, size: 9.5, color: THEME.muted })
    y -= 20
  } else {
    y -= 10
  }

  // Green rule separator
  page.drawRectangle({ x: MARGIN, y: y - 1, width: CONTENT_W * 0.3, height: 2, color: THEME.green })
  page.drawRectangle({ x: MARGIN + CONTENT_W * 0.3 + 6, y: y - 0.5, width: CONTENT_W * 0.7 - 6, height: 0.5, color: THEME.rule })
  y -= 24

  // Transfer details card
  const cardH = 110
  page.drawRectangle({ x: MARGIN, y: y - cardH, width: CONTENT_W, height: cardH, color: THEME.white, borderColor: THEME.rule, borderWidth: 0.75 })
  const cardTop = y
  y -= 18
  page.drawText('TRANSFER DETAILS', { x: MARGIN + 14, y, font: fontBold, size: 8, color: THEME.greenLight })
  y -= 16
  page.drawText(sanitize(`${transfer.pickup_label}  ->  ${transfer.dropoff_label}`), { x: MARGIN + 14, y, font: fontBold, size: 11, color: THEME.ink })
  y -= 16
  const when = transfer.scheduled_at
    ? new Date(transfer.scheduled_at).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Pick-up time to be confirmed'
  page.drawText(sanitize(`Timing: ${when}`), { x: MARGIN + 14, y, font, size: 10, color: THEME.muted })
  y -= 14
  const src = transfer.booking_source === 'website_enquiry' ? 'Website enquiry'
    : transfer.booking_source === 'client_dashboard' ? 'Client dashboard / trip planner'
    : 'Client dashboard'
  page.drawText(sanitize(`Source: ${src}`), { x: MARGIN + 14, y, font, size: 10, color: THEME.muted })
  y -= 14
  page.drawText(sanitize(`Payment: ${opts.paymentLine}`), { x: MARGIN + 14, y, font, size: 10, color: THEME.muted })
  y -= 14
  page.drawText(sanitize(`Reference: ${transfer.id}`), { x: MARGIN + 14, y, font, size: 8, color: THEME.muted })

  y = cardTop - cardH - 22

  // VAT summary card
  const vatCardH = 108
  page.drawRectangle({ x: MARGIN, y: y - vatCardH, width: CONTENT_W, height: vatCardH, color: THEME.stripe, borderColor: THEME.rule, borderWidth: 0.5 })
  const vatTop = y
  y -= 18
  page.drawText('VAT SUMMARY (IRISH VAT)', { x: MARGIN + 14, y, font: fontBold, size: 8, color: THEME.greenLight })
  y -= 16

  const treatmentLabel = treatment === 'services'
    ? `Standard rate (${pctLabel(IRISH_VAT_STANDARD_RATE)}) - passenger transport / services`
    : `Reduced tourism-related rate (${pctLabel(IRISH_VAT_REDUCED_TOURISM_RATE)})`
  page.drawText(sanitize(`Treatment: ${treatmentLabel}`), { x: MARGIN + 14, y, font, size: 10, color: THEME.ink })
  y -= 14
  page.drawText('Total quoted is VAT-inclusive (gross).', { x: MARGIN + 14, y, font, size: 9.5, color: THEME.muted })
  y -= 18
  page.drawText(sanitize(`Net (ex VAT): ${formatEur(quote.netServicesEur)}`), { x: MARGIN + 14, y, font, size: 10.5, color: THEME.ink })
  y -= 14
  page.drawText(sanitize(`VAT @ ${pctLabel(rate)}: ${formatEur(quote.vatAmountEur)}`), { x: MARGIN + 14, y, font, size: 10.5, color: THEME.ink })
  y -= 16
  page.drawText(sanitize(`Total (incl. VAT): ${formatEur(quote.grossTotalEur)}`), { x: MARGIN + 14, y, font: fontBold, size: 12, color: THEME.green })

  y = vatTop - vatCardH - 22

  // Pay section
  if (opts.paySection) {
    const payCardH = 82
    page.drawRectangle({ x: MARGIN, y: y - payCardH, width: CONTENT_W, height: payCardH, color: THEME.stripe, borderColor: THEME.rule, borderWidth: 0.5 })
    const py = y
    y -= 18
    page.drawText('PAY ONLINE (SECURE CARD PAYMENT)', { x: MARGIN + 14, y, font: fontBold, size: 8, color: THEME.greenLight })
    y -= 16
    page.drawText(sanitize('Sign in to your client dashboard and use Pay now next to this transfer.'), { x: MARGIN + 14, y, font, size: 9.5, color: THEME.ink })
    y -= 14
    page.drawText(sanitize('Most PDF viewers turn the URL below into a clickable link.'), { x: MARGIN + 14, y, font, size: 9, color: THEME.muted })
    y -= 16
    page.drawText(sanitize(opts.paySection.dashboardPayUrl), { x: MARGIN + 14, y, font: fontBold, size: 9.5, color: THEME.payLink })
    y = py - payCardH - 18
  }

  // v5 footer
  page.drawRectangle({ x: MARGIN, y: 48, width: CONTENT_W, height: 0.5, color: THEME.rule })
  page.drawText('-- 1 of 1 --', { x: PAGE_W / 2 - 22, y: 34, font, size: 9, color: THEME.muted })
  page.drawText(sanitize('GolfSol Ireland - Irish-owned Costa del Sol Golf Travel'), {
    x: MARGIN, y: 22, font, size: 7.5, color: THEME.muted
  })
  page.drawText(sanitize(opts.footerNote), {
    x: MARGIN, y: 12, font, size: 7.5, color: THEME.muted, maxWidth: CONTENT_W * 0.85
  })

  return doc.save()
}

function downloadBlob(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 200)
}

/**
 * Pre-payment quote + VAT breakdown. Includes dashboard URL so guests can open Pay now (Stripe) from the PDF.
 */
export async function downloadTransferQuotePdf(opts: {
  readonly transfer: TransferReceiptPdfTransfer
  readonly customerName: string
  readonly accountRef: string | null
  readonly customerEmail?: string | null
  readonly dashboardPayUrl: string
}): Promise<void> {
  const pay = (opts.transfer.payment_status ?? 'unpaid').toLowerCase()
  const payLine =
    pay === 'paid'
      ? 'Paid in full'
      : pay === 'deposit'
        ? 'Deposit recorded - balance outstanding'
        : 'Outstanding - quote only until paid'

  const bytes = await renderTransferPdf({
    transfer: opts.transfer,
    customerName: opts.customerName,
    accountRef: opts.accountRef,
    customerEmail: opts.customerEmail,
    bannerTitle: 'Transfer quote & VAT summary',
    paymentLine: payLine,
    paySection: { dashboardPayUrl: opts.dashboardPayUrl.trim() },
    footerNote:
      'This document is a VAT-transparent quote for this transfer. Payment is due according to your dashboard; after payment you can download a separate paid invoice PDF from the same place.'
  })

  downloadBlob(bytes, `golfsol-transfer-quote-${opts.transfer.id.slice(0, 8)}.pdf`)
}

/**
 * Post-payment invoice + VAT breakdown (no pay link — payment already recorded).
 */
export async function downloadTransferPaidInvoicePdf(opts: {
  readonly transfer: TransferReceiptPdfTransfer
  readonly customerName: string
  readonly accountRef: string | null
  readonly customerEmail?: string | null
  readonly paymentRecordedHint?: string | null
}): Promise<void> {
  const pay = (opts.transfer.payment_status ?? 'unpaid').toLowerCase()
  if (pay !== 'paid') {
    throw new Error('This transfer is not marked as paid yet — use the quote PDF until payment completes.')
  }

  let paymentLine = 'Paid in full (thank you)'
  const hint = opts.paymentRecordedHint?.trim()
  if (hint) {
    paymentLine = `Paid in full - ${hint}`
  }

  const bytes = await renderTransferPdf({
    transfer: opts.transfer,
    customerName: opts.customerName,
    accountRef: opts.accountRef,
    customerEmail: opts.customerEmail,
    bannerTitle: 'Paid transfer invoice & VAT summary',
    paymentLine,
    paySection: null,
    footerNote:
      'Paid invoice for your records (Irish VAT breakdown shown for transparency). For accounting questions, retain this PDF alongside your card receipt from Stripe.'
  })

  downloadBlob(bytes, `golfsol-transfer-invoice-paid-${opts.transfer.id.slice(0, 8)}.pdf`)
}

/**
 * @deprecated Prefer {@link downloadTransferQuotePdf} or {@link downloadTransferPaidInvoicePdf}.
 */
export async function downloadTransferVatReceiptPdf(opts: {
  readonly transfer: TransferReceiptPdfTransfer
  readonly customerName: string
  readonly accountRef: string | null
  readonly customerEmail?: string | null
}): Promise<void> {
  const origin =
    typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://golfsolirl.com'
  await downloadTransferQuotePdf({
    ...opts,
    dashboardPayUrl: `${origin.replace(/\/+$/, '')}/dashboard`
  })
}
