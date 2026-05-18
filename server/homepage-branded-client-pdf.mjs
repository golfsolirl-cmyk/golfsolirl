/**
 * Homepage-style branded client PDF — hero fleet plate, three services, trip desk summary.
 * For email attachments and portal sends; preview at /homepage-client-pdf-sample.
 */
import { existsSync, readFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { gsolCompanyLegal, gsolEmailBrand } from './email-constants.mjs'
import { brandedPdfAssetPaths, heroDescriptionColor, pdfEmailTheme } from './pdf-email-brand.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  drawUnifiedBulletCard,
  drawUnifiedDocumentFooter,
  drawUnifiedGoldRule,
  drawUnifiedKeyValueTable,
  drawUnifiedSectionHeading,
  loadUnifiedPdfFonts,
  wrapPlainLinesWithFont
} from './gsol-unified-pdf-template.mjs'

/** Embed the homepage portrait crest at a target height (pt); width follows aspect ratio. */
const embedHomepageCrest = async (doc, targetH) => {
  const image = await doc.embedPng(readFileSync(brandedPdfAssetPaths.homepageCrest))
  const ratio = image.width / image.height
  return { image, height: targetH, width: Math.round(targetH * ratio) }
}

export const HOMEPAGE_CLIENT_PDF_SAMPLE_FILENAME = 'golfsol-homepage-client-document.pdf'

const embedFleetHeroJpg = async (pdfDocument, width, height) => {
  const fleetPath = brandedPdfAssetPaths.fleetLineup
  if (!existsSync(fleetPath)) {
    return null
  }
  const jpeg = await sharp(readFileSync(fleetPath))
    .resize(width, height, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
  return pdfDocument.embedJpg(jpeg)
}

/**
 * Homepage hero: fleet image + forest band + portrait crest + headline; text wraps with measured lines (no clipping).
 * @returns {number} body start Y
 */
const drawHomepageHeroBand = async (page, doc, ctx) => {
  const { pageWidth, pageHeight, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const fleetH = 138

  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: pdfEmailTheme.cream })

  const fleetTop = pageHeight - margin - fleetH
  const fleetImage = await embedFleetHeroJpg(doc, Math.round(contentW * 2.2), Math.round(fleetH * 2.2))
  if (fleetImage) {
    page.drawImage(fleetImage, {
      x: margin,
      y: fleetTop,
      width: contentW,
      height: fleetH
    })
  } else {
    page.drawRectangle({
      x: margin,
      y: fleetTop,
      width: contentW,
      height: fleetH,
      color: pdfEmailTheme.green
    })
  }

  const crest = await embedHomepageCrest(doc, 86)
  const textLeftPad = 16
  const textRightPad = 18
  const textLeft = margin + 14 + crest.width + textLeftPad
  const textW = pageWidth - margin - textRightPad - textLeft

  const kicker = 'MALAGA → COSTA DEL SOL GOLF TRANSFERS'
  const title = 'From plane to fairway.'
  const description =
    'Irish-owned golf travel — private transfers, hand-picked courses and golf-friendly stays in one trip desk.'

  const kickerSize = 8.5
  const kickerLH = 12
  const titleSize = 22
  const titleLH = 26
  const descSize = 10.5
  const descLH = 14
  const innerPadV = 18

  const titleLines = wrapPlainLinesWithFont(ctx.fontBold, title, titleSize, textW)
  const descLines = wrapPlainLinesWithFont(ctx.font, description, descSize, textW)

  const textBlockH =
    kickerLH + 10 + titleLines.length * titleLH + 10 + descLines.length * descLH
  const bandH = Math.max(112, Math.max(crest.height + 28, textBlockH + innerPadV * 2))
  const bandBottom = fleetTop - bandH
  const bandTop = bandBottom + bandH

  page.drawRectangle({ x: margin, y: bandBottom, width: contentW, height: bandH, color: pdfEmailTheme.green })
  page.drawRectangle({ x: margin, y: bandBottom + bandH - 4, width: contentW, height: 4, color: pdfEmailTheme.gold })

  const crestBottom = bandBottom + (bandH - crest.height) / 2
  page.drawImage(crest.image, {
    x: margin + 14,
    y: crestBottom,
    width: crest.width,
    height: crest.height
  })

  let textY = bandTop - innerPadV - kickerSize
  page.drawText(sanitizeStandardFontText(kicker), {
    x: textLeft,
    y: textY,
    font: ctx.fontBold,
    size: kickerSize,
    color: pdfEmailTheme.gold,
    maxWidth: textW,
    lineHeight: kickerLH
  })
  textY -= 10 + titleSize
  for (const line of titleLines) {
    page.drawText(line, {
      x: textLeft,
      y: textY,
      font: ctx.fontBold,
      size: titleSize,
      color: pdfEmailTheme.white
    })
    textY -= titleLH
  }
  textY += titleLH - 10
  for (const line of descLines) {
    page.drawText(line, {
      x: textLeft,
      y: textY,
      font: ctx.font,
      size: descSize,
      color: heroDescriptionColor
    })
    textY -= descLH
  }

  return bandBottom - 28
}

