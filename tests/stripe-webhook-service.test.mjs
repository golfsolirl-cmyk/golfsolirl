import assert from 'node:assert/strict'
import { test } from 'node:test'

import { applyPaidCheckoutSession } from '../server/stripe-webhook-service.mjs'

const makeSupabase = ({ portalIds = [], transferIds = [] } = {}) => {
  const calls = []
  const portalMatches = new Set(portalIds)
  const transferMatches = new Set(transferIds)

  const supabase = {
    calls,
    from(table) {
      const chain = {
        update(payload) {
          calls.push({ table, action: 'update', payload })
          return chain
        },
        eq(column, value) {
          const last = calls.at(-1)
          if (last) {
            last.eq = { column, value }
          }
          chain.matchValue = value
          return chain
        },
        select() {
          return chain
        },
        async maybeSingle() {
          const match =
            table === 'portal_invoices'
              ? portalMatches.has(chain.matchValue)
              : table === 'transfer_bookings'
                ? transferMatches.has(chain.matchValue)
                : false

          return { error: null, data: match ? { id: chain.matchValue } : null }
        },
        async insert(payload) {
          calls.push({ table, action: 'insert', payload })
          return { error: null }
        }
      }
      return chain
    }
  }

  return supabase
}

test('does not mark a checkout session paid before Stripe payment settles', async () => {
  const supabase = makeSupabase({ transferIds: ['booking_1'] })

  await applyPaidCheckoutSession(supabase, {
    id: 'cs_unpaid',
    payment_status: 'unpaid',
    metadata: { transfer_booking_id: 'booking_1' },
    payment_intent: 'pi_unsettled'
  })

  assert.deepEqual(supabase.calls, [])
})

test('marks matching transfer bookings paid for settled Stripe sessions', async () => {
  const supabase = makeSupabase({ transferIds: ['booking_1'] })

  await applyPaidCheckoutSession(supabase, {
    id: 'cs_paid',
    payment_status: 'paid',
    metadata: { transfer_booking_id: 'booking_1', payment_kind: 'full' },
    payment_intent: 'pi_paid'
  })

  assert.equal(supabase.calls[0].table, 'transfer_bookings')
  assert.equal(supabase.calls[0].action, 'update')
  assert.deepEqual(supabase.calls[0].eq, { column: 'id', value: 'booking_1' })
  assert.equal(supabase.calls[0].payload.payment_status, 'paid')
  assert.equal(supabase.calls[1].table, 'transfer_booking_events')
  assert.equal(supabase.calls[1].payload.meta.stripe_payment_intent_id, 'pi_paid')
})

test('throws for paid Stripe sessions that do not update a transfer row', async () => {
  const supabase = makeSupabase()

  await assert.rejects(
    applyPaidCheckoutSession(supabase, {
      id: 'cs_missing',
      payment_status: 'paid',
      metadata: { transfer_booking_id: 'missing_booking' },
      payment_intent: 'pi_paid'
    }),
    (error) =>
      error instanceof Error &&
      error.statusCode === 500 &&
      error.message.includes('Referenced transfer booking was not found')
  )
})

test('throws for paid Stripe sessions that do not update any client reference row', async () => {
  const supabase = makeSupabase()

  await assert.rejects(
    applyPaidCheckoutSession(supabase, {
      id: 'cs_missing_cref',
      payment_status: 'paid',
      metadata: {},
      client_reference_id: 'missing_reference',
      payment_intent: 'pi_paid'
    }),
    (error) =>
      error instanceof Error &&
      error.statusCode === 500 &&
      error.message.includes('client_reference_id did not match')
  )
})
