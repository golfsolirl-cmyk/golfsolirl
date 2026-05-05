import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

/**
 * Stripe webhook: mark portal invoice paid on checkout.session.completed.
 * @param {Buffer} rawBody
 * @param {string | string[] | undefined} signatureHeader
 * @param {NodeJS.ProcessEnv} env
 */
export const handleStripeWebhook = async (rawBody, signatureHeader, env = process.env) => {
  const secret = env.STRIPE_WEBHOOK_SECRET?.trim()
  const key = env.STRIPE_SECRET_KEY?.trim()
  if (!secret || !key) {
    const err = new Error('Stripe webhook is not configured.')
    err.statusCode = 500
    throw err
  }

  const sig = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader
  if (!sig || typeof sig !== 'string') {
    const err = new Error('Missing stripe-signature header.')
    err.statusCode = 400
    throw err
  }

  const stripe = new Stripe(key)
  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret)
  } catch {
    const err = new Error('Invalid Stripe webhook signature.')
    err.statusCode = 400
    throw err
  }

  if (event.type === 'checkout.session.completed') {
    const session = /** @type {import('stripe').Stripe.Checkout.Session} */ (event.data.object)
    const portalInvoiceId =
      session.metadata && typeof session.metadata.portal_invoice_id === 'string'
        ? session.metadata.portal_invoice_id.trim()
        : ''

    const transferBookingId =
      session.metadata && typeof session.metadata.transfer_booking_id === 'string'
        ? session.metadata.transfer_booking_id.trim()
        : ''

    if (!portalInvoiceId && !transferBookingId) {
      return { received: true }
    }

    const url = env.SUPABASE_URL?.trim()
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    if (!url || !serviceKey) {
      const err = new Error('Supabase is not configured.')
      err.statusCode = 500
      throw err
    }
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
    const paymentIntent =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent && typeof session.payment_intent === 'object'
          ? session.payment_intent.id
          : null

    if (portalInvoiceId) {
      const { error } = await supabase
        .from('portal_invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: paymentIntent
        })
        .eq('id', portalInvoiceId)
        .eq('status', 'sent')

      if (error) {
        const err = new Error(error.message)
        err.statusCode = 500
        throw err
      }
    } else if (transferBookingId) {
      const now = new Date().toISOString()
      const { error: upErr } = await supabase
        .from('transfer_bookings')
        .update({
          payment_status: 'paid',
          balance_remind_at: null,
          balance_remind_sent_at: null,
          updated_at: now
        })
        .eq('id', transferBookingId)

      if (upErr) {
        const err = new Error(upErr.message)
        err.statusCode = 500
        throw err
      }

      await supabase.from('transfer_booking_events').insert({
        booking_id: transferBookingId,
        actor_kind: 'system',
        action: 'stripe_transfer_checkout_paid',
        meta: {
          checkout_session_id: session.id,
          stripe_payment_intent_id: paymentIntent,
          payment_kind: session.metadata?.payment_kind ?? null
        }
      })
    }
  }

  return { received: true }
}
