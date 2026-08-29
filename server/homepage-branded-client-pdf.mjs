/**
 * Homepage-style branded client PDF — hero fleet plate, three services, trip desk summary.
 * For email attachments and portal sends; preview at /homepage-client-pdf-sample.
 */
import { existsSync, readFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { gsolCompanyLegal, gsolEmailBrand } from './email-constants.mjs'
import { brandedPdfAssetPaths, pdfEmailTheme } from './pdf-email-brand.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  drawUnifiedBulletCard,
  drawUnifiedDocumentFooter,
  drawUnifiedDocumentHeader,
  drawUnifiedGoldRule,
  drawUnifiedKeyValueTable,
  drawUnifiedSectionHeading,
  embedUnifiedLogo,
  loadUnifiedPdfFonts,
  wrapPlainLinesWithFont
} from './gsol-unified-pdf-template.mjs'

/** Optional fleet photo under the shared letterhead. */
const drawFleetStrip = async (page, doc, startY) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const fleetH = 118
  const fleetImage = await embedFleetHeroJpg(doc, Math.round(contentW * 2.2), Math.round(fleetH * 2.2))
  if (!fleetImage) return startY
  page.drawImage(fleetImage, {
    x: margin,
    y: startY - fleetH,
    width: contentW,
    height: fleetH
  })
  return startY - fleetH - 16
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
  const ctx = { ...(await loadUnifiedPdfFonts(doc)), ...(await embedUnifiedLogo(doc)) }

  const page1 = doc.addPage([pageWidth, pageHeight])
  let y = drawUnifiedDocumentHeader(page1, ctx, {
    kicker: 'Client document',
    title: 'From plane to fairway.',
    subtitle: 'Irish-owned golf travel — private transfers, hand-picked courses and golf-friendly stays in one trip desk.'
  })
  y = await drawFleetStrip(page1, doc, y)

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
  y = drawUnifiedDocumentHeader(page2, ctx, {
    compact: true,
    title: 'Your trip overview (continued)'
  })

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
      color: pdfEmailTheme.gold
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
