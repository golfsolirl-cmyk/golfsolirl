/**
 * A4 stationery PDF for admin client letters / quotations (pdf-lib).
 * Uses the shared Golf Sol full-company letterhead.
 */
import { PDFDocument } from 'pdf-lib'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import {
  buildClientDocumentFilename,
  buildClientDocumentView,
  formatClientDocumentEuro,
  normalizeClientDocumentDraft
} from '../shared/client-enquiry-document.mjs'
import { pdfEmailTheme } from './pdf-email-brand.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  drawUnifiedDocumentFooter,
  drawUnifiedDocumentHeader,
  embedUnifiedLogo,
  loadUnifiedPdfFonts,
  unifiedPdfMinBodyY,
  wrapPlainLinesWithFont
} from './gsol-unified-pdf-template.mjs'

const t = pdfEmailTheme
const PAGE_W = UNIFIED_PDF_LAYOUT.pageWidth
const PAGE_H = UNIFIED_PDF_LAYOUT.pageHeight
const MARGIN = 48
const CONTENT_W = PAGE_W - MARGIN * 2
const MIN_Y = unifiedPdfMinBodyY()

const S = {
  title: 18,
  section: 9,
  body: 10.5,
  meta: 9.5
}

const ink = (text) => sanitizeStandardFontText(String(text ?? ''))

/**
 * @param {unknown} draft
 * @returns {Promise<{ filename: string, bytes: Uint8Array }>}
 */
