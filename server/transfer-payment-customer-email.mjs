import { Resend } from 'resend'
import {
  buildPortalInvoicePaidThankYouEmail,
  buildTransferBalancePayNowEmail,
  buildTransferDepositThankYouEmail,
  buildTransferFullPaymentThankYouEmail
} from './branded-transfer-payment-email.mjs'
import {
  balanceAmountEur,
  depositAmountEur,
  normalizedDepositPercent
} from './transfer-payment-amounts.mjs'

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {Record<string, unknown>} booking
 */
export const resolveClientEmail = async (admin, booking) => {
  const direct = String(booking.client_email ?? '').trim()
  if (direct) {
    return direct
  }
  const uid = booking.client_user_id
  if (!uid) {
    return ''
  }
  const { data, error } = await admin.from('profiles').select('email').eq('id', uid).maybeSingle()
  if (error) {
    console.error('[transfer-payment-email] profile email lookup', error.message)
    return ''
  }
  return String(data?.email ?? '').trim()
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} bookingId
 * @param {string} action
 */
const hasBookingEmailEvent = async (admin, bookingId, action) => {
  const { data, error } = await admin
    .from('transfer_booking_events')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('action', action)
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error('[transfer-payment-email] event lookup', action, error.message)
    return false
  }
  return Boolean(data?.id)
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} bookingId
 * @param {string} action
 * @param {Record<string, unknown>} meta
 */
