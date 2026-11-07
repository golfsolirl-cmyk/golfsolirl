import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isMissingPaymentLedgerColumnError,
  omitPaymentLedgerColumns,
  omitPaymentLedgerSelect,
  writeTransferPaymentPatch
} from './transfer-payment-column-fallback.mjs'
import { recordedEurAfterPortalInvoicePayment } from './portal-invoice-received-eur.mjs'

test('detects a missing payment ledger column from PostgREST and Postgres', () => {
  assert.equal(
    isMissingPaymentLedgerColumnError({
      message: "Could not find the 'amount_received_eur' column of 'transfer_bookings' in the schema cache"
    }),
    true
  )
  assert.equal(
    isMissingPaymentLedgerColumnError({
      message: 'column "payment_source" of relation "transfer_bookings" does not exist'
    }),
    true
  )
  assert.equal(isMissingPaymentLedgerColumnError({ message: 'duplicate key value violates unique constraint' }), false)
})

test('retries a paid update without the new columns and keeps payment_status', async () => {
  /** @type {Record<string, unknown>[]} */
  const calls = []
  const result = await writeTransferPaymentPatch(async (patch) => {
    calls.push(patch)
    if ('payment_source' in patch || 'amount_received_eur' in patch) {
      return {
        data: null,
        error: { message: "Could not find the 'payment_source' column of 'transfer_bookings' in the schema cache" }
      }
    }
    return { data: { id: 'booking-1' }, error: null }
  }, {
    payment_status: 'paid',
    payment_source: 'stripe',
    amount_received_eur: 1280,
    stripe_payment_intent_id: 'pi_123'
  })

  assert.equal(result.data?.id, 'booking-1')
  assert.equal(calls.length, 2)
  assert.equal(calls[1].payment_status, 'paid')
  assert.equal(calls[1].stripe_payment_intent_id, 'pi_123')
  assert.equal('payment_source' in calls[1], false)
  assert.equal('amount_received_eur' in calls[1], false)
  assert.deepEqual(omitPaymentLedgerColumns(calls[0]), calls[1])
})

test('does not retry an unrelated write failure', async () => {
  let calls = 0
  const result = await writeTransferPaymentPatch(async () => {
    calls += 1
    return { data: null, error: { message: 'permission denied for table transfer_bookings' } }
  }, { payment_status: 'deposit', payment_source: 'manual' })
  assert.equal(calls, 1)
  assert.match(result.error?.message ?? '', /permission denied/)
})

test('select list drops only the new ledger columns', () => {
  assert.equal(
    omitPaymentLedgerSelect('id, payment_status, payment_source, amount_received_eur, admin_price_eur'),
    'id, payment_status, admin_price_eur'
  )
})

test('a later smaller portal invoice does not wipe a deposit already received', () => {
  assert.equal(
    recordedEurAfterPortalInvoicePayment(
      { payment_status: 'deposit', amount_received_eur: 400, admin_price_eur: 2000 },
      50
    ),
    400
  )
  assert.equal(
    recordedEurAfterPortalInvoicePayment(
      { payment_status: 'deposit', amount_received_eur: 400, admin_price_eur: 2000 },
      1600
    ),
    1600
  )
})

test('a portal invoice with no amount keeps the deposit instead of inflating to the quote', () => {
  assert.equal(
    recordedEurAfterPortalInvoicePayment(
      { payment_status: 'deposit', amount_received_eur: 400, admin_price_eur: 2000 },
      null
    ),
    400
  )
})

test('the first portal invoice payment is stored as the amount received', () => {
  assert.equal(
    recordedEurAfterPortalInvoicePayment({ payment_status: 'unpaid', admin_price_eur: 2000 }, 2000),
    2000
  )
  assert.equal(recordedEurAfterPortalInvoicePayment({ payment_status: 'unpaid', admin_price_eur: 2000 }, null), 2000)
})
