#!/usr/bin/env node
/**
 * Regenerate fpf-cover-* assets from the branded golden-hour hero plate.
 * Usage: node scripts/regenerate-fpf-cover-from-hero.mjs
 */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const images = join(root, 'public/images')
const SRC = join(images, '816cf7dc-e8c0-46fe-bce3-6d0c1f7005b2.png')
const BASE = 'fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f'

async function writeVariant(src, width, height, outPath, position = 'centre') {
  await sharp(src)
    .resize(width, height, { fit: 'cover', position })
    .webp({ quality: 90, effort: 6 })
    .toFile(outPath)
  console.log('Wrote', outPath.replace(/\\/g, '/').replace(root.replace(/\\/g, '/') + '/', ''))
}

await mkdir(images, { recursive: true })

await writeVariant(SRC, 1600, 900, join(images, `${BASE}-desktop.webp`))
await writeVariant(SRC, 1400, 787, join(images, `${BASE}.webp`))
await writeVariant(SRC, 1376, 768, join(images, `${BASE}-tablet.webp`))
await writeVariant(SRC, 900, 1200, join(images, `${BASE}-mobile.webp`), 'top')
await sharp(SRC).png({ compressionLevel: 6 }).toFile(join(images, `${BASE}.png`))
console.log(`Wrote public/images/${BASE}.png`)

console.log('Done — fpf-cover fleet assets refreshed from 816cf7dc hero.')
