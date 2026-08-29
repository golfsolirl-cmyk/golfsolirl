import { readFileSync } from 'node:fs'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import sharp from 'sharp'
import { buildProposalDocument } from '../shared/document-templates.mjs'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { brandedPdfAssetPaths, pdfEmailTheme } from './pdf-email-brand.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  drawUnifiedDocumentFooter,
  drawUnifiedDocumentHeader,
  embedUnifiedLogo
} from './gsol-unified-pdf-template.mjs'

const fitAssetForPdf = (assetPath, width, height) =>
  sharp(readFileSync(assetPath))
    .resize(width, height, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer()

const embedPdfJpg = async (pdfDocument, assetPath, width, height) =>
  pdfDocument.embedJpg(await fitAssetForPdf(assetPath, width, height))

const pageWidth = UNIFIED_PDF_LAYOUT.pageWidth
const pageHeight = UNIFIED_PDF_LAYOUT.pageHeight

/** Minimum reading size (pt) on proposal PDFs — slightly roomier than legacy enquiry PDF for long copy. */
const PDF_READING_PT = 16
const PDF_READING_LH = 25
const BODY_LINE_HEIGHT = 27

const drawBrandedPdfPill = (page, text, x, y, font) => {
  const pillTextSize = PDF_READING_PT
  const pillH = 38
  const safe = sanitizeStandardFontText(text)
  page.drawRectangle({
    x,
    y: y - pillH,
    width: Math.min(300, font.widthOfTextAtSize(safe, pillTextSize) + 38),
    height: pillH,
    color: pdfEmailTheme.greenSoft,
    borderColor: pdfEmailTheme.gold,
    borderWidth: 0.7
  })
  page.drawText(safe, { x: x + 16, y: y - 14, font, size: pillTextSize, color: pdfEmailTheme.gold })
}

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'proposal'

const wrapText = ({ text, font, fontSize, maxWidth }) => {
  const paragraphs = sanitizeStandardFontText(text).split('\n')
  const lines = []

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.split(/\s+/).filter(Boolean)

    if (words.length === 0) {
      lines.push('')
      return
    }

    let currentLine = words[0]

    for (let index = 1; index < words.length; index += 1) {
      const nextLine = `${currentLine} ${words[index]}`

      if (font.widthOfTextAtSize(nextLine, fontSize) <= maxWidth) {
        currentLine = nextLine
        continue
      }

      lines.push(currentLine)
      currentLine = words[index]
    }

    lines.push(currentLine)

    if (paragraphIndex < paragraphs.length - 1) {
      lines.push('')
    }
  })

  return lines
}

/** Empty lines = paragraph gap (keeps font size, avoids overlap). */
const measureWrappedDrawHeight = (lines, lineHeight) => {
  let total = 0
  for (const line of lines) {
    if (line.trim() === '') {
      total += lineHeight * 0.55
    } else {
      total += lineHeight
    }
  }
  return Math.max(lineHeight * 0.85, total)
}

const drawTextBlock = ({
  page,
  text,
  x,
  y,
  font,
  fontSize,
  color,
  maxWidth,
  lineHeight = fontSize * 1.45
}) => {
  const lines = wrapText({ text, font, fontSize, maxWidth })
  let currentY = y

  lines.forEach((line) => {
    if (line.trim() === '') {
      currentY -= lineHeight * 0.55
      return
    }
    page.drawText(line, {
      x,
      y: currentY,
      font,
      size: fontSize,
      color
    })

    currentY -= lineHeight
  })

  return currentY
}

const drawCard = ({ page, x, topY, width, height, fillColor = pdfEmailTheme.white, borderColor = pdfEmailTheme.sand }) => {
  page.drawRectangle({
    x,
    y: topY - height,
    width,
    height,
    color: fillColor,
    borderColor,
    borderWidth: 0.8
  })
}

const measureTileHeight = (value, regularFont, width) => {
  const valueLines = wrapText({
    text: value,
    font: regularFont,
    fontSize: PDF_READING_PT,
    maxWidth: width - 24
  })
  const valueBlockH = measureWrappedDrawHeight(valueLines, PDF_READING_LH)
  /** Label band (to baseline) + value block + inner bottom padding — matches drawTile geometry. */
  return Math.max(100, 48 + valueBlockH + 22)
}

