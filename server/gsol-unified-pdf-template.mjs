/**
 * Single Golf Sol Ireland PDF chrome (header band, section titles, key-value rows, footer).
 * Use for new PDFs: form submission copies, quote summaries, policy PDFs, invoices — pass different body content.
 */
import { readFileSync } from 'node:fs'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { brandedPdfAssetPaths, heroDescriptionColor, pdfEmailTheme } from './pdf-email-brand.mjs'
import { gsolCompanyLegal } from './email-constants.mjs'

export const UNIFIED_PDF_LAYOUT = {
  pageWidth: 595.28,
  pageHeight: 841.89,
  /** Generous side margins (pt) — reads more “premium print” than tight web margins. */
  margin: 48,
  /** Height of emerald header band (pt); must clear logo + stacked titles. */
  headerBandH: 112,
  /** Distance from top of page to bottom edge of header band. */
  headerBandBottom: 128
}

/** Logo width on page (pt); height follows PNG aspect ratio. */
export const UNIFIED_PDF_LOGO_TARGET_WIDTH_PT = 176

/**
 * @param {import('pdf-lib').PDFDocument} doc
 */
export const loadUnifiedPdfFonts = async (doc) => ({
  font: await doc.embedFont(StandardFonts.Helvetica),
  fontBold: await doc.embedFont(StandardFonts.HelveticaBold)
})

/**
 * @param {import('pdf-lib').PDFDocument} doc
 */
export const embedUnifiedLogo = async (doc) => {
  const logoImage = await doc.embedPng(readFileSync(brandedPdfAssetPaths.homepageCrest))
  const w = UNIFIED_PDF_LOGO_TARGET_WIDTH_PT
  const logoW = w
  const logoH = (logoImage.height / logoImage.width) * w
  return { logoImage, logoW, logoH }
}

/**
 * Cream page fill + emerald header + gold rule + logo + titles. Returns Y (baseline) to start body **below** header.
 * @param {import('pdf-lib').PDFPage} page
 * @param {{ font: import('pdf-lib').PDFFont; fontBold: import('pdf-lib').PDFFont; logoImage: import('pdf-lib').PDFImage; logoW: number; logoH: number }} ctx
 * @param {{ kicker: string; title: string; subtitle?: string }} header
 * @returns {number}
 */
export const drawUnifiedDocumentHeader = (page, ctx, header) => {
  const { pageWidth, pageHeight, margin, headerBandH, headerBandBottom } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const bandBottom = pageHeight - headerBandBottom
  const bandTop = bandBottom + headerBandH

  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: pdfEmailTheme.cream })
  page.drawRectangle({ x: margin, y: bandBottom, width: contentW, height: headerBandH, color: pdfEmailTheme.green })
  page.drawRectangle({ x: margin, y: bandBottom, width: contentW, height: 4, color: pdfEmailTheme.gold })
  page.drawRectangle({
    x: margin,
    y: bandBottom + 4,
    width: contentW,
    height: 0.35,
    color: pdfEmailTheme.goldDeep
  })

  const logoInset = 16
  const logoBottom = bandBottom + (headerBandH - ctx.logoH) / 2
  page.drawImage(ctx.logoImage, {
    x: margin + logoInset,
    y: logoBottom,
    width: ctx.logoW,
    height: ctx.logoH
  })

  const textGutter = 22
  const textLeft = margin + logoInset + ctx.logoW + textGutter
  const textBlockW = Math.max(120, pageWidth - margin - textLeft)

  page.drawText(sanitizeStandardFontText(header.kicker), {
    x: textLeft,
    y: bandTop - 26,
    font: ctx.fontBold,
    size: 8.5,
    color: pdfEmailTheme.gold
  })
  page.drawText(sanitizeStandardFontText(header.title), {
    x: textLeft,
    y: bandTop - 46,
    font: ctx.fontBold,
    size: 18,
    color: pdfEmailTheme.white
  })
  if (header.subtitle?.trim()) {
    page.drawText(sanitizeStandardFontText(header.subtitle), {
      x: textLeft,
      y: bandTop - 70,
      font: ctx.font,
      size: 9.5,
      color: heroDescriptionColor,
      maxWidth: textBlockW,
      lineHeight: 13
    })
  }

  return bandBottom - 36
}

