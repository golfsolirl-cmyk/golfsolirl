/**
 * Priced bookings with no deposit and no full payment are cancelled after 3 days.
 * The guest may reopen once. A second miss stays closed.
 */
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireUserFromBearer } from './auth-verify-user.mjs'
import { buildGsolMasterDocumentPdf } from './gsol-master-document-pdf.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml } from './email-layout.mjs'
import { emailFonts, escapeHtml, gs } from './branded-email-shell.mjs'
import { resolveResendToAddress, resendSandboxRecipientHint } from './resend-delivery-email.mjs'

export const UNPAID_HOLD_DAYS = 3
const HOLD_MS = UNPAID_HOLD_DAYS * 24 * 60 * 60 * 1000

const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

export const unpaidDeadlineFrom = (from = new Date()) => new Date(from.getTime() + HOLD_MS).toISOString()

const getAdmin = (env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throwStatus('Supabase is not configured on the server.', 500)
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const missingColumn = (error) => /unpaid_deadline_at|payment_attempt|schema cache|does not exist/i.test(error?.message || '')

/**
 * Start the 3-day pay window the first time a pending booking is given a price.
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} bookingId
 */
export const stampUnpaidDeadlineIfNeeded = async (admin, bookingId) => {
  const { data, error } = await admin
    .from('transfer_bookings')
    .select('payment_status, status, unpaid_deadline_at, admin_price_eur')
    .eq('id', bookingId)
    .maybeSingle()
  if (error) {
    if (!missingColumn(error)) {
      console.error('[unpaid-cancel] deadline lookup', error.message)
    }
    return
  }
  const price = Number(data?.admin_price_eur)
  if (!data || !Number.isFinite(price) || price < 0.5) return
  if (data.payment_status !== 'unpaid' || data.status !== 'pending' || data.unpaid_deadline_at) return
  const { error: upErr } = await admin
    .from('transfer_bookings')
    .update({ unpaid_deadline_at: unpaidDeadlineFrom() })
    .eq('id', bookingId)
  if (upErr && !missingColumn(upErr)) {
    console.error('[unpaid-cancel] deadline stamp', upErr.message)
  }
}

const paragraph = (text) =>
  `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.7;color:${gs.text};">${text}</p>`

const sendNotice = async (env, { to, subject, html, filename, pdfBytes }) => {
  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !fromEmail || !to) return { sent: false, reason: 'email_not_configured' }
  const resend = new Resend(resendKey)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: resolveResendToAddress(to, env),
    subject,
    html: finalizeGsolEmailHtml(html),
    attachments: pdfBytes
      ? [{ filename, content: Buffer.from(pdfBytes).toString('base64'), contentType: 'application/pdf' }]
      : undefined
  })
  if (error) {
    const hint = /only send|testing emails|verify a domain|not verified/i.test(error.message || '')
      ? ` ${resendSandboxRecipientHint(env)}`
      : ''
    return { sent: false, reason: `${error.message || 'send_failed'}${hint}` }
  }
  return { sent: true }
}

const noticePdf = async (row, kindTitle, notes) =>
  buildGsolMasterDocumentPdf({
    kind: 'booking_confirmation',
    title: kindTitle,
    reference: row.enquiry_reference_id || row.id.slice(0, 8).toUpperCase(),
    customerName: row.client_display_name || '',
    customerEmail: row.client_email || '',
    amountLabel: 'Quoted total',
    amountValue:
      typeof row.admin_price_eur === 'number'
        ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(row.admin_price_eur)
        : '',
    rows: [
      { label: 'Pickup', value: row.pickup_label || '' },
      { label: 'Drop-off', value: row.dropoff_label || '' }
    ],
    notes,
    filename: `golf-sol-${kindTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`
  })

