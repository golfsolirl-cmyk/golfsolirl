/**
 * Builds homepage hero rasters from `public/images/hero-malaga-composed-source.png`.
 *
 * **Desktop** — wide 2:1 cover (max 2560×1280), *sundrenched* grade: lifted mids,
 * warmer saturation, no muddy crush (`withoutEnlargement` when possible).
 *
 * **Mobile** — *phone* frame: centre **9:17 portrait** slice from the master, then
 * resize to 1080×2040 (GeHero `max-sm:aspect-[9/17]`). Brighter + slightly more vivid
 * than desktop so small screens read “premium” outdoors.
 *
 * Usage: npm run build:hero-malaga-composed
 */
import { existsSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'public', 'images', 'hero-malaga-composed-source.png')
const outDir = join(root, 'public', 'images')

const DESK_TARGET_W = 2560
const DESK_TARGET_H = 1280

/** Portrait phone hero (matches ~9:17 layout). */
const MOB_OUT_W = 1080
const MOB_OUT_H = Math.round((MOB_OUT_W * 17) / 9)

const resizeDeskOpts = {
  fit: 'cover',
  position: 'centre',
  kernel: sharp.kernel.lanczos3,
  withoutEnlargement: true
}

/** Desktop: clear, luminous — Sharp gamma must be ≥ 1.0; lift via modulate + mild sharpen. */
function gradeDesktop(pipeline) {
  return pipeline
    .gamma(1.02)
    .modulate({ brightness: 1.12, saturation: 1.1, hue: 1 })
    .sharpen({ sigma: 0.55, m1: 1, m2: 2, x1: 2, y2: 12, y3: 12 })
}

/** Mobile: brighter + warmer for small screens in daylight. */
function gradeMobile(pipeline) {
  return pipeline
    .gamma(1.04)
    .modulate({ brightness: 1.18, saturation: 1.14, hue: 2 })
    .sharpen({ sigma: 0.45, m1: 0.9, m2: 2, x1: 2, y2: 10, y3: 10 })
}

async function main() {
  if (!existsSync(src)) {
    console.error('Missing source:', src)
    process.exit(1)
  }

  const metaIn = await sharp(src).metadata()
  const w = metaIn.width ?? 0
  const h = metaIn.height ?? 0
  console.log('Source:', w, '×', h, metaIn.space)

  if (w < 1800) {
    console.warn(
      '[hero] Source width is',
      w,
      'px — desktop is capped without upscale. For maximum clarity, use ≥ 2400px wide art.'
    )
  }

  const deskPipeline = gradeDesktop(
    sharp(src).rotate().removeAlpha().resize(DESK_TARGET_W, DESK_TARGET_H, resizeDeskOpts)
  )

  await deskPipeline
    .clone()
    .webp({ quality: 92, effort: 6, smartSubsample: true })
    .toFile(join(outDir, 'hero-malaga-composed-desktop.webp'))

  await deskPipeline.clone().png({ compressionLevel: 9 }).toFile(join(outDir, 'hero-malaga-composed-desktop.png'))

  /** Centre crop: width × height = 9 : 17 (tall phone). */
  const cropW = Math.max(2, Math.min(w, Math.floor((h * 9) / 17)))
  const left = Math.max(0, Math.floor((w - cropW) / 2))

  const mobBase = sharp(src).rotate().removeAlpha().extract({ left, top: 0, width: cropW, height: h })

  const mobPipeline = gradeMobile(
    mobBase.resize(MOB_OUT_W, MOB_OUT_H, {
      fit: 'cover',
      position: 'centre',
      kernel: sharp.kernel.lanczos3
    })
  )

  await mobPipeline.clone().webp({ quality: 90, effort: 6, smartSubsample: true }).toFile(join(outDir, 'hero-malaga-composed-mobile.webp'))

  await mobPipeline.clone().png({ compressionLevel: 9 }).toFile(join(outDir, 'hero-malaga-composed-mobile.png'))

  const deskMeta = await sharp(join(outDir, 'hero-malaga-composed-desktop.webp')).metadata()
  const mobMeta = await sharp(join(outDir, 'hero-malaga-composed-mobile.webp')).metadata()

  const metaOut = {
    desktop: { width: deskMeta.width, height: deskMeta.height },
    mobile: { width: mobMeta.width, height: mobMeta.height },
    mobileCrop: { sourceWidth: w, sourceHeight: h, cropLeft: left, cropWidth: cropW }
  }
  writeFileSync(join(outDir, 'hero-malaga-composed-build-meta.json'), JSON.stringify(metaOut, null, 2))

  console.log('Desktop WebP:', deskMeta.width, '×', deskMeta.height)
  console.log('Mobile WebP:', mobMeta.width, '×', mobMeta.height, `(9:17 slice cropW=${cropW}, left=${left})`)
  console.log('Wrote hero-malaga-composed-build-meta.json')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
