import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { Resend } from 'resend'
import { createEnquiryReferenceId, formatDocumentDate } from '../shared/document-templates.mjs'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { gsolEmailBrand } from './email-constants.mjs'
import { emailFonts, gs, emailAmbientGradientFillStyle } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml, getGsolSiteUrl } from './email-layout.mjs'
import { buildBrandedEnquiryEmailHtml } from './branded-enquiry-email.mjs'
import { runPostEnquiryPortalInviteJob } from './post-enquiry-portal-invite.mjs'
import { insertTransferBookingFromWebsiteEnquiry } from './insert-transfer-booking-from-enquiry.mjs'
import { assertEnquiryDriverDatesNotBlocked } from './enquiry-booked-dates.mjs'
import { ensureEmailAccountAnchor, isAuthEmailBlocked } from './email-address-registry.mjs'
import { assertApiRateLimit, parsePositiveInt } from './api-rate-limit.mjs'
import { computePhoneUniquenessKey } from './phone-e164.mjs'
/** Real imports (not `export { … } from './…'` only): handlers call these by name in module scope. */
import {
  createBrandedEnquiryPdf,
  createTermsAndConditionsPdf,
  createTravellerContactsPdf,
  createPackingChecklistPdf
} from './enquiry-form-pdfs-unified.mjs'

const pageWidth = 595.28
const pageHeight = 841.89

/** Minimum body / reading text size (pt) on generated PDFs. */
const PDF_READING_PT = 16
const PDF_READING_LH = 22

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
const brandLockupAssetPath = path.resolve(currentDirectory, '../public/images/gsirl.png')
let brandLockupPngBufferPromise

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

/** Vertical advance for wrapped lines — empty lines = paragraph gap (keeps font size, avoids overlap). */
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

const disclaimerParagraphs = [
  'Golf Sol Ireland arranges golf travel as an agent. If a trip is booked, your contract is with the relevant accommodation, golf, and transport suppliers on their terms, alongside any booking conditions we issue in writing.',
  'This email only confirms we received your enquiry and lists the details you submitted. It is not a quote, availability check, invoice, receipt, booking confirmation, or legally binding agreement.',
  'Prices, tee times, hotel rooms, and transfers are not held or guaranteed until we confirm them in a formal proposal and you accept the next steps in writing.'
]

const termsSummaryParagraphs = [
  'Enquiries through golfsolirl.com are subject to our full terms. A 20% deposit may apply when you proceed to book; balance terms are confirmed in your formal proposal. Enquiries are no-obligation until you accept a written offer.',
  'By submitting the form you agree we may contact you by email, phone, or WhatsApp regarding your trip. You can ask us to stop at any time.'
]

const buildEnquiryFieldRowsHtml = (rows) =>
  rows
    .map(
      ([label, valueHtml], idx) => `
                            <tr style="background-color:${idx % 2 === 1 ? gs.rowA : '#ffffff'};">
                              <td style="padding:12px 16px;font-family:${emailFonts.sans};font-size:11px;font-weight:800;color:${gs.muted};width:34%;vertical-align:top;border-bottom:1px solid rgba(13,61,46,0.12);">${escapeHtml(label)}</td>
                              <td style="padding:12px 16px;font-family:${emailFonts.sans};font-size:14px;line-height:1.5;color:${gs.text};vertical-align:top;border-bottom:1px solid rgba(13,61,46,0.12);">${valueHtml}</td>
                            </tr>`
    )
    .join('')

const MAX_FORM_PAYLOAD_KEYS = 40
const MAX_FORM_ID_LEN = 64
const MAX_FORM_FIELD_KEY_LEN = 56
const MAX_FORM_FIELD_VALUE_LEN = 4000

/**
 * Normalises optional client `formPayload` for structured admin submission detail.
 * Shape: { form: string, fields: Record<string, string> }
 */
