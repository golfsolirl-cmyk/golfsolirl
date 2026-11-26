/**
 * After Vite build, write static HTML shells for SEO paths so crawlers
 * (and curl) see title / description / canonical / FAQ JSON-LD without JS.
 * Output: dist/<path>/index.html (filesystem takes precedence over SPA rewrite).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const distDir = path.join(root, 'dist')
const siteBase = (process.env.SITE_URL || 'https://www.golfsolirl.com').replace(/\/+$/, '')

const pathsFile = path.join(root, 'src/data/seo-landing-page-paths.ts')
const seoPagesFile = path.join(root, 'src/data/seo-landing-pages.ts')
const contentPagesFile = path.join(root, 'src/pages/golf-experience/data/content-pages.ts')

function scrapeSeoPaths() {
  const src = fs.readFileSync(pathsFile, 'utf8')
  return [...src.matchAll(/['"](\/[^'"]+)['"]/g)].map((m) => m[1])
}

/** Extract metaTitle / title / subtitle near a path key in TS page maps. */
function scrapePageMeta(filePath, routePath) {
  if (!fs.existsSync(filePath)) return null
  const src = fs.readFileSync(filePath, 'utf8')
  const escaped = routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(
    `['"]${escaped}['"]\\s*:\\s*[\\s\\S]{0,400}?metaTitle:\\s*['\`"]([^'\`"]+)['\`"][\\s\\S]{0,600}?title:\\s*['\`"]([^'\`"]+)['\`"][\\s\\S]{0,800}?subtitle:\\s*['\`]([^'\`]+)['\`]`,
    'm'
  )
  const m = src.match(re)
  if (!m) return null
  return { metaTitle: m[1], title: m[2], subtitle: m[3].replace(/\s+/g, ' ').trim() }
}

function scrapeFaqPairs(filePath, routePath) {
  if (!fs.existsSync(filePath)) return []
  const src = fs.readFileSync(filePath, 'utf8')
  const escaped = routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const blockRe = new RegExp(`['"]${escaped}['"]\\s*:\\s*page\\(\\{([\\s\\S]*?)\\}\\)`, 'm')
  const block = src.match(blockRe)?.[1]
  if (!block) return []
  const pairs = []
  const sectionRe = /title:\s*['`]([^'`]*\?)['`][\s\S]*?body:\s*['`]([^'`]+)['`]/g
  let m
  while ((m = sectionRe.exec(block)) !== null) {
    pairs.push({ question: m[1].trim(), answer: m[2].replace(/\s+/g, ' ').trim() })
  }
  return pairs
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function injectShell(html, { path: routePath, metaTitle, subtitle, faqs }) {
  const canonical = `${siteBase}${routePath === '/' ? '' : routePath}`
  const title = escapeHtml(metaTitle)
  const desc = escapeHtml(subtitle)
  let next = html
  next = next.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
  next = next.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/i,
    `<meta name="description" content="${desc}" />`
  )
  next = next.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:url" content="${canonical}" />`
  )
  next = next.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:title" content="${title}" />`
  )
  next = next.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:description" content="${desc}" />`
  )
  next = next.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/i,
    `<meta name="twitter:title" content="${title}" />`
  )
  next = next.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/i,
    `<meta name="twitter:description" content="${desc}" />`
  )

  const linkCanonical = `<link rel="canonical" href="${canonical}" />`
  if (!/rel="canonical"/i.test(next)) {
    next = next.replace('</head>', `    ${linkCanonical}\n  </head>`)
  } else {
    next = next.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i, linkCanonical)
  }

  if (faqs.length >= 2) {
    const faqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer }
      }))
    }
    const script = `<script type="application/ld+json" id="gsol-prerender-faq">${JSON.stringify(faqLd)}</script>`
    next = next.replace('</head>', `    ${script}\n  </head>`)
  }

  // Noscript readable body for curl / non-JS crawlers
  const noscript = `<noscript><main><h1>${title}</h1><p>${desc}</p>${
    faqs.length
      ? `<dl>${faqs.map((f) => `<dt>${escapeHtml(f.question)}</dt><dd>${escapeHtml(f.answer)}</dd>`).join('')}</dl>`
      : ''
  }<p><a href="${canonical}">${escapeHtml(canonical)}</a></p></main></noscript>`
  if (!/<noscript><main>/i.test(next)) {
    next = next.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`)
  }

  return next
}

if (!fs.existsSync(distDir)) {
  console.error('dist/ missing — run vite build first')
  process.exit(1)
}

const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
const paths = scrapeSeoPaths()
const priorityExtras = [
  '/faq',
  '/bundles',
  '/services/transport',
  '/golf-map',
  '/contact',
  '/golf-holidays/malaga'
]
const allPaths = [...new Set([...paths, ...priorityExtras])]

let written = 0
for (const routePath of allPaths) {
  const meta =
    scrapePageMeta(seoPagesFile, routePath) ||
    scrapePageMeta(contentPagesFile, routePath) ||
    null
  if (!meta) continue
  const faqs = scrapeFaqPairs(seoPagesFile, routePath)
  const html = injectShell(template, {
    path: routePath,
    metaTitle: meta.metaTitle,
    subtitle: meta.subtitle,
    faqs
  })
  const outDir = path.join(distDir, ...routePath.split('/').filter(Boolean))
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), html)
  written += 1
}

console.log(`prerender-seo-shells: wrote ${written} HTML shells under dist/`)
