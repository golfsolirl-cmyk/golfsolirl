/**
 * Generates public/sitemap.xml from content-pages.ts route keys.
 * Usage: node scripts/generate-sitemap.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const contentPagesPath = path.join(__dirname, '../src/pages/golf-experience/data/content-pages.ts')
const outPath = path.join(__dirname, '../public/sitemap.xml')

const siteBase = (process.env.SITE_URL || 'https://golfsolirl.com').replace(/\/+$/, '')

const staticPaths = [
  '/',
  '/services/transport',
  '/packages',
  '/package',
  '/about',
  '/contact',
  '/golf-courses',
  '/accommodation',
  '/faq',
  '/booking'
]

const src = fs.readFileSync(contentPagesPath, 'utf8')
const contentPaths = [...src.matchAll(/^\s+'(\/[^']+)':/gm)].map((match) => match[1])

const paths = [...new Set([...staticPaths, ...contentPaths])].sort()

const today = new Date().toISOString().slice(0, 10)

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (p) => `  <url>
    <loc>${siteBase}${p === '/' ? '' : p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${p === '/' ? '1.0' : '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

fs.writeFileSync(outPath, xml)
console.log(`Wrote ${paths.length} URLs to ${outPath}`)
