#!/usr/bin/env node
/**
 * Brighter Costa del Sol hero art — fleet (branded) + about golfer plate.
 * Usage: node scripts/generate-sunny-brand-heroes.mjs
 */
import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const images = join(root, 'public/images')

/** Branded fleet source — GolfSol logos on vehicles. */
const FLEET_SRC = join(images, '88054e80-6dd1-483f-8557-cdc45caa2442.png')
const ABOUT_SRC = join(root, 'assets/golfsol-about-sunny-golfer-costa-del-sol.png')

function sunnyFleetPipe(input) {
  return input
    .modulate({ brightness: 1.15, saturation: 1.2 })
    .recomb([
      [1.05, 0, 0],
      [0, 1.02, 0],
      [0, 0, 0.95]
    ])
    .gamma(1.04)
}

async function writeFleetVariant(srcBuffer, width, height, outPath) {
  await sunnyFleetPipe(sharp(srcBuffer))
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .webp({ quality: 88, effort: 6 })
    .toFile(outPath)
  console.log('Wrote', outPath.replace(root + '/', ''))
}

await mkdir(images, { recursive: true })

const fleetBuffer = await sharp(FLEET_SRC).png().toBuffer()

await sunnyFleetPipe(sharp(fleetBuffer)).webp({ quality: 90, effort: 6 }).toFile(join(images, 'fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp'))
await sunnyFleetPipe(sharp(fleetBuffer)).png().toFile(join(images, 'fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.png'))
await writeFleetVariant(fleetBuffer, 1600, 900, join(images, 'fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f-desktop.webp'))
await writeFleetVariant(fleetBuffer, 1400, 787, join(images, 'fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp'))
await writeFleetVariant(fleetBuffer, 900, 1200, join(images, 'fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f-mobile.webp'))

await writeFleetVariant(fleetBuffer, 1920, 1080, join(images, 'hero-fleet-golf-golden-hour-desktop.webp'))
await writeFleetVariant(fleetBuffer, 1400, 787, join(images, 'hero-fleet-golf-golden-hour.webp'))
await writeFleetVariant(fleetBuffer, 1376, 768, join(images, 'hero-fleet-golf-golden-hour-tablet.webp'))
await writeFleetVariant(fleetBuffer, 900, 1200, join(images, 'hero-fleet-golf-golden-hour-mobile.webp'))
await sunnyFleetPipe(sharp(fleetBuffer)).png().toFile(join(images, 'hero-fleet-golf-golden-hour.png'))

await sharp(ABOUT_SRC)
  .modulate({ brightness: 1.06, saturation: 1.08 })
  .resize(1400, 933, { fit: 'cover', position: 'centre' })
  .webp({ quality: 88, effort: 6 })
  .toFile(join(images, 'about-golfsol-hero.webp'))
console.log('Wrote public/images/about-golfsol-hero.webp')

await sharp(join(root, 'assets/golfsol-fleet-sunny-costa-del-sol.png'))
  .resize(1600, 900, { fit: 'cover', position: 'centre' })
  .webp({ quality: 88, effort: 6 })
  .toFile(join(images, 'golfsol-fleet-sunny-costa-del-sol.webp'))
console.log('Wrote public/images/golfsol-fleet-sunny-costa-del-sol.webp')

console.log('Done — sunny fleet + about hero refreshed.')
