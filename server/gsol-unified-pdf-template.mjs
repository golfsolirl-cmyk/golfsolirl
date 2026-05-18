/**
 * Golf Sol Ireland v5 PDF template — "FROM PLANE TO FAIRWAY" branded shell.
 * White background, logo crest top-right, tagline + company info header, page X of Y footer.
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
  headerHeight: 100,
  footerHeight: 50
}

const V5_GREEN = rgb(6 / 255, 59 / 255, 42 / 255)
const V5_GREEN_LIGHT = rgb(15 / 255, 81 / 255, 60 / 255)
const V5_INK = rgb(22 / 255, 35 / 255, 29 / 255)
const V5_MUTED = rgb(102 / 255, 115 / 255, 109 / 255)
const V5_RULE = rgb(200 / 255, 210 / 255, 205 / 255)
const V5_WHITE = rgb(1, 1, 1)
const V5_STRIPE = rgb(247 / 255, 250 / 255, 248 / 255)

/** @param {import('pdf-lib').PDFDocument} doc */
export const loadUnifiedPdfFonts = async (doc) => ({
  font: await doc.embedFont(StandardFonts.Helvetica),
  fontBold: await doc.embedFont(StandardFonts.HelveticaBold)
})

/** @param {import('pdf-lib').PDFDocument} doc */
export const embedUnifiedLogo = async (doc) => {
  const logoImage = await doc.embedPng(readFileSync(brandedPdfAssetPaths.homepageCrest))
  const logoH = 60
  const logoW = (logoImage.width / logoImage.height) * logoH
  return { logoImage, logoW, logoH }
}

/**
 * v5 header: white page, green top rule, "FROM PLANE TO FAIRWAY" tagline,
 * company info, logo crest top-right, document title, optional subtitle.
 * @returns {number} Y to start body content
 */
export const drawUnifiedDocumentHeader = (page, ctx, header) => {
  const { pageWidth, pageHeight, margin } = UNIFIED_PDF_LAYOUT

  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: V5_WHITE })
  page.drawRectangle({ x: 0, y: pageHeight - 3, width: pageWidth, height: 3, color: V5_GREEN })

  const topY = pageHeight - 24

  page.drawText('FROM PLANE TO FAIRWAY', {
    x: margin, y: topY, font: ctx.fontBold, size: 9, color: V5_GREEN
  })
  page.drawText(sanitizeStandardFontText('GolfSol Ireland - Irish-owned Costa del Sol Golf Travel'), {
    x: margin, y: topY - 16, font: ctx.font, size: 8, color: V5_MUTED
  })
  page.drawText(sanitizeStandardFontText('www.golfsolirl.com - info@golfsolirl.com'), {
    x: margin, y: topY - 28, font: ctx.font, size: 8, color: V5_MUTED
  })
  page.drawText(sanitizeStandardFontText(`Registered in Ireland - Company No. ${gsolCompanyLegal.companyRegistrationNumber}`), {
    x: margin, y: topY - 40, font: ctx.font, size: 8, color: V5_MUTED
  })

  page.drawImage(ctx.logoImage, {
    x: pageWidth - margin - ctx.logoW,
    y: topY - ctx.logoH + 10,
    width: ctx.logoW, height: ctx.logoH
  })

  const ruleY = topY - 52
  page.drawRectangle({ x: margin, y: ruleY, width: pageWidth - margin * 2, height: 0.75, color: V5_RULE })

  const titleY = ruleY - 22
  page.drawText(sanitizeStandardFontText(header.title), {
    x: margin, y: titleY, font: ctx.fontBold, size: 16, color: V5_GREEN
  })

  let bodyStartY = titleY - 24
  if (header.subtitle?.trim()) {
    page.drawText(sanitizeStandardFontText(header.subtitle), {
      x: margin, y: bodyStartY, font: ctx.font, size: 9, color: V5_MUTED,
      maxWidth: pageWidth - margin * 2, lineHeight: 12
    })
    bodyStartY -= 20
  }

  return bodyStartY
}

