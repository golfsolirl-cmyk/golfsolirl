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

for (const file of walk('src')) {
  let src = readFileSync(file, 'utf8')
  const before = src
  src = src.replace(/ \/><\/<span>/g, ' />\n        </span>')
  src = src.replace(/ \/><\/<div>/g, ' />\n        </div>')
  src = src.replace(
    /<span\s*\n[ \t]*aria-hidden="true"\s*\n[ \t]*className="pointer-events-none absolute inset-x-0 -top-px flex justify-center"\s*\n[ \t]*\/>/g,
    `<span\n              aria-hidden="true"\n              className="pointer-events-none absolute inset-x-0 -top-px flex justify-center"\n            ><div className="${GOLD}" /></span>`
  )
  if (src !== before) {
    writeFileSync(file, src)
    console.log('fixed', file)
  }
}
