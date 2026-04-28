/**
 * Rebuilds `public/images/hero-sample-sunny-mercedes-03` from the fleet photo
 * with layout matching the prior sample; BOOK NOW is centered in the yellow CTA.
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

const variant = {
  tint: '#0b4934',
  accent: '#f4c934',
  crop: 'entropy',
  titleY: 290,
  background: { brightness: 1.12, saturation: 1.28, hue: 0 },
}

/** CTA bar — horizontal center for text */
const ctaCenterX = 1160 + 360 / 2
const ctaTextY = 625 + 72 / 2

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
    <rect x="1160" y="625" width="360" height="72" rx="13" fill="url(#goldBar)"/>
    <text x="${ctaCenterX}" y="${ctaTextY}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="33" font-weight="900" letter-spacing="8" fill="#063626">BOOK NOW</text>
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

const rightWarmth = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
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
  <rect width="${width}" height="${height}" fill="url(#sun)"/>
  <rect width="${width}" height="${height}" fill="url(#readability)"/>
</svg>`)

async function main() {
  mkdirSync(outDir, { recursive: true })

  const resizedBackground = await sharp(fleetPath)
    .resize(width, height, { fit: 'cover', position: variant.crop })
    .modulate(variant.background)
    .blur(0.3)
    .toBuffer()

  const base = sharp(resizedBackground).composite([
    { input: rightWarmth, blend: 'over' },
    { input: overlaySvg(), blend: 'over' },
  ])

  const pngPath = join(outDir, 'hero-sample-sunny-mercedes-03.png')
  const webpPath = join(outDir, 'hero-sample-sunny-mercedes-03.webp')

  await base.clone().png({ quality: 92, compressionLevel: 8 }).toFile(pngPath)
  await base.clone().webp({ quality: 90 }).toFile(webpPath)

  console.log('Wrote', pngPath)
  console.log('Wrote', webpPath)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
