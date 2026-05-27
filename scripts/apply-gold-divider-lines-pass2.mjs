#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

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

const topLine =
  /className="pointer-events-none absolute inset-x-[^"]+ top-0[^"]*h-px bg-gradient-to-r from-transparent via-\[#f4dfa6\]\/\d+ to-transparent"/g

for (const file of walk('src')) {
  let src = readFileSync(file, 'utf8')
  const before = src
  src = src.replace(topLine, 'className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"')
  src = src.replace(
    /(<(?:div|span)\s*\n[ \t]*aria-hidden="true"\s*\n[ \t]*className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"\s*\n[ \t]*)\/>/g,
    `$1><div className="${GOLD}" /></$1`.replace(/<\/>$/, '')
  )
  // simpler: after flex justify-center self-closing tags add child
  src = src.replace(
    /(className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"\s*\n[ \t]*)\/>/gm,
    `$1><div className="${GOLD}" /></div>`
  )
  src = src.replace(
    /(className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"\s*\n[ \t]*><div className="${GOLD.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" \/><\/)(div|span)/g,
    `$1$2`
  )
  if (src !== before) {
    writeFileSync(file, src)
    console.log('updated', file)
  }
}

// fix span wrappers wrongly closed as div
for (const file of walk('src')) {
  let src = readFileSync(file, 'utf8')
  const before = src
  src = src.replace(
    /<span\s*\n([ \t]*aria-hidden="true"\s*\n[ \t]*className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"\s*\n[ \t]*><div className="mx-auto h-px w-\[min\(100%,14rem\)\][^"]+" \/><\/)(div)/g,
    '<span\n$1span'
  )
  if (src !== before) {
    writeFileSync(file, src)
    console.log('span-fix', file)
  }
}

console.log('done')
