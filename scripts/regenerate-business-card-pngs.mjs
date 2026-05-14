/**
 * Rebuild published business card PNGs:
 * - composites `public/golfsol-crest-brand.png` (same asset as site header `<picture>` stack)
 * - repaints Email + Web lines on the green contact face (correct domain)
 *
 * Source artwork stays otherwise (fleet photo, mustard marketing copy, colours).
 *
 * Run from a clean raster each time (otherwise overlays stack):
 *   git checkout -- public/images/business-cards/golfsol-business-card-front.png
 *
 *   npm run generate:business-card-pngs
 *
 * Coordinates: `scripts/business-card-overlay-coords.json`
 */

import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

function loadCoords() {
  const raw = readFileSync(path.join(__dirname, 'business-card-overlay-coords.json'), 'utf8')
  return JSON.parse(raw)
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function svgSolidPatch({ width, height, rx, fill }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="${fill}"/>
</svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function svgEmailPatch({ width, height, rx, fill, fontSize, fontFamily, textFill, text }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="${fill}"/>
  <text x="${width / 2}" y="${height / 2 + fontSize * 0.35}" text-anchor="middle"
    font-family="${escapeXml(fontFamily)}" font-weight="700" font-size="${fontSize}" fill="${textFill}">${escapeXml(text)}</text>
</svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function buildLogoLayer(logoRelPath, logoCfg, canvasWidth) {
  if (!logoCfg || (logoCfg.height == null && logoCfg.width == null)) {
    return null
  }
  let pipe = sharp(path.join(ROOT, logoRelPath)).ensureAlpha()
  if (logoCfg.width != null) {
    pipe = pipe.resize({ width: logoCfg.width })
  } else {
    pipe = pipe.resize({ height: logoCfg.height })
  }
  const buf = await pipe.toBuffer({ resolveWithObject: true })
  const left = Math.max(0, Math.round((canvasWidth - buf.info.width) / 2))
  const top = logoCfg.top ?? 40
  return { input: buf.data, left, top }
}

async function processFace(faceCfg, logoRelPath) {
  const abs = path.join(ROOT, faceCfg.output)
  const meta = await sharp(abs).metadata()
  const W = meta.width ?? 936

  const composites = []

  if (faceCfg.crestWipe) {
    const cw = faceCfg.crestWipe
    const wipeBuf = await svgSolidPatch({
      width: cw.width,
      height: cw.height,
      rx: cw.rx,
      fill: cw.fill
    })
    composites.push({ input: wipeBuf, left: cw.left, top: cw.top })
  }

  const logoLayer = await buildLogoLayer(logoRelPath, faceCfg.logo, W)
  if (logoLayer) {
    composites.push(logoLayer)
  }

  for (const ep of faceCfg.contactPatches ?? []) {
    const emailBuf = await svgEmailPatch({
      width: ep.width,
      height: ep.height,
      rx: ep.rx,
      fill: ep.fill,
      fontSize: ep.fontSize,
      fontFamily: ep.fontFamily,
      textFill: ep.textFill,
      text: ep.text
    })
    composites.push({ input: emailBuf, left: ep.left, top: ep.top })
  }

  await mkdir(path.dirname(abs), { recursive: true })

  const out = await sharp(abs).composite(composites).png({ compressionLevel: 9 }).toBuffer()
  const fs = await import('node:fs/promises')
  await fs.writeFile(abs, out)

  console.log(`Updated ${faceCfg.output}`)
}

async function main() {
  const coords = loadCoords()
  const logoPath = coords.logoPath
  await processFace(coords.faces.greenContact, logoPath)
  await processFace(coords.faces.mustardMarketing, logoPath)
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
