import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import {
  buildTransferBalanceReminderEmail,
  buildTransferDepositThankYouEmail,
  buildTransferFullPaymentThankYouEmail,
  buildTransferPaymentRequestEmail
} from './branded-transfer-payment-email.mjs'
import { publishTransferAdminPricePortalPdfs } from './transfer-portal-publish-admin-price-pdfs.mjs'
import { balanceDueReminderIso } from './transfer-payment-amounts.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {Record<string, unknown>} booking
 * @param {import('node:process').ProcessEnv} env
 */
const resolveClientEmail = async (admin, booking) => {
  const direct = String(booking.client_email ?? '').trim()
  if (direct) {
    return direct
  }
  const uid = booking.client_user_id
  if (!uid) {
    return ''
  }
  const { data, error } = await admin.from('profiles').select('email').eq('id', uid).maybeSingle()
  if (error) {
    console.error('[transfer-payment] profile email lookup', error.message)
    return ''
  }
  return String(data?.email ?? '').trim()
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {Record<string, unknown>} booking
 * @param {{ subject: string; html: string }} content
 * @param {import('node:process').ProcessEnv} env
 */
const sendResendHtml = async (admin, booking, content, env) => {
  const resendKey = env.RESEND_API_KEY?.trim()
  const from = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !from) {
    throwStatus('Resend is not configured.', 500)
  }
  const to = await resolveClientEmail(admin, booking)
  if (!to) {
    throwStatus('No client email on file for this transfer.', 400)
  }
  const resend = new Resend(resendKey)
  const { error: sendErr } = await resend.emails.send({
    from,
    to,
    subject: content.subject,
    html: content.html
  })
  if (sendErr) {
    throwStatus(sendErr.message ?? 'Resend failed', 500)
  }
}

/**
 * Due deposit rows: send balance reminder once.
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {import('node:process').ProcessEnv} env
 */
export const processDueBalanceReminders = async (admin, env = process.env) => {
  const nowIso = new Date().toISOString()
  const { data: rows, error: qErr } = await admin
    .from('transfer_bookings')
    .select('*')
    .eq('payment_status', 'deposit')
    .not('balance_remind_at', 'is', null)
    .is('balance_remind_sent_at', null)
    .lte('balance_remind_at', nowIso)

  if (qErr) {
    throwStatus(qErr.message, 500)
  }

  let sent = 0
  const errors = []

  for (const booking of rows ?? []) {
    const id = booking.id
    try {
      const pct = Number(booking.deposit_percent) || 20
      const content = buildTransferBalanceReminderEmail(booking, pct)
      await sendResendHtml(admin, booking, content, env)
      const sentNow = new Date().toISOString()
      const { data: locked, error: uErr } = await admin
        .from('transfer_bookings')
        .update({
          balance_remind_sent_at: sentNow,
          updated_at: sentNow
        })
        .eq('id', id)
        .is('balance_remind_sent_at', null)
        .select('id')
        .maybeSingle()

      if (uErr) {
        throw new Error(uErr.message)
      }
      if (!locked) {
        continue
      }
      await admin.from('transfer_booking_events').insert({
        booking_id: id,
        actor_kind: 'system',
        action: 'payment_balance_reminder_sent',
        meta: { at: nowIso }
      })
      sent += 1
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push({ id, message: msg })
      console.error('[transfer-payment] balance reminder', id, msg)
    }
  }

  return { sent, candidates: (rows ?? []).length, errors }
}

