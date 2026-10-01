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
  drawUnifiedParagraphBlockPaginated,
  drawUnifiedSectionHeading,
  embedUnifiedLogo,
  estimateUnifiedKeyValueTableHeight,
  loadUnifiedPdfFonts,
  unifiedPdfMinBodyY
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
  const minY = unifiedPdfMinBodyY()
  const pages = []

  const openPage = (continued) => {
    const next = doc.addPage([pageWidth, pageHeight])
    pages.push(next)
    const nextY = drawUnifiedDocumentHeader(next, ctx, {
      kicker: meta.kicker,
      title: continued ? `${title} (continued)` : title,
      subtitle: continued ? '' : subtitle,
      compact: continued
    })
    return { page: next, y: nextY }
  }

  let state = openPage(false)

  const ensure = (needed) => {
    if (state.y - needed >= minY) return
    state = openPage(true)
  }

  let hasSection = false
  const drawRows = (heading, rows) => {
    if (!rows.length) return
    ensure(72)
    if (hasSection) state.y = drawUnifiedGoldRule(state.page, state.y)
    hasSection = true
    state.y = drawUnifiedSectionHeading(state.page, state.y, ctx, heading)
    for (const row of rows) {
      const height = estimateUnifiedKeyValueTableHeight(ctx, [row])
      ensure(height + 8)
      state.y = drawUnifiedKeyValueTable(state.page, state.y, ctx, [row])
    }
    state.y -= 8
  }

  const party = [
    input.customerName ? { label: 'Prepared for', value: input.customerName } : null,
    input.customerEmail ? { label: 'Email', value: input.customerEmail } : null,
    input.customerPhone ? { label: 'Phone', value: input.customerPhone } : null,
    input.accountRef ? { label: 'Account', value: input.accountRef } : null,
    input.reference ? { label: 'Reference', value: input.reference } : null,
    input.dateLabel ? { label: 'Date', value: input.dateLabel } : null
  ].filter(Boolean)

  if (party.length) drawRows('Customer', party)

  const extraRows = Array.isArray(input.rows) ? input.rows.filter((row) => row?.label && String(row.value ?? '').trim()) : []
  if (extraRows.length) drawRows('Details', extraRows)

  if (input.amountLabel && input.amountValue) {
    drawRows('Amount', [{ label: input.amountLabel, value: input.amountValue }])
  }

  const notes = sanitizeStandardFontText(String(input.notes ?? '').trim())
  if (notes) {
    ensure(80)
    if (hasSection) state.y = drawUnifiedGoldRule(state.page, state.y)
    state.y = drawUnifiedSectionHeading(state.page, state.y, ctx, 'Notes')
    const drawn = drawUnifiedParagraphBlockPaginated(
      state.page,
      state.y,
      ctx,
      notes,
      { size: 11, lineHeight: 16, color: pdfEmailTheme.ink, minY },
      {
        ensureSpace: () => {
          state = openPage(true)
          return state
        }
      }
    )
    state.page = drawn.page
    state.y = drawn.y
  }

  pages.forEach((pdfPage, index) => {
    drawUnifiedDocumentFooter(pdfPage, 52, ctx, [], { current: index + 1, total: pages.length })
  })

  const filename = input.filename || `golfsol-${slug(kind, 'document')}.pdf`
  return { filename, bytes: await doc.save() }
}
