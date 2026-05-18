import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { pdfEmailTheme, brandedPdfAssetPaths } from '../server/pdf-email-brand.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '../public/samples/golfsol-branded-layout-sample.pdf')
const publicSamples = path.dirname(outPath)
if (!fs.existsSync(publicSamples)) {
  fs.mkdirSync(publicSamples, { recursive: true })
}

const W = 595.28
const H = 841.89
const m = 48

const t = pdfEmailTheme

const run = async () => {
  const doc = await PDFDocument.create()
  const page = doc.addPage([W, H])
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const logoBytes = fs.readFileSync(brandedPdfAssetPaths.homepageCrest)
  const logo = await doc.embedPng(logoBytes)
  const logoH = 62
  const logoW = (logo.width / logo.height) * logoH
  const y0 = H - m

  page.drawRectangle({ x: 0, y: H - 84, width: W, height: 84, color: t.green })
  page.drawRectangle({ x: 0, y: H - 84, width: W, height: 3, color: t.gold })
  page.drawText('Golf Sol Ireland', { x: m + 8, y: y0 - 14, size: 20, font: fontBold, color: t.white })
  page.drawText('Sample branded layout (PDF)', { x: m + 8, y: y0 - 40, size: 11, font, color: rgb(0.92, 0.95, 0.93) })
  page.drawImage(logo, { x: W - m - logoW, y: H - 84 + (84 - logoH) / 2, width: logoW, height: logoH })

  let y = y0 - 100
  const line = (text, size, color, f = font, weight = 400) => {
    page.drawText(text, { x: m, y, size, font: f, color })
    y -= size + (size > 12 ? 10 : 6)
  }

  line('SAMPLE-INV-2026-001', 10, t.muted, fontBold)
  y -= 4
  line('Invoice-style preview (fictional)', 16, t.ink, fontBold)
  y -= 4
  line('This PDF uses the same green and gold palette as Golf Sol Ireland emails and formal PDFs.', 11, t.muted, font)
  y -= 18
  line('Service: Malaga Airport private transfer (V-Class, golf bags)', 12, t.ink, font)
  line('Amount (sample): €180.00', 12, t.ink, fontBold)
  y -= 12
  line('Use the HTML route /api/sample-branded-document-html for a pixel match to the Resend email shell.', 10, t.muted, font)
  y -= 28
  page.drawRectangle({
    x: m,
    y: y - 2,
    width: W - 2 * m,
    height: 1,
    color: t.sand
  })
  y -= 20
  line('Golf Sol Ireland · Irish-owned Costa del Sol golf travel', 9, t.muted, font)

  const bytes = await doc.save()
  fs.writeFileSync(outPath, bytes)
  console.log('Wrote', outPath)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
