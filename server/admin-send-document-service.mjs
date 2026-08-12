/**
 * Simplified admin desk: pick a house PDF type + client → email + client dashboard log.
 * Reuses existing PDF builders and handleSendClientPortalEmail (no Stripe fork).
 */
import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { handleSendClientPortalEmail } from './client-portal-email-service.mjs'
import {
  createBrandedEnquiryPdf,
  createPackingChecklistPdf,
  createTermsAndConditionsPdf,
  createTravellerContactsPdf
} from './enquiry-form-pdfs-unified.mjs'
import { buildHomepageBrandedClientPdfBytes } from './homepage-branded-client-pdf.mjs'
import { createTermsSummaryPdf } from './transfer-portal-pdf-bundle.mjs'
import { buildAdminClientLetterPdfBytes, slugifyDocFilename } from './admin-client-letter-pdf.mjs'

const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

/** Catalog shown in admin UI — keep ids stable. */
export const ADMIN_DOCUMENT_CATALOG = [
  {
    id: 'custom_letter',
    label: 'Custom letter / quote note',
    description: 'Your message + client ID on a branded PDF (quotes, notes, confirmations).',
    needsMessage: true
  },
  {
    id: 'booking_confirmation',
    label: 'Booking confirmation letter',
    description: 'Branded confirmation with client / booking ID and your message.',
    needsMessage: true
  },
  {
    id: 'quote_summary_letter',
    label: 'Quote summary letter',
    description: 'Branded quote note — put totals and inclusions in the message box.',
    needsMessage: true
  },
  {
    id: 'receipt_letter',
    label: 'Payment receipt note',
    description: 'Branded receipt-style letter (use Transfers for Stripe receipts when paid).',
    needsMessage: true
  },
  {
    id: 'enquiry_ack',
    label: 'Enquiry acknowledgement',
    description: 'Website enquiry trip brief PDF (needs a GSI- enquiry ref).',
    needsMessage: false
  },
  {
    id: 'terms',
    label: 'Terms & conditions',
    description: 'Full Golf Sol Ireland terms PDF.',
    needsMessage: false
  },
  {
    id: 'traveller_contacts',
    label: 'Traveller contacts',
    description: 'Costa del Sol contacts sheet for the guest.',
    needsMessage: false
  },
  {
    id: 'packing_checklist',
    label: 'Packing checklist',
    description: 'Golf trip packing checklist PDF.',
    needsMessage: false
  },
  {
    id: 'terms_summary',
    label: 'Transfer terms summary',
    description: 'One-page transfer terms summary.',
    needsMessage: false
  },
  {
    id: 'trip_overview',
    label: 'Trip overview',
    description: 'Branded trip desk overview with client details and your message.',
    needsMessage: true
  }
]