/**
 * v5 footer: "-- pageNum of totalPages --" centred + company line.
 */
export const drawUnifiedDocumentFooter = (page, bottomY, ctx, extraLines = [], pageInfo = null) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2

  page.drawRectangle({ x: margin, y: 48, width: contentW, height: 0.5, color: V5_RULE })

  if (pageInfo) {
    const pageText = `-- ${pageInfo.current} of ${pageInfo.total} --`
    const pw = ctx.font.widthOfTextAtSize(pageText, 9)
    page.drawText(pageText, {
      x: (pageWidth - pw) / 2, y: 34, font: ctx.font, size: 9, color: V5_MUTED
    })
  }

  const footerLines = [
    'GolfSol Ireland - Irish-owned Costa del Sol Golf Travel',
    ...extraLines
  ]
  let fy = 22
  for (const line of footerLines) {
    page.drawText(sanitizeStandardFontText(line), {
      x: margin, y: fy, font: ctx.font, size: 7.5, color: V5_MUTED
    })
    fy -= 10
  }
}

/** Backwards-compat alias */
export const drawUnifiedFooterLine = (page, ctx, text, y = 30) => {
  drawUnifiedDocumentFooter(page, y, ctx, [text])
}

/**
 * Key-value table with alternating striped rows.
 * @returns {number} next Y below table
 */
export const drawUnifiedKeyValueTable = (page, startY, ctx, rows) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const labelColW = Math.min(168, Math.floor(contentW * 0.32))
  const valueX = margin + labelColW + 18
  const valueMaxW = contentW - labelColW - 36
  const labelMaxW = labelColW - 8
  const labelSize = 7.5
  const valueSize = 10.5
  const labelLH = 11
  const valueLH = 13
  const padV = 12
  let yTop = startY

  for (let i = 0; i < rows.length; i += 1) {
    const bg = i % 2 === 0 ? V5_STRIPE : V5_WHITE
    const labelLines = wrapPlainLinesWithFont(ctx.fontBold, rows[i].label.toUpperCase(), labelSize, labelMaxW)
    const valueLines = wrapPlainLinesWithFont(ctx.font, rows[i].value, valueSize, valueMaxW)
    const labelBlockH = Math.max(labelLines.length, 1) * labelLH
    const valueBlockH = Math.max(valueLines.length, 1) * valueLH
    const innerH = padV * 2 + Math.max(labelBlockH, valueBlockH)
    const bottom = yTop - innerH

    page.drawRectangle({
      x: margin, y: bottom, width: contentW, height: innerH,
      color: bg, borderColor: V5_RULE, borderWidth: 0.5
    })
    page.drawRectangle({
      x: margin + labelColW + 8, y: bottom + 6, width: 0.45, height: innerH - 12, color: V5_RULE
    })

    let lb = yTop - padV - labelSize
    for (const line of labelLines) {
      page.drawText(line, { x: margin + 16, y: lb, font: ctx.fontBold, size: labelSize, color: V5_GREEN_LIGHT })
      lb -= labelLH
    }

    let vb = yTop - padV - valueSize
    for (const line of valueLines) {
      page.drawText(line, { x: valueX, y: vb, font: ctx.font, size: valueSize, color: V5_INK })
      vb -= valueLH
    }

    yTop = bottom - 3
  }

  return yTop
}

export const estimateUnifiedKeyValueTableHeight = (ctx, rows) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const labelColW = Math.min(168, Math.floor(contentW * 0.32))
  const valueMaxW = contentW - labelColW - 36
  const labelMaxW = labelColW - 8
  const labelLH = 11
  const valueLH = 13
  const padV = 12
  let total = 0
  for (const row of rows) {
    const labelLines = wrapPlainLinesWithFont(ctx.fontBold, row.label.toUpperCase(), 7.5, labelMaxW)
    const valueLines = wrapPlainLinesWithFont(ctx.font, row.value, 10.5, valueMaxW)
    const labelBlockH = Math.max(labelLines.length, 1) * labelLH
    const valueBlockH = Math.max(valueLines.length, 1) * valueLH
    total += padV * 2 + Math.max(labelBlockH, valueBlockH) + 3
  }
  return total
}

