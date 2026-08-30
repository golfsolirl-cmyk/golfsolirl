import { PDFDocument } from 'pdf-lib'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { CLIENT_DOCUMENT_COMPANY } from '../shared/client-enquiry-document.mjs'
import {
  formatQuotationEuro,
  normalizeMailQuotationPackage,
  quotationComputed
} from '../shared/admin-mail-quotation.mjs'
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
    .slice(0, 40)

const filledRows = (rows) =>
  rows
    .filter((row) => String(row.value ?? '').trim())
    .map((row) => ({ label: String(row.label).trim(), value: String(row.value).trim() }))

const moneyLine = (n) => (n > 0 ? formatQuotationEuro(n) : '')

/**
 * Package quotation PDF matching the Golf Sol Ireland Word quotation letter.
 * @param {{
 *   customerName?: string
 *   firstName?: string
 *   reference?: string
 *   quotation?: Record<string, unknown>
 *   blank?: boolean
 * }} input
 */
export const buildAdminMailQuotationPdf = async (input = {}) => {
  const blank = Boolean(input.blank)
  const q = normalizeMailQuotationPackage(input.quotation)
  const computed = quotationComputed(q)
  const customerName = String(input.customerName ?? '').trim()
  const firstName = String(input.firstName ?? '').trim() || customerName.split(/\s+/)[0] || (blank ? '' : 'there')
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
    kicker: blank ? 'Blank template' : 'Quotation'
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
    const indent = opts.indent ?? 0
    for (const para of String(text ?? '').split('\n')) {
      if (!para.trim()) {
        state.y -= 6
        continue
      }
      const lines = wrapPlainLinesWithFont(font, ink(para), size, CONTENT_W - indent)
      for (const line of lines) {
        ensure(size + 6)
        state.page.drawText(line, { x: MARGIN + indent, y: state.y, font, size, color })
        state.y -= size + gap
      }
      state.y -= 4
    }
  }

  const banner = (title) => {
    const h = 30
    ensure(h + 18)
    state.page.drawRectangle({
      x: MARGIN,
      y: state.y - h + 10,
      width: CONTENT_W,
      height: h,
      color: t.green
    })
    const label = ink(title)
    const size = 12
    const tw = ctx.fontBold.widthOfTextAtSize(label, size)
    state.page.drawText(label, {
      x: MARGIN + Math.max(12, (CONTENT_W - tw) / 2),
      y: state.y - 10,
      font: ctx.fontBold,
      size,
      color: t.white
    })
    state.y -= h + 16
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

  const includeRow = (label, body) => {
    const value = String(body ?? '').trim()
    if (!value && !blank) return
    const display = value || '________________________________'
    const labelLines = wrapPlainLinesWithFont(ctx.fontBold, label.toUpperCase(), 8.5, 150)
    const valueLines = wrapPlainLinesWithFont(ctx.font, ink(display), 12, CONTENT_W - 196)
    const innerH = 28 + Math.max(labelLines.length * 12, valueLines.length * 15)
    ensure(innerH + 8)
    const bottom = state.y - innerH
    state.page.drawRectangle({
      x: MARGIN,
      y: bottom,
      width: CONTENT_W,
      height: innerH,
      color: t.paleGreen,
      borderColor: t.sand,
      borderWidth: 0.6
    })
    state.page.drawRectangle({
      x: MARGIN + 14,
      y: state.y - 22,
      width: 9,
      height: 9,
      color: t.gold
    })
    let ly = state.y - 20
    for (const line of labelLines) {
      state.page.drawText(line, { x: MARGIN + 30, y: ly, font: ctx.fontBold, size: 8.5, color: t.greenSoft })
      ly -= 12
    }
    let vy = state.y - 22
    for (const line of valueLines) {
      state.page.drawText(line, { x: MARGIN + 178, y: vy, font: ctx.font, size: 12, color: t.ink })
      vy -= 15
    }
    state.y = bottom - 4
  }

  const creamPanel = (text) => {
    const value = String(text ?? '').trim()
    if (!value && !blank) return
    const display = value || 'Additional package notes / exclusions / buggy / trolley / room information.'
    const lines = wrapPlainLinesWithFont(ctx.font, ink(display), 11.5, CONTENT_W - 36)
    const h = 28 + lines.length * 16
    ensure(h + 12)
    const bottom = state.y - h
    state.page.drawRectangle({
      x: MARGIN,
      y: bottom,
      width: CONTENT_W,
      height: h,
      color: t.paleGold,
      borderColor: t.goldDeep,
      borderWidth: 0.9
    })
    let ty = state.y - 20
    for (const line of lines) {
      state.page.drawText(line, { x: MARGIN + 16, y: ty, font: ctx.font, size: 11.5, color: t.ink })
      ty -= 16
    }
    state.y = bottom - 12
  }

  banner(blank ? 'GOLF HOLIDAY QUOTATION TEMPLATE' : 'YOUR GOLF HOLIDAY QUOTATION')

  if (blank) {
    paragraph('Customer name: ________________________________________________')
  } else {
    paragraph(`Hi ${firstName || 'there'},`, { bold: true, size: 14, gap: 6 })
  }
  paragraph(
    'Thank you for getting in touch with Golf Sol Ireland. We appreciate your enquiry and would be delighted to help you plan your golf holiday.'
  )

  const priceRows = computed.options
    .filter((opt) => opt.total > 0 || String(opt.pricePerPerson).trim() || (blank && opt.name.trim()))
    .map((opt) => ({
      label: opt.name.trim() || 'Hotel option',
      value:
        opt.total > 0
          ? `${formatQuotationEuro(opt.pricePerPersonValue)} per person x ${opt.golferCountValue} = ${formatQuotationEuro(opt.total)}`
          : blank
            ? 'EUR ________     Total EUR ________'
            : String(opt.name)
    }))

  sectionTable(blank ? 'Customer and trip details' : 'Your package', [
    { label: 'Prepared for', value: customerName || (blank ? '________________' : '') },
    { label: 'Reference', value: reference || (blank ? '________________' : '') },
    { label: 'Destination', value: q.destination || (blank ? '________________' : '') },
    { label: 'Travel dates', value: q.travelDates || (blank ? '________________' : '') },
    { label: 'Duration', value: q.duration || (blank ? '________________' : '') },
    { label: 'Number of golfers', value: q.golfers || (blank ? '________________' : '') }
  ])

  if (priceRows.length || blank) {
    sectionTable(
      'Package price',
      priceRows.length
        ? priceRows
        : [
            { label: 'Option 1 / hotel', value: 'EUR ________     Total EUR ________' },
            { label: 'Option 2 / hotel', value: 'EUR ________     Total EUR ________' }
          ]
    )
  }

  const includeItems = [
    ['Hotels', q.hotels],
    ['Golf', q.golf],
    ['Airport transfers', q.airportTransfers],
    ['Golf course transfers', q.golfTransfers],
    ['Breakfast / board', q.breakfast],
    ['Golf Sol Ireland assistance', q.assistance]
  ]
  if (blank || includeItems.some(([, body]) => String(body).trim())) {
    ensure(48)
    state.y = drawUnifiedSectionHeading(state.page, state.y, ctx, 'Your package includes')
    for (const [label, body] of includeItems) {
      includeRow(label, body)
    }
    state.y -= 8
  }

  if (q.extraNotes.trim() || blank) {
    ensure(40)
    state.y = drawUnifiedSectionHeading(state.page, state.y, ctx, 'Additional information')
    creamPanel(q.extraNotes)
  }

  const transferLine =
    computed.transferTotal > 0
      ? `${formatQuotationEuro(computed.transferTotal)}${computed.transferPerPerson ? `  /  ${formatQuotationEuro(computed.transferPerPerson)} per person` : ''}`
      : q.transferTotal
  const depositLine =
    computed.depositAmount > 0
      ? `${computed.depositPercent}%  /  ${formatQuotationEuro(computed.depositAmount)}`
      : q.depositPercent
        ? `${q.depositPercent}%`
        : ''

  sectionTable('Transfer and payment', [
    { label: 'Transfer total', value: transferLine || (blank ? 'EUR ________' : '') },
    { label: 'Deposit required', value: depositLine || (blank ? '____ %  /  EUR ________' : '') },
    { label: 'Final balance', value: moneyLine(computed.balanceDue) || (blank ? 'EUR ________' : '') },
    { label: 'Balance due', value: q.balanceDueDate || (blank ? '________________' : '') },
    { label: 'Quote expiry', value: q.quoteExpiry || (blank ? '________________' : '') }
  ])

  if (q.nextSteps.trim() || blank) {
    ensure(40)
    state.y = drawUnifiedSectionHeading(state.page, state.y, ctx, 'Personal message')
    paragraph(q.nextSteps || (blank ? '________________________________________________________________' : ''))
  }

  state.y -= 6
  paragraph('Many thanks for your enquiry.', { size: 11.5 })
  paragraph(q.signOffName || CLIENT_DOCUMENT_COMPANY.name, { bold: true, size: 13 })
  if (q.signOffPhone.trim() || blank) paragraph(q.signOffPhone || '________________', { size: 11.5, color: t.green })
  if (q.signOffEmail.trim()) paragraph(q.signOffEmail, { size: 11.5, color: t.green })

  const totalPages = pages.length
  const footerExtra = reference ? [`Quotation Ref: ${reference}`] : []
  for (let i = 0; i < totalPages; i += 1) {
    drawUnifiedDocumentFooter(pages[i], 52, ctx, footerExtra, { current: i + 1, total: totalPages })
  }

  const refPart = slug(reference) || (blank ? 'Blank-Template' : slug(customerName || firstName) || 'quote')
  const filename = blank
    ? 'GolfSol_Ireland_Blank_Quotation_Template.pdf'
    : `GolfSol-Ireland-Quotation-${refPart}.pdf`
  return { filename, bytes: await doc.save() }
}
