import { depositAmountEur, normalizedDepositPercent } from './transfer-payment-amounts.mjs'
import { notifyClientPortalTransferPayment } from './portal-transfer-payment-notify.mjs'
import { publishTransferPortalPaymentReceipt } from './transfer-portal-publish-payment-pdf.mjs'

/**
 * When a portal invoice is paid, activate the client trip pass by marking the linked
 * `transfer_bookings` row paid (or creating one from the enquiry when missing).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase service role
 * @param {string} invoiceId
 * @param {{ paymentIntent?: string | null, stripeSessionId?: string | null, amountEur?: number | null }} [opts]
 * @returns {Promise<{ synced: boolean, bookingId?: string, created?: boolean, reason?: string }>}
 */
export const syncTransferBookingFromPaidPortalInvoice = async (supabase, invoiceId, opts = {}) => {
  const id = String(invoiceId ?? '').trim()
  if (!id) {
    return { synced: false, reason: 'missing_invoice_id' }
  }

  const { data: invoice, error: invErr } = await supabase
    .from('portal_invoices')
    .select(
      'id, status, amount_cents, enquiry_id, enquiry_reference_id, profile_id, stripe_payment_intent_id, stripe_checkout_session_id, paid_at'
    )
    .eq('id', id)
    .maybeSingle()

  if (invErr) {
    const err = new Error(invErr.message)
    err.statusCode = 500
    throw err
  }
  if (!invoice?.id) {
    return { synced: false, reason: 'invoice_not_found' }
  }
  if (String(invoice.status ?? '').toLowerCase() !== 'paid') {
    return { synced: false, reason: 'invoice_not_paid' }
  }

  const ref =
    typeof invoice.enquiry_reference_id === 'string' ? invoice.enquiry_reference_id.trim().toUpperCase() : ''
  const paymentIntent =
    opts.paymentIntent?.trim() ||
    (typeof invoice.stripe_payment_intent_id === 'string' ? invoice.stripe_payment_intent_id.trim() : '') ||
    null
  const sessionId =
    opts.stripeSessionId?.trim() ||
    (typeof invoice.stripe_checkout_session_id === 'string' ? invoice.stripe_checkout_session_id.trim() : '') ||
    null
  const amountEur =
    typeof opts.amountEur === 'number' && Number.isFinite(opts.amountEur) && opts.amountEur > 0
      ? opts.amountEur
      : Number(invoice.amount_cents) > 0
        ? Math.round(Number(invoice.amount_cents)) / 100
        : null

  let booking = await findTransferBookingForInvoice(supabase, { ref, enquiryId: invoice.enquiry_id })
  let created = false

  if (!booking?.id) {
    const createdRow = await createTransferBookingFromPaidInvoice(supabase, invoice, amountEur)
    if (!createdRow?.id) {
      return { synced: false, reason: 'no_transfer_booking' }
    }
    booking = createdRow
    created = true
  }

  const st = String(booking.payment_status ?? 'unpaid').toLowerCase()
  if (st === 'paid') {
    return { synced: true, bookingId: booking.id, created, reason: 'already_paid' }
  }

  const now = new Date().toISOString()
  const patch = {
    payment_status: 'paid',
    balance_remind_at: null,
    balance_remind_sent_at: null,
    updated_at: now,
    stripe_payment_intent_id: paymentIntent,
    stripe_checkout_session_id: sessionId
  }

  if (amountEur != null && amountEur > 0 && (!Number(booking.admin_price_eur) || Number(booking.admin_price_eur) <= 0)) {
    patch.admin_price_eur = amountEur
  }

  const { data: updated, error: upErr } = await supabase
    .from('transfer_bookings')
    .update(patch)
    .eq('id', booking.id)
    .in('payment_status', ['unpaid', 'deposit'])
    .select('id')
    .maybeSingle()

  if (upErr) {
    const err = new Error(upErr.message)
    err.statusCode = 500
    throw err
  }

  if (!updated?.id && st !== 'paid') {
    return { synced: false, bookingId: booking.id, reason: 'payment_status_unchanged' }
  }

  const bookingId = updated?.id ?? booking.id

  const { error: evErr } = await supabase.from('transfer_booking_events').insert({
    booking_id: bookingId,
    actor_kind: 'system',
    action: 'portal_invoice_paid_trip_pass_sync',
    meta: {
      portal_invoice_id: invoice.id,
      enquiry_reference_id: ref || null,
      created_booking: created
    }
  })
  if (evErr) {
    console.error('[portal-invoice-transfer-sync] event insert', evErr.message)
  }

  try {
    const gross = Number(patch.admin_price_eur ?? booking.admin_price_eur)
    const receiptAmount =
      amountEur != null && amountEur > 0
        ? amountEur
        : Number.isFinite(gross) && gross > 0
          ? gross
          : 0
    if (receiptAmount > 0) {
      const r = await publishTransferPortalPaymentReceipt(supabase, bookingId, {
        receiptKind: 'paid_in_full',
        amountEur: receiptAmount,
        stripeSessionId: sessionId,
        stripePaymentIntentId: paymentIntent
      })
      if (!r.ok) {
        console.error('[portal-invoice-transfer-sync] receipt pdf', r.reason, r.message ?? '')
      }
    }
  } catch (e) {
    console.error('[portal-invoice-transfer-sync] receipt pdf', e)
  }

  await notifyClientPortalTransferPayment(supabase, bookingId)
  return { synced: true, bookingId, created }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ ref: string, enquiryId?: string | null }} keys
 */
