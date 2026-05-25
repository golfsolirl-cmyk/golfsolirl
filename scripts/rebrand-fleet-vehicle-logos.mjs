#!/usr/bin/env node
/**
 * Replace vehicle-side logos on the golden-hour fleet hero with the current crest.
 * Coordinates tuned for 1672×941 source (88054e80…).
 *
 * Usage: node scripts/rebrand-fleet-vehicle-logos.mjs [output.png]
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { stripSolidBlackBackground } from '../server/strip-logo-black-background.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const FLEET_SRC = join(root, 'public/images/88054e80-6dd1-483f-8557-cdc45caa2442.png')
const CREST_SRC = join(root, 'public/images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png')
const DEFAULT_OUT = join(root, 'public/images/fleet-golden-hour-rebranded.png')

/** Overlay new crest centred on each existing vehicle decal. */
const PLACEMENTS = [
  { id: 'v-class', logoWidth: 118, logoLeft: 188, logoTop: 578 },
  { id: 'e-class', logoWidth: 100, logoLeft: 606, logoTop: 608 },
  { id: 'sprinter', logoWidth: 176, logoLeft: 1138, logoTop: 478 },
]

async function transparentLogo(width) {
  const crestBytes = await readFile(CREST_SRC)
  const stripped = await stripSolidBlackBackground(crestBytes)
  const meta = await stripped.metadata()
  const aspect = (meta.width ?? 1) / (meta.height ?? 1)
  const height = Math.round(width / aspect)
  return stripped.resize(width, height).png().toBuffer()
}

export async function rebrandFleetVehicleLogos(outPath = DEFAULT_OUT) {
  const srcBuffer = await readFile(FLEET_SRC)

  const logoLayers = await Promise.all(
    PLACEMENTS.map(async (p) => ({
      input: await transparentLogo(p.logoWidth),
      left: p.logoLeft,
      top: p.logoTop,
    }))
  )

  const out = await sharp(srcBuffer)
    .composite(logoLayers)
    .png({ compressionLevel: 6 })
    .toBuffer()

  await writeFile(outPath, out)
  return outPath
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = process.argv[2] ? join(root, process.argv[2]) : DEFAULT_OUT
  const written = await rebrandFleetVehicleLogos(out)
  console.log('Wrote', written.replace(root + '/', '').replace(root + '\\', ''))
}
