/**
 * Enquiry "Send full amount" falls back to a Customers-desk invoice when the guest
 * has no portal profile. That Checkout must carry the transfer id, or the card
 * payment never lands on the job and the unpaid sweep can cancel it.
 */

const moneyCents = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return null
  return Math.round(amount * 100)
}

/**
 * Link only an unpaid transfer for this guest whose quoted total is the invoice.
 * A deposit already on file, or a different total, must not be marked paid in full.
 * @param {Record<string, unknown> | null | undefined} booking
 * @param {string} customerEmail
 * @param {number} amountCents
 */
export const deskInvoiceMayLinkTransfer = (booking, customerEmail, amountCents) => {
  const id = typeof booking?.id === 'string' ? booking.id.trim() : ''
  if (!id) return false
  const rowEmail = String(booking.client_email || '').trim().toLowerCase()
  const email = String(customerEmail || '').trim().toLowerCase()
  if (!rowEmail || rowEmail !== email) return false
  if (String(booking.payment_status || 'unpaid').toLowerCase() !== 'unpaid') return false
  const grossCents = moneyCents(booking.admin_price_eur)
  const invoiceCents = Number(amountCents)
  if (grossCents == null || !Number.isFinite(invoiceCents) || grossCents < 50 || grossCents !== invoiceCents) return false
  return true
}

/**
 * Stripe metadata for a desk invoice Checkout.
 * A portal invoice keeps the existing sync path. With no portal row, the transfer
 * id is what the webhook uses to mark the job paid.
 * @param {{ deskQuoteId: string, portalInvoiceId?: string | null, transferBookingId?: string | null }} input
 */
export const deskInvoiceCheckoutRefs = ({ deskQuoteId, portalInvoiceId, transferBookingId }) => {
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

const missingPaymentColumn = (error) => /payment_source|amount_received_eur|schema cache|does not exist/i.test(error?.message || '')

/**
 * Record a paid desk invoice on the linked transfer. Retries without the newer
 * payment columns so a missing migration cannot drop the paid write.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} bookingId
 * @param {{ paidAt: string, paymentIntent?: string | null, sessionId?: string | null, amountEur?: number | null }} payment
 */
export const applyDeskInvoiceTransferPayment = async (supabase, bookingId, payment) => {
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
  const withMoney =
    amount != null
      ? { ...patch, payment_source: 'stripe', amount_received_eur: amount }
      : patch

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
