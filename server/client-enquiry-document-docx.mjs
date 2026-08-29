/**
 * Genuine Microsoft Word (.docx) export for admin client letters / quotations.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  convertMillimetersToTwip
} from 'docx'
import {
  buildClientDocumentFilename,
  buildClientDocumentView,
  CLIENT_DOCUMENT_COMPANY,
  formatClientDocumentEuro,
  normalizeClientDocumentDraft
} from '../shared/client-enquiry-document.mjs'
import { brandedPdfAssetPaths } from './pdf-email-brand.mjs'

const GREEN = '063B2A'
const GOLD = 'D4A843'
const MUTED = '66736D'
const INK = '16231D'
const PALE = 'F6FBF8'
const WHITE = 'FFFFFF'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const noBorder = { style: BorderStyle.NONE, size: 0, color: WHITE }
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }
const hairline = { style: BorderStyle.SINGLE, size: 4, color: GOLD }
const thinGreen = { style: BorderStyle.SINGLE, size: 4, color: 'C5CFC9' }

const loadLogoBuffer = () => {
  try {
    return readFileSync(brandedPdfAssetPaths.homepageCrest)
  } catch {
    try {
      return readFileSync(path.resolve(currentDir, '../public/images', CLIENT_DOCUMENT_COMPANY.logoFilename))
    } catch (error) {
      console.error('[client-enquiry-document-docx] logo load failed', error)
      return null
    }
  }
}

const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: opts.after ?? 80, before: opts.before ?? 0, line: opts.line ?? 276 },
    alignment: opts.align ?? AlignmentType.LEFT,
    children: [
      new TextRun({
        text: String(text ?? ''),
        font: 'Calibri',
        size: opts.size ?? 21,
        bold: Boolean(opts.bold),
        italics: Boolean(opts.italics),
        color: opts.color ?? INK
      })
    ]
  })

const sectionLabel = (label) => [
  new Paragraph({
    spacing: { before: 240, after: 80 },
    border: { bottom: hairline },
    children: [
      new TextRun({
        text: String(label ?? '').toUpperCase(),
        font: 'Calibri',
        size: 18,
        bold: true,
        color: GREEN
      })
    ]
  })
]

const cell = (text, opts = {}) =>
  new TableCell({
    width: { size: opts.width ?? 2500, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    borders: opts.borders ?? {
      top: thinGreen,
      bottom: thinGreen,
      left: thinGreen,
      right: thinGreen
    },
    children: [
      new Paragraph({
        alignment: opts.align ?? AlignmentType.LEFT,
        children: [
          new TextRun({
            text: String(text ?? ''),
            font: 'Calibri',
            size: opts.size ?? 18,
            bold: Boolean(opts.bold),
            color: opts.color ?? INK
          })
        ]
      })
    ]
  })

/**
 * @param {unknown} draft
 * @returns {Promise<{ filename: string, bytes: Buffer }>}
 */
