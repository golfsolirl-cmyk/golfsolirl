#!/usr/bin/env node
/**
 * Splits `public/images/351c0340-1b3d-4adc-b425-09ac136bba3f.png` into desktop (left) + mobile (right) hero rasters.
 *
 *   node scripts/split-hero-golfsol-composite.mjs
 */
import { join } from 'node:path'
import sharp from 'sharp'

const root = join(import.meta.dirname, '..')
const src = join(root, 'public/images/351c0340-1b3d-4adc-b425-09ac136bba3f.png')
const outDesktopPng = join(root, 'public/images/hero-golfsol-composite-desktop.png')
const outMobilePng = join(root, 'public/images/hero-golfsol-composite-mobile.png')
const outDesktopWebp = join(root, 'public/images/hero-golfsol-composite-desktop.webp')
const outMobileWebp = join(root, 'public/images/hero-golfsol-composite-mobile.webp')

const meta = await sharp(src).metadata()
const w = meta.width ?? 0
const h = meta.height ?? 0
const half = Math.floor(w / 2)

await sharp(src).extract({ left: 0, top: 0, width: half, height: h }).png().toFile(outDesktopPng)
await sharp(src).extract({ left: half, top: 0, width: w - half, height: h }).png().toFile(outMobilePng)
await sharp(outDesktopPng).webp({ quality: 88 }).toFile(outDesktopWebp)
await sharp(outMobilePng).webp({ quality: 88 }).toFile(outMobileWebp)

console.log('Wrote desktop + mobile hero assets from composite', { w, h, half })
