import test from 'node:test'
import assert from 'node:assert/strict'

import { getPaidCheckoutSessionTarget } from './stripe-webhook-service.mjs'

const checkoutSessionEvent = (type, overrides = {}) => ({
  type,
  data: {
    object: {
      id: 'cs_test_123',
      payment_status: 'paid',
      payment_intent: 'pi_test_123',
      client_reference_id: 'fallback-ref',
      metadata: {
        portal_invoice_id: 'invoice-123'
      },
      ...overrides
    }
  }
})

test('ignores completed Checkout Sessions that are not paid yet', () => {
  const target = getPaidCheckoutSessionTarget(
    checkoutSessionEvent('checkout.session.completed', {
      payment_status: 'unpaid'
    })
  )

  assert.equal(target, null)
})

test('accepts completed Checkout Sessions once payment_status is paid', () => {
  const target = getPaidCheckoutSessionTarget(checkoutSessionEvent('checkout.session.completed'))

  assert.equal(target?.metaPortal, 'invoice-123')
  assert.equal(target?.paymentIntent, 'pi_test_123')
})

test('accepts asynchronous Checkout payment success events', () => {
  const target = getPaidCheckoutSessionTarget(
    checkoutSessionEvent('checkout.session.async_payment_succeeded', {
      metadata: {
        transfer_booking_id: 'transfer-123',
        payment_kind: 'full'
      }
    })
  )

  assert.equal(target?.metaTransfer, 'transfer-123')
  assert.equal(target?.paymentKind, 'full')
})

test('ignores unrelated Stripe events', () => {
  const target = getPaidCheckoutSessionTarget(checkoutSessionEvent('payment_intent.succeeded'))

  assert.equal(target, null)
})
