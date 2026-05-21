import { createClient } from '@supabase/supabase-js'
import { verifyReviewToken } from './review-token-crypto.mjs'

const throwStatus = (message, code = 400) => {
  const e = new Error(message)
  e.statusCode = code
  throw e
}

/**
 * Public (no JWT): verify review token from email link, insert trip_reviews.
 * @param {import('node:process').ProcessEnv} env
 * @param {{ payload?: { bookingId?: string; token?: string; rating?: number; comment?: string; displayName?: string } }} meta
 */
export const handleTripReviewSubmit = async (env, meta = {}) => {
  const bookingId = typeof meta.payload?.bookingId === 'string' ? meta.payload.bookingId.trim() : ''
  const token = typeof meta.payload?.token === 'string' ? meta.payload.token.trim() : ''
  const rating = Number(meta.payload?.rating)
  const comment = typeof meta.payload?.comment === 'string' ? meta.payload.comment.trim() : ''
  const displayName = typeof meta.payload?.displayName === 'string' ? meta.payload.displayName.trim() : ''

  if (!bookingId || !token) {
    throwStatus('bookingId and token are required.', 400)
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throwStatus('rating must be 1–5.', 400)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Server is not configured.', 500)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: booking, error: bErr } = await admin.from('transfer_bookings').select('id, client_user_id, review_token_hash, status').eq('id', bookingId).maybeSingle()
  if (bErr || !booking) {
    throwStatus('Booking not found.', 404)
  }
  if (booking.status !== 'completed') {
    throwStatus('Reviews are only available after drop-off is complete.', 400)
  }
  if (!verifyReviewToken(token, booking.review_token_hash, env)) {
    throwStatus('Invalid or expired review link.', 403)
  }

  const { data: existing } = await admin.from('trip_reviews').select('id').eq('booking_id', bookingId).maybeSingle()
  if (existing) {
    return { ok: true, alreadySubmitted: true }
  }

  const { error: iErr } = await admin.from('trip_reviews').insert({
    booking_id: bookingId,
    client_user_id: booking.client_user_id,
    rating: Math.round(rating),
    comment,
    display_name: displayName || null
  })
  if (iErr) {
    throwStatus(iErr.message, 500)
  }

  await admin.from('transfer_bookings').update({ review_token_hash: null }).eq('id', bookingId)

  return { ok: true }
}
