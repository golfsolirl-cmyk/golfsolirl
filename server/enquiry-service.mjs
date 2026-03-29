import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { Resend } from 'resend'
import sharp from 'sharp'
import { createEnquiryReferenceId, formatDocumentDate } from '../shared/document-templates.mjs'

const pageWidth = 595.28
const pageHeight = 841.89

const colors = {
  pageBg: rgb(238 / 255, 242 / 255, 235 / 255),
  forest950: rgb(10 / 255, 32 / 255, 8 / 255),
  forest900: rgb(22 / 255, 58 / 255, 19 / 255),
  forestFooter: rgb(15 / 255, 36 / 255, 16 / 255),
  fairway600: rgb(61 / 255, 129 / 255, 32 / 255),
  gold400: rgb(220 / 255, 88 / 255, 1 / 255),
  gold300: rgb(253 / 255, 186 / 255, 116 / 255),
  white: rgb(1, 1, 1),
  slate700: rgb(55 / 255, 65 / 255, 81 / 255),
  slate500: rgb(107 / 255, 114 / 255, 128 / 255),
  border: rgb(223 / 255, 231 / 255, 219 / 255),
  cardBorder: rgb(217 / 255, 239 / 255, 211 / 255),
  offwhite: rgb(247 / 255, 249 / 255, 245 / 255),
  tableStripe: rgb(249 / 255, 251 / 255, 247 / 255)
}

const missingConfigMessage =
  'Resend is not configured. Set RESEND_API_KEY, RESEND_FROM_EMAIL, and RESEND_NOTIFICATION_TO.'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFilePath)
const brandLockupAssetPath = path.resolve(currentDirectory, '../src/gsol-brand-lockup-exact.png')
const landingEmailTemplatePath = path.resolve(currentDirectory, '../public/landing-email-template.html')

const brandLockupContentId = 'gsol-brand-lockup'
const socialContentIds = {
  linkedin: 'gsol-social-linkedin',
  facebook: 'gsol-social-facebook',
  whatsapp: 'gsol-social-whatsapp',
  bsky: 'gsol-social-bsky'
}

let brandLockupPngBufferPromise
let landingEmailTemplateCache
const socialPngPromises = {}

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'proposal'

const getBrandLockupPngBuffer = async () => {
  if (!brandLockupPngBufferPromise) {
    brandLockupPngBufferPromise = Promise.resolve(readFileSync(brandLockupAssetPath))
  }
  return brandLockupPngBufferPromise
}

