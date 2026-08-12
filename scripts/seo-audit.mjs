/**
 * Lightweight SEO audit for Golf Sol Ireland (Vite SPA).
 * Usage: npm run seo:audit
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const issues = []
const notes = []

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8')

const sitemap = read('public/sitemap.xml')
const robots = read('public/robots.txt')
const indexHtml = read('index.html')
const seoPathsSrc = read('src/data/seo-landing-page-paths.ts')
const seoPagesSrc = read('src/data/seo-landing-pages.ts')

const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const seoPaths = [...seoPathsSrc.matchAll(/['"](\/[^'"]+)['"]/g)].map((m) => m[1])

if (!robots.includes('Sitemap:')) {
  issues.push('robots.txt missing Sitemap directive')
}
if (!robots.includes('max-image-preview') && !indexHtml.includes('max-image-preview')) {
  notes.push('Consider max-image-preview on more templates (homepage index.html has it)')
}
if (!indexHtml.includes('<title>')) {
  issues.push('index.html missing <title>')
}
if (!indexHtml.includes('og:image')) {
  issues.push('index.html missing og:image')
}
if (!indexHtml.includes('Costa del Sol Golf Holidays from Ireland')) {
  issues.push('index.html title/OG should emphasise Costa del Sol golf holidays from Ireland')
}

for (const p of seoPaths) {
  if (!seoPagesSrc.includes(`'${p}'`) && !seoPagesSrc.includes(`"${p}"`)) {
    issues.push(`SEO path listed but missing page content: ${p}`)
  }
  const absolute = `https://www.golfsolirl.com${p}`
  const bare = `https://golfsolirl.com${p}`
  if (!sitemapLocs.some((loc) => loc === absolute || loc === bare || loc.endsWith(p))) {
    issues.push(`SEO path missing from sitemap.xml: ${p}`)
  }
}

const metaTitleMatches = [...seoPagesSrc.matchAll(/metaTitle:\s*'([^']+)'/g)].map((m) => m[1])
const titleCounts = new Map()
for (const t of metaTitleMatches) {
  titleCounts.set(t, (titleCounts.get(t) ?? 0) + 1)
}
for (const [t, n] of titleCounts) {
  if (n > 1) issues.push(`Duplicate metaTitle (${n}×): ${t}`)
}

const subtitleMatches = [...seoPagesSrc.matchAll(/subtitle:\s*'([^']+)'/g)].map((m) => m[1])
const subCounts = new Map()
for (const t of subtitleMatches) {
  subCounts.set(t, (subCounts.get(t) ?? 0) + 1)
}
for (const [t, n] of subCounts) {
  if (n > 1) issues.push(`Duplicate subtitle/description (${n}×): ${t.slice(0, 80)}…`)
}

if (!fs.existsSync(path.join(root, 'public/sitemap-images.xml'))) {
  issues.push('Missing public/sitemap-images.xml — run npm run generate:sitemap')
}

console.log('SEO audit — Golf Sol Ireland')
console.log(`Sitemap URLs: ${sitemapLocs.length}`)
console.log(`SEO landing paths: ${seoPaths.length}`)
if (notes.length) {
  console.log('\nNotes:')
  for (const n of notes) console.log(`- ${n}`)
}
if (issues.length === 0) {
  console.log('\nOK — no blocking issues found.')
  process.exit(0)
}
console.log(`\nIssues (${issues.length}):`)
for (const i of issues) console.log(`- ${i}`)
process.exit(1)
