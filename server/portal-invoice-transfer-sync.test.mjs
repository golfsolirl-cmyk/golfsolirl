import assert from 'node:assert/strict'
import test from 'node:test'
import {
  paidInvoiceTransferReopenPatch,
  syncTransferBookingFromPaidPortalInvoice
} from './portal-invoice-transfer-sync.mjs'

test('a matching paid invoice reopens an unpaid-timeout cancellation', () => {
  assert.deepEqual(
    paidInvoiceTransferReopenPatch(
      { status: 'cancelled', cancel_reason: 'unpaid_timeout' },
      'reference'
    ),
    { status: 'pending', cancel_reason: null }
  )
})

test('a profile-only match or a driver decline stays cancelled', () => {
  const cancelled = { status: 'cancelled', cancel_reason: 'unpaid_timeout' }
  assert.deepEqual(paidInvoiceTransferReopenPatch(cancelled, 'profile'), {})
  assert.deepEqual(
    paidInvoiceTransferReopenPatch({ status: 'cancelled', cancel_reason: 'no_driver_admin' }, 'reference'),
    {}
  )
  assert.deepEqual(paidInvoiceTransferReopenPatch({ status: 'pending', cancel_reason: null }, 'reference'), {})
})

const invoice = {
  id: 'inv-1',
  status: 'paid',
  amount_cents: 150000,
  enquiry_id: null,
  enquiry_reference_id: 'GSI-9',
  profile_id: 'profile-1',
  stripe_payment_intent_id: 'pi_1',
  stripe_checkout_session_id: 'cs_1',
  paid_at: '2026-11-18T12:00:00.000Z'
}

const fakeDb = (booking, invoiceRow = invoice) => {
  const updates = []
  const state = { booking: { ...booking } }
  const matches = (filters) =>
    filters.every((filter) => {
      const value = state.booking[filter.col]
      if (filter.op === 'eq') return value === filter.val
      if (filter.op === 'ilike') return String(value ?? '').toLowerCase() === String(filter.val).toLowerCase()
      if (filter.op === 'in') return filter.val.map((item) => String(item).toLowerCase()).includes(String(value ?? '').toLowerCase())
      return false
    })

  const api = {
    updates,
    state,
    storage: {
      from() {
        return { upload: async () => ({ error: { message: 'storage skipped' } }) }
      }
    },
    from(table) {
      const filters = []
      let patch = null
      const chain = {
        select() {
          return chain
        },
        eq(col, val) {
          filters.push({ op: 'eq', col, val })
          return chain
        },
        ilike(col, val) {
          filters.push({ op: 'ilike', col, val })
          return chain
        },
        in(col, val) {
          filters.push({ op: 'in', col, val })
          return chain
        },
        order() {
          return chain
        },
        limit() {
          return chain
        },
        delete() {
          return chain
        },
        update(next) {
          patch = next
          return chain
        },
        insert() {
          return Promise.resolve({ error: null })
        },
        maybeSingle() {
          if (table === 'portal_invoices') {
            return Promise.resolve({ data: invoiceRow, error: null })
          }
          if (table !== 'transfer_bookings') {
            return Promise.resolve({ data: null, error: null })
          }
          if (!matches(filters)) {
            return Promise.resolve({ data: null, error: null })
          }
          if (patch) {
            Object.assign(state.booking, patch)
            updates.push({ ...patch })
            patch = null
            return Promise.resolve({ data: { id: state.booking.id }, error: null })
          }
          return Promise.resolve({ data: { ...state.booking }, error: null })
        }
      }
      return chain
    }
  }
  return api
}

const cancelledTrip = {
  id: 'booking-1',
  payment_status: 'unpaid',
  admin_price_eur: 1500,
  deposit_percent: 20,
  client_user_id: 'profile-1',
  enquiry_reference_id: 'GSI-9',
  status: 'cancelled',
  cancel_reason: 'unpaid_timeout'
}

test('paying the enquiry invoice reopens the transfer the sweep cancelled', async () => {
  const db = fakeDb(cancelledTrip)
  const result = await syncTransferBookingFromPaidPortalInvoice(db, invoice.id, { amountEur: 1500 })
  assert.equal(result.synced, true)
  assert.equal(result.reopened, true)
  assert.equal(db.updates[0].payment_status, 'paid')
  assert.equal(db.updates[0].status, 'pending')
  assert.equal(db.updates[0].cancel_reason, null)
  assert.equal(db.updates[0].amount_received_eur, 1500)
  assert.equal(db.state.booking.status, 'pending')
})

test('paying a different invoice does not reopen another cancelled transfer on the same profile', async () => {
  const db = fakeDb(cancelledTrip, { ...invoice, enquiry_reference_id: 'GSQ-OTHER' })
  const result = await syncTransferBookingFromPaidPortalInvoice(db, invoice.id, { amountEur: 1500 })
  assert.equal(result.synced, true)
  assert.equal(result.reopened, false)
  assert.equal(db.updates[0].payment_status, 'paid')
  assert.equal(db.updates[0].status, undefined)
  assert.equal(db.state.booking.status, 'cancelled')
})

test('a card payment that was saved as paid still reopens the cancelled trip', async () => {
  const db = fakeDb({ ...cancelledTrip, payment_status: 'paid', amount_received_eur: 1500 })
  const result = await syncTransferBookingFromPaidPortalInvoice(db, invoice.id)
  assert.equal(result.reason, 'already_paid')
  assert.equal(result.reopened, true)
  assert.equal(db.updates.length, 1)
  assert.equal(db.updates[0].status, 'pending')
  assert.equal(db.updates[0].payment_status, undefined)
  assert.equal(db.state.booking.cancel_reason, null)
})
