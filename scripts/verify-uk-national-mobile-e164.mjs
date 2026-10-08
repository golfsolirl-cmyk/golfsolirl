/**
 * Regression: UK / NI national mobiles (07…) must canonicalize to +44 7…,
 * not Irish +353 7…, or website enquiry + phone-uniqueness keys reject / split accounts.
 * Run: npm run verify:uk-national-mobile-e164
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  computePhoneUniquenessKey,
  isLikelyMobileE164,
  validateMobilePhoneInput
} from '../server/phone-e164.mjs'

const fail = (message) => {
  console.error(`verify-uk-national-mobile-e164: ${message}`)
  process.exit(1)
}

const expectE164 = (raw, expected) => {
  const got = computePhoneUniquenessKey(raw)
  if (got !== expected) {
    fail(`computePhoneUniquenessKey(${JSON.stringify(raw)}) → ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`)
  }
}

const expectOk = (raw, expected) => {
  const result = validateMobilePhoneInput(raw)
  if (!result.ok) {
    fail(`validateMobilePhoneInput(${JSON.stringify(raw)}) failed: ${result.message}`)
  }
  if (result.phoneE164 !== expected) {
    fail(`validateMobilePhoneInput(${JSON.stringify(raw)}) → ${result.phoneE164}, expected ${expected}`)
  }
  if (!isLikelyMobileE164(result.phoneE164)) {
    fail(`${result.phoneE164} should pass isLikelyMobileE164`)
  }
}

const expectReject = (raw) => {
  const result = validateMobilePhoneInput(raw)
  if (result.ok) {
    fail(`validateMobilePhoneInput(${JSON.stringify(raw)}) should reject, got ${result.phoneE164}`)
  }
}

// Advertised national format on enquiry forms — previously became +3537123456789 and failed.
expectOk('07123456789', '+447123456789')
expectOk('07 123 456 789', '+447123456789')
expectOk('+44 7123 456789', '+447123456789')
expectOk('447123456789', '+447123456789')
expectOk('+44 (0) 7123 456789', '+447123456789')

expectE164('07123456789', '+447123456789')
expectE164('07 123 456 789', '+447123456789')
expectE164('+44 (0) 7123 456789', '+447123456789')

// Irish mobiles must still map to +353, not +44
expectOk('0871234567', '+353871234567')
expectOk('087 123 4567', '+353871234567')
expectOk('+353 87 123 4567', '+353871234567')

// Landlines / too-short still rejected
expectReject('0123456789')
expectReject('07123')

const clientSource = readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/lib/phone-mobile.ts'),
  'utf8'
)
if (!clientSource.includes("/^07\\d{9}$/.test(digits)")) {
  fail('src/lib/phone-mobile.ts is missing the UK 07 national-mobile rule (keep in sync with server/phone-e164.mjs)')
}
if (!clientSource.includes("/^4407\\d{9}$/.test(digits)")) {
  fail('src/lib/phone-mobile.ts is missing the +44 (0) 7 trunk-zero rule (keep in sync with server/phone-e164.mjs)')
}

console.log('verify-uk-national-mobile-e164: ok')
