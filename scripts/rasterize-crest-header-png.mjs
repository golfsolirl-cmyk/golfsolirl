/**
 * Writes `public/golfsol-crest-header.png` (400×600, portrait) from `public/golfsol-crest.svg`
 * by rasterising at 600×400 then rotating 90° clockwise — matches `scripts/extract-shamrock.mjs`
 * pixel coordinates.
 *
 * Usage: node scripts/rasterize-crest-header-png.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public', 'golfsol-crest.svg')
const outPath = join(root, 'public', 'golfsol-crest-header.png')

const svg = readFileSync(svgPath)
await sharp(svg, { density: 300 })
  .resize(600, 400, { fit: 'fill' })
  .rotate(90)
  .png({ compressionLevel: 9 })
  .toFile(outPath)

const meta = await sharp(outPath).metadata()
console.log('Wrote', outPath, meta.width, 'x', meta.height)
