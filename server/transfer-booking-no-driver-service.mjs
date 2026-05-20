import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { processDueBalanceReminders } from './transfer-payment-service.mjs'

const throwStatus = (message, code = 400) => {
  const e = new Error(message)
  e.statusCode = code
  throw e
}

/**
 * Cancel a pending unassigned transfer (no automatic client email).
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} bookingId
 */
const cancelPendingBookingNoDriver = async (admin, bookingId) => {
  const { data: b, error: fErr } = await admin.from('transfer_bookings').select('*').eq('id', bookingId).maybeSingle()
  if (fErr) {
    throwStatus(fErr.message, 500)
  }
  if (!b) {
    throwStatus('Booking not found.', 404)
  }
  if (b.status !== 'pending' || b.assigned_driver_id != null) {
    return { skipped: true, reason: 'not_pending_or_already_handled' }
  }

  const now = new Date().toISOString()
  const { data: updated, error: uErr } = await admin
    .from('transfer_bookings')
    .update({
      status: 'cancelled',
      cancel_reason: 'no_driver_admin',
      updated_at: now
    })
    .eq('id', bookingId)
    .eq('status', 'pending')
    .is('assigned_driver_id', null)
    .select('id, client_user_id')
    .maybeSingle()

  if (uErr) {
    throwStatus(uErr.message, 500)
  }
  if (!updated) {
    return { skipped: true, reason: 'race_on_cancel' }
  }

  await admin.from('transfer_booking_events').insert({
    booking_id: bookingId,
    actor_kind: 'admin',
    action: 'rejected_no_driver',
    meta: { source: 'no_driver_admin', emailed: false }
  })

  const { error: logErr } = await admin.from('portal_client_updates').insert({
    owner_id: b.client_user_id,
    title: 'Transfer request declined',
    summary:
      'Operations declined this transfer: no driver available. Our team will contact you with next steps — check your dashboard for updates.',
    email_subject: '',
    template_key: 'transfer_no_driver_declined',
    attachment_filenames: []
  })
  if (logErr) {
    console.error('[transfer-no-driver] portal_client_updates insert failed:', logErr.message)
  }

  return { skipped: false, bookingId, cancelReason: 'no_driver_admin' }
}

/**
 * Admin: decline a pending unassigned Costa transfer (no outbound email).
 * Email the client manually from admin Portal email studio when ready.
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleTransferRejectNoDriver = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Server is not configured.', 500)
  }

  const bookingId = typeof body?.bookingId === 'string' ? body.bookingId.trim() : ''
  if (!bookingId) {
    throwStatus('bookingId is required.', 400)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const result = await cancelPendingBookingNoDriver(admin, bookingId)
  if (result.skipped) {
    if (result.reason === 'race_on_cancel') {
      throwStatus('This booking changed before it could be declined. Refresh and try again.', 409)
    }
    throwStatus('This booking is not pending without a driver, or it was already declined.', 409)
  }
  return { ok: true, ...result, emailed: false }
}

/**
 * Cron: balance payment reminders only (automatic no-driver emails disabled).
 * Secured with CRON_SECRET.
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleTransferBookingNoDriverSweep = async (env = process.env, meta = {}) => {
  const expected = env.CRON_SECRET?.trim()
  const raw = typeof meta.authHeader === 'string' ? meta.authHeader.trim() : ''
  const token = raw.toLowerCase().startsWith('bearer ') ? raw.slice(7).trim() : raw
  if (!expected || token !== expected) {
    throwStatus('Unauthorized.', 401)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Server is not configured.', 500)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  let balanceReminders = { sent: 0, candidates: 0, errors: [] }
  try {
    balanceReminders = await processDueBalanceReminders(admin, env)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[transfer-booking-sweep] balance reminders', msg)
    balanceReminders = { sent: 0, candidates: 0, errors: [{ id: '_sweep', message: msg }] }
  }

  return {
    ok: true,
    noDriverSweep: 'disabled',
    closed: 0,
    candidates: 0,
    errors: [],
    balanceReminderSent: balanceReminders.sent,
    balanceReminderCandidates: balanceReminders.candidates,
    balanceReminderErrors: balanceReminders.errors
  }
}