const recordBookingEmailEvent = async (admin, bookingId, action, meta = {}) => {
  const { error } = await admin.from('transfer_booking_events').insert({
    booking_id: bookingId,
    actor_kind: 'system',
    action,
    meta
  })
  if (error) {
    console.error('[transfer-payment-email] event insert', action, error.message)
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {Record<string, unknown>} booking
 * @param {{ subject: string; html: string }} content
 * @param {import('node:process').ProcessEnv} env
 * @param {{ throwOnError?: boolean }} [opts]
 */
export const sendBookingEmailHtml = async (admin, booking, content, env = process.env, opts = {}) => {
  const resendKey = env.RESEND_API_KEY?.trim()
  const from = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !from) {
    const msg = 'Resend is not configured.'
    if (opts.throwOnError) {
      const e = new Error(msg)
      e.statusCode = 500
      throw e
    }
    console.error('[transfer-payment-email]', msg)
    return { ok: false, reason: 'resend_not_configured' }
  }
  const to = await resolveClientEmail(admin, booking)
  if (!to) {
    const msg = 'No client email on file for this transfer.'
    if (opts.throwOnError) {
      const e = new Error(msg)
      e.statusCode = 400
      throw e
    }
    console.error('[transfer-payment-email]', msg, booking.id)
    return { ok: false, reason: 'no_client_email' }
  }
  const resend = new Resend(resendKey)
  const { error: sendErr } = await resend.emails.send({
    from,
    to,
    subject: content.subject,
    html: content.html
  })
  if (sendErr) {
    const msg = sendErr.message ?? 'Resend failed'
    if (opts.throwOnError) {
      const e = new Error(msg)
      e.statusCode = 500
      throw e
    }
    console.error('[transfer-payment-email] send failed', to, msg)
    return { ok: false, reason: 'send_failed', message: msg, to }
  }
  return { ok: true, to }
}

/**
 * @param {Record<string, unknown>} booking
 * @param {'deposit' | 'balance' | 'full'} paymentKind
 * @param {number | null | undefined} stripeAmountEur
 */
export const computeTransferPaymentAmounts = (booking, paymentKind, stripeAmountEur) => {
  const gross = Number(booking.admin_price_eur)
  const pct = normalizedDepositPercent(booking.deposit_percent)
  const grossEur = Number.isFinite(gross) && gross > 0 ? gross : undefined
  const balanceEur = grossEur != null ? balanceAmountEur(grossEur, pct) : undefined
  const depositEur = grossEur != null ? depositAmountEur(grossEur, pct) : undefined

  const fromStripe =
    typeof stripeAmountEur === 'number' && Number.isFinite(stripeAmountEur) && stripeAmountEur > 0
      ? Math.round(stripeAmountEur * 100) / 100
      : null

  if (paymentKind === 'deposit') {
    return {
      amountPaidEur: fromStripe ?? depositEur,
      grossEur,
      balanceEur,
      depositPaidEur: fromStripe ?? depositEur
    }
  }
  if (paymentKind === 'balance') {
    return {
      amountPaidEur: fromStripe ?? balanceEur,
      grossEur,
      balanceEur: 0
    }
  }
  return {
    amountPaidEur: fromStripe ?? grossEur,
    grossEur,
    balanceEur: 0
  }
}

/**
 * Send payment confirmation (+ balance pay-now when deposit) after Stripe or admin payment.
 * Never throws — webhook-safe.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} bookingId
 * @param {{ paymentKind: 'deposit' | 'balance' | 'full', amountPaidEur?: number | null, skipIdempotency?: boolean }} opts
 * @param {import('node:process').ProcessEnv} env
 */
export const sendTransferPaymentCustomerEmails = async (admin, bookingId, opts, env = process.env) => {
  const paymentKind = opts.paymentKind
  const id = String(bookingId ?? '').trim()
  if (!id || !paymentKind) {
    return { ok: false, reason: 'missing_args' }
  }

  const { data: booking, error } = await admin.from('transfer_bookings').select('*').eq('id', id).maybeSingle()
  if (error || !booking?.id) {
    console.error('[transfer-payment-email] booking load', id, error?.message)
    return { ok: false, reason: 'booking_not_found' }
  }

  const amounts = computeTransferPaymentAmounts(booking, paymentKind, opts.amountPaidEur)
  const pct = normalizedDepositPercent(booking.deposit_percent)
  const sent = []
  const errors = []

  if (paymentKind === 'deposit') {
    const thankYouAction = 'customer_email_deposit_thank_you'
    const balanceAction = 'customer_email_balance_pay_now'
    if (!opts.skipIdempotency && (await hasBookingEmailEvent(admin, id, thankYouAction))) {
      return { ok: true, skipped: true, reason: 'already_sent' }
    }

    const thankYou = buildTransferDepositThankYouEmail(booking, pct, {
      amountPaidEur: amounts.amountPaidEur,
      grossEur: amounts.grossEur,
      balanceEur: amounts.balanceEur
    })
    const r1 = await sendBookingEmailHtml(admin, booking, thankYou, env)
    if (r1.ok) {
      sent.push('deposit_thank_you')
      await recordBookingEmailEvent(admin, id, thankYouAction, {
        amountPaidEur: amounts.amountPaidEur ?? null,
        grossEur: amounts.grossEur ?? null,
        balanceEur: amounts.balanceEur ?? null
      })
    } else {
      errors.push({ step: thankYouAction, ...r1 })
    }

    if (!opts.skipIdempotency && (await hasBookingEmailEvent(admin, id, balanceAction))) {
      return { ok: sent.length > 0, sent, errors, partial: true }
    }

    const balanceEmail = buildTransferBalancePayNowEmail(booking, pct, {
      depositPaidEur: amounts.depositPaidEur ?? amounts.amountPaidEur,
      grossEur: amounts.grossEur,
      balanceEur: amounts.balanceEur
    })
    const r2 = await sendBookingEmailHtml(admin, booking, balanceEmail, env)
    if (r2.ok) {
      sent.push('balance_pay_now')
      await recordBookingEmailEvent(admin, id, balanceAction, {
        balanceEur: amounts.balanceEur ?? null
      })
    } else {
      errors.push({ step: balanceAction, ...r2 })
    }

    return { ok: sent.length > 0, sent, errors }
  }

  const fullAction = paymentKind === 'balance' ? 'customer_email_balance_paid' : 'customer_email_full_paid'
  if (!opts.skipIdempotency && (await hasBookingEmailEvent(admin, id, fullAction))) {
    return { ok: true, skipped: true, reason: 'already_sent' }
  }

  const fullEmail = buildTransferFullPaymentThankYouEmail(booking, {
    amountPaidEur: amounts.amountPaidEur,
    grossEur: amounts.grossEur
  })
  const r = await sendBookingEmailHtml(admin, booking, fullEmail, env)
  if (r.ok) {
    sent.push(fullAction)
    await recordBookingEmailEvent(admin, id, fullAction, {
      amountPaidEur: amounts.amountPaidEur ?? null,
      paymentKind
    })
    return { ok: true, sent }
  }
  errors.push({ step: fullAction, ...r })
  return { ok: false, sent, errors }
}

/**
 * Confirmation after a portal invoice checkout (trip invoice).
 * Never throws.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} invoiceId
 * @param {{ amountPaidEur?: number | null, bookingId?: string | null }} opts
 * @param {import('node:process').ProcessEnv} env
 */
export const sendPortalInvoicePaidCustomerEmail = async (admin, invoiceId, opts = {}, env = process.env) => {
  const id = String(invoiceId ?? '').trim()
  if (!id) {
    return { ok: false, reason: 'missing_invoice_id' }
  }

  const emailAction = 'customer_email_portal_invoice_paid'
  const bookingId = typeof opts.bookingId === 'string' ? opts.bookingId.trim() : ''
  if (bookingId && (await hasBookingEmailEvent(admin, bookingId, emailAction))) {
    return { ok: true, skipped: true, reason: 'already_sent' }
  }

  const { data: invoice, error: invErr } = await admin
    .from('portal_invoices')
    .select('id, amount_cents, enquiry_reference_id, profile_id, status')
    .eq('id', id)
    .maybeSingle()
  if (invErr || !invoice?.id) {
    console.error('[transfer-payment-email] invoice load', id, invErr?.message)
    return { ok: false, reason: 'invoice_not_found' }
  }
  if (String(invoice.status ?? '').toLowerCase() !== 'paid') {
    return { ok: false, reason: 'invoice_not_paid' }
  }

  const amountPaidEur =
    typeof opts.amountPaidEur === 'number' && Number.isFinite(opts.amountPaidEur) && opts.amountPaidEur > 0
      ? opts.amountPaidEur
      : Number(invoice.amount_cents) > 0
        ? Math.round(Number(invoice.amount_cents)) / 100
        : 0

  let clientEmail = ''
  let clientName = ''
  const profileId = typeof invoice.profile_id === 'string' ? invoice.profile_id.trim() : ''
  if (profileId) {
    const { data: profile } = await admin
      .from('profiles')
      .select('email, full_name')
      .eq('id', profileId)
      .maybeSingle()
    clientEmail = String(profile?.email ?? '').trim()
    clientName = String(profile?.full_name ?? '').trim()
  }

  let route = ''
  if (bookingId) {
    const { data: booking } = await admin
      .from('transfer_bookings')
      .select('pickup_label, dropoff_label, client_email')
      .eq('id', bookingId)
      .maybeSingle()
    if (booking) {
      route = `${booking.pickup_label ?? ''} → ${booking.dropoff_label ?? ''}`.trim()
      if (!clientEmail) {
        clientEmail = String(booking.client_email ?? '').trim()
      }
    }
  }

  if (!clientEmail) {
    console.error('[transfer-payment-email] portal invoice paid — no client email', id)
    return { ok: false, reason: 'no_client_email' }
  }

  const content = buildPortalInvoicePaidThankYouEmail({
    enquiryReferenceId:
      typeof invoice.enquiry_reference_id === 'string' ? invoice.enquiry_reference_id.trim() : '',
    clientName,
    amountPaidEur,
    route: route.startsWith('→') ? '' : route
  })

  const resendKey = env.RESEND_API_KEY?.trim()
  const from = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !from) {
    console.error('[transfer-payment-email] Resend not configured')
    return { ok: false, reason: 'resend_not_configured' }
  }

  const resend = new Resend(resendKey)
  const { error: sendErr } = await resend.emails.send({
    from,
    to: clientEmail,
    subject: content.subject,
    html: content.html
  })
  if (sendErr) {
    console.error('[transfer-payment-email] portal invoice send', sendErr.message)
    return { ok: false, reason: 'send_failed', message: sendErr.message }
  }

  if (bookingId) {
    await recordBookingEmailEvent(admin, bookingId, emailAction, {
      portal_invoice_id: id,
      amountPaidEur,
      to: clientEmail.split('@')[1] ?? ''
    })
  }

  return { ok: true, sent: ['portal_invoice_paid'], to: clientEmail }
}
