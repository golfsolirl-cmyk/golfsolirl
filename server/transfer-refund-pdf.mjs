import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const formatEur = (n) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

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
  const page = pdf.addPage([595.28, 841.89])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const ink = rgb(0.086, 0.231, 0.165)
  const muted = rgb(0.35, 0.4, 0.38)

  let y = 780
  page.drawText('Golf Sol Ireland', { x: 48, y, size: 11, font: fontBold, color: ink })
  y -= 28
  page.drawText('Refund confirmation', { x: 48, y, size: 18, font: fontBold, color: ink })
  y -= 28
  page.drawText(`Issued ${new Date().toLocaleString('en-IE', { dateStyle: 'long', timeStyle: 'short' })}`, {
    x: 48,
    y,
    size: 10,
    font,
    color: muted
  })
  y -= 36

  page.drawText('Guest', { x: 48, y, size: 11, font: fontBold, color: ink })
  y -= 16
  page.drawText(opts.customerLabel || 'Guest', { x: 48, y, size: 11, font, color: ink })
  y -= 28

  page.drawText('Transfer', { x: 48, y, size: 11, font: fontBold, color: ink })
  y -= 16
  page.drawText(opts.route, { x: 48, y, size: 11, font, color: ink })
  y -= 14
  page.drawText(`Reference: ${opts.bookingId}`, { x: 48, y, size: 9, font, color: muted })
  y -= 32

  page.drawText('This refund', { x: 48, y, size: 11, font: fontBold, color: ink })
  y -= 16
  page.drawText(formatEur(opts.refundAmountEur), { x: 48, y, size: 14, font: fontBold, color: ink })
  y -= 20
  page.drawText(opts.refundKind === 'full' ? 'Type: full refund (card)' : 'Type: partial refund (card)', {
    x: 48,
    y,
    size: 10,
    font,
    color: ink
  })
  y -= 22
  page.drawText(`Total refunded to card for this transfer: ${formatEur(opts.cumulativeRefundedEur)}`, {
    x: 48,
    y,
    size: 10,
    font,
    color: ink
  })
  y -= 28

  if (opts.stripeRefundId || opts.stripePaymentIntentId) {
    page.drawText('Stripe references', { x: 48, y, size: 10, font: fontBold, color: ink })
    y -= 14
    if (opts.stripeRefundId) {
      page.drawText(`Refund: ${opts.stripeRefundId}`, { x: 48, y, size: 9, font, color: muted })
      y -= 12
    }
    if (opts.stripePaymentIntentId) {
      page.drawText(`Original payment: ${opts.stripePaymentIntentId}`, { x: 48, y, size: 9, font, color: muted })
      y -= 12
    }
    y -= 16
  }

  const footLines = [
    'Card refunds are processed by Stripe and typically appear on the guest statement within several business days.',
    'Retain this PDF for your records.'
  ]
  for (const line of footLines) {
    page.drawText(line, { x: 48, y, size: 8, font, color: muted })
    y -= 11
  }

  return Buffer.from(await pdf.save())
}
