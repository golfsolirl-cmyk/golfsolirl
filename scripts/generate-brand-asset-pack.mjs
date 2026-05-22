#!/usr/bin/env node
/**
 * High-quality GolfSol Ireland social asset pack.
 * Sources: branded fleet hero (1672×941) + crest logo — NOT the low-res layout sheet.
 *
 *   node scripts/generate-brand-asset-pack.mjs
 */
import { spawnSync } from 'node:child_process'
import { mkdir, rm, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const HERO = join(root, 'public/images/88054e80-6dd1-483f-8557-cdc45caa2442.png')
const CREST = join(root, 'public/images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png')
const OUT = join(root, 'public/downloads/golfsol-ireland-asset-pack')
const ZIP = join(root, 'public/downloads/golfsol-ireland-asset-pack.zip')

/** @type {Record<string, { w: number, h: number }>} */
const SIZES = {
  'Google Business/google-profile.png': { w: 800, h: 800 },
  'Google Business/google-cover.png': { w: 2120, h: 1192 },
  'Facebook/facebook-profile.png': { w: 1000, h: 1000 },
  'Facebook/facebook-cover.png': { w: 820, h: 312 },
  'Instagram/instagram-profile.png': { w: 320, h: 320 },
  'Instagram/instagram-post.png': { w: 1080, h: 1080 },
  'Instagram/instagram-story.png': { w: 1080, h: 1920 },
  'LinkedIn/linkedin-profile.png': { w: 1000, h: 1000 },
  'LinkedIn/linkedin-banner.png': { w: 1584, h: 396 },
  'X - Twitter/twitter-profile.png': { w: 1000, h: 1000 },
  'X - Twitter/twitter-header.png': { w: 1500, h: 500 },
  'YouTube/youtube-profile.png': { w: 800, h: 800 },
  'YouTube/youtube-banner.png': { w: 2560, h: 1440 },
  'Source assets/hero-banner-full.png': { w: 2560, h: 1024 },
  'Source assets/logo-transparent.png': { w: 1000, h: 1000 },
  'Source assets/vehicle-1.png': { w: 1200, h: 800 },
  'Source assets/vehicle-2.png': { w: 1200, h: 800 },
  'Source assets/vehicle-3.png': { w: 1200, h: 800 },
  'Source assets/golf-course-background.png': { w: 1920, h: 1080 },
}

/** Extract regions on 1672×941 hero (graphic only). */
const REGIONS = {
  background: { left: 0, top: 0, width: 1672, height: 400 },
  vehicle1: { left: 24, top: 510, width: 500, height: 431 },
  vehicle2: { left: 500, top: 530, width: 520, height: 411 },
  vehicle3: { left: 960, top: 480, width: 712, height: 461 },
}

async function coverFit(input, w, h, enlarge = true) {
  return sharp(input).resize(w, h, {
    fit: 'cover',
    position: 'centre',
    withoutEnlargement: !enlarge,
  }).png()
}

async function logoPng(w, h) {
  const { data, info } = await sharp(CREST)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r < 50 && g < 50 && b < 50) data[i + 3] = 0
  }

  const contained = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .resize(Math.round(w * 0.86), Math.round(h * 0.86), {
      fit: 'inside',
      withoutEnlargement: false,
    })
    .png()
    .toBuffer()

  const meta = await sharp(contained).metadata()
  const canvas = await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: contained,
        left: Math.floor((w - (meta.width ?? w)) / 2),
        top: Math.floor((h - (meta.height ?? h)) / 2),
      },
    ])
    .png()
    .toBuffer()

  return canvas
}

async function buildStory(heroBuf) {
  const w = 1080
  const h = 1920
  const base = await sharp(heroBuf).resize(w, h, { fit: 'cover', position: 'centre' }).toBuffer()
  const logo = await logoPng(480, 480)
  const shade = await sharp({
    create: { width: w, height: 560, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.45 } },
  })
    .png()
    .toBuffer()

  return sharp(base)
    .composite([
      { input: shade, top: 0, left: 0 },
      { input: logo, top: 72, left: Math.floor((w - 480) / 2) },
    ])
    .png()
    .toBuffer()
}

async function extractRegion(region) {
  return sharp(HERO).extract(region).png().toBuffer()
}

async function main() {
  const heroMeta = await sharp(HERO).metadata()
  if (!heroMeta.width) throw new Error(`Missing hero: ${HERO}`)

  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })

  const heroFull = await coverFit(HERO, 2560, 1024)
  const heroBuf = await heroFull.toBuffer()

  const logo1000 = await logoPng(1000, 1000)
  const logo800 = await sharp(logo1000).resize(800, 800).png().toBuffer()
  const logo320 = await sharp(logo1000).resize(320, 320).png().toBuffer()

  const bg = await extractRegion(REGIONS.background)
  const v1 = await extractRegion(REGIONS.vehicle1)
  const v2 = await extractRegion(REGIONS.vehicle2)
  const v3 = await extractRegion(REGIONS.vehicle3)

  const story = await buildStory(heroBuf)

  /** @type {Record<string, Buffer | sharp.Sharp>} */
  const assets = {
    'Google Business/google-profile.png': logo800,
    'Google Business/google-cover.png': await coverFit(heroBuf, 2120, 1192),
    'Facebook/facebook-profile.png': logo1000,
    'Facebook/facebook-cover.png': await coverFit(heroBuf, 820, 312),
    'Instagram/instagram-profile.png': logo320,
    'Instagram/instagram-post.png': await coverFit(heroBuf, 1080, 1080),
    'Instagram/instagram-story.png': story,
    'LinkedIn/linkedin-profile.png': logo1000,
    'LinkedIn/linkedin-banner.png': await coverFit(heroBuf, 1584, 396),
    'X - Twitter/twitter-profile.png': logo1000,
    'X - Twitter/twitter-header.png': await coverFit(heroBuf, 1500, 500),
    'YouTube/youtube-profile.png': logo800,
    'YouTube/youtube-banner.png': await coverFit(heroBuf, 2560, 1440),
    'Source assets/hero-banner-full.png': heroFull,
    'Source assets/logo-transparent.png': logo1000,
    'Source assets/vehicle-1.png': await coverFit(v1, 1200, 800, false),
    'Source assets/vehicle-2.png': await coverFit(v2, 1200, 800, false),
    'Source assets/vehicle-3.png': await coverFit(v3, 1200, 800, false),
    'Source assets/golf-course-background.png': await coverFit(bg, 1920, 1080),
  }

  for (const [rel, data] of Object.entries(assets)) {
    const dest = join(OUT, rel)
    await mkdir(dirname(dest), { recursive: true })
    const buf = Buffer.isBuffer(data) ? data : await data.toBuffer()
    await sharp(buf).png({ compressionLevel: 6 }).toFile(dest)
  }

  const zipPy = `
import zipfile, pathlib
root = pathlib.Path(${JSON.stringify(OUT)})
zip_path = pathlib.Path(${JSON.stringify(ZIP)})
zip_path.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(root.rglob('*.png')):
        zf.write(f, 'golfsol-ireland-asset-pack/' + f.relative_to(root).as_posix())
`
  const zipRun = spawnSync('python', ['-c', zipPy], { stdio: 'inherit' })
  if (zipRun.status !== 0) throw new Error('ZIP creation failed')

  const { size } = await stat(ZIP)
  console.log(`Hero: ${HERO} (${heroMeta.width}×${heroMeta.height})`)
  console.log(`Assets: ${OUT}`)
  console.log(`ZIP: ${ZIP} (${Math.round(size / 1024)} KB)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
