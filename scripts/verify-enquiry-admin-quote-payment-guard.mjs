/**
 * Regression: enquiry admin quote must not reset collected payments or open a second Stripe rail.
 * Run: npm run verify:enquiry-admin-quote-payment-guard
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { enquiryAdminQuoteCollectedPaymentLockMessage } from '../server/enquiry-admin-quote-payment-lock.mjs'

assert.equal(enquiryAdminQuoteCollectedPaymentLockMessage('unpaid'), null)
assert.equal(enquiryAdminQuoteCollectedPaymentLockMessage(null), null)
assert.equal(enquiryAdminQuoteCollectedPaymentLockMessage(undefined), null)
assert.equal(enquiryAdminQuoteCollectedPaymentLockMessage(''), null)
assert.equal(enquiryAdminQuoteCollectedPaymentLockMessage('pending'), null)

const paidLock = enquiryAdminQuoteCollectedPaymentLockMessage('paid')
assert.equal(typeof paidLock, 'string')
assert.match(String(paidLock), /fully paid/i)
assert.match(String(paidLock), /pay again/i)

const depositLock = enquiryAdminQuoteCollectedPaymentLockMessage('DEPOSIT')
assert.equal(typeof depositLock, 'string')
assert.match(String(depositLock), /deposit/i)
assert.match(String(depositLock), /charge the guest again/i)

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const service = readFileSync(join(root, 'server/enquiry-admin-quote-service.mjs'), 'utf8')
const quoteFn = service.split('export const handleEnquiryAdminMessage')[0]

assert.match(quoteFn, /from '\.\/enquiry-admin-quote-payment-lock\.mjs'/)
assert.match(quoteFn, /enquiryAdminQuoteCollectedPaymentLockMessage\(booking\.payment_status\)/)
assert.match(quoteFn, /\.eq\('payment_status', 'unpaid'\)/)
assert.doesNotMatch(quoteFn, /handlePortalInvoiceSend/)
assert.doesNotMatch(quoteFn, /from '\.\/portal-invoice-send-service\.mjs'/)

const queue = readFileSync(join(root, 'src/components/admin-enquiry-card-queue.tsx'), 'utf8')
assert.match(queue, /quoteLocked/)
assert.match(queue, /already fully paid/)
assert.doesNotMatch(queue, /status: 'sent', amount_cents: Math\.round\(parsed \* 100\)/)

console.log('verify-enquiry-admin-quote-payment-guard: ok')
