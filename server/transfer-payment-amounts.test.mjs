import assert from 'node:assert/strict'
import test from 'node:test'
import { parseOptionalEur } from './transfer-payment-amounts.mjs'

/** Same gate as handleTransferPaymentAdmin before it demands a trip total. */
const manualAmountsSupplied = (body) => {
  const totalEur = parseOptionalEur(body?.totalEur)
  const receivedEur = parseOptionalEur(body?.amountReceivedEur)
  if (totalEur === 'invalid' || receivedEur === 'invalid') {
    return 'invalid'
  }
  return totalEur != null || receivedEur != null
}

test('deposit and paid desk buttons omit totals and must not look like €0', () => {
  const body = {
    action: 'set_payment',
    bookingId: 'booking-1',
    paymentStatus: 'deposit',
    depositPercent: 20,
    sendCustomerEmails: true
  }
  assert.equal(parseOptionalEur(body.totalEur), null)
  assert.equal(parseOptionalEur(body.amountReceivedEur), null)
  assert.equal(manualAmountsSupplied(body), false)
  assert.equal(manualAmountsSupplied({ ...body, paymentStatus: 'paid' }), false)
})

test('blank strings are omitted, explicit zero and typed amounts are kept', () => {
  assert.equal(parseOptionalEur(undefined), null)
  assert.equal(parseOptionalEur(null), null)
  assert.equal(parseOptionalEur(''), null)
  assert.equal(parseOptionalEur('   '), null)
  assert.equal(parseOptionalEur(0), 0)
  assert.equal(parseOptionalEur('0'), 0)
  assert.equal(parseOptionalEur(1000), 1000)
  assert.equal(parseOptionalEur('1,250.50'), 1250.5)
  assert.equal(manualAmountsSupplied({ totalEur: 1000, amountReceivedEur: 400 }), true)
  assert.equal(manualAmountsSupplied({ totalEur: '', amountReceivedEur: '' }), false)
})

test('garbage amounts stay invalid so they are not dropped', () => {
  assert.equal(parseOptionalEur('nope'), 'invalid')
  assert.equal(parseOptionalEur(-3), 'invalid')
  assert.equal(manualAmountsSupplied({ totalEur: 'abc' }), 'invalid')
})
