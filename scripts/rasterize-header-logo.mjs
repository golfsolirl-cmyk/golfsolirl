/**
 * Writes PNG bitmaps of the header crest (same artwork as `GeBrandLockup` sticky:
 * `/golfsol-crest-footer.png` when that file exists, else `public/golfsol-crest.svg`).
 *
 * Outputs:
 *   - public/images/golfsol-header-logo-bitmap.png  (960px wide, main asset)
 *   - public/images/golfsol-header-logo-w{480,960,1440}.png
 *
 * Usage: node scripts/rasterize-header-logo.mjs
 */
import { mkdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicDir = join(root, 'public')
const outDir = join(publicDir, 'images')
const footerPng = join(publicDir, 'golfsol-crest-footer.png')
const crestSvg = join(publicDir, 'golfsol-crest.svg')

mkdirSync(outDir, { recursive: true })

const useFooterPng = existsSync(footerPng)
const widths = [480, 960, 1440]

async function pipeline() {
  for (const w of widths) {
    const name = join(outDir, `golfsol-header-logo-w${w}.png`)
    if (useFooterPng) {
      await sharp(readFileSync(footerPng))
        .resize({ width: w })
        .png({ compressionLevel: 9 })
        .toFile(name)
    } else {
      await sharp(readFileSync(crestSvg), { density: 300 })
        .resize({ width: w, withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toFile(name)
    }
    console.log('Wrote', name)
  }

  const canonical = join(outDir, 'golfsol-header-logo-bitmap.png')
  if (useFooterPng) {
    await sharp(readFileSync(footerPng)).resize({ width: 960 }).png({ compressionLevel: 9 }).toFile(canonical)
  } else {
    await sharp(readFileSync(crestSvg), { density: 300 })
      .resize({ width: 960, withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toFile(canonical)
  }
  console.log('Wrote', canonical)
  console.log(useFooterPng ? 'Source bitmap: golfsol-crest-footer.png' : 'Source vector: golfsol-crest.svg')
}

await pipeline()