const drawTile = ({ page, x, y, width, height, label, value, boldFont, regularFont }) => {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: pdfEmailTheme.paleGold,
    borderColor: pdfEmailTheme.sand,
    borderWidth: 0.8
  })

  page.drawText(sanitizeStandardFontText(label), {
    x: x + 14,
    y: y + height - 26,
    font: boldFont,
    size: PDF_READING_PT,
    color: pdfEmailTheme.goldDeep
  })

  drawTextBlock({
    page,
    text: value,
    x: x + 14,
    y: y + height - 50,
    font: regularFont,
    fontSize: PDF_READING_PT,
    color: pdfEmailTheme.ink,
    maxWidth: width - 28,
    lineHeight: PDF_READING_LH
  })
}

const drawChecklistLine = ({ page, label, x, y, width, dark = false, regularFont }) => {
  page.drawText(sanitizeStandardFontText(label), {
    x,
    y,
    font: regularFont,
    size: PDF_READING_PT,
    color: dark ? pdfEmailTheme.white : pdfEmailTheme.muted
  })

  page.drawLine({
    start: { x, y: y - 10 },
    end: { x: x + width, y: y - 8 },
    color: dark ? pdfEmailTheme.white : pdfEmailTheme.sand,
    thickness: 1,
    opacity: dark ? 0.28 : 0.45
  })
}

const infoCardTextMaxWidth = 219
const infoItemFontSize = PDF_READING_PT
const infoItemLineHeight = PDF_READING_LH

const infoItemLineHeightLoose = infoItemLineHeight + 2

const measureInfoItemsHeight = (items, font) => {
  let total = 0
  for (const item of items) {
    const lines = wrapText({ text: item, font, fontSize: infoItemFontSize, maxWidth: infoCardTextMaxWidth })
    total += measureWrappedDrawHeight(lines, infoItemLineHeightLoose) + 10
  }
  return total
}

const getInfoRowHeight = (leftItems, rightItems, font) =>
  Math.max(172, 52 + measureInfoItemsHeight(leftItems, font) + 22, 52 + measureInfoItemsHeight(rightItems, font) + 22)

const drawInfoCardRow = ({
  page,
  topY,
  leftCard,
  rightCard,
  leftX,
  rightX,
  width,
  boldFont,
  regularFont
}) => {
  const rowH = getInfoRowHeight(leftCard.items, rightCard.items, regularFont)
  const rowGap = 26

  drawCard({ page, x: leftX, topY, width, height: rowH })
  drawCard({ page, x: rightX, topY, width, height: rowH })

  const paintCard = (card, x) => {
    page.drawText(sanitizeStandardFontText(card.title), {
      x: x + 16,
      y: topY - 26,
      font: boldFont,
      size: PDF_READING_PT,
      color: pdfEmailTheme.ink
    })
    let cursorY = topY - 56
    for (const item of card.items) {
      cursorY = drawTextBlock({
        page,
        text: item,
        x: x + 16,
        y: cursorY,
        font: regularFont,
        fontSize: infoItemFontSize,
        color: pdfEmailTheme.muted,
        maxWidth: infoCardTextMaxWidth,
        lineHeight: infoItemLineHeightLoose
      })
      cursorY -= 10
    }
  }

  paintCard(leftCard, leftX)
  paintCard(rightCard, rightX)

  return topY - rowH - rowGap
}

export const createProposalFilename = (proposalId) => `golf-sol-ireland-proposal-${slugify(proposalId)}.pdf`

