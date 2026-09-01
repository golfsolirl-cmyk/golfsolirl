/**
 * Whether an authenticated client may act on a transfer booking (checkout / sync).
 * Email and account-reference fallbacks apply only when client_user_id is unset —
 * never override an existing assignment (prevents identity-spoof IDOR).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} userId
 * @param {string} userEmail JWT / auth.users email (not profiles.email)
 * @param {Record<string, unknown>} booking
 */
export const clientOwnsTransferBooking = async (admin, userId, userEmail, booking) => {
  if (booking.client_user_id === userId) {
    return true
  }

  // Assigned to someone else — never grant ownership via email / account-ref fallbacks.
  if (booking.client_user_id != null && booking.client_user_id !== '') {
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
