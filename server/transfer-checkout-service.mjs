import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { clientOwnsTransferBooking, transferBookingHasFullRefund } from './transfer-payment-guards.mjs'

export { clientOwnsTransferBooking, transferBookingHasFullRefund } from './transfer-payment-guards.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

const getSiteOrigin = (env) => {
  const site = env.SITE_URL?.trim()
  if (site) {
    try {
      return new URL(site.startsWith('http') ? site : `https://${site}`).origin
    } catch {
      /* continue */
    }
  }
  const vercel = env.VERCEL_URL?.trim()
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '')
    return `https://${host}`
  }
  return 'http://localhost:5173'
}

/**
 * Origin used only for Stripe Checkout return URLs (success/cancel).
 * Set TRANSFER_CHECKOUT_ORIGIN=http://localhost:5173 when testing locally while SITE_URL stays production for emails.
 */
const getTransferCheckoutOrigin = (env) => {
  const raw = env.TRANSFER_CHECKOUT_ORIGIN?.trim() || env.TRANSFER_CHECKOUT_SITE_URL?.trim()
  if (raw) {
    try {
      return new URL(raw.startsWith('http') ? raw : `https://${raw}`).origin
    } catch {
      /* fall through */
    }
  }
  return getSiteOrigin(env)
}

/**
 * Authenticated client: Stripe Checkout for one transfer (quoted EUR from admin).
 * @param {unknown} body
 * @param {import('node:process').ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleTransferStripeCheckout = async (body, env = process.env, meta = {}) => {
  const raw = typeof meta.authHeader === 'string' ? meta.authHeader.trim() : ''
  const token = raw.toLowerCase().startsWith('bearer ') ? raw.slice(7).trim() : ''
  if (!token) {
    throwStatus('Sign in required.', 401)
  }

  const stripeKey = env.STRIPE_SECRET_KEY?.trim()
  if (!stripeKey) {
    throwStatus('Online card payment is not configured yet.', 503)
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

  const bookingId = typeof body?.bookingId === 'string' ? body.bookingId.trim() : ''
  if (!bookingId) {
    throwStatus('bookingId is required.', 400)
  }

  const { data: booking, error: bErr } = await admin
    .from('transfer_bookings')
    .select(
      'id, client_user_id, client_email, enquiry_reference_id, pickup_label, dropoff_label, admin_price_eur, payment_status, deposit_percent, transfer_refund_status'
    )
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

  const gross = Number(booking.admin_price_eur)
  if (!Number.isFinite(gross) || gross < 0.5) {
    throwStatus('This transfer does not have a payable quote yet. Your Golf Sol desk will add it shortly.', 400)
  }

  const paySt = String(booking.payment_status ?? 'unpaid').toLowerCase()
  if (paySt === 'paid') {
    throwStatus('This transfer is already marked as paid.', 400)
  }
  if (transferBookingHasFullRefund(booking)) {
    throwStatus('This transfer has already been fully refunded. Contact Golf Sol Ireland before making another payment.', 400)
  }

  let amountEur = Math.round(gross * 100) / 100
  let productTitle = 'Costa transfer — balance'
  let productDetail = 'Quoted transfer total (VAT-inclusive where applicable).'

  if (paySt === 'deposit') {
    const pctRaw = booking.deposit_percent
    const pct =
      typeof pctRaw === 'number' && Number.isFinite(pctRaw)
        ? Math.min(99, Math.max(1, Math.round(pctRaw)))
        : 20
    amountEur = Math.round((gross * (100 - pct)) / 100 * 100) / 100
    productTitle = `Costa transfer — balance (${100 - pct}% after deposit)`
    productDetail = `Remaining balance after ${pct}% deposit on quoted €${gross.toFixed(2)}.`
  }

  const amountCents = Math.round(amountEur * 100)
  if (amountCents < 50) {
    throwStatus('Amount is below the minimum card charge — contact Golf Sol Ireland.', 400)
  }

  const route = `${String(booking.pickup_label ?? '').trim() || 'Pickup'} → ${String(booking.dropoff_label ?? '').trim() || 'Drop-off'}`
  const origin = getTransferCheckoutOrigin(env)
  const bid = encodeURIComponent(bookingId)
  const successUrl = `${origin}/dashboard?transfer_paid=1&transfer_booking_id=${bid}&checkout_session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${origin}/dashboard?transfer_pay_cancel=1&transfer_booking_id=${bid}`

  const stripe = new Stripe(stripeKey)
  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail || undefined,
      client_reference_id: bookingId,
      metadata: {
        transfer_booking_id: bookingId,
        payment_kind: paySt === 'deposit' ? 'balance' : 'full'
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: amountCents,
            product_data: {
              name: productTitle,
              description: `${route} · ${productDetail}`
            }
          }
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe Checkout failed.'
    throwStatus(msg, 502)
  }

  const checkoutUrl = session.url
  if (!checkoutUrl) {
    throwStatus('Stripe did not return a checkout URL.', 502)
  }

  return {
    ok: true,
    url: checkoutUrl,
    amountEur,
    currency: 'eur'
  }
}