/**
 * Cron or duplicate of no-driver sweep auth.
 * @param {import('node:process').ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleTransferBalanceReminderSweep = async (env = process.env, meta = {}) => {
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
  return { ok: true, ...(await processDueBalanceReminders(admin, env)) }
}

/**
 * Admin: set payment + thank-you emails; schedule balance reminder on deposit.
 * @param {unknown} body
 * @param {import('node:process').ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleTransferPaymentAdmin = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Server is not configured.', 500)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const action = typeof body?.action === 'string' ? body.action.trim() : ''
  if (action === 'run_balance_reminders') {
    const r = await processDueBalanceReminders(admin, env)
    return { ok: true, ...r }
  }

  if (action === 'set_admin_price') {
    const bookingId = typeof body?.bookingId === 'string' ? body.bookingId.trim() : ''
    if (!bookingId) {
      throwStatus('bookingId is required.', 400)
    }
    const raw = body?.adminPriceEur
    let price = null
    if (raw === null || raw === undefined || raw === '') {
      price = null
    } else {
      const n = typeof raw === 'number' ? raw : Number(String(raw).replace(',', '.'))
      if (!Number.isFinite(n) || n < 0 || n > 999999.99) {
        throwStatus('adminPriceEur must be a non-negative number (or empty to clear).', 400)
      }
      price = Math.round(n * 100) / 100
    }
    let vatTreatment = null
    if (price !== null) {
      const rawVat = body?.adminPriceVatTreatment
      const v = typeof rawVat === 'string' ? rawVat.trim().toLowerCase() : ''
      if (v === 'services') {
        vatTreatment = 'services'
      } else if (v === 'tourism' || v === '') {
        vatTreatment = 'tourism'
      } else {
        throwStatus('adminPriceVatTreatment must be tourism or services when a price is set.', 400)
      }
    }
    const now = new Date().toISOString()
    const { error: pErr } = await admin
      .from('transfer_bookings')
      .update({
        admin_price_eur: price,
        admin_price_vat_treatment: vatTreatment,
        updated_at: now
      })
      .eq('id', bookingId)
    if (pErr) {
      throwStatus(pErr.message, 500)
    }
    await admin.from('transfer_booking_events').insert({
      booking_id: bookingId,
      actor_kind: 'admin',
      action: 'admin_price_set',
      meta: { admin_price_eur: price, admin_price_vat_treatment: vatTreatment }
    })
    let pdfPortal = null
    if (price !== null) {
      try {
        pdfPortal = await publishTransferAdminPricePortalPdfs(admin, env, bookingId)
      } catch (e) {
        console.error('[set_admin_price] portal pdf bundle', e)
        pdfPortal = {
          ok: false,
          reason: 'exception',
          message: e instanceof Error ? e.message : String(e)
        }
      }
    }
    return { ok: true, bookingId, adminPriceEur: price, adminPriceVatTreatment: vatTreatment, pdfPortal }
  }

  if (action === 'send_payment_request_email') {
    const bookingId = typeof body?.bookingId === 'string' ? body.bookingId.trim() : ''
    if (!bookingId) {
      throwStatus('bookingId is required.', 400)
    }
    const { data: row, error: fErr } = await admin.from('transfer_bookings').select('*').eq('id', bookingId).maybeSingle()
    if (fErr) {
      throwStatus(fErr.message, 500)
    }
    if (!row) {
      throwStatus('Booking not found.', 404)
    }
    const content = buildTransferPaymentRequestEmail(row)
    await sendResendHtml(admin, row, content, env)
    const to = await resolveClientEmail(admin, row)
    await admin.from('transfer_booking_events').insert({
      booking_id: bookingId,
      actor_kind: 'admin',
      action: 'payment_request_email_sent',
      meta: {
        toEmailDomain: to ? to.split('@')[1] ?? '' : '',
        admin_price_eur: row.admin_price_eur ?? null
      }
    })
    return { ok: true, bookingId, sentTo: to || null }
  }

  if (action !== 'set_payment') {
    throwStatus('Unknown action.', 400)
  }

  const bookingId = typeof body?.bookingId === 'string' ? body.bookingId.trim() : ''
  const nextStatus = typeof body?.paymentStatus === 'string' ? body.paymentStatus.trim().toLowerCase() : ''
  if (!bookingId || !['unpaid', 'deposit', 'paid'].includes(nextStatus)) {
    throwStatus('bookingId and paymentStatus (unpaid|deposit|paid) are required.', 400)
  }

  const depositPercentRaw = body?.depositPercent
  const depositPercent =
    typeof depositPercentRaw === 'number' && Number.isFinite(depositPercentRaw)
      ? Math.min(99, Math.max(1, Math.round(depositPercentRaw)))
      : typeof depositPercentRaw === 'string' && depositPercentRaw.trim()
        ? Math.min(99, Math.max(1, Math.round(Number(depositPercentRaw))))
        : 20

  const sendEmails = body?.sendCustomerEmails !== false

  const { data: row, error: fErr } = await admin.from('transfer_bookings').select('*').eq('id', bookingId).maybeSingle()
  if (fErr) {
    throwStatus(fErr.message, 500)
  }
  if (!row) {
    throwStatus('Booking not found.', 404)
  }

  const prev = String(row.payment_status ?? 'unpaid')
  if (prev === nextStatus) {
    return {
      ok: true,
      bookingId,
      unchanged: true,
      paymentStatus: nextStatus,
      message: 'Status was already set — skipped duplicate thank-you email and reminder reset.'
    }
  }

  const now = new Date().toISOString()
  const remindAt = nextStatus === 'deposit' ? balanceDueReminderIso(row.scheduled_at) : null

  const patch = {
    payment_status: nextStatus,
    deposit_percent: nextStatus === 'deposit' ? depositPercent : Number(row.deposit_percent) || 20,
    updated_at: now
  }
  if (nextStatus === 'unpaid') {
    patch.stripe_payment_intent_id = null
    patch.stripe_checkout_session_id = null
  }
  if (nextStatus === 'deposit') {
    patch.balance_remind_at = remindAt
    patch.balance_remind_sent_at = null
  } else {
    patch.balance_remind_at = null
    patch.balance_remind_sent_at = null
  }

  const { error: uErr } = await admin.from('transfer_bookings').update(patch).eq('id', bookingId)
  if (uErr) {
    throwStatus(uErr.message, 500)
  }

  const { data: fresh, error: r2 } = await admin.from('transfer_bookings').select('*').eq('id', bookingId).maybeSingle()
  if (r2 || !fresh) {
    throwStatus(r2?.message ?? 'Reload failed', 500)
  }

  let thankYouSent = null
  let thankYouError = null

  if (sendEmails && prev !== nextStatus) {
    try {
      if (nextStatus === 'deposit') {
        const pct = Number(fresh.deposit_percent) || 20
        await sendResendHtml(admin, fresh, buildTransferDepositThankYouEmail(fresh, pct), env)
        thankYouSent = 'deposit'
      } else if (nextStatus === 'paid') {
        await sendResendHtml(admin, fresh, buildTransferFullPaymentThankYouEmail(fresh), env)
        thankYouSent = 'full'
      }
    } catch (e) {
      thankYouError = e instanceof Error ? e.message : String(e)
    }
  }

  await admin.from('transfer_booking_events').insert({
    booking_id: bookingId,
    actor_kind: 'admin',
    action: 'payment_status_updated',
    meta: {
      from: prev,
      to: nextStatus,
      depositPercent: fresh.deposit_percent,
      balanceRemindAt: fresh.balance_remind_at,
      thankYouSent,
      thankYouError
    }
  })

  return {
    ok: true,
    bookingId,
    paymentStatus: nextStatus,
    balanceRemindAt: fresh.balance_remind_at,
    thankYouSent,
    thankYouError
  }
}