const getAdmin = (env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throwStatus('Supabase is not configured on the server.', 500)
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const resolveClient = async (admin, { clientEmail, clientRef }) => {
  let email = typeof clientEmail === 'string' ? clientEmail.trim().toLowerCase() : ''
  const ref = typeof clientRef === 'string' ? clientRef.trim() : ''

  let name = ''
  let phone = ''
  let bookingRef = ref

  if (ref && /^GSI-/i.test(ref)) {
    const { data: enqRows } = await admin
      .from('enquiries')
      .select('reference_id, email, full_name, phone_whatsapp')
      .ilike('reference_id', ref)
      .order('created_at', { ascending: false })
      .limit(1)
    const enq = Array.isArray(enqRows) ? enqRows[0] : null
    if (enq) {
      bookingRef = String(enq.reference_id ?? ref).trim()
      if (!email && enq.email) {
        email = String(enq.email).trim().toLowerCase()
      }
      name = String(enq.full_name ?? '').trim()
      phone = String(enq.phone_whatsapp ?? '').trim()
    }
  }

  if (ref && !email) {
    const { data: profByRef } = await admin
      .from('profiles')
      .select('email, full_name, phone, account_reference_id')
      .ilike('account_reference_id', ref)
      .maybeSingle()
    if (profByRef?.email) {
      email = String(profByRef.email).trim().toLowerCase()
      name = name || String(profByRef.full_name ?? '').trim()
      phone = phone || String(profByRef.phone ?? '').trim()
      bookingRef = bookingRef || String(profByRef.account_reference_id ?? ref).trim()
    }
  }

  if (email) {
    const { data: prof } = await admin
      .from('profiles')
      .select('email, full_name, phone, account_reference_id')
      .ilike('email', email)
      .maybeSingle()
    if (prof) {
      name = name || String(prof.full_name ?? '').trim()
      phone = phone || String(prof.phone ?? '').trim()
      if (!bookingRef && prof.account_reference_id) {
        bookingRef = String(prof.account_reference_id).trim()
      }
    }
  }

  if (!email || !email.includes('@')) {
    throwStatus('Enter a client login email, or a GSI- / account ID we can resolve to an email.', 400)
  }

  return {
    email,
    name: name || 'Guest',
    phone: phone || '',
    bookingRef: bookingRef || '—'
  }
}

const loadEnquiryForAck = async (admin, client) => {
  if (client.bookingRef && /^GSI-/i.test(client.bookingRef)) {
    const { data } = await admin
      .from('enquiries')
      .select('reference_id, email, full_name, phone_whatsapp, best_time_to_call, interest, created_at')
      .ilike('reference_id', client.bookingRef)
      .order('created_at', { ascending: false })
      .limit(1)
    if (Array.isArray(data) && data[0]) {
      return data[0]
    }
  }
  const { data: byEmail } = await admin
    .from('enquiries')
    .select('reference_id, email, full_name, phone_whatsapp, best_time_to_call, interest, created_at')
    .ilike('email', client.email)
    .order('created_at', { ascending: false })
    .limit(1)
  return Array.isArray(byEmail) ? byEmail[0] ?? null : null
}

const bufferToAttachment = (filename, buf) => ({
  filename,
  contentBase64: Buffer.from(buf).toString('base64'),
  contentType: 'application/pdf'
})

const buildPdfForType = async (documentType, client, message, admin) => {
  const letterBase = {
    clientName: client.name,
    clientEmail: client.email,
    clientPhone: client.phone,
    clientRef: client.bookingRef,
    message: message || 'Please see this document for your trip desk.'
  }

  switch (documentType) {
    case 'custom_letter': {
      const bytes = await buildAdminClientLetterPdfBytes({
        ...letterBase,
        kicker: 'CLIENT DOCUMENT',
        docTitle: 'Message from Golf Sol Ireland',
        subtitle: 'For your records and trip desk.'
      })
      return bufferToAttachment(`gsol-letter-${slugifyDocFilename(client.bookingRef)}.pdf`, bytes)
    }
    case 'booking_confirmation': {
      const bytes = await buildAdminClientLetterPdfBytes({
        ...letterBase,
        kicker: 'BOOKING CONFIRMATION',
        docTitle: 'Your booking is confirmed',
        subtitle: 'Keep this with your trip pass and transfer details.'
      })
      return bufferToAttachment(`gsol-booking-confirmation-${slugifyDocFilename(client.bookingRef)}.pdf`, bytes)
    }
    case 'quote_summary_letter': {
      const bytes = await buildAdminClientLetterPdfBytes({
        ...letterBase,
        kicker: 'QUOTE',
        docTitle: 'Your trip quote summary',
        subtitle: 'Figures below are as confirmed by Golf Sol Ireland.'
      })
      return bufferToAttachment(`gsol-quote-${slugifyDocFilename(client.bookingRef)}.pdf`, bytes)
    }
    case 'receipt_letter': {
      const bytes = await buildAdminClientLetterPdfBytes({
        ...letterBase,
        kicker: 'PAYMENT RECEIPT',
        docTitle: 'Payment receipt note',
        subtitle: 'Thank you — payment details are summarised below.'
      })
      return bufferToAttachment(`gsol-receipt-note-${slugifyDocFilename(client.bookingRef)}.pdf`, bytes)
    }
    case 'enquiry_ack': {
      const enq = await loadEnquiryForAck(admin, client)
      if (!enq) {
        throwStatus('No enquiry found for this client. Use a GSI- ref, or pick a letter/terms PDF instead.', 404)
      }
      const bytes = await createBrandedEnquiryPdf({
        fullName: enq.full_name,
        email: enq.email,
        interest: enq.interest,
        phoneWhatsApp: enq.phone_whatsapp,
        bestTimeToCall: enq.best_time_to_call,
        enquiryId: enq.reference_id,
        enquiryDate: enq.created_at
      })
      return bufferToAttachment(`gsol-enquiry-${slugifyDocFilename(enq.reference_id)}.pdf`, bytes)
    }
    case 'terms': {
      const bytes = await createTermsAndConditionsPdf()
      return bufferToAttachment('golf-sol-ireland-terms.pdf', bytes)
    }
    case 'traveller_contacts': {
      const bytes = await createTravellerContactsPdf()
      return bufferToAttachment('golf-sol-ireland-traveller-contacts.pdf', bytes)
    }
    case 'packing_checklist': {
      const bytes = await createPackingChecklistPdf()
      return bufferToAttachment('golf-sol-ireland-packing-checklist.pdf', bytes)
    }
    case 'terms_summary': {
      const bytes = await createTermsSummaryPdf()
      return bufferToAttachment('golf-sol-ireland-transfer-terms-summary.pdf', bytes)
    }
    case 'trip_overview': {
      const bytes = await buildHomepageBrandedClientPdfBytes({
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        enquiryRef: client.bookingRef,
        tripSummary: message || 'Your Costa del Sol trip overview from Golf Sol Ireland.',
        travelDates: 'As confirmed with your concierge',
        partySize: 'As on your trip desk'
      })
      return bufferToAttachment(`gsol-trip-overview-${slugifyDocFilename(client.bookingRef)}.pdf`, bytes)
    }
    default:
      throwStatus(`Unknown document type: ${documentType}`, 400)
  }
}

const defaultSubject = (documentType, client) => {
  const item = ADMIN_DOCUMENT_CATALOG.find((d) => d.id === documentType)
  const label = item?.label ?? 'Document'
  return `${label} — ${client.bookingRef !== '—' ? client.bookingRef : 'Golf Sol Ireland'}`
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleAdminSendDocument = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  if (body?.action === 'catalog') {
    return { ok: true, catalog: ADMIN_DOCUMENT_CATALOG }
  }

  const documentType = typeof body?.documentType === 'string' ? body.documentType.trim() : ''
  const catalogItem = ADMIN_DOCUMENT_CATALOG.find((d) => d.id === documentType)
  if (!catalogItem) {
    throwStatus('Pick a document type from the list.', 400)
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (catalogItem.needsMessage && message.length < 8) {
    throwStatus('Add a short message for the client (at least a sentence).', 400)
  }

  const subject =
    typeof body?.subject === 'string' && body.subject.trim()
      ? body.subject.trim()
      : ''

  const admin = getAdmin(env)
  const client = await resolveClient(admin, {
    clientEmail: body?.clientEmail,
    clientRef: body?.clientRef
  })

  const attachment = await buildPdfForType(documentType, client, message, admin)
  const emailSubject = subject || defaultSubject(documentType, client)
  const emailBody =
    message ||
    `Please find your ${catalogItem.label.toLowerCase()} attached. You can also open Messages on your Golf Sol Ireland dashboard.`

  // Emails PDF via Resend and logs filename on client dashboard (Messages & files)
  const result = await handleSendClientPortalEmail(
    {
      clientEmail: client.email,
      subject: emailSubject,
      message: emailBody,
      attachments: [attachment]
    },
    env,
    meta
  )
  return {
    ok: true,
    documentType,
    filename: attachment.filename,
    clientEmail: client.email,
    clientRef: client.bookingRef,
    message: `Sent ${catalogItem.label} to ${client.email} by email — also saved on their Documents tab.`,
    portal: result
  }
}
