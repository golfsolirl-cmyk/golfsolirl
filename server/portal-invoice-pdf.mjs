import { buildGsolMasterDocumentPdf } from './gsol-master-document-pdf.mjs'

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
  const issued = new Date(input.issuedAtIso || Date.now()).toLocaleString('en-IE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
  const { bytes } = await buildGsolMasterDocumentPdf({
    kind: 'invoice',
    subtitle: 'Amount due for your Golf Sol Ireland trip. This is not a VAT receipt until payment is confirmed.',
    reference: input.invoiceNumber,
    dateLabel: issued,
    customerName: input.clientName,
    customerEmail: input.clientEmail,
    accountRef: input.accountReferenceDisplay || input.enquiryReferenceId,
    rows: [
      { label: 'Enquiry reference', value: input.enquiryReferenceId },
      { label: 'Invoice number', value: input.invoiceNumber }
    ],
    amountLabel: 'Amount due',
    amountValue: fmtEur(input.amountCents),
    notes:
      'Pay via the link in your client dashboard or contact info@golfsolirl.com. Irish VAT treatment follows your written proposal.',
    filename: `golfsol-invoice-${String(input.invoiceNumber || 'trip').replace(/[^\w.-]+/g, '-')}.pdf`
  })
  return bytes
}