export const createProposalPdf = async (rawPayload = {}) => {
  const documentTemplate = buildProposalDocument(rawPayload)
  const proposal = documentTemplate.meta
  const pdfDocument = await PDFDocument.create()
  const regularFont = await pdfDocument.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDocument.embedFont(StandardFonts.HelveticaBold)
  const logo = await embedUnifiedLogo(pdfDocument)
  const fleetImage = await embedPdfJpg(pdfDocument, brandedPdfAssetPaths.fleetLineup, 1280, 390)
  const ctx = { font: regularFont, fontBold: boldFont, ...logo }

  const margin = UNIFIED_PDF_LAYOUT.margin
  const contentW = pageWidth - margin * 2
  const type = {
    eyebrow: 8.5,
    small: 9.25,
    body: 11.25,
    bodyLine: 16.8,
    label: 9,
    section: 14,
    title: 22,
    coverTitle: 26
  }
  const bottomLimit = UNIFIED_PDF_LAYOUT.footerReserve + 8

  const textHeight = (text, font, size, width, lineHeight) =>
    measureWrappedDrawHeight(wrapText({ text, font, fontSize: size, maxWidth: width }), lineHeight)

  const addPage = (kicker = 'Proposal details', title = 'Your Costa del Sol golf proposal') => {
    const page = pdfDocument.addPage([pageWidth, pageHeight])
    const y = drawUnifiedDocumentHeader(page, ctx, { kicker, title })
    return { page, y }
  }

  const ensurePage = (state, needed, kicker, title) => {
    if (!state || state.y - needed < bottomLimit) {
      return addPage(kicker, title)
    }
    return state
  }

  const drawRule = (page, y) => {
    page.drawLine({
      start: { x: margin, y },
      end: { x: margin + contentW, y },
      color: pdfEmailTheme.sand,
      thickness: 0.7
    })
  }

  const drawParagraph = (state, text, options = {}) => {
    const {
      x = margin,
      width = contentW,
      font = regularFont,
      size = type.body,
      lineHeight = type.bodyLine,
      color = pdfEmailTheme.muted,
      gap = 10,
      kicker = 'Proposal details',
      title = 'Your Costa del Sol golf proposal'
    } = options
    const h = textHeight(text, font, size, width, lineHeight)
    state = ensurePage(state, h + gap, kicker, title)
    const nextY = drawTextBlock({
      page: state.page,
      text,
      x,
      y: state.y,
      font,
      fontSize: size,
      color,
      maxWidth: width,
      lineHeight
    })
    state.y = nextY - gap
    return state
  }

  const drawSection = (state, { kicker, title, sectionTitle, items, fill = pdfEmailTheme.white, dark = false }) => {
    const pad = 18
    const innerW = contentW - pad * 2
    const titleH = textHeight(sectionTitle, boldFont, type.section, innerW, 18)
    const itemHs = items.map((item) => textHeight(item, regularFont, type.body, innerW - 18, type.bodyLine))
    const cardH = Math.max(92, pad + titleH + 14 + itemHs.reduce((sum, h) => sum + h + 8, 0) + pad)
    state = ensurePage(state, cardH + 18, kicker, title)

    drawCard({
      page: state.page,
      x: margin,
      topY: state.y,
      width: contentW,
      height: cardH,
      fillColor: fill,
      borderColor: dark ? pdfEmailTheme.greenSoft : pdfEmailTheme.sand
    })

    let cursor = state.y - pad
    cursor = drawTextBlock({
      page: state.page,
      text: sectionTitle,
      x: margin + pad,
      y: cursor,
      font: boldFont,
      fontSize: type.section,
      color: dark ? pdfEmailTheme.white : pdfEmailTheme.ink,
      maxWidth: innerW,
      lineHeight: 18
    })
    cursor -= 14

    items.forEach((item) => {
      state.page.drawCircle({
        x: margin + pad + 3,
        y: cursor + 4,
        size: 2.2,
        color: dark ? pdfEmailTheme.gold : pdfEmailTheme.goldDeep
      })
      cursor = drawTextBlock({
        page: state.page,
        text: item,
        x: margin + pad + 18,
        y: cursor,
        font: regularFont,
        fontSize: type.body,
        color: dark ? pdfEmailTheme.white : pdfEmailTheme.muted,
        maxWidth: innerW - 18,
        lineHeight: type.bodyLine
      })
      cursor -= 8
    })

    state.y -= cardH + 18
    return state
  }

  let state = addPage(String(documentTemplate.hero.kicker || 'Proposal'), documentTemplate.hero.title)
  state = drawParagraph(state, documentTemplate.hero.description, {
    size: 11.5,
    lineHeight: 16,
    color: pdfEmailTheme.muted,
    kicker: String(documentTemplate.hero.kicker || 'Proposal'),
    title: documentTemplate.hero.title
  })
  state = drawParagraph(state, `Reference ${proposal.proposalId}  ·  ${proposal.proposalDate}`, {
    size: 10.5,
    lineHeight: 15,
    color: pdfEmailTheme.green,
    kicker: String(documentTemplate.hero.kicker || 'Proposal'),
    title: documentTemplate.hero.title
  })

  const fleetH = 118
  state = ensurePage(state, fleetH + 40, 'Proposal', documentTemplate.hero.title)
  if (fleetImage) {
    state.page.drawImage(fleetImage, {
      x: margin,
      y: state.y - fleetH,
      width: contentW,
      height: fleetH
    })
    state.y -= fleetH + 8
    state = drawParagraph(state, 'Golf-bag friendly Mercedes fleet — E-Class, V-Class and Sprinter options matched to your group.', {
      size: 10,
      lineHeight: 14,
      color: pdfEmailTheme.muted,
      kicker: 'Proposal',
      title: documentTemplate.hero.title
    })
  }

  documentTemplate.infoCards.forEach((card, index) => {
    state = drawSection(state, {
      kicker: index === 0 ? 'Proposal details' : 'Proposal details continued',
      title: 'Your Costa del Sol golf proposal',
      sectionTitle: card.title,
      items: card.items,
      fill: index % 2 === 0 ? pdfEmailTheme.white : pdfEmailTheme.paleGreen
    })
  })

  state = drawSection(state, {
    kicker: 'Pricing snapshot',
    title: documentTemplate.summary.title,
    sectionTitle: documentTemplate.summary.title,
    items: [documentTemplate.summary.aside],
    fill: pdfEmailTheme.paleGreen
  })

  ;[...documentTemplate.summary.topTiles, ...documentTemplate.summary.bottomTiles].forEach((tile) => {
    state = drawSection(state, {
      kicker: 'Pricing snapshot',
      title: documentTemplate.summary.title,
      sectionTitle: tile.label,
      items: [tile.value],
      fill: pdfEmailTheme.paleGold
    })
  })

  state = drawSection(state, {
    kicker: 'Next steps',
    title: 'How to move from proposal to booking',
    sectionTitle: documentTemplate.lower.left.kicker,
    items: [...documentTemplate.lower.left.items, ...documentTemplate.lower.left.noteLines],
    fill: pdfEmailTheme.white
  })

  state = drawSection(state, {
    kicker: 'Next steps',
    title: 'How to move from proposal to booking',
    sectionTitle: documentTemplate.lower.right.kicker,
    items: [...documentTemplate.lower.right.paragraphs, documentTemplate.lower.right.signoffTitle, ...documentTemplate.lower.right.signoffLines],
    fill: pdfEmailTheme.green,
    dark: true
  })

  if (documentTemplate.messageBlock) {
    state = drawSection(state, {
      kicker: 'Client message',
      title: 'Client email copy',
      sectionTitle: documentTemplate.messageBlock.title,
      items: [documentTemplate.messageBlock.body],
      fill: pdfEmailTheme.paleGold
    })
  }

  state = drawSection(state, {
    kicker: 'Important notes',
    title: 'Important notes and disclaimers',
    sectionTitle: documentTemplate.disclaimer.title,
    items: documentTemplate.disclaimer.paragraphs,
    fill: pdfEmailTheme.white
  })

  const pages = pdfDocument.getPages()
  pages.forEach((pdfPage, index) => {
    drawUnifiedDocumentFooter(
      pdfPage,
      52,
      ctx,
      [`Proposal ${proposal.proposalId}`],
      { current: index + 1, total: pages.length }
    )
  })

  return {
    pdfBytes: await pdfDocument.save(),
    proposal
  }
}