const rasterizeFaIcon = async (viewBox, pathD) => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><path fill="#dc5801" d="${pathD}"/></svg>`
  return sharp(Buffer.from(svg))
    .resize(44, 44, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

const getSocialIconPng = (key, viewBox, pathD) => {
  if (!socialPngPromises[key]) {
    socialPngPromises[key] = rasterizeFaIcon(viewBox, pathD)
  }
  return socialPngPromises[key]
}

const getLandingEmailTemplateRaw = () => {
  if (!landingEmailTemplateCache) {
    landingEmailTemplateCache = readFileSync(landingEmailTemplatePath, 'utf8')
  }
  return landingEmailTemplateCache
}

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

const disclaimerParagraphs = [
  'Golf Sol Ireland arranges golf travel as an agent. If a trip is booked, your contract is with the relevant accommodation, golf, and transport suppliers on their terms, alongside any booking conditions we issue in writing.',
  'This email only confirms we received your enquiry and lists the details you submitted. It is not a quote, availability check, invoice, receipt, booking confirmation, or legally binding agreement.',
  'Prices, tee times, hotel rooms, and transfers are not held or guaranteed until we confirm them in a formal proposal and you accept the next steps in writing.'
]

const termsSummaryParagraphs = [
  'Enquiries through golfsolirl.com are subject to our full terms. A 20% deposit may apply when you proceed to book; balance terms are confirmed in your formal proposal. Enquiries are no-obligation until you accept a written offer.',
  'By submitting the form you agree we may contact you by email, phone, or WhatsApp regarding your trip. You can ask us to stop at any time.'
]

const samplePreheader =
  'Website enquiry — Golf Sol Ireland. Sample from golfsolirl.com including phone and best time to call.'

const sampleCustomerHeroTitle = 'Thanks — we received your Costa del Sol enquiry'

const sampleCustomerHeroLead =
  'Below is what you submitted from the get-in-touch form on golfsolirl.com. We’ll use your phone or WhatsApp and your preferred call window when we reach out.'

const sampleCustomerHeroLeadAsciiApostrophe =
  'Below is what you submitted from the get-in-touch form on golfsolirl.com. We\'ll use your phone or WhatsApp and your preferred call window when we reach out.'

const sampleSidebarSource = 'Source: golfsolirl.com'

const iconPaths = {
  linkedin: {
    vb: '0 0 448 512',
    d: 'M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z'
  },
  facebook: {
    vb: '0 0 320 512',
    d: 'M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z'
  },
  whatsapp: {
    vb: '0 0 448 512',
    d: 'M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.5c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56 81.2 56 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.2-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.1 31.5 11.7 13.2 4.2 25.2 3.6 34.7 2.2 10.6-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z'
  },
  bsky: {
    vb: '0 0 512 512',
    d: 'M111.8 62.2C170.2 105.9 233 194.7 256 242.4c23-47.6 85.8-136.4 144.2-180.2c42.1-31.6 110.3-56 110.3 21.8c0 15.5-8.9 130.5-14.1 149.2C478.2 298 412 314.6 353.1 304.5c102.9 17.5 129.1 75.5 72.5 133.5c-107.4 110.2-154.3-27.6-166.3-62.9l0 0c-1.7-4.9-2.6-7.8-3.3-7.8s-1.6 3-3.3 7.8l0 0c-12 35.3-59 173.1-166.3 62.9c-56.5-58-30.4-116 72.5-133.5C100 314.6 33.8 298 15.7 233.1C10.4 214.4 1.5 99.4 1.5 83.9c0-77.8 68.2-53.4 110.3-21.8z'
  }
}

const buildEmailSocialRowWithCidImages = () => {
  const cell = (href, label, cid) => `
                              <td style="padding:0 12px 0 0;vertical-align:middle;">
                                <a href="${href}" aria-label="${label}" style="display:block;text-decoration:none;">
                                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:48px;height:48px;border-collapse:collapse;border-radius:50%;background-color:rgba(255,255,255,0.08);border:1px solid rgba(220,88,1,0.45);">
                                    <tr>
                                      <td align="center" valign="middle" style="width:48px;height:48px;padding:0;line-height:0;">
                                        <img src="cid:${cid}" width="24" height="24" alt="" style="display:block;border:0;outline:none;margin:0 auto;" />
                                      </td>
                                    </tr>
                                  </table>
                                </a>
                              </td>`

  return `
                          <p style="margin:24px 0 14px 0;font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.45);">Stay connected</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                            <tr>
