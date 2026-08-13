/**
 * Generates public/sitemap.xml (+ image sitemap) from content routes.
 * Usage: node scripts/generate-sitemap.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const contentPagesPath = path.join(root, 'src/pages/golf-experience/data/content-pages.ts')
const footerArticlesPath = path.join(root, 'src/data/footer-article-pages.ts')
const seoPathsFile = path.join(root, 'src/data/seo-landing-page-paths.ts')
const outPath = path.join(root, 'public/sitemap.xml')
const imageOutPath = path.join(root, 'public/sitemap-images.xml')

const siteBase = (process.env.SITE_URL || 'https://www.golfsolirl.com').replace(/\/+$/, '')

const staticPaths = [
  '/',
  '/services/transport',
  '/packages',
  '/about',
  '/contact',
  '/golf-courses',
  '/accommodation',
  '/faq',
  '/booking'
]

/** Secondary aliases — keep out of sitemap; vercel redirects to canonical. */
const excludeFromSitemap = new Set([
  '/package',
  '/transport',
  '/terms-conditions',
  '/links-and-information/dress-code-for-golf-in-spain',
  '/links-and-information/travelling-to-spain',
  '/tee-time-bookings-only',
  '/twilight-golf',
  '/contact/golf-holiday-enquiry-form',
  '/contact/give-a-testimonial',
  '/contact/privacy-policy',
  '/services/tee-time-bookings',
  '/services/twilight-golf',
  '/services/society-group-trips'
])

const scrapePaths = (filePath) => {
  if (!fs.existsSync(filePath)) return []
  const src = fs.readFileSync(filePath, 'utf8')
  return [...src.matchAll(/['"](\/[^'"]+)['"]\s*:/g)].map((m) => m[1])
}

const scrapeSeoConstPaths = (filePath) => {
  if (!fs.existsSync(filePath)) return []
  const src = fs.readFileSync(filePath, 'utf8')
  return [...src.matchAll(/['"](\/[^'"]+)['"]/g)].map((m) => m[1])
}

const contentPaths = scrapePaths(contentPagesPath)
const footerPaths = scrapePaths(footerArticlesPath)
const seoPaths = scrapeSeoConstPaths(seoPathsFile)

const paths = [...new Set([...staticPaths, ...contentPaths, ...footerPaths, ...seoPaths])]
  .filter((p) => !excludeFromSitemap.has(p))
  .sort()

const today = new Date().toISOString().slice(0, 10)

