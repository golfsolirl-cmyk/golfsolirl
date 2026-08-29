/**
 * A4 stationery PDF for admin client letters / quotations (pdf-lib).
 * Letterhead: crest left, company details right — not a webpage screenshot.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, rgb } from 'pdf-lib'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import {
  buildClientDocumentFilename,
  buildClientDocumentView,
  CLIENT_DOCUMENT_COMPANY,
  formatClientDocumentEuro,
  normalizeClientDocumentDraft
} from '../shared/client-enquiry-document.mjs'
import { brandedPdfAssetPaths, pdfEmailTheme } from './pdf-email-brand.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  embedUnifiedLogo,
  loadUnifiedPdfFonts,
  wrapPlainLinesWithFont
} from './gsol-unified-pdf-template.mjs'

const t = pdfEmailTheme
const PAGE_W = UNIFIED_PDF_LAYOUT.pageWidth
const PAGE_H = UNIFIED_PDF_LAYOUT.pageHeight
const MARGIN = 48
const CONTENT_W = PAGE_W - MARGIN * 2
const FOOTER_Y = 36
const MIN_Y = 58

const S = {
  title: 18,
  section: 9,
  body: 10.5,
  meta: 9.5
}

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const ink = (text) => sanitizeStandardFontText(String(text ?? ''))

const loadLogoBytes = () => {
  try {
    return readFileSync(brandedPdfAssetPaths.homepageCrest)
  } catch {
    try {
      return readFileSync(path.resolve(currentDir, '../public/images', CLIENT_DOCUMENT_COMPANY.logoFilename))
    } catch {
      return null
    }
  }
}

const embedLogo = async (doc) => {
  const logoBytes = loadLogoBytes()
  if (logoBytes) {
    try {
      const embedded = await doc.embedPng(logoBytes)
      const h = 56
      return { image: embedded, w: (embedded.width / embedded.height) * h, h }
    } catch (error) {
      console.error('[client-enquiry-document-pdf] logo embed failed', error)
    }
  }
  try {
    const unified = await embedUnifiedLogo(doc)
    const h = 56
    return { image: unified.logoImage, w: unified.logoW * (h / unified.logoH), h }
  } catch (error) {
    console.error('[client-enquiry-document-pdf] unified logo fallback failed', error)
    return null
  }
}

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
  const logo = await embedLogo(doc)
  const ctx = { ...fonts, logo }

  /** @type {import('pdf-lib').PDFPage[]} */
  const pages = []
  const state = {
    page: doc.addPage([PAGE_W, PAGE_H]),
    y: 0
  }
  pages.push(state.page)
  state.y = drawLetterhead(state.page, ctx, true)

  const ensure = (needed) => {
    if (state.y - needed >= MIN_Y) return
    state.page = doc.addPage([PAGE_W, PAGE_H])
    pages.push(state.page)
    state.y = drawLetterhead(state.page, ctx, false)
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
    ensure(28)
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
  state.page.drawText(ink(view.title.toUpperCase()), {
    x: MARGIN,
    y: state.y,
    font: ctx.fontBold,
    size: S.title,
    color: t.green
  })
  state.y -= 22
  const meta = [`Reference: ${view.reference}`, `Date: ${view.dateLabel}`]
  if (view.validUntilLabel) meta.push(`Valid until: ${view.validUntilLabel}`)
  for (const line of meta) {
    state.page.drawText(ink(line), { x: MARGIN, y: state.y, font: ctx.font, size: S.meta, color: t.muted })
    state.y -= 13
  }
  if (view.subject) {
    state.y -= 2
    state.page.drawText(ink(`Subject: ${view.subject}`), {
      x: MARGIN,
      y: state.y,
      font: ctx.font,
      size: S.meta,
      color: t.ink
    })
    state.y -= 14
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
    drawStationeryFooter(pages[i], ctx, view.footerLine, i + 1, totalPages)
  }

  return { filename, bytes: await doc.save() }
}

