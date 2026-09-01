import assert from 'node:assert/strict'
import test from 'node:test'

import { planTransferRefundsForPaymentIntents } from './transfer-refund-service.mjs'

test('plans full refunds across split transfer payment intents', () => {
  const result = planTransferRefundsForPaymentIntents(
    [
      { id: 'pi_balance', chargedCents: 8000, refundedCents: 0, remainingCents: 8000 },
      { id: 'pi_deposit', chargedCents: 2000, refundedCents: 0, remainingCents: 2000 }
    ],
    10000
  )

  assert.deepEqual(result.plan, [
    { paymentIntentId: 'pi_balance', amountCents: 8000 },
    { paymentIntentId: 'pi_deposit', amountCents: 2000 }
  ])
  assert.equal(result.totalRemainingCents, 10000)
  assert.equal(result.unplannedCents, 0)
})

test('plans partial refunds across older intents when latest intent has insufficient balance', () => {
  const result = planTransferRefundsForPaymentIntents(
    [
      { id: 'pi_balance', chargedCents: 8000, refundedCents: 7500, remainingCents: 500 },
      { id: 'pi_deposit', chargedCents: 2000, refundedCents: 0, remainingCents: 2000 }
    ],
    1200
  )

  assert.deepEqual(result.plan, [
    { paymentIntentId: 'pi_balance', amountCents: 500 },
    { paymentIntentId: 'pi_deposit', amountCents: 700 }
  ])
  assert.equal(result.totalRemainingCents, 2500)
  assert.equal(result.unplannedCents, 0)
})

test('reports unplanned cents when requested refund exceeds aggregate remaining balance', () => {
  const result = planTransferRefundsForPaymentIntents(
    [{ id: 'pi_only', chargedCents: 5000, refundedCents: 4500, remainingCents: 500 }],
    800
  )

  assert.deepEqual(result.plan, [{ paymentIntentId: 'pi_only', amountCents: 500 }])
  assert.equal(result.totalRemainingCents, 500)
  assert.equal(result.unplannedCents, 300)
})
