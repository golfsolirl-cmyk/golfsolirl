/**
 * Regression check: enquiry-service must import PDF helpers (not only re-export them)
 * or handleEnquirySubmission / handleTermsEmailRequest throw "X is not defined" at runtime.
 * Run: npm run verify:enquiry-pdf-exports
 */
const m = await import('../server/enquiry-service.mjs')

const need = [
  'createBrandedEnquiryPdf',
  'createTermsAndConditionsPdf',
  'createTravellerContactsPdf',
  'createPackingChecklistPdf',
  'handleEnquirySubmission',
  'handleTermsEmailRequest'
]

const bad = need.filter((k) => typeof m[k] !== 'function')
if (bad.length) {
  console.error('verify-enquiry-pdf-exports: missing or non-function exports:', bad.join(', '))
  process.exit(1)
}

console.log('verify-enquiry-pdf-exports: ok')
