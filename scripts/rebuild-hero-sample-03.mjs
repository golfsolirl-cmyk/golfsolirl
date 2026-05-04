/**
 * Rebuilds `public/images/hero-sample-sunny-mercedes-03` (2:1 desktop) and
 * `hero-sample-sunny-mercedes-03-mobile` (9:16 phone — simplified overlay vs desktop).
 *
 * Usage: node scripts/rebuild-hero-sample-03.mjs
 */
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const fleetPath = join(root, 'public', 'images', 'transport-fleet-lineup.jpg')
const outDir = join(root, 'public', 'images')

const width = 1600
const height = 800

/** Portrait hero for narrow viewports (matches GeHero max-width:639px) */
const mobileWidth = 1080
const mobileHeight = 1920

const variant = {
  tint: '#0b4934',
  accent: '#f4c934',
  crop: 'entropy',
  titleY: 290,
  background: { brightness: 1.12, saturation: 1.28, hue: 0 },
}

/** Call line — horizontal centre (BOOK NOW is a live HTML button on the page). */
const ctaCenterX = 1160 + 360 / 2

function overlaySvg() {
  const { tint, accent, titleY } = variant
  return Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="leftPanel" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="${tint}" stop-opacity="0.96"/>
      <stop offset="0.45" stop-color="${tint}" stop-opacity="0.82"/>
      <stop offset="0.7" stop-color="${tint}" stop-opacity="0.32"/>
      <stop offset="1" stop-color="${tint}" stop-opacity="0.06"/>
    </linearGradient>
    <linearGradient id="goldBar" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#f8d84e"/>
      <stop offset="0.5" stop-color="#ffe77a"/>
      <stop offset="1" stop-color="#f0bf26"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#001f16" flood-opacity="0.32"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#leftPanel)"/>
  <rect x="0" y="0" width="${width}" height="72" fill="url(#goldBar)"/>
  <rect x="0" y="72" width="${width}" height="2" fill="#ffffff" opacity="0.34"/>
  <text x="78" y="47" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="900" letter-spacing="15" fill="#073d2b">MALAGA</text>
  <text x="382" y="47" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="900" fill="#073d2b">→</text>
  <text x="495" y="47" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="900" letter-spacing="15" fill="#073d2b">COSTA DEL SOL GOLF TRANSFERS</text>

  <g filter="url(#softShadow)">
    <rect x="58" y="102" width="305" height="48" rx="24" fill="#0e7458" opacity="0.92" stroke="#d9c866" stroke-opacity="0.45"/>
    <text x="93" y="133" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="900" letter-spacing="5" fill="#f8f3d0">MALAGA ARRIVALS</text>

    <rect x="980" y="102" width="372" height="48" rx="24" fill="#0e7458" opacity="0.92" stroke="#d9c866" stroke-opacity="0.45"/>
    <text x="1021" y="133" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="900" letter-spacing="5" fill="#f8f3d0">COSTA DEL SOL TEE-OFF</text>

    <rect x="58" y="172" width="812" height="42" rx="21" fill="#028a56" opacity="0.94" stroke="#59d56f" stroke-opacity="0.75"/>
    <text x="97" y="199" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="900" letter-spacing="4" fill="#fff4ad">WE MEET YOU AT THE GATE · AND OFF TO THE COURSE</text>
  </g>

  <g font-family="Arial, Helvetica, sans-serif" font-weight="900">
    <text x="58" y="${titleY}" font-size="92" letter-spacing="1" fill="#ffffff">FROM PLANE</text>
    <text x="58" y="${titleY + 108}" font-size="92" letter-spacing="1" fill="#ffffff">TO </text>
    <text x="206" y="${titleY + 108}" font-size="92" letter-spacing="1" fill="${accent}">FAIRWAY.</text>
  </g>

  <text x="60" y="${titleY + 175}" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="#ffffff">
    <tspan x="60" dy="0">Meet-and-greet at Malaga, golf-bag friendly Mercedes</tspan>
    <tspan x="60" dy="42">transfers, tee times pre-booked. Your group is taken care</tspan>
    <tspan x="60" dy="42">of from the carousel to the first cut.</tspan>
  </text>

  <line x1="0" y1="565" x2="${width}" y2="565" stroke="${accent}" stroke-width="4" opacity="0.9"/>
  <rect x="0" y="568" width="${width}" height="232" fill="${tint}" opacity="0.88"/>

  <g font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="900" fill="#ffffff">
    <circle cx="74" cy="650" r="24" fill="#1dcf65"/>
    <text x="66" y="660" font-size="24" fill="${tint}">✓</text>
    <text x="112" y="660" font-size="23">Meet &amp; Greet at Malaga AGP</text>
    <circle cx="74" cy="710" r="24" fill="#1dcf65"/>
    <text x="66" y="720" font-size="24" fill="${tint}">✓</text>
    <text x="112" y="720" font-size="23">Irish-owned operator support</text>

    <circle cx="655" cy="650" r="24" fill="#1dcf65"/>
    <text x="647" y="660" font-size="24" fill="${tint}">✓</text>
    <text x="693" y="660" font-size="23">Golf-bag friendly Mercedes V-Class</text>
    <circle cx="655" cy="710" r="24" fill="#1dcf65"/>
    <text x="647" y="720" font-size="24" fill="${tint}">✓</text>
    <text x="693" y="720" font-size="23">Pre-booked tee times &amp; resort transfers</text>
  </g>

  <g filter="url(#softShadow)">
    <text x="${ctaCenterX}" y="738" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" letter-spacing="5" fill="#fff2b1">CALL +353 87 446 4766</text>
  </g>

  <g transform="translate(1396 116)">
    <circle cx="70" cy="70" r="61" fill="#0e7458" stroke="${accent}" stroke-width="8"/>
    <circle cx="70" cy="70" r="69" fill="none" stroke="${accent}" stroke-width="4" stroke-dasharray="3 8"/>
    <text x="70" y="64" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="43" font-weight="900" fill="#ffffff">24/7</text>
    <text x="70" y="93" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="900" letter-spacing="3" fill="${accent}">SERVICE</text>
  </g>

  <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#f1cf55" stroke-opacity="0.26" stroke-width="6"/>
</svg>`)
}

/**
 * Portrait 9:16 — **mobile-only** simplified art direction: fewer blocks, more air,
 * centred type. Omits desktop pills, green strip, checklist wall, and 24/7 seal.
 * Desktop `overlaySvg()` is unchanged.
 */
function overlaySvgMobile() {
  const { tint, accent } = variant
  const w = mobileWidth
  const h = mobileHeight
  const cx = w / 2
  const barH = 96
  return Buffer.from(`
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Softer than desktop left panel: let van + course show through -->
    <linearGradient id="mLeftPanel" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="${tint}" stop-opacity="0.52"/>
      <stop offset="0.38" stop-color="${tint}" stop-opacity="0.28"/>
      <stop offset="0.62" stop-color="${tint}" stop-opacity="0.1"/>
      <stop offset="1" stop-color="${tint}" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="mGoldBar" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#f8d84e"/>
      <stop offset="0.5" stop-color="#ffe77a"/>
      <stop offset="1" stop-color="#f0bf26"/>
    </linearGradient>
    <linearGradient id="mLowerWash" gradientUnits="userSpaceOnUse" x1="0" y1="720" x2="0" y2="${h}">
      <stop offset="0" stop-color="${tint}" stop-opacity="0"/>
      <stop offset="0.22" stop-color="${tint}" stop-opacity="0.38"/>
      <stop offset="1" stop-color="${tint}" stop-opacity="0.82"/>
    </linearGradient>
    <filter id="mSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#001f16" flood-opacity="0.32"/>
    </filter>
    <filter id="mTrustEmph" x="-30%" y="-40%" width="160%" height="180%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000a08" flood-opacity="0.95" result="sh"/>
      <feMerge>
        <feMergeNode in="sh"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="mHeadLeg" x="-15%" y="-15%" width="130%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#02150f" flood-opacity="0.72"/>
    </filter>
  </defs>

  <rect width="${w}" height="${h}" fill="url(#mLeftPanel)"/>
  <rect x="0" y="0" width="${w}" height="${barH}" fill="url(#mGoldBar)"/>
  <rect x="0" y="${barH}" width="${w}" height="2" fill="#ffffff" opacity="0.34"/>
  <text x="${cx}" y="46" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="900" letter-spacing="7" fill="#073d2b">MALAGA → COSTA DEL SOL</text>
  <text x="${cx}" y="80" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="900" letter-spacing="11" fill="#073d2b">GOLF TRANSFERS</text>

  <g filter="url(#mHeadLeg)">
    <text x="${cx}" y="280" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="108" font-weight="900" letter-spacing="0.5" fill="#ffffff">FROM PLANE</text>
    <text x="${cx}" y="408" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="108" font-weight="900" letter-spacing="0.5">
      <tspan fill="#ffffff">TO </tspan><tspan fill="${accent}">FAIRWAY.</tspan>
    </text>
    <text x="${cx}" y="520" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="800" fill="#ffffff">
      <tspan x="${cx}" dy="0">Meet-and-greet at Málaga.</tspan>
      <tspan x="${cx}" dy="52">Mercedes transfers · tee times booked.</tspan>
      <tspan x="${cx}" dy="52">Your group looked after, gate to fairway.</tspan>
    </text>
  </g>

  <line x1="0" y1="740" x2="${w}" y2="740" stroke="${accent}" stroke-width="5" opacity="0.95"/>
  <rect x="0" y="744" width="${w}" height="${h - 744}" fill="url(#mLowerWash)"/>

  <g filter="url(#mTrustEmph)" font-family="Arial, Helvetica, sans-serif" font-weight="900">
    <text x="${cx}" y="808" text-anchor="middle" font-size="38" letter-spacing="5" fill="#fff8dc">IRISH-OWNED · GOLF-BAG FRIENDLY</text>
    <text x="${cx}" y="872" text-anchor="middle" font-size="46" letter-spacing="3" fill="#ffffff">
      <tspan x="${cx}" dy="0">ALL TRANSFERS</tspan>
      <tspan x="${cx}" dy="52" font-size="46">FULLY INSURED</tspan>
    </text>
    <text x="${cx}" y="1008" text-anchor="middle" font-size="36" letter-spacing="3" fill="#ffe566">IRISH &amp; SPANISH PHONE SUPPORT</text>
    <text x="${cx}" y="1082" text-anchor="middle" font-size="50" letter-spacing="3" fill="#ffffff">+353 87 446 4766</text>
    <text x="${cx}" y="1168" text-anchor="middle" font-size="50" letter-spacing="3" fill="#ffffff">+34 641 81 53 66</text>
  </g>

  <g filter="url(#mSoftShadow)">
    <text x="${cx}" y="1710" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="900" letter-spacing="5" fill="#fff2b1">CALL +353 87 446 4766</text>
  </g>

  <rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="#f1cf55" stroke-opacity="0.2" stroke-width="4"/>
</svg>`)
}

function rightWarmth(w, h) {
  return Buffer.from(`
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sun" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#ffe28a" stop-opacity="0.28"/>
      <stop offset="0.42" stop-color="#ffffff" stop-opacity="0.03"/>
      <stop offset="1" stop-color="#00643c" stop-opacity="0.08"/>
    </linearGradient>
    <linearGradient id="readability" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#03291d" stop-opacity="0.72"/>
      <stop offset="0.43" stop-color="#03291d" stop-opacity="0.3"/>
      <stop offset="0.72" stop-color="#03291d" stop-opacity="0"/>
      <stop offset="1" stop-color="#03291d" stop-opacity="0.08"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sun)"/>
  <rect width="${w}" height="${h}" fill="url(#readability)"/>
