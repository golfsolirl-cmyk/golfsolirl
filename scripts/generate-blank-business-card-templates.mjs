/**
 * Build text-free business card PNGs from existing faces:
 * - Portrait + landscape outputs (landscape uses native 1446×936 artwork — not rotated portrait).
 * - Front: olive gradient top → darker toward bottom; fleet fades in from below with more van visible.
 * - Back portrait: lime field + keyed icons strip.
 * - Back landscape: lime gradient + icons from right column laid horizontally along bottom.
 *
 * Run: node scripts/generate-blank-business-card-templates.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')

const FRONT_PORTRAIT = path.join(ROOT, 'public/images/business-cards/golfsol-business-card-front.png')
const BACK_PORTRAIT = path.join(ROOT, 'public/images/business-cards/golfsol-business-card-back.png')
const FRONT_LANDSCAPE = path.join(ROOT, 'public/images/business-cards/golfsol-business-card-front-landscape.png')
const BACK_LANDSCAPE = path.join(ROOT, 'public/images/business-cards/golfsol-business-card-back-landscape.png')

const OUT = {
  frontPortrait: path.join(ROOT, 'public/images/business-cards/golfsol-business-card-front-blank.png'),
  backPortrait: path.join(ROOT, 'public/images/business-cards/golfsol-business-card-back-blank.png'),
  frontLandscape: path.join(ROOT, 'public/images/business-cards/golfsol-business-card-front-blank-landscape.png'),
  backLandscape: path.join(ROOT, 'public/images/business-cards/golfsol-business-card-back-blank-landscape.png')
}

const rowVariance = (buf, width, y, channels) => {
  let sum = 0
  let sumSq = 0
  let n = 0
  const stride = width * channels
  const offset = y * stride
  for (let x = Math.floor(width * 0.08); x < Math.floor(width * 0.92); x++) {
    const i = offset + x * channels
    const r = buf[i]
    const g = buf[i + 1]
    const b = buf[i + 2]
    const gray = (r + g + b) / 3
    sum += gray
    sumSq += gray * gray
    n++
  }
  const mean = sum / n
  return sumSq / n - mean * mean
}

/**
 * Top edge of fleet photo band (scan upward from bottom).
 * - `minPhotoFrac`: push detection up so at least this fraction of height can be photo (best-effort).
 * - `contactFloorFrac`: never start the fleet strip above this row — avoids pulling yellow/white contact artwork into the photo layer.
 */
function detectFleetTopFromBottom (buf, width, height, channels, opts = {}) {
  const minPhotoFrac = opts.minPhotoFrac ?? 0.48
  const contactFloorFrac = opts.contactFloorFrac

  const variances = []
  for (let y = 0; y < height; y++) {
    variances.push(rowVariance(buf, width, y, channels))
  }

  const chunk = Math.min(96, Math.floor(height * 0.09))
  let sum = 0
  for (let y = height - chunk; y < height; y++) {
    sum += variances[y]
  }
  const photoMean = sum / chunk

  let y = height - chunk - 1
  while (y > Math.floor(height * 0.35) && variances[y] > photoMean * 0.38) {
    y--
  }

  const latestStart = Math.floor(height * (1 - minPhotoFrac))
  let fleetTop = Math.min(y + 1, latestStart)

  if (typeof contactFloorFrac === 'number') {
    fleetTop = Math.max(fleetTop, Math.floor(height * contactFloorFrac))
  }

  fleetTop = Math.max(Math.floor(height * 0.34), Math.min(fleetTop, height - 16))
  return fleetTop
}

function readRgbAt (buf, width, channels, x, y) {
  const stride = width * channels
  const i = y * stride + x * channels
  return { r: buf[i], g: buf[i + 1], b: buf[i + 2] }
}