const drawLetterhead = (page, ctx, full) => {
  const c = CLIENT_DOCUMENT_COMPANY
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: rgb(1, 1, 1) })
  page.drawRectangle({ x: 0, y: PAGE_H - 3.2, width: PAGE_W, height: 3.2, color: t.gold })

  let y = PAGE_H - MARGIN
  if (full) {
    if (ctx.logo) {
      page.drawImage(ctx.logo.image, {
        x: MARGIN,
        y: y - ctx.logo.h,
        width: ctx.logo.w,
        height: ctx.logo.h
      })
    }
    const textX = ctx.logo ? MARGIN + ctx.logo.w + 16 : MARGIN
    const logoH = ctx.logo?.h ?? 56
    let ty = y - 8
    page.drawText(ink(c.name), { x: textX, y: ty, font: ctx.fontBold, size: 13, color: t.green })
    ty -= 13
    page.drawText(ink(c.tagline), { x: textX, y: ty, font: ctx.font, size: 8, color: t.goldDeep })
    ty -= 12
    const detailLines = [
      c.addressLines.join(', '),
      `Ireland ${c.irishPhone}  ·  Spain ${c.spanishPhone}`,
      `${c.email}  ·  ${c.websiteDisplay}`,
      `Registered in Ireland · Co. ${c.companyReg}`
    ]
    for (const line of detailLines) {
      page.drawText(ink(line), { x: textX, y: ty, font: ctx.font, size: 8, color: t.muted })
      ty -= 10
    }
    y = y - Math.max(logoH, y - ty) - 10
  } else {
    page.drawText(ink(c.name), { x: MARGIN, y: y - 4, font: ctx.fontBold, size: 10, color: t.green })
    y -= 18
  }

  page.drawRectangle({ x: MARGIN, y, width: CONTENT_W, height: 0.9, color: t.gold })
  return y - 22
}

const drawStationeryFooter = (page, ctx, footerLine, current, total) => {
  page.drawRectangle({ x: MARGIN, y: FOOTER_Y + 16, width: CONTENT_W, height: 0.6, color: t.sand })
  page.drawText(ink(footerLine), {
    x: MARGIN,
    y: FOOTER_Y + 4,
    font: ctx.font,
    size: 7.5,
    color: t.muted
  })
  const pageText = `Page ${current} of ${total}`
  const pw = ctx.font.widthOfTextAtSize(pageText, 7.5)
  page.drawText(pageText, {
    x: PAGE_W - MARGIN - pw,
    y: FOOTER_Y + 4,
    font: ctx.font,
    size: 7.5,
    color: t.muted
  })
}

const drawPricingTable = (state, ctx, pricing, ensure) => {
  const cols = [
    { w: CONTENT_W * 0.46, align: 'left' },
    { w: CONTENT_W * 0.12, align: 'right' },
    { w: CONTENT_W * 0.21, align: 'right' },
    { w: CONTENT_W * 0.21, align: 'right' }
  ]
  const rowH = 18

  const header = () => {
    ensure(rowH + 4)
    state.page.drawRectangle({ x: MARGIN, y: state.y - 4, width: CONTENT_W, height: rowH, color: t.green })
    let x = MARGIN + 6
    ;['Description', 'Qty', 'Unit price', 'Total'].forEach((label, i) => {
      const col = cols[i]
      const text = ink(label)
      const tw = ctx.fontBold.widthOfTextAtSize(text, 8)
      const tx = col.align === 'right' ? x + col.w - tw - 8 : x
      state.page.drawText(text, { x: tx, y: state.y + 2, font: ctx.fontBold, size: 8, color: t.white })
      x += col.w
    })
    state.y -= rowH + 2
  }

  header()

  const drawRow = (cells, opts = {}) => {
    ensure(rowH + 2)
    if (opts.band) {
      state.page.drawRectangle({
        x: MARGIN,
        y: state.y - 4,
        width: CONTENT_W,
        height: rowH,
        color: opts.band
      })
    }
    let x = MARGIN + 6
    cells.forEach((cell, i) => {
      const col = cols[i]
      const font = opts.bold ? ctx.fontBold : ctx.font
      const text = ink(cell)
      const tw = font.widthOfTextAtSize(text, 9)
      const tx = col.align === 'right' ? x + col.w - tw - 8 : x
      state.page.drawText(text, { x: tx, y: state.y + 1, font, size: 9, color: t.ink })
      x += col.w
    })
    state.y -= rowH
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
