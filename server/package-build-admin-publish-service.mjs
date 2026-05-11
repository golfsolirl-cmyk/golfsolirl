import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { publishTransferAdminPricePortalPdfs } from './transfer-portal-publish-admin-price-pdfs.mjs'

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
 * Requires at least one transfer_bookings row with payment_status = paid for that profile or login email.
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
  if (!['transfer', 'golf', 'hotel'].includes(kind)) {
    throwStatus('kind must be transfer, golf, or hotel.', 400)
  }

  const { data: prof, error: pErr } = await admin.from('profiles').select('id, email, full_name').ilike('email', email).maybeSingle()
  if (pErr) {
    throwStatus(pErr.message, 500)
  }
  if (!prof?.id) {
    throwStatus('No profile with that email — the client must sign in once with this address first.', 404)
  }

  const { data: byUser, error: uErr } = await admin
    .from('transfer_bookings')
    .select('id')
    .eq('payment_status', 'paid')
    .eq('client_user_id', prof.id)
    .limit(1)
  if (uErr) {
    throwStatus(uErr.message, 500)
  }
  const { data: byMail, error: mErr } = await admin
    .from('transfer_bookings')
    .select('id')
    .eq('payment_status', 'paid')
    .ilike('client_email', email)
    .limit(1)
  if (mErr) {
    throwStatus(mErr.message, 500)
  }
  const hasPaid = Boolean((byUser && byUser.length > 0) || (byMail && byMail.length > 0))
  if (!hasPaid) {
    throwStatus(
      'Publishing requires at least one transfer paid in full for this client (Stripe completed). In Account transfers, save the price and let the guest pay in full on their dashboard — same pattern as Save price — then publish golf, hotel, or transfer lines here.',
      400
    )
  }

  const source = sourceForKind(kind)
  const priceRounded = Math.round(price * 100) / 100
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

  const { data: tbRow, error: tbErr } = await admin
    .from('transfer_bookings')
    .insert({
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
      payment_status: 'unpaid',
      deposit_percent: 20,
      updated_at: now
    })
    .select('id')
    .single()

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

  return { ok: true, row: inserted, transferBookingId: tbRow.id, pdfPortal }
}
