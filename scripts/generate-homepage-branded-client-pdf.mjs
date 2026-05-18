/**
 * Writes public/samples/golfsol-homepage-client-document.pdf for browser approval.
 * From repo root: npm run generate:homepage-client-pdf
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  HOMEPAGE_CLIENT_PDF_SAMPLE_FILENAME,
  buildHomepageBrandedClientPdfSampleBytes
} from '../server/homepage-branded-client-pdf.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '../public/samples', HOMEPAGE_CLIENT_PDF_SAMPLE_FILENAME)
const dir = path.dirname(outPath)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

const bytes = await buildHomepageBrandedClientPdfSampleBytes()
fs.writeFileSync(outPath, bytes)
console.log('Wrote', outPath)
