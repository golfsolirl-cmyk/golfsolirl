import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyDeskEnquiryInvoicePayment,
  deskCheckoutPaymentMetadata,
  pickUnpaidTransferForDeskInvoice
} from './desk-enquiry-invoice-link.mjs'

const booking = (overrides = {}) => ({
  id: '11111111-1111-4111-8111-111111111111',
  client_email: 'guest@example.com',
  admin_price_eur: 1500,
  payment_status: 'unpaid',
  ...overrides
})

test('links the single unpaid transfer whose quote matches the invoice', () => {
  const id = pickUnpaidTransferForDeskInvoice(
    [booking(), booking({ id: '22222222-2222-4222-8222-222222222222', admin_price_eur: 400 })],
    'Guest@Example.com',
    150000
  )
  assert.equal(id, '11111111-1111-4111-8111-111111111111')
})

test('does not link when two transfers share the invoice total', () => {
  const id = pickUnpaidTransferForDeskInvoice(
    [booking(), booking({ id: '22222222-2222-4222-8222-222222222222' })],
    'guest@example.com',
    150000
  )
  assert.equal(id, null)
})

test('does not link a different guest, a deposit, or a different total', () => {
  assert.equal(pickUnpaidTransferForDeskInvoice([booking({ client_email: 'other@example.com' })], 'guest@example.com', 150000), null)
  assert.equal(pickUnpaidTransferForDeskInvoice([booking({ payment_status: 'deposit' })], 'guest@example.com', 150000), null)
  assert.equal(pickUnpaidTransferForDeskInvoice([booking({ admin_price_eur: 20 })], 'guest@example.com', 150000), null)
  assert.equal(pickUnpaidTransferForDeskInvoice([booking({ admin_price_eur: null })], 'guest@example.com', 150000), null)
})

test('checkout metadata names the transfer only when there is no portal invoice', () => {
  const linked = deskCheckoutPaymentMetadata({
    deskQuoteId: 'quote-1',
    transferBookingId: 'transfer-1'
  })
  assert.equal(linked.clientReferenceId, 'quote-1')
  assert.deepEqual(linked.metadata, {
    desk_quote_id: 'quote-1',
    transfer_booking_id: 'transfer-1',
    payment_kind: 'full'
  })

  const portal = deskCheckoutPaymentMetadata({
    deskQuoteId: 'quote-1',
    portalInvoiceId: 'invoice-1',
    transferBookingId: 'transfer-1'
  })
  assert.equal(portal.clientReferenceId, 'invoice-1')
  assert.deepEqual(portal.metadata, {
    desk_quote_id: 'quote-1',
    portal_invoice_id: 'invoice-1'
  })
})

const fakeDb = (initial, { failMoney = false } = {}) => {
  const state = { booking: { ...initial }, events: [], writes: 0 }
  return {
    state,
    from(table) {
      if (table === 'transfer_booking_events') {
        return {
          insert(row) {
            state.events.push(row)
            return Promise.resolve({ error: null })
          }
        }
      }
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({ data: state.booking, error: null })
              }
            }
          }
        },
        update(patch) {
          const api = {
            eq() {
              return api
            },
            in() {
              return api
            },
            select() {
              return api
            },
            maybeSingle: async () => {
              if (failMoney && ('amount_received_eur' in patch || 'payment_source' in patch)) {
                return { data: null, error: { message: 'column amount_received_eur does not exist' } }
              }
              const pay = String(state.booking.payment_status || 'unpaid').toLowerCase()
              if (!['unpaid', 'deposit'].includes(pay)) {
                return { data: null, error: null }
              }
              state.booking = { ...state.booking, ...patch }
              state.writes += 1
              return { data: { id: state.booking.id }, error: null }
            }
          }
          return api
        }
      }
    }
  }
}

test('paid desk invoice marks the transfer paid and reopens an unpaid cancellation', async () => {
  const db = fakeDb({
    id: '11111111-1111-4111-8111-111111111111',
    payment_status: 'unpaid',
    status: 'cancelled',
    cancel_reason: 'unpaid_timeout',
    admin_price_eur: 1500
  })
  const result = await applyDeskEnquiryInvoicePayment(db, db.state.booking.id, {
    paidAt: '2026-11-15T12:00:00.000Z',
    paymentIntent: 'pi_123',
    sessionId: 'cs_123',
    amountEur: 1500
  })
  assert.equal(result.updated, true)
  assert.equal(result.reopened, true)
  assert.equal(db.state.booking.payment_status, 'paid')
  assert.equal(db.state.booking.status, 'pending')
  assert.equal(db.state.booking.cancel_reason, null)
  assert.equal(db.state.booking.amount_received_eur, 1500)
  assert.equal(db.state.events.length, 1)
})

test('paid desk invoice still records when the received-amount column is missing', async () => {
  const db = fakeDb(
    {
      id: '11111111-1111-4111-8111-111111111111',
      payment_status: 'unpaid',
      status: 'pending',
      cancel_reason: null,
      admin_price_eur: 1500
    },
    { failMoney: true }
  )
  const result = await applyDeskEnquiryInvoicePayment(db, db.state.booking.id, {
    paidAt: '2026-11-15T12:00:00.000Z',
    paymentIntent: 'pi_123',
    sessionId: 'cs_123',
    amountEur: 1500
  })
  assert.equal(result.updated, true)
  assert.equal(db.state.booking.payment_status, 'paid')
  assert.equal(db.state.writes, 1)
  assert.equal('amount_received_eur' in db.state.booking, false)
})
