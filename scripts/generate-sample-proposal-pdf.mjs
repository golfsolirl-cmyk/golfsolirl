/**
 * Writes public/samples/sample-proposal.pdf for browser preview at /proposal-pdf-sample
 * Run: node scripts/generate-sample-proposal-pdf.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createProposalPdf } from '../server/proposal-service.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'samples')
const outFile = path.join(outDir, 'sample-proposal.pdf')

const samplePayload = {
  variant: 'public',
  proposalId: 'GSI-PROP-SAMPLE',
  proposalDate: '28 Apr 2026',
  packageName: 'Transfers · Golf · Hotel',
  stayName: '4-star golf resort base — illustrative',
  transferName: 'Private AGP & golf-day transfers',
  groupSize: 6,
  nights: 5,
  rounds: 3,
  courseName: 'Valderrama, Finca Cortesín, La Cala',
  hotelName: 'Marbella area — twin / double mix',
  hotelDist: '',
  perPersonPrice: '€1,180 – €1,420 (indicative)',
  groupTotal: '€7,080 – €8,520 (indicative)',
  depositAmount: '€1,416 – €1,704 (20% indicative)',
  remainingBalance: '€5,664 – €6,816 (indicative)',
  customerFullName: 'Sample Group Lead',
  customerEmail: 'sample.client@example.com',
  customerPhoneWhatsApp: '+353 87 000 0000',
  customerInterest: 'Spring society trip, 3 rounds, airport transfers',
  enquiryReferenceId: 'GSI-SAMPLE-0001',
  quoteScopeSummary: 'Transfers · Golf · Hotel',
  enquirySubmittedDisplay: '28 Apr 2026, 10:30',
  extraTripOverviewLines: [
    'Admin-set group total: €7,500 (example split across legs for PDF spacing).',
    'Transfers (group): €1,875 — about €313 per person within leg.',
    'Golf (group): €3,750 — about €625 per person within leg.',
    'Hotel (group): €1,875 — about €313 per person within leg.'
  ]
}

mkdirSync(outDir, { recursive: true })
const { pdfBytes } = await createProposalPdf(samplePayload)
writeFileSync(outFile, Buffer.from(pdfBytes))
console.log(`Wrote ${outFile}`)