export const buildClientEnquiryDocumentPdf = async (draft) => {
  const normalized = normalizeClientDocumentDraft(draft)
  const view = buildClientDocumentView(normalized)
  const filename = buildClientDocumentFilename(normalized, 'pdf')

  const doc = await PDFDocument.create()
  const fonts = await loadUnifiedPdfFonts(doc)
  const logo = await embedUnifiedLogo(doc)
  const ctx = { ...fonts, ...logo }

  /** @type {import('pdf-lib').PDFPage[]} */
  const pages = []
  const state = {
    page: doc.addPage([PAGE_W, PAGE_H]),
    y: 0
  }
  pages.push(state.page)
  state.y = drawUnifiedDocumentHeader(state.page, ctx, {})

  const ensure = (needed) => {
    if (state.y - needed >= MIN_Y) return
    state.page = doc.addPage([PAGE_W, PAGE_H])
    pages.push(state.page)
    state.y = drawUnifiedDocumentHeader(state.page, ctx, { compact: true })
  }

  const goldRule = () => {
    ensure(14)
    state.page.drawRectangle({ x: MARGIN, y: state.y, width: CONTENT_W * 0.38, height: 1.8, color: t.gold })
    state.page.drawRectangle({
      x: MARGIN + CONTENT_W * 0.38 + 6,
      y: state.y + 0.5,
      width: CONTENT_W * 0.62 - 6,
      height: 0.5,
      color: t.sand
    })
    state.y -= 16
  }

  const sectionHeading = (label) => {
    ensure(72)
    goldRule()
    state.page.drawText(ink(label.toUpperCase()), {
      x: MARGIN,
      y: state.y,
      font: ctx.fontBold,
      size: S.section,
      color: t.green
    })
    state.y -= 16
  }

  const drawParagraph = (text, opts = {}) => {
    const size = opts.size ?? S.body
    const font = opts.bold ? ctx.fontBold : ctx.font
    const color = opts.color ?? t.ink
    const indent = opts.indent ?? 0
    const width = CONTENT_W - indent
    const paragraphs = String(text ?? '').split('\n')
    for (const para of paragraphs) {
      if (!para.trim()) {
        state.y -= 6
        continue
      }
      const lines = wrapPlainLinesWithFont(font, para, size, width)
      for (const line of lines) {
        ensure(size + 5)
        state.page.drawText(line, { x: MARGIN + indent, y: state.y, font, size, color })
        state.y -= size + 4
      }
      state.y -= 3
    }
  }

  ensure(48)
  const titleLines = wrapPlainLinesWithFont(ctx.fontBold, view.title.toUpperCase(), S.title, CONTENT_W)
  for (const line of titleLines) {
    ensure(S.title + 6)
    state.page.drawText(line, {
      x: MARGIN,
      y: state.y,
      font: ctx.fontBold,
      size: S.title,
      color: t.green
    })
    state.y -= S.title + 6
  }
  const meta = [`Reference: ${view.reference}`, `Date: ${view.dateLabel}`]
  if (view.validUntilLabel) meta.push(`Valid until: ${view.validUntilLabel}`)
  for (const line of meta) {
    ensure(16)
    state.page.drawText(ink(line), { x: MARGIN, y: state.y, font: ctx.font, size: S.meta, color: t.muted })
    state.y -= 13
  }
  if (view.subject) {
    state.y -= 2
    const subjectLines = wrapPlainLinesWithFont(ctx.font, `Subject: ${view.subject}`, S.meta, CONTENT_W)
    for (const line of subjectLines) {
      ensure(16)
      state.page.drawText(line, {
        x: MARGIN,
        y: state.y,
        font: ctx.font,
        size: S.meta,
        color: t.ink
      })
      state.y -= 14
    }
  }
  state.y -= 8

  if (view.preparedFor.length) {
    sectionHeading('Prepared for')
    for (const line of view.preparedFor) {
      ensure(14)
      state.page.drawText(ink(line), { x: MARGIN, y: state.y, font: ctx.font, size: S.body, color: t.ink })
      state.y -= 14
    }
    state.y -= 6
  }

  if (view.sections.enquiry) {
    sectionHeading('Customer enquiry')
    drawParagraph(view.enquirySummary, { size: 10, color: t.ink })
    state.y -= 4
  }

  if (view.sections.message) {
    sectionHeading('Message / response')
    for (const block of view.messageBlocks) {
      if (block.type === 'heading') {
        drawParagraph(block.text, { bold: true, size: 12, color: t.green })
      } else if (block.type === 'bullets') {
        for (const item of block.items) {
          const lines = wrapPlainLinesWithFont(ctx.font, item, S.body, CONTENT_W - 16)
          for (let i = 0; i < lines.length; i += 1) {
            ensure(15)
            if (i === 0) {
              state.page.drawText('•', { x: MARGIN, y: state.y, font: ctx.font, size: S.body, color: t.goldDeep })
            }
            state.page.drawText(lines[i], {
              x: MARGIN + 14,
              y: state.y,
              font: ctx.font,
              size: S.body,
              color: t.ink
            })
            state.y -= 14
          }
        }
        state.y -= 4
      } else {
        drawParagraph(block.text)
      }
    }
  }

  if (view.sections.pricing) {
    sectionHeading(view.pricing.mode === 'single' ? 'Price' : 'Quotation')
    drawPricingTable(state, ctx, view.pricing, ensure)
  }

  if (view.sections.notes) {
    sectionHeading('Additional notes')
    drawParagraph(view.notes)
  }

  if (view.sections.terms) {
    sectionHeading('Terms')
    drawParagraph(view.terms, { size: 9, color: t.muted })
  }

  if (view.sections.payment) {
    sectionHeading('Payment information')
    drawParagraph(view.paymentDetails)
  }

  if (view.sections.signature) {
    sectionHeading('Acceptance')
    for (const line of [
      'Accepted by: ________________________________',
      'Signature: ___________________________________',
      'Date: ________________________________________'
    ]) {
      ensure(22)
      state.page.drawText(ink(line), { x: MARGIN, y: state.y, font: ctx.font, size: S.body, color: t.ink })
      state.y -= 22
    }
  }

  const totalPages = pages.length
  for (let i = 0; i < totalPages; i += 1) {
    drawUnifiedDocumentFooter(pages[i], 52, ctx, [], { current: i + 1, total: totalPages })
  }

  return { filename, bytes: await doc.save() }
}

