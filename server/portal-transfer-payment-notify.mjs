/**
 * After Stripe marks a transfer paid/deposit, nudge the client portal inbox + Realtime (portal_client_updates).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} bookingId
 */
export const notifyClientPortalTransferPayment = async (admin, bookingId) => {
  const id = String(bookingId ?? '').trim()
  if (!id) {
    return
  }

  const { data: row, error } = await admin
    .from('transfer_bookings')
    .select('client_user_id, payment_status, pickup_label, dropoff_label')
    .eq('id', id)
    .maybeSingle()

  if (error || !row?.client_user_id) {
    return
  }

  const pay = String(row.payment_status ?? 'unpaid').toLowerCase()
  const route = `${String(row.pickup_label ?? '').trim() || 'Pickup'} → ${String(row.dropoff_label ?? '').trim() || 'Drop-off'}`
  const title =
    pay === 'paid'
      ? 'Transfer paid in full'
      : pay === 'deposit'
        ? 'Transfer deposit received'
        : 'Transfer payment updated'
  const summary =
    pay === 'paid'
      ? `${route}: payment complete — your trip pass is ready under Trip pass. Receipts are in Your transfers.`
      : pay === 'deposit'
        ? `${route}: deposit received. Open Payments to pay the remaining balance. Your trip pass unlocks when paid in full.`
        : `${route}: payment status updated. Open Your trip → transfers for details.`

  const { error: logErr } = await admin.from('portal_client_updates').insert({
    owner_id: row.client_user_id,
    title,
    summary,
    email_subject: title,
    template_key: pay === 'paid' ? 'stripe_transfer_paid_full' : pay === 'deposit' ? 'stripe_transfer_deposit' : 'stripe_transfer_payment',
    attachment_filenames: []
  })

  if (logErr) {
    console.error('[portal-transfer-payment-notify] portal_client_updates', logErr.message)
  }
}
