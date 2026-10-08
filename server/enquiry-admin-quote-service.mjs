/**
 * Simplified admin path: price an enquiry → portal + email → Stripe pay (deposit or full).
 * Reuses transfer_bookings pricing / portal invoices — does not fork Stripe or Resend.
 */
import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { handlePortalInvoiceSend } from './portal-invoice-send-service.mjs'
import { handleTransferPaymentAdmin } from './transfer-payment-service.mjs'
import { handlePortalInterestTicketReply } from './portal-interest-ticket-reply-service.mjs'
import { findProfileByEmailExact } from './email-exact-match.mjs'

const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

const getAdmin = (env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throwStatus('Supabase is not configured on the server.', 500)
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const readFormFields = (formPayload) => {
  if (!formPayload || typeof formPayload !== 'object' || Array.isArray(formPayload)) {
    return {}
  }
  const fields = formPayload.fields
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return {}
  }
  const out = {}
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string' && v.trim()) {
      out[k] = v.trim()
    } else if (typeof v === 'number' && Number.isFinite(v)) {
      out[k] = String(v)
    }
  }
  return out
}

const routeLabelsFromEnquiry = (enquiry) => {
  const fields = readFormFields(enquiry.form_payload)
  const pickup =
    fields._pickupLabel ||
    fields['Collection point'] ||
    fields.Pickup ||
    fields['Preferred location'] ||
    'Trip desk — confirm with guest'
  const dropoff =
    fields._dropoffLabel ||
    fields.Destination ||
    fields['Drop-off'] ||
    'Trip desk — confirm with guest'
  const from = fields._travelDateFrom || fields['Travel start date'] || ''
  const to = fields._travelDateTo || fields['Travel end date'] || ''
  const dates = [from, to].filter(Boolean).join(' → ')
  const timingNote = dates
    ? `Quoted from website form ${enquiry.reference_id} · ${dates}`
    : `Quoted from website form ${enquiry.reference_id}`
  return { pickup_label: pickup, dropoff_label: dropoff, client_timing_note: timingNote }
}

/** Create or reuse the transfer_bookings row that powers Transfers & drivers after admin prices a form. */
const ensureTransferBookingForEnquiry = async (admin, enquiry) => {
  const ref = String(enquiry.reference_id ?? '').trim()
  if (!ref) {
    throwStatus('Enquiry is missing a reference id.', 400)
  }

  const { data: existingRows, error: findErr } = await admin
    .from('transfer_bookings')
    .select('id, admin_price_eur, payment_status, deposit_percent, client_user_id')
    .eq('enquiry_reference_id', ref)
    .order('created_at', { ascending: false })
    .limit(1)

  if (findErr) {
    throwStatus(findErr.message, 500)
  }
  const existing = Array.isArray(existingRows) ? existingRows[0] : null
  if (existing?.id) {
    return existing
  }

  const email = String(enquiry.email ?? '')
    .trim()
    .toLowerCase()
  if (!email) {
    throwStatus('Enquiry needs an email before a transfer quote can be created.', 400)
  }

  let clientUserId = null
  const { data: prof } = await findProfileByEmailExact(admin, email, 'id')
  clientUserId = prof?.id ?? null

  const route = routeLabelsFromEnquiry(enquiry)
  const row = {
    client_user_id: clientUserId,
    client_email: email,
    // NOT NULL columns — never insert null
    client_display_name: String(enquiry.full_name ?? '').trim() || 'Guest',
    client_phone: String(enquiry.phone_whatsapp ?? '').trim() || '',
    pickup_label: route.pickup_label,
    dropoff_label: route.dropoff_label,
    scheduled_at: null,
    client_timing_note: route.client_timing_note,
    status: 'pending',
    payment_status: 'unpaid',
    enquiry_reference_id: ref,
    booking_source: 'website_enquiry',
    next_available_driver: true,
    updated_at: new Date().toISOString()
  }

  const { data: inserted, error: insErr } = await admin
    .from('transfer_bookings')
    .insert(row)
    .select('id, admin_price_eur, payment_status, deposit_percent, client_user_id')
    .single()
  if (insErr || !inserted?.id) {
    // Race: another quote may have created the unique enquiry_reference_id row
    if (String(insErr?.code) === '23505' || String(insErr?.message ?? '').includes('enquiry_reference_id')) {
      const { data: raced } = await admin
        .from('transfer_bookings')
        .select('id, admin_price_eur, payment_status, deposit_percent, client_user_id')
        .eq('enquiry_reference_id', ref)
        .order('created_at', { ascending: false })
        .limit(1)
      if (raced?.[0]?.id) {
        return raced[0]
      }
    }
    throwStatus(insErr?.message ?? 'Could not create a transfer job for this enquiry.', 500)
  }
  return inserted
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleEnquiryAdminQuote = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const enquiryId = typeof body?.enquiryId === 'string' ? body.enquiryId.trim() : ''
  const mode = typeof body?.mode === 'string' ? body.mode.trim().toLowerCase() : ''
  const amountRaw = body?.amountEur
  const amountEur = typeof amountRaw === 'number' ? amountRaw : typeof amountRaw === 'string' ? Number(String(amountRaw).replace(',', '.')) : NaN

  if (!enquiryId) {
    throwStatus('enquiryId is required.', 400)
  }
  if (mode !== 'deposit' && mode !== 'full') {
    throwStatus('mode must be “deposit” or “full”.', 400)
  }
  if (!Number.isFinite(amountEur) || amountEur < 0.5) {
    throwStatus('Enter a valid total in euros (minimum €0.50).', 400)
  }

  const admin = getAdmin(env)
  const { data: enquiry, error: enqErr } = await admin
    .from('enquiries')
    .select('id, reference_id, email, full_name, phone_whatsapp, form_payload')
    .eq('id', enquiryId)
    .maybeSingle()

  if (enqErr || !enquiry) {
    throwStatus(enqErr?.message ?? 'Enquiry not found.', 404)
  }

  // Always create/update the transfer job first so it appears under Transfers & drivers
  const booking = await ensureTransferBookingForEnquiry(admin, enquiry)

  const depositPercent =
    typeof body?.depositPercent === 'number' && Number.isFinite(body.depositPercent)
      ? Math.min(99, Math.max(1, Math.round(body.depositPercent)))
      : 20

  // Payment plan before pricing so the VAT quote PDF / portal see the right deposit vs full rules.
  const { error: planErr } = await admin
    .from('transfer_bookings')
    .update({
      deposit_percent: depositPercent,
      next_available_driver: mode === 'full',
      payment_status: 'unpaid',
      updated_at: new Date().toISOString()
    })
    .eq('id', booking.id)
  if (planErr) {
    throwStatus(planErr.message, 500)
  }

  const priceResult = await handleTransferPaymentAdmin(
    {
      action: 'set_admin_price',
      bookingId: booking.id,
      adminPriceEur: amountEur,
      adminPriceVatTreatment: 'tourism'
    },
    env,
    meta
  )

  let emailResult = null
  try {
    emailResult = await handleTransferPaymentAdmin(
      { action: 'send_payment_request_email', bookingId: booking.id },
      env,
      meta
    )
  } catch (e) {
    console.warn('[enquiry-admin-quote] payment request email failed:', e instanceof Error ? e.message : e)
    emailResult = { ok: false, message: e instanceof Error ? e.message : 'Email failed' }
  }

  if (mode === 'full') {
    let invoiceResult = null
    try {
      invoiceResult = await handlePortalInvoiceSend({ enquiryId, amountEur }, env, meta)
    } catch (e) {
      console.warn('[enquiry-admin-quote] portal invoice failed:', e instanceof Error ? e.message : e)
      invoiceResult = { ok: false, message: e instanceof Error ? e.message : 'Invoice failed' }
    }

    return {
      ok: true,
      mode: 'full',
      bookingId: booking.id,
      price: priceResult,
      email: emailResult,
      invoice: invoiceResult,
      message:
        emailResult?.ok === false
          ? `Full amount €${amountEur.toFixed(2)} saved. Portal shows pay in full; email did not send — ${emailResult.message}.`
          : `Full amount quote sent — client portal shows €${amountEur.toFixed(2)} to pay in full (VAT quote PDF updated).`
    }
  }

  const depositDueRounded = Math.round((amountEur * depositPercent) / 100 * 100) / 100

  return {
    ok: true,
    mode: 'deposit',
    depositPercent,
    bookingId: booking.id,
    price: priceResult,
    email: emailResult,
    message:
      emailResult?.ok === false
        ? `Deposit plan saved (total €${amountEur.toFixed(2)}, ${depositPercent}% = €${depositDueRounded.toFixed(2)} due now). Email did not send — ${emailResult.message}.`
        : `Deposit quote sent — portal shows ${depositPercent}% (€${depositDueRounded.toFixed(2)}) of €${amountEur.toFixed(2)} total. Client emailed.`
  }
}