/** Three service pillars — Transfers · Golf · Hotels (homepage product story). Card height auto-fits wrapped copy. */
const drawHomepageServicePillars = (page, startY, ctx) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const gap = 10
  const colW = (contentW - gap * 2) / 3
  const innerPad = 14
  const innerW = colW - innerPad * 2
  const titleSize = 12.5
  const titleLH = 16
  const bodySize = 10.5
  const bodyLH = 14
  const topAccentH = 3
  const padTop = 18
  const padBottom = 18

  const pillars = [
    {
      title: 'Transfers',
      body: 'Meet-and-greet at Málaga AGP. Golf-bag friendly Mercedes V-Class and Sprinter.'
    },
    {
      title: 'Golf courses',
      body: 'Tee times and rounds across the Costa del Sol — shaped to your group.'
    },
    {
      title: 'Hotels',
      body: 'Golf resorts and stays near the fairway — one concierge books it all.'
    }
  ]

  const wrappedBodies = pillars.map((p) => wrapPlainLinesWithFont(ctx.font, p.body, bodySize, innerW))
  const cardH = Math.max(
    ...wrappedBodies.map((lines) => topAccentH + padTop + titleLH + 8 + lines.length * bodyLH + padBottom)
  )
  const bottom = startY - cardH

  pillars.forEach((pillar, i) => {
    const x = margin + i * (colW + gap)
    const isCenter = i === 1
    page.drawRectangle({
      x,
      y: bottom,
      width: colW,
      height: cardH,
      color: isCenter ? pdfEmailTheme.paleGold : pdfEmailTheme.white,
      borderColor: isCenter ? pdfEmailTheme.gold : pdfEmailTheme.sand,
      borderWidth: isCenter ? 1 : 0.65
    })
    page.drawRectangle({
      x,
      y: bottom + cardH - topAccentH,
      width: colW,
      height: topAccentH,
      color: pdfEmailTheme.gold
    })

    let y = bottom + cardH - topAccentH - padTop
    page.drawText(sanitizeStandardFontText(pillar.title), {
      x: x + innerPad,
      y,
      font: ctx.fontBold,
      size: titleSize,
      color: pdfEmailTheme.ink
    })
    y -= titleLH + 4
    for (const line of wrappedBodies[i]) {
      page.drawText(line, {
        x: x + innerPad,
        y,
        font: ctx.font,
        size: bodySize,
        color: pdfEmailTheme.muted
      })
      y -= bodyLH
    }
  })

  return bottom - 22
}

const defaultSampleInput = () => ({
  clientName: 'Aoife Murphy',
  clientEmail: 'aoife.murphy@example.com',
  clientPhone: '+353 87 123 4567',
  enquiryRef: 'GSI-SAMPLE-001',
  travelDates: '12–19 April 2026',
  partySize: '4 golfers',
  tripSummary: 'Costa del Sol · 5 nights · 3 rounds · private transfers from Málaga',
  quoteLine: 'Indicative from EUR 2,450 per person (sample only)',
  quoteNote: 'Final price follows supplier confirmation and your written acceptance.'
})

/**
 * @param {Partial<ReturnType<typeof defaultSampleInput>>} [input]
 * @returns {Promise<Uint8Array>}
 */
