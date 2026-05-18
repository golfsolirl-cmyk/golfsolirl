import { jsPDF } from 'jspdf'
import {
  buildWebsiteFormAdminQuote,
  IRISH_VAT_REDUCED_TOURISM_RATE,
  IRISH_VAT_STANDARD_RATE
} from './package-build'

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

type TransferDocTheme = {
  readonly ink: [number, number, number]
  readonly muted: [number, number, number]
  readonly gold: [number, number, number]
  readonly payLink: [number, number, number]
}

const THEME: TransferDocTheme = {
  ink: [22, 59, 42],
  muted: [75, 95, 85],
  gold: [250, 232, 46],
  payLink: [0, 102, 204]
}

/** Load logo and draw PDF body (shared layout). */
async function renderTransferVatPdf(opts: {
  readonly transfer: TransferReceiptPdfTransfer
  readonly customerName: string
  readonly accountRef: string | null
  readonly customerEmail?: string | null
  readonly bannerTitle: string
  readonly paymentLine: string
  readonly paySection: { readonly dashboardPayUrl: string } | null
  readonly footerNote: string
}): Promise<jsPDF> {
  const gross = opts.transfer.admin_price_eur
  if (typeof gross !== 'number' || !Number.isFinite(gross) || gross <= 0) {
    throw new Error('No quoted amount on file for this transfer.')
  }

  const treatment = opts.transfer.admin_price_vat_treatment
  const rate = vatRateForTransferTreatment(treatment)
  const quote = buildWebsiteFormAdminQuote(gross, rate)

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 48

  let y = margin
  const { ink, muted, gold, payLink } = THEME
  const transfer = opts.transfer

  try {
    const res = await fetch('/golfsol-crest-footer.png')
    if (res.ok) {
      const blob = await res.blob()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.onerror = () => reject(new Error('read'))
        r.readAsDataURL(blob)
      })
      const logoW = 132
      const logoH = 36
      doc.addImage(dataUrl, 'PNG', margin, y, logoW, logoH)
      y += logoH + 18
    }
  } catch {
    y += 6
  }

  doc.setFillColor(ink[0], ink[1], ink[2])
  doc.rect(0, 0, pageW, 72, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(opts.bannerTitle, margin, 46)

  y = 92
  doc.setTextColor(ink[0], ink[1], ink[2])
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Issued ${new Date().toLocaleString('en-IE', { dateStyle: 'long', timeStyle: 'short' })}`, margin, y)
  y += 18

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Bill to', margin, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(opts.customerName.trim() || 'Guest', margin, y)
  y += 14
  if (opts.customerEmail?.trim()) {
    doc.text(opts.customerEmail.trim(), margin, y)
    y += 14
  }
  if (opts.accountRef?.trim()) {
    doc.setTextColor(muted[0], muted[1], muted[2])
    doc.text(`Account: ${opts.accountRef.trim()}`, margin, y)
    doc.setTextColor(ink[0], ink[1], ink[2])
    y += 20
  } else {
    y += 10
  }

  doc.setDrawColor(220, 232, 220)
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, y, pageW - margin * 2, 120, 6, 6, 'S')
  y += 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(ink[0], ink[1], ink[2])
  doc.text('Transfer details', margin + 14, y)
  y += 18
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const route = `${transfer.pickup_label} → ${transfer.dropoff_label}`
  doc.text(route, margin + 14, y)
  y += 14
  const when = transfer.scheduled_at
    ? new Date(transfer.scheduled_at).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Pick-up time to be confirmed'
  doc.text(`Timing: ${when}`, margin + 14, y)
  y += 14
  const src =
    transfer.booking_source === 'website_enquiry'
      ? 'Website enquiry'
      : transfer.booking_source === 'client_dashboard'
        ? 'Client dashboard / trip planner'
        : 'Client dashboard'
  doc.text(`Source: ${src}`, margin + 14, y)
  y += 14
  doc.text(`Status: ${transfer.status.replace(/_/g, ' ')}`, margin + 14, y)
  y += 14
  doc.text(`Payment: ${opts.paymentLine}`, margin + 14, y)
  y += 14
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(muted[0], muted[1], muted[2])
  doc.setFontSize(8)
  doc.text(`Reference: ${transfer.id}`, margin + 14, y)
  doc.setTextColor(ink[0], ink[1], ink[2])
  y += 28

  doc.setFillColor(246, 251, 248)
  doc.roundedRect(margin, y, pageW - margin * 2, 118, 6, 6, 'F')
  doc.setDrawColor(211, 219, 207)
  doc.roundedRect(margin, y, pageW - margin * 2, 118, 6, 6, 'S')
  y += 20
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(ink[0], ink[1], ink[2])
  doc.text('VAT summary (Irish VAT)', margin + 14, y)
  y += 18
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const treatmentLabel =
    treatment === 'services'
      ? `Standard rate (${pctLabel(IRISH_VAT_STANDARD_RATE)}) — passenger transport / services`
      : `Reduced tourism-related rate (${pctLabel(IRISH_VAT_REDUCED_TOURISM_RATE)})`

  doc.text(`Treatment: ${treatmentLabel}`, margin + 14, y)
  y += 16
  doc.text('Total quoted is VAT-inclusive (gross).', margin + 14, y)
  y += 18

  doc.text(`Net (ex VAT): ${formatEur(quote.netServicesEur)}`, margin + 14, y)
  y += 14
  doc.text(`VAT @ ${pctLabel(rate)}: ${formatEur(quote.vatAmountEur)}`, margin + 14, y)
  y += 14
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(gold[0], gold[1], gold[2])
  doc.text(`Total (incl. VAT): ${formatEur(quote.grossTotalEur)}`, margin + 14, y)
  doc.setTextColor(ink[0], ink[1], ink[2])
  y += 28

  if (opts.paySection) {
    doc.setFillColor(255, 251, 235)
    doc.roundedRect(margin, y, pageW - margin * 2, 92, 6, 6, 'F')
    doc.setDrawColor(234, 214, 170)
    doc.roundedRect(margin, y, pageW - margin * 2, 92, 6, 6, 'S')
    y += 18
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(ink[0], ink[1], ink[2])
    doc.text('Pay online (secure card payment)', margin + 14, y)
    y += 16
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const payLines = doc.splitTextToSize(
      'Sign in to your client dashboard and use Pay now next to this transfer. Most PDF viewers turn the URL below into a clickable link.',
      pageW - margin * 2 - 28
    )
    doc.text(payLines, margin + 14, y)
    y += 14 * payLines.length + 4
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(payLink[0], payLink[1], payLink[2])
    const urlLines = doc.splitTextToSize(opts.paySection.dashboardPayUrl, pageW - margin * 2 - 28)
    doc.text(urlLines, margin + 14, y)
    doc.setTextColor(ink[0], ink[1], ink[2])
    y += 14 * urlLines.length + 18
  } else {
    y += 12
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(muted[0], muted[1], muted[2])
  const splitFoot = doc.splitTextToSize(opts.footerNote, pageW - margin * 2)
  doc.text(splitFoot, margin, y)

  return doc
}

/**
 * Pre-payment quote + VAT breakdown. Includes dashboard URL so guests can open Pay now (Stripe) from the PDF.
 */
export async function downloadTransferQuotePdf(opts: {
  readonly transfer: TransferReceiptPdfTransfer
  readonly customerName: string
  readonly accountRef: string | null
  readonly customerEmail?: string | null
  /** Full URL to the client dashboard (e.g. https://golfsolirl.com/dashboard or http://localhost:5173/dashboard). */
  readonly dashboardPayUrl: string
}): Promise<void> {
  const pay = (opts.transfer.payment_status ?? 'unpaid').toLowerCase()
  const payLine =
    pay === 'paid'
      ? 'Paid in full'
      : pay === 'deposit'
        ? 'Deposit recorded — balance outstanding'
        : 'Outstanding — quote only until paid'

  const doc = await renderTransferVatPdf({
    transfer: opts.transfer,
    customerName: opts.customerName,
    accountRef: opts.accountRef,
    customerEmail: opts.customerEmail,
    bannerTitle: 'Transfer quote & VAT summary',
    paymentLine: payLine,
    paySection: { dashboardPayUrl: opts.dashboardPayUrl.trim() },
    footerNote:
      'Golf Sol Ireland · This document is a VAT-transparent quote for this transfer. Payment is due according to your dashboard; after payment you can download a separate paid invoice PDF from the same place.'
  })

  doc.save(`golfsol-transfer-quote-${opts.transfer.id.slice(0, 8)}.pdf`)
}

/**
 * Post-payment invoice + VAT breakdown (no pay link — payment already recorded).
 */
export async function downloadTransferPaidInvoicePdf(opts: {
  readonly transfer: TransferReceiptPdfTransfer
  readonly customerName: string
  readonly accountRef: string | null
  readonly customerEmail?: string | null
  /** Optional note under Payment (e.g. booking row updated_at from Supabase). */
  readonly paymentRecordedHint?: string | null
}): Promise<void> {
  const pay = (opts.transfer.payment_status ?? 'unpaid').toLowerCase()
  if (pay !== 'paid') {
    throw new Error('This transfer is not marked as paid yet — use the quote PDF until payment completes.')
  }

  let paymentLine = 'Paid in full (thank you)'
  const hint = opts.paymentRecordedHint?.trim()
  if (hint) {
    paymentLine = `Paid in full · ${hint}`
  }

  const doc = await renderTransferVatPdf({
    transfer: opts.transfer,
    customerName: opts.customerName,
    accountRef: opts.accountRef,
    customerEmail: opts.customerEmail,
    bannerTitle: 'Paid transfer invoice & VAT summary',
    paymentLine,
    paySection: null,
    footerNote:
      'Golf Sol Ireland · Paid invoice for your records (Irish VAT breakdown shown for transparency). For accounting questions, retain this PDF alongside your card receipt from Stripe.'
  })

  doc.save(`golfsol-transfer-invoice-paid-${opts.transfer.id.slice(0, 8)}.pdf`)
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
