import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { buildTransferRefundEmail } from './branded-transfer-payment-email.mjs'
import { buildTransferRefundPdfBytes } from './transfer-refund-pdf.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

const stripeId = (value, prefix) => {
  const v = typeof value === 'string' ? value.trim() : ''
  return v.startsWith(prefix) ? v : ''
}

const addUnique = (values, value) => {
  if (value && !values.includes(value)) {
    values.push(value)
  }
}

const paymentIntentIdFromCheckoutSession = (session) => {
  const pi = session?.payment_intent
  if (typeof pi === 'string') {
    return stripeId(pi, 'pi_')
  }
  if (pi && typeof pi === 'object' && 'id' in pi) {
    return stripeId(pi.id, 'pi_')
  }
  return ''
}

const resolveCheckoutSessionPaymentIntentId = async (stripe, checkoutSessionId) => {
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId)
  return paymentIntentIdFromCheckoutSession(session)
}

const collectTransferPaymentIntentIds = async (admin, stripe, booking, bookingId) => {
  const paymentIntentIds = []
  const checkoutSessionIds = []

  addUnique(paymentIntentIds, stripeId(booking.stripe_payment_intent_id, 'pi_'))
  addUnique(checkoutSessionIds, stripeId(booking.stripe_checkout_session_id, 'cs_'))

  const { data: events, error } = await admin
    .from('transfer_booking_events')
    .select('meta')
    .eq('booking_id', bookingId)
    .in('action', ['stripe_transfer_deposit_paid', 'stripe_transfer_checkout_paid'])
    .order('created_at', { ascending: false })

  if (error) {
    throwStatus(error.message, 500)
  }

  for (const event of events ?? []) {
    const meta = event?.meta && typeof event.meta === 'object' ? event.meta : {}
    addUnique(paymentIntentIds, stripeId(meta.stripe_payment_intent_id, 'pi_'))
    addUnique(checkoutSessionIds, stripeId(meta.checkout_session_id, 'cs_'))
  }

  for (const checkoutSessionId of checkoutSessionIds) {
    try {
      addUnique(paymentIntentIds, await resolveCheckoutSessionPaymentIntentId(stripe, checkoutSessionId))
    } catch (e) {
      throwStatus(e instanceof Error ? e.message : 'Could not load Stripe Checkout session.', 502)
    }
  }

  return paymentIntentIds
}

const centsFromPaymentIntent = (pi, primary, fallback = 0) => {
  const direct = typeof pi?.[primary] === 'number' && Number.isFinite(pi[primary]) ? pi[primary] : null
  if (direct != null) {
    return Math.max(0, Math.round(direct))
  }
  const fallbackValue = typeof pi?.[fallback] === 'number' && Number.isFinite(pi[fallback]) ? pi[fallback] : 0
  return Math.max(0, Math.round(fallbackValue))
}

const paymentIntentRefundState = (pi) => {
  const chargedCents = centsFromPaymentIntent(pi, 'amount_received', 'amount')
  const refundedCents = centsFromPaymentIntent(pi, 'amount_refunded')
  return {
    id: pi.id,
    chargedCents,
    refundedCents,
    remainingCents: Math.max(0, chargedCents - refundedCents)
  }
}

export const planTransferRefundsForPaymentIntents = (states, requestedCents) => {
  let remainingToPlan = requestedCents
  const plan = []
  let totalChargedCents = 0
  let totalRefundedCents = 0
  let totalRemainingCents = 0

  for (const state of states) {
    totalChargedCents += state.chargedCents
    totalRefundedCents += state.refundedCents
    totalRemainingCents += state.remainingCents

    if (remainingToPlan > 0 && state.remainingCents > 0) {
      const amountCents = Math.min(remainingToPlan, state.remainingCents)
      plan.push({ paymentIntentId: state.id, amountCents })
      remainingToPlan -= amountCents
    }
  }

  return {
    plan,
    totalChargedCents,
    totalRefundedCents,
    totalRemainingCents,
    unplannedCents: remainingToPlan
  }
}

