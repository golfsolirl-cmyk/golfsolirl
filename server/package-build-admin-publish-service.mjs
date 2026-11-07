import { createClient } from '@supabase/supabase-js'
import { buildPricedLinePublishedEmail } from './branded-client-portal-email.mjs'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { sendBookingEmailHtml, sendTransferPaymentCustomerEmails } from './transfer-payment-customer-email.mjs'
import { balanceDueReminderIso } from './transfer-payment-amounts.mjs'
import { notifyClientPortalTransferPayment } from './portal-transfer-payment-notify.mjs'
import { publishTransferAdminPricePortalPdfs } from './transfer-portal-publish-admin-price-pdfs.mjs'
import { isMissingPaymentLedgerColumnError, omitPaymentLedgerColumns } from './transfer-payment-column-fallback.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

/** @param {string} kind */
const sourceForKind = (kind) => {
  if (kind === 'transfer') {
    return 'admin_transfer'
  }
  if (kind === 'golf') {
    return 'admin_golf'
  }
  if (kind === 'hotel') {
    return 'admin_hotel'
  }
  throwStatus('kind must be transfer, golf, or hotel.', 400)
}

/** Dashboard + transfer row kicker (matches client trip-details scope labels). */
const kindLineLabel = (kind) => {
  if (kind === 'transfer') {
    return 'Transfers'
  }
  if (kind === 'golf') {
    return 'Golf courses'
  }
  return 'Hotel'
}

