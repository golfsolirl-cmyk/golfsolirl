import { existsSync, readFileSync } from 'node:fs'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import sharp from 'sharp'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import { brandedPdfAssetPaths, pdfEmailTheme } from './pdf-email-brand.mjs'
import { pdfFieldLabel, pdfFieldValueDisplay } from './website-form-field-labels-pdf.mjs'
import { costaSolCourseNameById, costaSolCourseRegionById } from '../shared/costa-sol-course-names.mjs'

const fmtEur = (n) => {
  const num = new Intl.NumberFormat('en-IE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(n) || 0)
  return `EUR ${num}`
}

const vatPct = (rate) => `${Math.round(Number(rate) * 1000) / 10}%`

const pageWidth = 595.28
const pageHeight = 841.89
const bottomLimit = 56

/**
 * @param {{ label: string | null; config: Record<string, unknown> }} row
 * @returns {Promise<Uint8Array>}
 */
export const buildWebsiteQuotePdfBytes = async (row) => {
  const cfg = row.config
  if (!cfg || typeof cfg !== 'object' || cfg.version !== 3) {
    throw new Error('Invalid package config for quote PDF.')
  }
  const adminQuote = cfg.adminQuote
  if (!adminQuote || typeof adminQuote !== 'object') {
    throw new Error('No admin quote on this build.')
  }

  const enquiryReferenceId = typeof cfg.enquiryReferenceId === 'string' ? cfg.enquiryReferenceId : ''
  const formKey = typeof cfg.formKey === 'string' ? cfg.formKey : ''
  const fields = cfg.fields && typeof cfg.fields === 'object' ? /** @type {Record<string, string>} */ (cfg.fields) : {}
  const gross = Number(adminQuote.grossTotalEur)
  const rate = Number(adminQuote.vatRate)
  const net = Number(adminQuote.netServicesEur)
  const vatAmt = Number(adminQuote.vatAmountEur)
  const dep = Number(adminQuote.deposit20Eur)
  const bal = Number(adminQuote.balance80Eur)

  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const logoImage = await doc.embedPng(readFileSync(brandedPdfAssetPaths.homepageCrest))

  const margin = 34
  const contentW = pageWidth - margin * 2

  const fleetPath = brandedPdfAssetPaths.fleetLineup
  const fleetBandH = 132
  let fleetImage = null
  if (existsSync(fleetPath)) {
    const fleetJpeg = await sharp(readFileSync(fleetPath))
      .resize(1600, Math.round(fleetBandH * 3.2), { fit: 'cover', kernel: sharp.kernel.lanczos3 })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer()
    fleetImage = await doc.embedJpg(fleetJpeg)
  }

  const fleetOffsetY = fleetImage ? fleetBandH : 0

  const openFirstPage = () => {
    const page = doc.addPage([pageWidth, pageHeight])
    page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: pdfEmailTheme.cream })
    if (fleetImage) {
      page.drawImage(fleetImage, {
        x: margin,
        y: pageHeight - 112 - fleetBandH,
        width: contentW,
        height: fleetBandH
      })
    }
    page.drawRectangle({ x: margin, y: pageHeight - 112, width: contentW, height: 74, color: pdfEmailTheme.green })
    page.drawRectangle({ x: margin, y: pageHeight - 112, width: contentW, height: 4, color: pdfEmailTheme.gold })
    const logoDims = logoImage.scale(0.155)
    page.drawImage(logoImage, { x: margin + 16, y: pageHeight - 98, width: logoDims.width, height: logoDims.height })
    page.drawText(sanitizeStandardFontText('TRIP QUOTE'), {
      x: margin + 150,
      y: pageHeight - 64,
      font: fontBold,
      size: 9.5,
      color: pdfEmailTheme.gold
    })
    page.drawText(sanitizeStandardFontText('Golf Sol Ireland'), {
      x: margin + 150,
      y: pageHeight - 82,
      font: fontBold,
      size: 16,
      color: pdfEmailTheme.white
    })
    return { page, y: pageHeight - 128 - fleetOffsetY }
  }

  const openContinuationPage = () => {
    const page = doc.addPage([pageWidth, pageHeight])
    page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: pdfEmailTheme.cream })
    page.drawRectangle({ x: margin, y: pageHeight - 28, width: contentW, height: 3, color: pdfEmailTheme.gold })
    page.drawText(sanitizeStandardFontText('Golf Sol Ireland — trip quote (continued)'), {
      x: margin,
      y: pageHeight - 44,
      font: fontBold,
      size: 9,
      color: pdfEmailTheme.green
    })
    return { page, y: pageHeight - 62 }
  }

  let { page, y } = openFirstPage()

  const drawLine = (yLine, thickness, color) => {
    page.drawLine({
      start: { x: margin, y: yLine },
      end: { x: margin + contentW, y: yLine },
      thickness,
      color
    })
  }

  const draw = (text, opts = {}) => {
    const { bold = false, size = 10, indent = 0, color = pdfEmailTheme.ink, extraLineGap = 0 } = opts
    const f = bold ? fontBold : font
    const lineH = Math.max(11, size * 1.2) + extraLineGap
    const maxW = contentW - indent

    const raw = sanitizeStandardFontText(String(text ?? '')).replace(/\r\n/g, '\n')
    const paragraphs = raw.split('\n')

    for (const para of paragraphs) {
      const words = para.trim().length ? para.split(/\s+/) : ['']
      let line = ''
      const flush = () => {
        if (!line) {
          return
        }
        if (y < bottomLimit) {
          const next = openContinuationPage()
          page = next.page
          y = next.y
        }
        page.drawText(line, {
          x: margin + indent,
          y,
          size,
          font: f,
          color
        })
        y -= lineH
        line = ''
      }
      for (const w of words) {
        const trial = line ? `${line} ${w}` : w
        if (f.widthOfTextAtSize(trial, size) <= maxW) {
          line = trial
        } else {
          flush()
          let w2 = w
          while (w2.length > 1 && f.widthOfTextAtSize(w2, size) > maxW) {
            w2 = w2.slice(0, -1)
          }
          line = w2
        }
      }
      flush()
    }
  }

  draw('IRISH-OWNED · COSTA DEL SOL GOLF SPECIALISTS', { size: 9.5, color: pdfEmailTheme.green })
  y -= 4
  draw(row.label?.trim() || `Enquiry ${enquiryReferenceId}`, { bold: true, size: 15, color: pdfEmailTheme.green })
  y -= 2
  draw(`Reference: ${enquiryReferenceId}`, { size: 10.5, color: pdfEmailTheme.muted })
  draw(`Form: ${formKey.replace(/_/g, ' ')}`, { size: 10.5, color: pdfEmailTheme.muted })
  y -= 6
  draw('Your request', { bold: true, size: 13, color: pdfEmailTheme.greenSoft })
  y -= 2

  const sortedKeys = Object.keys(fields).sort((a, b) => {
    const ua = a.startsWith('_') ? 1 : 0
    const ub = b.startsWith('_') ? 1 : 0
    if (ua !== ub) {
      return ua - ub
    }
    return a.localeCompare(b, 'en')
  })

  for (const key of sortedKeys) {
    const val = fields[key] ?? ''
    draw(`${pdfFieldLabel(key)}: ${pdfFieldValueDisplay(key, val)}`, { size: 10.5, color: pdfEmailTheme.ink })
  }

  const portalRaw = cfg.portalTransferPlan && typeof cfg.portalTransferPlan === 'object' ? cfg.portalTransferPlan : null
  const portalHotelLegs = Array.isArray(portalRaw?.hotelLegs)
    ? portalRaw.hotelLegs.filter((h) => h && typeof h.hotelName === 'string' && h.hotelName.trim())
    : []
  const portalGolfLegs = Array.isArray(portalRaw?.golfLegs)
    ? portalRaw.golfLegs.filter((g) => g && typeof g.courseId === 'string' && g.courseId.trim())
    : []

  if (portalHotelLegs.length > 0 || portalGolfLegs.length > 0) {
    y -= 10
    draw('Hotel & golf transfers (from your portal)', { bold: true, size: 13, color: pdfEmailTheme.greenSoft })
    y -= 3
    if (portalHotelLegs.length > 0) {
      draw('Hotel / accommodation', { bold: true, size: 11.5, color: pdfEmailTheme.goldDeep })
      y -= 2
      for (const leg of portalHotelLegs) {
        const nm = String(leg.hotelName ?? '').trim()
        const nt = typeof leg.notes === 'string' ? leg.notes.trim() : ''
        draw(`· ${nm}${nt ? ` — ${nt}` : ''}`, { size: 10.5, color: pdfEmailTheme.ink })
      }
      y -= 4
    }
    if (portalGolfLegs.length > 0) {
      draw('Golf course legs', { bold: true, size: 11.5, color: pdfEmailTheme.goldDeep })
      y -= 2
      for (const leg of portalGolfLegs) {
        const cid = String(leg.courseId ?? '').trim()
        const nm = costaSolCourseNameById[cid] ?? cid.replace(/_/g, ' ')
        const reg = costaSolCourseRegionById[cid]
        const nt = typeof leg.notes === 'string' ? leg.notes.trim() : ''
        draw(`· ${nm}${reg ? ` (${reg})` : ''}${nt ? ` — ${nt}` : ''}`, { size: 10.5, color: pdfEmailTheme.ink })
      }
    }
  }

  y -= 8
  drawLine(y + 6, 1.1, pdfEmailTheme.gold)
  y -= 10
  draw('Pricing (Ireland)', { bold: true, size: 13, color: pdfEmailTheme.greenSoft })
  y -= 2
  draw(`Services (ex VAT): ${fmtEur(net)}`, { size: 11.5, color: pdfEmailTheme.ink })
  draw(`VAT (${vatPct(rate)}): ${fmtEur(vatAmt)}`, { size: 11.5, color: pdfEmailTheme.ink })
  draw(`Total (inc VAT): ${fmtEur(gross)}`, { bold: true, size: 13, color: pdfEmailTheme.green })
  draw(`Deposit (20%): ${fmtEur(dep)}`, { size: 11.5, color: pdfEmailTheme.ink })
  draw(`Balance: ${fmtEur(bal)}`, { size: 11.5, color: pdfEmailTheme.ink })
  y -= 10
  draw('Subject to availability and written confirmation from Golf Sol Ireland.', { size: 9.5, color: pdfEmailTheme.muted })

  y -= 10
  if (y < bottomLimit + 52) {
    const next = openContinuationPage()
    page = next.page
    y = next.y
  }
  drawLine(y + 8, 0.75, pdfEmailTheme.sand)
  y -= 14
  draw('GOLF SOL IRELAND', { bold: true, size: 10.5, color: pdfEmailTheme.green })
  y -= 2
  draw('golfsolirl.com  ·  +353 87 446 4766  ·  +34 641 81 53 66', { size: 9.5, color: pdfEmailTheme.muted })

  return doc.save()
}
