import assert from 'node:assert/strict'
import test from 'node:test'
import { planUnpaidDeadlineOnPriceSave } from './transfer-unpaid-deadline.mjs'

test('withdrawing a price clears a pay clock that would otherwise cancel the next quote', () => {
  const expired = '2026-11-04T05:00:00.000Z'
  assert.equal(planUnpaidDeadlineOnPriceSave(null, expired), 'clear')
  assert.equal(planUnpaidDeadlineOnPriceSave(0, expired), 'clear')
  assert.equal(planUnpaidDeadlineOnPriceSave(0.49, expired), 'clear')
})

test('the first live price starts the clock, and a later edit does not add days', () => {
  assert.equal(planUnpaidDeadlineOnPriceSave(900, null), 'stamp')
  assert.equal(planUnpaidDeadlineOnPriceSave(950, '2026-11-20T05:00:00.000Z'), 'keep')
  assert.equal(planUnpaidDeadlineOnPriceSave(950, '2026-11-01T05:00:00.000Z'), 'keep')
})
