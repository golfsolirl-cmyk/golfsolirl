/**
 * Apply golfsol-rebuilt-image-pack.zip outputs into public/.
 * Usage: node scripts/apply-rebuilt-image-pack.mjs [extractDir]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const packDir = path.resolve(process.argv[2] ?? path.join(repoRoot, '_image-pack-extract'))
const manifestPath = path.join(packDir, 'image-manifest.json')

if (!fs.existsSync(manifestPath)) {
  console.error('Missing image-manifest.json in', packDir)
  process.exit(1)
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const publicRoot = path.join(repoRoot, 'public')

function destForEntry(entry) {
  const src = entry.source.replace(/^public\//, '')
  const dir = path.dirname(src)
  const base = path.basename(src, path.extname(src))
  const type = entry.type

  if (type === 'svg-original') {
    return path.join(publicRoot, src)
  }
  if (type === 'optimized-webp') {
    return path.join(publicRoot, dir, `${base}.webp`)
  }
  if (type === 'desktop-crop') {
    return path.join(publicRoot, dir, `${base}-desktop.webp`)
  }
  if (type === 'tablet-crop') {
    return path.join(publicRoot, dir, `${base}-tablet.webp`)
  }
  if (type === 'mobile-crop') {
    return path.join(publicRoot, dir, `${base}-mobile.webp`)
  }
  return null
}

let copied = 0
let skipped = 0
const seenDest = new Set()

for (const entry of manifest.outputs) {
  const dest = destForEntry(entry)
  if (!dest) {
    skipped += 1
    continue
  }
  const key = `${dest}::${entry.type}`
  if (seenDest.has(key)) {
    continue
  }
  seenDest.add(key)

  const srcFile = path.join(packDir, entry.output.replace(/\//g, path.sep))
  if (!fs.existsSync(srcFile)) {
    console.warn('missing pack file:', entry.output)
    skipped += 1
    continue
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(srcFile, dest)
  copied += 1
}

console.log(`Applied ${copied} files from ${packDir} → public/`)
if (skipped) {
  console.log(`Skipped ${skipped} entries`)
}
