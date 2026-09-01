/**
 * After admin sets transfer quoted price: generate branded PDF bundle, upload to Storage,
 * upsert portal_client_transfer_documents, grant terms access, log portal_client_updates.
 */
import {
  createTermsSummaryPdf,
  createTransferFormSubmissionPdf,
  createTransferVatQuotePdf
} from './transfer-portal-pdf-bundle.mjs'
import { getGsolSiteUrl } from './site-url.mjs'

const bucketId = 'client-portal-pdfs'

const shortId = (uuid) => String(uuid ?? '').replace(/-/g, '').slice(0, 8)

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {import('node:process').ProcessEnv} env
 * @param {string} bookingId
 */
export const publishTransferAdminPricePortalPdfs = async (admin, env, bookingId) => {
  const { data: booking, error: bErr } = await admin
    .from('transfer_bookings')
    .select(
      'id, client_user_id, client_email, pickup_label, dropoff_label, scheduled_at, client_timing_note, enquiry_reference_id, booking_source, client_display_name, client_phone, package_build_id, admin_price_eur, admin_price_vat_treatment, payment_status, deposit_percent, next_available_driver'
    )
    .eq('id', bookingId)
    .maybeSingle()

  if (bErr || !booking) {
    console.error('[transfer-portal-pdfs] booking load', bErr?.message ?? 'missing')
    return { ok: false, reason: 'booking' }
  }

  const priceNum = Number(booking.admin_price_eur)
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    return { ok: false, reason: 'no_price' }
  }

  let ownerId = booking.client_user_id ? String(booking.client_user_id) : ''
  if (!ownerId) {
    const em = String(booking.client_email ?? '')
      .trim()
      .toLowerCase()
    if (em) {
      const { data: prof } = await admin.from('profiles').select('id').eq('email', em).maybeSingle()
      if (!prof?.id) {
        const { data: profI } = await admin.from('profiles').select('id').ilike('email', em).maybeSingle()
        ownerId = profI?.id ? String(profI.id) : ''
      } else {
        ownerId = String(prof.id)
      }
    }
  }
  if (!ownerId && booking.package_build_id) {
    const { data: pbOwner } = await admin.from('package_builds').select('owner_id').eq('id', booking.package_build_id).maybeSingle()
    if (pbOwner?.owner_id) {
      ownerId = String(pbOwner.owner_id)
    }
  }
  if (!ownerId) {
    const ref = String(booking.enquiry_reference_id ?? '').trim()
    if (ref) {
      const { data: profRef } = await admin
        .from('profiles')
        .select('id')
        .eq('account_reference_id', ref)
        .maybeSingle()
      if (profRef?.id) {
        ownerId = String(profRef.id)
      }
    }
  }
  if (!ownerId) {
    console.warn('[transfer-portal-pdfs] no portal owner for booking', bookingId)
    return { ok: false, reason: 'no_owner' }
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, email, account_reference_id')
    .eq('id', ownerId)
    .maybeSingle()

  const profileName = String(profile?.full_name ?? '').trim() || 'Guest'
  const profileEmail = String(profile?.email ?? booking.client_email ?? '').trim()
  const accountRef = profile?.account_reference_id ? String(profile.account_reference_id).trim() : null

  let packageBuild = null
  if (booking.package_build_id) {
    const { data: pb } = await admin.from('package_builds').select('id, config, label').eq('id', booking.package_build_id).maybeSingle()
    packageBuild = pb ?? null
  }

  const siteOrigin = getGsolSiteUrl()

  const formBytes = await createTransferFormSubmissionPdf({
    booking,
    packageBuild,
    profileName,
    profileEmail
  })
  const vatBytes = await createTransferVatQuotePdf({
    booking,
    profileName,
    profileEmail,
    accountRef,
    siteOrigin
  })
  const termsBytes = await createTermsSummaryPdf()

  const sid = shortId(booking.id)
  const base = `${ownerId}/${booking.id}`
  const paths = {
    form: `${base}/original-request-snapshot.pdf`,
    vat: `${base}/golfsol-transfer-quote-${sid}.pdf`,
    terms: `${base}/terms-summary.pdf`
  }

  const uploads = [
    { path: paths.form, body: formBytes, title: 'Your original request (snapshot)', kind: 'form_submission' },
    { path: paths.vat, body: vatBytes, title: 'Transfer quote & VAT summary', kind: 'vat_quote' },
    { path: paths.terms, body: termsBytes, title: 'Terms & conditions (summary)', kind: 'terms_summary' }
  ]

  for (const u of uploads) {
    const { error: upErr } = await admin.storage.from(bucketId).upload(u.path, u.body, {
      contentType: 'application/pdf',
      upsert: true
    })
    if (upErr) {
      console.error('[transfer-portal-pdfs] storage upload', u.path, upErr.message)
      return { ok: false, reason: 'storage', message: upErr.message }
    }
  }

  const { error: delAllErr } = await admin
    .from('portal_client_transfer_documents')
    .delete()
    .eq('owner_id', ownerId)
    .eq('transfer_booking_id', bookingId)
    .in('document_kind', ['form_submission', 'vat_quote', 'terms_summary'])
  if (delAllErr) {
    console.error('[transfer-portal-pdfs] clear old docs', delAllErr.message)
  }

  const now = new Date().toISOString()
  for (const u of uploads) {
    const { error: insErr } = await admin.from('portal_client_transfer_documents').insert({
      owner_id: ownerId,
      transfer_booking_id: bookingId,
      document_kind: u.kind,
      title: u.title,
      storage_path: u.path,
      created_at: now
    })
    if (insErr) {
      console.error('[transfer-portal-pdfs] insert doc row', insErr.message)
      return { ok: false, reason: 'db', message: insErr.message }
    }
  }

  const { data: hasTerms } = await admin
    .from('client_document_access')
    .select('id')
    .eq('owner_id', ownerId)
    .eq('document_kind', 'terms')
    .maybeSingle()
  if (!hasTerms) {
    const { error: termsInsErr } = await admin.from('client_document_access').insert({
      owner_id: ownerId,
      document_kind: 'terms'
    })
    if (termsInsErr) {
      console.error('[transfer-portal-pdfs] terms access insert', termsInsErr.message)
    }
  }

  const names = uploads.map((u) => u.path.split('/').pop() ?? 'document.pdf')
  const { error: logErr } = await admin.from('portal_client_updates').insert({
    owner_id: ownerId,
    title: 'Your transfer documents are ready',
    summary:
      'Golf Sol Ireland saved your quoted price. Open Documents from Golf Sol Ireland on your dashboard to preview your original request snapshot, VAT quote PDF, and a terms summary.',
    email_subject: 'Transfer quote pack — dashboard',
    template_key: 'transfer_admin_price',
    attachment_filenames: names
  })
  if (logErr) {
    console.error('[transfer-portal-pdfs] portal_client_updates', logErr.message)
  }

  return { ok: true, ownerId, paths }
}
