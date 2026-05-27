/**
 * Generate sample PDFs for every document type used across the site.
 * Output: public/pdf-samples/ with categorised subfolders.
 *
 * Run:  node scripts/generate-all-pdf-samples.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outRoot = path.join(root, 'public', 'pdf-samples')

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true })

const write = (folder, filename, bytes) => {
  const dir = path.join(outRoot, folder)
  ensureDir(dir)
  const fp = path.join(dir, filename)
  fs.writeFileSync(fp, Buffer.from(bytes))
  console.log(`  ✓ ${folder}/${filename}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ENQUIRY ACKNOWLEDGEMENT PACK (email attachments)
// ─────────────────────────────────────────────────────────────────────────────
async function generateEnquiryPack() {
  console.log('\n📄 Category: Enquiry Pack (email attachments)')

  const {
    createBrandedEnquiryPdf,
    createTermsAndConditionsPdf,
    createTravellerContactsPdf,
    createPackingChecklistPdf
  } = await import('../server/enquiry-form-pdfs-unified.mjs')

  const mockPayload = {
    enquiryReferenceId: 'GSOL-SAMPLE-001',
    name: 'Padraig Harrington',
    email: 'padraig@example.com',
    phoneWhatsApp: '+353 87 000 0000',
    preferredDates: '15-20 September 2026',
    groupSize: '8',
    golfCourses: 'Valderrama, La Cala (Asia), Finca Cortesin',
    accommodation: 'Hotel preferred — Marbella area',
    transfers: 'Airport + daily golf course transfers',
    additionalNotes: 'We have 4 sets of rental clubs needed. One wheelchair user in the group.',
    submittedAt: new Date().toISOString()
  }

  const enquiryBytes = await createBrandedEnquiryPdf(mockPayload)
  write('1-enquiry-pack', 'enquiry-acknowledgement.pdf', enquiryBytes)

  const termsBytes = await createTermsAndConditionsPdf()
  write('1-enquiry-pack', 'terms-and-conditions.pdf', termsBytes)

  const contactsBytes = await createTravellerContactsPdf()
  write('1-enquiry-pack', 'traveller-contacts.pdf', contactsBytes)

  const packingBytes = await createPackingChecklistPdf()
  write('1-enquiry-pack', 'packing-checklist.pdf', packingBytes)
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. FORMAL PROPOSAL
// ─────────────────────────────────────────────────────────────────────────────
async function generateProposal() {
  console.log('\n📄 Category: Formal Proposal')

  const { createProposalPdf } = await import('../server/proposal-service.mjs')

  const payload = {
    variant: 'public',
    proposalId: 'GSI-PROP-SAMPLE',
    proposalDate: '18 May 2026',
    packageName: 'Transfers · Golf · Hotel',
    stayName: '4-star golf resort — Marbella',
    transferName: 'Private AGP & golf-day transfers',
    groupSize: 6,
    nights: 5,
    rounds: 3,
    courseName: 'Valderrama, Finca Cortesín, La Cala',
    hotelName: 'Marbella area — twin / double mix',
    hotelDist: '',
    perPersonPrice: '€1,180 – €1,420',
    groupTotal: '€7,080 – €8,520',
    depositAmount: '€1,416 – €1,704 (20%)',
    remainingBalance: '€5,664 – €6,816',
    customerFullName: 'Sean Murphy',
    customerEmail: 'sean.murphy@example.com',
    customerPhoneWhatsApp: '+353 87 123 4567',
    customerInterest: 'Spring society trip — 3 rounds, airport transfers, hotel',
    enquiryReferenceId: 'GSOL-SAMPLE-001',
    quoteScopeSummary: 'Transfers · Golf · Hotel',
    enquirySubmittedDisplay: '18 May 2026, 10:30',
    extraTripOverviewLines: [
      'Admin-set group total: €7,500',
      'Transfers (group): €1,875',
      'Golf (group): €3,750',
      'Hotel (group): €1,875'
    ]
  }

  const { pdfBytes } = await createProposalPdf(payload)
  write('2-formal-proposal', 'formal-proposal.pdf', pdfBytes)
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TRANSFER PORTAL BUNDLE (client paper trail)
// ─────────────────────────────────────────────────────────────────────────────
async function generateTransferPortalBundle() {
  console.log('\n📄 Category: Transfer Portal (client paper trail)')

  const {
    createTransferFormSubmissionPdf,
    createTransferVatQuotePdf,
    createTermsSummaryPdf,
    createTransferPaymentReceiptPdf
  } = await import('../server/transfer-portal-pdf-bundle.mjs')

  const mockBooking = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    client_user_id: 'user-sample-001',
    client_email: 'sean.murphy@example.com',
    pickup_label: 'Malaga Airport (AGP)',
    dropoff_label: 'Hotel Puente Romano, Marbella',
    scheduled_at: '2026-09-15T14:30:00Z',
    client_timing_note: 'Flight EI582 lands 14:05 — please allow 30 min for bags',
    enquiry_reference_id: 'GSOL-SAMPLE-001',
    booking_source: 'website_enquiry',
    client_display_name: 'Sean Murphy',
    client_phone: '+353 87 123 4567',
    package_build_id: null,
    admin_price_eur: 185,
    admin_price_vat_treatment: 'tourism',
    payment_status: 'unpaid'
  }

  const formBytes = await createTransferFormSubmissionPdf({
    booking: mockBooking,
    packageBuild: null,
    profileName: 'Sean Murphy',
    profileEmail: 'sean.murphy@example.com'
  })
  write('3-transfer-portal-paper-trail', 'original-request-snapshot.pdf', formBytes)

  const vatBytes = await createTransferVatQuotePdf({
    booking: mockBooking,
    profileName: 'Sean Murphy',
    profileEmail: 'sean.murphy@example.com',
    accountRef: 'GSOL-SAMPLE-001',
    siteOrigin: 'https://golfsolirl.com'
  })
  write('3-transfer-portal-paper-trail', 'transfer-vat-quote.pdf', vatBytes)

  const termsBytes = await createTermsSummaryPdf()
  write('3-transfer-portal-paper-trail', 'terms-summary.pdf', termsBytes)

  const depositBytes = await createTransferPaymentReceiptPdf({
    booking: { ...mockBooking, payment_status: 'deposit' },
    profileName: 'Sean Murphy',
    profileEmail: 'sean.murphy@example.com',
    accountRef: 'GSOL-SAMPLE-001',
    amountChargedEur: 55.50,
    receiptType: 'deposit',
    stripeSessionId: 'cs_sample_deposit'
  })
  write('3-transfer-portal-paper-trail', 'deposit-receipt.pdf', depositBytes)

  const paidBytes = await createTransferPaymentReceiptPdf({
    booking: { ...mockBooking, payment_status: 'paid' },
    profileName: 'Sean Murphy',
    profileEmail: 'sean.murphy@example.com',
    accountRef: 'GSOL-SAMPLE-001',
    amountChargedEur: 185,
    receiptType: 'paid_in_full',
    stripeSessionId: 'cs_sample_paid'
  })
  write('3-transfer-portal-paper-trail', 'paid-in-full-confirmation.pdf', paidBytes)
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PORTAL INVOICE
// ─────────────────────────────────────────────────────────────────────────────
async function generatePortalInvoice() {
  console.log('\n📄 Category: Portal Invoice')

  const { buildPortalInvoicePdfBytes } = await import('../server/portal-invoice-pdf.mjs')

  const bytes = await buildPortalInvoicePdfBytes({
    invoiceNumber: 'INV-2026-0042',
    enquiryReferenceId: 'GSOL-SAMPLE-001',
    accountReferenceDisplay: 'GSOL-SAMPLE-001',
    clientName: 'Sean Murphy',
    clientEmail: 'sean.murphy@example.com',
    amountCents: 18500,
    issuedAtIso: new Date().toISOString()
  })
  write('4-portal-invoice', 'trip-invoice.pdf', bytes)
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TRANSFER REFUND CONFIRMATION
// ─────────────────────────────────────────────────────────────────────────────
async function generateRefund() {
  console.log('\n📄 Category: Transfer Refund')

  const { buildTransferRefundPdfBytes } = await import('../server/transfer-refund-pdf.mjs')

  const bytes = await buildTransferRefundPdfBytes({
    customerLabel: 'Sean Murphy',
    route: 'Malaga Airport (AGP) - Hotel Puente Romano',
    bookingId: 'a1b2c3d4',
    refundAmountEur: 55.50,
    refundKind: 'partial',
    cumulativeRefundedEur: 55.50,
    stripeRefundId: 're_sample_123456',
    stripePaymentIntentId: 'pi_sample_789012'
  })
  write('5-transfer-refund', 'refund-confirmation.pdf', bytes)
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. HOMEPAGE BRANDED CLIENT DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
async function generateHomepageBranded() {
  console.log('\n📄 Category: Homepage Branded Client Document')

  const { buildHomepageBrandedClientPdfSampleBytes } = await import('../server/homepage-branded-client-pdf.mjs')

  const bytes = await buildHomepageBrandedClientPdfSampleBytes()
  write('6-homepage-branded-document', 'homepage-client-document.pdf', bytes)
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. UNIFIED TEMPLATE SAMPLE (design reference)
// ─────────────────────────────────────────────────────────────────────────────
async function generateUnifiedSample() {
  console.log('\n📄 Category: Unified Template (design reference)')

  const { buildGsolUnifiedPdfTemplateSampleBytes } = await import('../server/gsol-unified-pdf-template.mjs')

  const bytes = await buildGsolUnifiedPdfTemplateSampleBytes()
  write('7-unified-template-reference', 'unified-document-template.pdf', bytes)
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. BRANDED LAYOUT SAMPLE (design reference)
// ─────────────────────────────────────────────────────────────────────────────
async function generateBrandedLayoutSample() {
  console.log('\n📄 Category: Branded Layout (design reference)')

  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const { pdfEmailTheme, brandedPdfAssetPaths } = await import('../server/pdf-email-brand.mjs')

  const t = pdfEmailTheme
  const W = 595.28
  const H = 841.89
  const m = 48

  const doc = await PDFDocument.create()
  const page = doc.addPage([W, H])
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const font = await doc.embedFont(StandardFonts.Helvetica)

  const logoBytes = fs.readFileSync(brandedPdfAssetPaths.homepageCrest)
  const logo = await doc.embedPng(logoBytes)
  const logoH = 62
  const logoW = (logo.width / logo.height) * logoH

  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: t.cream })
  page.drawRectangle({ x: 0, y: H - 84, width: W, height: 84, color: t.green })
  page.drawRectangle({ x: 0, y: H - 84, width: W, height: 3, color: t.gold })
  page.drawText('Golf Sol Ireland', { x: m + 8, y: H - m - 14, size: 20, font: fontBold, color: t.white })
  page.drawText('Branded layout sample (PDF)', { x: m + 8, y: H - m - 40, size: 11, font, color: rgb(0.92, 0.95, 0.93) })
  page.drawImage(logo, { x: W - m - logoW, y: H - 84 + (84 - logoH) / 2, width: logoW, height: logoH })

  let y = H - 140
  page.drawText('SAMPLE-REF-2026', { x: m, y, size: 10, font: fontBold, color: t.muted })
  y -= 24
  page.drawText('This is the branded layout style used across all PDFs.', { x: m, y, size: 12, font, color: t.ink })
  y -= 18
  page.drawText('Green header bar, gold accent, homepage crest on right, cream page fill.', { x: m, y, size: 11, font, color: t.muted })

  page.drawRectangle({ x: m, y: 52, width: W - 2 * m, height: 0.65, color: t.sand })
  page.drawText('Golf Sol Ireland · Irish-owned Costa del Sol golf travel', { x: m, y: 40, size: 9, font, color: t.muted })

  const bytes = await doc.save()
  write('8-branded-layout-reference', 'branded-layout-sample.pdf', bytes)
}

// ─────────────────────────────────────────────────────────────────────────────
// RUN ALL
// ─────────────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════')
console.log(' GOLF SOL IRELAND — PDF DOCUMENT SAMPLES')
console.log(' Generating all document types into public/pdf-samples/')
console.log('═══════════════════════════════════════════════════════════')

// Clean output
if (fs.existsSync(outRoot)) {
  fs.rmSync(outRoot, { recursive: true })
}
ensureDir(outRoot)

const runners = [
  generateEnquiryPack,
  generateProposal,
  generateTransferPortalBundle,
  generatePortalInvoice,
  generateRefund,
  generateHomepageBranded,
  generateUnifiedSample,
  generateBrandedLayoutSample
]

let success = 0
let failed = 0

for (const fn of runners) {
  try {
    await fn()
    success++
  } catch (e) {
    failed++
    console.error(`  ✗ ${fn.name} failed:`, e.message)
  }
}

// Write an index file for quick reference
const indexContent = `# PDF Document Samples — Golf Sol Ireland

Generated: ${new Date().toLocaleString('en-IE', { dateStyle: 'full', timeStyle: 'short' })}

## Folder Structure

### 1-enquiry-pack/
Email attachments sent when a customer submits an enquiry form.
- **enquiry-acknowledgement.pdf** — Summary of what the customer submitted
- **terms-and-conditions.pdf** — Full T&Cs document
- **traveller-contacts.pdf** — Costa del Sol emergency/useful contacts
- **packing-checklist.pdf** — Golf trip packing list

### 2-formal-proposal/
Sent by admin to clients as a detailed pricing proposal.
- **formal-proposal.pdf** — Multi-page proposal with fleet image, pricing, terms

### 3-transfer-portal-paper-trail/
Stored in Supabase Storage; shown on client dashboard under "Your paper trail".
- **original-request-snapshot.pdf** — What the client originally requested
- **transfer-vat-quote.pdf** — Quoted price with full VAT breakdown
- **terms-summary.pdf** — Short terms summary (1 page)
- **deposit-receipt.pdf** — After deposit card payment via Stripe
- **paid-in-full-confirmation.pdf** — After full payment via Stripe

### 4-portal-invoice/
Trip invoice sent to client from admin dashboard.
- **trip-invoice.pdf** — Formal invoice with amount, reference, client details

### 5-transfer-refund/
Generated when admin processes a partial or full refund.
- **refund-confirmation.pdf** — Refund amount, Stripe references, route

### 6-homepage-branded-document/
Branded trip overview document (homepage-style layout).
- **homepage-client-document.pdf** — Visual overview of the client's trip

### 7-unified-template-reference/
Design reference showing the unified PDF shell layout.
- **unified-document-template.pdf** — Logo, headers, key-value tables, gold rules

### 8-branded-layout-reference/
Design reference showing the branded header bar layout.
- **branded-layout-sample.pdf** — Green bar + crest + cream page style

---

## Client-Side (Browser) PDFs (not generated here)

These are created in the browser using jsPDF + html2canvas or pdf-lib:
- **Quote preview** — Rasterised page capture of the quote page
- **Proposal template export** — DOM-to-PDF of the proposal preview
- **Business cards** — Front/back card layouts + proof sheets
- **Transfer quote/invoice** — pdf-lib VAT summary (same design as server version)
- **Generic DOM export** — Any page section saved as PDF

These require a running browser and cannot be generated as static samples.
`

fs.writeFileSync(path.join(outRoot, 'README.md'), indexContent)

console.log('\n═══════════════════════════════════════════════════════════')
console.log(` Done: ${success} categories generated, ${failed} failed`)
console.log(` Output: public/pdf-samples/`)
console.log('═══════════════════════════════════════════════════════════\n')
