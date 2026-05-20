/**
 * Point /images/*.png|jpg references at rebuilt .webp siblings when present in public/.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const publicRoot = path.join(repoRoot, 'public')
const dirs = [path.join(repoRoot, 'src'), path.join(repoRoot, 'server')]
const exts = new Set(['.ts', '.tsx', '.mjs', '.js'])

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name.startsWith('.')) continue
      walk(p, out)
    } else if (exts.has(path.extname(name))) {
      out.push(p)
    }
  }
  return out
}

const replacements = []
for (const dir of ['images', '.']) {
  const scan = dir === '.' ? publicRoot : path.join(publicRoot, dir)
  if (!fs.existsSync(scan)) continue
  const prefix = dir === '.' ? '' : 'images/'
  for (const name of fs.readdirSync(scan)) {
    if (!name.endsWith('.webp')) continue
    const base = name.replace(/-(desktop|tablet|mobile)\.webp$/, '').replace(/\.webp$/, '')
    for (const oldExt of ['.png', '.jpg', '.jpeg']) {
      const oldName = `${base}${oldExt}`
      const oldPath = `/${prefix}${oldName}`.replace(/\/+/g, '/').replace('/./', '/')
      const newPath = `/${prefix}${name}`.replace(/\/+/g, '/')
      const abs = path.join(scan, name)
      if (fs.existsSync(abs)) {
        replacements.push([oldPath, newPath])
      }
    }
  }
}

// Longest paths first to avoid partial replacements
replacements.sort((a, b) => b[0].length - a[0].length)
const unique = new Map(replacements)

let filesChanged = 0
let totalRepl = 0

for (const file of walk(dirs[0]).concat(walk(dirs[1]))) {
  let text = fs.readFileSync(file, 'utf8')
  let changed = false
  for (const [from, to] of unique) {
    if (!text.includes(from)) continue
    const next = text.split(from).join(to)
    if (next !== text) {
      text = next
      changed = true
      totalRepl += text.split(to).length - 1
    }
  }
  if (changed) {
    fs.writeFileSync(file, text)
    filesChanged += 1
  }
}

console.log(`Updated ${filesChanged} source files (${unique.size} path mappings)`)