const sanitizeFormPayload = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null
  }
  const form = typeof raw.form === 'string' ? raw.form.trim().slice(0, MAX_FORM_ID_LEN) : ''
  const fieldsRaw = raw.fields
  if (!form || !fieldsRaw || typeof fieldsRaw !== 'object' || Array.isArray(fieldsRaw)) {
    return null
  }
  const fields = {}
  let count = 0
  for (const [k0, v0] of Object.entries(fieldsRaw)) {
    if (count >= MAX_FORM_PAYLOAD_KEYS) {
      break
    }
    const k = typeof k0 === 'string' ? k0.trim().slice(0, MAX_FORM_FIELD_KEY_LEN) : ''
    if (!k) {
      continue
    }
    let v = ''
    if (typeof v0 === 'string') {
      v = v0.trim().slice(0, MAX_FORM_FIELD_VALUE_LEN)
    } else if (typeof v0 === 'number' && Number.isFinite(v0)) {
      v = String(v0)
    } else if (typeof v0 === 'boolean') {
      v = v0 ? 'yes' : 'no'
    }
    fields[k] = v
    count++
  }
  if (count === 0) {
    return null
  }
  return { form, fields }
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

  const formPayload = sanitizeFormPayload(payload?.formPayload)

  return {
    fullName,
    email,
    interest,
    phoneWhatsApp,
    bestTimeToCall,
    ...(formPayload ? { formPayload } : {})
  }
}