const drawPricingTable = (state, ctx, pricing, ensure) => {
  const descColW = CONTENT_W * 0.46
  const qtyColW = CONTENT_W * 0.12
  const unitColW = CONTENT_W * 0.21
  const totalColW = CONTENT_W * 0.21
  const descMaxW = descColW - 14
  const cellSize = 9
  const lineH = 12
  const padY = 6
  const headerH = 18

  ensure(headerH + 6)
  state.page.drawRectangle({
    x: MARGIN,
    y: state.y - headerH + 8,
    width: CONTENT_W,
    height: headerH,
    color: t.green
  })
  let hx = MARGIN + 6
  ;['Description', 'Qty', 'Unit price', 'Total'].forEach((label, i) => {
    const col = [descColW, qtyColW, unitColW, totalColW][i]
    const text = ink(label)
    const tw = ctx.fontBold.widthOfTextAtSize(text, 8)
    const tx = i === 0 ? hx : hx + col - tw - 8
    state.page.drawText(text, { x: tx, y: state.y - 4, font: ctx.fontBold, size: 8, color: t.white })
    hx += col
  })
  state.y -= headerH + 4

  const drawRow = (cells, opts = {}) => {
    const font = opts.bold ? ctx.fontBold : ctx.font
    const descLines = wrapPlainLinesWithFont(font, cells[0] || '—', cellSize, descMaxW)
    const rowH = padY * 2 + Math.max(1, descLines.length) * lineH
    ensure(rowH + 2)
    const bottom = state.y - rowH
    if (opts.band) {
      state.page.drawRectangle({
        x: MARGIN,
        y: bottom,
        width: CONTENT_W,
        height: rowH,
        color: opts.band
      })
    }
    let descY = state.y - padY - cellSize
    for (const line of descLines) {
      state.page.drawText(line, { x: MARGIN + 6, y: descY, font, size: cellSize, color: t.ink })
      descY -= lineH
    }
    const numY = state.y - padY - cellSize
    let nx = MARGIN + descColW
    ;[cells[1], cells[2], cells[3]].forEach((cell, i) => {
      const col = [qtyColW, unitColW, totalColW][i]
      const text = ink(cell)
      const tw = font.widthOfTextAtSize(text, cellSize)
      state.page.drawText(text, {
        x: nx + col - tw - 8,
        y: numY,
        font,
        size: cellSize,
        color: t.ink
      })
      nx += col
    })
    state.y = bottom
  }

  if (pricing.mode === 'single' && pricing.lines.length <= 1) {
    const line = pricing.lines[0]
    drawRow([line?.description || 'Total', '', '', formatClientDocumentEuro(pricing.total)], { bold: true })
    state.y -= 8
    return
  }

  pricing.lines.forEach((line, i) => {
    drawRow(
      [
        line.description,
        String(line.qty),
        formatClientDocumentEuro(line.unitPrice),
        formatClientDocumentEuro(line.lineTotal)
      ],
      { band: i % 2 === 0 ? t.paleGreen : null }
    )
  })

  state.y -= 4
  const totals = [
    ['Subtotal', formatClientDocumentEuro(pricing.subtotal)],
    pricing.vatEnabled ? [`VAT (${pricing.vatPercent}%)`, formatClientDocumentEuro(pricing.vatAmount)] : null,
    ['Total', formatClientDocumentEuro(pricing.total)]
  ].filter(Boolean)

  for (const [label, amount] of totals) {
    ensure(16)
    const bold = label === 'Total'
    const font = bold ? ctx.fontBold : ctx.font
    const lw = font.widthOfTextAtSize(ink(label), 10)
    state.page.drawText(ink(label), {
      x: MARGIN + CONTENT_W * 0.58 - lw,
      y: state.y,
      font,
      size: 10,
      color: t.green
    })
    const aw = font.widthOfTextAtSize(ink(amount), 10)
    state.page.drawText(ink(amount), {
      x: MARGIN + CONTENT_W - aw,
      y: state.y,
      font,
      size: 10,
      color: t.ink
    })
    state.y -= 15
  }
  state.y -= 8
}
