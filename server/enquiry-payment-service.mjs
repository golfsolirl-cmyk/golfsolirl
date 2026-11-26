import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

const parseMoney = (raw) => {
  if (raw === null || raw === undefined || raw === '') {
    return null
  }
  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, '').trim())
  if (!Number.isFinite(n) || n < 0) {
    return null
  }
  return Math.round(n * 100) / 100
}

const parseIsoDate = (raw) => {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return null
  }
  return s
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

  if (action === 'list_awaiting') {
    const limitRaw = body?.limit
    const limit =
      typeof limitRaw === 'number' && Number.isFinite(limitRaw)
        ? Math.min(100, Math.max(1, Math.round(limitRaw)))
        : 50
    const { data, error } = await admin
      .from('enquiries')
      .select(
        'id, reference_id, full_name, email, amount_due_eur, deposit_eur, amount_received_eur, payment_reference, payment_status, last_payment_at, created_at'
      )
      .eq('payment_status', 'awaiting_payment')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) {
      throwStatus(error.message, 500)
    }
    return { ok: true, items: data ?? [] }
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
        'id, reference_id, amount_due_eur, deposit_eur, amount_received_eur, payment_reference, payment_status, payment_notes, last_payment_at'
      )
      .eq('id', enquiryId)
      .maybeSingle()
    if (eErr) {
      throwStatus(eErr.message, 500)
    }
    if (!enquiry) {
      throwStatus('Enquiry not found.', 404)
    }
    return { ok: true, enquiry, events: events ?? [] }
  }

  if (action === 'set_amounts') {
    const { data: existing, error: fErr } = await admin
      .from('enquiries')
      .select('id, reference_id, amount_due_eur, deposit_eur, amount_received_eur, payment_reference, payment_status')
      .eq('id', enquiryId)
      .maybeSingle()
    if (fErr) {
      throwStatus(fErr.message, 500)
    }
    if (!existing) {
      throwStatus('Enquiry not found.', 404)
    }

    const amountDue = body?.amountDueEur !== undefined ? parseMoney(body.amountDueEur) : existing.amount_due_eur
    const deposit = body?.depositEur !== undefined ? parseMoney(body.depositEur) : existing.deposit_eur
    let paymentReference =
      typeof body?.paymentReference === 'string' ? body.paymentReference.trim() : existing.payment_reference
    if (!paymentReference) {
      paymentReference = String(existing.reference_id ?? '').trim() || null
    }
    const paymentNotes = typeof body?.paymentNotes === 'string' ? body.paymentNotes.trim() : existing.payment_notes
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

    const { error: uErr } = await admin
      .from('enquiries')
      .update({
        amount_due_eur: amountDue,
        deposit_eur: deposit,
        payment_reference: paymentReference,
        payment_notes: paymentNotes || null,
        payment_status: nextStatus
      })
      .eq('id', enquiryId)
    if (uErr) {
      throwStatus(uErr.message, 500)
    }
    return { ok: true, enquiryId, paymentStatus: nextStatus }
  }

  if (action === 'mark_payment_received') {
    const amount = parseMoney(body?.amountEur)
    const paidAt = parseIsoDate(body?.paidAt) ?? new Date().toISOString().slice(0, 10)
    const note = typeof body?.note === 'string' ? body.note.trim() : ''
    if (amount == null || amount <= 0) {
      throwStatus('amountEur must be a positive number.', 400)
    }

    const { data: existing, error: fErr } = await admin
      .from('enquiries')
      .select(
        'id, reference_id, amount_due_eur, deposit_eur, amount_received_eur, payment_reference, payment_status'
      )
      .eq('id', enquiryId)
      .maybeSingle()
    if (fErr) {
      throwStatus(fErr.message, 500)
    }
    if (!existing) {
      throwStatus('Enquiry not found.', 404)
    }

    const prevReceived = Number(existing.amount_received_eur) || 0
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
      note: note || null,
      created_by: creatorId
    })
    if (insErr) {
      throwStatus(insErr.message, 500)
    }

    const amountDue = existing.amount_due_eur != null ? Number(existing.amount_due_eur) : null
    const deposit = existing.deposit_eur != null ? Number(existing.deposit_eur) : null
    const nextStatus = recomputeEnquiryPaymentStatus(amountDue, deposit, nextReceived, null)
    const lastPaymentAt = new Date(`${paidAt}T12:00:00Z`).toISOString()

    const { error: uErr } = await admin
      .from('enquiries')
      .update({
        amount_received_eur: nextReceived,
        payment_reference: paymentReference,
        payment_status: nextStatus,
        last_payment_at: lastPaymentAt
      })
      .eq('id', enquiryId)
    if (uErr) {
      throwStatus(uErr.message, 500)
    }

    return {
      ok: true,
      enquiryId,
      amountReceivedEur: nextReceived,
      paymentStatus: nextStatus,
      paymentReference
    }
  }

  throwStatus('Unknown action.', 400)
}