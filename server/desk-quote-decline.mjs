const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

/**
 * A decline may replace an open quote. It must not replace `paid`:
 * the quote email keeps its Decline button after the guest has paid,
 * and the hold PDF is built before the status write returns.
 */
export const DESK_QUOTE_DECLINE_FROM = ['sent', 'accepted', 'invoiced']

/**
 * Atomically mark a quote declined. If a payment landed first, leave `paid` in place.
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {{ id: string, status?: string, decided_at?: string | null }} row
 */
export const claimDeskQuoteDecline = async (db, row) => {
  const now = new Date().toISOString()
  const claim = await db
    .from('desk_quotes')
    .update({
      status: 'declined',
      decided_at: row.decided_at || now,
      updated_at: now
    })
    .eq('id', row.id)
    .in('status', DESK_QUOTE_DECLINE_FROM)
    .select('id')
    .maybeSingle()
  if (claim.error) throwStatus(claim.error.message, 500)
  if (claim.data?.id) return { claimed: true, status: 'declined' }

  const again = await db.from('desk_quotes').select('status').eq('id', row.id).maybeSingle()
  if (again.error) throwStatus(again.error.message, 500)
  return { claimed: false, status: again.data?.status || row.status || '' }
}
