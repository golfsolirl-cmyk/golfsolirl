import assert from 'node:assert/strict'

import { validatePortalInvoiceCheckoutSession } from '../server/stripe-webhook-service.mjs'

const baseInvoice = {
  id: 'inv_1',
  status: 'sent',
  amount_cents: 120000,
  currency: 'eur',
  stripe_checkout_session_id: 'cs_live_current'
}

assert.equal(
  validatePortalInvoiceCheckoutSession(baseInvoice, {
    id: 'cs_live_current',
    amount_total: 120000,
    currency: 'eur'
  }).ok,
  true,
  'current checkout session should be accepted'
)

assert.deepEqual(
  validatePortalInvoiceCheckoutSession(baseInvoice, {
    id: 'cs_live_old',
    amount_total: 120000,
    currency: 'eur'
  }),
  { ok: false, reason: 'stale_checkout_session' },
  'old checkout sessions must not mark the latest invoice paid'
)

assert.deepEqual(
  validatePortalInvoiceCheckoutSession(baseInvoice, {
    id: 'cs_live_current',
    amount_total: 100000,
    currency: 'eur'
  }),
  { ok: false, reason: 'amount_mismatch' },
  'sessions for a previous invoice amount must be rejected'
)

assert.deepEqual(
  validatePortalInvoiceCheckoutSession({ ...baseInvoice, status: 'cancelled' }, {
    id: 'cs_live_current',
    amount_total: 120000,
    currency: 'eur'
  }),
  { ok: false, reason: 'invoice_cancelled' },
  'cancelled invoices must not be resurrected by stale Stripe webhooks'
)

console.log('critical payment guards verified')
