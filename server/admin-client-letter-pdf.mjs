/**
 * Simple branded letter PDF for admin → client sends (quote note, booking confirmation, custom message).
 */
import { PDFDocument } from 'pdf-lib'
import { sanitizeStandardFontText } from '../shared/pdf-winansi-sanitize.mjs'
import {
  UNIFIED_PDF_LAYOUT,
  drawUnifiedDocumentFooter,
  drawUnifiedDocumentHeader,
  drawUnifiedKeyValueTable,
  drawUnifiedParagraphBlock,
  drawUnifiedSectionHeading,
  embedUnifiedLogo,
  loadUnifiedPdfFonts
} from './gsol-unified-pdf-template.mjs'

/**
 * @param {{
 *   docTitle: string
 *   kicker?: string
 *   subtitle?: string
 *   clientName?: string
 *   clientEmail?: string
 *   clientPhone?: string
 *   clientRef?: string
 *   message: string
 * }} input
 */
export const buildAdminClientLetterPdfBytes = async (input) => {
  const docTitle = String(input.docTitle ?? 'Client document').trim() || 'Client document'
  const kicker = String(input.kicker ?? 'CLIENT DOCUMENT').trim() || 'CLIENT DOCUMENT'
  const subtitle = String(input.subtitle ?? '').trim()
  const message = String(input.message ?? '').trim()
  const clientName = String(input.clientName ?? '').trim() || '—'
  const clientEmail = String(input.clientEmail ?? '').trim() || '—'
  const clientPhone = String(input.clientPhone ?? '').trim() || '—'
  const clientRef = String(input.clientRef ?? '').trim() || '—'

  const pdf = await PDFDocument.create()
  const fonts = await loadUnifiedPdfFonts(pdf)
  const logo = await embedUnifiedLogo(pdf)
  const ctx = { ...fonts, ...logo }
  const { pageWidth, pageHeight } = UNIFIED_PDF_LAYOUT

  const page = pdf.addPage([pageWidth, pageHeight])
  let y = drawUnifiedDocumentHeader(page, ctx, {
    kicker,
    title: docTitle,
    subtitle: subtitle || 'Prepared for your Costa del Sol trip desk.'
  })

  y -= 4
  y = drawUnifiedSectionHeading(page, y, ctx, 'CLIENT')
  y = drawUnifiedKeyValueTable(page, y, ctx, [
    { label: 'Name', value: clientName },
    { label: 'Email', value: clientEmail },
    { label: 'Phone', value: clientPhone },
    { label: 'Client / booking ID', value: clientRef }
  ])

  y -= 10
  y = drawUnifiedSectionHeading(page, y, ctx, 'MESSAGE FROM GOLF SOL IRELAND')
  if (message) {
    y = drawUnifiedParagraphBlock(page, y, ctx, sanitizeStandardFontText(message))
  } else {
    y = drawUnifiedParagraphBlock(page, y, ctx, 'Please see the attached documents for full details.')
  }

  drawUnifiedDocumentFooter(page, 52, ctx, ['Admin desk send — Golf Sol Ireland'], { current: 1, total: 1 })

  return Buffer.from(await pdf.save())
}

export const slugifyDocFilename = (title) =>
  String(title || 'document')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'document'
