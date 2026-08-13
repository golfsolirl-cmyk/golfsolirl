/**
 * Convert generated audit heroes into web-optimized base + desktop/tablet/mobile WebP.
 * Does not modify any pre-existing site images — only writes into the new audit folders.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ASSETS = path.resolve('.cursor-assets-fallback')
const CURSOR_ASSETS = path.resolve(
  process.env.USERPROFILE || process.env.HOME || '',
  '.cursor/projects/c-Users-Thomas-Desktop-tinasol/assets'
)
const RAW_DIRS = [CURSOR_ASSETS, path.resolve('assets'), ASSETS].filter((d) => fs.existsSync(d))

const JOBS = [
  // destinations
  ['marbella-golf-holiday-costa-del-sol.png', 'public/images/destinations/marbella-golf-holiday-costa-del-sol'],
  ['mijas-golf-holiday-costa-del-sol.png', 'public/images/destinations/mijas-golf-holiday-costa-del-sol'],
  ['estepona-golf-holiday-costa-del-sol.png', 'public/images/destinations/estepona-golf-holiday-costa-del-sol'],
  ['fuengirola-golf-holiday-costa-del-sol.png', 'public/images/destinations/fuengirola-golf-holiday-costa-del-sol'],
  ['torremolinos-golf-holiday-costa-del-sol.png', 'public/images/destinations/torremolinos-golf-holiday-costa-del-sol'],
  ['benalmadena-golf-holiday-costa-del-sol.png', 'public/images/destinations/benalmadena-golf-holiday-costa-del-sol'],
  ['malaga-golf-holiday-costa-del-sol.png', 'public/images/destinations/malaga-golf-holiday-costa-del-sol'],
  ['costa-del-sol-golf-holiday-overview.png', 'public/images/destinations/costa-del-sol-golf-holiday-overview'],
  ['golf-holidays-from-ireland-hub.png', 'public/images/destinations/golf-holidays-from-ireland-hub'],
  // departures
  ['golf-holidays-spain-from-dublin.png', 'public/images/departures/golf-holidays-spain-from-dublin'],
  ['golf-holidays-spain-from-cork.png', 'public/images/departures/golf-holidays-spain-from-cork'],
  ['golf-holidays-spain-from-shannon.png', 'public/images/departures/golf-holidays-spain-from-shannon'],
  ['golf-holidays-spain-from-belfast.png', 'public/images/departures/golf-holidays-spain-from-belfast'],
  ['golf-holidays-spain-from-ireland.png', 'public/images/departures/golf-holidays-spain-from-ireland'],
  // packages
  ['3-night-golf-break-costa-del-sol.png', 'public/images/packages/3-night-golf-break-costa-del-sol'],
  ['4-night-golf-break-costa-del-sol.png', 'public/images/packages/4-night-golf-break-costa-del-sol'],
  ['5-night-golf-holiday-costa-del-sol.png', 'public/images/packages/5-night-golf-holiday-costa-del-sol'],
  ['7-night-golf-holiday-costa-del-sol.png', 'public/images/packages/7-night-golf-holiday-costa-del-sol'],
  ['golf-society-packages-costa-del-sol.png', 'public/images/packages/golf-society-packages-costa-del-sol'],
  ['group-golf-holidays-costa-del-sol.png', 'public/images/packages/group-golf-holidays-costa-del-sol'],
  ['bespoke-golf-packages-costa-del-sol.png', 'public/images/packages/bespoke-golf-packages-costa-del-sol'],
  // courses
  ['marbella-golf-valley-corridor.png', 'public/images/courses/marbella-golf-valley-corridor'],
  ['mijas-fuengirola-golf-corridor.png', 'public/images/courses/mijas-fuengirola-golf-corridor'],
  ['sotogrande-golf-corridor.png', 'public/images/courses/sotogrande-golf-corridor'],
  // transfers (generated group transfers; malaga airport reused separately)
  ['golf-group-transfers.png', 'public/images/transfers/golf-group-transfers']
]

function findSource(filename) {
  for (const dir of RAW_DIRS) {
    const p = path.join(dir, filename)
    if (fs.existsSync(p)) return p
  }
  return null
}

async function writeResponsive(srcPath, outBase) {
  const dir = path.dirname(outBase)
  fs.mkdirSync(dir, { recursive: true })

  const pipeline = () => sharp(srcPath).rotate()

  await pipeline().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 78, effort: 6 }).toFile(`${outBase}.webp`)
  await pipeline().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 78, effort: 6 }).toFile(`${outBase}-desktop.webp`)
  await pipeline().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 76, effort: 6 }).toFile(`${outBase}-tablet.webp`)
  await pipeline()
    .resize({ width: 900, height: 1200, fit: 'cover', position: 'centre' })
    .webp({ quality: 74, effort: 6 })
    .toFile(`${outBase}-mobile.webp`)

  const meta = await sharp(`${outBase}-desktop.webp`).metadata()
  console.log(`✓ ${path.basename(outBase)} → ${meta.width}×${meta.height}`)
}

async function reuseMalagaAirportTransfer() {
  const sources = [
    'public/images/hero-malaga-transfer-desktop.webp',
    'public/images/hero-malaga-transfers-1600.webp',
    'public/images/hero-malaga-transfers.webp'
  ]
  const src = sources.find((p) => fs.existsSync(p))
  if (!src) throw new Error('No existing Málaga transfer source found to reuse')

  const outBase = 'public/images/transfers/malaga-airport-golf-transfers'
  fs.mkdirSync(path.dirname(outBase), { recursive: true })

  // Copy/resize from existing approved asset — never overwrite the source files.
  await sharp(src).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(`${outBase}.webp`)
  await sharp(src).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(`${outBase}-desktop.webp`)
  await sharp(src).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 78, effort: 6 }).toFile(`${outBase}-tablet.webp`)

  const mobileSrc = fs.existsSync('public/images/hero-malaga-transfer-mobile.webp')
    ? 'public/images/hero-malaga-transfer-mobile.webp'
    : src
  await sharp(mobileSrc)
    .resize({ width: 900, height: 1200, fit: 'cover', position: 'centre' })
    .webp({ quality: 76, effort: 6 })
    .toFile(`${outBase}-mobile.webp`)

  console.log(`✓ malaga-airport-golf-transfers (reused from ${src})`)
}

async function main() {
  console.log('Raw search dirs:', RAW_DIRS)
  for (const [filename, outBase] of JOBS) {
    const src = findSource(filename)
    if (!src) {
      console.warn(`✗ missing source: ${filename}`)
      continue
    }
    await writeResponsive(src, outBase)
  }
  await reuseMalagaAirportTransfer()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
