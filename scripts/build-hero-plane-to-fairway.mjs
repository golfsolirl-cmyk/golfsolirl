#!/usr/bin/env node
/**
 * Builds responsive homepage hero from `public/images/afeeead4-ada3-4630-9fa1-56c95b438e98.png`.
 *
 * Desktop: full banner (capped width for retina file-size).
 * Mobile:  re-composed portrait — header strip, text panel, fleet photo, feature bar
 *          stacked vertically so nothing is clipped on small screens.
 *
 *   node scripts/build-hero-plane-to-fairway.mjs
 */
import { join } from 'node:path'
import sharp from 'sharp'

const root = join(import.meta.dirname, '..')
const src = join(root, 'public/images/afeeead4-ada3-4630-9fa1-56c95b438e98.png')
const outDesktopPng = join(root, 'public/images/hero-golfsol-composite-desktop.png')
const outMobilePng = join(root, 'public/images/hero-golfsol-composite-mobile.png')
const outDesktopWebp = join(root, 'public/images/hero-golfsol-composite-desktop.webp')
const outMobileWebp = join(root, 'public/images/hero-golfsol-composite-mobile.webp')

const MOBILE_WIDTH = 750

// Source layout proportions (header strip / text panel / photo panel / feature bar).
// Tuned to the supplied 1693x929 mockup; tweak here if the source banner changes.
const HEADER_RATIO = 0.07
const FOOTER_RATIO = 0.18
const TEXT_RIGHT_RATIO = 0.55
const PHOTO_LEFT_RATIO = 0.52

const meta = await sharp(src).metadata()
const w = meta.width ?? 0
const h = meta.height ?? 0
if (!w || !h) throw new Error('Could not read source dimensions')

// ---------- Desktop ----------
const desktopMaxWidth = 1800
const desktopPipeline =
  w > desktopMaxWidth ? sharp(src).resize(desktopMaxWidth, null, { withoutEnlargement: true }) : sharp(src)

await desktopPipeline.clone().png({ compressionLevel: 6 }).toFile(outDesktopPng)
await desktopPipeline.clone().webp({ quality: 88 }).toFile(outDesktopWebp)

// ---------- Mobile (re-composed) ----------
const headerEnd = Math.round(h * HEADER_RATIO)
const footerStart = Math.round(h * (1 - FOOTER_RATIO))
const middleHeight = footerStart - headerEnd
const textRight = Math.round(w * TEXT_RIGHT_RATIO)
const photoLeft = Math.round(w * PHOTO_LEFT_RATIO)
const photoWidth = w - photoLeft

async function extractAndResize(region, targetWidth) {
  const buf = await sharp(src).extract(region).toBuffer()
  const resized = await sharp(buf).resize({ width: targetWidth }).toBuffer()
  const m = await sharp(resized).metadata()
  return { buffer: resized, width: m.width ?? targetWidth, height: m.height ?? 0 }
}

const headerStrip = await extractAndResize(
  { left: 0, top: 0, width: w, height: headerEnd },
  MOBILE_WIDTH
)
const textPanel = await extractAndResize(
  { left: 0, top: headerEnd, width: textRight, height: middleHeight },
  MOBILE_WIDTH
)
const photoPanel = await extractAndResize(
  { left: photoLeft, top: headerEnd, width: photoWidth, height: middleHeight },
  MOBILE_WIDTH
)
const footerStrip = await extractAndResize(
  { left: 0, top: footerStart, width: w, height: h - footerStart },
  MOBILE_WIDTH
)

const totalHeight =
  headerStrip.height + textPanel.height + photoPanel.height + footerStrip.height

// Cream canvas matches the brand background so any sub-pixel seams disappear.
const canvas = sharp({
  create: {
    width: MOBILE_WIDTH,
    height: totalHeight,
    channels: 4,
    background: { r: 247, g: 242, b: 231, alpha: 1 }
  }
})

let cursor = 0
const composites = []
for (const strip of [headerStrip, textPanel, photoPanel, footerStrip]) {
  composites.push({ input: strip.buffer, top: cursor, left: 0 })
  cursor += strip.height
}

await canvas.composite(composites).png({ compressionLevel: 6 }).toFile(outMobilePng)
await sharp(outMobilePng).webp({ quality: 90 }).toFile(outMobileWebp)

const desktopMeta = await sharp(outDesktopPng).metadata()
const mobileMeta = await sharp(outMobilePng).metadata()

console.log('Wrote hero plane-to-fairway assets', {
  source: { w, h },
  desktop: { w: desktopMeta.width, h: desktopMeta.height },
  mobile: { w: mobileMeta.width, h: mobileMeta.height },
  strips: {
    header: headerStrip.height,
    text: textPanel.height,
    photo: photoPanel.height,
    footer: footerStrip.height
  }
})
