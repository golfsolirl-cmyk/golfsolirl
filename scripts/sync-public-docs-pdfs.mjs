/**
 * Regenerates footer-linked PDFs in public/docs/ from unified enquiry generators.
 * Run: node scripts/sync-public-docs-pdfs.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docsDir = path.join(root, 'public', 'docs')

const {
  createTermsAndConditionsPdf,
  createTravellerContactsPdf,
  createPackingChecklistPdf
} = await import('../server/enquiry-form-pdfs-unified.mjs')

fs.mkdirSync(docsDir, { recursive: true })

const writes = [
  ['terms-and-conditions.pdf', createTermsAndConditionsPdf],
  ['traveller-contacts.pdf', createTravellerContactsPdf],
  ['packing-checklist.pdf', createPackingChecklistPdf]
]

for (const [name, factory] of writes) {
  const bytes = await factory()
  const fp = path.join(docsDir, name)
  fs.writeFileSync(fp, Buffer.from(bytes))
  console.log(`Wrote ${fp}`)
}
