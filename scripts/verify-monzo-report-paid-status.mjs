/**
 * “I’ve paid” on the Monzo pay page must not clear a payment the desk already recorded.
 * Run: node scripts/verify-monzo-report-paid-status.mjs
 *
 * Trigger: admin marks the enquiry paid_in_full (or deposit_received) from the bank,
 * while the desk quote is still unpaid. The customer then taps “I’ve paid” on /pay/:token.
 * The old handler wrote payment_status = awaiting_payment and the trip looked unpaid again.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { paymentStatusAfterCustomerReported } from '../server/monzo-pay-service.mjs'

const assert = (cond, message) => {
  if (!cond) {
    console.error(`verify-monzo-report-paid-status: ${message}`)
    process.exit(1)
  }
}

assert(paymentStatusAfterCustomerReported('paid_in_full') === 'paid_in_full', 'paid in full stays paid')
assert(paymentStatusAfterCustomerReported('deposit_received') === 'deposit_received', 'deposit stays recorded')
assert(paymentStatusAfterCustomerReported('refunded') === 'refunded', 'refund stays recorded')
assert(paymentStatusAfterCustomerReported('awaiting_payment') === 'awaiting_payment', 'unpaid stays awaiting')
assert(paymentStatusAfterCustomerReported(null) === 'awaiting_payment', 'missing status becomes awaiting')
assert(paymentStatusAfterCustomerReported('') === 'awaiting_payment', 'blank status becomes awaiting')
assert(paymentStatusAfterCustomerReported('customer_reported') === 'awaiting_payment', 'unknown status becomes awaiting')

const src = readFileSync(fileURLToPath(new URL('../server/monzo-pay-service.mjs', import.meta.url)), 'utf8')
const reportStart = src.indexOf("if (action === 'report_paid')")
const reportEnd = src.indexOf("if (action === 'email_details')")
assert(reportStart > 0 && reportEnd > reportStart, 'report_paid block exists')
const report = src.slice(reportStart, reportEnd)
assert(report.includes('paymentStatusAfterCustomerReported'), 'report_paid uses the preserve helper')
assert(!report.includes("payment_status: 'awaiting_payment'"), 'report_paid must not force awaiting_payment')

console.log('verify-monzo-report-paid-status: ok')
