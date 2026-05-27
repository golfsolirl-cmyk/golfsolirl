/**
 * Replace glassmorphism (backdrop-blur + translucent bg) with solid brand colours.
 * Run: node scripts/strip-glass-effects.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const TARGET_DIRS = ['src/pages', 'src/components']
const SKIP_FILES = new Set([
  'brand-identity-mockup-page.tsx',
  'logo-preview.tsx'
])

const BG_REPLACEMENTS = [
  [/bg-white\/95/g, 'bg-white'],
  [/bg-white\/92/g, 'bg-white'],
  [/bg-white\/90/g, 'bg-white'],
  [/bg-white\/88/g, 'bg-white'],
  [/bg-white\/85/g, 'bg-white'],
  [/bg-white\/82/g, 'bg-white'],
  [/bg-white\/80/g, 'bg-white'],
  [/bg-white\/75/g, 'bg-cream'],
  [/bg-white\/72/g, 'bg-cream'],
  [/bg-white\/70/g, 'bg-cream'],
  [/bg-white\/60/g, 'bg-offwhite'],
  [/bg-white\/55/g, 'bg-offwhite'],
  [/bg-white\/50/g, 'bg-offwhite'],
  [/bg-white\/40/g, 'bg-offwhite'],
  [/bg-white\/35/g, 'bg-offwhite'],
  [/bg-white\/18/g, 'bg-cream'],
  [/bg-white\/15/g, 'bg-forest-900'],
  [/bg-white\/12/g, 'bg-forest-900'],
  [/bg-white\/10/g, 'bg-forest-900'],
  [/bg-white\/8/g, 'bg-forest-900'],
  [/bg-white\/6/g, 'bg-forest-900'],
  [/bg-white\/5/g, 'bg-forest-950'],
  [/bg-white\/\[0\.08\]/g, 'bg-forest-900'],
  [/bg-white\/\[0\.06\]/g, 'bg-forest-900'],
  [/bg-white\/\[0\.04\]/g, 'bg-forest-950'],
  [/bg-forest-950\/76/g, 'bg-forest-950'],
  [/bg-forest-950\/72/g, 'bg-forest-950'],
  [/bg-forest-950\/62/g, 'bg-forest-950'],
  [/bg-forest-950\/58/g, 'bg-forest-950'],
  [/bg-gs-dark\/95/g, 'bg-gs-dark'],
  [/bg-black\/45/g, 'bg-brand-charcoal'],
  [/bg-black\/25/g, 'bg-brand-charcoal/80'],
  [
    /bg-\[linear-gradient\(160deg,rgba\(255,255,255,0\.12\),rgba\(255,255,255,0\.04\)\)\]/g,
    'bg-forest-900'
  ],
  [
    /bg-\[linear-gradient\(160deg,rgba\(255,255,255,0\.14\),rgba\(255,255,255,0\.04\)\)\]/g,
    'bg-forest-900'
  ],
  [
    /bg-\[linear-gradient\(135deg,rgba\(255,255,255,0\.9\),rgba\(248,252,250,0\.72\)\)\]/g,
    'bg-white'
  ]
]

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'brand-mockup') continue
      walk(full, files)
    } else if (/\.(tsx|ts)$/.test(entry.name) && !SKIP_FILES.has(entry.name)) {
      files.push(full)
    }
  }
  return files
}

function stripGlass(content) {
  let next = content
  next = next.replace(/\s*backdrop-blur(?:-\[[^\]]+\]|-\w+)?/g, '')
  next = next.replace(/\s*backdrop-saturate-\d+/g, '')
  next = next.replace(/\s*backdrop-filter/g, '')
  for (const [pattern, replacement] of BG_REPLACEMENTS) {
    next = next.replace(pattern, replacement)
  }
  return next
}

let changed = 0
for (const dir of TARGET_DIRS) {
  const abs = path.join(ROOT, dir)
  if (!fs.existsSync(abs)) continue
  for (const file of walk(abs)) {
    const original = fs.readFileSync(file, 'utf8')
    const updated = stripGlass(original)
    if (updated !== original) {
      fs.writeFileSync(file, updated)
      changed++
      console.log('updated', path.relative(ROOT, file))
    }
  }
}

console.log(`Done — ${changed} file(s) updated.`)