</svg>`)
}

/** Lighter warmth so the fleet + fairway photo stays vivid on portrait crops. */
function rightWarmthMobile(w, h) {
  return Buffer.from(`
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sunM" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#ffe28a" stop-opacity="0.12"/>
      <stop offset="0.45" stop-color="#ffffff" stop-opacity="0.02"/>
      <stop offset="1" stop-color="#00643c" stop-opacity="0.04"/>
    </linearGradient>
    <linearGradient id="readabilityM" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#03291d" stop-opacity="0.38"/>
      <stop offset="0.4" stop-color="#03291d" stop-opacity="0.14"/>
      <stop offset="0.68" stop-color="#03291d" stop-opacity="0"/>
      <stop offset="1" stop-color="#03291d" stop-opacity="0.04"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sunM)"/>
  <rect width="${w}" height="${h}" fill="url(#readabilityM)"/>
</svg>`)
}

async function writeHeroVariant(outW, outH, overlayBuf, warmthBuf, baseName, opts = {}) {
  const coverPosition = opts.coverPosition ?? variant.crop
  const resizedBackground = await sharp(fleetPath)
    .resize(outW, outH, { fit: 'cover', position: coverPosition })
    .modulate(variant.background)
    .blur(0.3)
    .toBuffer()

  const base = sharp(resizedBackground).composite([
    { input: warmthBuf, blend: 'over' },
    { input: overlayBuf, blend: 'over' },
  ])

  const pngPath = join(outDir, `${baseName}.png`)
  const webpPath = join(outDir, `${baseName}.webp`)

  await base.clone().png({ quality: 92, compressionLevel: 8 }).toFile(pngPath)
  await base.clone().webp({ quality: 90 }).toFile(webpPath)

  console.log('Wrote', pngPath)
  console.log('Wrote', webpPath)
}

async function main() {
  mkdirSync(outDir, { recursive: true })

  await writeHeroVariant(width, height, overlaySvg(), rightWarmth(width, height), 'hero-sample-sunny-mercedes-03')
  await writeHeroVariant(
    mobileWidth,
    mobileHeight,
    overlaySvgMobile(),
    rightWarmthMobile(mobileWidth, mobileHeight),
    'hero-sample-sunny-mercedes-03-mobile',
    { coverPosition: 'south' }
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
