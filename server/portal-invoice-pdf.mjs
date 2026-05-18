import { readFileSync } from 'node:fs'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { brandedPdfAssetPaths, pdfEmailTheme } from './pdf-email-brand.mjs'

const fmtEur = (cents) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format((Number(cents) || 0) / 100)

const pageWidth = 595.28
const pageHeight = 841.89

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

  const margin = 40
  const contentW = pageWidth - margin * 2
  const page = doc.addPage([pageWidth, pageHeight])
  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: pdfEmailTheme.cream })
  page.drawRectangle({ x: margin, y: pageHeight - 96, width: contentW, height: 72, color: pdfEmailTheme.green })
  page.drawRectangle({ x: margin, y: pageHeight - 96, width: contentW, height: 3, color: pdfEmailTheme.gold })
  const logoDims = logoImage.scale(0.14)
  page.drawImage(logoImage, { x: margin + 12, y: pageHeight - 84, width: logoDims.width, height: logoDims.height })
  page.drawText(sanitizeStandardFontText('TRIP INVOICE'), {
    x: margin + 130,
    y: pageHeight - 52,
    font: fontBold,
    size: 9,
    color: pdfEmailTheme.gold
  })
  page.drawText(sanitizeStandardFontText('Golf Sol Ireland'), {
    x: margin + 130,
    y: pageHeight - 70,
    font: fontBold,
    size: 15,
    color: pdfEmailTheme.white
  })

  let y = pageHeight - 118
  const lineGap = 16
  const small = 9
  const body = 10.5

  const drawBold = (label, value) => {
    page.drawText(sanitizeStandardFontText(label), { x: margin, y, font: fontBold, size: small, color: pdfEmailTheme.muted })
    y -= lineGap * 0.85
    page.drawText(sanitizeStandardFontText(value), { x: margin, y, font: font, size: body, color: pdfEmailTheme.ink })
    y -= lineGap * 1.35
  }

  drawBold('Invoice number', input.invoiceNumber)
  drawBold('Your account reference', input.accountReferenceDisplay)
  drawBold('Enquiry reference', input.enquiryReferenceId)
  drawBold('Bill to', `${input.clientName} · ${input.clientEmail}`)

  const issued = new Intl.DateTimeFormat('en-IE', { dateStyle: 'long' }).format(new Date(input.issuedAtIso))
  drawBold('Date', issued)

  y -= 8
  page.drawRectangle({ x: margin, y: y + 6, width: contentW, height: 1, color: pdfEmailTheme.sand })
  y -= 20

  page.drawText(sanitizeStandardFontText('Description'), {
    x: margin,
    y,
    font: fontBold,
    size: small,
    color: pdfEmailTheme.greenSoft
  })
  page.drawText(sanitizeStandardFontText('Amount'), {
    x: margin + contentW - 120,
    y,
    font: fontBold,
    size: small,
    color: pdfEmailTheme.greenSoft
  })
  y -= 22
  page.drawText(sanitizeStandardFontText('Trip arrangement (per submitted enquiry)'), {
    x: margin,
    y,
    font,
    size: body,
    color: pdfEmailTheme.ink
  })
  page.drawText(sanitizeStandardFontText(fmtEur(input.amountCents)), {
    x: margin + contentW - 120,
    y,
    font: fontBold,
    size: body,
    color: pdfEmailTheme.ink
  })
  y -= 36

  page.drawRectangle({ x: margin, y: y + 18, width: contentW, height: 36, color: pdfEmailTheme.paleGold })
  page.drawText(sanitizeStandardFontText('Total due'), {
    x: margin + 12,
    y: y + 8,
    font: fontBold,
    size: 11,
    color: pdfEmailTheme.green
  })
  page.drawText(sanitizeStandardFontText(fmtEur(input.amountCents)), {
    x: margin + contentW - 130,
    y: y + 8,
    font: fontBold,
    size: 14,
    color: pdfEmailTheme.green
  })
  y -= 48

  page.drawText(
    sanitizeStandardFontText('Pay from your client dashboard (Pay now, Stripe). Keep this PDF for your records.'),
    { x: margin, y, font, size: 9, color: pdfEmailTheme.muted, maxWidth: contentW, lineHeight: 12 }
  )

  return doc.save()
}
