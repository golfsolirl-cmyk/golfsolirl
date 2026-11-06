/**
 * Push a single payment-receipt PDF to the client portal (Your paper trail).
 */
import { readEnquiryFormFields } from '../shared/client-enquiry-document.mjs'
import { createTransferPaymentReceiptPdf } from './transfer-portal-pdf-bundle.mjs'

const bucketId = 'client-portal-pdfs'

const shortId = (uuid) => String(uuid ?? '').replace(/-/g, '').slice(0, 8)

const pickField = (fields, needles) => {
  for (const [key, value] of Object.entries(fields)) {
    const label = key.toLowerCase()
    if (needles.some((needle) => label.includes(needle)) && String(value).trim()) {
      return String(value).trim()
    }
  }
  return ''
}

/**
 * Trip lines for the payment invoice and the receipt email.
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {Record<string, unknown>} booking
 */
export const loadPaymentTripRows = async (admin, booking) => {
  /** @type {{ label: string, value: string }[]} */
  const rows = []
  const push = (label, value) => {
    const text = String(value ?? '').trim()
    if (!text || rows.some((row) => row.label === label)) return
    rows.push({ label, value: text.slice(0, 240) })
  }

  const when = booking.scheduled_at ? String(booking.scheduled_at) : ''
  if (when) {
    try {
      push('Pickup', new Intl.DateTimeFormat('en-IE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(when)))
    } catch {
      push('Pickup', when)
    }
  }

  const reference = String(booking.enquiry_reference_id ?? '').trim()
  let fields = {}
  if (reference) {
    const { data: enquiry } = await admin
      .from('enquiries')
      .select('interest, form_payload')
      .eq('reference_id', reference)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (enquiry) {
      fields = readEnquiryFormFields(enquiry.form_payload)
      push('Requested', enquiry.interest)
    }
  }
  if (booking.package_build_id) {
    const { data: pack } = await admin
      .from('package_builds')
      .select('label, config')
      .eq('id', booking.package_build_id)
      .maybeSingle()
    const config = pack?.config && typeof pack.config === 'object' ? pack.config : {}
    push('Trip', config.title || pack?.label)
    push('Included', config.summary)
  }

  const start = fields._travelDateFrom || fields['Travel start date'] || pickField(fields, ['travel', 'date', 'arrival'])
  const end = fields._travelDateTo || fields['Travel end date'] || ''
  if (start || end) push('Travel dates', [start, end].filter(Boolean).join(' – '))
  push('Party', fields._pax || fields['Group size'] || fields.Passengers || pickField(fields, ['party', 'pax', 'golfer', 'guest']))
  push('Golf', pickField(fields, ['golf', 'course', 'tee']))
  push('Hotel', pickField(fields, ['hotel', 'accommodation', 'stay', 'resort']))
  return rows.slice(0, 8)
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} bookingId
 * @param {{ receiptKind: 'deposit' | 'paid_in_full'; amountEur: number; channel?: 'stripe' | 'manual'; stripeSessionId?: string | null; stripePaymentIntentId?: string | null }} detail
 */
export const publishTransferPortalPaymentReceipt = async (admin, bookingId, detail) => {
  const { data: booking, error: bErr } = await admin
    .from('transfer_bookings')
    .select(
      'id, client_user_id, client_email, pickup_label, dropoff_label, scheduled_at, admin_price_eur, deposit_percent, payment_status, payment_source, package_build_id, enquiry_reference_id'
    )
    .eq('id', bookingId)
    .maybeSingle()

  if (bErr || !booking) {
    console.error('[transfer-portal-payment-pdf] booking', bErr?.message ?? 'missing')
    return { ok: false, reason: 'booking' }
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
      const { data: profRef } = await admin.from('profiles').select('id').eq('account_reference_id', ref).maybeSingle()
      if (profRef?.id) {
        ownerId = String(profRef.id)
      }
    }
  }
  if (!ownerId) {
    console.warn('[transfer-portal-payment-pdf] no owner', bookingId)
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

  const manual = detail.channel === 'manual' || String(booking.payment_source ?? '') === 'manual'
  const documentKind = detail.receiptKind === 'deposit' ? 'deposit_receipt' : 'payment_confirmation'
  const title = detail.receiptKind === 'deposit' ? 'Deposit received' : 'Paid in full'
  const tripRows = await loadPaymentTripRows(admin, booking)

  const sid = shortId(booking.id)
  const fileLeaf =
    detail.receiptKind === 'deposit'
      ? `Golf-Sol-Ireland-deposit-invoice-${sid}.pdf`
      : `Golf-Sol-Ireland-paid-in-full-invoice-${sid}.pdf`
  const storagePath = `${ownerId}/${booking.id}/${fileLeaf}`

  const pdfBytes = await createTransferPaymentReceiptPdf({
    booking,
    profileName,
    profileEmail,
    accountRef,
    receiptType: detail.receiptKind,
    amountChargedEur: detail.amountEur,
    channel: manual ? 'manual' : 'stripe',
    tripRows,
    stripeSessionId: detail.stripeSessionId ?? null,
    stripePaymentIntentId: detail.stripePaymentIntentId ?? null
  })

  const { error: upErr } = await admin.storage.from(bucketId).upload(storagePath, pdfBytes, {
    contentType: 'application/pdf',
    upsert: true
  })
  if (upErr) {
    console.error('[transfer-portal-payment-pdf] storage', upErr.message)
    return { ok: false, reason: 'storage', message: upErr.message }
  }

  await admin.from('portal_client_transfer_documents').delete().eq('owner_id', ownerId).eq('transfer_booking_id', bookingId).eq('document_kind', documentKind)

  const { error: insErr } = await admin.from('portal_client_transfer_documents').insert({
    owner_id: ownerId,
    transfer_booking_id: bookingId,
    document_kind: documentKind,
    title,
    storage_path: storagePath,
    created_at: new Date().toISOString()
  })
  if (insErr) {
    console.error('[transfer-portal-payment-pdf] insert', insErr.message)
    return { ok: false, reason: 'db', message: insErr.message }
  }

  return { ok: true, documentKind, storagePath, pdfBytes, filename: fileLeaf, title, tripRows }
}
