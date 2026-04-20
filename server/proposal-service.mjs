import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { buildProposalDocument } from '../shared/document-templates.mjs'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFilePath)
const brandLockupAssetPath = path.resolve(currentDirectory, '../src/gsol-brand-lockup-exact.png')
let brandLockupPngBufferPromise

const getBrandLockupPngBuffer = async () => {
  if (!brandLockupPngBufferPromise) {
    brandLockupPngBufferPromise = Promise.resolve(readFileSync(brandLockupAssetPath))
  }

  return brandLockupPngBufferPromise
}

const pageWidth = 595.28
const pageHeight = 841.89

const colors = {
  forest950: rgb(10 / 255, 32 / 255, 8 / 255),
  forest900: rgb(22 / 255, 58 / 255, 19 / 255),
  fairway600: rgb(61 / 255, 129 / 255, 32 / 255),
  gold400: rgb(220 / 255, 88 / 255, 1 / 255),
  gold300: rgb(253 / 255, 186 / 255, 116 / 255),
  white: rgb(1, 1, 1),
  slate700: rgb(55 / 255, 65 / 255, 81 / 255),
  border: rgb(223 / 255, 231 / 255, 219 / 255),
  offwhite: rgb(247 / 255, 249 / 255, 245 / 255),
  cream: rgb(242 / 255, 245 / 255, 239 / 255)
}

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'proposal'

const wrapText = ({ text, font, fontSize, maxWidth }) => {
  const paragraphs = text.split('\n')
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

const drawCard = ({ page, x, topY, width, height, fillColor = colors.white, borderColor = colors.border }) => {
  page.drawRectangle({
    x,
    y: topY - height,
    width,
    height,
    color: fillColor,
    borderColor,
    borderWidth: 1
  })
}

const drawTile = ({ page, x, y, width, height, label, value, boldFont, regularFont }) => {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: colors.white,
    borderColor: colors.border,
    borderWidth: 1
  })

  page.drawText(label, {
    x: x + 12,
    y: y + height - 20,
    font: boldFont,
    size: 8,
    color: colors.gold400
  })

  drawTextBlock({
    page,
    text: value,
    x: x + 12,
    y: y + height - 34,
    font: regularFont,
    fontSize: 9.5,
    color: colors.forest900,
    maxWidth: width - 24,
    lineHeight: 11
  })
}

const drawChecklistLine = ({ page, label, x, y, width, dark = false, regularFont }) => {
  page.drawText(label, {
    x,
    y,
    font: regularFont,
    size: 10,
    color: dark ? colors.white : colors.slate700
  })

  page.drawLine({
    start: { x, y: y - 8 },
    end: { x: x + width, y: y - 8 },
    color: dark ? colors.white : colors.forest900,
    thickness: 1,
    opacity: dark ? 0.28 : 0.18
  })
}

const infoCardTextMaxWidth = 219
const infoItemFontSize = 10
const infoItemLineHeight = 12

const measureInfoItemsHeight = (items, font) => {
  let total = 0
  for (const item of items) {
    const lines = wrapText({ text: item, font, fontSize: infoItemFontSize, maxWidth: infoCardTextMaxWidth })
    total += lines.length * infoItemLineHeight + 6
  }
  return total
}

