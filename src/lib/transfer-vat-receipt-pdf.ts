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

/**
 * Branded A4 receipt (Irish VAT breakdown from VAT-inclusive gross). Opens print/save dialog via jsPDF.
 */
export async function downloadTransferVatReceiptPdf(opts: {
  readonly transfer: TransferReceiptPdfTransfer
  readonly customerName: string
  readonly accountRef: string | null
  readonly customerEmail?: string | null
}): Promise<void> {
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

  const ink: [number, number, number] = [22, 59, 42]
  const muted: [number, number, number] = [75, 95, 85]
  const gold: [number, number, number] = [217, 154, 0]

  try {
    const res = await fetch('/images/golfsol-header-logo-bitmap.png')
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
  doc.text('Transfer receipt & VAT summary', margin, 46)

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
  const route = `${opts.transfer.pickup_label} → ${opts.transfer.dropoff_label}`
  doc.text(route, margin + 14, y)
  y += 14
  const when = opts.transfer.scheduled_at
    ? new Date(opts.transfer.scheduled_at).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Pick-up time to be confirmed'
  doc.text(`Timing: ${when}`, margin + 14, y)
  y += 14
  const src =
    opts.transfer.booking_source === 'website_enquiry'
      ? 'Website enquiry'
      : opts.transfer.booking_source === 'client_dashboard'
        ? 'Client dashboard / trip planner'
        : 'Client dashboard'
  doc.text(`Source: ${src}`, margin + 14, y)
  y += 14
  doc.text(`Status: ${opts.transfer.status.replace(/_/g, ' ')}`, margin + 14, y)
  y += 14
  const pay = (opts.transfer.payment_status ?? 'unpaid').toLowerCase()
  doc.text(`Payment: ${pay === 'paid' ? 'Paid in full' : pay === 'deposit' ? 'Deposit recorded' : 'Outstanding'}`, margin + 14, y)
  y += 14
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(muted[0], muted[1], muted[2])
  doc.setFontSize(8)
  doc.text(`Reference: ${opts.transfer.id}`, margin + 14, y)
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
  y += 36

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(muted[0], muted[1], muted[2])
  const foot =
    'Golf Sol Ireland · Irish VAT shown for transparency. Confirm specifics with your accountant. This receipt reflects our desk quote for this transfer only.'
  const splitFoot = doc.splitTextToSize(foot, pageW - margin * 2)
  doc.text(splitFoot, margin, y)

  doc.save(`golfsol-transfer-receipt-${opts.transfer.id.slice(0, 8)}.pdf`)
}