/**
 * Admin: publish a manual package_builds row to a client dashboard (same data as the old browser insert).
 * Requires at least one transfer the guest has paid (deposit or in full) for that profile or login email.
 *
 * @param {unknown} body
 * @param {import('node:process').ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handlePackageBuildAdminPublish = async (body, env = process.env, meta = {}) => {
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

  const email = typeof body?.clientEmail === 'string' ? body.clientEmail.trim().toLowerCase() : ''
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const summary = typeof body?.summary === 'string' ? body.summary.trim() : ''
  const kind = typeof body?.kind === 'string' ? body.kind.trim().toLowerCase() : ''
  const rawPrice = body?.priceEur
  const price =
    typeof rawPrice === 'number' && Number.isFinite(rawPrice)
      ? rawPrice
      : Number(String(rawPrice ?? '').replace(/,/g, '.').replace(/\s/g, ''))

  if (!email.includes('@')) {
    throwStatus('Enter a valid client login email.', 400)
  }
  if (!title) {
    throwStatus('Title is required.', 400)
  }
  if (!Number.isFinite(price) || price <= 0) {
    throwStatus('priceEur must be a positive number.', 400)
  }
  const priceRounded = Math.round(price * 100) / 100
  const payStatusRaw = typeof body?.paymentStatus === 'string' ? body.paymentStatus.trim().toLowerCase() : 'unpaid'
  const payStatus = ['unpaid', 'deposit', 'paid'].includes(payStatusRaw) ? payStatusRaw : 'unpaid'
  const receivedRaw = body?.amountReceivedEur
  const receivedParsed =
    typeof receivedRaw === 'number' && Number.isFinite(receivedRaw)
      ? receivedRaw
      : Number(String(receivedRaw ?? '').replace(/,/g, '').trim())
  let amountReceived = null
  let depositPercent = 20
  if (payStatus === 'paid') {
    amountReceived = priceRounded
  } else if (payStatus === 'deposit') {
    if (!Number.isFinite(receivedParsed) || receivedParsed <= 0 || receivedParsed >= priceRounded) {
      throwStatus('Deposit amount must be greater than zero and less than the price.', 400)
    }
    amountReceived = Math.round(receivedParsed * 100) / 100
    depositPercent = Math.min(99, Math.max(1, Math.round((amountReceived / priceRounded) * 100)))
  }
  if (!['transfer', 'golf', 'hotel'].includes(kind)) {
    throwStatus('kind must be transfer, golf, or hotel.', 400)
  }

  const { data: prof, error: pErr } = await admin
    .from('profiles')
    .select('id, email, full_name, phone')
    .ilike('email', email)
    .maybeSingle()
  if (pErr) {
    throwStatus(pErr.message, 500)
  }
  if (!prof?.id) {
    throwStatus('No profile with that email — the client must sign in once with this address first.', 404)
  }

  const { data: byUser, error: uErr } = await admin
    .from('transfer_bookings')
    .select('id')
    .in('payment_status', ['paid', 'deposit'])
    .eq('client_user_id', prof.id)
    .limit(1)
  if (uErr) {
    throwStatus(uErr.message, 500)
  }
  const { data: byMail, error: mErr } = await admin
    .from('transfer_bookings')
    .select('id')
    .in('payment_status', ['paid', 'deposit'])
    .ilike('client_email', email)
    .limit(1)
  if (mErr) {
    throwStatus(mErr.message, 500)
  }
  let hasPaid = Boolean((byUser && byUser.length > 0) || (byMail && byMail.length > 0))
  if (!hasPaid) {
    const { data: paidInv, error: iErr } = await admin
      .from('portal_invoices')
      .select('id')
      .eq('profile_id', prof.id)
      .or('status.eq.paid,paid_at.not.is.null')
      .limit(1)
    if (iErr) {
      throwStatus(iErr.message, 500)
    }
    hasPaid = Boolean(paidInv && paidInv.length > 0)
  }
  if (!hasPaid && payStatus === 'unpaid') {
    throwStatus(
      'Publishing an unpaid line needs a payment already on file. Mark this line as a deposit or paid in full, or take a Stripe payment first.',
      400
    )
  }

  const source = sourceForKind(kind)
  const config = {
    version: 2,
    kind,
    title,
    summary,
    priceEur: priceRounded
  }
  const now = new Date().toISOString()
  const lineKind = kindLineLabel(kind)
  const packageLabel = `${lineKind} · ${title}`
  const pickupLabel = `Admin · ${lineKind}`
  const dropoffLabel = title
  const clientEmailNorm = String(prof.email ?? email)
    .trim()
    .toLowerCase()
  const displayName = String(prof.full_name ?? '').trim()
  const phone = String(prof.phone ?? '').trim()
  const timingNote = [summary, `Quoted total for this line: EUR ${priceRounded} (VAT treatment on PDF).`]
    .filter((x) => x && String(x).trim())
    .join('\n\n')
    .slice(0, 4000)

  const { data: inserted, error: insErr } = await admin
    .from('package_builds')
    .insert({
      owner_id: prof.id,
      source,
      label: packageLabel,
      config,
      client_details: {},
      updated_at: now
    })
    .select('id, owner_id, label, source, config, client_details, created_at, linked_proposal_id, profiles(email, full_name)')
    .single()

  if (insErr) {
    throwStatus(insErr.message, 500)
  }

  if (!inserted?.id) {
    throwStatus('Package insert returned no row.', 500)
  }

  const transferInsert = {
    client_user_id: prof.id,
    client_email: clientEmailNorm,
    client_display_name: displayName,
    client_phone: phone,
    pickup_label: pickupLabel,
    dropoff_label: dropoffLabel,
    pickup_lat: null,
    pickup_lng: null,
    dropoff_lat: null,
    dropoff_lng: null,
    scheduled_at: null,
    client_timing_note: timingNote,
    next_available_driver: false,
    status: 'pending',
    package_build_id: inserted.id,
    booking_source: 'admin_package_quote',
    enquiry_reference_id: null,
    admin_price_eur: priceRounded,
    admin_price_vat_treatment: 'tourism',
    payment_status: payStatus,
    payment_source: payStatus === 'unpaid' ? null : 'manual',
    amount_received_eur: amountReceived,
    deposit_percent: depositPercent,
    balance_remind_at: payStatus === 'deposit' ? balanceDueReminderIso(null) : null,
    updated_at: now
  }
  let { data: tbRow, error: tbErr } = await admin.from('transfer_bookings').insert(transferInsert).select('id').single()
  if (tbErr && isMissingPaymentLedgerColumnError(tbErr)) {
    const retry = await admin.from('transfer_bookings').insert(omitPaymentLedgerColumns(transferInsert)).select('id').single()
    tbRow = retry.data
    tbErr = retry.error
  }

  if (tbErr) {
    await admin.from('package_builds').delete().eq('id', inserted.id)
    const dup =
      String(tbErr.message).includes('transfer_bookings_package_build_mirror_uidx') || String(tbErr.code) === '23505'
    throwStatus(
      dup ? 'A transfer row is already linked to this package build (duplicate). Refresh and try again.' : tbErr.message,
      500
    )
  }
  if (!tbRow?.id) {
    await admin.from('package_builds').delete().eq('id', inserted.id)
    throwStatus('Transfer mirror insert returned no row.', 500)
  }

  let paymentReceipt = null
  if (payStatus === 'deposit' || payStatus === 'paid') {
    try {
      await notifyClientPortalTransferPayment(admin, String(tbRow.id))
    } catch (e) {
      console.error('[package-build-admin-publish] portal payment notify', e)
    }
    try {
      paymentReceipt = await sendTransferPaymentCustomerEmails(
        admin,
        String(tbRow.id),
        {
          paymentKind: payStatus === 'deposit' ? 'deposit' : 'full',
          amountPaidEur: amountReceived,
          paymentChannel: 'manual',
          skipIdempotency: true
        },
        env
      )
    } catch (e) {
      console.error('[package-build-admin-publish] payment invoice email', e)
      paymentReceipt = { ok: false, message: e instanceof Error ? e.message : String(e) }
    }
  }

  let pdfPortal = null
  try {
    pdfPortal = await publishTransferAdminPricePortalPdfs(admin, env, String(tbRow.id))
  } catch (e) {
    console.error('[package-build-admin-publish] portal PDFs', e)
    pdfPortal = {
      ok: false,
      reason: 'exception',
      message: e instanceof Error ? e.message : String(e)
    }
  }

  const mail = buildPricedLinePublishedEmail({
    greetingName: displayName,
    kindLabel: lineKind,
    title,
    summary,
    priceEur: priceRounded
  })
  const priceSummary = [title, summary].filter((part) => part && String(part).trim()).join(' — ')
  const { error: updateErr } = await admin.from('portal_client_updates').insert({
    owner_id: prof.id,
    title: `${lineKind} added to your trip`,
    summary: `${priceSummary} Price ${priceRounded.toFixed(2)} EUR. Open your dashboard to see it.`.slice(0, 2000),
    email_subject: mail.subject,
    template_key: 'admin_priced_line',
    attachment_filenames: []
  })
  if (updateErr) {
    console.error('[package-build-admin-publish] portal update', updateErr.message)
  }

  let clientEmail = { ok: false, message: 'Email was not sent.' }
  try {
    const sent = await sendBookingEmailHtml(
      admin,
      { id: tbRow.id, client_email: clientEmailNorm, client_user_id: prof.id },
      mail,
      env
    )
    clientEmail = sent.ok
      ? { ok: true, to: sent.to }
      : { ok: false, message: sent.message || 'Email was not sent.' }
  } catch (e) {
    console.error('[package-build-admin-publish] client email', e)
    clientEmail = { ok: false, message: e instanceof Error ? e.message : String(e) }
  }

  return { ok: true, row: inserted, transferBookingId: tbRow.id, pdfPortal, clientEmail, paymentReceipt }
}