const emailCancellation = async (env, row) => {
  const attempt = Number(row.payment_attempt) || 1
  const first = String(row.client_display_name || '').trim().split(/\s+/)[0] || 'there'
  const route = [row.pickup_label, row.dropoff_label].filter(Boolean).join(' to ') || 'your transfer'
  const again =
    attempt >= 2
      ? 'This was the second time the booking was left unpaid, so it is now closed. There is no further option to reopen it.'
      : 'You can reopen it once from your client dashboard. Pay the deposit or the full amount within 3 days. If it is cancelled again, it stays closed.'
  const subject = 'Your Golf Sol booking has been cancelled'
  const pdf = await noticePdf(
    row,
    'Booking cancelled',
    `Cancelled because neither a deposit nor the full amount was received within ${UNPAID_HOLD_DAYS} days. ${again}`
  )
  const html = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: `Your booking for ${route} is cancelled. ${attempt >= 2 ? 'It cannot be reopened.' : 'You can reopen it once from your dashboard.'}`,
    heroKicker: 'Golf Sol Ireland',
    heroTitle: 'This booking is cancelled',
    heroLead: route,
    heroMetaHtml: '',
    bodyHtml: [
      paragraph(`Hello ${escapeHtml(first)},`),
      paragraph(
        `We did not receive a deposit or the full payment within ${UNPAID_HOLD_DAYS} days, so <strong>${escapeHtml(route)}</strong> is cancelled. The note is attached as a PDF.`
      ),
      paragraph(escapeHtml(again))
    ].join('')
  })
  return sendNotice(env, {
    to: String(row.client_email || '').trim(),
    subject,
    html,
    filename: pdf.filename,
    pdfBytes: pdf.bytes
  })
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {NodeJS.ProcessEnv} env
 */
export const processUnpaidBookingCancellations = async (admin, env = process.env) => {
  const nowIso = new Date().toISOString()
  const agedIso = new Date(Date.now() - HOLD_MS).toISOString()
  const { data, error } = await admin
    .from('transfer_bookings')
    .select(
      'id, client_user_id, client_email, client_display_name, pickup_label, dropoff_label, enquiry_reference_id, admin_price_eur, payment_status, status, payment_attempt, unpaid_deadline_at, created_at'
    )
    .eq('payment_status', 'unpaid')
    .eq('status', 'pending')
    .gte('admin_price_eur', 0.5)
    .limit(80)

  if (error) {
    if (missingColumn(error)) {
      return { cancelled: 0, skipped: true, reason: 'migration_pending' }
    }
    throw error
  }

  const due = (data || []).filter((row) => {
    if (row.unpaid_deadline_at) return row.unpaid_deadline_at <= nowIso
    return row.created_at && row.created_at <= agedIso
  })

  const errors = []
  let cancelled = 0
  for (const row of due) {
    const { data: updated, error: upErr } = await admin
      .from('transfer_bookings')
      .update({
        status: 'cancelled',
        cancel_reason: 'unpaid_timeout',
        unpaid_deadline_at: null,
        updated_at: nowIso
      })
      .eq('id', row.id)
      .eq('status', 'pending')
      .eq('payment_status', 'unpaid')
      .select('id')
      .maybeSingle()
    if (upErr || !updated) {
      errors.push({ id: row.id, message: upErr?.message || 'not_pending' })
      continue
    }
    cancelled += 1
    const mailed = await emailCancellation(env, row).catch((e) => ({
      sent: false,
      reason: e instanceof Error ? e.message : 'email_failed'
    }))
    if (row.client_user_id) {
      await admin.from('portal_client_updates').insert({
        owner_id: row.client_user_id,
        title: 'Booking cancelled',
        summary:
          (Number(row.payment_attempt) || 1) >= 2
            ? 'This booking was cancelled because it was not paid. It cannot be reopened.'
            : 'This booking was cancelled because it was not paid within 3 days. You can reopen it once from your dashboard.',
        email_subject: 'Your Golf Sol booking has been cancelled',
        template_key: 'unpaid_booking_cancelled',
        attachment_filenames: []
      })
    }
    await admin.from('transfer_booking_events').insert({
      booking_id: row.id,
      actor_kind: 'system',
      action: 'cancelled_unpaid',
      meta: { emailed: mailed.sent === true, payment_attempt: Number(row.payment_attempt) || 1 }
    })
    if (mailed.sent === false && mailed.reason) {
      errors.push({ id: row.id, message: mailed.reason })
    }
  }

  return { cancelled, candidates: due.length, errors }
}