function avgOliveGutter (buf, width, height, channels, gx, yStart, yEnd) {
  let sr = 0
  let sg = 0
  let sb = 0
  let n = 0
  const y0 = Math.max(0, yStart)
  const y1 = Math.min(height - 1, yEnd)
  for (let y = y0; y <= y1; y += 2) {
    const i = (y * width + gx) * channels
    const r = buf[i]
    const g = buf[i + 1]
    const b = buf[i + 2]
    const lum = r + g + b
    if (lum < 420 && lum > 120 && g > r - 12 && g > b - 8 && b < r + 40) {
      sr += r
      sg += g
      sb += b
      n++
    }
  }
  if (n < 8) {
    return readRgbAt(buf, width, channels, gx, Math.floor((y0 + y1) / 2))
  }
  return { r: Math.round(sr / n), g: Math.round(sg / n), b: Math.round(sb / n) }
}

function smoothstep01 (t) {
  const x = Math.max(0, Math.min(1, t))
  return x * x * (3 - 2 * x)
}

/** Drop pixels similar to averaged corner patches (removes flat lime / mustard bars behind icons). */
function keyRgbToRgba (sd, sw, sh, sch, thresh) {
  let kr = 0
  let kg = 0
  let kb = 0
  let kn = 0
  const patch = 38
  const corners = [
    [5, 5],
    [sw - patch - 6, 5],
    [5, sh - patch - 8],
    [sw - patch - 6, sh - patch - 8]
  ]
  for (const [cx, cy] of corners) {
    for (let yy = cy; yy < cy + patch && yy < sh; yy++) {
      for (let xx = cx; xx < cx + patch && xx < sw; xx++) {
        const j = (yy * sw + xx) * sch
        kr += sd[j]
        kg += sd[j + 1]
        kb += sd[j + 2]
        kn++
      }
    }
  }
  kr /= kn
  kg /= kn
  kb /= kn

  const out = Buffer.alloc(sw * sh * 4)
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const j = (y * sw + x) * sch
      const i = (y * sw + x) * 4
      const r = sd[j]
      const g = sd[j + 1]
      const b = sd[j + 2]
      const d = Math.hypot(r - kr, g - kg, b - kb)
      out[i] = r
      out[i + 1] = g
      out[i + 2] = b
      out[i + 3] = d < thresh ? 0 : 255
    }
  }
  return out
}

/** Vertical gradient y=0 (top) → y=height-1 (bottom): lighter olive descending into deeper foot tone */
function buildVerticalGreenBase (width, height, cTopGreen, cFootGreen, curvePow = 0.55) {
  const baseRaw = Buffer.alloc(width * height * 4)
  for (let y = 0; y < height; y++) {
    const vy = height <= 1 ? 0 : y / (height - 1)
    const bias = Math.pow(vy, curvePow)
    const r = Math.round(cTopGreen.r + (cFootGreen.r - cTopGreen.r) * bias)
    const gch = Math.round(cTopGreen.g + (cFootGreen.g - cTopGreen.g) * bias)
    const b = Math.round(cTopGreen.b + (cFootGreen.b - cTopGreen.b) * bias)
    const rowOff = y * width * 4
    for (let x = 0; x < width; x++) {
      const i = rowOff + x * 4
      baseRaw[i] = r
      baseRaw[i + 1] = gch
      baseRaw[i + 2] = b
      baseRaw[i + 3] = 255
    }
  }
  return sharp(baseRaw, { raw: { width, height, channels: 4 } }).png().toBuffer()
}