const rowHeightForValue = (value, font, maxW) => {
  const lines = wrapText({ text: value, font, fontSize: PDF_READING_PT, maxWidth: maxW })
  const bodyH = measureWrappedDrawHeight(lines, PDF_READING_LH)
  // Label row (~22pt) + value block + breathing room above rule
  return Math.max(48, bodyH + 34)
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

  const lockScale = 0.32
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
    y: innerTop - 24 - 112,
    width: metaW,
    height: 112,
    color: colors.white,
    opacity: 0.12,
    borderColor: colors.white,
    borderWidth: 0.5
  })

  page.drawText(`Enquiry ID: ${enquiryId}`, {
    x: metaX + metaPad,
    y: innerTop - 48,
    font: boldFont,
    size: PDF_READING_PT,
    color: colors.white
  })
  page.drawText(`Submitted: ${enquiryDate}`, {
    x: metaX + metaPad,
    y: innerTop - 76,
    font: regularFont,
    size: PDF_READING_PT,
    color: colors.white
  })
  page.drawText('Source: golfsolirl.com', {
    x: metaX + metaPad,
    y: innerTop - 104,
    font: regularFont,
    size: PDF_READING_PT,
    color: colors.white
  })

  let ty = lockY - 20
  ty = drawTextBlock({
    page,
    text: 'WEBSITE ENQUIRY',
    x: innerLeft,
    y: ty,
    font: boldFont,
    fontSize: PDF_READING_PT,
    color: colors.gold300,
    maxWidth: 360,
    lineHeight: PDF_READING_LH
  })
  ty -= 6
  ty = drawTextBlock({
    page,
    text: 'Thanks — we received your Costa del Sol enquiry',
    x: innerLeft,
    y: ty,
    font: boldFont,
    fontSize: 20,
    color: colors.white,
    maxWidth: metaX - innerLeft - 20,
    lineHeight: 24
  })
  ty -= 10
  ty = drawTextBlock({
    page,
    text:
      'Below is what you submitted from the get-in-touch form on golfsolirl.com. We will use your phone or WhatsApp and your preferred call window when we reach out.',
    x: innerLeft,
    y: ty,
    font: regularFont,
    fontSize: PDF_READING_PT,
    color: colors.white,
    maxWidth: metaX - innerLeft - 20,
    lineHeight: PDF_READING_LH
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

  // Keep the details table clearly below hero copy and inside the white card
  const tableSectionTop = Math.min(ty - 36, heroBottomY - 28)
  let cursorY = tableSectionTop - 22

  page.drawText('YOUR SUBMITTED DETAILS', {
    x: innerLeft,
    y: cursorY,
    font: boldFont,
    size: PDF_READING_PT,
    color: colors.gold400
  })
  cursorY -= 24

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
    const valueTopBaseline = rowY - 20
    page.drawText(label, {
      x: innerLeft,
      y: valueTopBaseline,
      font: boldFont,
      size: PDF_READING_PT,
      color: colors.slate500
    })
    drawTextBlock({
      page,
      text: val,
      x: valueX,
      y: valueTopBaseline,
      font: regularFont,
      fontSize: PDF_READING_PT,
      color: colors.slate700,
      maxWidth: maxVw,
      lineHeight: PDF_READING_LH
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
  const discFontSize = PDF_READING_PT
  const discLH = PDF_READING_LH
  const discText = disclaimerParagraphs.join('\n\n')
  const discLines = wrapText({
    text: discText,
    font: regularFont,
    fontSize: discFontSize,
    maxWidth: innerW
  })
  const discH = Math.max(108, 40 + measureWrappedDrawHeight(discLines, discLH) + 22)
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
    size: PDF_READING_PT,
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

  const bandH = 340
  const termsMargin = 44
  const termsPadX = 20
  const termsMaxW = pageWidth - 2 * termsMargin - 2 * termsPadX
  const termsFontSize = PDF_READING_PT
  const termsLH = PDF_READING_LH
  const termsBody = `${termsSummaryParagraphs.join('\n\n')}\n\nFull terms: https://golfsolirl.com/terms-and-conditions`
  const termsLines = wrapText({
    text: termsBody,
    font: regularFont,
    fontSize: termsFontSize,
    maxWidth: termsMaxW
  })
  const termsTitleBlockH = 30
  const termsBoxH = termsTitleBlockH + measureWrappedDrawHeight(termsLines, termsLH) + 32
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
    size: 18,
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

  const footLockSmall = brandLockupImage.scale(0.24)
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
    fontSize: PDF_READING_PT,
    color: colors.white,
    maxWidth: pageWidth - 96,
    lineHeight: PDF_READING_LH
  })
  fy -= 18

  const col1X = 48
  const col2X = pageWidth / 2 + 8
  footerPage.drawText('REGISTERED ADDRESS', {
    x: col1X,
    y: fy,
    font: boldFont,
    size: PDF_READING_PT,
    color: colors.gold300
  })
  footerPage.drawText('CONTACT', { x: col2X, y: fy, font: boldFont, size: PDF_READING_PT, color: colors.gold300 })
  fy -= 18
  const fyLeft = drawTextBlock({
    page: footerPage,
    text: `${gsolEmailBrand.addressLines[0]}\n${gsolEmailBrand.addressLines[1]}\n${gsolEmailBrand.eircode}`,
    x: col1X,
    y: fy,
    font: regularFont,
    fontSize: PDF_READING_PT,
    color: colors.white,
    maxWidth: 220,
    lineHeight: PDF_READING_LH
  })
  const fyRight = drawTextBlock({
    page: footerPage,
    text: '087 446 4766 (IE / WhatsApp)\n+34 641 81 53 66 (ES)\ninfo@golfsolirl.com\ngolfsolirl.com',
    x: col2X,
    y: fy,
    font: regularFont,
    fontSize: PDF_READING_PT,
    color: colors.white,
    maxWidth: 240,
    lineHeight: PDF_READING_LH
  })
  fy = Math.min(fyLeft, fyRight) - 20

  fy = drawTextBlock({
    page: footerPage,
    text: 'Packages · Courses · Hotels · Transfers · Plan your trip · Testimonials — golfsolirl.com',
    x: 48,
    y: fy,
    font: regularFont,
    fontSize: PDF_READING_PT,
    color: colors.gold300,
    maxWidth: pageWidth - 96,
    lineHeight: PDF_READING_LH
  })
  fy -= 12
  footerPage.drawText('Terms: https://golfsolirl.com/terms-and-conditions', {
    x: 48,
    y: fy,
    font: regularFont,
    size: PDF_READING_PT,
    color: colors.white
  })
  fy -= 22
  footerPage.drawText(`© ${new Date().getFullYear()} Golf Sol Ireland. All rights reserved.`, {
    x: 48,
    y: fy,
    font: regularFont,
    size: PDF_READING_PT,
    color: rgb(180 / 255, 190 / 255, 175 / 255)
  })

  return pdfDocument.save()
}

export { createBrandedEnquiryPdf, createTermsAndConditionsPdf, createTravellerContactsPdf, createPackingChecklistPdf }

const buildCustomerHtml = (payload) => buildBrandedEnquiryEmailHtml(payload, 'customer')
const buildOwnerHtml = (payload) => buildBrandedEnquiryEmailHtml(payload, 'admin')

const DUPLICATE_PHONE_ENQUIRY_MESSAGE =
  'This phone number already has a trip request with Golf Sol Ireland. Please sign in to your dashboard to continue instead of submitting a new form.'

const dedupeFailsClosed = (env) =>
  env.ENQUIRY_PHONE_DEDUPE_FAIL_CLOSED === '1' ||
  env.ENQUIRY_PHONE_DEDUPE_FAIL_CLOSED === 'true' ||
  env.NODE_ENV === 'production'

/**
 * Block repeat website enquiries for the same normalized mobile (see `phone_e164` migration).
 * Fails open in non-production when Supabase columns are missing; fails closed on lookup errors in production.
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {string} phoneWhatsApp
 * @param {NodeJS.ProcessEnv} env
 */
const assertNoDuplicatePhoneForWebsiteEnquiry = async (sb, phoneWhatsApp, env) => {
  if (env.ENQUIRY_PHONE_DEDUPE_DISABLE === '1' || env.ENQUIRY_PHONE_DEDUPE_DISABLE === 'true') {
    return
  }
  const phoneKey = computePhoneUniquenessKey(phoneWhatsApp)
  if (!phoneKey) {
    return
  }

  const failClosed = dedupeFailsClosed(env)

  const { data: enqRows, error: enqErr } = await sb.from('enquiries').select('id').eq('phone_e164', phoneKey).limit(1)
  if (enqErr) {
    const msg = String(enqErr.message ?? '')
    if (msg.toLowerCase().includes('phone_e164') || msg.toLowerCase().includes('column')) {
      console.warn('[enquiry-service] phone dedupe skipped (missing phone_e164 column):', msg)
      return
    }
    console.warn('[enquiry-service] phone dedupe enquiry lookup failed:', msg)
    if (failClosed) {
      const err = new Error('We could not verify your phone number right now. Please try again in a few minutes.')
      err.statusCode = 503
      throw err
    }
    return
  }
  if (enqRows?.length) {
    const err = new Error(DUPLICATE_PHONE_ENQUIRY_MESSAGE)
    err.statusCode = 409
    err.code = 'EXISTING_PHONE_USE_LOGIN'
    throw err
  }

  const { data: profRows, error: profErr } = await sb.from('profiles').select('id').eq('phone_e164', phoneKey).limit(1)
  if (profErr) {
    const msg = String(profErr.message ?? '')
    if (msg.toLowerCase().includes('phone_e164') || msg.toLowerCase().includes('column')) {
      console.warn('[enquiry-service] phone dedupe skipped (missing profiles.phone_e164):', msg)
      return
    }
    console.warn('[enquiry-service] phone dedupe profile lookup failed:', msg)
    if (failClosed) {
      const err = new Error('We could not verify your phone number right now. Please try again in a few minutes.')
      err.statusCode = 503
      throw err
    }
    return
  }
  if (profRows?.length) {
    const err = new Error(DUPLICATE_PHONE_ENQUIRY_MESSAGE)
    err.statusCode = 409
    err.code = 'EXISTING_PHONE_USE_LOGIN'
    throw err
  }
}

const recordEnquiryToSupabase = async (enquiry, enquiryId, env) => {
  const url = typeof env.SUPABASE_URL === 'string' ? env.SUPABASE_URL.trim() : ''
  const key = typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' ? env.SUPABASE_SERVICE_ROLE_KEY.trim() : ''

  if (!url || !key) {
    return
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
    const anchorRef = await ensureEmailAccountAnchor(sb, enquiry.email)
    let mergedFormPayload = enquiry.formPayload
    if (anchorRef) {
      const base =
        enquiry.formPayload && typeof enquiry.formPayload === 'object' && !Array.isArray(enquiry.formPayload)
          ? enquiry.formPayload
          : { form: 'website_form', fields: {} }
      const prevFields =
        base.fields && typeof base.fields === 'object' && !Array.isArray(base.fields) ? base.fields : {}
      mergedFormPayload = {
        ...base,
        fields: { ...prevFields, _accountAnchorRef: anchorRef }
      }
    }
    const phoneE164 = computePhoneUniquenessKey(enquiry.phoneWhatsApp)
    const row = {
      reference_id: enquiryId,
      email: enquiry.email,
      full_name: enquiry.fullName,
      interest: enquiry.interest,
      phone_whatsapp: enquiry.phoneWhatsApp,
      best_time_to_call: enquiry.bestTimeToCall,
      ...(phoneE164 ? { phone_e164: phoneE164 } : {})
    }
    if (anchorRef) {
      row.account_anchor_ref = anchorRef
    }
    if (mergedFormPayload) {
      row.form_payload = mergedFormPayload
    }
    let { error } = await sb.from('enquiries').insert(row)

    if (error && phoneE164 && String(error.message).toLowerCase().includes('phone_e164')) {
      delete row.phone_e164
      const retryPhone = await sb.from('enquiries').insert(row)
      error = retryPhone.error
      if (!retryPhone.error) {
        console.warn('[enquiry-service] enquiries row saved without phone_e164; apply migration 20260510170000_profiles_enquiries_phone_e164.sql.')
      }
    }

    if (error && enquiry.formPayload && String(error.message).toLowerCase().includes('form_payload')) {
      delete row.form_payload
      const retry = await sb.from('enquiries').insert(row)
      error = retry.error
      if (!retry.error) {
        console.warn('[enquiry-service] enquiries row saved without form_payload; add column (see supabase migrations).')
      }
    }

    if (error) {
      console.error('[enquiry-service] Supabase enquiries insert failed:', error.message)
    }
  } catch (err) {
    console.error('[enquiry-service] Supabase enquiries insert error:', err)
  }
}

/**
 * When a profile already exists for the enquiry email, mirror the submission as a
 * `package_builds` row (source website_form, config v3) so the client dashboard stays in sync with site forms.
 */
const insertWebsiteFormPackageBuildIfProfileExists = async (enquiry, enquiryId, env) => {
  const url = typeof env.SUPABASE_URL === 'string' ? env.SUPABASE_URL.trim() : ''
  const key = typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' ? env.SUPABASE_SERVICE_ROLE_KEY.trim() : ''
  if (!url || !key) {
    return
  }

  const email = (enquiry.email ?? '').toString().trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const { data: prof, error: pErr } = await sb.from('profiles').select('id').ilike('email', email).maybeSingle()
    if (pErr || !prof?.id) {
      return
    }

    const fp = enquiry.formPayload
    const formKey =
      fp && typeof fp === 'object' && typeof fp.form === 'string' && fp.form.trim() ? fp.form.trim() : 'website_form'

    const rawFields = fp && typeof fp === 'object' && fp.fields && typeof fp.fields === 'object' ? fp.fields : {}
    const fields = {}
    for (const [k, v] of Object.entries(rawFields)) {
      if (typeof v === 'string') {
        fields[k] = v
      } else if (v != null && typeof v !== 'undefined') {
        fields[k] = String(v)
      }
    }

    const anchorRef = await ensureEmailAccountAnchor(sb, email)

    const config = {
      version: 3,
      formKey,
      enquiryReferenceId: enquiryId,
      submittedAt: new Date().toISOString(),
      fields,
      ...(anchorRef ? { accountAnchorRef: anchorRef } : {})
    }

    const label = `${formKey.replace(/_/g, ' ')} · ${enquiryId}`

    const { error: insErr } = await sb.from('package_builds').insert({
      owner_id: prof.id,
      source: 'website_form',
      label,
      config,
      client_details: {},
      updated_at: new Date().toISOString()
    })

    if (insErr) {
      const msg = String(insErr.message ?? '')
      if (msg.toLowerCase().includes('source') || msg.toLowerCase().includes('check')) {
        console.warn(
          '[enquiry-service] website_form package_build skipped (apply migration 20260430140000_website_form_packages_portal_updates.sql):',
          msg
        )
      } else {
        console.error('[enquiry-service] website_form package_build insert failed:', msg)
      }
    }
  } catch (err) {
    console.error('[enquiry-service] website_form package_build error:', err)
  }
}

