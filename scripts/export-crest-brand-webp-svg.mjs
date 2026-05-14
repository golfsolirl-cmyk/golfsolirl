/**
 * One-off / repeatable: raster crest PNG → WebP + SVG wrapper (SVG embeds WebP, not vector trace).
 *
 * Default source: Cursor workspace asset path from chat uploads.
 * Usage: node scripts/export-crest-brand-webp-svg.mjs [path-to-source.png]
 */
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
/** Cursor workspace asset from chat upload (regenerate if missing). */
const defaultSrc =
  'C:\\Users\\Thomas\\.cursor\\projects\\c-Users-Thomas-Desktop-tinasol\\assets\\c__Users_Thomas_AppData_Roaming_Cursor_User_workspaceStorage_7d9efc7d3f5b978ddf2c9d3864337d7e_images_golf-sol-irl-7c9a3ade-16ab-45c2-9534-398b96539407.png'

const arg = process.argv[2]
const src = arg ? (isAbsolute(arg) ? arg : join(process.cwd(), arg)) : defaultSrc
if (!existsSync(src)) {
  console.error('Source PNG not found:', src)
  console.error('Pass path: node scripts/export-crest-brand-webp-svg.mjs path/to/crest.png')
  process.exit(1)
}
const pub = join(root, 'public')
const webpPath = join(pub, 'golfsol-crest-brand.webp')
const svgPath = join(pub, 'golfsol-crest-brand.svg')

const meta = await sharp(src).metadata()
const w = meta.width ?? 1
const h = meta.height ?? 1

await sharp(src).webp({ quality: 88, alphaQuality: 100, effort: 6 }).toFile(webpPath)

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="GolfSol Ireland crest">
  <title>GolfSol Ireland</title>
  <desc>Raster crest as WebP referenced from SVG (not hand-traced vector art).</desc>
  <image width="${w}" height="${h}" href="golfsol-crest-brand.webp" preserveAspectRatio="xMidYMid meet"/>
</svg>
`
writeFileSync(svgPath, svg, 'utf8')
console.log('Source:', src)
console.log('Wrote', webpPath, `(${w}×${h})`)
console.log('Wrote', svgPath)
