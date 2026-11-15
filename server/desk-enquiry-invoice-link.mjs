/**
 * Desk quotes and document invoices store the enquiry id, then charge Stripe
 * without a transfer id. The unpaid sweep can cancel that transfer after the
 * guest has already paid. Link only when one unpaid transfer for the same
 * guest has the same quoted total.
 */

const moneyCents = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return null
  return Math.round(amount * 100)
}

/**
 * @param {Array<Record<string, unknown>> | null | undefined} rows
 * @param {string} customerEmail
 * @param {number} amountCents
 * @returns {string | null}
 */
export const pickUnpaidTransferForDeskInvoice = (rows, customerEmail, amountCents) => {
  const email = String(customerEmail || '').trim().toLowerCase()
  const invoiceCents = Number(amountCents)
  if (!email || !Number.isFinite(invoiceCents) || invoiceCents < 50) return null
  const hits = []
  for (const row of rows || []) {
    const id = typeof row?.id === 'string' ? row.id.trim() : ''
    if (!id) continue
    if (String(row.client_email || '').trim().toLowerCase() !== email) continue
    if (String(row.payment_status || 'unpaid').toLowerCase() !== 'unpaid') continue
    const grossCents = moneyCents(row.admin_price_eur)
    if (grossCents == null || grossCents < 50 || grossCents !== invoiceCents) continue
    hits.push(id)
  }
  return hits.length === 1 ? hits[0] : null
}

/**
 * Portal invoices keep their own sync path. With no portal row, the transfer
 * id is what the webhook uses to mark the job paid.
 * @param {{ deskQuoteId: string, portalInvoiceId?: string | null, transferBookingId?: string | null }} input
 */
export const deskCheckoutPaymentMetadata = ({ deskQuoteId, portalInvoiceId, transferBookingId }) => {
  const quoteId = String(deskQuoteId || '').trim()
  const portalId = String(portalInvoiceId || '').trim()
  const transferId = String(transferBookingId || '').trim()
  /** @type {Record<string, string>} */
  const metadata = {}
  if (quoteId) metadata.desk_quote_id = quoteId
  if (portalId) {
    metadata.portal_invoice_id = portalId
  } else if (transferId) {
    metadata.transfer_booking_id = transferId
    metadata.payment_kind = 'full'
  }
  return {
    clientReferenceId: portalId || quoteId,
    metadata
  }
}

const missingPaymentColumn = (error) =>
  /payment_source|amount_received_eur|schema cache|does not exist/i.test(error?.message || '')

/**
 * Record a paid enquiry-linked desk invoice on the transfer. Retries without
 * the newer payment columns so a missing migration cannot drop the paid write.
 * Reopens a booking the unpaid sweep already cancelled.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} bookingId
 * @param {{ paidAt: string, paymentIntent?: string | null, sessionId?: string | null, amountEur?: number | null }} payment
 */
export const applyDeskEnquiryInvoicePayment = async (supabase, bookingId, payment) => {
  const id = String(bookingId || '').trim()
  if (!id) return { updated: false, reason: 'missing_booking' }

  const { data: booking, error: loadErr } = await supabase
    .from('transfer_bookings')
    .select('id, payment_status, status, cancel_reason, admin_price_eur')
    .eq('id', id)
    .maybeSingle()
  if (loadErr) {
    const err = new Error(loadErr.message)
    err.statusCode = 500
    throw err
  }
  if (!booking?.id) return { updated: false, reason: 'missing_booking' }

  const pay = String(booking.payment_status || 'unpaid').toLowerCase()
  const cancelledUnpaid = String(booking.status || '') === 'cancelled' && booking.cancel_reason === 'unpaid_timeout'
  if (pay === 'paid' && !cancelledUnpaid) return { updated: false, reason: 'already_paid' }
  if (pay !== 'unpaid' && pay !== 'deposit') return { updated: false, reason: 'not_payable' }

  const amount =
    typeof payment.amountEur === 'number' && Number.isFinite(payment.amountEur) && payment.amountEur > 0
      ? Math.round(payment.amountEur * 100) / 100
      : null
  const patch = {
    payment_status: 'paid',
    updated_at: payment.paidAt,
    stripe_payment_intent_id: payment.paymentIntent ?? null,
    stripe_checkout_session_id: payment.sessionId ?? null,
    balance_remind_at: null,
    balance_remind_sent_at: null
  }
  if (cancelledUnpaid) {
    patch.status = 'pending'
    patch.cancel_reason = null
  }
  const withMoney = amount != null ? { ...patch, payment_source: 'stripe', amount_received_eur: amount } : patch

  const write = (next) =>
    supabase.from('transfer_bookings').update(next).eq('id', id).in('payment_status', ['unpaid', 'deposit']).select('id').maybeSingle()

  let written = await write(withMoney)
  if (written.error && missingPaymentColumn(written.error)) {
    written = await write(patch)
  }
  if (written.error) {
    const err = new Error(written.error.message)
    err.statusCode = 500
    throw err
  }
  if (!written.data?.id) return { updated: false, reason: 'not_updated' }

  const { error: evErr } = await supabase.from('transfer_booking_events').insert({
    booking_id: id,
    actor_kind: 'system',
    action: 'desk_invoice_paid',
    meta: {
      amount_eur: amount,
      stripe_checkout_session_id: payment.sessionId ?? null,
      reopened: cancelledUnpaid
    }
  })
  if (evErr) {
    console.error('[desk-invoice] transfer event', evErr.message)
  }
  return { updated: true, reason: 'paid', reopened: cancelledUnpaid }
}
