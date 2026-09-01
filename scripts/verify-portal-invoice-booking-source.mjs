/**
 * Regression: paid portal invoices must create a transfer_bookings trip pass.
 * Main's check constraint omitted `portal_invoice`, so the insert failed (23514)
 * and Stripe-paid invoices with no existing transfer never activated the trip.
 * Run: npm run verify:portal-invoice-booking-source
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  insertTransferBookingFromPaidInvoiceRow,
  isTransferBookingSourceCheckFailure
} from '../server/transfer-booking-paid-invoice-insert.mjs'

const readRelative = (name) => readFileSync(fileURLToPath(new URL(`../${name}`, import.meta.url)), 'utf8')

const assert = (cond, message) => {
  if (!cond) {
    console.error(`verify-portal-invoice-booking-source: ${message}`)
    process.exit(1)
  }
}

assert(isTransferBookingSourceCheckFailure({ code: '23514' }), 'Postgres check_violation 23514 must match')
assert(
  isTransferBookingSourceCheckFailure({ message: 'new row violates check constraint "transfer_bookings_booking_source_check"' }),
  'booking_source check message must match'
)
assert(!isTransferBookingSourceCheckFailure({ code: '23505', message: 'duplicate key' }), 'unique violations must not look like source-check failures')

const priorConstraint = readRelative('supabase/migrations/20260511210000_transfer_bookings_admin_package_quote_source.sql')
assert(priorConstraint.includes("'admin_package_quote'"), 'prior constraint lists admin_package_quote')
assert(!priorConstraint.includes("'portal_invoice'"), 'prior constraint must omit portal_invoice (the production gap)')

const migration = readRelative('supabase/migrations/20260828110000_transfer_bookings_portal_invoice_source.sql')
assert(migration.includes("'portal_invoice'"), 'new migration must allow portal_invoice')
assert(migration.includes("'website_enquiry'"), 'new migration must keep website_enquiry')
assert(migration.includes("'client_dashboard'"), 'new migration must keep client_dashboard')
assert(migration.includes("'admin_package_quote'"), 'new migration must keep admin_package_quote')

const syncSrc = readRelative('server/portal-invoice-transfer-sync.mjs')
assert(syncSrc.includes("booking_source: 'portal_invoice'"), 'paid-invoice create path must label portal_invoice')
assert(syncSrc.includes('insertTransferBookingFromPaidInvoiceRow'), 'paid-invoice create must use the check-constraint fallback helper')

const helperSrc = readRelative('server/transfer-booking-paid-invoice-insert.mjs')
assert(helperSrc.includes("booking_source: 'website_enquiry'"), 'must fall back to website_enquiry when the check is still old')

const calls = []
const fakeFrom = (resultQueue) => ({
  from(table) {
    assert(table === 'transfer_bookings', 'insert must target transfer_bookings')
    return {
      insert(row) {
        calls.push({ ...row })
        return {
          select() {
            return {
              async single() {
                return resultQueue.shift() ?? { data: null, error: { message: 'unexpected extra insert' } }
              }
            }
          }
        }
      }
    }
  }
})

const row = {
  client_user_id: 'profile-1',
  booking_source: 'portal_invoice',
  payment_status: 'paid',
  admin_price_eur: 480
}

calls.length = 0
const okFirst = await insertTransferBookingFromPaidInvoiceRow(fakeFrom([{ data: { id: 'tb-1' }, error: null }]), row)
assert(okFirst.data?.id === 'tb-1', 'successful portal_invoice insert is returned')
assert(calls.length === 1 && calls[0].booking_source === 'portal_invoice', 'first attempt must use portal_invoice')

calls.length = 0
const retried = await insertTransferBookingFromPaidInvoiceRow(
  fakeFrom([
    { data: null, error: { code: '23514', message: 'violates check constraint transfer_bookings_booking_source_check' } },
    { data: { id: 'tb-fallback' }, error: null }
  ]),
  row
)
assert(retried.data?.id === 'tb-fallback', 'check failure must retry')
assert(calls.length === 2, 'exactly one retry')
assert(calls[0].booking_source === 'portal_invoice', 'retry sequence starts as portal_invoice')
assert(calls[1].booking_source === 'website_enquiry', 'retry must use an already-allowed source so the paid trip is not dropped')

calls.length = 0
const otherErr = await insertTransferBookingFromPaidInvoiceRow(
  fakeFrom([{ data: null, error: { code: '23505', message: 'duplicate key value' } }]),
  row
)
assert(otherErr.error?.code === '23505', 'non-check errors must not be retried as a different source')
assert(calls.length === 1, 'duplicate key must not retry')

console.log('verify-portal-invoice-booking-source: ok')