export const buildHomepageBrandedClientPdfBytes = async (input = {}) => {
  const data = { ...defaultSampleInput(), ...input }
  const doc = await PDFDocument.create()
  const { pageWidth, pageHeight, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const ctx = await loadUnifiedPdfFonts(doc)

  const page1 = doc.addPage([pageWidth, pageHeight])
  let y = await drawHomepageHeroBand(page1, doc, ctx)

  y = drawUnifiedSectionHeading(page1, y, ctx, 'YOUR TRIP DESK')
  y = drawUnifiedKeyValueTable(page1, y, ctx, [
    { label: 'Guest name', value: data.clientName },
    { label: 'Email', value: data.clientEmail },
    { label: 'Phone / WhatsApp', value: data.clientPhone },
    { label: 'Reference', value: data.enquiryRef },
    { label: 'Travel dates', value: data.travelDates },
    { label: 'Party', value: data.partySize },
    { label: 'Trip summary', value: data.tripSummary }
  ])

  y -= 8
  y = drawUnifiedGoldRule(page1, y)
  y = drawUnifiedSectionHeading(page1, y, ctx, 'THREE SERVICES · ONE DESK')
  y = drawHomepageServicePillars(page1, y, ctx)

  drawUnifiedDocumentFooter(page1, 52, ctx, [
    'Page 1 of 2 · Sample client document — approve layout before live sends.'
  ])

  const page2 = doc.addPage([pageWidth, pageHeight])
  page2.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: pdfEmailTheme.cream })
  page2.drawRectangle({ x: margin, y: pageHeight - 32, width: contentW, height: 3, color: pdfEmailTheme.gold })
  page2.drawText(sanitizeStandardFontText('Golf Sol Ireland — your trip overview (continued)'), {
    x: margin,
    y: pageHeight - 48,
    font: ctx.fontBold,
    size: 10,
    color: pdfEmailTheme.green
  })

  y = pageHeight - 68

  y = drawUnifiedSectionHeading(page2, y, ctx, 'QUOTE SUMMARY (SAMPLE)')
  y = drawUnifiedKeyValueTable(page2, y, ctx, [
    { label: 'Package', value: 'Stay & play · transfers included' },
    { label: 'Indicative price', value: data.quoteLine },
    { label: 'Notes', value: data.quoteNote }
  ])

  y -= 10
  y = drawUnifiedGoldRule(page2, y)
  y = drawUnifiedBulletCard(page2, y, ctx, {
    title: 'Fully insured transfers',
    body: 'Private Mercedes transfers with full passenger insurance and meet-and-greet at Málaga AGP.',
    points: [
      'Professional chauffeurs — named drivers, flight-tracked pickups',
      'Full passenger insurance on every leg',
      'Reply with dates, group size or must-play courses to refine your quote'
    ]
  })

  y -= 6
  const contactPad = 18
  const contactInnerW = contentW - contactPad * 2
  const kickerLH = 14
  const emailLH = 18
  const phoneSize = 11
  const phoneLH = 15
  const phoneLines = wrapPlainLinesWithFont(
    ctx.font,
    `${gsolEmailBrand.phoneDisplay} (Ireland) · ${gsolEmailBrand.spanishPhoneDisplay} (Spain)`,
    phoneSize,
    contactInnerW
  )
  const contactH = contactPad * 2 + kickerLH + 8 + emailLH + 8 + phoneLines.length * phoneLH
  const contactBottom = y - contactH

  page2.drawRectangle({
    x: margin,
    y: contactBottom,
    width: contentW,
    height: contactH,
    color: pdfEmailTheme.green,
    borderColor: pdfEmailTheme.goldDeep,
    borderWidth: 0.5
  })

  let contactY = y - contactPad - 11
  page2.drawText(sanitizeStandardFontText('Questions or changes?'), {
    x: margin + contactPad,
    y: contactY,
    font: ctx.fontBold,
    size: 11,
    color: pdfEmailTheme.gold
  })
  contactY -= 8 + 13
  page2.drawText(sanitizeStandardFontText(gsolEmailBrand.email), {
    x: margin + contactPad,
    y: contactY,
    font: ctx.fontBold,
    size: 13,
    color: pdfEmailTheme.white
  })
  contactY -= 8 + phoneSize
  for (const line of phoneLines) {
    page2.drawText(line, {
      x: margin + contactPad,
      y: contactY,
      font: ctx.font,
      size: phoneSize,
      color: heroDescriptionColor
    })
    contactY -= phoneLH
  }

  drawUnifiedDocumentFooter(page2, 52, ctx, [
    `Company registration no. ${gsolCompanyLegal.companyRegistrationNumber} (Ireland)`,
    'This PDF is a branded layout sample — not a contract or booking confirmation.'
  ])

  return doc.save()
}

/** Fictional sample bytes for stakeholder browser approval. */
export const buildHomepageBrandedClientPdfSampleBytes = () => buildHomepageBrandedClientPdfBytes()
