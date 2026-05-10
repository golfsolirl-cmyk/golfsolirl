import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { emailFonts, gs } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml, getGsolSiteUrl } from './email-layout.mjs'
import { processDueBalanceReminders } from './transfer-payment-service.mjs'

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')

const throwStatus = (message, code = 400) => {
  const e = new Error(message)
  e.statusCode = code
  throw e
}

/**
 * @param {Record<string, unknown>} booking
 * @param {'admin' | 'auto'} source
 * @param {import('node:process').ProcessEnv} env
 */
const sendNoDriverEmail = async (booking, source, env) => {
  const resendKey = env.RESEND_API_KEY?.trim()
  const from = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !from) {
    throwStatus('Resend is not configured.', 500)
  }

  const clientTo = (booking.client_email || '').trim()
  if (!clientTo) {
    throwStatus('Booking has no client email.', 400)
  }

  const site = getGsolSiteUrl()
  const subject =
    source === 'auto'
      ? 'Golf Sol Ireland — transfer request update'
      : 'Golf Sol Ireland — transfer request declined'

  const heroTitle = 'No driver available this time'
  const heroLead =
    source === 'auto'
      ? 'We are sorry — we were not able to assign a driver to your Costa transfer request within two hours. Please try another time or message the team and we will help you plan alternatives.'
      : 'We are sorry — we are not able to cover this transfer run with our driver network right now. Please try another time or message the team from your dashboard and we will help you plan alternatives.'

  const bodyHtml = `<p style="margin:0 0 12px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.7;color:${gs.text};">Requested route:<br /><strong>${esc(booking.pickup_label)}</strong> → <strong>${esc(booking.dropoff_label)}</strong></p>
    <p style="margin:0 0 12px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.7;color:${gs.text};">You can submit a new request from your <a href="${site}/dashboard" style="color:${gs.green};font-weight:800;text-decoration:none;">client dashboard</a> whenever suits.</p>`

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: heroLead.slice(0, 120),
    heroKicker: 'Golf Sol Ireland',
    heroTitle,
    heroLead,
    heroMetaHtml: `<div style="font-size:12px;line-height:1.6;color:rgba(255,255,255,0.82);">Questions? Call +353 87 446 4766</div>`,
    bodyHtml
  })
  const html = finalizeGsolEmailHtml(htmlRaw)

  const resend = new Resend(resendKey)
  const { error: sendErr } = await resend.emails.send({
    from,
    to: clientTo,
    subject,
    html
  })
  if (sendErr) {
    throwStatus(sendErr.message ?? 'Resend failed', 500)
  }
}

/**
 * Email first, then cancel row (so a failed email leaves the booking pending for retry).
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {Record<string, unknown>} booking full row
 * @param {string} bookingId
 * @param {'admin' | 'auto'} source
 * @param {import('node:process').ProcessEnv} env
 */
const finalizeNoDriverAfterEmail = async (admin, booking, bookingId, source, env) => {
  const cancelReason = source === 'admin' ? 'no_driver_admin' : 'no_driver_auto'
  const now = new Date().toISOString()

  const { data: updated, error: uErr } = await admin
    .from('transfer_bookings')
    .update({
      status: 'cancelled',
      cancel_reason: cancelReason,
      no_driver_notified_at: now,
      updated_at: now
    })
    .eq('id', bookingId)
    .eq('status', 'pending')
    .is('assigned_driver_id', null)
    .is('no_driver_notified_at', null)
    .select('id, client_user_id')
    .maybeSingle()

  if (uErr) {
    throwStatus(uErr.message, 500)
  }
  if (!updated) {
    console.warn('[transfer-no-driver] email sent but booking state changed before cancel:', bookingId)
    return { skipped: true, reason: 'race_after_email' }
  }

  await admin.from('transfer_booking_events').insert({
    booking_id: bookingId,
    actor_kind: source === 'auto' ? 'system' : 'admin',
    action: 'rejected_no_driver',
    meta: { source: cancelReason }
  })

  const summary =
    source === 'auto'
      ? 'Automatic: no driver assigned within two hours. We emailed you with next steps.'
      : 'Operations declined this transfer: no driver available. We emailed you with next steps.'

  const { error: logErr } = await admin.from('portal_client_updates').insert({
    owner_id: booking.client_user_id,
    title: 'Transfer request — no driver available',
    summary,
    email_subject: source === 'auto' ? 'Transfer request update' : 'Transfer request declined',
    template_key: 'transfer_no_driver',
    attachment_filenames: []
  })
  if (logErr) {
    console.error('[transfer-no-driver] portal_client_updates insert failed:', logErr.message)
  }

  return { skipped: false, bookingId, cancelReason }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} bookingId
 * @param {'admin' | 'auto'} source
 * @param {import('node:process').ProcessEnv} env
 */
const cancelPendingBookingNoDriver = async (admin, bookingId, source, env) => {
  const { data: b, error: fErr } = await admin.from('transfer_bookings').select('*').eq('id', bookingId).maybeSingle()
  if (fErr) {
    throwStatus(fErr.message, 500)
  }
  if (!b) {
    throwStatus('Booking not found.', 404)
  }
  if (b.status !== 'pending' || b.assigned_driver_id != null || b.no_driver_notified_at != null) {
    return { skipped: true, reason: 'not_pending_or_already_handled' }
  }

  await sendNoDriverEmail(b, source, env)
  return finalizeNoDriverAfterEmail(admin, b, bookingId, source, env)
}

/**
 * Admin: decline a pending unassigned Costa transfer; email + portal log.
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
  const result = await cancelPendingBookingNoDriver(admin, bookingId, 'admin', env)
  if (result.skipped) {
    if (result.reason === 'race_after_email') {
      return {
        ok: true,
        partial: true,
        message:
          'The apology email was sent, but the booking could not be cancelled automatically (state changed). Check this row in Supabase or decline again if it is still pending.'
      }
    }
    throwStatus('This booking is not pending without a driver, or it was already declined.', 409)
  }
  return { ok: true, ...result }
}

/**
 * Cron: pending + unassigned + created_at older than 2h + not yet notified.
 * Secured with CRON_SECRET (Vercel sets Authorization: Bearer &lt;CRON_SECRET&gt; when configured).
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
  const cutoff = new Date(Date.now() - TWO_HOURS_MS).toISOString()

  const { data: rows, error: qErr } = await admin
    .from('transfer_bookings')
    .select('id')
    .eq('status', 'pending')
    .is('assigned_driver_id', null)
    .is('no_driver_notified_at', null)
    .lte('created_at', cutoff)

  if (qErr) {
    throwStatus(qErr.message, 500)
  }

  const ids = (rows ?? []).map((r) => r.id).filter(Boolean)
  let closed = 0
  const errors = []

  for (const id of ids) {
    try {
      const result = await cancelPendingBookingNoDriver(admin, id, 'auto', env)
      if (!result.skipped) {
        closed += 1
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push({ id, message: msg })
      console.error('[transfer-booking-sweep]', id, msg)
    }
  }

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
    candidates: ids.length,
    closed,
    errors,
    balanceReminderSent: balanceReminders.sent,
    balanceReminderCandidates: balanceReminders.candidates,
    balanceReminderErrors: balanceReminders.errors
  }
}
