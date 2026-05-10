import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { clientOwnsTransferBooking, transferBookingHasFullRefund } from './transfer-payment-guards.mjs'
import { markTransferBookingPaid } from './stripe-webhook-service.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

/**
 * After Stripe Checkout redirect: confirms payment via Stripe API and marks transfer paid when webhooks
 * cannot reach localhost or lag behind the redirect.
 *
 * @param {unknown} body
 * @param {import('node:process').ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleTransferCheckoutSync = async (body, env = process.env, meta = {}) => {
  const raw = typeof meta.authHeader === 'string' ? meta.authHeader.trim() : ''
  const token = raw.toLowerCase().startsWith('bearer ') ? raw.slice(7).trim() : ''
  if (!token) {
    throwStatus('Sign in required.', 401)
  }

  const stripeKey = env.STRIPE_SECRET_KEY?.trim()
  if (!stripeKey) {
    throwStatus('Stripe is not configured.', 503)
  }

  const checkoutSessionId =
    typeof body?.checkoutSessionId === 'string'
      ? body.checkoutSessionId.trim()
      : typeof body?.sessionId === 'string'
        ? body.sessionId.trim()
        : ''

  if (!checkoutSessionId) {
    throwStatus('checkoutSessionId is required.', 400)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Server is not configured.', 500)
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData?.user?.id) {
    throwStatus(userErr?.message ?? 'Invalid or expired session.', 401)
  }

  const user = userData.user
  const userEmail = (user.email ?? '').trim()

  const stripe = new Stripe(stripeKey)
  let session
  try {
    session = await stripe.checkout.sessions.retrieve(checkoutSessionId)
  } catch (e) {
    throwStatus(e instanceof Error ? e.message : 'Could not load Checkout session.', 502)
  }

  const ps = String(session.payment_status ?? '')
  if (ps !== 'paid') {
    return {
      ok: false,
      paymentStatus: session.payment_status,
      message: 'Checkout session is not paid yet.'
    }
  }

  const sessionMeta = /** @type {Record<string, string | undefined>} */ (session.metadata ?? {})

  let bookingId =
    typeof sessionMeta.transfer_booking_id === 'string' && sessionMeta.transfer_booking_id.trim()
      ? sessionMeta.transfer_booking_id.trim()
      : ''

  const cref =
    typeof session.client_reference_id === 'string' ? session.client_reference_id.trim() : ''
  if (!bookingId && cref) {
    bookingId = cref
  }

  if (!bookingId) {
    throwStatus('This Checkout session is not linked to a transfer booking.', 400)
  }

  const { data: booking, error: bErr } = await admin
    .from('transfer_bookings')
    .select('id, client_user_id, client_email, enquiry_reference_id, payment_status, transfer_refund_status')
    .eq('id', bookingId)
    .maybeSingle()

  if (bErr) {
    throwStatus(bErr.message, 500)
  }
  if (!booking) {
    throwStatus('Transfer not found.', 404)
  }

  const owns = await clientOwnsTransferBooking(admin, user.id, userEmail, booking)
  if (!owns) {
    throwStatus('You do not have access to this transfer.', 403)
  }
  if (transferBookingHasFullRefund(booking)) {
    throwStatus('This transfer has already been fully refunded. Contact Golf Sol Ireland before making another payment.', 400)
  }

  const paymentIntent =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent && typeof session.payment_intent === 'object'
        ? session.payment_intent.id
        : null

  const paymentKind = typeof sessionMeta.payment_kind === 'string' ? sessionMeta.payment_kind : null

  const updated = await markTransferBookingPaid(admin, bookingId, session, paymentIntent, paymentKind)

  return { ok: true, updated, bookingId }
}
