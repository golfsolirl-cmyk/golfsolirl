/**
 * Golf Sol Ireland — master PDF shell (cream page, forest header, homepage crest).
 * All server-generated PDFs should use these helpers for consistent branding.
 */
import { readFileSync } from 'node:fs'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { brandedPdfAssetPaths, pdfEmailTheme } from './pdf-email-brand.mjs'
import { gsolCompanyLegal } from './email-constants.mjs'

export const UNIFIED_PDF_LAYOUT = {
  pageWidth: 595.28,
  pageHeight: 841.89,
  margin: 48,
  headerBandHeight: 96,
  footerReserve: 72
}

const t = pdfEmailTheme

/** Readable body sizes — no tiny type on cream backgrounds. */
const TYPE = {
  headerKicker: 8.5,
  headerMeta: 9,
  docTitle: 18,
  docSubtitle: 11,
  section: 13,
  label: 8.5,
  value: 12,
  body: 11.5,
  footer: 8.5,
  pageNum: 9.5
}

/** @param {import('pdf-lib').PDFDocument} doc */
export const loadUnifiedPdfFonts = async (doc) => ({
  font: await doc.embedFont(StandardFonts.Helvetica),
  fontBold: await doc.embedFont(StandardFonts.HelveticaBold)
})

/** @param {import('pdf-lib').PDFDocument} doc */
export const embedUnifiedLogo = async (doc) => {
  const logoImage = await doc.embedPng(readFileSync(brandedPdfAssetPaths.homepageCrest))
  const logoH = 72
  const logoW = (logoImage.width / logoImage.height) * logoH
  return { logoImage, logoW, logoH }
}

/**
 * Branded header: solid forest band + gold rule + homepage crest (left) + title on cream.
 * @returns {number} Y to start body content
 */
export const drawUnifiedDocumentHeader = (page, ctx, header) => {
  const { pageWidth, pageHeight, margin, headerBandHeight } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const bandBottom = pageHeight - margin - headerBandHeight

  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: t.cream })
  page.drawRectangle({ x: 0, y: pageHeight - 4, width: pageWidth, height: 4, color: t.gold })
  page.drawRectangle({ x: 0, y: bandBottom, width: pageWidth, height: headerBandHeight + margin, color: t.green })

  const logoY = bandBottom + (headerBandHeight - ctx.logoH) / 2
  page.drawImage(ctx.logoImage, {
    x: margin,
    y: logoY,
    width: ctx.logoW,
    height: ctx.logoH
  })

  const textX = margin + ctx.logoW + 18
  const textMaxW = pageWidth - margin - textX - 12
  let metaY = bandBottom + headerBandHeight - 22

  page.drawText('FROM PLANE TO FAIRWAY', {
    x: textX,
    y: metaY,
    font: ctx.fontBold,
    size: TYPE.headerKicker,
    color: t.gold
  })
  metaY -= 14
  const metaLines = [
    'Golf Sol Ireland - Irish-owned Costa del Sol golf travel',
    'www.golfsolirl.com - info@golfsolirl.com',
    `Registered in Ireland - Co. ${gsolCompanyLegal.companyRegistrationNumber}`
  ]
  for (const line of metaLines) {
    const wrapped = wrapPlainLinesWithFont(ctx.font, line, TYPE.headerMeta, textMaxW)
    for (const w of wrapped) {
      page.drawText(w, { x: textX, y: metaY, font: ctx.font, size: TYPE.headerMeta, color: t.white })
      metaY -= 12
    }
  }

  let y = bandBottom - 20
  page.drawRectangle({ x: margin, y: y - 2, width: contentW * 0.42, height: 2.5, color: t.gold })
  page.drawRectangle({ x: margin + contentW * 0.42 + 8, y: y - 1, width: contentW * 0.58 - 8, height: 0.6, color: t.sand })

  y -= 26
  const titleLines = wrapPlainLinesWithFont(ctx.fontBold, header.title, TYPE.docTitle, contentW)
  for (const line of titleLines) {
    page.drawText(line, { x: margin, y, font: ctx.fontBold, size: TYPE.docTitle, color: t.green })
    y -= TYPE.docTitle + 6
  }

  let bodyStartY = y - 8
  if (header.subtitle?.trim()) {
    const subLines = wrapPlainLinesWithFont(ctx.font, header.subtitle, TYPE.docSubtitle, contentW)
    for (const line of subLines) {
      page.drawText(line, { x: margin, y: bodyStartY, font: ctx.font, size: TYPE.docSubtitle, color: t.muted })
      bodyStartY -= TYPE.docSubtitle + 5
    }
    bodyStartY -= 6
  }

  return bodyStartY
}

