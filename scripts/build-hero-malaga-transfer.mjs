/**
 * Splits `public/images/hero-malaga-transfer-reference.png` (desktop + mobile in one frame)
 * into responsive hero assets. Replace the reference with a high-resolution export (≥2400px wide)
 * for crisp desktop / retina output.
 */
import sharp from 'sharp'

const SRC = 'public/images/hero-malaga-transfer-reference.png'
const SPLIT_RATIO = 0.71

async function main() {
  const meta = await sharp(SRC).metadata()
  const w = meta.width
  const h = meta.height
  if (!w || !h) throw new Error('Could not read hero reference dimensions')

  const split = Math.round(w * SPLIT_RATIO)
  const desktop = { left: 0, top: 0, width: split, height: h }
  const mobile = { left: split, top: 0, width: w - split, height: h }

  await sharp(SRC).extract(desktop).webp({ quality: 100, effort: 6, smartSubsample: false }).toFile('public/images/hero-malaga-transfer-desktop.webp')
  await sharp(SRC).extract(desktop).png({ compressionLevel: 6 }).toFile('public/images/hero-malaga-transfer-desktop.png')
  await sharp(SRC).extract(mobile).webp({ quality: 100, effort: 6, smartSubsample: false }).toFile('public/images/hero-malaga-transfer-mobile.webp')
  await sharp(SRC).extract(mobile).png({ compressionLevel: 6 }).toFile('public/images/hero-malaga-transfer-mobile.png')

  console.log(`hero-malaga-transfer: ${w}×${h} → desktop ${desktop.width}px + mobile ${mobile.width}px`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
