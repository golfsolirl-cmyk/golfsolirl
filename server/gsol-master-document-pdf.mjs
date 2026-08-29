/**
 * One Golf Sol master PDF for enquiries, quotes, bookings, invoices, and receipts.
 * Shares the full-company letterhead in gsol-unified-pdf-template.mjs.
 */
import { PDFDocument } from 'pdf-lib'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { pdfEmailTheme } from './pdf-email-brand.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  drawUnifiedDocumentFooter,
  drawUnifiedDocumentHeader,
  drawUnifiedGoldRule,
  drawUnifiedKeyValueTable,
  drawUnifiedParagraphBlock,
  drawUnifiedSectionHeading,
  embedUnifiedLogo,
  loadUnifiedPdfFonts
} from './gsol-unified-pdf-template.mjs'

export const GSOL_MASTER_PDF_KINDS = {
  enquiry: { kicker: 'Enquiry', title: 'Enquiry' },
  quotation: { kicker: 'Quotation', title: 'Quotation' },
  proposal: { kicker: 'Proposal', title: 'Proposal' },
  booking_confirmation: { kicker: 'Booking', title: 'Booking confirmation' },
  invoice: { kicker: 'Invoice', title: 'Invoice' },
  deposit_receipt: { kicker: 'Receipt', title: 'Deposit receipt' },
  payment_receipt: { kicker: 'Receipt', title: 'Payment receipt' },
  paid_in_full: { kicker: 'Receipt', title: 'Paid in full' }
}

const slug = (value, fallback) =>
  String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || fallback

/**
 * @param {{
 *   kind: keyof typeof GSOL_MASTER_PDF_KINDS
 *   title?: string
 *   subtitle?: string
 *   reference?: string
 *   dateLabel?: string
 *   customerName?: string
 *   customerEmail?: string
 *   customerPhone?: string
 *   accountRef?: string
 *   rows?: { label: string, value: string }[]
 *   amountLabel?: string
 *   amountValue?: string
 *   notes?: string
 *   filename?: string
 * }} input
 * @returns {Promise<{ filename: string, bytes: Uint8Array }>}
 */
export const buildGsolMasterDocumentPdf = async (input) => {
  const kind = GSOL_MASTER_PDF_KINDS[input.kind] ? input.kind : 'enquiry'
  const meta = GSOL_MASTER_PDF_KINDS[kind]
  const title = String(input.title ?? meta.title).trim() || meta.title
  const subtitle = String(input.subtitle ?? '').trim()
  const doc = await PDFDocument.create()
  const ctx = { ...(await loadUnifiedPdfFonts(doc)), ...(await embedUnifiedLogo(doc)) }
  const { pageWidth, pageHeight } = UNIFIED_PDF_LAYOUT
  const page = doc.addPage([pageWidth, pageHeight])

  let y = drawUnifiedDocumentHeader(page, ctx, {
    kicker: meta.kicker,
    title,
    subtitle
  })

  const party = [
    input.customerName ? { label: 'Prepared for', value: input.customerName } : null,
    input.customerEmail ? { label: 'Email', value: input.customerEmail } : null,
    input.customerPhone ? { label: 'Phone', value: input.customerPhone } : null,
    input.accountRef ? { label: 'Account', value: input.accountRef } : null,
    input.reference ? { label: 'Reference', value: input.reference } : null,
    input.dateLabel ? { label: 'Date', value: input.dateLabel } : null
  ].filter(Boolean)

  if (party.length) {
    y = drawUnifiedSectionHeading(page, y, ctx, 'Customer')
    y = drawUnifiedKeyValueTable(page, y, ctx, party)
    y -= 8
  }

  const extraRows = Array.isArray(input.rows) ? input.rows.filter((row) => row?.label && String(row.value ?? '').trim()) : []
  if (extraRows.length) {
    y = drawUnifiedGoldRule(page, y)
    y = drawUnifiedSectionHeading(page, y, ctx, 'Details')
    y = drawUnifiedKeyValueTable(page, y, ctx, extraRows)
    y -= 8
  }

  if (input.amountLabel && input.amountValue) {
    y = drawUnifiedGoldRule(page, y)
    y = drawUnifiedSectionHeading(page, y, ctx, 'Amount')
    y = drawUnifiedKeyValueTable(page, y, ctx, [{ label: input.amountLabel, value: input.amountValue }])
    y -= 8
  }

  if (String(input.notes ?? '').trim()) {
    y = drawUnifiedGoldRule(page, y)
    y = drawUnifiedSectionHeading(page, y, ctx, 'Notes')
    y = drawUnifiedParagraphBlock(page, y, ctx, sanitizeStandardFontText(input.notes), {
      size: 11,
      lineHeight: 15,
      color: pdfEmailTheme.ink
    })
  }

  drawUnifiedDocumentFooter(page, 52, ctx, [], { current: 1, total: 1 })

  const filename = input.filename || `golfsol-${slug(kind, 'document')}.pdf`
  return { filename, bytes: await doc.save() }
}
