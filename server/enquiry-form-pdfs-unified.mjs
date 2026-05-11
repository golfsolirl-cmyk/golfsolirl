/**
 * Website enquiry email attachments — unified PDF shell (see gsol-unified-pdf-template.mjs).
 * Same narrative content as legacy bespoke layouts; tables/cards use wrapped text (no clipping).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { brandedPdfAssetPaths as sharedBrandedPaths, pdfEmailTheme } from './pdf-email-brand.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  loadUnifiedPdfFonts,
  embedUnifiedLogo,
  drawUnifiedDocumentHeader,
  drawUnifiedDocumentFooter,
  drawUnifiedSectionHeading,
  drawUnifiedKeyValueTable,
  estimateUnifiedKeyValueTableHeight,
  drawUnifiedGoldRule,
  drawUnifiedParagraphBlock,
  drawUnifiedBulletCard,
  estimateUnifiedBulletCardHeight,
  wrapPlainLinesWithFont
} from './gsol-unified-pdf-template.mjs'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const publicImagesDir = path.resolve(currentDir, '../public/images')

const assets = {
  ...sharedBrandedPaths,
  arrivals: path.join(publicImagesDir, 'transport-moment-arrivals.jpg'),
  resort: path.join(publicImagesDir, 'transport-moment-resort.jpg'),
  coastalDrive: path.join(publicImagesDir, 'transport-hero-coastal-drive.jpg')
}

const fitAssetForPdf = (assetPath, width, height) =>
  sharp(readFileSync(assetPath))
    .resize(width, height, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer()

const embedPdfJpg = async (pdfDocument, assetPath, width, height) =>
  pdfDocument.embedJpg(await fitAssetForPdf(assetPath, width, height))

const disclaimerParagraphsPdf = [
  'Golf Sol Ireland arranges golf travel as an agent. If a trip is booked, your contract is with the relevant accommodation, golf, and transport suppliers on their terms, alongside any booking conditions we issue in writing.',
  'This email only confirms we received your enquiry and lists the details you submitted. It is not a quote, availability check, invoice, receipt, booking confirmation, or legally binding agreement.',
  'Prices, tee times, hotel rooms, and transfers are not held or guaranteed until we confirm them in a formal proposal and you accept the next steps in writing.'
]

const supplementalTermsSections = [
  {
    title: 'Booking role and supplier responsibility',
    body:
      'GolfSol Ireland arranges Costa del Sol golf travel services with third-party hotels, resorts, golf courses, transport providers and other suppliers. We use reasonable care when coordinating your trip, but we do not own or operate those suppliers.',
    points: [
      'Hotel rooms, accommodation facilities, golf courses, buggies, tee sheets and transfer operations are controlled by the relevant supplier.',
      'If a supplier changes, cancels, overbooks or fails to deliver a service, we will help escalate and seek a practical remedy, but we are not liable for that supplier failure.',
      'Supplier-specific cancellation, refund, no-show and amendment rules apply once a booking is confirmed.'
    ]
  },
  {
    title: 'Deposit and balance',
    body:
      'Unless your written proposal states otherwise, a 20% deposit is payable upfront to proceed with the booking. The remaining 80% balance is due within five days of booking confirmation.',
    points: [
      'If you cancel within 48 hours of paying the deposit, the deposit will be refunded provided no non-refundable supplier cost has already been committed on your instruction.',
      'After 48 hours, the 20% deposit is non-refundable because supplier holds, administration and planning work have started.',
      'If the balance is not paid on time, suppliers may release rooms, tee times or vehicles and prices may change.'
    ]
  },
  {
    title: 'Accommodation problems',
    body:
      'Accommodation is provided by third-party hotels, resorts, apartments or accommodation suppliers. We cannot guarantee room views, exact floors, adjoining rooms, bed types, facilities, staffing levels or amenities unless a supplier confirms them as guaranteed in writing.',
    points: [
      'If accommodation fails or changes, we will help seek an alternative or supplier remedy where available.',
      'Local taxes, damage deposits, resort rules, cleaning charges and hotel policies may be payable locally.',
      'Supplier decisions on room allocation, maintenance and service delivery are outside our direct control.'
    ]
  },
  {
    title: 'Golf course bookings',
    body:
      'Golf courses control tee times, course condition, course closure, pairing, pace of play, handicap rules, dress codes, buggy availability and refund policy.',
    points: [
      'If a course officially closes, we will seek the refund, credit, voucher or replacement round offered by that course.',
      'If the course remains open and your group chooses not to attend, the round is normally treated as a no-show and charged in full.',
      'Buggy inclusion varies by course and player numbers. Odd-number groups may need to share, walk or pay locally for an extra buggy.'
    ]
  },
  {
    title: 'Cancellations, reductions and changes',
    body:
      'Tell us as early as possible if you need to cancel, reduce numbers or change names, dates, hotels, golf rounds or transfer details. We will help where suppliers allow it.',
    points: [
      'Group reductions can increase per-person prices because fixed costs are split across fewer travellers.',
      'Supplier amendment fees, lost discounts and rate increases are payable by the group unless we agree otherwise in writing.',
      'Travel insurance is strongly recommended for cancellation, illness, missed flights, baggage, golf equipment and disruption.'
    ]
  },
  {
    title: 'Liability limits',
    body:
      'We are responsible only for our own proven failure to use reasonable care and skill in arranging services. We are not liable for another company mistake, delay, overbooking, cancellation, negligence or operational failure.',
    points: [
      'We are not liable for indirect loss, loss of enjoyment, missed flights, unused services, or costs not approved by us in advance.',
      'Where GolfSol Ireland is legally liable, liability is limited to the amount paid to us for the affected service, except where Irish law does not allow that limit.',
      'Nothing in these terms excludes liability for fraud, deliberate wrongdoing, death or personal injury caused by negligence, or any legal rights that cannot be excluded.'
    ]
  }
]

const travellerContactSections = [
  {
    title: 'Emergency first',
    body:
      'For any immediate danger in Spain, call 112 first. Operators can route police, ambulance and fire services and English-speaking support is normally available.',
    points: [
      'Spain / EU emergency number: 112',
      'Medical emergency / ambulance: 061',
      'National Police: 091',
      'Guardia Civil: 062',
      'Local Police: 092',
      'Fire brigade: 080'
    ]
  },
  {
    title: 'Irish consular help in Spain',
    body:
      'For serious problems such as arrest, hospitalisation, lost passport, death, assault or urgent consular support, contact the Irish Embassy or Department of Foreign Affairs.',
    points: [
      'Embassy of Ireland, Madrid emergency line: +34 91 436 4093',
      'Department of Foreign Affairs Dublin duty officer: +353 1 408 2000',
      'Honorary Consulate of Ireland, Malaga/Fuengirola: +34 952 475 108',
      'Honorary Consulates do not usually operate an out-of-hours emergency service.'
    ]
  },
  {
    title: 'Airport and airlines',
    body:
      'Keep your booking reference handy before calling an airline. For cancelled or delayed flights, contact the airline first; airport information desks cannot usually change airline bookings.',
    points: [
      'Malaga-Costa del Sol Airport / AENA information: +34 91 321 1000',
      'Ryanair Ireland customer support: +353 1 691 7177',
      'Aer Lingus customer support: +353 1 761 7838',
      'For live flight disruption, check the airline app and your email/SMS before travelling to the airport.'
    ]
  },
  {
    title: 'Health and travel practicals',
    body:
      'Carry travel insurance details, passport copy, GHIC/EHIC card if applicable, medication names and your hotel address. In a medical emergency, go to the nearest public hospital or call 112.',
    points: [
      'Save your insurer emergency assistance phone number before you fly.',
      'Bring prescription medication in original packaging where possible.',
      'For lost medication, bring the empty box or prescription details to a pharmacy.',
      'For lost/stolen passports, contact Irish consular support and make a police report.'
    ]
  },
  {
    title: 'GolfSol Ireland support',
    body:
      'For transfers, tee-time coordination, hotel notes or trip questions connected to your GolfSol Ireland enquiry, contact us directly.',
    points: [
      'GolfSol Ireland phone / WhatsApp (Ireland): +353 87 446 4766',
      'GolfSol Ireland phone (Spain): +34 641 81 53 66',
      'GolfSol Ireland email: info@golfsolirl.com',
      'This guide is not an emergency service. In danger, call 112 first.'
    ]
  }
]

const packingChecklistSections = [
  {
    title: 'Travel documents',
    body: 'Keep documents together in your hand luggage and save digital copies on your phone.',
    points: [
      'Passport valid for travel dates',
      'Boarding passes and airline app access',
      'Travel insurance policy and emergency number',
      'EHIC/GHIC card if applicable',
      'Hotel address and GolfSol itinerary PDF',
      'Driving licence only if needed for ID or local activities'
    ]
  },
  {
    title: 'Golf essentials',
    body: 'Pack for warm-weather golf, early tee times and course dress codes.',
    points: [
      'Golf shoes and spare spikes/laces',
      'Golf glove plus spare glove',
      'Golf balls, tees, pitch mark repairer and marker',
      'Course-appropriate collared shirts',
      'Light mid-layer for early starts',
      'Cap or visor and sunglasses'
    ]
  },
  {
    title: 'Sun and heat',
    body: 'Costa del Sol rounds can be hot even outside peak summer.',
    points: [
      'High SPF sun cream',
      'After-sun or moisturiser',
      'Reusable water bottle',
      'Electrolyte tablets or hydration sachets',
      'Lip balm with SPF',
      'Light rain shell for changeable days'
    ]
  },
  {
    title: 'Airport and transfer',
    body: 'Make arrivals easier for the group organiser and transfer driver.',
    points: [
      'Phone charged before landing',
      'Portable battery pack',
      'Roaming enabled or eSIM ready',
      'Golf bag tag with name and mobile number',
      'WhatsApp installed for quick contact',
      'Group leader has all flight numbers'
    ]
  },
  {
    title: 'Evening and resort',
    body: 'Add a few non-golf items for dinners, pool time and resort comfort.',
    points: [
      'Smart casual evening wear',
      'Swimwear',
      'Comfortable walking shoes',
      'European plug adapter',
      'Medication in original packaging',
      'Small first-aid kit or blister plasters'
    ]
  }
]

const applyFooters = (doc, ctx, extraLines = []) => {
  const pages = doc.getPages()
  const total = pages.length
  pages.forEach((page, i) => {
    drawUnifiedDocumentFooter(page, 52, ctx, [...extraLines, `Page ${i + 1} of ${total}`])
  })
}

/**
 * Main enquiry record + marketing PDF attached to confirmation email.
 */
