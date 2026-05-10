/**
 * Writes public/samples/golfsol-unified-document-template.pdf — master PDF shell sample.
 * From repo root: `npm run generate:unified-pdf-sample` (works on Windows PowerShell).
 * Or: `node scripts/generate-gsol-unified-pdf-sample.mjs` — avoid `cd … && node …` in PowerShell (use `;` or run npm from the project folder).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGsolUnifiedPdfTemplateSampleBytes } from '../server/gsol-unified-pdf-template.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '../public/samples/golfsol-unified-document-template.pdf')
const dir = path.dirname(outPath)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

const bytes = await buildGsolUnifiedPdfTemplateSampleBytes()
fs.writeFileSync(outPath, bytes)
console.log('Wrote', outPath)
