/**
 * Pure guard: client package-mirror DELETE eligibility.
 * Keep in sync with:
 * - supabase/migrations/20260811120000_transfer_bookings_client_delete_unpaid_mirror_only.sql
 * - src/lib/sync-trip-workspace-transfer-booking.ts (`clientMayDeletePackageMirrorTransferBooking`)
 */
export const clientMayDeletePackageMirrorTransferBooking = (row) => {
  const pay = String(row?.payment_status ?? 'unpaid').toLowerCase()
  if (pay !== 'unpaid') {
    return false
  }
  const refund = String(row?.transfer_refund_status ?? 'none').toLowerCase()
  if (refund !== 'none') {
    return false
  }
  if (Number(row?.transfer_refund_total_eur ?? 0) > 0) {
    return false
  }
  if (row?.stripe_payment_intent_id || row?.stripe_checkout_session_id) {
    return false
  }
  if (row?.assigned_driver_id) {
    return false
  }
  return true
}