/**
 * Footer on cream: rule, page X of Y, company line (ink on cream — never white-on-cream).
 */
export const drawUnifiedDocumentFooter = (page, _bottomY, ctx, extraLines = [], pageInfo = null) => {
  const { pageWidth, margin, footerReserve } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const baseY = footerReserve

  page.drawRectangle({ x: margin, y: baseY + 18, width: contentW, height: 0.75, color: t.sand })

  if (pageInfo) {
    const pageText = `Page ${pageInfo.current} of ${pageInfo.total}`
    const pw = ctx.font.widthOfTextAtSize(pageText, TYPE.pageNum)
    page.drawText(pageText, {
      x: (pageWidth - pw) / 2,
      y: baseY + 4,
      font: ctx.fontBold,
      size: TYPE.pageNum,
      color: t.green
    })
  }

  const footerLines = [
    'Golf Sol Ireland - www.golfsolirl.com - info@golfsolirl.com',
    ...extraLines
  ]
  let fy = baseY - 10
  for (const line of footerLines) {
    page.drawText(sanitizeStandardFontText(line), {
      x: margin,
      y: fy,
      font: ctx.font,
      size: TYPE.footer,
      color: t.muted
    })
    fy -= 11
  }
}

export const drawUnifiedFooterLine = (page, ctx, text, y = 30) => {
  drawUnifiedDocumentFooter(page, y, ctx, [text])
}

export const drawUnifiedKeyValueTable = (page, startY, ctx, rows) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const labelColW = Math.min(172, Math.floor(contentW * 0.34))
  const valueX = margin + labelColW + 20
  const valueMaxW = contentW - labelColW - 40
  const labelMaxW = labelColW - 10
  const labelLH = 12
  const valueLH = 15
  const padV = 14
  let yTop = startY

  for (let i = 0; i < rows.length; i += 1) {
    const bg = i % 2 === 0 ? t.paleGreen : t.cream
    const labelLines = wrapPlainLinesWithFont(ctx.fontBold, rows[i].label.toUpperCase(), TYPE.label, labelMaxW)
    const valueLines = wrapPlainLinesWithFont(ctx.font, rows[i].value, TYPE.value, valueMaxW)
    const labelBlockH = Math.max(labelLines.length, 1) * labelLH
    const valueBlockH = Math.max(valueLines.length, 1) * valueLH
    const innerH = padV * 2 + Math.max(labelBlockH, valueBlockH)
    const bottom = yTop - innerH

    page.drawRectangle({
      x: margin,
      y: bottom,
      width: contentW,
      height: innerH,
      color: bg,
      borderColor: t.sand,
      borderWidth: 0.6
    })
    page.drawRectangle({
      x: margin + labelColW + 10,
      y: bottom + 8,
      width: 0.5,
      height: innerH - 16,
      color: t.goldDeep
    })

    let lb = yTop - padV - TYPE.label
    for (const line of labelLines) {
      page.drawText(line, { x: margin + 14, y: lb, font: ctx.fontBold, size: TYPE.label, color: t.greenSoft })
      lb -= labelLH
    }

    let vb = yTop - padV - TYPE.value
    for (const line of valueLines) {
      page.drawText(line, { x: valueX, y: vb, font: ctx.font, size: TYPE.value, color: t.ink })
      vb -= valueLH
    }

    yTop = bottom - 4
  }

  return yTop
}

export const estimateUnifiedKeyValueTableHeight = (ctx, rows) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const labelColW = Math.min(172, Math.floor(contentW * 0.34))
  const valueMaxW = contentW - labelColW - 40
  const labelMaxW = labelColW - 10
  const labelLH = 12
  const valueLH = 15
  const padV = 14
  let total = 0
  for (const row of rows) {
    const labelLines = wrapPlainLinesWithFont(ctx.fontBold, row.label.toUpperCase(), TYPE.label, labelMaxW)
    const valueLines = wrapPlainLinesWithFont(ctx.font, row.value, TYPE.value, valueMaxW)
    const labelBlockH = Math.max(labelLines.length, 1) * labelLH
    const valueBlockH = Math.max(valueLines.length, 1) * valueLH
    total += padV * 2 + Math.max(labelBlockH, valueBlockH) + 4
  }
  return total
}

