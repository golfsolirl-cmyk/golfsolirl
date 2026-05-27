#!/usr/bin/env node
/**
 * Packages page hero — plane-to-fairway stay-and-play art with responsive crops.
 * Usage: node scripts/generate-packages-hero.mjs
 */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const debugDir = join(root, 'scripts/asset-pack-debug')
const images = join(root, 'public/images')

const SOURCE_CANDIDATES = [
  join(debugDir, 'tmp-twilight-golf-hero.png'),
  join(debugDir, 'tmp-resort-hotel.png'),
  join(debugDir, 'tmp-family-vacation.png'),
  join(debugDir, 'tmp-moment-resort.png'),
  join(images, 'ge-premium-resort-hotel-hero.webp'),
  join(images, 'ge-premium-golf-fairway-coastal.webp')
]

async function pickSource() {
  const { access } = await import('node:fs/promises')
  for (const candidate of SOURCE_CANDIDATES) {
    try {
      await access(candidate)
      return candidate
    } catch {
      /* try next */
    }
  }
  throw new Error('No packages hero source image found')
}

async function writeVariant(srcBuffer, width, height, outPath, position = 'centre') {
  await sharp(srcBuffer)
    .resize(width, height, { fit: 'cover', position })
    .webp({ quality: 90, effort: 6 })
    .toFile(outPath)
  console.log('Wrote', outPath.replace(root + '\\', '').replace(root + '/', ''))
}

await mkdir(images, { recursive: true })

const sourcePath = await pickSource()
console.log('Source:', sourcePath)

const srcBuffer = await sharp(sourcePath)
  .modulate({ brightness: 1.04, saturation: 1.06 })
  .toBuffer()

const base = join(images, 'packages-hero-v3')
await writeVariant(srcBuffer, 1600, 900, `${base}-desktop.webp`, 'centre')
await writeVariant(srcBuffer, 1376, 768, `${base}-tablet.webp`, 'centre')
await writeVariant(srcBuffer, 900, 1200, `${base}-mobile.webp`, 'top')

await sharp(srcBuffer).webp({ quality: 90, effort: 6 }).toFile(`${base}.webp`)
console.log('Done — packages hero v3 in public/images/')
