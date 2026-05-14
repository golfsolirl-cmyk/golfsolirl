/**
 * Reads `public/golfsol-crest-brand.png` and writes matching WebP + SVG wrapper (for email / tooling).
 *
 * Usage: node scripts/sync-golfsol-crest-brand-assets.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const pub = join(root, 'public')
const pngPath = join(pub, 'golfsol-crest-brand.png')
const webpPath = join(pub, 'golfsol-crest-brand.webp')
const svgPath = join(pub, 'golfsol-crest-brand.svg')

const meta = await sharp(pngPath).metadata()
const w = meta.width ?? 400
const h = meta.height ?? 600

await sharp(readFileSync(pngPath)).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(webpPath)

const webpB64 = readFileSync(webpPath).toString('base64')
const webpDataUri = `data:image/webp;base64,${webpB64}`

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="GolfSol Ireland crest">
  <title>GolfSol Ireland</title>
  <desc>Raster crest embedded as WebP data URI (required for SVG-as-img / picture).</desc>
  <image width="${w}" height="${h}" href="${webpDataUri}" preserveAspectRatio="xMidYMid meet"/>
</svg>
`
writeFileSync(svgPath, svg, 'utf8')
console.log('Wrote', webpPath, svgPath, `(${w}×${h})`)
