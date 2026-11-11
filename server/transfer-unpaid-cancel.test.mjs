import assert from 'node:assert/strict'
import test from 'node:test'
import {
  planUnpaidBooking,
  processUnpaidBookingCancellations,
  rebookBlockedByPayment,
  reopenPatchAfterUnpaidCancel
} from './transfer-unpaid-cancel-service.mjs'

const now = '2026-11-11T05:00:00.000Z'

test('an old priced booking with no pay deadline is stamped, not cancelled', () => {
  assert.equal(
    planUnpaidBooking(
      {
        created_at: '2026-01-01T00:00:00.000Z',
        unpaid_deadline_at: null,
        payment_status: 'unpaid',
        admin_price_eur: 1200
      },
      now
    ),
    'stamp'
  )
})

test('only a deadline that has already passed is cancelled', () => {
  assert.equal(planUnpaidBooking({ unpaid_deadline_at: '2026-11-10T05:00:00.000Z' }, now), 'cancel')
  assert.equal(planUnpaidBooking({ unpaid_deadline_at: '2026-11-12T05:00:00.000Z' }, now), 'wait')
})

test('a booking that already has money is left alone', () => {
  assert.equal(
    planUnpaidBooking(
      { unpaid_deadline_at: '2026-01-01T00:00:00.000Z', amount_received_eur: 400, payment_status: 'unpaid' },
      now
    ),
    'skip'
  )
  assert.equal(
    planUnpaidBooking(
      {
        unpaid_deadline_at: null,
        stripe_payment_intent_id: 'pi_123',
        created_at: '2026-01-01T00:00:00.000Z'
      },
      now
    ),
    'skip'
  )
})

test('rebook refuses to clear a recorded payment', () => {
  assert.equal(rebookBlockedByPayment({ payment_status: 'paid' }), true)
  assert.equal(rebookBlockedByPayment({ payment_status: 'deposit' }), true)
  assert.equal(rebookBlockedByPayment({ payment_status: 'unpaid', amount_received_eur: 50 }), true)
  assert.equal(rebookBlockedByPayment({ payment_status: 'unpaid', stripe_payment_intent_id: 'pi_1' }), true)
  assert.equal(rebookBlockedByPayment({ payment_status: 'unpaid', amount_received_eur: 0, stripe_payment_intent_id: null }), false)
})

test('a card payment reopens a booking the unpaid sweep just cancelled', () => {
  assert.deepEqual(
    reopenPatchAfterUnpaidCancel({ status: 'cancelled', cancel_reason: 'unpaid_timeout' }),
    { status: 'pending', cancel_reason: null }
  )
  assert.deepEqual(reopenPatchAfterUnpaidCancel({ status: 'cancelled', cancel_reason: 'no_driver_admin' }), {})
  assert.deepEqual(reopenPatchAfterUnpaidCancel({ status: 'pending', cancel_reason: null }), {})
})

const mockAdmin = (rows) => {
  const updates = []
  const api = {
    from() {
      const state = { patch: null }
      const chain = {
        select() {
          return chain
        },
        eq() {
          return chain
        },
        gte() {
          return chain
        },
        order() {
          return chain
        },
        limit() {
          return chain
        },
        is() {
          return chain
        },
        update(patch) {
          state.patch = patch
          updates.push(patch)
          return chain
        },
        insert() {
          return Promise.resolve({ error: null })
        },
        maybeSingle() {
          return Promise.resolve({ data: state.patch ? { id: 'booking-1' } : null, error: null })
        },
        then(resolve, reject) {
          return Promise.resolve({ data: rows, error: null }).then(resolve, reject)
        }
      }
      return chain
    }
  }
  return { api, updates }
}

test('the sweep skips a row that already recorded a payment', async () => {
  const { api, updates } = mockAdmin([
    {
      id: 'booking-paid',
      created_at: '2026-10-01T00:00:00.000Z',
      unpaid_deadline_at: '2026-10-04T00:00:00.000Z',
      payment_status: 'unpaid',
      status: 'pending',
      admin_price_eur: 900,
      amount_received_eur: 200,
      stripe_payment_intent_id: 'pi_already'
    }
  ])
  const result = await processUnpaidBookingCancellations(api, {})
  assert.equal(result.cancelled, 0)
  assert.equal(result.stamped, 0)
  assert.deepEqual(updates, [])
})

test('the sweep cancels a booking only after its deadline', async () => {
  const { api, updates } = mockAdmin([
    {
      id: 'booking-due',
      created_at: '2026-11-01T00:00:00.000Z',
      unpaid_deadline_at: '2026-11-04T00:00:00.000Z',
      payment_status: 'unpaid',
      status: 'pending',
      admin_price_eur: 900,
      amount_received_eur: 0,
      stripe_payment_intent_id: null,
      client_email: '',
      payment_attempt: 1
    }
  ])
  const result = await processUnpaidBookingCancellations(api, {})
  assert.equal(result.cancelled, 1)
  assert.equal(updates[0].status, 'cancelled')
  assert.equal(updates[0].cancel_reason, 'unpaid_timeout')
})

test('the sweep does not cancel a month-old quote that has no deadline yet', async () => {
  const { api, updates } = mockAdmin([
    {
      id: 'booking-1',
      created_at: '2026-10-01T00:00:00.000Z',
      unpaid_deadline_at: null,
      payment_status: 'unpaid',
      status: 'pending',
      admin_price_eur: 900,
      payment_attempt: 1
    }
  ])
  const result = await processUnpaidBookingCancellations(api, {})
  assert.equal(result.cancelled, 0)
  assert.equal(result.stamped, 1)
  assert.equal(updates.length, 1)
  assert.equal(typeof updates[0].unpaid_deadline_at, 'string')
  assert.equal(updates[0].status, undefined)
})