export const buildClientEnquiryDocumentDocx = async (draft) => {
  const normalized = normalizeClientDocumentDraft(draft)
  const view = buildClientDocumentView(normalized)
  const filename = buildClientDocumentFilename(normalized, 'docx')
  const c = CLIENT_DOCUMENT_COMPANY
  const logoBuffer = loadLogoBuffer()

  const logoRun = logoBuffer
    ? new ImageRun({
        type: 'png',
        data: logoBuffer,
        transformation: { width: 78, height: 78 }
      })
    : null

  const body = [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [1800, 7500],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 1800, type: WidthType.DXA },
              borders: noBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  children: logoRun ? [logoRun] : [new TextRun({ text: '', font: 'Calibri' })]
                })
              ]
            }),
            new TableCell({
              width: { size: 7500, type: WidthType.DXA },
              borders: noBorders,
              children: [
                p(c.name, { bold: true, size: 26, color: GREEN, after: 40 }),
                p(c.tagline, { size: 16, color: GOLD, after: 40, italics: true }),
                p(c.addressLines.join(', '), { size: 16, color: MUTED, after: 20 }),
                p(`Ireland ${c.irishPhone}  ·  Spain ${c.spanishPhone}`, { size: 16, color: MUTED, after: 20 }),
                p(`${c.email}  ·  ${c.websiteDisplay}`, { size: 16, color: MUTED, after: 20 }),
                p(`Registered in Ireland · Co. ${c.companyReg}`, { size: 16, color: MUTED, after: 0 })
              ]
            })
          ]
        })
      ]
    })
  ]
  body.push(
    new Paragraph({
      spacing: { before: 280, after: 120 },
      children: [
        new TextRun({
          text: view.title.toUpperCase(),
          font: 'Calibri',
          size: 36,
          bold: true,
          color: GREEN
        })
      ]
    }),
    p(`Reference: ${view.reference}`, { size: 20, color: MUTED, after: 40 }),
    p(`Date: ${view.dateLabel}`, { size: 20, color: MUTED, after: 40 })
  )
  if (view.validUntilLabel) {
    body.push(p(`Valid until: ${view.validUntilLabel}`, { size: 20, color: MUTED, after: 40 }))
  }
  if (view.subject) {
    body.push(p(`Subject: ${view.subject}`, { size: 20, after: 80 }))
  }

  if (view.preparedFor.length) {
    body.push(...sectionLabel('Prepared for'))
    for (const line of view.preparedFor) body.push(p(line, { after: 40 }))
  }

  if (view.sections.enquiry) {
    body.push(...sectionLabel('Customer enquiry'))
    for (const line of view.enquirySummary.split('\n')) {
      body.push(p(line, { after: 40, size: 20 }))
    }
  }

  if (view.sections.message) {
    body.push(...sectionLabel('Message / response'))
    for (const block of view.messageBlocks) {
      if (block.type === 'heading') {
        body.push(p(block.text, { bold: true, size: 24, color: GREEN, after: 80 }))
      } else if (block.type === 'bullets') {
        for (const item of block.items) {
          body.push(
            new Paragraph({
              spacing: { after: 60 },
              bullet: { level: 0 },
              children: [new TextRun({ text: item, font: 'Calibri', size: 21, color: INK })]
            })
          )
        }
      } else {
        body.push(p(block.text, { after: 120 }))
      }
    }
  }

  if (view.sections.pricing) {
    body.push(...sectionLabel(view.pricing.mode === 'single' ? 'Price' : 'Quotation'))
    if (view.pricing.mode === 'single' && view.pricing.lines.length <= 1) {
      const line = view.pricing.lines[0]
      body.push(p(line?.description || 'Total', { after: 40 }))
      body.push(p(formatClientDocumentEuro(view.pricing.total), { bold: true, size: 28, color: GREEN, after: 160 }))
    } else {
      const headerRow = new TableRow({
        children: [
          cell('Description', { bold: true, color: WHITE, shading: GREEN, width: 4400 }),
          cell('Qty', { bold: true, color: WHITE, shading: GREEN, width: 900, align: AlignmentType.RIGHT }),
          cell('Unit price', { bold: true, color: WHITE, shading: GREEN, width: 1600, align: AlignmentType.RIGHT }),
          cell('Total', { bold: true, color: WHITE, shading: GREEN, width: 1600, align: AlignmentType.RIGHT })
        ]
      })
      const dataRows = view.pricing.lines.map(
        (line, i) =>
          new TableRow({
            children: [
              cell(line.description, { width: 4400, shading: i % 2 === 0 ? PALE : WHITE }),
              cell(String(line.qty), { width: 900, align: AlignmentType.RIGHT, shading: i % 2 === 0 ? PALE : WHITE }),
              cell(formatClientDocumentEuro(line.unitPrice), {
                width: 1600,
                align: AlignmentType.RIGHT,
                shading: i % 2 === 0 ? PALE : WHITE
              }),
              cell(formatClientDocumentEuro(line.lineTotal), {
                width: 1600,
                align: AlignmentType.RIGHT,
                shading: i % 2 === 0 ? PALE : WHITE
              })
            ]
          })
      )
      body.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...dataRows]
        })
      )
      body.push(p(`Subtotal  ${formatClientDocumentEuro(view.pricing.subtotal)}`, { after: 40, align: AlignmentType.RIGHT }))
      if (view.pricing.vatEnabled) {
        body.push(
          p(`VAT (${view.pricing.vatPercent}%)  ${formatClientDocumentEuro(view.pricing.vatAmount)}`, {
            after: 40,
            align: AlignmentType.RIGHT
          })
        )
      }
      body.push(
        p(`Total  ${formatClientDocumentEuro(view.pricing.total)}`, {
          bold: true,
          size: 24,
          color: GREEN,
          after: 160,
          align: AlignmentType.RIGHT
        })
      )
    }
  }

  if (view.sections.notes) {
    body.push(...sectionLabel('Additional notes'))
    for (const line of view.notes.split('\n')) body.push(p(line, { after: 40 }))
  }

  if (view.sections.terms) {
    body.push(...sectionLabel('Terms'))
    for (const line of view.terms.split('\n')) {
      body.push(p(line, { size: 18, color: MUTED, after: 60 }))
    }
  }

  if (view.sections.payment) {
    body.push(...sectionLabel('Payment information'))
    for (const line of view.paymentDetails.split('\n')) body.push(p(line, { after: 60 }))
  }

  if (view.sections.signature) {
    body.push(...sectionLabel('Acceptance'))
    body.push(p('Accepted by: ________________________________', { after: 200 }))
    body.push(p('Signature: ___________________________________', { after: 200 }))
    body.push(p('Date: ________________________________________', { after: 200 }))
  }

  const document = new Document({
    creator: c.name,
    title: `${view.title} ${view.reference}`,
    description: `${view.title} for ${normalized.customer.name || 'client'}`,
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(210),
              height: convertMillimetersToTwip(297)
            },
            margin: {
              top: convertMillimetersToTwip(16),
              right: convertMillimetersToTwip(18),
              bottom: convertMillimetersToTwip(18),
              left: convertMillimetersToTwip(18)
            }
          }
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                border: { top: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
                spacing: { before: 80 },
                children: [
                  new TextRun({ text: `${view.footerLine}    `, font: 'Calibri', size: 14, color: MUTED }),
                  new TextRun({ text: 'Page ', font: 'Calibri', size: 14, color: MUTED }),
                  new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 14, color: MUTED }),
                  new TextRun({ text: ' of ', font: 'Calibri', size: 14, color: MUTED }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 14, color: MUTED })
                ]
              })
            ]
          })
        },
        children: body
      }
    ]
  })

  const bytes = await Packer.toBuffer(document)
  return { filename, bytes }
}
