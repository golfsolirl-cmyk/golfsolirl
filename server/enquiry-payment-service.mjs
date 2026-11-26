import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import {
  calcDeposit20Eur,
  formatEurIe,
  normalizePaymentRequestMode,
  resolvePaymentRequestAmounts,
  roundMoney2
} from '../shared/payment-request-mode.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

const parseMoney = (raw) => roundMoney2(raw)

const parseIsoDate = (raw) => {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return null
  }
  return s
}

/**
 * @param {unknown} formPayload
 * @returns {string | null}
 */
const readStoredPaymentRequestMode = (formPayload) => {
  if (!formPayload || typeof formPayload !== 'object' || Array.isArray(formPayload)) return null
  const meta = /** @type {Record<string, unknown>} */ (formPayload)._paymentRequest
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null
  const mode = /** @type {Record<string, unknown>} */ (meta).mode
  return typeof mode === 'string' ? normalizePaymentRequestMode(mode) : null
}

/**
 * Merge payment request mode into form_payload JSONB (no migration).
 * @param {unknown} formPayload
 * @param {string} mode
 * @param {ReturnType<typeof resolvePaymentRequestAmounts>} [resolved]
 */
const mergePaymentRequestIntoPayload = (formPayload, mode, resolved) => {
  const base =
    formPayload && typeof formPayload === 'object' && !Array.isArray(formPayload)
      ? { .../** @type {Record<string, unknown>} */ (formPayload) }
      : {}
  base._paymentRequest = {
    mode: normalizePaymentRequestMode(mode),
    ...(resolved
      ? {
          tripTotalEur: resolved.tripTotalEur,
          depositEur: resolved.depositEur,
          amountNowEur: resolved.amountNowEur,
          updatedAt: new Date().toISOString()
        }
      : { updatedAt: new Date().toISOString() })
  }
  return base
}

/**
 * @param {number | null} amountDue
 * @param {number | null} deposit
 * @param {number} received
 * @param {string | null} forcedStatus
 */
export const recomputeEnquiryPaymentStatus = (amountDue, deposit, received, forcedStatus = null) => {
  if (forcedStatus === 'refunded') {
    return 'refunded'
  }
  const due = amountDue != null && amountDue > 0 ? amountDue : null
  const dep = deposit != null && deposit > 0 ? deposit : null
  const rec = Number.isFinite(received) ? received : 0
  if (due != null && rec >= due - 0.001) {
    return 'paid_in_full'
  }
  if (dep != null && rec >= dep - 0.001) {
    return 'deposit_received'
  }
  if (rec > 0) {
    return 'deposit_received'
  }
  return 'awaiting_payment'
}

/**
 * @param {unknown} body
 * @param {import('node:process').ProcessEnv} env
 * @param {{ authHeader?: string; cookieHeader?: string }} meta
 */
