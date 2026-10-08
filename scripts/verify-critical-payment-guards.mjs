import assert from 'node:assert/strict'

import {
  portalInvoiceCheckoutMatchesCurrent,
  transferCheckoutSessionMatchesCurrent
} from '../server/stripe-webhook-service.mjs'

const invoice = {
  id: 'inv_1',
  amount_cents: 125000,
  currency: 'eur',
  stripe_checkout_session_id: 'cs_current'
}

assert.equal(
  portalInvoiceCheckoutMatchesCurrent(invoice, {
    stripeSessionId: 'cs_current',
    amountEur: 1250,
    currency: 'eur'
  }),
  true,
  'current portal invoice checkout should be accepted'
)

assert.equal(
  portalInvoiceCheckoutMatchesCurrent(invoice, {
    stripeSessionId: 'cs_old',
    amountEur: 1250,
    currency: 'eur'
  }),
  false,
  'stale portal invoice checkout session should be rejected'
)

assert.equal(
  portalInvoiceCheckoutMatchesCurrent(invoice, {
    stripeSessionId: 'cs_current',
    amountEur: 999,
    currency: 'eur'
  }),
  false,
  'underpaid portal invoice checkout should be rejected'
)

const transfer = {
  id: 'booking_1',
  admin_price_eur: 1000,
  deposit_percent: 20,
  scheduled_at: '2026-07-01T10:00:00.000Z',
  next_available_driver: false,
  stripe_checkout_session_id: 'cs_transfer_current'
}

assert.equal(
  transferCheckoutSessionMatchesCurrent(
    transfer,
    { id: 'cs_transfer_current', amount_total: 20000, currency: 'eur' },
    'deposit'
  ),
  true,
  'current transfer deposit checkout should be accepted'
)

assert.equal(
  transferCheckoutSessionMatchesCurrent(
    transfer,
    { id: 'cs_transfer_old', amount_total: 20000, currency: 'eur' },
    'deposit'
  ),
  false,
  'older transfer checkout session should be rejected once a newer session is stored'
)

assert.equal(
  transferCheckoutSessionMatchesCurrent(
    transfer,
    { id: 'cs_transfer_current', amount_total: 10000, currency: 'eur' },
    'deposit'
  ),
  false,
  'underpaid transfer deposit checkout should be rejected after reprice'
)

assert.equal(
  transferCheckoutSessionMatchesCurrent(
    transfer,
    { id: 'cs_transfer_current', amount_total: 80000, currency: 'eur' },
    'balance'
  ),
  true,
  'current transfer balance checkout should be accepted'
)

assert.equal(
  transferCheckoutSessionMatchesCurrent(
    transfer,
    { id: 'cs_transfer_current', amount_total: 80000, currency: 'usd' },
    'balance'
  ),
  false,
  'non-EUR transfer checkout should be rejected'
)

console.log('critical payment guard checks passed')
