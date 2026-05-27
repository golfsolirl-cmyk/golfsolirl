import { PDFDocument } from 'pdf-lib'
import { pdfEmailTheme } from './pdf-email-brand.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  drawUnifiedDocumentFooter,
  drawUnifiedDocumentHeader,
  drawUnifiedKeyValueTable,
  drawUnifiedSectionHeading,
  embedUnifiedLogo,
  loadUnifiedPdfFonts
} from './gsol-unified-pdf-template.mjs'

const formatEur = (n) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n)

/**
 * @param {object} opts
 * @param {string} opts.customerLabel
 * @param {string} opts.route
 * @param {string} opts.bookingId
 * @param {number} opts.refundAmountEur
 * @param {'partial'|'full'} opts.refundKind
 * @param {number} opts.cumulativeRefundedEur
 * @param {string} [opts.stripeRefundId]
 * @param {string} [opts.stripePaymentIntentId]
 */
export const buildTransferRefundPdfBytes = async (opts) => {
  const doc = await PDFDocument.create()
  const { pageWidth, pageHeight } = UNIFIED_PDF_LAYOUT
  const ctx = { ...(await loadUnifiedPdfFonts(doc)), ...(await embedUnifiedLogo(doc)) }
  const page = doc.addPage([pageWidth, pageHeight])

  let y = drawUnifiedDocumentHeader(page, ctx, {
    title: 'Refund confirmation',
    subtitle: 'Your card refund for a Golf Sol Ireland private transfer.'
  })

  y = drawUnifiedSectionHeading(page, y - 6, ctx, 'Refund summary')
  const rows = [
    { label: 'Guest', value: opts.customerLabel || 'Guest' },
    { label: 'Transfer', value: opts.route },
    { label: 'Reference', value: opts.bookingId },
    {
      label: 'This refund',
      value: formatEur(opts.refundAmountEur)
    },
    {
      label: 'Type',
      value: opts.refundKind === 'full' ? 'Full refund (card)' : 'Partial refund (card)'
    },
    {
      label: 'Total refunded',
      value: formatEur(opts.cumulativeRefundedEur)
    }
  ]
  if (opts.stripeRefundId) {
    rows.push({ label: 'Stripe refund', value: opts.stripeRefundId })
  }
  if (opts.stripePaymentIntentId) {
    rows.push({ label: 'Original payment', value: opts.stripePaymentIntentId })
  }

  y = drawUnifiedKeyValueTable(page, y, ctx, rows)

  const { margin } = UNIFIED_PDF_LAYOUT
  page.drawText('Card refunds are processed by Stripe and typically appear within several business days.', {
    x: margin,
    y: y - 18,
    font: ctx.font,
    size: 11,
    color: pdfEmailTheme.muted
  })

  drawUnifiedDocumentFooter(page, 52, ctx, [], { current: 1, total: 1 })

  return Buffer.from(await doc.save())
}
