/**
 * Pure transfer payment/ownership guards shared by API handlers and tests.
 * Keep this module dependency-free so critical payment invariants can be tested without live services.
 */

export const transferBookingHasFullRefund = (booking) =>
  String(booking?.transfer_refund_status ?? 'none').trim().toLowerCase() === 'full'

export const isCheckoutSessionPaid = (session) =>
  String(session?.payment_status ?? '').trim().toLowerCase() === 'paid'

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} userId
 * @param {string} userEmail
 * @param {Record<string, unknown>} booking
 */
export const clientOwnsTransferBooking = async (admin, userId, userEmail, booking) => {
  if (booking.client_user_id === userId) {
    return true
  }

  const hasAssignedClient = typeof booking.client_user_id === 'string' && booking.client_user_id.trim() !== ''
  if (hasAssignedClient) {
    return false
  }

  const uEmail = (userEmail ?? '').trim().toLowerCase()
  const rowEmail = String(booking.client_email ?? '')
    .trim()
    .toLowerCase()
  if (uEmail && rowEmail === uEmail) {
    return true
  }

  const enqRef =
    typeof booking.enquiry_reference_id === 'string' ? booking.enquiry_reference_id.trim() : ''
  if (!enqRef) {
    return false
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('account_reference_id')
    .eq('id', userId)
    .maybeSingle()

  const accountRef =
    typeof profile?.account_reference_id === 'string' ? profile.account_reference_id.trim() : ''
  if (accountRef && accountRef === enqRef) {
    return true
  }

  if (uEmail) {
    const { data: enqMatch } = await admin
      .from('enquiries')
      .select('id')
      .eq('reference_id', enqRef)
      .ilike('email', uEmail)
      .maybeSingle()
    if (enqMatch?.id) {
      return true
    }
  }

  return false
}
