#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'src')
const GOLD =
  'mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent'

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith('.tsx')) out.push(p)
  }
  return out
}

const rules = [
  [
    /\n[ \t]*<div\s*\n[ \t]*aria-hidden="true"\s*\n[ \t]*className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-700\/\d+ to-transparent"\s*\n[ \t]*\/>/g,
    ''
  ],
  [
    /\n[ \t]*<div\s+className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-700\/\d+ to-transparent"\s+aria-hidden\s*\/>/g,
    ''
  ],
  [
    /mx-auto mt-(\d+) block h-\[3px\] w-24 rounded-full bg-gradient-to-r from-transparent via-brand-700 to-transparent/g,
    `mx-auto mt-$1 h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent`
  ],
  [
    /mx-auto mt-(\d+) block h-\[3px\] w-24 rounded-full bg-gradient-to-r from-transparent via-\[#f4dfa6\] to-transparent/g,
    `mx-auto mt-$1 h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent`
  ],
  [
    /mt-(\d+) block h-\[3px\] w-20 rounded-full bg-gradient-to-r from-transparent via-\[#f4dfa6\] to-transparent/g,
    `mt-$1 h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent`
  ],
  [
    /mt-(\d+) block h-\[2px\] w-20 origin-left rounded-full bg-gradient-to-r from-brand-800 via-brand-600 to-transparent/g,
    `mt-$1 mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent`
  ],
  [
    /className="pointer-events-none absolute inset-x-\d+ top-0 h-px bg-gradient-to-r from-transparent via-brand-700(?:\/\d+)? to-transparent"/g,
    `className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"`
  ],
  [
    /className="pointer-events-none absolute inset-x-\[[^\]]+\] top-0 h-px bg-gradient-to-r from-transparent via-brand-700\/\d+ to-transparent"/g,
    `className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"`
  ],
  [
    /className="pointer-events-none absolute inset-x-\[[^\]]+\] top-0 h-px bg-gradient-to-r from-transparent via-brand-700\/\d+ to-transparent"/g,
    `className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"`
  ],
  [
    /className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-700 to-transparent"/g,
    `className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"`
  ],
  [
    /className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-700\/\d+ to-transparent"/g,
    `className="pointer-events-none absolute inset-x-0 -top-px flex justify-center"`
  ],
  [
    /className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-700\/\d+ to-transparent opacity-70"/g,
    `className="${GOLD}"`
  ],
  [
    /className="pointer-events-none absolute inset-x-\[[^\]]+\] top-0 h-px bg-gradient-to-r from-transparent via-brand-700\/\d+ to-transparent"/g,
    `className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"`
  ],
  [
    /className="pointer-events-none absolute inset-x-\[[^\]]+\] top-0 h-px bg-gradient-to-r from-transparent via-brand-700\/90 to-transparent"/g,
    `className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"`
  ],
  [
    /className="pointer-events-none absolute inset-x-\[[^\]]+\] top-0 h-px bg-gradient-to-r from-transparent via-brand-700\/70 to-transparent"/g,
    `className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"`
  ],
  [
    /className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-\[#d4a843\]\/70 to-transparent"/g,
    `className="${GOLD}"`
  ],
  [
    /\n[ \t]*<div\s*\n[ \t]*aria-hidden="true"\s*\n[ \t]*className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gs-green\/\d+ to-transparent"\s*\n[ \t]*\/>/g,
    ''
  ]
]

/** After flex justify-center wrappers, inject gold child if missing */
function injectGoldChild(src) {
  return src.replace(
    /(<(?:div|span)\s*\n[ \t]*aria-hidden="true"\s*\n[ \t]*className="pointer-events-none absolute inset-x-0 (?:-top-px |)top-0 flex justify-center"\s*\n[ \t]*\/>)/g,
    `$1`.replace(
      '\/>',
      `>\n          <div className="${GOLD}" />\n        </div>`
    )
  )
}

// Fix self-closing flex wrappers -> opening tag + child
function fixFlexWrappers(src) {
  return src.replace(
    /(<(?:div|span))(\s*\n[ \t]*aria-hidden="true"\s*\n[ \t]*className="pointer-events-none absolute inset-x-0 (?:-top-px |)top-0 flex justify-center"\s*\n[ \t]*)\/>/g,
    `$1$2><div className="${GOLD}" /></$1>`
  ).replace(/<\/div>\s*<\/div>/g, (m) => m) // noop
}

let count = 0
for (const file of walk(root)) {
  let src = readFileSync(file, 'utf8')
  const before = src
  for (const [re, rep] of rules) src = src.replace(re, rep)
  src = fixFlexWrappers(src)
  // span flex wrappers
  src = src.replace(
    /(<span\s*\n[ \t]*aria-hidden="true"\s*\n[ \t]*className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"\s*\n[ \t]*)\/>/g,
    `$1><div className="${GOLD}" /></span>`
  )
  if (src !== before) {
    writeFileSync(file, src)
    count++
    console.log(relative(root, file))
  }
}
console.log(`Updated ${count} files`)