/**
 * Guest reopens a booking cancelled for non-payment. One reopen only.
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleTransferRebook = async (body, env = process.env, meta = {}) => {
  const auth = await requireUserFromBearer(meta.authHeader, env)
  if (!auth.ok) throwStatus(auth.message, auth.statusCode)

  const bookingId = typeof body?.bookingId === 'string' ? body.bookingId.trim() : ''
  if (!bookingId) throwStatus('bookingId is required.', 400)

  const admin = getAdmin(env)
  const { data: row, error } = await admin.from('transfer_bookings').select('*').eq('id', bookingId).maybeSingle()
  if (error) throwStatus(error.message, 500)
  if (!row) throwStatus('Booking not found.', 404)

  const email = String(auth.user.email || '').trim().toLowerCase()
  const owns = row.client_user_id === auth.user.id || String(row.client_email || '').trim().toLowerCase() === email
  if (!owns) throwStatus('This booking is not on your account.', 403)
  if (row.status !== 'cancelled' || row.cancel_reason !== 'unpaid_timeout') {
    throwStatus('This booking cannot be reopened.', 409)
  }
  if ((Number(row.payment_attempt) || 1) >= 2) {
    throwStatus('This booking was already reopened once. It cannot be started again.', 409)
  }

  const now = new Date().toISOString()
  const { data: updated, error: upErr } = await admin
    .from('transfer_bookings')
    .update({
      status: 'pending',
      payment_status: 'unpaid',
      payment_attempt: 2,
      cancel_reason: null,
      unpaid_deadline_at: unpaidDeadlineFrom(),
      updated_at: now
    })
    .eq('id', bookingId)
    .eq('status', 'cancelled')
    .select('id, client_email, client_display_name, pickup_label, dropoff_label, enquiry_reference_id, admin_price_eur')
    .maybeSingle()
  if (upErr) throwStatus(upErr.message, 500)
  if (!updated) throwStatus('This booking changed before it could be reopened. Refresh and try again.', 409)

  const first = String(updated.client_display_name || '').trim().split(/\s+/)[0] || 'there'
  const route = [updated.pickup_label, updated.dropoff_label].filter(Boolean).join(' to ') || 'your transfer'
  const pdf = await noticePdf(
    updated,
    'Booking reopened',
    `Reopened once. Pay the deposit or the full amount within ${UNPAID_HOLD_DAYS} days. If it is cancelled again, it stays closed.`
  )
  const subject = 'Your Golf Sol booking is open again'
  const html = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: `Pay within ${UNPAID_HOLD_DAYS} days. This is the last time this booking can be reopened.`,
    heroKicker: 'Golf Sol Ireland',
    heroTitle: 'Your booking is open again',
    heroLead: route,
    heroMetaHtml: '',
    bodyHtml: [
      paragraph(`Hello ${escapeHtml(first)},`),
      paragraph(
        `<strong>${escapeHtml(route)}</strong> is back on your dashboard. Pay the deposit or the full amount within ${UNPAID_HOLD_DAYS} days. The note is attached as a PDF.`
      ),
      paragraph('This is the last reopen. If it is cancelled again for non-payment, it stays closed.')
    ].join('')
  })
  await sendNotice(env, { to: updated.client_email, subject, html, filename: pdf.filename, pdfBytes: pdf.bytes })

  return { ok: true, bookingId, message: 'Booking reopened. Pay the deposit or the full amount within 3 days.' }
}
