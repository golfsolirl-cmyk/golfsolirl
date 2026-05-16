import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { assertMarkedPaid, isPaidCheckoutSessionPaymentEvent } from '../server/stripe-webhook-service.mjs'

describe('Stripe webhook paid-state guards', () => {
  it('does not process checkout.session.completed until Stripe marks the session paid', () => {
    assert.equal(
      isPaidCheckoutSessionPaymentEvent('checkout.session.completed', { payment_status: 'unpaid' }),
      false
    )
  })

  it('processes paid checkout completion and async payment success events', () => {
    assert.equal(isPaidCheckoutSessionPaymentEvent('checkout.session.completed', { payment_status: 'paid' }), true)
    assert.equal(
      isPaidCheckoutSessionPaymentEvent('checkout.session.async_payment_succeeded', { payment_status: 'paid' }),
      true
    )
  })

  it('throws a retryable webhook error when a paid target is not updated', () => {
    assert.throws(
      () => assertMarkedPaid(false, 'transfer booking', 'tb_123'),
      (err) =>
        err instanceof Error &&
        err.message === 'Paid Stripe Checkout session could not mark transfer booking tb_123 as paid.' &&
        err.statusCode === 500
    )
  })
})
