import Stripe from 'stripe'

import { createClient } from '@supabase/supabase-js'



/**

 * @param {import('@supabase/supabase-js').SupabaseClient} supabase

 * @param {string} invoiceId

 * @param {string | null} paymentIntent

 * @param {string} paidAt

 * @returns {Promise<boolean>}

 */

const markPortalInvoicePaid = async (supabase, invoiceId, paymentIntent, paidAt) => {

  const { error, data } = await supabase

    .from('portal_invoices')

    .update({

      status: 'paid',

      paid_at: paidAt,

      stripe_payment_intent_id: paymentIntent

    })

    .eq('id', invoiceId)

    .select('id')

    .maybeSingle()



  if (error) {

    const err = new Error(error.message)

    err.statusCode = 500

    throw err

  }

  return Boolean(data?.id)

}



/**

 * @param {import('@supabase/supabase-js').SupabaseClient} supabase

 * @param {import('stripe').Stripe.Checkout.Session} session

 * @param {string | null} paymentIntent

 * @param {string | null} paymentKind

 * @returns {Promise<boolean>}

 */

export const markTransferBookingPaid = async (supabase, bookingId, session, paymentIntent, paymentKind) => {

  const { data: existingRow } = await supabase

    .from('transfer_bookings')

    .select('id, payment_status')

    .eq('id', bookingId)

    .maybeSingle()

  if (String(existingRow?.payment_status ?? '').toLowerCase() === 'paid') {

    return true

  }

  const now = new Date().toISOString()

  const { error, data } = await supabase

    .from('transfer_bookings')

    .update({

      payment_status: 'paid',

      balance_remind_at: null,

      balance_remind_sent_at: null,

      updated_at: now,

      stripe_payment_intent_id: paymentIntent ?? null,

      stripe_checkout_session_id: typeof session?.id === 'string' ? session.id : null

    })

    .eq('id', bookingId)

    .select('id')

    .maybeSingle()



  if (error) {

    const err = new Error(error.message)

    err.statusCode = 500

    throw err

  }

  if (!data?.id) {

    return false

  }



  const { error: evErr } = await supabase.from('transfer_booking_events').insert({

    booking_id: bookingId,

    actor_kind: 'system',

    action: 'stripe_transfer_checkout_paid',

    meta: {

      checkout_session_id: session.id,

      stripe_payment_intent_id: paymentIntent,

      payment_kind: paymentKind

    }

  })

  if (evErr) {

    console.error('[stripe-webhook] transfer_booking_events insert', evErr.message)

  }

  return true

}



/**

 * Stripe webhook: mark portal invoice or transfer paid on checkout.session.completed.

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

    const meta = /** @type {Record<string, string | undefined>} */ (session.metadata ?? {})



    const metaPortal =

      typeof meta.portal_invoice_id === 'string' && meta.portal_invoice_id.trim()

        ? meta.portal_invoice_id.trim()

        : ''

    const metaTransfer =

      typeof meta.transfer_booking_id === 'string' && meta.transfer_booking_id.trim()

        ? meta.transfer_booking_id.trim()

        : ''

    const cref =

      typeof session.client_reference_id === 'string' && session.client_reference_id.trim()

        ? session.client_reference_id.trim()

        : ''



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



    const paidAt = new Date().toISOString()

    const paymentKind = typeof meta.payment_kind === 'string' ? meta.payment_kind : null



    if (metaPortal) {

      await markPortalInvoicePaid(supabase, metaPortal, paymentIntent, paidAt)

    } else if (metaTransfer) {

      await markTransferBookingPaid(supabase, metaTransfer, session, paymentIntent, paymentKind)

    } else if (cref) {

      const invOk = await markPortalInvoicePaid(supabase, cref, paymentIntent, paidAt)

      if (!invOk) {

        await markTransferBookingPaid(supabase, cref, session, paymentIntent, paymentKind)

      }

    }

  }



  return { received: true }

}