async function buildFleetFadeOverlay (srcPath, fleetTop, width, height, fadeOpts = {}) {
  const fadeLift = fadeOpts.fadeLift ?? 0.03
  const fadePower = fadeOpts.fadePower ?? 0.72
  const vanSolidStart = fadeOpts.vanSolidStart ?? 0.1 /** below this t on strip edge stays feathered */

  const fleetH = height - fleetTop
  const fleetBuf = await sharp(srcPath)
    .extract({ left: 0, top: fleetTop, width, height: fleetH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const fr = fleetBuf.data
  const fc = fleetBuf.info.channels
  const fleetRgba = Buffer.alloc(width * fleetH * 4)

  for (let ry = 0; ry < fleetH; ry++) {
    const t = fleetH <= 1 ? 1 : ry / (fleetH - 1)
    const u = Math.max(0, Math.min(1, (t - fadeLift) / (1 - fadeLift)))
    let alpha = Math.round(255 * smoothstep01(Math.pow(u, fadePower)))
    /** Ramp vans to nearly opaque quickly so wheels / body read clearly */
    const vanBand = smoothstep01((t - vanSolidStart) / (1 - vanSolidStart))
    alpha = Math.round(Math.min(255, Math.max(alpha, 28 + 227 * vanBand)))

    const rowOff = ry * width * 4
    const srcRow = ry * width * fc
    for (let x = 0; x < width; x++) {
      const si = srcRow + x * fc
      const di = rowOff + x * 4
      fleetRgba[di] = fr[si]
      fleetRgba[di + 1] = fr[si + 1]
      fleetRgba[di + 2] = fr[si + 2]
      fleetRgba[di + 3] = alpha
    }
  }

  return sharp(fleetRgba, { raw: { width, height: fleetH, channels: 4 } }).png().toBuffer()
}

async function buildBlankFrontPortrait () {
  const img = sharp(FRONT_PORTRAIT).ensureAlpha()
  const { data, info } = await img.clone().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  const fleetTop = detectFleetTopFromBottom(data, width, height, channels, {
    minPhotoFrac: 0.5,
    contactFloorFrac: 0.604
  })
  const topKeepEnd = Math.min(Math.floor(height * 0.382), fleetTop - Math.max(72, Math.floor(height * 0.045)))

  const gx = Math.min(52, Math.floor(width * 0.06))
  const midGreenStart = Math.floor(height * 0.44)
  const midGreenEnd = Math.max(midGreenStart + 40, fleetTop - 110)

  const cFootGreen = avgOliveGutter(data, width, height, channels, gx, Math.max(midGreenEnd + 10, fleetTop - 95), fleetTop - 18)
  const cTopGreen = {
    r: Math.min(255, cFootGreen.r + 34),
    g: Math.min(255, cFootGreen.g + 28),
    b: Math.min(255, cFootGreen.b + 18)
  }

  const basePng = await buildVerticalGreenBase(width, height, cTopGreen, cFootGreen, 0.42)
  const fleetPng = await buildFleetFadeOverlay(FRONT_PORTRAIT, fleetTop, width, height, {
    fadeLift: 0.028,
    fadePower: 0.68,
    vanSolidStart: 0.07
  })

  const topKeep = await sharp(FRONT_PORTRAIT).extract({ left: 0, top: 0, width, height: topKeepEnd }).png().toBuffer()

  await sharp(basePng)
    .composite([
      { input: fleetPng, left: 0, top: fleetTop },
      { input: topKeep, left: 0, top: 0 }
    ])
    .png()
    .toFile(OUT.frontPortrait)
}

async function buildBlankFrontLandscape () {
  const img = sharp(FRONT_LANDSCAPE).ensureAlpha()
  const { data, info } = await img.clone().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  const fleetTop = detectFleetTopFromBottom(data, width, height, channels, {
    minPhotoFrac: 0.48,
    contactFloorFrac: 0.555
  })
  /** Left band holds crest; centre/right stay gradient-only */
  const crestBandW = Math.min(Math.floor(width * 0.42), 620)
  const crestH = Math.max(120, fleetTop - Math.max(28, Math.floor(height * 0.028)))

  const gx = Math.min(48, Math.floor(width * 0.04))
  const midGreenStart = Math.floor(height * 0.38)
  const midGreenEnd = Math.max(midGreenStart + 30, fleetTop - 85)

  const cFootGreen = avgOliveGutter(data, width, height, channels, gx, Math.max(midGreenEnd + 10, fleetTop - 88), fleetTop - 14)
  const cTopGreen = {
    r: Math.min(255, cFootGreen.r + 36),
    g: Math.min(255, cFootGreen.g + 30),
    b: Math.min(255, cFootGreen.b + 20)
  }

  const basePng = await buildVerticalGreenBase(width, height, cTopGreen, cFootGreen, 0.42)
  const fleetPng = await buildFleetFadeOverlay(FRONT_LANDSCAPE, fleetTop, width, height, {
    fadeLift: 0.022,
    fadePower: 0.58,
    vanSolidStart: 0.06
  })

  const crestStrip = await sharp(FRONT_LANDSCAPE)
    .extract({ left: 0, top: 0, width: crestBandW, height: crestH })
    .png()
    .toBuffer()

  await sharp(basePng)
    .composite([
      { input: fleetPng, left: 0, top: fleetTop },
      { input: crestStrip, left: 0, top: 0 }
    ])
    .png()
    .toFile(OUT.frontLandscape)
}

async function buildBlankBackPortrait () {
  const meta = await sharp(BACK_PORTRAIT).metadata()
  const width = meta.width
  const height = meta.height

  const stripH = Math.min(320, Math.floor(height * 0.24))
  const bodyH = height - stripH

  const gutter = Math.min(78, Math.floor(width * 0.11))
  const gutW = Math.max(28, gutter - 10)
  const leftGutter = await sharp(BACK_PORTRAIT)
    .extract({ left: 8, top: 28, width: gutW, height: Math.max(40, bodyH - 52) })
    .raw()
    .toBuffer()
  const rightGutter = await sharp(BACK_PORTRAIT)
    .extract({ left: width - gutter, top: 28, width: gutW, height: Math.max(40, bodyH - 52) })
    .raw()
    .toBuffer()

  let br = 0
  let bgc = 0
  let bb = 0
  let bn = 0
  for (const raw of [leftGutter, rightGutter]) {
    for (let i = 0; i < raw.length; i += 3) {
      const r = raw[i]
      const g = raw[i + 1]
      const b = raw[i + 2]
      const lum = r + g + b
      if (lum > 455 && g > 168 && r > 158 && b < 210) {
        br += r
        bgc += g
        bb += b
        bn++
      }
    }
  }

  if (bn < 200) {
    br = 219
    bgc = 230
    bb = 52
  } else {
    br = Math.round(br / bn)
    bgc = Math.round(bgc / bn)
    bb = Math.round(bb / bn)
  }

  const looksLikeLime = bgc > 175 && bb < 115 && br + bgc + bb > 520 && br < 245
  if (!looksLikeLime) {
    br = 212
    bgc = 222
    bb = 42
  }

  const stripBuf = await sharp(BACK_PORTRAIT)
    .extract({ left: 0, top: height - stripH, width, height: stripH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { data: sd, info: si } = stripBuf
  const sch = si.channels
  let kr = 0
  let kg = 0
  let kb = 0
  let kn = 0
  const patch = 44
  const collectPatch = (sx, sy) => {
    for (let yy = sy; yy < sy + patch && yy < stripH; yy++) {
      for (let xx = sx; xx < sx + patch && xx < width; xx++) {
        const j = (yy * width + xx) * sch
        kr += sd[j]
        kg += sd[j + 1]
        kb += sd[j + 2]
        kn++
      }
    }
  }
  collectPatch(6, 6)
  collectPatch(width - patch - 8, 6)
  collectPatch(6, stripH - patch - 10)
  collectPatch(width - patch - 8, stripH - patch - 10)
  kr = Math.round(kr / kn)
  kg = Math.round(kg / kn)
  kb = Math.round(kb / kn)

  const cutRaw = Buffer.alloc(width * stripH * 4)
  const thresh = 52
  for (let y = 0; y < stripH; y++) {
    for (let x = 0; x < width; x++) {
      const j = (y * width + x) * sch
      const r = sd[j]
      const g = sd[j + 1]
      const b = sd[j + 2]
      const d = Math.hypot(r - kr, g - kg, b - kb)
      const i = (y * width + x) * 4
      cutRaw[i] = r
      cutRaw[i + 1] = g
      cutRaw[i + 2] = b
      cutRaw[i + 3] = d < thresh ? 0 : 255
    }
  }

  const iconsOnly = await sharp(cutRaw, { raw: { width, height: stripH, channels: 4 } }).png().toBuffer()

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: br, g: bgc, b: bb, alpha: 1 }
    }
  })
    .composite([{ input: iconsOnly, left: 0, top: height - stripH }])
    .png()
    .toFile(OUT.backPortrait)
}