const getInfoRowHeight = (leftItems, rightItems, font) =>
  Math.max(120, 34 + measureInfoItemsHeight(leftItems, font) + 14, 34 + measureInfoItemsHeight(rightItems, font) + 14)

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
  const rowGap = 16

  drawCard({ page, x: leftX, topY, width, height: rowH })
  drawCard({ page, x: rightX, topY, width, height: rowH })

  const paintCard = (card, x) => {
    page.drawText(card.title, {
      x: x + 14,
      y: topY - 20,
      font: boldFont,
      size: 11,
      color: colors.forest900
    })
    let cursorY = topY - 36
    for (const item of card.items) {
      cursorY = drawTextBlock({
        page,
        text: item,
        x: x + 14,
        y: cursorY,
        font: regularFont,
        fontSize: infoItemFontSize,
        color: colors.slate700,
        maxWidth: infoCardTextMaxWidth,
        lineHeight: infoItemLineHeight
      })
      cursorY -= 6
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
  const page = pdfDocument.addPage([pageWidth, pageHeight])
  const regularFont = await pdfDocument.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDocument.embedFont(StandardFonts.HelveticaBold)
  const brandLockupImage = await pdfDocument.embedPng(await getBrandLockupPngBuffer())
  const brandLockupScale = 0.168
  const brandLockupDimensions = brandLockupImage.scale(brandLockupScale)
  const lockupTopMargin = 18
  const lockupY = pageHeight - lockupTopMargin - brandLockupDimensions.height
  const subtitleGap = 10
  const subtitleY = lockupY - subtitleGap
  const descriptionStartY = subtitleY - 20

  page.drawRectangle({
    x: 0,
    y: pageHeight - 168,
    width: pageWidth,
    height: 168,
    color: colors.forest950
  })

  page.drawRectangle({
    x: 0,
    y: pageHeight - 168,
    width: pageWidth,
    height: 168,
    opacity: 0.18,
    color: colors.fairway600
  })

  page.drawImage(brandLockupImage, {
    x: 44,
    y: lockupY,
    width: brandLockupDimensions.width,
    height: brandLockupDimensions.height
  })

  page.drawText(documentTemplate.hero.kicker, {
    x: 44,
    y: subtitleY,
    font: boldFont,
    size: 11,
    color: colors.gold300
  })

  const headerBottomY = drawTextBlock({
    page,
    text: documentTemplate.hero.description,
    x: 44,
    y: descriptionStartY,
    font: regularFont,
    fontSize: 10,
    color: colors.white,
    maxWidth: 320
  })

  page.drawRectangle({
    x: pageWidth - 196,
    y: pageHeight - 132,
    width: 152,
    height: 74,
    color: colors.white,
    opacity: 0.08
  })

  page.drawText('Proposal ID', {
    x: pageWidth - 178,
    y: pageHeight - 82,
    font: boldFont,
    size: 10,
    color: colors.gold300
  })

  page.drawText(proposal.proposalId, {
    x: pageWidth - 178,
    y: pageHeight - 101,
    font: regularFont,
    size: 12,
    color: colors.white
  })

  page.drawText(proposal.proposalDate, {
    x: pageWidth - 178,
    y: pageHeight - 118,
    font: regularFont,
    size: 10,
    color: colors.white
  })

  const topCardsY = headerBottomY - 10
  const cardWidth = 247
  const leftCardX = 44
  const rightCardX = 304

  const [c0, c1, c2, c3] = documentTemplate.infoCards
  const afterRow1 = drawInfoCardRow({
    page,
    topY: topCardsY,
    leftCard: { title: c0.title, items: c0.items },
    rightCard: { title: c1.title, items: c1.items },
    leftX: leftCardX,
    rightX: rightCardX,
    width: cardWidth,
    boldFont,
    regularFont
  })
  drawInfoCardRow({
    page,
    topY: afterRow1,
    leftCard: { title: c2.title, items: c2.items },
    rightCard: { title: c3.title, items: c3.items },
    leftX: leftCardX,
    rightX: rightCardX,
    width: cardWidth,
    boldFont,
    regularFont
  })

  const page2 = pdfDocument.addPage([pageWidth, pageHeight])
  const summaryTopY = pageHeight - 52
  const summaryCardH = 228
  drawCard({ page: page2, x: 44, topY: summaryTopY, width: pageWidth - 88, height: summaryCardH, fillColor: colors.offwhite })

  page2.drawText(documentTemplate.summary.kicker, {
    x: 58,
    y: summaryTopY - 20,
    font: boldFont,
    size: 10,
    color: colors.gold400
  })

  let summaryCursorY = summaryTopY - 38
  summaryCursorY = drawTextBlock({
    page: page2,
    text: documentTemplate.summary.title,
    x: 58,
    y: summaryCursorY,
    font: boldFont,
    fontSize: 16,
    color: colors.forest900,
    maxWidth: pageWidth - 116,
    lineHeight: 20
  })

  summaryCursorY = drawTextBlock({
    page: page2,
    text: documentTemplate.summary.aside,
    x: 58,
    y: summaryCursorY - 8,
    font: regularFont,
    fontSize: 9,
    color: colors.slate700,
    maxWidth: pageWidth - 116,
    lineHeight: 11
  })

  const tileWidth = 116
  const tileGap = 10
  const tileH = 72
  const topTileY = summaryCursorY - 16 - tileH
  const bottomTileY = topTileY - 12 - tileH

  documentTemplate.summary.topTiles.forEach((tile, index) => {
    drawTile({
      page: page2,
      x: 58 + index * (tileWidth + tileGap),
      y: topTileY,
      width: tileWidth,
      height: tileH,
      label: tile.label,
      value: tile.value,
      boldFont,
      regularFont
    })
  })

  documentTemplate.summary.bottomTiles.forEach((tile, index) => {
    drawTile({
      page: page2,
      x: 58 + index * (tileWidth + tileGap),
      y: bottomTileY,
      width: tileWidth,
      height: tileH,
      label: tile.label,
      value: tile.value,
      boldFont,
      regularFont
    })
  })

  const lowerCardsTopY = bottomTileY - 28
  const lowerLeftH = 142
  const lowerRightH = 158

  drawCard({ page: page2, x: leftCardX, topY: lowerCardsTopY, width: cardWidth, height: lowerLeftH })
  page2.drawText(documentTemplate.lower.left.kicker, {
    x: leftCardX + 14,
    y: lowerCardsTopY - 20,
    font: boldFont,
    size: 11,
    color: colors.gold400
  })

  documentTemplate.lower.left.items.forEach((line, index) => {
    page2.drawText(`• ${line}`, {
      x: leftCardX + 14,
      y: lowerCardsTopY - 44 - index * 18,
      font: regularFont,
      size: 10,
      color: colors.slate700
    })
  })

  documentTemplate.lower.left.noteLines.forEach((line, index) => {
    drawChecklistLine({
      page: page2,
      label: line,
      x: leftCardX + 14,
      y: lowerCardsTopY - 118 - index * 20,
      width: 210,
      regularFont
    })
  })

  drawCard({
    page: page2,
    x: rightCardX,
    topY: lowerCardsTopY,
    width: cardWidth,
    height: lowerRightH,
    fillColor: colors.forest950,
    borderColor: colors.forest950
  })

  page2.drawText(documentTemplate.lower.right.kicker, {
    x: rightCardX + 14,
    y: lowerCardsTopY - 20,
    font: boldFont,
    size: 11,
    color: colors.gold300
  })

  drawTextBlock({
    page: page2,
    text: documentTemplate.lower.right.paragraphs.join('\n\n'),
    x: rightCardX + 14,
    y: lowerCardsTopY - 42,
    font: regularFont,
    fontSize: 9.5,
    color: colors.white,
    maxWidth: cardWidth - 28,
    lineHeight: 12
  })

  const darkCardBottomY = lowerCardsTopY - lowerRightH
  const signoffPad = 10
  const signoffBoxH = 52
  const signoffBoxBottomY = darkCardBottomY + signoffPad

  page2.drawRectangle({
    x: rightCardX + 14,
    y: signoffBoxBottomY,
    width: cardWidth - 28,
    height: signoffBoxH,
    color: colors.white,
    opacity: 0.06,
    borderColor: colors.white,
    borderWidth: 1
  })

  const signoffInnerTopY = signoffBoxBottomY + signoffBoxH

  page2.drawText(documentTemplate.lower.right.signoffTitle, {
    x: rightCardX + 26,
    y: signoffInnerTopY - 18,
    font: boldFont,
    size: 10,
    color: colors.white
  })

  documentTemplate.lower.right.signoffLines.forEach((line, index) => {
    drawChecklistLine({
      page: page2,
      label: line,
      x: rightCardX + 26,
      y: signoffInnerTopY - 36 - index * 18,
      width: 180,
      dark: true,
      regularFont
    })
  })

  const lowerBlockBottom = lowerCardsTopY - Math.max(lowerLeftH, lowerRightH)
  const sectionGap = 18
  const disclaimerCardH = 86

  let disclaimerAnchorTopY = lowerBlockBottom

  if (documentTemplate.messageBlock) {
    const messageCardH = 56
    const messageTopY = lowerBlockBottom - sectionGap - messageCardH

    disclaimerAnchorTopY = messageTopY

    drawCard({
      page: page2,
      x: 44,
      topY: messageTopY,
      width: pageWidth - 88,
      height: messageCardH,
      fillColor: colors.cream,
      borderColor: colors.gold300
    })

    page2.drawText(documentTemplate.messageBlock.title, {
      x: 58,
      y: messageTopY - 18,
      font: boldFont,
      size: 10,
      color: colors.forest900
    })

    drawTextBlock({
      page: page2,
      text: documentTemplate.messageBlock.body,
      x: 58,
      y: messageTopY - 34,
      font: regularFont,
      fontSize: 9,
      color: colors.slate700,
      maxWidth: pageWidth - 116,
      lineHeight: 11
    })
  }

  const disclaimerTopY = disclaimerAnchorTopY - sectionGap - disclaimerCardH

  drawCard({
    page: page2,
    x: 44,
    topY: disclaimerTopY,
    width: pageWidth - 88,
    height: disclaimerCardH,
    fillColor: colors.offwhite,
    borderColor: colors.gold400
  })

  page2.drawText(documentTemplate.disclaimer.title, {
    x: 58,
    y: disclaimerTopY - 18,
    font: boldFont,
    size: 10,
    color: colors.gold400
  })

  drawTextBlock({
    page: page2,
    text: documentTemplate.disclaimer.paragraphs.join('\n\n'),
    x: 58,
    y: disclaimerTopY - 34,
    font: regularFont,
    fontSize: 8.2,
    color: colors.slate700,
    maxWidth: pageWidth - 116,
    lineHeight: 10
  })

  return {
    pdfBytes: await pdfDocument.save(),
    proposal
  }
}
