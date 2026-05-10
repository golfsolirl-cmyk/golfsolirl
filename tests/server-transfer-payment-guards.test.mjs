import assert from 'node:assert/strict'
import test from 'node:test'

import { isCheckoutSessionPaid } from '../server/stripe-webhook-service.mjs'
import { clientOwnsTransferBooking, transferBookingHasFullRefund } from '../server/transfer-checkout-service.mjs'

const unusedAdmin = {
  from() {
    throw new Error('Supabase should not be queried for this case')
  }
}

test('client ownership fallback does not allow email match on another assigned client row', async () => {
  const owns = await clientOwnsTransferBooking(unusedAdmin, 'user-b', 'client@example.com', {
    client_user_id: 'user-a',
    client_email: 'client@example.com'
  })

  assert.equal(owns, false)
})

test('client ownership fallback still allows unattached website enquiry email match', async () => {
  const owns = await clientOwnsTransferBooking(unusedAdmin, 'user-b', 'client@example.com', {
    client_user_id: null,
    client_email: ' CLIENT@example.com '
  })

  assert.equal(owns, true)
})

test('full refund rows are treated as non-payable', () => {
  assert.equal(transferBookingHasFullRefund({ transfer_refund_status: 'full' }), true)
  assert.equal(transferBookingHasFullRefund({ transfer_refund_status: 'partial' }), false)
})

test('webhook only treats paid checkout sessions as settled', () => {
  assert.equal(isCheckoutSessionPaid({ payment_status: 'paid' }), true)
  assert.equal(isCheckoutSessionPaid({ payment_status: 'unpaid' }), false)
  assert.equal(isCheckoutSessionPaid({ payment_status: null }), false)
})