/**
 * Section heading with green left accent bar.
 */
export const drawUnifiedSectionHeading = (page, y, ctx, title) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  page.drawRectangle({ x: margin, y: y - 14, width: 4, height: 14, color: V5_GREEN })
  page.drawText(sanitizeStandardFontText(title), {
    x: margin + 12, y, font: ctx.fontBold, size: 11.5, color: V5_GREEN_LIGHT
  })
  page.drawRectangle({ x: margin, y: y - 28, width: contentW, height: 0.55, color: V5_RULE })
  return y - 36
}

/**
 * Section card: title, body paragraph, bullet list.
 * @returns {number} next Y below the card
 */
export const drawUnifiedBulletCard = (page, startY, ctx, section) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const pad = 16
  const innerLeft = margin + pad
  const innerW = contentW - pad * 2
  const titleSize = 11.5
  const titleLH = 14
  const bodySize = 10.5
  const bodyLH = 14
  const bulletSize = 10.5
  const bulletLH = 14

  const titleLines = wrapPlainLinesWithFont(ctx.fontBold, section.title, titleSize, innerW)
  const bodyLines = wrapPlainLinesWithFont(ctx.font, section.body, bodySize, innerW - 4)
  const bulletLineGroups = (section.points ?? []).map((p) =>
    wrapPlainLinesWithFont(ctx.font, `- ${p}`, bulletSize, innerW - 14)
  )

  const titleBlockH = titleLines.length * titleLH
  const bodyBlockH = bodyLines.length * bodyLH
  let bulletsH = 0
  for (const g of bulletLineGroups) { bulletsH += g.length * bulletLH + 8 }

  const cardH = pad + titleBlockH + 12 + bodyBlockH + 14 + bulletsH + pad
  const bottom = startY - cardH

  page.drawRectangle({
    x: margin, y: bottom, width: contentW, height: cardH,
    color: V5_WHITE, borderColor: V5_RULE, borderWidth: 0.75
  })

  let y = startY - pad - titleSize
  for (const line of titleLines) {
    page.drawText(line, { x: innerLeft, y, font: ctx.fontBold, size: titleSize, color: V5_INK })
    y -= titleLH
  }

  y -= 8
  for (const line of bodyLines) {
    page.drawText(line, { x: innerLeft, y, font: ctx.font, size: bodySize, color: V5_MUTED })
    y -= bodyLH
  }

  y -= 10
  for (const group of bulletLineGroups) {
    for (const line of group) {
      page.drawText(line, { x: innerLeft, y, font: ctx.font, size: bulletSize, color: V5_INK })
      y -= bulletLH
    }
    y -= 8
  }

  return bottom - 14
}

export const estimateUnifiedBulletCardHeight = (ctx, section, contentW) => {
  const pad = 16
  const innerW = contentW - pad * 2
  const titleLH = 14
  const bodyLH = 14
  const bulletLH = 14
  const titleLines = wrapPlainLinesWithFont(ctx.fontBold, section.title, 11.5, innerW)
  const bodyLines = wrapPlainLinesWithFont(ctx.font, section.body, 10.5, innerW - 4)
  let bulletsH = 0
  for (const point of section.points ?? []) {
    const lines = wrapPlainLinesWithFont(ctx.font, `- ${point}`, 10.5, innerW - 14)
    bulletsH += lines.length * bulletLH + 8
  }
  return pad + titleLines.length * titleLH + 12 + bodyLines.length * bodyLH + 14 + bulletsH + pad + 20
}