export const drawUnifiedSectionHeading = (page, y, ctx, title) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  page.drawRectangle({ x: margin, y: y - 16, width: 5, height: 18, color: t.gold })
  const titleLines = wrapPlainLinesWithFont(ctx.fontBold, title, TYPE.section, contentW - 16)
  let ty = y
  for (const line of titleLines) {
    page.drawText(line, { x: margin + 14, y: ty, font: ctx.fontBold, size: TYPE.section, color: t.green })
    ty -= TYPE.section + 4
  }
  page.drawRectangle({ x: margin, y: ty - 8, width: contentW, height: 0.6, color: t.sand })
  return ty - 22
}

export const drawUnifiedBulletCard = (page, startY, ctx, section) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const pad = 18
  const innerLeft = margin + pad
  const innerW = contentW - pad * 2
  const titleLH = 16
  const bodyLH = 15
  const bulletLH = 15

  const titleLines = wrapPlainLinesWithFont(ctx.fontBold, section.title, TYPE.section, innerW)
  const bodyLines = wrapPlainLinesWithFont(ctx.font, section.body, TYPE.body, innerW - 4)
  const bulletLineGroups = (section.points ?? []).map((p) =>
    wrapPlainLinesWithFont(ctx.font, `- ${p}`, TYPE.body, innerW - 16)
  )

  const titleBlockH = titleLines.length * titleLH
  const bodyBlockH = bodyLines.length * bodyLH
  let bulletsH = 0
  for (const g of bulletLineGroups) {
    bulletsH += g.length * bulletLH + 8
  }

  const cardH = pad + titleBlockH + 14 + bodyBlockH + 14 + bulletsH + pad
  const bottom = startY - cardH

  page.drawRectangle({
    x: margin,
    y: bottom,
    width: contentW,
    height: cardH,
    color: t.white,
    borderColor: t.sand,
    borderWidth: 0.8
  })

  let y = startY - pad - TYPE.section
  for (const line of titleLines) {
    page.drawText(line, { x: innerLeft, y, font: ctx.fontBold, size: TYPE.section, color: t.ink })
    y -= titleLH
  }

  y -= 10
  for (const line of bodyLines) {
    page.drawText(line, { x: innerLeft, y, font: ctx.font, size: TYPE.body, color: t.muted })
    y -= bodyLH
  }

  y -= 10
  for (const group of bulletLineGroups) {
    for (const line of group) {
      page.drawText(line, { x: innerLeft, y, font: ctx.font, size: TYPE.body, color: t.ink })
      y -= bulletLH
    }
    y -= 8
  }

  return bottom - 16
}

export const estimateUnifiedBulletCardHeight = (ctx, section, contentW) => {
  const pad = 18
  const innerW = contentW - pad * 2
  const titleLH = 16
  const bodyLH = 15
  const bulletLH = 15
  const titleLines = wrapPlainLinesWithFont(ctx.fontBold, section.title, TYPE.section, innerW)
  const bodyLines = wrapPlainLinesWithFont(ctx.font, section.body, TYPE.body, innerW - 4)
  let bulletsH = 0
  for (const point of section.points ?? []) {
    const lines = wrapPlainLinesWithFont(ctx.font, `- ${point}`, TYPE.body, innerW - 16)
    bulletsH += lines.length * bulletLH + 8
  }
  return pad + titleLines.length * titleLH + 14 + bodyLines.length * bodyLH + 14 + bulletsH + pad + 20
}

export const drawUnifiedGoldRule = (page, y) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  page.drawRectangle({ x: margin, y: y - 2, width: contentW * 0.35, height: 2.5, color: t.gold })
  page.drawRectangle({ x: margin + contentW * 0.35 + 8, y: y - 1, width: contentW * 0.65 - 8, height: 0.6, color: t.sand })
  return y - 22
}

