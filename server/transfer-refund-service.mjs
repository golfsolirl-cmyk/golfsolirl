import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { buildTransferRefundEmail } from './branded-transfer-payment-email.mjs'
import { getTransactionalEmailImageAttachments } from './enquiry-service.mjs'
import { buildTransferRefundPdfBytes } from './transfer-refund-pdf.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
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

  let resolvedPiId = typeof booking.stripe_payment_intent_id === 'string' ? booking.stripe_payment_intent_id.trim() : ''

  if (!resolvedPiId.startsWith('pi_')) {
    const csRaw =
      typeof booking.stripe_checkout_session_id === 'string' ? booking.stripe_checkout_session_id.trim() : ''
    if (csRaw.startsWith('cs_')) {
      try {
        const session = await stripe.checkout.sessions.retrieve(csRaw)
        const piField = session.payment_intent
        const extracted =
          typeof piField === 'string'
            ? piField
            : piField && typeof piField === 'object' && piField !== null && 'id' in piField
              ? String(/** @type {{ id?: string }} */ (piField).id ?? '')
              : ''
        if (extracted.startsWith('pi_')) {
          resolvedPiId = extracted
          const nowIso = new Date().toISOString()
          await admin
            .from('transfer_bookings')
            .update({ stripe_payment_intent_id: resolvedPiId, updated_at: nowIso })
            .eq('id', bookingId)
          booking.stripe_payment_intent_id = resolvedPiId
        }
      } catch (e) {
        throwStatus(e instanceof Error ? e.message : 'Could not load Stripe Checkout session.', 502)
      }
    }
  }

  if (!resolvedPiId.startsWith('pi_')) {
    throwStatus(
      'No Stripe card charge is linked (need Payment Intent pi_… or paid Checkout session cs_…). Use desk processes for manual payments.',
      400
    )
  }

  let pi
  try {
    pi = await stripe.paymentIntents.retrieve(resolvedPiId)
  } catch (e) {
    throwStatus(e instanceof Error ? e.message : 'Could not load Stripe payment.', 502)
  }

  const charged = typeof pi.amount_received === 'number' ? pi.amount_received : pi.amount || 0
  const alreadyRefunded = typeof pi.amount_refunded === 'number' ? pi.amount_refunded : 0
  const remaining = charged - alreadyRefunded

  if (remaining < 50) {
    throwStatus('Nothing left to refund on this Stripe payment (or amount below minimum).', 400)
  }

  let refundCents
  if (fullRemaining) {
    refundCents = remaining
  } else {
    refundCents = Math.round(amountEur * 100)
    if (refundCents < 50) {
      throwStatus('Refund amount is below Stripe minimum (€0.50).', 400)
    }
    if (refundCents > remaining) {
      throwStatus(`That exceeds the remaining refundable balance (${(remaining / 100).toFixed(2)} EUR).`, 400)
    }
  }

  let refund
  try {
    refund = await stripe.refunds.create({
      payment_intent: resolvedPiId,
      amount: refundCents,
      metadata: {
        transfer_booking_id: bookingId,
        golf_sol_admin_refund: '1'
      }
    })
  } catch (e) {
    throwStatus(e instanceof Error ? e.message : 'Stripe refund failed.', 502)
  }

  const refundEur = refundCents / 100
  const prevTotal = Number(booking.transfer_refund_total_eur) || 0
  const newTotal = Math.round((prevTotal + refundEur) * 100) / 100

  const piAfter = await stripe.paymentIntents.retrieve(resolvedPiId)
  const refundedAfter = typeof piAfter.amount_refunded === 'number' ? piAfter.amount_refunded : 0
  const chargedAfter = typeof piAfter.amount_received === 'number' ? piAfter.amount_received : charged
  const isFullyRefunded = refundedAfter >= chargedAfter - 1

  const nextRefundStatus = isFullyRefunded ? 'full' : 'partial'
  const now = new Date().toISOString()

  const patch = {
    transfer_refund_total_eur: newTotal,
    transfer_refund_status: nextRefundStatus,
    updated_at: now
  }

  if (isFullyRefunded) {
    patch.payment_status = 'paid'
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
      stripe_refund_id: refund.id,
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
        stripeRefundId: refund.id,
        stripePaymentIntentId: resolvedPiId
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
        const imageAttachments = await getTransactionalEmailImageAttachments()
        const resend = new Resend(resendKey)
        const { error: sendErr } = await resend.emails.send({
          from,
          to,
          subject: content.subject,
          html: content.html,
          attachments: [
            ...imageAttachments,
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
    stripeRefundId: refund.id,
    refundAmountEur: refundEur,
    transferRefundStatus: nextRefundStatus,
    transferRefundTotalEur: newTotal,
    booking: fresh ?? null,
    emailedTo,
    emailError
  }
}