/**
 * Uppercase label + value, striped rows (matches invoice / enquiry PDF rhythm).
 * @param {import('pdf-lib').PDFPage} page
 * @param {number} startY — baseline area **below** first row top (we draw downward in Y).
 * @param {{ label: string; value: string }[]} rows
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
    const bg = i % 2 === 0 ? pdfEmailTheme.paleGreen : pdfEmailTheme.white
    const labelLines = wrapPlainLinesWithFont(ctx.fontBold, rows[i].label.toUpperCase(), labelSize, labelMaxW)
    const valueLines = wrapPlainLinesWithFont(ctx.font, rows[i].value, valueSize, valueMaxW)
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
      borderColor: pdfEmailTheme.sand,
      borderWidth: 0.5
    })
    page.drawRectangle({
      x: margin + labelColW + 8,
      y: bottom + 6,
      width: 0.45,
      height: innerH - 12,
      color: pdfEmailTheme.sand
    })

    let lb = yTop - padV - labelSize
    for (const line of labelLines) {
      page.drawText(line, {
        x: margin + 16,
        y: lb,
        font: ctx.fontBold,
        size: labelSize,
        color: pdfEmailTheme.greenSoft
      })
      lb -= labelLH
    }

    let vb = yTop - padV - valueSize
    for (const line of valueLines) {
      page.drawText(line, {
        x: valueX,
        y: vb,
        font: ctx.font,
        size: valueSize,
        color: pdfEmailTheme.ink
      })
      vb -= valueLH
    }

    yTop = bottom - 3
  }

  return yTop
}

/** Vertical space (pt) for key-value rows — matches {@link drawUnifiedKeyValueTable}. */
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
    const innerH = padV * 2 + Math.max(labelBlockH, valueBlockH)
    total += innerH + 3
  }
  return total
}

/**
 * Section card: title, intro paragraph, bullet list (wrapped — no clipping).
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
    wrapPlainLinesWithFont(ctx.font, `• ${p}`, bulletSize, innerW - 14)
  )

  const titleBlockH = titleLines.length * titleLH
  const bodyBlockH = bodyLines.length * bodyLH
  let bulletsH = 0
  for (const g of bulletLineGroups) {
    bulletsH += g.length * bulletLH + 8
  }

  const cardH = pad + titleBlockH + 12 + bodyBlockH + 14 + bulletsH + pad
  const bottom = startY - cardH

  page.drawRectangle({
    x: margin,
    y: bottom,
    width: contentW,
    height: cardH,
    color: pdfEmailTheme.white,
    borderColor: pdfEmailTheme.sand,
    borderWidth: 0.75
  })

  let y = startY - pad - titleSize
  for (const line of titleLines) {
    page.drawText(line, {
      x: innerLeft,
      y,
      font: ctx.fontBold,
      size: titleSize,
      color: pdfEmailTheme.ink
    })
    y -= titleLH
  }

  y -= 8
  for (const line of bodyLines) {
    page.drawText(line, {
      x: innerLeft,
      y,
      font: ctx.font,
      size: bodySize,
      color: pdfEmailTheme.muted
    })
    y -= bodyLH
  }

  y -= 10
  for (const group of bulletLineGroups) {
    for (const line of group) {
      page.drawText(line, {
        x: innerLeft,
        y,
        font: ctx.font,
        size: bulletSize,
        color: pdfEmailTheme.ink
      })
      y -= bulletLH
    }
    y -= 8
  }

  return bottom - 14
}

/**
 * Approximate vertical space needed for {@link drawUnifiedBulletCard} (for pagination).
 */
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
    const lines = wrapPlainLinesWithFont(ctx.font, `• ${point}`, 10.5, innerW - 14)
    bulletsH += lines.length * bulletLH + 8
  }
  return pad + titleLines.length * titleLH + 12 + bodyLines.length * bodyLH + 14 + bulletsH + pad + 20
}

/** Footer line with optional page x of y (same shell as sample PDFs). */
export const drawUnifiedFooterLine = (page, ctx, text, y = 30) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  page.drawText(sanitizeStandardFontText(text), {
    x: margin,
    y,
    font: ctx.font,
    size: 9,
    color: pdfEmailTheme.muted,
    maxWidth: contentW * 0.72,
    lineHeight: 12
  })
}

/**
 * @param {import('pdf-lib').PDFPage} page
 * @param {number} y — baseline for heading text
 */
export const drawUnifiedSectionHeading = (page, y, ctx, title) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const accentH = 14
  page.drawRectangle({ x: margin, y: y - accentH, width: 4, height: accentH, color: pdfEmailTheme.gold })
  page.drawText(sanitizeStandardFontText(title), {
    x: margin + 12,
    y,
    font: ctx.fontBold,
    size: 11.5,
    color: pdfEmailTheme.greenSoft
  })
  page.drawRectangle({
    x: margin,
    y: y - 28,
    width: contentW,
    height: 0.55,
    color: pdfEmailTheme.sand
  })
  return y - 36
}

/**
 * Word-wrap for WinAnsi-safe text (use with Helvetica / embedded fonts).
 * @param {import('pdf-lib').PDFFont} font
 */
export const wrapPlainLinesWithFont = (font, text, fontSize, maxWidth) => {
  const words = sanitizeStandardFontText(text).split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return ['']
  }
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
  const color = opts.color ?? pdfEmailTheme.muted
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

/**
 * Thin gold accent line before a block.
 */
export const drawUnifiedGoldRule = (page, y) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  page.drawRectangle({ x: margin, y: y - 1, width: contentW * 0.22, height: 2.5, color: pdfEmailTheme.gold })
  page.drawRectangle({ x: margin + contentW * 0.22 + 6, y: y - 0.5, width: contentW * 0.78 - 6, height: 0.55, color: pdfEmailTheme.sand })
  return y - 20
}

