#!/usr/bin/env node
/**
 * Shared: composite new crest onto unbranded sunny fleet base.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { stripSolidBlackBackground } from '../server/strip-logo-black-background.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = join(root, 'assets/golfsol-fleet-sunny-costa-del-sol.png')
const CREST = join(root, 'public/images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png')

/** Door placements on native 1536×1024 unbranded fleet plate. */
export const FLEET_LOGO_PLACEMENTS = [
  { left: 318, top: 388, width: 142 },
  { left: 668, top: 408, width: 128 },
  { left: 1068, top: 362, width: 172 }
]

async function crestAtWidth(width) {
  const stripped = await stripSolidBlackBackground(readFileSync(CREST))
  const meta = await stripped.metadata()
  const aspect = (meta.height ?? 1) / (meta.width ?? 1)
  const height = Math.round(width * aspect)
  return stripped.resize(width, height, { fit: 'inside' }).png().toBuffer()
}

export async function buildBrandedFleetBase() {
  const base = await sharp(BASE).modulate({ brightness: 1.04, saturation: 1.06 }).png().toBuffer()
  const composites = []

  for (const slot of FLEET_LOGO_PLACEMENTS) {
    const logo = await crestAtWidth(slot.width)
    const logoMeta = await sharp(logo).metadata()
    const logoH = logoMeta.height ?? slot.width
    composites.push({
      input: logo,
      left: slot.left,
      top: slot.top - Math.round((logoH - slot.width) * 0.12)
    })
  }

  return sharp(base).composite(composites)
}
