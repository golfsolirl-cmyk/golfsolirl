import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildPortalInvoiceTransferPatch,
  newTransferPriceAndStatus,
  portalInvoiceSettlesTripInFull
} from '../shared/payment-request-mode.mjs'

const depositMeta = { mode: 'deposit_20', tripTotalEur: 5000 }

test('a 20% deposit payment does not settle the trip', () => {
  assert.equal(portalInvoiceSettlesTripInFull(depositMeta, 1000), false)
})

test('a deposit-mode charge that covers the trip total still settles', () => {
  assert.equal(portalInvoiceSettlesTripInFull({ mode: 'deposit_20', tripTotalEur: 1000 }, 1000), true)
})

test('full invoices and invoices with no payment meta still settle', () => {
  assert.equal(portalInvoiceSettlesTripInFull({ mode: 'full', tripTotalEur: 5000 }, 5000), true)
  assert.equal(portalInvoiceSettlesTripInFull(null, 1000), true)
  assert.equal(portalInvoiceSettlesTripInFull({ mode: 'deposit_20', tripTotalEur: 0 }, 1000), true)
})

test('paying €1,000 of a €5,000 deposit invoice records a deposit and keeps the trip price', () => {
  const settlesFull = portalInvoiceSettlesTripInFull(depositMeta, 1000)
  const patch = buildPortalInvoiceTransferPatch({
    settlesFull,
    amountEur: 1000,
    adminPriceEur: 5000,
    tripTotalEur: 5000
  })
  assert.equal(settlesFull, false)
  assert.equal(patch.payment_status, 'deposit')
  assert.equal(patch.amount_received_eur, 1000)
  assert.equal(patch.admin_price_eur, undefined)
  assert.equal(patch.balance_remind_at, undefined)
})

test('a deposit invoice with no transfer price stores the trip total, not the deposit', () => {
  const priced = newTransferPriceAndStatus({
    settlesFull: portalInvoiceSettlesTripInFull(depositMeta, 1000),
    amountEur: 1000,
    tripTotalEur: 5000
  })
  assert.equal(priced.payment_status, 'deposit')
  assert.equal(priced.admin_price_eur, 5000)
  assert.equal(priced.amount_received_eur, 1000)
})

test('a full invoice with no deposit meta still marks the trip paid', () => {
  const settlesFull = portalInvoiceSettlesTripInFull(null, 5000)
  const patch = buildPortalInvoiceTransferPatch({
    settlesFull,
    amountEur: 5000,
    adminPriceEur: 5000,
    tripTotalEur: null
  })
  assert.equal(patch.payment_status, 'paid')
  assert.equal(patch.balance_remind_at, null)
  assert.equal(patch.amount_received_eur, 5000)
})
