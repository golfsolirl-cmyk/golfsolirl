import fs from 'node:fs'

const contentPath = 'src/pages/golf-experience/data/content-pages.ts'
const footerPath = 'src/data/footer-article-pages.ts'
const outPath = 'src/pages/golf-experience/data/ge-content-page-paths.ts'

const extract = (file) =>
  [...fs.readFileSync(file, 'utf8').matchAll(/^\s*'(\/[^']+)':/gm)].map((m) => m[1])

const uniq = [...new Set([...extract(contentPath), ...extract(footerPath)])].sort()

const body = `/** Path registry only — keep out of heavy page-content modules for smaller entry chunks. */
const GE_CONTENT_PAGE_PATH_SET = new Set<string>([
${uniq.map((k) => `  '${k}'`).join(',\n')}
])

export function isGeContentPagePath(path: string): boolean {
  return GE_CONTENT_PAGE_PATH_SET.has(path)
}
`

fs.writeFileSync(outPath, body)
console.log(`Wrote ${uniq.length} paths to ${outPath}`)
