/**
 * Reads source crest PNG and writes `gsirl.png` deploy copy + WebP + legacy SVG wrapper (tooling).
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
const sourcePng = join(pub, 'images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png')
const pngPath = join(pub, 'images/gsirl.png')

await sharp(readFileSync(sourcePng)).png().toFile(pngPath)
const webpPath = join(pub, 'golfsol-crest-brand.webp')
const svgPath = join(pub, 'golfsol-crest-brand.svg')

const meta = await sharp(pngPath).metadata()
const w = meta.width ?? 400
const h = meta.height ?? 600

const gsirlWebp = join(pub, 'images/gsirl.webp')
await sharp(readFileSync(pngPath)).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(gsirlWebp)
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
console.log('Wrote', pngPath, gsirlWebp, webpPath, svgPath, `(${w}×${h})`)
