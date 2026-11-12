import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyDeskInvoiceTransferPayment,
  deskInvoiceCheckoutRefs,
  deskInvoiceMayLinkTransfer
} from './desk-invoice-transfer-link.mjs'

const booking = {
  id: '11111111-1111-4111-8111-111111111111',
  client_email: 'pat@example.com',
  admin_price_eur: 1200,
  payment_status: 'unpaid',
  status: 'pending',
  cancel_reason: null
}

test('links an unpaid transfer only when the guest and the total match the invoice', () => {
  assert.equal(deskInvoiceMayLinkTransfer(booking, 'Pat@Example.com', 120000), true)
  assert.equal(deskInvoiceMayLinkTransfer(booking, 'other@example.com', 120000), false)
  assert.equal(deskInvoiceMayLinkTransfer({ ...booking, payment_status: 'deposit' }, 'pat@example.com', 120000), false)
  assert.equal(deskInvoiceMayLinkTransfer({ ...booking, payment_status: 'paid' }, 'pat@example.com', 120000), false)
  assert.equal(deskInvoiceMayLinkTransfer(booking, 'pat@example.com', 40000), false)
})

test('checkout metadata points at the transfer only when there is no portal invoice', () => {
  const linked = deskInvoiceCheckoutRefs({
    deskQuoteId: 'quote-1',
    transferBookingId: booking.id
  })
  assert.equal(linked.clientReferenceId, 'quote-1')
  assert.equal(linked.metadata.transfer_booking_id, booking.id)
  assert.equal(linked.metadata.payment_kind, 'full')
  assert.equal(linked.metadata.portal_invoice_id, undefined)

  const portal = deskInvoiceCheckoutRefs({
    deskQuoteId: 'quote-1',
    portalInvoiceId: 'inv-1',
    transferBookingId: booking.id
  })
  assert.equal(portal.clientReferenceId, 'inv-1')
  assert.equal(portal.metadata.portal_invoice_id, 'inv-1')
  assert.equal(portal.metadata.transfer_booking_id, undefined)
})

const fakeSupabase = (row, { failMoney = false } = {}) => {
  const updates = []
  const events = []
  const client = {
    updates,
    events,
    from(table) {
      return {
        select() {
          return {
            eq() {
              return { maybeSingle: async () => ({ data: row, error: null }) }
            }
          }
        },
        update(patch) {
          return {
            eq() {
              return {
                in() {
                  return {
                    select() {
                      return {
                        maybeSingle: async () => {
                          if (failMoney && Object.prototype.hasOwnProperty.call(patch, 'payment_source')) {
                            return { data: null, error: { message: 'column payment_source does not exist' } }
                          }
                          updates.push(patch)
                          return { data: { id: row.id }, error: null }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        insert(payload) {
          events.push({ table, payload })
          return Promise.resolve({ error: null })
        }
      }
    }
  }
  return client
}

test('paid desk invoice marks the transfer paid and records the card amount', async () => {
  const db = fakeSupabase(booking)
  const result = await applyDeskInvoiceTransferPayment(db, booking.id, {
    paidAt: '2026-11-12T12:00:00.000Z',
    paymentIntent: 'pi_123',
    sessionId: 'cs_123',
    amountEur: 1200
  })
  assert.equal(result.updated, true)
  assert.equal(db.updates.length, 1)
  assert.equal(db.updates[0].payment_status, 'paid')
  assert.equal(db.updates[0].amount_received_eur, 1200)
  assert.equal(db.updates[0].payment_source, 'stripe')
  assert.equal(db.updates[0].status, undefined)
  assert.equal(db.events[0].payload.action, 'desk_invoice_paid')
})

test('paid desk invoice retries without the new amount columns', async () => {
  const db = fakeSupabase(booking, { failMoney: true })
  const result = await applyDeskInvoiceTransferPayment(db, booking.id, {
    paidAt: '2026-11-12T12:00:00.000Z',
    paymentIntent: 'pi_123',
    sessionId: 'cs_123',
    amountEur: 1200
  })
  assert.equal(result.updated, true)
  assert.equal(db.updates.length, 1)
  assert.equal(db.updates[0].payment_status, 'paid')
  assert.equal(db.updates[0].payment_source, undefined)
  assert.equal(db.updates[0].amount_received_eur, undefined)
})

test('paid desk invoice reopens a transfer the unpaid sweep already cancelled', async () => {
  const db = fakeSupabase({
    ...booking,
    status: 'cancelled',
    cancel_reason: 'unpaid_timeout'
  })
  const result = await applyDeskInvoiceTransferPayment(db, booking.id, {
    paidAt: '2026-11-12T12:00:00.000Z',
    paymentIntent: 'pi_123',
    sessionId: 'cs_123',
    amountEur: 1200
  })
  assert.equal(result.reopened, true)
  assert.equal(db.updates[0].payment_status, 'paid')
  assert.equal(db.updates[0].status, 'pending')
  assert.equal(db.updates[0].cancel_reason, null)
})