export const handleEnquirySubmission = async (payload, env = process.env, runtime = {}) => {
  assertApiRateLimit('enquiry', runtime.clientIp ?? 'unknown', env, {
    max: parsePositiveInt(env.ENQUIRY_RATE_LIMIT_PER_WINDOW, 6),
    windowMs: parsePositiveInt(env.ENQUIRY_RATE_WINDOW_MS, 900_000),
    message: 'Too many enquiry submissions from this connection. Please wait a few minutes and try again.'
  })

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

  const sbUrl = typeof env.SUPABASE_URL === 'string' ? env.SUPABASE_URL.trim() : ''
  const sbKey = typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' ? env.SUPABASE_SERVICE_ROLE_KEY.trim() : ''
  if (sbUrl && sbKey) {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(sbUrl, sbKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
    await assertNoDuplicatePhoneForWebsiteEnquiry(sb, enquiry.phoneWhatsApp, env)
    await assertEnquiryDriverDatesNotBlocked(sb, enquiry)
  }

  const resend = new Resend(resendApiKey)

  const [pdfBytes, termsPdfBytes, travellerContactsPdfBytes, packingChecklistPdfBytes] = await Promise.all([
    createBrandedEnquiryPdf({ ...enquiry, enquiryId, enquiryDate }),
    createTermsAndConditionsPdf(),
    createTravellerContactsPdf(),
    createPackingChecklistPdf()
  ])
  const pdfAttachment = {
    filename: `golf-sol-ireland-enquiry-${slugify(enquiryId)}.pdf`,
    content: Buffer.from(pdfBytes).toString('base64'),
    contentType: 'application/pdf'
  }
  const termsPdfAttachment = {
    filename: 'golf-sol-ireland-terms-and-conditions.pdf',
    content: Buffer.from(termsPdfBytes).toString('base64'),
    contentType: 'application/pdf'
  }
  const travellerContactsPdfAttachment = {
    filename: 'golf-sol-ireland-costa-del-sol-traveller-contacts.pdf',
    content: Buffer.from(travellerContactsPdfBytes).toString('base64'),
    contentType: 'application/pdf'
  }
  const packingChecklistPdfAttachment = {
    filename: 'golf-sol-ireland-packing-checklist.pdf',
    content: Buffer.from(packingChecklistPdfBytes).toString('base64'),
    contentType: 'application/pdf'
  }
  const enquiryPdfAttachments = [pdfAttachment, termsPdfAttachment, travellerContactsPdfAttachment, packingChecklistPdfAttachment]

  // Persist before emails so portal login can sync name/phone from enquiries immediately after magic link.
  await recordEnquiryToSupabase(enquiry, enquiryId, env)

  await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: [enquiry.email],
      subject: `Your Golf Sol Ireland enquiry confirmation (${enquiryId})`,
      html: buildCustomerHtml({ ...enquiry, enquiryId, enquiryDate }),
      attachments: enquiryPdfAttachments
    }),
    resend.emails.send({
      from: fromEmail,
      to: [notificationEmail],
      replyTo: enquiry.email,
      subject: `New Golf Sol Ireland enquiry ${enquiryId} from ${enquiry.fullName}`,
      html: buildOwnerHtml({ ...enquiry, enquiryId, enquiryDate }),
      attachments: enquiryPdfAttachments
    })
  ])
  await insertWebsiteFormPackageBuildIfProfileExists(enquiry, enquiryId, env)
  await insertTransferBookingFromWebsiteEnquiry(enquiry, enquiryId, env)

  const portalInviteTask = runPostEnquiryPortalInviteJob({ enquiry, enquiryId, enquiryDate, env })
  if (typeof runtime.waitUntil === 'function') {
    runtime.waitUntil(portalInviteTask)
  } else {
    void portalInviteTask.catch((err) => {
      console.error('[enquiry-service] post-enquiry portal invite job failed:', err)
    })
  }

  return {
    success: true,
    message: 'Your enquiry has been sent. Check your inbox for the enquiry, terms, traveller contacts, and packing checklist PDFs.'
  }
}

