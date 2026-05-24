#!/usr/bin/env node
/**
 * Costa del Sol hotel card art — 4:3 crops from resort / stay photography only.
 * Avoids transfer fleet heroes and branded vehicle shots.
 *
 * Usage: node scripts/generate-hotel-card-images.mjs
 */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/images/hotels')
const CARD = { width: 1200, height: 900 }

/** @type {Record<string, string>} */
const SOURCES = {
  resortPool: 'public/images/ge-premium-resort-hotel-hero.webp',
  familyTerrace: 'public/images/ge-premium-family-golf-vacation.webp',
  resortEntrance: 'public/images/transport-moment-resort.webp',
  coastalVilla: 'public/images/ge-premium-golf-fairway-coastal.webp'
}

async function writeCard(srcRel, extract, filename) {
  let pipe = sharp(join(root, srcRel))
  if (extract) {
    pipe = pipe.extract(extract)
  }
  await pipe
    .resize(CARD.width, CARD.height, { fit: 'cover', position: 'centre' })
    .webp({ quality: 88, effort: 6 })
    .toFile(join(outDir, filename))
  console.log('Wrote', filename)
}

await mkdir(outDir, { recursive: true })

// Beachfront Fuengirola — pool terrace lounge at golden hour
await writeCard(
  SOURCES.resortPool,
  { left: 0, top: 80, width: 920, height: 688 },
  'hotel-angela.webp'
)

// Adults-only seafront — rooftop terrace overlooking pool & coast
await writeCard(
  SOURCES.familyTerrace,
  { left: 0, top: 0, width: 920, height: 688 },
  'hotel-yaramar.webp'
)

// Modern marina hotel — resort entrance & arrival courtyard
await writeCard(
  SOURCES.resortEntrance,
  { left: 120, top: 0, width: 1024, height: 768 },
  'hotel-ilunion-fuengirola.webp'
)

// All-inclusive beach hotel — infinity pool reflecting sunset
await writeCard(
  SOURCES.resortPool,
  { left: 280, top: 40, width: 920, height: 688 },
  'hotel-riu-costa-del-sol.webp'
)

// Palm-fringed pool deck — architecture & palms
await writeCard(
  SOURCES.resortPool,
  { left: 520, top: 0, width: 856, height: 640 },
  'hotel-don-pablo.webp'
)

// Apartment-style groups — terrace seating with golf bags & sea view
await writeCard(
  SOURCES.familyTerrace,
  { left: 420, top: 40, width: 956, height: 716 },
  'hotel-sol-timor.webp'
)

// Boutique seafront — bougainvillea terrace & coastal fairways
await writeCard(
  SOURCES.familyTerrace,
  { left: 0, top: 60, width: 780, height: 584 },
  'hotel-ocean-house.webp'
)

// Seafront suites Benalmádena — coastal resort panorama at dusk
await writeCard(
  SOURCES.resortPool,
  { left: 0, top: 0, width: 1200, height: 720 },
  'hotel-sunset-beach-club.webp'
)

console.log('Done — hotel card images in public/images/hotels/')