${cell('https://www.linkedin.com/', 'LinkedIn', socialContentIds.linkedin)}
${cell('https://www.facebook.com/', 'Facebook', socialContentIds.facebook)}
${cell('https://www.whatsapp.com/', 'WhatsApp', socialContentIds.whatsapp)}
                              <td style="padding:0;vertical-align:middle;">
                                <a href="https://bsky.app/" aria-label="Bluesky" style="display:block;text-decoration:none;">
                                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:48px;height:48px;border-collapse:collapse;border-radius:50%;background-color:rgba(255,255,255,0.08);border:1px solid rgba(220,88,1,0.45);">
                                    <tr>
                                      <td align="center" valign="middle" style="width:48px;height:48px;padding:0;line-height:0;">
                                        <img src="cid:${socialContentIds.bsky}" width="24" height="24" alt="" style="display:block;border:0;outline:none;margin:0 auto;" />
                                      </td>
                                    </tr>
                                  </table>
                                </a>
                              </td>
                            </tr>
                          </table>`
}

const prepareLandingEmailHtmlForSend = (html) => {
  const heroImg = `<img src="cid:${brandLockupContentId}" width="300" alt="Golf Sol Ireland" style="display:block;border:0;outline:none;width:300px;max-width:100%;height:auto;filter:drop-shadow(0 8px 24px rgba(10,32,8,0.22));-webkit-filter:drop-shadow(0 8px 24px rgba(10,32,8,0.22));" />`
  const footImg = `<img src="cid:${brandLockupContentId}" width="168" alt="" style="display:block;border:0;outline:none;width:168px;max-width:100%;height:auto;" />`
  const socialBlock = buildEmailSocialRowWithCidImages()

  return html
    .replace(/<!--\s*GSOL-BRAND-LOCKUP\s*-->[\s\S]*?<!--\s*\/GSOL-BRAND-LOCKUP\s*-->/, heroImg)
    .replace(/<!--\s*GSOL-FOOT-LOCKUP\s*-->[\s\S]*?<!--\s*\/GSOL-FOOT-LOCKUP\s*-->/, footImg)
    .replace(/<!--\s*GSOL-SOCIAL-ICONS\s*-->[\s\S]*?<!--\s*\/GSOL-SOCIAL-ICONS\s*-->/, socialBlock)
    .replaceAll('href="/terms-and-conditions"', 'href="https://golfsolirl.com/terms-and-conditions"')
}

export const validateEnquiryPayload = (payload) => {
  const fullName = typeof payload?.fullName === 'string' ? payload.fullName.trim() : ''
  const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : ''
  const interest = typeof payload?.interest === 'string' ? payload.interest.trim() : ''
  const phoneWhatsApp = typeof payload?.phoneWhatsApp === 'string' ? payload.phoneWhatsApp.trim() : ''
  const bestTimeToCall = typeof payload?.bestTimeToCall === 'string' ? payload.bestTimeToCall.trim() : ''

  if (!fullName || !email || !interest || !phoneWhatsApp || !bestTimeToCall) {
    const error = new Error(
      'Full name, email address, trip interest, phone / WhatsApp, and best time to call are required.'
    )
    error.statusCode = 400
    throw error
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error('Please enter a valid email address.')
    error.statusCode = 400
    throw error
  }

  return {
    fullName,
    email,
    interest,
    phoneWhatsApp,
    bestTimeToCall
  }
}

const rowHeightForValue = (value, font, maxW) => {
  const lines = wrapText({ text: value, font, fontSize: 11, maxWidth: maxW })
  const inner = Math.max(22, lines.length * 13 + 10)
  return inner + 18
}

export const createEnquiryPdf = async ({
  fullName,
  email,
  interest,
  phoneWhatsApp,
  bestTimeToCall,
  enquiryId,
  enquiryDate
}) => {
  const pdfDocument = await PDFDocument.create()
  const page = pdfDocument.addPage([pageWidth, pageHeight])
  const regularFont = await pdfDocument.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDocument.embedFont(StandardFonts.HelveticaBold)
  const brandLockupImage = await pdfDocument.embedPng(await getBrandLockupPngBuffer())

  const m = 40
  const cardPad = 14
  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: colors.pageBg })

  page.drawRectangle({
    x: m,
    y: m,
    width: pageWidth - m * 2,
    height: pageHeight - m * 2,
    color: colors.white,
    borderColor: colors.cardBorder,
    borderWidth: 1
  })

  const innerTop = pageHeight - m
  const innerLeft = m + cardPad
  const innerW = pageWidth - (m + cardPad) * 2

  const heroH = 182
  const heroBottomY = innerTop - heroH
  page.drawRectangle({
    x: m,
    y: heroBottomY,
    width: pageWidth - m * 2,
    height: heroH,
    color: colors.forest950
  })
  page.drawRectangle({
    x: m,
    y: heroBottomY,
    width: pageWidth - m * 2,
    height: heroH,
    color: colors.fairway600,
    opacity: 0.16
  })

  const lockScale = 0.19
  const ld = brandLockupImage.scale(lockScale)
  const lockX = innerLeft
  const lockY = innerTop - 24 - ld.height
  page.drawImage(brandLockupImage, {
    x: lockX,
    y: lockY,
    width: ld.width,
    height: ld.height
  })

  const metaW = 168
  const metaX = m + (pageWidth - m * 2) - cardPad - metaW
  const metaPad = 14
  page.drawRectangle({
    x: metaX,
    y: innerTop - 24 - 80,
    width: metaW,
    height: 80,
    color: colors.white,
    opacity: 0.12,
    borderColor: colors.white,
    borderWidth: 0.5
  })

  page.drawText(`Enquiry ID: ${enquiryId}`, {
    x: metaX + metaPad,
    y: innerTop - 44,
    font: boldFont,
    size: 9.5,
    color: colors.white
  })
  page.drawText(`Submitted: ${enquiryDate}`, {
    x: metaX + metaPad,
    y: innerTop - 60,
    font: regularFont,
    size: 9,
    color: colors.white
  })
  page.drawText(sampleSidebarSource, {
    x: metaX + metaPad,
    y: innerTop - 76,
    font: regularFont,
    size: 8.5,
    color: colors.white
  })

  let ty = lockY - 20
  ty = drawTextBlock({
    page,
    text: 'WEBSITE ENQUIRY',
    x: innerLeft,
    y: ty,
    font: boldFont,
    fontSize: 8,
    color: colors.gold300,
    maxWidth: 360,
    lineHeight: 10
  })
  ty -= 6
  ty = drawTextBlock({
    page,
    text: 'Thanks — we received your Costa del Sol enquiry',
    x: innerLeft,
    y: ty,
    font: boldFont,
    fontSize: 17,
    color: colors.white,
    maxWidth: metaX - innerLeft - 20,
    lineHeight: 20
  })
  ty -= 10
  ty = drawTextBlock({
    page,
    text:
      'Below is what you submitted from the get-in-touch form on golfsolirl.com. We will use your phone or WhatsApp and your preferred call window when we reach out.',
    x: innerLeft,
    y: ty,
    font: regularFont,
    fontSize: 9.5,
    color: colors.white,
    maxWidth: metaX - innerLeft - 20,
    lineHeight: 12.5
  })

  const rows = [
    ['Full name', fullName],
    ['Email', email],
    ['Phone / WhatsApp', phoneWhatsApp],
    ['Best time to call', bestTimeToCall],
    ['Enquiry ID', enquiryId],
    ['Submitted', enquiryDate],
    ['Trip interest', interest]
  ]

  const labelColW = 118
  const valueX = innerLeft + labelColW + 6
  const maxVw = innerW - labelColW - 24
  let tableH = 30
  for (const [, val] of rows) {
    tableH += rowHeightForValue(val, regularFont, maxVw)
  }

  let cursorY = Math.min(ty - 28, heroBottomY - 22) - 16

  page.drawText('YOUR SUBMITTED DETAILS', {
    x: innerLeft,
    y: cursorY,
    font: boldFont,
    size: 8,
    color: colors.gold400
  })
  cursorY -= 20

  let rowY = cursorY
  let rowIdx = 0
  for (const [label, val] of rows) {
    const rh = rowHeightForValue(val, regularFont, maxVw)
    const stripe = rowIdx % 2 === 1
    if (stripe) {
      page.drawRectangle({
        x: innerLeft - 6,
        y: rowY - rh + 12,
        width: innerW + 12,
        height: rh,
        color: colors.tableStripe
      })
    }
    page.drawText(label, {
      x: innerLeft,
      y: rowY - 14,
      font: boldFont,
      size: 9,
      color: colors.slate500
    })
    drawTextBlock({
      page,
      text: val,
      x: valueX,
      y: rowY - 14,
      font: regularFont,
      fontSize: 11,
      color: colors.slate700,
      maxWidth: maxVw,
      lineHeight: 13
    })
    page.drawLine({
      start: { x: innerLeft - 4, y: rowY - rh + 8 },
      end: { x: innerLeft + innerW + 4, y: rowY - rh + 8 },
      color: colors.border,
      thickness: 0.65
    })
    rowY -= rh
    rowIdx += 1
  }

  let blockY = rowY - 22
  const discFontSize = 8.5
  const discLH = 10.5
  const discText = disclaimerParagraphs.join('\n\n')
  const discLines = wrapText({
    text: discText,
    font: regularFont,
    fontSize: discFontSize,
    maxWidth: innerW
  })
  const discH = Math.max(96, 36 + discLines.length * discLH + 18)
  const discBottom = blockY - discH
  if (discBottom < m + 8) {
    const shift = m + 8 - discBottom
    blockY += shift
  }
  page.drawRectangle({
    x: innerLeft - 6,
    y: blockY - discH,
    width: innerW + 12,
    height: discH,
    color: colors.white,
    borderColor: colors.gold400,
    borderWidth: 1
  })
  page.drawText('IMPORTANT DISCLAIMER', {
    x: innerLeft,
    y: blockY - 18,
    font: boldFont,
    size: 8,
    color: colors.gold400
  })
  drawTextBlock({
    page,
    text: discText,
    x: innerLeft,
    y: blockY - 34,
    font: regularFont,
    fontSize: discFontSize,
    color: colors.slate700,
    maxWidth: innerW,
    lineHeight: discLH
  })

  const p2 = pdfDocument.addPage([pageWidth, pageHeight])
  p2.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: colors.pageBg })

  const bandH = 288
  const termsMargin = 44
  const termsPadX = 20
  const termsMaxW = pageWidth - 2 * termsMargin - 2 * termsPadX
  const termsFontSize = 10
  const termsLH = 12
  const termsBody = `${termsSummaryParagraphs.join('\n\n')}\n\nFull terms: https://golfsolirl.com/terms-and-conditions`
  const termsLines = wrapText({
    text: termsBody,
    font: regularFont,
    fontSize: termsFontSize,
    maxWidth: termsMaxW
  })
  const termsTitleBlockH = 26
  const termsBoxH = termsTitleBlockH + termsLines.length * termsLH + 28
  const termsBoxTop = pageHeight - termsMargin
  const termsBoxFloor = bandH + 32
  let termsBoxBottom = termsBoxTop - termsBoxH
  if (termsBoxBottom < termsBoxFloor) {
    termsBoxBottom = termsBoxFloor
  }
  const termsBoxActualH = termsBoxTop - termsBoxBottom

  p2.drawRectangle({
    x: termsMargin,
    y: termsBoxBottom,
    width: pageWidth - 2 * termsMargin,
    height: termsBoxActualH,
    color: colors.offwhite,
    borderColor: colors.forest900,
    borderWidth: 1.2
  })
  p2.drawText('TERMS & CONDITIONS (SUMMARY)', {
    x: termsMargin + termsPadX,
    y: termsBoxTop - 20,
    font: boldFont,
    size: 10,
    color: colors.forest900
  })
  drawTextBlock({
    page: p2,
    text: termsBody,
    x: termsMargin + termsPadX,
    y: termsBoxTop - 40,
    font: regularFont,
    fontSize: termsFontSize,
    color: colors.slate700,
    maxWidth: termsMaxW,
    lineHeight: termsLH
  })

  const footerPage = p2
  footerPage.drawRectangle({ x: 0, y: 0, width: pageWidth, height: bandH, color: colors.forestFooter })
  footerPage.drawRectangle({ x: 48, y: bandH - 36, width: 44, height: 3, color: colors.gold400 })

  const footLockSmall = brandLockupImage.scale(0.1)
  footerPage.drawImage(brandLockupImage, {
    x: 48,
    y: bandH - 48 - footLockSmall.height,
    width: footLockSmall.width,
    height: footLockSmall.height
  })

  let fy = bandH - 52 - footLockSmall.height - 8
  fy = drawTextBlock({
    page: footerPage,
    text: 'Premium Costa del Sol golf trips for Irish groups — courses, stays, and transfers planned together.',
    x: 48,
    y: fy,
    font: regularFont,
    fontSize: 9.5,
    color: colors.white,
    maxWidth: pageWidth - 96,
    lineHeight: 12
  })
  fy -= 16

  const col1X = 48
  const col2X = pageWidth / 2 + 8
  footerPage.drawText('REGISTERED ADDRESS', {
    x: col1X,
    y: fy,
    font: boldFont,
    size: 7.5,
    color: colors.gold300
  })
  footerPage.drawText('CONTACT', { x: col2X, y: fy, font: boldFont, size: 7.5, color: colors.gold300 })
  fy -= 14
  const fyLeft = drawTextBlock({
    page: footerPage,
    text: '8 Richmond Road\nDrumcondra, Dublin 3\nD03C434',
    x: col1X,
    y: fy,
    font: regularFont,
    fontSize: 10,
    color: colors.white,
    maxWidth: 220,
    lineHeight: 12
  })
  const fyRight = drawTextBlock({
    page: footerPage,
    text: '087 446 4766\nhello@golfsolirl.com\ngolfsolirl.com',
    x: col2X,
    y: fy,
    font: regularFont,
    fontSize: 10,
    color: colors.white,
    maxWidth: 240,
    lineHeight: 12
  })
  fy = Math.min(fyLeft, fyRight) - 18

  fy = drawTextBlock({
    page: footerPage,
    text: 'Packages · Courses · Hotels · Transfers · Plan your trip · Testimonials — golfsolirl.com',
    x: 48,
    y: fy,
    font: regularFont,
    fontSize: 8,
    color: colors.gold300,
    maxWidth: pageWidth - 96,
    lineHeight: 11
  })
  fy -= 10
  footerPage.drawText('Terms: https://golfsolirl.com/terms-and-conditions', {
    x: 48,
    y: fy,
    font: regularFont,
    size: 9,
    color: colors.white
  })
  fy -= 18
  footerPage.drawText(`© ${new Date().getFullYear()} Golf Sol Ireland. All rights reserved.`, {
    x: 48,
    y: fy,
    font: regularFont,
    size: 8,
    color: rgb(180 / 255, 190 / 255, 175 / 255)
  })

  return pdfDocument.save()
}