async function buildBlankBackLandscape () {
  const meta = await sharp(BACK_LANDSCAPE).metadata()
  const width = meta.width
  const height = meta.height

  /** Side gutters for lime sampling (skip rotated headline block in centre) */
  const gutX = Math.min(72, Math.floor(width * 0.06))
  const sampleTop = 24
  const sampleH = Math.max(80, height - sampleTop - 40)

  const leftEdge = await sharp(BACK_LANDSCAPE)
    .extract({ left: 8, top: sampleTop, width: gutX - 4, height: sampleH })
    .raw()
    .toBuffer()

  let br = 0
  let bgc = 0
  let bb = 0
  let bn = 0
  for (let i = 0; i < leftEdge.length; i += 3) {
    const r = leftEdge[i]
    const g = leftEdge[i + 1]
    const b = leftEdge[i + 2]
    const lum = r + g + b
    if (lum > 450 && g > 165 && r > 155 && b < 215) {
      br += r
      bgc += g
      bb += b
      bn++
    }
  }

  if (bn < 120) {
    br = 218
    bgc = 226
    bb = 48
  } else {
    br = Math.round(br / bn)
    bgc = Math.round(bgc / bn)
    bb = Math.round(bb / bn)
  }

  const looksLikeLime = bgc > 175 && bb < 115 && br + bgc + bb > 510 && br < 248
  if (!looksLikeLime) {
    br = 212
    bgc = 222
    bb = 42
  }

  const cFoot = { r: br, g: bgc, b: bb }
  const cTop = {
    r: Math.min(255, br + 28),
    g: Math.min(255, bgc + 26),
    b: Math.min(255, bb + 14)
  }

  const basePng = await buildVerticalGreenBase(width, height, cTop, cFoot, 0.44)

  const colW = Math.min(280, Math.floor(width * 0.2))
  const rawRot = await sharp(BACK_LANDSCAPE)
    .extract({
      left: width - colW - 10,
      top: Math.floor(height * 0.08),
      width: colW,
      height: Math.floor(height * 0.82)
    })
    .rotate(-90)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const cutBuf = keyRgbToRgba(rawRot.data, rawRot.info.width, rawRot.info.height, rawRot.info.channels, 46)
  let iconsBar = await sharp(cutBuf, {
    raw: {
      width: rawRot.info.width,
      height: rawRot.info.height,
      channels: 4
    }
  })
    .trim()
    .png()
    .toBuffer()

  const targetW = Math.min(Math.floor(width * 0.72), 1040)
  iconsBar = await sharp(iconsBar).resize({ width: targetW, fit: 'inside' }).png().toBuffer()

  const ib = await sharp(iconsBar).metadata()
  const ix = Math.round((width - (ib.width || 0)) / 2)
  const iy = height - (ib.height || 0) - Math.floor(height * 0.06)

  await sharp(basePng)
    .composite([{ input: iconsBar, left: Math.max(0, ix), top: Math.max(0, iy) }])
    .png()
    .toFile(OUT.backLandscape)
}

async function main () {
  const need = [FRONT_PORTRAIT, BACK_PORTRAIT, FRONT_LANDSCAPE, BACK_LANDSCAPE]
  for (const p of need) {
    if (!fs.existsSync(p)) {
      console.error('Missing:', p)
      process.exit(1)
    }
  }

  await buildBlankFrontPortrait()
  await buildBlankBackPortrait()
  await buildBlankFrontLandscape()
  await buildBlankBackLandscape()

  for (const [k, v] of Object.entries(OUT)) {
    console.log(k + ':', v)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