/**
 * Admin: Stripe refund + DB tracking + optional customer email with PDF.
 * @param {unknown} body
 * @param {import('node:process').ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleTransferRefund = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const stripeKey = env.STRIPE_SECRET_KEY?.trim()
  if (!stripeKey) {
    throwStatus('Stripe is not configured.', 503)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Server is not configured.', 500)
  }

  const bookingId = typeof body?.bookingId === 'string' ? body.bookingId.trim() : ''
  if (!bookingId) {
    throwStatus('bookingId is required.', 400)
  }

  const fullRemaining = body?.fullRemaining === true
  let amountEur = null
  if (!fullRemaining) {
    const raw = body?.amountEur
    if (raw === null || raw === undefined || raw === '') {
      throwStatus('amountEur is required (or set fullRemaining: true).', 400)
    }
    const n = typeof raw === 'number' ? raw : Number(String(raw).replace(',', '.'))
    if (!Number.isFinite(n) || n <= 0) {
      throwStatus('amountEur must be a positive number.', 400)
    }
    amountEur = Math.round(n * 100) / 100
  }

  const sendEmail = body?.sendCustomerEmail !== false

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data: booking, error: bErr } = await admin.from('transfer_bookings').select('*').eq('id', bookingId).maybeSingle()
  if (bErr) {
    throwStatus(bErr.message, 500)
  }
  if (!booking) {
    throwStatus('Transfer booking not found.', 404)
  }

  const paySt = String(booking.payment_status ?? 'unpaid').toLowerCase()
  if (paySt !== 'paid' && paySt !== 'deposit') {
    throwStatus('Refund only applies after a card payment (paid or deposit).', 400)
  }

  const refundSt = String(booking.transfer_refund_status ?? 'none').toLowerCase()
  if (refundSt === 'full') {
    throwStatus('This transfer is already fully refunded in Golf Sol.', 400)
  }

  const stripe = new Stripe(stripeKey)

  const paymentIntentIds = await collectTransferPaymentIntentIds(admin, stripe, booking, bookingId)

  if (paymentIntentIds.length === 0) {
    throwStatus(
      'No Stripe card charge is linked (need Payment Intent pi_… or paid Checkout session cs_…). Use desk processes for manual payments.',
      400
    )
  }

  const paymentIntentStates = []
  for (const paymentIntentId of paymentIntentIds) {
    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
      paymentIntentStates.push(paymentIntentRefundState(pi))
    } catch (e) {
      throwStatus(e instanceof Error ? e.message : 'Could not load Stripe payment.', 502)
    }
  }

  const availableBefore = planTransferRefundsForPaymentIntents(paymentIntentStates, 0).totalRemainingCents

  if (availableBefore < 50) {
    throwStatus('Nothing left to refund on this Stripe payment (or amount below minimum).', 400)
  }

  let refundCents
  if (fullRemaining) {
    refundCents = availableBefore
  } else {
    refundCents = Math.round(amountEur * 100)
    if (refundCents < 50) {
      throwStatus('Refund amount is below Stripe minimum (€0.50).', 400)
    }
    if (refundCents > availableBefore) {
      throwStatus(`That exceeds the remaining refundable balance (${(availableBefore / 100).toFixed(2)} EUR).`, 400)
    }
  }

  const refundPlan = planTransferRefundsForPaymentIntents(paymentIntentStates, refundCents)
  if (refundPlan.unplannedCents > 0 || refundPlan.plan.length === 0) {
    throwStatus(`That exceeds the remaining refundable balance (${(refundPlan.totalRemainingCents / 100).toFixed(2)} EUR).`, 400)
  }

  const refunds = []
  for (const plannedRefund of refundPlan.plan) {
    try {
      refunds.push(
        await stripe.refunds.create({
          payment_intent: plannedRefund.paymentIntentId,
          amount: plannedRefund.amountCents,
          metadata: {
            transfer_booking_id: bookingId,
            golf_sol_admin_refund: '1'
          }
        })
      )
    } catch (e) {
      throwStatus(e instanceof Error ? e.message : 'Stripe refund failed.', 502)
    }
  }

  const refundEur = refundCents / 100
  const prevTotal = Number(booking.transfer_refund_total_eur) || 0
  const newTotal = Math.round((prevTotal + refundEur) * 100) / 100

  const statesAfter = []
  for (const paymentIntentId of paymentIntentIds) {
    try {
      const piAfter = await stripe.paymentIntents.retrieve(paymentIntentId)
      statesAfter.push(paymentIntentRefundState(piAfter))
    } catch (e) {
      throwStatus(e instanceof Error ? e.message : 'Could not load Stripe payment after refund.', 502)
    }
  }

  const afterSummary = planTransferRefundsForPaymentIntents(statesAfter, 0)
  const isFullyRefunded = afterSummary.totalChargedCents > 0 && afterSummary.totalRemainingCents <= 1

  const nextRefundStatus = isFullyRefunded ? 'full' : 'partial'
  const now = new Date().toISOString()

  const patch = {
    transfer_refund_total_eur: newTotal,
    transfer_refund_status: nextRefundStatus,
    updated_at: now
  }

  if (isFullyRefunded) {
    patch.payment_status = 'unpaid'
    patch.balance_remind_at = null
    patch.balance_remind_sent_at = null
  }

  const { error: uErr } = await admin.from('transfer_bookings').update(patch).eq('id', bookingId)
  if (uErr) {
    throwStatus(uErr.message, 500)
  }

  await admin.from('transfer_booking_events').insert({
    booking_id: bookingId,
    actor_kind: 'admin',
    action: 'stripe_refund_issued',
    meta: {
      stripe_refund_id: refunds[0]?.id ?? null,
      stripe_refund_ids: refunds.map((r) => r.id),
      stripe_payment_intent_ids: paymentIntentIds,
      amount_eur: refundEur,
      refund_kind: nextRefundStatus,
      cumulative_refund_eur: newTotal,
      admin_user_id: auth.user.id
    }
  })

  const { data: fresh } = await admin.from('transfer_bookings').select('*').eq('id', bookingId).maybeSingle()

  let emailedTo = null
  let emailError = null

  if (sendEmail && fresh) {
    try {
      const clientName =
        String(fresh.client_display_name ?? '').trim() ||
        String(auth.user.user_metadata?.full_name ?? '').trim() ||
        'Guest'
      const route = `${String(fresh.pickup_label ?? '').trim() || '—'} → ${String(fresh.dropoff_label ?? '').trim() || '—'}`
      const pdfBuf = await buildTransferRefundPdfBytes({
        customerLabel: clientName,
        route,
        bookingId: fresh.id,
        refundAmountEur: refundEur,
        refundKind: nextRefundStatus === 'full' ? 'full' : 'partial',
        cumulativeRefundedEur: newTotal,
        stripeRefundId: refunds.map((r) => r.id).join(', '),
        stripePaymentIntentId: paymentIntentIds.join(', ')
      })

      const content = buildTransferRefundEmail(fresh, {
        refundAmountEur: refundEur,
        refundKind: nextRefundStatus === 'full' ? 'full' : 'partial',
        cumulativeEur: newTotal
      })

      const resendKey = env.RESEND_API_KEY?.trim()
      const from = env.RESEND_FROM_EMAIL?.trim()
      const direct = String(fresh.client_email ?? '').trim()
      let to = direct
      if (!to && fresh.client_user_id) {
        const { data: prof } = await admin.from('profiles').select('email').eq('id', fresh.client_user_id).maybeSingle()
        to = String(prof?.email ?? '').trim()
      }

      if (!resendKey || !from) {
        emailError = 'Resend not configured — refund processed but email skipped.'
      } else if (!to) {
        emailError = 'No client email — refund processed but email skipped.'
      } else {
        const resend = new Resend(resendKey)
        const { error: sendErr } = await resend.emails.send({
          from,
          to,
          subject: content.subject,
          html: content.html,
          attachments: [
            {
              filename: `golfsol-transfer-refund-${fresh.id.slice(0, 8)}.pdf`,
              content: pdfBuf
            }
          ]
        })
        if (sendErr) {
          emailError = sendErr.message ?? 'Resend failed'
        } else {
          emailedTo = to
        }
      }
    } catch (e) {
      emailError = e instanceof Error ? e.message : String(e)
    }
  }

  return {
    ok: true,
    bookingId,
    stripeRefundId: refunds[0]?.id ?? null,
    stripeRefundIds: refunds.map((r) => r.id),
    refundAmountEur: refundEur,
    transferRefundStatus: nextRefundStatus,
    transferRefundTotalEur: newTotal,
    booking: fresh ?? null,
    emailedTo,
    emailError
  }
}
