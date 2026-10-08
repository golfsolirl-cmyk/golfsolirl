/**
 * Regression: unescaped ILIKE email lookups attach the wrong profile.
 * Run: npm run verify:email-exact-match
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  escapeIlikeExact,
  findProfileByEmailExact,
  normalizeEmailExact,
  sqlIlikeUnescapedMatches
} from '../server/email-exact-match.mjs'

const readServer = (name) => readFileSync(fileURLToPath(new URL(`../server/${name}`, import.meta.url)), 'utf8')

const assert = (cond, message) => {
  if (!cond) {
    console.error(`verify-email-exact-match: ${message}`)
    process.exit(1)
  }
}

assert(normalizeEmailExact('  Mary.OKeeffe@Gmail.com ') === 'mary.okeeffe@gmail.com', 'normalize lowercases and trims')

assert(
  sqlIlikeUnescapedMatches('mary_okeeffe@gmail.com', 'mary.okeeffe@gmail.com'),
  'unescaped underscore must match dotted Gmail (the production trigger)'
)
assert(
  sqlIlikeUnescapedMatches('mary_okeeffe@gmail.com', 'maryxokeeffe@gmail.com'),
  'unescaped underscore matches any single character'
)
assert(
  !sqlIlikeUnescapedMatches(escapeIlikeExact('mary_okeeffe@gmail.com'), 'mary.okeeffe@gmail.com'),
  'escaped underscore must not match a different address'
)
assert(escapeIlikeExact('mary_okeeffe@gmail.com') === 'mary\\_okeeffe@gmail.com', 'escape underscore')
assert(escapeIlikeExact('a%b@x.com') === 'a\\%b@x.com', 'escape percent')
assert(escapeIlikeExact('a*b@x.com') === 'a\\*b@x.com', 'escape PostgREST star')
assert(escapeIlikeExact('a\\b@x.com') === 'a\\\\b@x.com', 'escape backslash first')

const calls = []
const fakeAdmin = {
  from(table) {
    assert(table === 'profiles', 'lookup must target profiles')
    return {
      select(columns) {
        return {
          eq(column, value) {
            calls.push({ op: 'eq', column, value, columns })
            return {
              async maybeSingle() {
                return { data: null, error: null }
              }
            }
          },
          ilike(column, value) {
            calls.push({ op: 'ilike', column, value, columns })
            return {
              async maybeSingle() {
                return { data: { id: 'ok' }, error: null }
              }
            }
          }
        }
      }
    }
  }
}

const found = await findProfileByEmailExact(fakeAdmin, 'Mary_OKeeffe@Gmail.com', 'id, email')
assert(found.data?.id === 'ok', 'fallback escaped ILIKE is used when eq misses')
assert(calls[0]?.op === 'eq' && calls[0]?.value === 'mary_okeeffe@gmail.com', 'eq uses normalized email')
assert(calls[1]?.op === 'ilike' && calls[1]?.value === 'mary\\_okeeffe@gmail.com', 'ilike fallback is escaped')

const empty = await findProfileByEmailExact(fakeAdmin, 'not-an-email', 'id')
assert(empty.data == null, 'reject values without @')

const checkoutSrc = readServer('transfer-checkout-service.mjs')
assert(
  checkoutSrc.includes(".eq('email', uEmail)"),
  'checkout enquiry ownership must use exact email equality'
)
assert(
  !checkoutSrc.includes(".ilike('email', uEmail)"),
  'checkout enquiry ownership must not ILIKE the caller email'
)

const insertSrc = readServer('insert-transfer-booking-from-enquiry.mjs')
assert(insertSrc.includes('findProfileByEmailExact'), 'website enquiry transfer attach must use exact email helper')
assert(!insertSrc.includes(".ilike('email'"), 'website enquiry transfer attach must not raw-ilike email')

const enquirySrc = readServer('enquiry-service.mjs')
assert(enquirySrc.includes('findProfileByEmailExact'), 'website_form package attach must use exact email helper')

const invoiceSrc = readServer('portal-invoice-send-service.mjs')
assert(invoiceSrc.includes('findProfileByEmailExact'), 'portal invoice send must use exact email helper')

const quoteSrc = readServer('enquiry-admin-quote-service.mjs')
assert(quoteSrc.includes('findProfileByEmailExact'), 'enquiry admin quote must use exact email helper')

console.log('verify-email-exact-match: ok')
