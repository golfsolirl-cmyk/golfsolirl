import { PDFDocument } from 'pdf-lib'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { pdfEmailTheme } from './pdf-email-brand.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  drawUnifiedDocumentFooter,
  drawUnifiedDocumentHeader,
  drawUnifiedGoldRule,
  drawUnifiedKeyValueTable,
  drawUnifiedSectionHeading,
  embedUnifiedLogo,
  loadUnifiedPdfFonts
} from './gsol-unified-pdf-template.mjs'

const fmtEur = (cents) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format((Number(cents) || 0) / 100)

/**
 * @param {{
 *   invoiceNumber: string
 *   enquiryReferenceId: string
 *   accountReferenceDisplay: string
 *   clientName: string
 *   clientEmail: string
 *   amountCents: number
 *   issuedAtIso: string
 * }} input
 * @returns {Promise<Uint8Array>}
 */
export const buildPortalInvoicePdfBytes = async (input) => {
  const doc = await PDFDocument.create()
  const { pageWidth, pageHeight } = UNIFIED_PDF_LAYOUT
  const ctx = { ...(await loadUnifiedPdfFonts(doc)), ...(await embedUnifiedLogo(doc)) }
  const page = doc.addPage([pageWidth, pageHeight])

  const issued = new Date(input.issuedAtIso || Date.now()).toLocaleString('en-IE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })

  let y = drawUnifiedDocumentHeader(page, ctx, {
    title: 'Trip invoice',
    subtitle: 'Amount due for your Golf Sol Ireland trip desk. This is not a VAT receipt until payment is confirmed.'
  })

  y = drawUnifiedSectionHeading(page, y - 6, ctx, 'Invoice details')
  y = drawUnifiedKeyValueTable(page, y, ctx, [
    { label: 'Invoice number', value: input.invoiceNumber },
    { label: 'Account reference', value: input.accountReferenceDisplay || input.enquiryReferenceId },
    { label: 'Enquiry reference', value: input.enquiryReferenceId },
    { label: 'Client name', value: input.clientName },
    { label: 'Client email', value: input.clientEmail },
    { label: 'Issued', value: issued },
    { label: 'Amount due', value: fmtEur(input.amountCents) }
  ])

  y = drawUnifiedGoldRule(page, y - 8)
  y = drawUnifiedSectionHeading(page, y, ctx, 'Payment')
  y -= 4
  const note = sanitizeStandardFontText(
    'Pay via the link in your client dashboard or contact info@golfsolirl.com. Irish VAT treatment follows your written proposal.'
  )
  const { margin } = UNIFIED_PDF_LAYOUT
  page.drawText(note, {
    x: margin,
    y: y - 14,
    font: ctx.font,
    size: 11.5,
    color: pdfEmailTheme.ink
  })

  drawUnifiedDocumentFooter(page, 52, ctx, [], { current: 1, total: 1 })

  return doc.save()
}
