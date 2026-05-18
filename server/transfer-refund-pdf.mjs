import { readFileSync } from 'node:fs'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { brandedPdfAssetPaths } from './pdf-email-brand.mjs'
import { gsolCompanyLegal } from './email-constants.mjs'

const formatEur = (n) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

const W = 595.28
const H = 841.89
const m = 48

const V5_GREEN = rgb(6 / 255, 59 / 255, 42 / 255)
const V5_INK = rgb(22 / 255, 35 / 255, 29 / 255)
const V5_MUTED = rgb(102 / 255, 115 / 255, 109 / 255)
const V5_RULE = rgb(200 / 255, 210 / 255, 205 / 255)

/**
 * @param {object} opts
 * @param {string} opts.customerLabel
 * @param {string} opts.route
 * @param {string} opts.bookingId
 * @param {number} opts.refundAmountEur
 * @param {'partial'|'full'} opts.refundKind
 * @param {number} opts.cumulativeRefundedEur
 * @param {string} [opts.stripeRefundId]
 * @param {string} [opts.stripePaymentIntentId]
 */
export const buildTransferRefundPdfBytes = async (opts) => {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([W, H])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const contentW = W - m * 2

  // v5 header
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) })
  page.drawRectangle({ x: 0, y: H - 3, width: W, height: 3, color: V5_GREEN })

  const topY = H - 24
  page.drawText('FROM PLANE TO FAIRWAY', { x: m, y: topY, font: fontBold, size: 9, color: V5_GREEN })
  page.drawText('GolfSol Ireland - Irish-owned Costa del Sol Golf Travel', {
    x: m, y: topY - 16, font, size: 8, color: V5_MUTED
  })
  page.drawText('www.golfsolirl.com - info@golfsolirl.com', {
    x: m, y: topY - 28, font, size: 8, color: V5_MUTED
  })
  page.drawText(`Registered in Ireland - Company No. ${gsolCompanyLegal.companyRegistrationNumber}`, {
    x: m, y: topY - 40, font, size: 8, color: V5_MUTED
  })

  try {
    const logoBytes = readFileSync(brandedPdfAssetPaths.homepageCrest)
    const logo = await pdf.embedPng(logoBytes)
    const lh = 60
    const lw = (logo.width / logo.height) * lh
    page.drawImage(logo, { x: W - m - lw, y: topY - lh + 10, width: lw, height: lh })
  } catch { /* optional */ }

  const ruleY = topY - 52
  page.drawRectangle({ x: m, y: ruleY, width: contentW, height: 0.75, color: V5_RULE })
  page.drawText('Refund Confirmation', { x: m, y: ruleY - 22, font: fontBold, size: 16, color: V5_GREEN })

  let y = ruleY - 52

  page.drawText('Guest', { x: m, y, size: 11, font: fontBold, color: V5_INK })
  y -= 16
  page.drawText(opts.customerLabel || 'Guest', { x: m, y, size: 11, font, color: V5_INK })
  y -= 28

  page.drawText('Transfer', { x: m, y, size: 11, font: fontBold, color: V5_INK })
  y -= 16
  page.drawText(opts.route, { x: m, y, size: 11, font, color: V5_INK })
  y -= 14
  page.drawText(`Reference: ${opts.bookingId}`, { x: m, y, size: 9, font, color: V5_MUTED })
  y -= 32

  page.drawText('This refund', { x: m, y, size: 11, font: fontBold, color: V5_INK })
  y -= 16
  page.drawText(formatEur(opts.refundAmountEur), { x: m, y, size: 14, font: fontBold, color: V5_GREEN })
  y -= 20
  page.drawText(opts.refundKind === 'full' ? 'Type: full refund (card)' : 'Type: partial refund (card)', {
    x: m, y, size: 10, font, color: V5_INK
  })
  y -= 22
  page.drawText(`Total refunded to card for this transfer: ${formatEur(opts.cumulativeRefundedEur)}`, {
    x: m, y, size: 10, font, color: V5_INK
  })
  y -= 28

  if (opts.stripeRefundId || opts.stripePaymentIntentId) {
    page.drawText('Stripe references', { x: m, y, size: 10, font: fontBold, color: V5_INK })
    y -= 14
    if (opts.stripeRefundId) {
      page.drawText(`Refund: ${opts.stripeRefundId}`, { x: m, y, size: 9, font, color: V5_MUTED })
      y -= 12
    }
    if (opts.stripePaymentIntentId) {
      page.drawText(`Original payment: ${opts.stripePaymentIntentId}`, { x: m, y, size: 9, font, color: V5_MUTED })
      y -= 12
    }
  }

  // v5 footer
  page.drawRectangle({ x: m, y: 48, width: contentW, height: 0.5, color: V5_RULE })
  const pt = '-- 1 of 1 --'
  const pw = font.widthOfTextAtSize(pt, 9)
  page.drawText(pt, { x: (W - pw) / 2, y: 34, font, size: 9, color: V5_MUTED })
  page.drawText('Card refunds are processed by Stripe and typically appear within several business days.', {
    x: m, y: 22, font, size: 7.5, color: V5_MUTED
  })

  return Buffer.from(await pdf.save())
}