export const createBrandedEnquiryPdf = async ({
  fullName,
  email,
  interest,
  phoneWhatsApp,
  bestTimeToCall,
  enquiryId,
  enquiryDate
}) => {
  const doc = await PDFDocument.create()
  const ctx = { ...(await loadUnifiedPdfFonts(doc)), ...(await embedUnifiedLogo(doc)) }
  const { pageWidth, pageHeight, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const MIN_BODY = 96

  const fleetImage = await embedPdfJpg(doc, assets.fleetLineup, 1280, 390)
  const arrivalsImage = await embedPdfJpg(doc, assets.arrivals, 640, 408)
  const resortImage = await embedPdfJpg(doc, assets.resort, 640, 408)
  const coastalImage = await embedPdfJpg(doc, assets.coastalDrive, 640, 408)

  // —— Page 1: welcome + fleet + snapshot
  let page = doc.addPage([pageWidth, pageHeight])
  let y = drawUnifiedDocumentHeader(page, ctx, {
    kicker: 'WEBSITE ENQUIRY',
    title: 'Your Costa del Sol golf trip brief',
    subtitle:
      'Thanks for sending your trip details. We will review dates, group shape, transfers and tee-time needs before replying.'
  })

  y -= 10
  y = drawUnifiedParagraphBlock(
    page,
    y,
    ctx,
    [
      'Your golf escape is taking shape.',
      '',
      'Thanks for sending your Costa del Sol trip details. We will review your dates, group shape, transfers and tee-time needs before replying.'
    ].join('\n'),
    { size: 10.5, lineHeight: 15, color: pdfEmailTheme.ink }
  )

  y -= 12
  const fleetImgW = contentW
  const fleetImgH = Math.min(168, (fleetImage.height / fleetImage.width) * fleetImgW)
  page.drawImage(fleetImage, { x: margin, y: y - fleetImgH, width: fleetImgW, height: fleetImgH })
  y -= fleetImgH + 14

  y = drawUnifiedSectionHeading(page, y, ctx, 'Golf-bag friendly Mercedes fleet')
  y = drawUnifiedParagraphBlock(
    page,
    y,
    ctx,
    'E-Class, V-Class and Sprinter options matched to your group.',
    { size: 10.5, lineHeight: 14, color: pdfEmailTheme.muted }
  )

  y -= 8
  y = drawUnifiedGoldRule(page, y)
  y = drawUnifiedSectionHeading(page, y, ctx, 'Recommended itinerary snapshot')
  y = drawUnifiedParagraphBlock(page, y, ctx, 'Built around the details you sent.', {
    size: 10.5,
    lineHeight: 14,
    color: pdfEmailTheme.muted
  })
  y -= 6
  y = drawUnifiedKeyValueTable(page, y, ctx, [
    { label: 'Transfer', value: 'Private AGP pickup — flight-aware driver and room for clubs.' },
    { label: 'Stay', value: 'Hotel or resort matched to the group.' },
    { label: 'Golf', value: 'Courses selected around ability and daylight.' },
    { label: 'Support', value: 'Irish phone line — email, phone or WhatsApp follow-up.' }
  ])

  // —— Trip details (may span pages)
  const detailRows = [
    { label: 'Full name', value: fullName },
    { label: 'Email', value: email },
    { label: 'Phone / WhatsApp', value: phoneWhatsApp },
    { label: 'Best time to call', value: bestTimeToCall },
    { label: 'Enquiry ID', value: enquiryId },
    { label: 'Submitted', value: enquiryDate },
    { label: 'Trip interest', value: interest }
  ]

  page = doc.addPage([pageWidth, pageHeight])
  y = drawUnifiedDocumentHeader(page, ctx, {
    kicker: 'YOUR SUBMISSION',
    title: 'Trip details we received',
    subtitle:
      'Here is the trip brief we received. We will use this to prepare your Costa del Sol golf travel options.'
  })
  y -= 12

  for (const row of detailRows) {
    const need = estimateUnifiedKeyValueTableHeight(ctx, [row])
    if (y - need < MIN_BODY) {
      page = doc.addPage([pageWidth, pageHeight])
      y = drawUnifiedDocumentHeader(page, ctx, {
        kicker: 'YOUR SUBMISSION',
        title: 'Trip details (continued)',
        subtitle: ''
      })
      y -= 12
    }
    y = drawUnifiedKeyValueTable(page, y, ctx, [row])
  }

  // —— Transfer story + next step + disclaimer
  page = doc.addPage([pageWidth, pageHeight])
  y = drawUnifiedDocumentHeader(page, ctx, {
    kicker: 'TRANSFER EXPERIENCE',
    title: 'From arrivals hall to resort door',
    subtitle: 'Meet-and-greet transfers along the Sol corridor.'
  })
  y -= 10

  const cardW = (contentW - 24) / 3
  const imgH = 102
  const trioTop = y
  const trioBottom = trioTop - imgH - 72
  ;[arrivalsImage, resortImage, coastalImage].forEach((img, index) => {
    const x = margin + index * (cardW + 12)
    page.drawRectangle({
      x,
      y: trioBottom,
      width: cardW,
      height: imgH + 68,
      color: index === 1 ? pdfEmailTheme.paleGold : pdfEmailTheme.paleGreen,
      borderColor: pdfEmailTheme.sand,
      borderWidth: 0.65
    })
    page.drawImage(img, { x: x + 4, y: trioBottom + 68, width: cardW - 8, height: imgH })
  })

  const captions = [
    ['Arrivals tracked', 'Driver ready when your flight lands.'],
    ['Resort drop-off', 'Straight to hotel, villa or course.'],
    ['Sol corridor', 'Malaga, Marbella and beyond.']
  ]
  captions.forEach(([title, body], index) => {
    const x = margin + index * (cardW + 12)
    let cy = trioBottom + 58
    page.drawText(sanitizeStandardFontText(title), {
      x: x + 10,
      y: cy,
      font: ctx.fontBold,
      size: 10,
      color: pdfEmailTheme.ink,
      maxWidth: cardW - 16
    })
    cy -= 16
    page.drawText(sanitizeStandardFontText(body), {
      x: x + 10,
      y: cy,
      font: ctx.font,
      size: 9.5,
      color: pdfEmailTheme.muted,
      maxWidth: cardW - 16,
      lineHeight: 13
    })
  })

  y = trioBottom - 24
  y = drawUnifiedGoldRule(page, y)
  y = drawUnifiedSectionHeading(page, y, ctx, 'Next step')
  y = drawUnifiedParagraphBlock(
    page,
    y,
    ctx,
    'Tell us what to tune.\n\nReply with any dates, group changes or must-play courses. We will shape the quote around the group rather than forcing you into a fixed package.',
    {
      size: 10.5,
      lineHeight: 15,
      color: pdfEmailTheme.ink
    }
  )

  if (y < 140) {
    page = doc.addPage([pageWidth, pageHeight])
    y = drawUnifiedDocumentHeader(page, ctx, {
      kicker: 'DISCLAIMER',
      title: 'Important notice',
      subtitle: ''
    })
    y -= 18
  }

  y = drawUnifiedSectionHeading(page, y, ctx, 'Important disclaimer')
  y = drawUnifiedParagraphBlock(page, y, ctx, disclaimerParagraphsPdf.join('\n\n'), {
    size: 10,
    lineHeight: 14,
    color: pdfEmailTheme.muted
  })

  applyFooters(doc, ctx, [
    `© ${new Date().getFullYear()} GolfSol Ireland · Irish-owned Costa del Sol golf travel · Transfers, accommodation and tee times in one place.`
  ])
  return doc.save()
}

const renderBulletSectionsPdf = async ({ title, kicker, subtitle, sections, footerTag }) => {
  const doc = await PDFDocument.create()
  const ctx = { ...(await loadUnifiedPdfFonts(doc)), ...(await embedUnifiedLogo(doc)) }
  const { pageWidth, pageHeight, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const MIN_Y = 88

  let page = doc.addPage([pageWidth, pageHeight])
  let y = drawUnifiedDocumentHeader(page, ctx, {
    kicker,
    title,
    subtitle
  })
  y -= 18

  for (const section of sections) {
    const need = estimateUnifiedBulletCardHeight(ctx, section, contentW)
    if (y - need < MIN_Y) {
      page = doc.addPage([pageWidth, pageHeight])
      y = drawUnifiedDocumentHeader(page, ctx, {
        kicker: `${kicker} · continued`,
        title,
        subtitle: ''
      })
      y -= 18
    }
    y = drawUnifiedBulletCard(page, y, ctx, section)
  }

  applyFooters(doc, ctx, [footerTag])
  return doc.save()
}

export const createTermsAndConditionsPdf = () =>
  renderBulletSectionsPdf({
    title: 'Terms and conditions for GolfSol Ireland bookings',
    kicker: 'Important booking terms',
    subtitle:
      'Please read these terms before paying a deposit or confirming a trip. They explain how deposits, balances, supplier rules, cancellations and liability work for GolfSol Ireland enquiries and bookings.',
    sections: supplementalTermsSections,
    footerTag: `© ${new Date().getFullYear()} Golf Sol Ireland · Terms and conditions summary.`
  })

export const createTravellerContactsPdf = () =>
  renderBulletSectionsPdf({
    title: 'Costa del Sol traveller contacts for Irish golfers',
    kicker: 'Useful numbers',
    subtitle:
      'A practical contact sheet for Irish travellers heading to Malaga and the Costa del Sol. Save it to your phone before you fly. Numbers can change, so check official websites for the latest details.',
    sections: travellerContactSections,
    footerTag: `© ${new Date().getFullYear()} Golf Sol Ireland · Traveller contact guide · In an emergency call 112.`
  })

const estimatePackingSectionHeight = (ctx, section, contentW) => {
  const pad = 16
  const innerW = contentW - pad * 2
  const titleLH = 15
  const bodyLH = 14
  const lineLH = 14
  const titleLines = wrapPlainLinesWithFont(ctx.fontBold, section.title, 12, innerW)
  const bodyLines = wrapPlainLinesWithFont(ctx.font, section.body, 10.5, innerW - 4)
  let pointsH = 0
  for (const p of section.points) {
    const lines = wrapPlainLinesWithFont(ctx.font, p, 10.5, innerW - 38)
    pointsH += Math.max(lines.length * lineLH, 20) + 6
  }
  return pad + titleLines.length * titleLH + bodyLines.length * bodyLH + 14 + pointsH + pad + 12
}

const drawPackingSectionCard = (page, startY, ctx, section) => {
  const { pageWidth, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const pad = 16
  const innerLeft = margin + pad
  const innerW = contentW - pad * 2
  const lineLH = 14

  const titleLines = wrapPlainLinesWithFont(ctx.fontBold, section.title, 12, innerW)
  const bodyLines = wrapPlainLinesWithFont(ctx.font, section.body, 10.5, innerW - 4)

  let pointsBlockH = 0
  const pointLayouts = section.points.map((p) => {
    const lines = wrapPlainLinesWithFont(ctx.font, p, 10.5, innerW - 38)
    const h = Math.max(lines.length * lineLH, 18) + 8
    pointsBlockH += h
    return lines
  })

  const titleBlockH = titleLines.length * 15
  const bodyBlockH = bodyLines.length * 14
  const cardH = pad + titleBlockH + 10 + bodyBlockH + 18 + pointsBlockH + pad
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

  let y = startY - pad - 12
  for (const line of titleLines) {
    page.drawText(line, {
      x: innerLeft,
      y,
      font: ctx.fontBold,
      size: 12,
      color: pdfEmailTheme.ink
    })
    y -= 15
  }
  y -= 6
  for (const line of bodyLines) {
    page.drawText(line, {
      x: innerLeft,
      y,
      font: ctx.font,
      size: 10.5,
      color: pdfEmailTheme.muted
    })
    y -= 14
  }
  y -= 12

  section.points.forEach((point, idx) => {
    const lines = pointLayouts[idx]
    const boxTop = y + 3
    page.drawRectangle({
      x: innerLeft,
      y: boxTop - 16,
      width: 15,
      height: 15,
      borderColor: pdfEmailTheme.green,
      borderWidth: 2,
      color: pdfEmailTheme.white
    })
    let tx = innerLeft + 26
    let ty = y
    for (const ln of lines) {
      page.drawText(ln, {
        x: tx,
        y: ty,
        font: ctx.font,
        size: 10.5,
        color: pdfEmailTheme.ink
      })
      ty -= lineLH
    }
    y = ty - 10
  })

  return bottom - 14
}

export const createPackingChecklistPdf = async () => {
  const doc = await PDFDocument.create()
  const ctx = { ...(await loadUnifiedPdfFonts(doc)), ...(await embedUnifiedLogo(doc)) }
  const { pageWidth, pageHeight, margin } = UNIFIED_PDF_LAYOUT
  const contentW = pageWidth - margin * 2
  const MIN_Y = 96

  let page = doc.addPage([pageWidth, pageHeight])
  let y = drawUnifiedDocumentHeader(page, ctx, {
    kicker: 'PACKING CHECKLIST',
    title: 'Costa del Sol golf trip packing checklist',
    subtitle: 'Tick each box before you leave Ireland — designed for golf groups with clubs and transfers.'
  })
  y -= 14
  y = drawUnifiedParagraphBlock(
    page,
    y,
    ctx,
    'Tick each box before you leave Ireland. This guide is designed for golf groups travelling with clubs, hand luggage, transfer pickups and warm-weather rounds.',
    { size: 10.5, lineHeight: 14, color: pdfEmailTheme.muted }
  )
  y -= 18

  for (const section of packingChecklistSections) {
    const need = estimatePackingSectionHeight(ctx, section, contentW)
    if (y - need < MIN_Y) {
      page = doc.addPage([pageWidth, pageHeight])
      y = drawUnifiedDocumentHeader(page, ctx, {
        kicker: 'PACKING CHECKLIST · continued',
        title: 'Packing checklist',
        subtitle: ''
      })
      y -= 18
    }
    y = drawPackingSectionCard(page, y, ctx, section)
  }

  applyFooters(doc, ctx, [
    `© ${new Date().getFullYear()} Golf Sol Ireland · Packing checklist · Tick boxes before departure.`
  ])
  return doc.save()
}