/** Green rule separator (thin). */
export const drawUnifiedGoldRule = (page, y) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  page.drawRectangle({ x: margin, y: y - 1, width: contentW * 0.3, height: 2, color: V5_GREEN })
  page.drawRectangle({ x: margin + contentW * 0.3 + 6, y: y - 0.5, width: contentW * 0.7 - 6, height: 0.5, color: V5_RULE })
  return y - 20
}

/**
 * Word-wrap for WinAnsi-safe text.
 * @param {import('pdf-lib').PDFFont} font
 */
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
  const size = opts.size ?? 10
  const lineHeight = opts.lineHeight ?? 14
  const color = opts.color ?? V5_MUTED
  const paragraphs = String(text ?? '').split('\n')
  let y = topY
  for (const para of paragraphs) {
    if (!para.trim()) { y -= lineHeight * 0.35; continue }
    const wrapped = wrapPlainLinesWithFont(ctx.font, para, size, contentW)
    for (const line of wrapped) {
      page.drawText(line, { x: margin, y, font: ctx.font, size, color })
      y -= lineHeight
    }
    y -= lineHeight * 0.2
  }
  return y
}

/**
 * Full v5 sample PDF (two pages) for review.
 * @returns {Promise<Uint8Array>}
 */
export const buildGsolUnifiedPdfTemplateSampleBytes = async () => {
  const doc = await PDFDocument.create()
  const { pageWidth, pageHeight } = UNIFIED_PDF_LAYOUT
  const ctx = { ...(await loadUnifiedPdfFonts(doc)), ...(await embedUnifiedLogo(doc)) }

  const page1 = doc.addPage([pageWidth, pageHeight])
  let y = drawUnifiedDocumentHeader(page1, ctx, {
    title: 'GolfSol Ireland Enquiry Document',
    subtitle: 'Important Notice: This document confirms receipt of your enquiry only. It is not a VAT receipt, invoice, booking confirmation, quotation or legally binding agreement.'
  })

  y = drawUnifiedSectionHeading(page1, y - 8, ctx, 'Trip Details We Received')
  y = drawUnifiedKeyValueTable(page1, y, ctx, [
    { label: 'Full name', value: 'Patrick McSample' },
    { label: 'Email', value: 'patrick.example@golfsolirl.com' },
    { label: 'Phone / WhatsApp', value: '+353 87 000 0000' },
    { label: 'Trip interest', value: 'Costa del Sol - 4 golfers - April 2026' },
    { label: 'Reference', value: 'GSI-DEMO-0001' }
  ])

  y -= 12
  y = drawUnifiedGoldRule(page1, y)
  y = drawUnifiedSectionHeading(page1, y, ctx, 'Quote Excerpt (Sample)')
  y = drawUnifiedKeyValueTable(page1, y, ctx, [
    { label: 'Package', value: 'Stay & play - 5 nights / 3 rounds' },
    { label: 'Lead price (sample)', value: 'EUR 2,450.00 per person (indicative)' },
    { label: 'Notes', value: 'Final price follows supplier confirmation and your signed acceptance.' }
  ])

  drawUnifiedDocumentFooter(page1, 52, ctx, [], { current: 1, total: 2 })

  const page2 = doc.addPage([pageWidth, pageHeight])
  y = drawUnifiedDocumentHeader(page2, ctx, {
    title: 'Transfer Experience',
    subtitle: 'Private meet-and-greet at Malaga Airport (AGP), golf-bag-friendly Mercedes fleet, direct transfer to your resort.'
  })

  const body = [
    'This block shows how longer text wraps inside the v5 shell. Replace with your real content for each document type.',
    '',
    'The same header and footer appear on every page of every PDF generated by the system - enquiry packs, proposals, invoices, receipts, terms, and client portal documents all share this branded shell.'
  ].join('\n')

  y = drawUnifiedParagraphBlock(page2, y - 10, ctx, body, { size: 10.5, lineHeight: 15, color: V5_INK })

  drawUnifiedDocumentFooter(page2, 52, ctx, [], { current: 2, total: 2 })

  return doc.save()
}
