#!/usr/bin/env node
/**
 * Costa del Sol hotel card art — 4:3 crops from hotel-specific or resort photography.
 * Prefer scripts/asset-pack-debug/verify-hotel-*.png when present.
 *
 * Usage: node scripts/generate-hotel-card-images.mjs
 */
import { access } from 'node:fs/promises'
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/images/hotels')
const debugDir = join(root, 'scripts/asset-pack-debug')
const CARD = { width: 1200, height: 900 }

/** @type {Record<string, string>} */
const FALLBACK_SOURCES = {
  resortPool: 'public/images/ge-premium-resort-hotel-hero.webp',
  familyTerrace: 'public/images/ge-premium-family-golf-vacation.webp',
  resortEntrance: 'public/images/transport-moment-resort.webp'
}

/** @type {Array<{ filename: string, src?: string, extract?: { left: number, top: number, width: number, height: number } }>} */
const HOTELS = [
  {
    filename: 'hotel-angela.webp',
    src: join(debugDir, 'verify-hotel-angela.png')
  },
  {
    filename: 'hotel-yaramar.webp',
    src: join(root, FALLBACK_SOURCES.familyTerrace),
    extract: { left: 0, top: 0, width: 920, height: 688 }
  },
  {
    filename: 'hotel-ilunion-fuengirola.webp',
    src: join(debugDir, 'verify-hotel-ilunion-fuengirola.png')
  },
  {
    filename: 'hotel-riu-costa-del-sol.webp',
    src: join(debugDir, 'verify-hotel-riu-costa-del-sol.png')
  },
  {
    filename: 'hotel-don-pablo.webp',
    src: join(root, FALLBACK_SOURCES.resortPool),
    extract: { left: 520, top: 0, width: 856, height: 640 }
  },
  {
    filename: 'hotel-sol-timor.webp',
    src: join(debugDir, 'verify-hotel-sol-timor.png')
  },
  {
    filename: 'hotel-ocean-house.webp',
    src: join(root, FALLBACK_SOURCES.familyTerrace),
    extract: { left: 0, top: 60, width: 780, height: 584 }
  },
  {
    filename: 'hotel-sunset-beach-club.webp',
    src: join(root, FALLBACK_SOURCES.resortPool),
    extract: { left: 0, top: 0, width: 1200, height: 720 }
  }
]

async function resolveSource(preferredPath, fallbackRel) {
  try {
    await access(preferredPath)
    return preferredPath
  } catch {
    return join(root, fallbackRel)
  }
}

async function writeCard({ filename, src, extract }) {
  const resolved = src.startsWith(root)
    ? await resolveSource(src, FALLBACK_SOURCES.resortPool)
    : join(root, src)

  let pipe = sharp(resolved)
  if (extract) {
    pipe = pipe.extract(extract)
  }
  await pipe
    .resize(CARD.width, CARD.height, { fit: 'cover', position: 'centre' })
    .webp({ quality: 88, effort: 6 })
    .toFile(join(outDir, filename))
  console.log('Wrote', filename, '←', resolved.replace(root + '\\', '').replace(root + '/', ''))
}

await mkdir(outDir, { recursive: true })

for (const hotel of HOTELS) {
  await writeCard(hotel)
}

console.log('Done — hotel card images in public/images/hotels/')
