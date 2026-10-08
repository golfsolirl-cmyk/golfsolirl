/** Postgres check_violation — booking_source not in transfer_bookings_booking_source_check. */
export const isTransferBookingSourceCheckFailure = (error) => {
  const code = String(error?.code ?? '')
  const msg = String(error?.message ?? '').toLowerCase()
  return code === '23514' || msg.includes('booking_source')
}

const TRANSFER_INSERT_SELECT = 'id, payment_status, admin_price_eur, deposit_percent'

/**
 * Insert the paid-invoice trip-pass row. Prefer `portal_invoice`; if production has not
 * applied 20260828110000 yet, retry as `website_enquiry` so the paid job is not dropped.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Record<string, unknown>} row
 */
export const insertTransferBookingFromPaidInvoiceRow = async (supabase, row) => {
  const first = await supabase.from('transfer_bookings').insert(row).select(TRANSFER_INSERT_SELECT).single()
  if (!first.error || row.booking_source !== 'portal_invoice' || !isTransferBookingSourceCheckFailure(first.error)) {
    return first
  }
  return supabase
    .from('transfer_bookings')
    .insert({ ...row, booking_source: 'website_enquiry' })
    .select(TRANSFER_INSERT_SELECT)
    .single()
}