const buildEnquiryLandingEmailHtml = (payload, variant) => {
  let html = getLandingEmailTemplateRaw()
  const { fullName, email, interest, phoneWhatsApp, bestTimeToCall, enquiryId, enquiryDate } = payload
  const telDigits = phoneWhatsApp.replace(/[^\d+]/g, '')
  const telHref = telDigits ? `tel:${telDigits}` : '#'

  const customerPreheader = `We received your Costa del Sol enquiry (${enquiryId}). Golf Sol Ireland will use your phone, WhatsApp, and preferred call window.`
  const adminPreheader = `New website enquiry ${enquiryId} from ${fullName}. Submitted via golfsolirl.com.`

  if (variant === 'admin') {
    html = html.replace(sampleCustomerHeroTitle, escapeHtml(`New enquiry — ${fullName}`))
    const adminLead = `Internal copy: lead submitted via golfsolirl.com get-in-touch form. Reply to this email reaches the customer at ${email}.`
    html = html.replace(sampleCustomerHeroLead, escapeHtml(adminLead))
    html = html.replace(sampleCustomerHeroLeadAsciiApostrophe, escapeHtml(adminLead))
    html = html.replace(sampleSidebarSource, 'Source: Website form (internal notify)')
  }

  html = html.replace(samplePreheader, escapeHtml(variant === 'customer' ? customerPreheader : adminPreheader))

  const replacements = [
    ['mailto:jordan.kelly@example.com', `mailto:${email}`],
    ['Jordan Kelly', escapeHtml(fullName)],
    ['jordan.kelly@example.com', escapeHtml(email)],
    ['+353 87 000 0000', escapeHtml(phoneWhatsApp)],
    ['tel:+353870000000', escapeHtml(telHref)],
    ['Weekday mornings (9:00–12:00)', escapeHtml(bestTimeToCall)],
    ['GSI-L4ND-9206', escapeHtml(enquiryId)],
    ['29 Mar 2026', escapeHtml(enquiryDate)],
    ['5-star week in Marbella for 8 golfers, April 2026', escapeHtml(interest)],
    ['© 2026 Golf Sol Ireland', `© ${new Date().getFullYear()} Golf Sol Ireland`]
  ]

  for (const [from, to] of replacements) {
    html = html.split(from).join(to)
  }

  return prepareLandingEmailHtmlForSend(html)
}

