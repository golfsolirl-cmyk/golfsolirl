import { PDFDocument } from 'pdf-lib'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { CLIENT_DOCUMENT_COMPANY } from '../shared/client-enquiry-document.mjs'
import { normalizeMailQuotationPackage } from '../shared/admin-mail-quotation.mjs'
import { pdfEmailTheme } from './pdf-email-brand.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  drawUnifiedDocumentFooter,
  drawUnifiedDocumentHeader,
  drawUnifiedKeyValueTable,
  drawUnifiedSectionHeading,
  embedUnifiedLogo,
  estimateUnifiedKeyValueTableHeight,
  loadUnifiedPdfFonts,
  unifiedPdfMinBodyY,
  wrapPlainLinesWithFont
} from './gsol-unified-pdf-template.mjs'

const t = pdfEmailTheme
const PAGE_W = UNIFIED_PDF_LAYOUT.pageWidth
const PAGE_H = UNIFIED_PDF_LAYOUT.pageHeight
const MARGIN = UNIFIED_PDF_LAYOUT.margin
const CONTENT_W = PAGE_W - MARGIN * 2
const MIN_Y = unifiedPdfMinBodyY()
const ink = (text) => sanitizeStandardFontText(String(text ?? ''))

const slug = (value) =>
  String(value ?? '')
    .trim()
    .replace(/[^\w]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'quote'

const filledRows = (rows) =>
  rows
    .filter((row) => String(row.value ?? '').trim())
    .map((row) => ({ label: String(row.label).trim(), value: String(row.value).trim() }))

/**
 * Package quotation PDF in the Maura letter layout, on Golf Sol letterhead.
 * @param {{
 *   customerName?: string
 *   firstName?: string
 *   reference?: string
 *   quotation?: Record<string, string>
 * }} input
 */
export const buildAdminMailQuotationPdf = async (input = {}) => {
  const q = normalizeMailQuotationPackage(input.quotation)
  const customerName = String(input.customerName ?? '').trim()
  const firstName = String(input.firstName ?? '').trim() || customerName.split(/\s+/)[0] || 'there'
  const reference = String(input.reference ?? '').trim()

  const doc = await PDFDocument.create()
  const fonts = await loadUnifiedPdfFonts(doc)
  const logo = await embedUnifiedLogo(doc)
  const ctx = { ...fonts, ...logo }
  const pages = []
  const state = {
    page: doc.addPage([PAGE_W, PAGE_H]),
    y: 0
  }
  pages.push(state.page)
  state.y = drawUnifiedDocumentHeader(state.page, ctx, {
    kicker: 'Quotation',
    title: 'Your golf holiday package'
  })

  const ensure = (needed) => {
    if (state.y - needed >= MIN_Y) return
    state.page = doc.addPage([PAGE_W, PAGE_H])
    pages.push(state.page)
    state.y = drawUnifiedDocumentHeader(state.page, ctx, { compact: true })
  }

  const paragraph = (text, opts = {}) => {
    const size = opts.size ?? 11.5
    const font = opts.bold ? ctx.fontBold : ctx.font
    const color = opts.color ?? t.ink
    const gap = opts.gap ?? 4
    for (const para of String(text ?? '').split('\n')) {
      if (!para.trim()) {
        state.y -= 6
        continue
      }
      const lines = wrapPlainLinesWithFont(font, ink(para), size, CONTENT_W)
      for (const line of lines) {
        ensure(size + 6)
        state.page.drawText(line, { x: MARGIN, y: state.y, font, size, color })
        state.y -= size + gap
      }
      state.y -= 4
    }
  }

  const sectionTable = (title, rows) => {
    const usable = filledRows(rows)
    if (!usable.length) return
    const firstH = estimateUnifiedKeyValueTableHeight(ctx, [usable[0]])
    ensure(48 + firstH)
    state.y = drawUnifiedSectionHeading(state.page, state.y, ctx, title)
    for (const row of usable) {
      const height = estimateUnifiedKeyValueTableHeight(ctx, [row])
      ensure(height + 8)
      state.y = drawUnifiedKeyValueTable(state.page, state.y, ctx, [row])
    }
    state.y -= 10
  }

  ensure(36)
  paragraph(`Hi ${firstName},`, { bold: true, size: 14, gap: 6 })
  paragraph(
    'Thank you for getting in touch with Golf Sol Ireland. We appreciate your enquiry and would be delighted to help you plan your golf holiday.'
  )

  sectionTable('Your package', [
    { label: 'Prepared for', value: customerName },
    { label: 'Reference', value: reference },
    { label: 'Destination', value: q.destination },
    { label: 'Travel dates', value: q.travelDates },
    { label: 'Duration', value: q.duration },
    { label: 'Number of golfers', value: q.golfers },
    { label: '5-star hotel', value: q.priceFiveStar },
    { label: '4-star hotel', value: q.priceFourStar }
  ])

  sectionTable('Your package includes', [
    { label: 'Hotels', value: q.hotels },
    { label: 'Golf', value: q.golf },
    { label: 'Airport transfers', value: q.airportTransfers },
    { label: 'Golf course transfers', value: q.golfTransfers },
    { label: 'Breakfast', value: q.breakfast },
    { label: 'Assistance', value: q.assistance }
  ])

  sectionTable('Transfers', [{ label: 'Transfer total', value: q.transferTotal }])

  if (q.extraNotes.trim()) {
    ensure(48)
    state.y = drawUnifiedSectionHeading(state.page, state.y, ctx, 'Notes')
    paragraph(q.extraNotes)
  }

  if (q.nextSteps.trim()) {
    ensure(48)
    state.y = drawUnifiedSectionHeading(state.page, state.y, ctx, 'Next steps')
    paragraph(q.nextSteps)
  }

  state.y -= 6
  paragraph('Many thanks for your enquiry.', { size: 11.5 })
  paragraph(q.signOffName || CLIENT_DOCUMENT_COMPANY.name, { bold: true, size: 13 })
  if (q.signOffPhone.trim()) paragraph(q.signOffPhone, { size: 11.5, color: t.green })

  const totalPages = pages.length
  for (let i = 0; i < totalPages; i += 1) {
    drawUnifiedDocumentFooter(pages[i], 52, ctx, [], { current: i + 1, total: totalPages })
  }

  const namePart = slug(customerName || firstName)
  const refPart = slug(reference)
  const filename = `GolfSol-Quotation-${namePart}${refPart ? `-${refPart}` : ''}.pdf`
  return { filename, bytes: await doc.save() }
}
