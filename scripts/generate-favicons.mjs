#!/usr/bin/env node
/**
 * Generate favicons + web manifest from `public/images/g-sol-logo.png`.
 * Trims empty alpha, fills the square (no stretch), supersamples small sizes for clarity.
 *
 *   node scripts/generate-favicons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'public/images/g-sol-logo.png')
const outDir = join(root, 'public')

/** Browser UI chrome — keep in sync with index.html theme-color meta tags. */
const SITE_THEME_COLOR = '#0b3123'

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }
const BLACK_KEY_THRESHOLD = 20
/** After trim, crest fills the full square (portrait letterbox is only side padding). */
const CREST_FILL = 1

const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
]

/** Key near-black plate pixels to alpha 0, then trim transparent margins. */
async function loadTransparentCrest() {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r <= BLACK_KEY_THRESHOLD && g <= BLACK_KEY_THRESHOLD && b <= BLACK_KEY_THRESHOLD) {
      data[i + 3] = 0
    }
  }
  const keyed = await sharp(data, { raw: { width, height, channels } }).png().toBuffer()
  return sharp(keyed).trim({ threshold: 12 })
}

async function renderSquare(crestPipeline, size) {
  const inner = Math.max(8, Math.round(size * CREST_FILL))
  const supersample = size <= 48 ? Math.max(inner * 4, 192) : inner * 2

  let pipeline = crestPipeline
    .clone()
    .resize(supersample, supersample, {
      fit: 'contain',
      background: TRANSPARENT,
      kernel: sharp.kernel.lanczos3,
    })

  if (size <= 48) {
    pipeline = pipeline.sharpen({ sigma: 0.55, m1: 1, m2: 2, x1: 2, y2: 10, y3: 10 })
  }

  const crest = await pipeline
    .resize(inner, inner, {
      fit: 'contain',
      background: TRANSPARENT,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer()

  return sharp({
    create: { width: size, height: size, channels: 4, background: TRANSPARENT },
  })
    .composite([{ input: crest, gravity: 'centre' }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer()
}

/** Multi-size ICO (16 + 32) for sharper tabs on legacy browsers. */
async function writeIco(pngBuffersBySize) {
  const entries = [16, 32]
    .map((size) => pngBuffersBySize.get(size))
    .filter(Boolean)

  if (entries.length === 0) throw new Error('Missing PNG buffers for favicon.ico')

  const sizes = [16, 32].filter((s) => pngBuffersBySize.has(s))
  const pngs = sizes.map((s) => pngBuffersBySize.get(s))

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(pngs.length, 4)

  let offset = 6 + pngs.length * 16
  const dirEntries = []
  const chunks = [header]

  for (let i = 0; i < pngs.length; i++) {
    const png = pngs[i]
    const size = sizes[i]
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    dirEntries.push(entry)
    offset += png.length
  }

  chunks.push(...dirEntries, ...pngs)
  return Buffer.concat(chunks)
}

async function main() {
  await mkdir(outDir, { recursive: true })
  const crestPipeline = await loadTransparentCrest()
  const pngBuffersBySize = new Map()

  for (const { name, size } of SIZES) {
    const buf = await renderSquare(crestPipeline, size)
    pngBuffersBySize.set(size, buf)
    await sharp(buf).toFile(join(outDir, name))
    console.log('Wrote', name, `(${size}×${size})`)
  }

  await writeFile(join(outDir, 'favicon.ico'), await writeIco(pngBuffersBySize))
  console.log('Wrote favicon.ico (16 + 32)')

  const manifest = {
    name: 'Golf Sol Ireland',
    short_name: 'GolfSol',
    description: 'Premium Costa del Sol golf holidays for Irish travellers.',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
    theme_color: SITE_THEME_COLOR,
    background_color: SITE_THEME_COLOR,
    display: 'standalone',
  }

  await writeFile(join(outDir, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log('Wrote site.webmanifest')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