/**
 * @param {import('pdf-lib').PDFPage} page
 * @param {number} bottomY — lowest line baseline (keep >= 56 for safe page-bottom margin)
 *
 * Pre-wraps each line against contentW and stacks the wrapped lines with a fixed step,
 * so pdf-lib's internal auto-wrap can never overlap a sibling line or bleed past the page edge.
 */
export const drawUnifiedDocumentFooter = (page, bottomY, ctx, extraLines = []) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const fontSize = 8.5
  const lineStep = 12
  const inputLines = [
    'Golf Sol Ireland · Irish-owned Costa del Sol golf travel',
    `Company registration no. ${gsolCompanyLegal.companyRegistrationNumber} (Ireland)`,
    ...extraLines
  ]
  const wrapped = inputLines.flatMap((line) =>
    wrapPlainLinesWithFont(ctx.font, sanitizeStandardFontText(line), fontSize, contentW)
  )
  const safeBottomY = Math.max(bottomY, 56)
  let y = safeBottomY + (wrapped.length - 1) * lineStep
  page.drawRectangle({
    x: margin,
    y: y + fontSize + 6,
    width: contentW,
    height: 0.65,
    color: pdfEmailTheme.sand
  })
  for (const line of wrapped) {
    page.drawText(line, {
      x: margin,
      y,
      font: ctx.font,
      size: fontSize,
      color: pdfEmailTheme.muted
    })
    y -= lineStep
  }
}

/**
 * Full sample PDF (two pages) for stakeholder review — same chrome as production helpers above.
 * @returns {Promise<Uint8Array>}
 */
export const buildGsolUnifiedPdfTemplateSampleBytes = async () => {
  const doc = await PDFDocument.create()
  const { pageWidth, pageHeight } = UNIFIED_PDF_LAYOUT
  const ctx = { ...(await loadUnifiedPdfFonts(doc)), ...(await embedUnifiedLogo(doc)) }

  const page1 = doc.addPage([pageWidth, pageHeight])
  let y = drawUnifiedDocumentHeader(page1, ctx, {
    kicker: 'WHERE YOUR COSTA ROUND BEGINS',
    title: 'Your Costa del Sol golf trip starts here',
    subtitle:
      'Meet-and-greet at Málaga (AGP), golf-bag-friendly Mercedes transfers and tee-time-ready pacing — every GolfSol Ireland transfer is fully insured.'
  })

  y = drawUnifiedSectionHeading(page1, y - 8, ctx, 'FORM SUBMISSION COPY (FICTIONAL)')
  y = drawUnifiedKeyValueTable(page1, y, ctx, [
    { label: 'Full name', value: 'Patrick McSample' },
    { label: 'Email', value: 'patrick.example@golfsolirl.com' },
    { label: 'Phone / WhatsApp', value: '+353 87 000 0000' },
    { label: 'Trip interest', value: 'Costa del Sol · 4 golfers · April 2026' },
    { label: 'Reference', value: 'GSI-DEMO-0001' }
  ])

  y -= 12
  y = drawUnifiedGoldRule(page1, y)
  y = drawUnifiedSectionHeading(page1, y, ctx, 'QUOTE EXCERPT (FICTIONAL)')
  y = drawUnifiedKeyValueTable(page1, y, ctx, [
    { label: 'Package', value: 'Stay & play · 5 nights / 3 rounds' },
    { label: 'Lead price (sample)', value: 'EUR 2,450.00 per person (indicative)' },
    { label: 'Notes', value: 'Final price follows supplier confirmation and your signed acceptance.' }
  ])

  drawUnifiedDocumentFooter(page1, 52, ctx, [
    'This file is a layout sample only — not a quote, contract, or booking confirmation.'
  ])

  const page2 = doc.addPage([pageWidth, pageHeight])
  y = drawUnifiedDocumentHeader(page2, ctx, {
    kicker: 'POLICY / LEGAL STYLE (SAMPLE)',
    title: 'Terms or privacy excerpt',
    subtitle: 'Use the same header and footer; replace this page with policy text from your counsel.'
  })

  const policyBody = [
    'This block shows how longer text wraps inside the unified shell. Replace with your real Terms, Privacy Policy, or cookie wording.',
    '',
    'When you approve this template, wire each product flow to call the same draw helpers with different rows and paragraphs — form PDFs for the customer copy, quote PDFs from package data, static T&Cs for email + portal, and invoices from Stripe totals.'
  ].join('\n')

  y = drawUnifiedParagraphBlock(page2, y - 10, ctx, policyBody, {
    size: 10.5,
    lineHeight: 15,
    color: pdfEmailTheme.ink
  })

  drawUnifiedDocumentFooter(page2, 52, ctx, [
    'Policy sample text is illustrative only and has no legal effect.'
  ])

  return doc.save()
}
