import fs from 'node:fs'
import path from 'node:path'

const imagesDir = path.join('public', 'images')
const onDisk = new Set(fs.readdirSync(imagesDir).map((f) => f.toLowerCase()))

const refs = new Set()
const exts = new Set(['.tsx', '.ts', '.jsx', '.js', '.mjs', '.css', '.html'])

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === '.git') continue
      walk(p)
    } else if (exts.has(path.extname(ent.name))) {
      const text = fs.readFileSync(p, 'utf8')
      for (const m of text.matchAll(/['"`](\/images\/[^'"`\s?#]+)['"`]/g)) {
        refs.add(m[1])
      }
    }
  }
}

walk('src')
walk('server')
walk('public')

const missing = [...refs].filter((ref) => {
  const file = ref.replace(/^\/images\//, '')
  return !onDisk.has(file.toLowerCase())
})

console.log(`Referenced: ${refs.size}, missing on disk: ${missing.length}\n`)
for (const m of missing.sort()) console.log(m)