export const wrapPlainLinesWithFont = (font, text, fontSize, maxWidth) => {
  const words = sanitizeStandardFontText(text).split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['']
  const lines = []
  let current = words[0]
  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`
    if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
      current = next
    } else {
      lines.push(current)
      current = words[i]
    }
  }
  lines.push(current)
  return lines
}

export const drawUnifiedParagraphBlock = (page, topY, ctx, text, opts = {}) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const size = opts.size ?? TYPE.body
  const lineHeight = opts.lineHeight ?? 15
  const color = opts.color ?? t.muted
  const paragraphs = String(text ?? '').split('\n')
  let y = topY
  for (const para of paragraphs) {
    if (!para.trim()) {
      y -= lineHeight * 0.35
      continue
    }
    const wrapped = wrapPlainLinesWithFont(ctx.font, para, size, contentW)
    for (const line of wrapped) {
      page.drawText(line, { x: margin, y, font: ctx.font, size, color })
      y -= lineHeight
    }
    y -= lineHeight * 0.2
  }
  return y
}

/** Minimum Y before starting a new block (keeps content above footer). */
export const unifiedPdfMinBodyY = () => UNIFIED_PDF_LAYOUT.footerReserve + 24

/**
 * Paginate long body copy — returns updated y (and optional new page ref via callback).
 * @param {import('pdf-lib').PDFPage} page
 * @param {number} y
 * @param {object} ctx fonts + logo ctx
 * @param {string} text
 * @param {object} opts
 * @param {{ ensureSpace?: (needed: number) => { page: import('pdf-lib').PDFPage, y: number } }} [paginate]
 */
export const drawUnifiedParagraphBlockPaginated = (page, y, ctx, text, opts = {}, paginate = null) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const size = opts.size ?? TYPE.body
  const lineHeight = opts.lineHeight ?? 15
  const color = opts.color ?? t.muted
  const minY = opts.minY ?? unifiedPdfMinBodyY()
  let currentPage = page
  let currentY = y

  const ensure = (needed) => {
    if (currentY - needed >= minY || !paginate?.ensureSpace) {
      return
    }
    const next = paginate.ensureSpace(needed)
    currentPage = next.page
    currentY = next.y
  }

  const paragraphs = String(text ?? '').split('\n')
  for (const para of paragraphs) {
    if (!para.trim()) {
      ensure(lineHeight * 0.35)
      currentY -= lineHeight * 0.35
      continue
    }
    const wrapped = wrapPlainLinesWithFont(ctx.font, para, size, contentW)
    ensure(wrapped.length * lineHeight + lineHeight * 0.2)
    for (const line of wrapped) {
      currentPage.drawText(line, { x: margin, y: currentY, font: ctx.font, size, color })
      currentY -= lineHeight
    }
    currentY -= lineHeight * 0.2
  }

  return { page: currentPage, y: currentY }
}

/**
 * Full sample PDF (two pages) — regenerate with npm run generate:unified-pdf-sample
 * @returns {Promise<Uint8Array>}
 */
export const buildGsolUnifiedPdfTemplateSampleBytes = async () => {
  const doc = await PDFDocument.create()
  const { pageWidth, pageHeight } = UNIFIED_PDF_LAYOUT
  const ctx = { ...(await loadUnifiedPdfFonts(doc)), ...(await embedUnifiedLogo(doc)) }

  const page1 = doc.addPage([pageWidth, pageHeight])
  let y = drawUnifiedDocumentHeader(page1, ctx, {
    title: 'Golf Sol Ireland — Master Document Template',
    subtitle:
      'Cream page, forest header band, homepage crest, and readable type. Use this shell for enquiries, quotes, invoices, and terms.'
  })

  y = drawUnifiedSectionHeading(page1, y - 8, ctx, 'Trip details we received')
  y = drawUnifiedKeyValueTable(page1, y, ctx, [
    { label: 'Full name', value: 'Patrick McSample' },
    { label: 'Email', value: 'patrick.example@golfsolirl.com' },
    { label: 'Phone / WhatsApp', value: '+353 87 446 4766' },
    { label: 'Trip interest', value: 'Costa del Sol — 4 golfers — April 2026' },
    { label: 'Reference', value: 'GSI-DEMO-0001' }
  ])

  y -= 12
  y = drawUnifiedGoldRule(page1, y)
  y = drawUnifiedSectionHeading(page1, y, ctx, 'Quote excerpt (sample)')
  y = drawUnifiedKeyValueTable(page1, y, ctx, [
    { label: 'Package', value: 'Stay & play — 5 nights / 3 rounds' },
    { label: 'Lead price (sample)', value: 'EUR 2,450.00 per person (indicative)' },
    { label: 'Notes', value: 'Final price follows supplier confirmation and your signed acceptance.' }
  ])

  drawUnifiedDocumentFooter(page1, 52, ctx, [], { current: 1, total: 2 })

  const page2 = doc.addPage([pageWidth, pageHeight])
  y = drawUnifiedDocumentHeader(page2, ctx, {
    title: 'Transfer experience',
    subtitle: 'Private meet-and-greet at Malaga Airport (AGP), golf-bag-friendly Mercedes fleet.'
  })

  const body = [
    'This block shows how longer text wraps inside the master shell without clipping or overlap.',
    '',
    'The same header and footer appear on enquiry packs, proposals, invoices, receipts, terms, and client portal documents.'
  ].join('\n')

  y = drawUnifiedParagraphBlock(page2, y - 10, ctx, body, { size: TYPE.body, lineHeight: 16, color: t.ink })

  drawUnifiedDocumentFooter(page2, 52, ctx, [], { current: 2, total: 2 })

  return doc.save()
}
