#!/usr/bin/env node
/**
 * Branded fleet hero — new crest on golden-hour fleet (all breakpoints).
 *
 * Usage: node scripts/generate-branded-fleet-hero.mjs
 */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { rebrandFleetVehicleLogos } from './rebrand-fleet-vehicle-logos.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const images = join(root, 'public/images')
const FLEET_REBRANDED = join(images, 'fleet-golden-hour-rebranded.png')

function sunnyFleetPipe(input) {
  return input
    .modulate({ brightness: 1.15, saturation: 1.2 })
    .recomb([
      [1.05, 0, 0],
      [0, 1.02, 0],
      [0, 0, 0.95],
    ])
    .gamma(1.04)
}

async function writeVariant(srcBuffer, width, height, outPath, alsoPng = false) {
  const pipe = sunnyFleetPipe(sharp(srcBuffer)).resize(width, height, {
    fit: 'cover',
    position: 'centre',
  })
  await pipe.clone().webp({ quality: 90, effort: 6 }).toFile(outPath)
  console.log('Wrote', outPath.replace(/\\/g, '/').replace(root.replace(/\\/g, '/') + '/', ''))
  if (alsoPng) {
    const pngPath = outPath.replace(/\.webp$/i, '.png')
    await pipe.clone().png({ compressionLevel: 6 }).toFile(pngPath)
    console.log('Wrote', pngPath.replace(/\\/g, '/').replace(root.replace(/\\/g, '/') + '/', ''))
  }
}

await mkdir(images, { recursive: true })

const fleetSrcPath = await rebrandFleetVehicleLogos(FLEET_REBRANDED)
const fleetBuffer = await sharp(fleetSrcPath).png().toBuffer()

await writeVariant(fleetBuffer, 1920, 1080, join(images, 'hero-fleet-golf-golden-hour-desktop.webp'))
await writeVariant(fleetBuffer, 1400, 787, join(images, 'hero-fleet-golf-golden-hour.webp'))
await writeVariant(fleetBuffer, 1376, 768, join(images, 'hero-fleet-golf-golden-hour-tablet.webp'))
await writeVariant(fleetBuffer, 900, 1200, join(images, 'hero-fleet-golf-golden-hour-mobile.webp'))
await writeVariant(fleetBuffer, 1920, 1080, join(images, 'hero-fleet-golf-golden-hour.png'), true)

console.log('Done — hero-fleet-golf-golden-hour-* with new crest.')