export const handleEnquiryPaymentAdmin = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env, { cookieHeader: meta.cookieHeader })
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

  if (action === 'set_requested_services') {
    const enquiryIdForSvc = typeof body?.enquiryId === 'string' ? body.enquiryId.trim() : ''
    if (!enquiryIdForSvc) {
      throwStatus('enquiryId is required.', 400)
    }
    const raw = body?.requestedServices
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throwStatus('requestedServices object is required.', 400)
    }
    const requested_services = {
      transfers: Boolean(raw.transfers),
      accommodation: Boolean(raw.accommodation),
      golf_courses: Boolean(raw.golf_courses)
    }
    const { data, error } = await admin
      .from('enquiries')
      .update({ requested_services })
      .eq('id', enquiryIdForSvc)
      .select('id, requested_services')
      .maybeSingle()
    if (error) {
      throwStatus(error.message, 500)
    }
    if (!data) {
      throwStatus('Enquiry not found.', 404)
    }
    return { ok: true, enquiry: data }
  }

  if (action === 'list_awaiting') {
    const limitRaw = body?.limit
    const limit =
      typeof limitRaw === 'number' && Number.isFinite(limitRaw)
        ? Math.min(100, Math.max(1, Math.round(limitRaw)))
        : 50
    const { data, error } = await admin
      .from('enquiries')
      .select(
        'id, reference_id, full_name, email, amount_due_eur, deposit_eur, amount_received_eur, payment_reference, payment_status, last_payment_at, created_at, form_payload'
      )
      .eq('payment_status', 'awaiting_payment')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) {
      throwStatus(error.message, 500)
    }
    const items = (data ?? []).map((row) => ({
      ...row,
      payment_request_mode: readStoredPaymentRequestMode(row.form_payload)
    }))
    return { ok: true, items }
  }

  const enquiryId = typeof body?.enquiryId === 'string' ? body.enquiryId.trim() : ''
  if (!enquiryId && action !== 'list_awaiting') {
    throwStatus('enquiryId is required.', 400)
  }

  if (action === 'list_events') {
    const { data: events, error: evErr } = await admin
      .from('enquiry_payment_events')
      .select('id, amount_eur, paid_at, note, created_at, created_by')
      .eq('enquiry_id', enquiryId)
      .order('paid_at', { ascending: false })
      .order('created_at', { ascending: false })
    if (evErr) {
      throwStatus(evErr.message, 500)
    }
    const { data: enquiry, error: eErr } = await admin
      .from('enquiries')
      .select(
        'id, reference_id, amount_due_eur, deposit_eur, amount_received_eur, payment_reference, payment_status, payment_notes, last_payment_at, form_payload'
      )
      .eq('id', enquiryId)
      .maybeSingle()
    if (eErr) {
      throwStatus(eErr.message, 500)
    }
    if (!enquiry) {
      throwStatus('Enquiry not found.', 404)
    }
    return {
      ok: true,
      enquiry: {
        ...enquiry,
        payment_request_mode: readStoredPaymentRequestMode(enquiry.form_payload)
      },
      events: events ?? []
    }
  }

  if (action === 'set_amounts') {
    const { data: existing, error: fErr } = await admin
      .from('enquiries')
      .select(
        'id, reference_id, amount_due_eur, deposit_eur, amount_received_eur, payment_reference, payment_status, payment_notes, form_payload'
      )
      .eq('id', enquiryId)
      .maybeSingle()
    if (fErr) {
      throwStatus(fErr.message, 500)
    }
    if (!existing) {
      throwStatus('Enquiry not found.', 404)
    }

    const amountDue = body?.amountDueEur !== undefined ? parseMoney(body.amountDueEur) : existing.amount_due_eur
    let deposit = body?.depositEur !== undefined ? parseMoney(body.depositEur) : existing.deposit_eur
    const requestMode =
      body?.paymentRequestMode !== undefined
        ? normalizePaymentRequestMode(body.paymentRequestMode)
        : readStoredPaymentRequestMode(existing.form_payload) || 'deposit_20'

    if (requestMode === 'deposit_20' && (deposit == null || deposit <= 0) && amountDue != null && amountDue > 0) {
      deposit = calcDeposit20Eur(amountDue)
    }

    let paymentReference =
      typeof body?.paymentReference === 'string' ? body.paymentReference.trim() : existing.payment_reference
    if (!paymentReference) {
      paymentReference = String(existing.reference_id ?? '').trim() || null
    }
    const paymentNotes =
      typeof body?.paymentNotes === 'string' ? body.paymentNotes.trim() : existing.payment_notes
    const statusOverride = typeof body?.paymentStatus === 'string' ? body.paymentStatus.trim() : null
    const allowedStatuses = new Set(['awaiting_payment', 'deposit_received', 'paid_in_full', 'refunded'])
    const received = Number(existing.amount_received_eur) || 0
    let nextStatus = recomputeEnquiryPaymentStatus(
      amountDue,
      deposit,
      received,
      statusOverride === 'refunded' ? 'refunded' : null
    )
    if (statusOverride && allowedStatuses.has(statusOverride)) {
      nextStatus = statusOverride
    }

    const resolved = resolvePaymentRequestAmounts({
      mode: requestMode,
      tripTotalEur: amountDue,
      depositEur: deposit,
      amountReceivedEur: received
    })
    const nextPayload = mergePaymentRequestIntoPayload(existing.form_payload, requestMode, resolved)

    const { error: uErr } = await admin
      .from('enquiries')
      .update({
        amount_due_eur: amountDue,
        deposit_eur: deposit,
        payment_reference: paymentReference,
        payment_notes: paymentNotes || null,
        payment_status: nextStatus,
        form_payload: nextPayload
      })
      .eq('id', enquiryId)
    if (uErr) {
      throwStatus(uErr.message, 500)
    }
    return {
      ok: true,
      enquiryId,
      paymentStatus: nextStatus,
      paymentRequestMode: requestMode,
      amountNowEur: resolved.amountNowEur
    }
  }

  if (action === 'mark_payment_received') {
    const paidAt = parseIsoDate(body?.paidAt) ?? new Date().toISOString().slice(0, 10)
    const note = typeof body?.note === 'string' ? body.note.trim() : ''
    const presetRaw = typeof body?.preset === 'string' ? body.preset.trim().toLowerCase() : ''
    const preset = presetRaw === 'deposit' || presetRaw === 'full' ? presetRaw : null

    const { data: existing, error: fErr } = await admin
      .from('enquiries')
      .select(
        'id, reference_id, amount_due_eur, deposit_eur, amount_received_eur, payment_reference, payment_status, form_payload'
      )
      .eq('id', enquiryId)
      .maybeSingle()
    if (fErr) {
      throwStatus(fErr.message, 500)
    }
    if (!existing) {
      throwStatus('Enquiry not found.', 404)
    }

    const amountDue = existing.amount_due_eur != null ? Number(existing.amount_due_eur) : null
    let deposit = existing.deposit_eur != null ? Number(existing.deposit_eur) : null
    if ((deposit == null || deposit <= 0) && amountDue != null && amountDue > 0) {
      deposit = calcDeposit20Eur(amountDue)
    }
    const prevReceived = Number(existing.amount_received_eur) || 0
    const outstanding = amountDue != null ? Math.max(0, Math.round((amountDue - prevReceived) * 100) / 100) : null

    let amount = parseMoney(body?.amountEur)
    let ledgerNote = note

    if (preset === 'deposit') {
      const dep = deposit != null && deposit > 0 ? deposit : null
      if (dep == null) {
        throwStatus('Set a deposit amount (or trip total) before recording a 20% deposit.', 400)
      }
      const stillDue = Math.max(0, Math.round((dep - prevReceived) * 100) / 100)
      amount = outstanding != null ? Math.min(stillDue, outstanding) : stillDue
      if (amount <= 0) {
        throwStatus('Deposit is already covered by payments on file.', 400)
      }
      if (!ledgerNote) {
        ledgerNote = `Monzo · 20% deposit received · ref ${existing.payment_reference || existing.reference_id}`
      }
    } else if (preset === 'full') {
      if (outstanding == null || outstanding <= 0) {
        throwStatus('Nothing outstanding to mark as paid in full.', 400)
      }
      amount = outstanding
      if (!ledgerNote) {
        ledgerNote = `Monzo · full payment / remaining balance received · ref ${existing.payment_reference || existing.reference_id}`
      }
    }

    if (amount == null || amount <= 0) {
      throwStatus('amountEur must be a positive number (or use preset deposit / full).', 400)
    }

    const nextReceived = Math.round((prevReceived + amount) * 100) / 100
    const paymentReference =
      (typeof existing.payment_reference === 'string' && existing.payment_reference.trim()) ||
      String(existing.reference_id ?? '').trim() ||
      null

    const creatorId =
      auth.user && typeof auth.user.id === 'string' && auth.user.id !== 'admin-cookie-session' ? auth.user.id : null

    const { error: insErr } = await admin.from('enquiry_payment_events').insert({
      enquiry_id: enquiryId,
      amount_eur: amount,
      paid_at: paidAt,
      note: ledgerNote || null,
      created_by: creatorId
    })
    if (insErr) {
      throwStatus(insErr.message, 500)
    }

    const nextStatus = recomputeEnquiryPaymentStatus(amountDue, deposit, nextReceived, null)
    const lastPaymentAt = new Date(`${paidAt}T12:00:00Z`).toISOString()

    const { error: uErr } = await admin
      .from('enquiries')
      .update({
        amount_received_eur: nextReceived,
        payment_reference: paymentReference,
        payment_status: nextStatus,
        last_payment_at: lastPaymentAt,
        ...(deposit != null && existing.deposit_eur == null ? { deposit_eur: deposit } : {})
      })
      .eq('id', enquiryId)
    if (uErr) {
      throwStatus(uErr.message, 500)
    }

    const statusNice =
      nextStatus === 'paid_in_full'
        ? 'Paid in full'
        : nextStatus === 'deposit_received'
          ? 'Deposit paid'
          : nextStatus === 'awaiting_payment'
            ? 'Awaiting payment'
            : nextStatus

    return {
      ok: true,
      enquiryId,
      amountReceivedEur: nextReceived,
      amountRecordedEur: amount,
      paymentStatus: nextStatus,
      paymentReference,
      message: `Recorded ${formatEurIe(amount)} against ${paymentReference || 'reference'}. Status: ${statusNice}.`
    }
  }

  throwStatus('Unknown action.', 400)
}
