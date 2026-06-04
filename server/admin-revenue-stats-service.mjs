import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import {
  estimateCollectedEurForBooking,
  syncTripPassForEnquiryReference
} from './portal-invoice-transfer-sync.mjs'

const throwStatus = (message, statusCode = 400) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

const fmtEur = (n) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(Number(n) || 0)

/**
 * Admin: paid trips list + company revenue totals.
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleAdminRevenueStats = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const action = typeof body?.action === 'string' ? body.action.trim().toLowerCase() : 'stats'
  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Supabase is not configured on the server.', 500)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  if (action === 'sync-trip-pass') {
    const referenceId =
      typeof body?.referenceId === 'string'
        ? body.referenceId.trim()
        : typeof body?.enquiryReferenceId === 'string'
          ? body.enquiryReferenceId.trim()
          : ''
    if (!referenceId) {
      throwStatus('referenceId is required.', 400)
    }
    const result = await syncTripPassForEnquiryReference(supabase, referenceId)
    return { ok: true, ...result }
  }

  const limitRaw = body?.limit
  const limit = typeof limitRaw === 'number' && limitRaw > 0 ? Math.min(limitRaw, 200) : 80

  const [{ data: transfers, error: tErr }, { data: stripeMarkedUnpaid, error: uErr }, { data: invoices, error: iErr }] =
    await Promise.all([
      supabase
        .from('transfer_bookings')
        .select(
          'id, pickup_label, dropoff_label, payment_status, admin_price_eur, deposit_percent, enquiry_reference_id, client_email, client_display_name, updated_at, created_at, stripe_payment_intent_id'
        )
        .in('payment_status', ['deposit', 'paid'])
        .order('updated_at', { ascending: false })
        .limit(limit),
      supabase
        .from('transfer_bookings')
        .select(
          'id, pickup_label, dropoff_label, payment_status, admin_price_eur, deposit_percent, enquiry_reference_id, client_email, client_display_name, updated_at, created_at, stripe_payment_intent_id'
        )
        .eq('payment_status', 'unpaid')
        .not('stripe_payment_intent_id', 'is', null)
        .gt('admin_price_eur', 0)
        .order('updated_at', { ascending: false })
        .limit(limit),
      supabase
        .from('portal_invoices')
        .select(
          'id, invoice_number, enquiry_reference_id, amount_cents, status, paid_at, profile_id, stripe_payment_intent_id'
        )
        .or('status.eq.paid,paid_at.not.is.null')
        .order('paid_at', { ascending: false, nullsFirst: false })
        .limit(limit)
    ])

  if (tErr) {
    throwStatus(tErr.message, 500)
  }
  if (uErr) {
    throwStatus(uErr.message, 500)
  }
  if (iErr) {
    throwStatus(iErr.message, 500)
  }

  const transferById = new Map()
  for (const row of transfers ?? []) {
    transferById.set(row.id, row)
  }
  for (const row of stripeMarkedUnpaid ?? []) {
    if (!transferById.has(row.id)) {
      transferById.set(row.id, row)
    }
  }

  const paidTrips = [...transferById.values()].map((row) => {
    const stripePaidButUnmarked =
      String(row.payment_status ?? 'unpaid').toLowerCase() === 'unpaid' &&
      Boolean(String(row.stripe_payment_intent_id ?? '').trim())
    const bookingForEstimate = stripePaidButUnmarked ? { ...row, payment_status: 'paid' } : row
    const collected = estimateCollectedEurForBooking(bookingForEstimate)
    return {
      id: row.id,
      kind: 'transfer',
      reference: row.enquiry_reference_id ?? null,
      guest: row.client_display_name ?? row.client_email ?? 'Guest',
      email: row.client_email ?? null,
      route: `${row.pickup_label ?? 'Pickup'} → ${row.dropoff_label ?? 'Dropoff'}`,
      paymentStatus: stripePaidButUnmarked ? 'paid (sync pending)' : row.payment_status,
      quotedEur: Number(row.admin_price_eur) || 0,
      collectedEur: collected,
      collectedDisplay: fmtEur(collected),
      updatedAt: row.updated_at ?? row.created_at,
      needsPaymentSync: stripePaidButUnmarked
    }
  })

  const transferCollectedTotal = paidTrips.reduce((sum, row) => sum + row.collectedEur, 0)
  const transferPaidCount = paidTrips.filter((r) => {
    const st = String(r.paymentStatus ?? '').toLowerCase()
    return st === 'paid' || st.startsWith('paid ')
  }).length
  const transferDepositCount = paidTrips.filter((r) => String(r.paymentStatus ?? '').toLowerCase() === 'deposit').length

  const paidInvoiceRows = (invoices ?? []).map((inv) => ({
    id: inv.id,
    kind: 'invoice',
    reference: inv.enquiry_reference_id ?? null,
    invoiceNumber: inv.invoice_number ?? null,
    collectedEur: Number(inv.amount_cents) > 0 ? Number(inv.amount_cents) / 100 : 0,
    collectedDisplay: fmtEur(Number(inv.amount_cents) / 100),
    paidAt: inv.paid_at
  }))

  const invoiceCollectedTotal = paidInvoiceRows.reduce((sum, row) => sum + row.collectedEur, 0)

  const transferRefsWithPayment = new Set(
    paidTrips.map((r) => (r.reference ?? '').trim().toUpperCase()).filter(Boolean)
  )
  const invoiceOnlyTotal = paidInvoiceRows
    .filter((inv) => {
      const ref = (inv.reference ?? '').trim().toUpperCase()
      return ref && !transferRefsWithPayment.has(ref)
    })
    .reduce((sum, row) => sum + row.collectedEur, 0)

  const companyTotalCollected = Math.round((transferCollectedTotal + invoiceOnlyTotal) * 100) / 100

  return {
    ok: true,
    summary: {
      companyTotalCollected,
      companyTotalDisplay: fmtEur(companyTotalCollected),
      transferCollectedTotal: Math.round(transferCollectedTotal * 100) / 100,
      transferCollectedDisplay: fmtEur(transferCollectedTotal),
      invoiceOnlyTotal: Math.round(invoiceOnlyTotal * 100) / 100,
      invoiceOnlyDisplay: fmtEur(invoiceOnlyTotal),
      paidTripCount: transferPaidCount,
      depositTripCount: transferDepositCount,
      paidInvoiceCount: paidInvoiceRows.length
    },
    paidTrips,
    paidInvoices: paidInvoiceRows
  }
}
