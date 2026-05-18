import { readFileSync } from 'node:fs'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { brandedPdfAssetPaths } from './pdf-email-brand.mjs'
import { gsolCompanyLegal } from './email-constants.mjs'

const fmtEur = (cents) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format((Number(cents) || 0) / 100)

const W = 595.28
const H = 841.89
const m = 48

const V5_GREEN = rgb(6 / 255, 59 / 255, 42 / 255)
const V5_GREEN_LIGHT = rgb(15 / 255, 81 / 255, 60 / 255)
const V5_INK = rgb(22 / 255, 35 / 255, 29 / 255)
const V5_MUTED = rgb(102 / 255, 115 / 255, 109 / 255)
const V5_RULE = rgb(200 / 255, 210 / 255, 205 / 255)
const V5_STRIPE = rgb(247 / 255, 250 / 255, 248 / 255)

/**
 * @param {{
 *   invoiceNumber: string
 *   enquiryReferenceId: string
 *   accountReferenceDisplay: string
 *   clientName: string
 *   clientEmail: string
 *   amountCents: number
 *   issuedAtIso: string
 * }} input
 * @returns {Promise<Uint8Array>}
 */
export const buildPortalInvoicePdfBytes = async (input) => {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const logoImage = await doc.embedPng(readFileSync(brandedPdfAssetPaths.homepageCrest))
  const logoH = 60
  const logoW = (logoImage.width / logoImage.height) * logoH

  const contentW = W - m * 2
  const page = doc.addPage([W, H])

  // v5 header
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) })
  page.drawRectangle({ x: 0, y: H - 3, width: W, height: 3, color: V5_GREEN })

  const topY = H - 24
  page.drawText('FROM PLANE TO FAIRWAY', { x: m, y: topY, font: fontBold, size: 9, color: V5_GREEN })
  page.drawText(sanitizeStandardFontText('GolfSol Ireland - Irish-owned Costa del Sol Golf Travel'), {
    x: m, y: topY - 16, font, size: 8, color: V5_MUTED
  })
  page.drawText(sanitizeStandardFontText('www.golfsolirl.com - info@golfsolirl.com'), {
    x: m, y: topY - 28, font, size: 8, color: V5_MUTED
  })
  page.drawText(sanitizeStandardFontText(`Registered in Ireland - Company No. ${gsolCompanyLegal.companyRegistrationNumber}`), {
    x: m, y: topY - 40, font, size: 8, color: V5_MUTED
  })
  page.drawImage(logoImage, { x: W - m - logoW, y: topY - logoH + 10, width: logoW, height: logoH })

  const ruleY = topY - 52
  page.drawRectangle({ x: m, y: ruleY, width: contentW, height: 0.75, color: V5_RULE })
  page.drawText(sanitizeStandardFontText('Trip Invoice'), { x: m, y: ruleY - 22, font: fontBold, size: 16, color: V5_GREEN })

  let y = ruleY - 50
  const lineGap = 16
  const small = 9
  const body = 10.5

  const drawField = (label, value) => {
    page.drawText(sanitizeStandardFontText(label), { x: m, y, font: fontBold, size: small, color: V5_MUTED })
    y -= lineGap * 0.85
    page.drawText(sanitizeStandardFontText(value), { x: m, y, font, size: body, color: V5_INK })
    y -= lineGap * 1.35
  }

  drawField('Invoice number', input.invoiceNumber)
  drawField('Your account reference', input.accountReferenceDisplay)
  drawField('Enquiry reference', input.enquiryReferenceId)
  drawField('Bill to', `${input.clientName} - ${input.clientEmail}`)

  const issued = new Intl.DateTimeFormat('en-IE', { dateStyle: 'long' }).format(new Date(input.issuedAtIso))
  drawField('Date', issued)

  y -= 8
  page.drawRectangle({ x: m, y: y + 6, width: contentW, height: 0.5, color: V5_RULE })
  y -= 20

  page.drawText(sanitizeStandardFontText('Description'), { x: m, y, font: fontBold, size: small, color: V5_GREEN_LIGHT })
  page.drawText(sanitizeStandardFontText('Amount'), { x: m + contentW - 120, y, font: fontBold, size: small, color: V5_GREEN_LIGHT })
  y -= 22
  page.drawText(sanitizeStandardFontText('Trip arrangement (per submitted enquiry)'), { x: m, y, font, size: body, color: V5_INK })
  page.drawText(sanitizeStandardFontText(fmtEur(input.amountCents)), { x: m + contentW - 120, y, font: fontBold, size: body, color: V5_INK })
  y -= 36

  page.drawRectangle({ x: m, y: y + 18, width: contentW, height: 36, color: V5_STRIPE })
  page.drawText(sanitizeStandardFontText('Total due'), { x: m + 12, y: y + 8, font: fontBold, size: 11, color: V5_GREEN })
  page.drawText(sanitizeStandardFontText(fmtEur(input.amountCents)), { x: m + contentW - 130, y: y + 8, font: fontBold, size: 14, color: V5_GREEN })
  y -= 48

  page.drawText(
    sanitizeStandardFontText('Pay from your client dashboard (Pay now, Stripe). Keep this PDF for your records.'),
    { x: m, y, font, size: 9, color: V5_MUTED, maxWidth: contentW, lineHeight: 12 }
  )

  // v5 footer
  page.drawRectangle({ x: m, y: 48, width: contentW, height: 0.5, color: V5_RULE })
  const pt = '-- 1 of 1 --'
  const pw = font.widthOfTextAtSize(pt, 9)
  page.drawText(pt, { x: (W - pw) / 2, y: 34, font, size: 9, color: V5_MUTED })
  page.drawText(sanitizeStandardFontText('GolfSol Ireland - Irish-owned Costa del Sol Golf Travel'), {
    x: m, y: 22, font, size: 7.5, color: V5_MUTED
  })

  return doc.save()
}