const validateTermsEmailPayload = (payload) => {
  const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : ''

  if (!email) {
    const error = new Error('Please enter your email address.')
    error.statusCode = 400
    throw error
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error('Please enter a valid email address.')
    error.statusCode = 400
    throw error
  }

  return { email }
}

const buildTermsEmailHtml = ({ email, sentDate }) => {
  const safeEmail = escapeHtml(email)
  const rows = buildEnquiryFieldRowsHtml([
    ['Recipient', safeEmail],
    ['Sent', escapeHtml(sentDate)],
    ['Deposit rule', '20% upfront deposit. 80% balance due within five days of booking confirmation.'],
    ['Cancellation rule', 'Deposit refunded if cancelled within 48 hours, unless non-refundable supplier costs have already been committed. After 48 hours, the 20% deposit is non-refundable.'],
    ['Supplier responsibility', 'Hotels, golf courses, transport providers and other suppliers remain responsible for their own services. GolfSol Ireland coordinates and assists but is not liable for another company mistake.']
  ])

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:0 0 18px 0;">
          <p style="margin:0;font-family:${emailFonts.sans};font-size:16px;line-height:1.75;color:${gs.muted};">
            Thanks for requesting a copy of the GolfSol Ireland terms and conditions. The attached PDF explains the key booking terms for deposits, balance payments, supplier responsibility, cancellations, accommodation issues, golf course changes and liability limits.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 22px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid rgba(13,61,46,0.12);border-radius:16px;overflow:hidden;background:#ffffff;">
            ${rows}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 20px;border-radius:18px;${emailAmbientGradientFillStyle()}border:1px solid rgba(19,96,71,0.14);">
          <p style="margin:0 0 8px 0;font-family:${emailFonts.sans};font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${gs.green};">Important note</p>
          <p style="margin:0;font-family:${emailFonts.sans};font-size:14px;line-height:1.7;color:${gs.muted};">
            This email is a terms information copy only. Your specific trip may also include supplier-specific terms on your quote, invoice or confirmation email.
          </p>
        </td>
      </tr>
    </table>`

  const raw = buildGsolTransactionalEmail({
    documentTitle: 'GolfSol Ireland terms and conditions',
    preheader: 'Your GolfSol Ireland terms and conditions PDF is attached.',
    heroKicker: 'Terms and conditions',
    heroTitle: 'Your copy of the GolfSol Ireland booking terms',
    heroLead:
      'A plain-English summary of deposit rules, balance payments, cancellations, supplier responsibility and liability limits for Costa del Sol golf trips.',
    heroMetaHtml: `
      <p style="margin:0;font-family:${emailFonts.sans};font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong style="font-weight:700;">Sent to:</strong> ${safeEmail}</p>
      <p style="margin:8px 0 0 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);"><strong style="font-weight:700;">Sent:</strong> ${escapeHtml(sentDate)}</p>`,
    bodyHtml
  })

  return finalizeGsolEmailHtml(raw)
}

/** Same HTML as `POST /api/terms-email` (sample address) — for browser preview only. */
export const getTermsEmailHtmlSampleForPreview = () =>
  buildTermsEmailHtml({ email: 'sample.client@example.com', sentDate: formatDocumentDate() })

export const handleTermsEmailRequest = async (payload, env = process.env) => {
  const { email } = validateTermsEmailPayload(payload)
  const resendApiKey = env.RESEND_API_KEY
  const fromEmail = env.RESEND_FROM_EMAIL

  if (!resendApiKey || !fromEmail) {
    const error = new Error(missingConfigMessage)
    error.statusCode = 500
    throw error
  }

  const sentDate = formatDocumentDate()
  const termsPdfBytes = await createTermsAndConditionsPdf()
  const resend = new Resend(resendApiKey)

  await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: 'GolfSol Ireland terms and conditions',
    html: buildTermsEmailHtml({ email, sentDate }),
    attachments: [
      {
        filename: 'golf-sol-ireland-terms-and-conditions.pdf',
        content: Buffer.from(termsPdfBytes).toString('base64'),
        contentType: 'application/pdf'
      }
    ]
  })

  return {
    success: true,
    message: 'Terms and conditions sent. Check your inbox for the email and PDF.'
  }
}