/**
 * Start or continue a desk message thread for an enquiry (interest ticket).
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleEnquiryAdminMessage = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const enquiryId = typeof body?.enquiryId === 'string' ? body.enquiryId.trim() : ''
  const text = typeof body?.body === 'string' ? body.body.trim() : ''
  const categoryRaw = typeof body?.category === 'string' ? body.category.trim() : 'transfers'
  const category = ['transfers', 'golf_courses', 'hotels'].includes(categoryRaw) ? categoryRaw : 'transfers'

  if (!enquiryId) {
    throwStatus('enquiryId is required.', 400)
  }
  if (!text) {
    throwStatus('Enter a message for the client.', 400)
  }

  const admin = getAdmin(env)
  const { data: enquiry, error: enqErr } = await admin
    .from('enquiries')
    .select('id, email, full_name')
    .eq('id', enquiryId)
    .maybeSingle()

  if (enqErr || !enquiry?.email) {
    throwStatus(enqErr?.message ?? 'Enquiry not found.', 404)
  }

  const email = enquiry.email.trim().toLowerCase()
  const { data: profile, error: profErr } = await findProfileByEmailExact(
    admin,
    email,
    'id, email, full_name'
  )

  if (profErr || !profile?.id) {
    throwStatus(
      'No portal profile for this guest email yet. They need the portal invite / sign-in first, then you can message them here.',
      400
    )
  }

  const { data: existingTickets } = await admin
    .from('portal_interest_tickets')
    .select('id')
    .eq('owner_id', profile.id)
    .eq('category', category)
    .order('updated_at', { ascending: false })
    .limit(1)

  let ticketId = Array.isArray(existingTickets) && existingTickets[0]?.id ? existingTickets[0].id : null
  if (!ticketId) {
    const { data: created, error: cErr } = await admin
      .from('portal_interest_tickets')
      .insert({ owner_id: profile.id, category, status: 'answered' })
      .select('id')
      .single()
    if (cErr || !created?.id) {
      throwStatus(cErr?.message ?? 'Could not open a message thread.', 500)
    }
    ticketId = created.id
  }

  const reply = await handlePortalInterestTicketReply({ ticketId, body: text }, env, meta)
  return {
    ok: true,
    ticketId,
    category,
    reply,
    message: 'Message saved to the client portal thread and emailed when Resend is configured.'
  }
}