const findTransferBookingForInvoice = async (supabase, { ref, enquiryId }) => {
  if (ref) {
    const { data: byRef } = await supabase
      .from('transfer_bookings')
      .select('id, payment_status, admin_price_eur, deposit_percent, client_user_id, enquiry_reference_id')
      .ilike('enquiry_reference_id', ref)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (byRef?.id) {
      return byRef
    }
  }

  if (enquiryId) {
    const { data: enquiry } = await supabase
      .from('enquiries')
      .select('reference_id, email, full_name, phone, interest')
      .eq('id', enquiryId)
      .maybeSingle()
    const enquiryRef = typeof enquiry?.reference_id === 'string' ? enquiry.reference_id.trim() : ''
    if (enquiryRef) {
      const { data: byEnquiryRef } = await supabase
        .from('transfer_bookings')
        .select('id, payment_status, admin_price_eur, deposit_percent, client_user_id, enquiry_reference_id')
        .ilike('enquiry_reference_id', enquiryRef)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (byEnquiryRef?.id) {
        return byEnquiryRef
      }
    }
  }

  return null
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Record<string, unknown>} invoice
 * @param {number | null} amountEur
 */
const createTransferBookingFromPaidInvoice = async (supabase, invoice, amountEur) => {
  const profileId = typeof invoice.profile_id === 'string' ? invoice.profile_id.trim() : ''
  if (!profileId) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, phone_e164')
    .eq('id', profileId)
    .maybeSingle()

  let enquiry = null
  if (invoice.enquiry_id) {
    const { data } = await supabase
      .from('enquiries')
      .select('reference_id, email, full_name, phone, interest')
      .eq('id', invoice.enquiry_id)
      .maybeSingle()
    enquiry = data
  }

  const ref =
    (typeof invoice.enquiry_reference_id === 'string' && invoice.enquiry_reference_id.trim()) ||
    (typeof enquiry?.reference_id === 'string' && enquiry.reference_id.trim()) ||
    ''

  const row = {
    client_user_id: profileId,
    client_email: (profile?.email ?? enquiry?.email ?? '').trim().toLowerCase() || null,
    client_display_name: (profile?.full_name ?? enquiry?.full_name ?? '').trim() || null,
    client_phone: (profile?.phone ?? profile?.phone_e164 ?? enquiry?.phone ?? '').trim() || null,
    pickup_label: 'Trip — confirm pickup with guest',
    dropoff_label: 'Trip — confirm destination with guest',
    status: 'pending',
    booking_source: 'portal_invoice',
    enquiry_reference_id: ref || null,
    admin_price_eur: amountEur != null && amountEur > 0 ? amountEur : null,
    payment_status: 'paid',
    deposit_percent: 20,
    stripe_payment_intent_id:
      typeof invoice.stripe_payment_intent_id === 'string' ? invoice.stripe_payment_intent_id : null,
    stripe_checkout_session_id:
      typeof invoice.stripe_checkout_session_id === 'string' ? invoice.stripe_checkout_session_id : null
  }

  const { data: inserted, error } = await supabase.from('transfer_bookings').insert(row).select('id, payment_status, admin_price_eur, deposit_percent').single()
  if (error || !inserted?.id) {
    console.error('[portal-invoice-transfer-sync] create booking', error?.message)
    return null
  }
  return inserted
}

/** Admin repair: sync trip pass for a paid invoice matched by enquiry reference. */
export const syncTripPassForEnquiryReference = async (supabase, referenceId) => {
  const ref = String(referenceId ?? '').trim().toUpperCase()
  if (!ref) {
    return { synced: false, reason: 'missing_reference' }
  }

  const { data: invoice } = await supabase
    .from('portal_invoices')
    .select('id, status')
    .ilike('enquiry_reference_id', ref)
    .eq('status', 'paid')
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!invoice?.id) {
    return { synced: false, reason: 'no_paid_invoice_for_reference' }
  }

  return syncTransferBookingFromPaidPortalInvoice(supabase, invoice.id)
}

export const estimateCollectedEurForBooking = (booking) => {
  const gross = Number(booking.admin_price_eur)
  if (!Number.isFinite(gross) || gross <= 0) {
    return 0
  }
  const st = String(booking.payment_status ?? 'unpaid').toLowerCase()
  if (st === 'paid') {
    return gross
  }
  if (st === 'deposit') {
    return depositAmountEur(gross, normalizedDepositPercent(booking.deposit_percent))
  }
  return 0
}
