/**
 * One-off: remap cream/mustard/gold Tailwind classes & common hex literals to crest-green/chrome.
 * Does not touch layout, spacing, or header-bg.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const root = join(import.meta.dirname, '..')
const dirs = [join(root, 'src'), join(root, 'public')]

const EXT = new Set(['.tsx', '.ts', '.css', '.html', '.mjs'])

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue
      walk(p, out)
    } else if (EXT.has(extname(name))) out.push(p)
  }
  return out
}

const CLASS_REPLACEMENTS = [
  [/variant=["']gs-gold["']/g, 'variant="gs-green"'],
  [/variant=\{"gs-gold"\}/g, 'variant={"gs-green"}'],
  [/text-gs-gold-light/g, 'text-silver-200'],
  [/hover:text-gs-gold-light/g, 'hover:text-silver-100'],
  [/text-gs-gold/g, 'text-brand-700'],
  [/hover:text-gs-gold/g, 'hover:text-brand-600'],
  [/bg-gs-gold-light/g, 'bg-brand-600'],
  [/bg-gs-gold/g, 'bg-brand-700'],
  [/hover:bg-gs-gold-light/g, 'hover:bg-brand-600'],
  [/hover:bg-gs-gold/g, 'hover:bg-brand-700'],
  [/border-gs-gold/g, 'border-brand-700'],
  [/ring-gs-gold/g, 'ring-brand-700'],
  [/from-gs-gold-light/g, 'from-brand-600'],
  [/to-gs-gold-light/g, 'to-brand-600'],
  [/via-gs-gold-light/g, 'via-brand-600'],
  [/from-gs-gold/g, 'from-brand-800'],
  [/to-gs-gold/g, 'to-brand-700'],
  [/via-gs-gold/g, 'via-brand-700'],
  [/shadow-gs-gold-hover/g, 'shadow-gs-green'],
  [/shadow-gs-gold/g, 'shadow-gs-green'],
  [/focus:bg-gs-gold/g, 'focus:bg-brand-700'],
  [/focus:ring-gs-gold/g, 'focus:ring-brand-600'],
  [/focus:border-gs-gold/g, 'focus:border-brand-700'],
  [/focus-visible:ring-gs-gold/g, 'focus-visible:ring-brand-600'],
  [/bg-gold-/g, 'bg-brand-'],
  [/text-gold-/g, 'text-brand-'],
  [/border-gold-/g, 'border-brand-'],
  [/ring-gold-/g, 'ring-brand-'],
  [/from-gold-/g, 'from-brand-'],
  [/to-gold-/g, 'to-brand-'],
  [/via-gold-/g, 'via-brand-'],
  [/hover:bg-gold-/g, 'hover:bg-brand-'],
  [/hover:text-gold-/g, 'hover:text-brand-'],
  [/bg-amber-/g, 'bg-chrome-'],
  [/text-amber-/g, 'text-brand-'],
  [/border-amber-/g, 'border-chrome-'],
  [/from-amber-/g, 'from-brand-'],
  [/to-amber-/g, 'to-brand-'],
  [/bg-yellow-/g, 'bg-chrome-'],
  [/text-yellow-/g, 'text-brand-'],
  [/border-yellow-/g, 'border-chrome-'],
  [/hover:border-gold-/g, 'hover:border-brand-'],
  [/ge-orange/g, 'brand-700'],
  [/decoration-gs-gold/g, 'decoration-brand-600'],
  [/hover:decoration-gs-gold/g, 'hover:decoration-brand-500'],
  [/fill-gs-gold/g, 'fill-brand-600'],
]

const HEX_REPLACEMENTS = [
  [/#fae82e/gi, '#136047'],
  [/#fdf28a/gi, '#1e7558'],
  [/#fde68a/gi, '#e3ebe6'],
  [/#fff4b8/gi, '#eef2ef'],
  [/#ffe875/gi, '#136047'],
  [/#f3c32a/gi, '#1e7558'],
  [/#f4c42e/gi, '#0b4d3b'],
  [/#ebb111/gi, '#136047'],
  [/#e8b30d/gi, '#1e7558'],
  [/#C9A75A/gi, '#136047'],
  [/#c9a75a/gi, '#136047'],
  [/#D7A629/gi, '#0b4d3b'],
  [/#d7a629/gi, '#0b4d3b'],
  [/#f6f0e2/gi, '#eef2ef'],
  [/#f7f4ed/gi, '#eef2ef'],
  [/#f5f1e6/gi, '#eef2ef'],
  [/#f4efe3/gi, '#eef2ef'],
  [/#faf9f6/gi, '#f4f7f5'],
  [/#fffbf5/gi, '#f4f7f5'],
  [/#faf6ec/gi, '#eef2ef'],
  [/#fff8ed/gi, '#eef2ef'],
  [/#fffcf6/gi, '#f4f7f5'],
  [/#e6dcc8/gi, '#d9d9d9'],
  [/#d6ccb8/gi, '#d9d9d9'],
  [/#d9d2c1/gi, '#d9d9d9'],
  [/#b89642/gi, '#0b4d3b'],
  [/#D8C29A/gi, '#d9d9d9'],
  [/#fae82e/gi, '#136047'],
  [/#fdf28a/gi, '#d9d9d9'],
  [/#063B2A/gi, '#062016'],
  [/#0B6B45/gi, '#0b4d3b'],
  [/#247A2D/gi, '#1e7558'],
  [/#082E23/gi, '#08120d'],
  [/#fff8dd/gi, '#ffffff'],
  [/#fff1b6/gi, '#eef2ef'],
  [/#F7F0E2/gi, '#eef2ef'],
  [/#E9D9B6/gi, '#d9d9d9'],
  [/#e3d6b7/gi, '#d9d9d9'],
  [/#e6dcc5/gi, '#d9d9d9'],
  [/#d7c8a4/gi, '#b8b8b8'],
  [/#d9c99e/gi, '#b8b8b8'],
  [/#dbcda9/gi, '#b8b8b8'],
  [/#c9b896/gi, '#b8b8b8'],
  [/#ece1c5/gi, '#e3ebe6'],
  [/#e4d6b6/gi, '#d9d9d9'],
  [/rgba\(250,\s*232,\s*46/gi, 'rgba(19, 96, 71'],
  [/rgba\(253,\s*242,\s*138/gi, 'rgba(30, 117, 88'],
  [/rgba\(244,\s*196,\s*46/gi, 'rgba(19, 96, 71'],
  [/rgba\(201,\s*167,\s*90/gi, 'rgba(19, 96, 71'],
  [/rgba\(215,\s*166,\s*41/gi, 'rgba(19, 96, 71'],
  [/#fffdf6/gi, '#f4f7f5'],
  [/#fffaf0/gi, '#f4f7f5'],
  [/#e5dcc8/gi, '#d9d9d9'],
  [/#e8dfcc/gi, '#d9d9d9'],
  [/#e4d9c3/gi, '#d9d9d9'],
  [/#ddd0b0/gi, '#d9d9d9'],
  [/rgba\(69,\s*53,\s*24/g, 'rgba(6,32,22'],
  [/rgba\(255,\s*252,\s*245/g, 'rgba(244,247,245'],
  [/rgba\(248,\s*241,\s*225/g, 'rgba(238,242,239'],
]

let changed = 0
for (const file of dirs.flatMap((d) => walk(d))) {
  if (file.includes('apply-crest-theme-colors.mjs')) continue
  if (file.includes('golfsol-premium-design.json')) continue
  let s = readFileSync(file, 'utf8')
  const orig = s
  for (const [re, rep] of CLASS_REPLACEMENTS) s = s.replace(re, rep)
  for (const [re, rep] of HEX_REPLACEMENTS) {
    if (file.includes('ge-navbar') && re.source.includes('f7f4')) continue
    s = s.replace(re, rep)
  }
  if (s !== orig) {
    writeFileSync(file, s)
    changed++
  }
}

console.log('Files updated:', changed)