const buildCustomerHtml = (payload) => buildEnquiryLandingEmailHtml(payload, 'customer')
const buildOwnerHtml = (payload) => buildEnquiryLandingEmailHtml(payload, 'admin')

const attachmentFromBuffer = (filename, buffer, contentType, contentId) => ({
  filename,
  content: Buffer.from(buffer).toString('base64'),
  contentType,
  contentId
})

export const handleEnquirySubmission = async (payload, env = process.env) => {
  const enquiry = validateEnquiryPayload(payload)
  const enquiryId = createEnquiryReferenceId()
  const enquiryDate = formatDocumentDate()
  const resendApiKey = env.RESEND_API_KEY
  const fromEmail = env.RESEND_FROM_EMAIL
  const notificationEmail = env.RESEND_NOTIFICATION_TO

  if (!resendApiKey || !fromEmail || !notificationEmail) {
    const error = new Error(missingConfigMessage)
    error.statusCode = 500
    throw error
  }

  const resend = new Resend(resendApiKey)
  const brandBuf = await getBrandLockupPngBuffer()
  const [li, fb, wa, bk] = await Promise.all([
    getSocialIconPng('linkedin', iconPaths.linkedin.vb, iconPaths.linkedin.d),
    getSocialIconPng('facebook', iconPaths.facebook.vb, iconPaths.facebook.d),
    getSocialIconPng('whatsapp', iconPaths.whatsapp.vb, iconPaths.whatsapp.d),
    getSocialIconPng('bsky', iconPaths.bsky.vb, iconPaths.bsky.d)
  ])

  const imageAttachments = [
    attachmentFromBuffer('golf-sol-brand-lockup.png', brandBuf, 'image/png', brandLockupContentId),
    attachmentFromBuffer('social-linkedin.png', li, 'image/png', socialContentIds.linkedin),
    attachmentFromBuffer('social-facebook.png', fb, 'image/png', socialContentIds.facebook),
    attachmentFromBuffer('social-whatsapp.png', wa, 'image/png', socialContentIds.whatsapp),
    attachmentFromBuffer('social-bluesky.png', bk, 'image/png', socialContentIds.bsky)
  ]

  const pdfBytes = await createEnquiryPdf({ ...enquiry, enquiryId, enquiryDate })
  const pdfAttachment = {
    filename: `golf-sol-ireland-enquiry-${slugify(enquiryId)}.pdf`,
    content: Buffer.from(pdfBytes).toString('base64'),
    contentType: 'application/pdf'
  }

  const allAttachments = [pdfAttachment, ...imageAttachments]

  await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: [enquiry.email],
      subject: `Your Golf Sol Ireland enquiry confirmation (${enquiryId})`,
      html: buildCustomerHtml({ ...enquiry, enquiryId, enquiryDate }),
      attachments: allAttachments
    }),
    resend.emails.send({
      from: fromEmail,
      to: [notificationEmail],
      replyTo: enquiry.email,
      subject: `New Golf Sol Ireland enquiry ${enquiryId} from ${enquiry.fullName}`,
      html: buildOwnerHtml({ ...enquiry, enquiryId, enquiryDate }),
      attachments: allAttachments
    })
  ])

  return {
    success: true,
    message: 'Your enquiry has been sent. Check your inbox for the enquiry PDF.'
  }
}