const priorityFor = (p) => {
  if (p === '/') return '1.0'
  if (p === '/golf-holidays' || p === '/golf-holidays/costa-del-sol') return '0.95'
  if (p.startsWith('/golf-holidays')) return '0.9'
  if (p.startsWith('/golf-holidays-spain-from')) return '0.88'
  if (p.startsWith('/golf-packages/')) return '0.85'
  if (p.startsWith('/guides/')) return '0.8'
  if (p.startsWith('/transfers/')) return '0.85'
  if (['/packages', '/golf-courses', '/contact', '/booking', '/services/transport'].includes(p)) return '0.85'
  return '0.7'
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (p) => `  <url>
    <loc>${siteBase}${p === '/' ? '' : p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${priorityFor(p)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

fs.writeFileSync(outPath, xml)

/** Representative images for key commercial URLs. */
const imageEntries = [
  { path: '/', image: '/images/og-share-fleet.jpg', title: 'Costa del Sol golf holidays from Ireland' },
  {
    path: '/golf-holidays',
    image: '/images/destinations/golf-holidays-costa-del-sol-hub.webp',
    title: 'Costa del Sol golf holidays'
  },
  {
    path: '/golf-holidays/costa-del-sol',
    image: '/images/destinations/costa-del-sol-golf-holiday-overview.webp',
    title: 'Costa del Sol golf holidays'
  },
  {
    path: '/golf-holidays/marbella',
    image: '/images/destinations/marbella-golf-holiday-costa-del-sol.webp',
    title: 'Marbella golf holidays'
  },
  {
    path: '/golf-holidays/mijas',
    image: '/images/destinations/mijas-golf-holiday-costa-del-sol.webp',
    title: 'Mijas golf holidays'
  },
  {
    path: '/golf-holidays/estepona',
    image: '/images/destinations/estepona-golf-holiday-costa-del-sol.webp',
    title: 'Estepona golf holidays'
  },
  {
    path: '/golf-holidays/malaga',
    image: '/images/destinations/malaga-golf-holiday-costa-del-sol.webp',
    title: 'Málaga golf holidays'
  },
  {
    path: '/golf-holidays/fuengirola',
    image: '/images/destinations/fuengirola-golf-holiday-costa-del-sol.webp',
    title: 'Fuengirola golf holidays'
  },
  {
    path: '/golf-holidays/benalmadena',
    image: '/images/destinations/benalmadena-golf-holiday-costa-del-sol.webp',
    title: 'Benalmádena golf holidays'
  },
  {
    path: '/golf-holidays/torremolinos',
    image: '/images/destinations/torremolinos-golf-holiday-costa-del-sol.webp',
    title: 'Torremolinos golf holidays'
  },
  {
    path: '/golf-holidays-spain-from-ireland',
    image: '/images/departures/golf-holidays-spain-from-ireland.webp',
    title: 'Golf holidays Spain from Ireland'
  },
  {
    path: '/golf-holidays-spain-from-dublin',
    image: '/images/departures/golf-holidays-spain-from-dublin.webp',
    title: 'Golf holidays Spain from Dublin'
  },
  {
    path: '/golf-holidays-spain-from-cork',
    image: '/images/departures/golf-holidays-spain-from-cork.webp',
    title: 'Golf holidays Spain from Cork'
  },
  {
    path: '/golf-holidays-spain-from-shannon',
    image: '/images/departures/golf-holidays-spain-from-shannon.webp',
    title: 'Golf holidays Spain from Shannon'
  },
  {
    path: '/golf-holidays-spain-from-belfast',
    image: '/images/departures/golf-holidays-spain-from-belfast.webp',
    title: 'Golf holidays Spain from Belfast'
  },
  {
    path: '/golf-packages/3-night-golf-breaks',
    image: '/images/packages/3-night-golf-break-costa-del-sol.webp',
    title: '3-night Costa del Sol golf breaks'
  },
  {
    path: '/golf-packages/golf-society-packages',
    image: '/images/packages/golf-society-packages-costa-del-sol.webp',
    title: 'Golf society packages Costa del Sol'
  },
  {
    path: '/golf-courses/marbella-golf-valley',
    image: '/images/courses/marbella-golf-valley-corridor.webp',
    title: 'Marbella Golf Valley courses'
  },
  {
    path: '/golf-courses/mijas-fuengirola',
    image: '/images/courses/mijas-fuengirola-golf-corridor.webp',
    title: 'Mijas and Fuengirola golf courses'
  },
  {
    path: '/golf-courses/sotogrande',
    image: '/images/courses/sotogrande-golf-corridor.webp',
    title: 'Sotogrande golf courses'
  },
  {
    path: '/transfers/malaga-airport-golf-transfers',
    image: '/images/transfers/malaga-airport-golf-transfers.webp',
    title: 'Málaga Airport golf transfers'
  },
  {
    path: '/transfers/golf-group-transfers',
    image: '/images/transfers/golf-group-transfers-costa-del-sol.webp',
    title: 'Golf group transfers Costa del Sol'
  },
  {
    path: '/services/transport',
    image: '/images/hero-costa-del-sol-transfer-banner.webp',
    title: 'Golf Sol Ireland transport'
  },
  {
    path: '/packages',
    image: '/images/packages-hero-v3.webp',
    title: 'Costa del Sol golf packages'
  }
]

const imageXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries
  .map(
    (e) => `  <url>
    <loc>${siteBase}${e.path === '/' ? '' : e.path}</loc>
    <image:image>
      <image:loc>${siteBase}${e.image}</image:loc>
      <image:title>${e.title}</image:title>
    </image:image>
  </url>`
  )
  .join('\n')}
</urlset>
`

fs.writeFileSync(imageOutPath, imageXml)
console.log(`Wrote ${paths.length} URLs to ${outPath}`)
console.log(`Wrote ${imageEntries.length} image URLs to ${imageOutPath}`)
