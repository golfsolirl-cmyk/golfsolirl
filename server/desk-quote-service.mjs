/**
 * Admin Customers desk: list a guest, send a quote (accept / decline) or an invoice (pay now).
 * Every send attaches a PDF. Decisions are POST-only so inbox scanners cannot accept or decline.
 */
import { randomBytes } from 'node:crypto'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml } from './email-layout.mjs'
import { ctaGreen, emailFonts, escapeHtml, gs } from './branded-email-shell.mjs'
import { buildGsolMasterDocumentPdf } from './gsol-master-document-pdf.mjs'
import { computePhoneUniquenessKey, isLikelyMobileE164 } from './phone-e164.mjs'
import { createEnquiryReferenceId } from '../shared/document-templates.mjs'
import { gsolEmailBrand } from './email-constants.mjs'
import { Resend } from 'resend'
import { resolveResendToAddress, resendSandboxRecipientHint } from './resend-delivery-email.mjs'
import { deskInvoiceCheckoutRefs, deskInvoiceMayLinkTransfer } from './desk-invoice-transfer-link.mjs'

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

const getSiteOrigin = (env) => {
  const site = env.SITE_URL?.trim()
  if (site) {
    try {
      return new URL(site.startsWith('http') ? site : `https://${site}`).origin
    } catch {
      /* continue */
    }
  }
  const vercel = env.VERCEL_URL?.trim()
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, '')}`
  }
  return 'http://localhost:5173'
}

const fmtEur = (cents) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format((Number(cents) || 0) / 100)

const cleanEmail = (value) => {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (!email.includes('@') || email.length > 180) return ''
  return email
}

const clip = (value, max) => String(value ?? '').trim().slice(0, max)

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''))

const euroFromBody = (body) => {
  const raw = body?.amountEur
  const amount = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(String(raw).replace(',', '.')) : NaN
  return amount
}

const BOOKING_SERVICES = new Set(['transfer', 'golf', 'accommodation', 'other'])
const BOOKING_SERVICE_LABEL = {
  transfer: 'Transfer',
  golf: 'Golf course',
  accommodation: 'Accommodation',
  other: 'Other'
}

const prettyTripDate = (value) => {
  const iso = String(value || '').trim().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return String(value || '').trim()
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

const normalizeTrip = (raw) => {
  const src = raw && typeof raw === 'object' ? raw : {}
  const text = (key, max) => clip(src[key], max)
  const lines = Array.isArray(src.lines)
    ? src.lines.slice(0, 20).flatMap((line) => {
        if (!line || typeof line !== 'object') return []
        const detail = clip(line.detail, 240)
        const when = clip(line.when, 80)
        const quantity = clip(line.quantity, 24)
        if (!detail && !when && !quantity) return []
        return [{ service: BOOKING_SERVICES.has(line.service) ? line.service : 'other', detail, when, quantity }]
      })
    : []
  return {
    golfers: text('golfers', 6),
    guests: text('guests', 6),
    dateFrom: text('dateFrom', 12),
    dateTo: text('dateTo', 12),
    pickup: text('pickup', 160),
    dropoff: text('dropoff', 160),
    transferWhen: text('transferWhen', 80),
    transferNotes: text('transferNotes', 500),
    courses: text('courses', 800),
    rounds: text('rounds', 12),
    golfNotes: text('golfNotes', 500),
    hotel: text('hotel', 160),
    nights: text('nights', 12),
    stayNotes: text('stayNotes', 500),
    lines
  }
}

const tripRows = (raw) => {
  const trip = raw && typeof raw === 'object' ? raw : {}
  const rows = []
  const push = (label, value) => {
    const text = String(value ?? '')
      .replace(/\s+/g, ' ')
      .trim()
    if (text) rows.push({ label, value: text })
  }
  push('Golfers', trip.golfers)
  push('Other guests', trip.guests)
  const from = prettyTripDate(trip.dateFrom)
  const to = prettyTripDate(trip.dateTo)
  push('Travel dates', from && to ? `${from} to ${to}` : from || to)
  push('Pickup', trip.pickup)
  push('Drop-off', trip.dropoff)
  push('Transfer time', trip.transferWhen)
  push('Transfer notes', trip.transferNotes)
  push('Golf courses', trip.courses)
  push('Rounds', trip.rounds)
  push('Golf notes', trip.golfNotes)
  push('Accommodation', trip.hotel)
  push('Nights', trip.nights)
  push('Stay notes', trip.stayNotes)
  const seen = {}
  for (const line of Array.isArray(trip.lines) ? trip.lines : []) {
    const service = BOOKING_SERVICES.has(line?.service) ? line.service : 'other'
    seen[service] = (seen[service] || 0) + 1
    const base = BOOKING_SERVICE_LABEL[service]
    const label = seen[service] > 1 ? `${base} ${seen[service]}` : base
    const value = [line.detail, line.when, line.quantity ? `Qty ${line.quantity}` : ''].filter(Boolean).join(' · ')
    push(label, value)
  }
  return rows
}

const tripPlain = (raw) => tripRows(raw).map((row) => `${row.label}: ${row.value}`).join('\n')

const paragraph = (text) =>
  `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.7;color:${gs.text};">${text}</p>`

const buttonRow = (buttons) => {
  const cells = buttons
    .map(
      (button) => `
        <td class="email-tile-cell" align="center" style="padding:6px;">
          <a class="cta-button" href="${escapeHtml(button.href)}" style="${button.style}">${escapeHtml(button.label)}</a>
        </td>`
    )
    .join('')
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:8px 0 18px 0;">
      <tr>${cells}</tr>
    </table>`
}

const declineButtonStyle = `display:inline-block;border-radius:16px;background:#F5F0E6;color:#063B2A;font-family:${emailFonts.sans};font-size:15px;line-height:1.45;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:20px 28px;border:2px solid #063B2A;text-decoration:none;text-align:center;`

const sendMail = async (env, { to, subject, html, filename, pdfBytes }) => {
  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !fromEmail) {
    throwStatus('Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.', 500)
  }
  const resend = new Resend(resendKey)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: resolveResendToAddress(to, env),
    subject,
    html: finalizeGsolEmailHtml(html),
    attachments: pdfBytes
      ? [
          {
            filename: filename || 'golf-sol-document.pdf',
            content: Buffer.from(pdfBytes).toString('base64'),
            contentType: 'application/pdf'
          }
        ]
      : undefined
  })
  if (error) {
    const hint = /only send|testing emails|verify a domain|not verified/i.test(error.message || '')
      ? ` ${resendSandboxRecipientHint(env)}`
      : ''
    throwStatus(`${error.message || 'The email could not be sent.'}${hint}`, 502)
  }
}

const buildPdf = async ({ kind, title, reference, name, email, phone, summary, amountCents, trip }) => {
  const dated = new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })
  const pdfKind = kind === 'invoice' ? 'invoice' : kind === 'note' ? 'enquiry' : 'quotation'
  return buildGsolMasterDocumentPdf({
    kind: pdfKind,
    title: title || (kind === 'invoice' ? 'Invoice' : kind === 'note' ? 'Note' : 'Quotation'),
    subtitle: reference,
    reference,
    dateLabel: dated,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    rows: tripRows(trip),
    amountLabel: amountCents > 0 ? 'Total' : '',
    amountValue: amountCents > 0 ? fmtEur(amountCents) : '',
    notes: summary,
    filename: `golf-sol-${kind}-${reference.replace(/[^\w.-]+/g, '-')}.pdf`
  })
}

const detailsBlock = (row) => {
  const rows = tripRows(row?.trip_details)
  if (!rows.length) return ''
  const body = rows
    .map(
      (item) => `
        <tr>
          <td style="padding:7px 14px 7px 0;font-family:${emailFonts.sans};font-size:13px;line-height:1.4;font-weight:700;color:${gs.text};vertical-align:top;white-space:nowrap;">${escapeHtml(item.label)}</td>
          <td style="padding:7px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.5;color:${gs.text};">${escapeHtml(item.value)}</td>
        </tr>`
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">${body}</table>`
}

const loadProfile = async (db, email) => {
  const { data, error } = await db
    .from('profiles')
    .select('id, email, full_name, phone, account_reference_id, role')
    .ilike('email', email)
    .limit(1)
  if (error) {
    throwStatus(error.message, 500)
  }
  return Array.isArray(data) ? data[0] ?? null : null
}

const requireDeskAdmin = async (meta, env) => {
  const auth = await requireAdminFromBearer(meta?.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode || 401)
  }
  return auth
}

const listCustomers = async (db) => {
  const [profilesRes, enquiriesRes] = await Promise.all([
    db
      .from('profiles')
      .select('id, email, full_name, phone, account_reference_id, role, created_at')
      .order('created_at', { ascending: false })
      .limit(400),
    db
      .from('enquiries')
      .select('id, email, full_name, phone_whatsapp, reference_id, created_at')
      .order('created_at', { ascending: false })
      .limit(400)
  ])
  if (profilesRes.error) throwStatus(profilesRes.error.message, 500)
  if (enquiriesRes.error) throwStatus(enquiriesRes.error.message, 500)

  /** @type {Map<string, { email: string, name: string, phone: string, accountReference: string, profileId: string | null, enquiryCount: number, latestAt: string }>} */
  const byEmail = new Map()
  const touch = (email, patch) => {
    const key = cleanEmail(email)
    if (!key) return
    const current = byEmail.get(key) || {
      email: key,
      name: '',
      phone: '',
      accountReference: '',
      profileId: null,
      enquiryCount: 0,
      latestAt: ''
    }
    byEmail.set(key, {
      ...current,
      name: patch.name || current.name,
      phone: patch.phone || current.phone,
      accountReference: patch.accountReference || current.accountReference,
      profileId: patch.profileId || current.profileId,
      enquiryCount: current.enquiryCount + (patch.enquiry ? 1 : 0),
      latestAt: patch.at && patch.at > current.latestAt ? patch.at : current.latestAt
    })
  }

  for (const row of profilesRes.data || []) {
    if (row.role === 'admin') continue
    touch(row.email, {
      name: row.full_name || '',
      phone: row.phone || '',
      accountReference: row.account_reference_id || '',
      profileId: row.id,
      at: row.created_at || ''
    })
  }
  for (const row of enquiriesRes.data || []) {
    touch(row.email, {
      name: row.full_name || '',
      phone: row.phone_whatsapp || '',
      accountReference: row.reference_id || '',
      enquiry: true,
      at: row.created_at || ''
    })
  }

  const customers = [...byEmail.values()].sort((a, b) => (a.latestAt < b.latestAt ? 1 : -1))
  return { ok: true, customers }
}

const rowsOrEmpty = async (query) => {
  const result = await query
  if (result.error && /phone_e164/i.test(result.error.message || '')) return []
  if (result.error) throwStatus(result.error.message, 500)
  return result.data || []
}

const customerCard = (row, source) => ({
  email: cleanEmail(row.email),
  name: row.full_name || '',
  phone: source === 'profile' ? row.phone || '' : row.phone_whatsapp || '',
  accountReference: source === 'profile' ? row.account_reference_id || '' : row.reference_id || '',
  profileId: source === 'profile' ? row.id : null,
  enquiryCount: source === 'profile' ? 0 : 1,
  latestAt: new Date().toISOString()
})

const findExistingCustomer = async (db, email, phoneKey) => {
  const [profileByPhone, enquiryByPhone, profileByEmail, enquiryByEmail] = await Promise.all([
    rowsOrEmpty(
      db.from('profiles').select('id, email, full_name, phone, account_reference_id, role').eq('phone_e164', phoneKey).limit(1)
    ),
    rowsOrEmpty(
      db
        .from('enquiries')
        .select('email, full_name, phone_whatsapp, reference_id')
        .eq('phone_e164', phoneKey)
        .order('created_at', { ascending: false })
        .limit(1)
    ),
    rowsOrEmpty(db.from('profiles').select('id, email, full_name, phone, account_reference_id, role').ilike('email', email).limit(1)),
    rowsOrEmpty(
      db
        .from('enquiries')
        .select('email, full_name, phone_whatsapp, reference_id')
        .ilike('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
    )
  ])

  const phoneProfile = profileByPhone.find((row) => row.role !== 'admin' && cleanEmail(row.email))
  if (phoneProfile) return { matched: 'phone', customer: customerCard(phoneProfile, 'profile') }
  const phoneEnquiry = enquiryByPhone.find((row) => cleanEmail(row.email))
  if (phoneEnquiry) return { matched: 'phone', customer: customerCard(phoneEnquiry, 'enquiry') }

  const emailProfile = profileByEmail[0]
  if (emailProfile?.role === 'admin') {
    throwStatus('That email is a desk login. Use the guest’s own email.', 400)
  }
  if (emailProfile && cleanEmail(emailProfile.email)) {
    return { matched: 'email', customer: customerCard(emailProfile, 'profile') }
  }
  const emailEnquiry = enquiryByEmail.find((row) => cleanEmail(row.email))
  if (emailEnquiry) return { matched: 'email', customer: customerCard(emailEnquiry, 'enquiry') }
  return null
}

const createCustomer = async (db, body) => {
  const email = cleanEmail(body?.email)
  const name = clip(body?.name, 160)
  const phone = clip(body?.phone, 40)
  if (!name) throwStatus('Enter the customer’s name.', 400)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throwStatus('Enter a valid email.', 400)
  const phoneKey = computePhoneUniquenessKey(phone)
  if (!phoneKey || !isLikelyMobileE164(phoneKey)) {
    throwStatus('Enter a mobile number, for example 087 446 4766.', 400)
  }

  const existing = await findExistingCustomer(db, email, phoneKey)
  if (existing) {
    return {
      ok: true,
      existing: true,
      customer: existing.customer,
      message:
        existing.matched === 'phone'
          ? 'That mobile is already on the desk. Opened their record.'
          : 'That email is already on the desk. Opened their record.'
    }
  }

  const reference = createEnquiryReferenceId()
  const base = {
    reference_id: reference,
    email,
    full_name: name,
    interest: 'Added on the desk',
    phone_whatsapp: phone,
    phone_e164: phoneKey,
    form_payload: { form: 'desk_manual_customer', fields: { source: 'Customers desk' } }
  }
  let payload = { ...base }
  let inserted = await db.from('enquiries').insert(payload).select('reference_id').single()
  if (inserted.error && /form_payload/i.test(inserted.error.message || '')) {
    delete payload.form_payload
    inserted = await db.from('enquiries').insert(payload).select('reference_id').single()
  }
  if (inserted.error && /phone_e164/i.test(inserted.error.message || '')) {
    delete payload.phone_e164
    inserted = await db.from('enquiries').insert(payload).select('reference_id').single()
  }
  if (inserted.error || !inserted.data) {
    throwStatus(inserted.error?.message || 'Could not add this customer.', 500)
  }

  return {
    ok: true,
    existing: false,
    customer: {
      email,
      name,
      phone,
      accountReference: inserted.data.reference_id || reference,
      profileId: null,
      enquiryCount: 1,
      latestAt: new Date().toISOString()
    },
    message: `Added ${name}. Account ${inserted.data.reference_id || reference}.`
  }
}

const customerDetail = async (db, email) => {
  const profile = await loadProfile(db, email)
  const [enquiriesRes, transfersRes, quotesRes] = await Promise.all([
    db
      .from('enquiries')
      .select('id, reference_id, full_name, email, phone_whatsapp, interest, created_at')
      .ilike('email', email)
      .order('created_at', { ascending: false })
      .limit(40),
    db
      .from('transfer_bookings')
      .select(
        'id, client_email, client_display_name, pickup_label, dropoff_label, payment_status, admin_price_eur, amount_received_eur, status, enquiry_reference_id, created_at'
      )
      .ilike('client_email', email)
      .order('created_at', { ascending: false })
      .limit(40),
    db.from('desk_quotes').select('*').ilike('customer_email', email).order('created_at', { ascending: false }).limit(40)
  ])
  if (enquiriesRes.error) throwStatus(enquiriesRes.error.message, 500)
  if (transfersRes.error) throwStatus(transfersRes.error.message, 500)

  let documents = quotesRes.data || []
  if (quotesRes.error) {
    const missing = /desk_quotes|schema cache|does not exist/i.test(quotesRes.error.message || '')
    if (!missing) throwStatus(quotesRes.error.message, 500)
    documents = []
  }

  let invoices = []
  if (profile?.id) {
    const inv = await db
      .from('portal_invoices')
      .select('id, invoice_number, amount_cents, status, enquiry_reference_id, created_at, paid_at, stripe_checkout_url')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(40)
    if (inv.error) throwStatus(inv.error.message, 500)
    invoices = inv.data || []
  }

  return {
    ok: true,
    customer: {
      email,
      name: profile?.full_name || enquiriesRes.data?.[0]?.full_name || '',
      phone: profile?.phone || enquiriesRes.data?.[0]?.phone_whatsapp || '',
      accountReference: profile?.account_reference_id || enquiriesRes.data?.[0]?.reference_id || '',
      profileId: profile?.id || null
    },
    enquiries: enquiriesRes.data || [],
    payments: transfersRes.data || [],
    invoices,
    documents,
    migrationNeeded: Boolean(quotesRes.error)
  }
}

const openCheckout = async (env, db, row) => {
  const stripeKey = env.STRIPE_SECRET_KEY?.trim()
  if (!stripeKey) {
    throwStatus('STRIPE_SECRET_KEY is not set, so a pay link cannot be created.', 500)
  }
  const origin = getSiteOrigin(env)
  const profile = row.profile_id ? { id: row.profile_id } : await loadProfile(db, row.customer_email)
  let portalInvoiceId = row.portal_invoice_id || null

  if (profile?.id && !portalInvoiceId) {
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`
    const inserted = await db
      .from('portal_invoices')
      .insert({
        profile_id: profile.id,
        enquiry_id: row.enquiry_id,
        enquiry_reference_id: row.reference_code,
        amount_cents: row.amount_cents,
        currency: 'eur',
        status: 'sent',
        invoice_number: invoiceNumber,
        sent_by: row.created_by
      })
      .select('id')
      .single()
    if (inserted.error || !inserted.data?.id) {
      throwStatus(inserted.error?.message || 'Could not save the invoice on their account.', 500)
    }
    portalInvoiceId = inserted.data.id
  }

  let linkedTransferId = ''
  if (!portalInvoiceId && isUuid(row.transfer_booking_id)) {
    const linked = await db
      .from('transfer_bookings')
      .select('id, client_email, admin_price_eur, payment_status')
      .eq('id', row.transfer_booking_id)
      .maybeSingle()
    if (linked.error) {
      throwStatus(linked.error.message, 500)
    }
    if (deskInvoiceMayLinkTransfer(linked.data, row.customer_email, row.amount_cents)) {
      linkedTransferId = linked.data.id
    }
  }

  const checkoutRefs = deskInvoiceCheckoutRefs({
    deskQuoteId: row.id,
    portalInvoiceId,
    transferBookingId: linkedTransferId
  })

  const stripe = new Stripe(stripeKey)
  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: row.customer_email,
      client_reference_id: checkoutRefs.clientReferenceId,
      metadata: checkoutRefs.metadata,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: row.amount_cents,
            product_data: {
              name: row.title || `Golf Sol ${row.reference_code}`,
              description: clip([row.reference_code, tripPlain(row.trip_details)].filter(Boolean).join(' — '), 400)
            }
          }
        }
      ],
      success_url: `${origin}/quote-reply/${row.decision_token}?paid=1`,
      cancel_url: `${origin}/quote-reply/${row.decision_token}?choice=accept`
    })
  } catch (error) {
    if (portalInvoiceId && portalInvoiceId !== row.portal_invoice_id) {
      await db.from('portal_invoices').delete().eq('id', portalInvoiceId)
    }
    throwStatus(error instanceof Error ? error.message : 'Stripe Checkout failed.', 502)
  }

  if (!session?.url) {
    throwStatus('Stripe did not return a pay link.', 502)
  }

  await db
    .from('desk_quotes')
    .update({
      portal_invoice_id: portalInvoiceId,
      profile_id: profile?.id || row.profile_id,
      stripe_checkout_session_id: session.id,
      stripe_checkout_url: session.url,
      status: 'invoiced',
      updated_at: new Date().toISOString()
    })
    .eq('id', row.id)

  if (portalInvoiceId) {
    await db.from('portal_invoices').update({ stripe_checkout_session_id: session.id, stripe_checkout_url: session.url }).eq('id', portalInvoiceId)
  }

  return { checkoutUrl: session.url, portalInvoiceId }
}

const emailPayLink = async (env, row, checkoutUrl, pdf) => {
  const origin = getSiteOrigin(env)
  const first = row.customer_name.split(/\s+/)[0] || 'there'
  const subject = `Your Golf Sol invoice — ${row.reference_code}`
  const html = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: `Pay ${fmtEur(row.amount_cents)} to confirm ${row.reference_code}. The invoice PDF is attached.`,
    heroKicker: 'Golf Sol Ireland',
    heroTitle: 'Your invoice is ready',
    heroLead: `${fmtEur(row.amount_cents)} · ${row.reference_code}`,
    heroMetaHtml: '',
    bodyHtml: [
      paragraph(`Hello ${escapeHtml(first)},`),
      paragraph(`Your invoice for <strong>${escapeHtml(row.title || 'your Costa del Sol trip')}</strong> is attached as a PDF.`),
      paragraph(`Total due: <strong>${escapeHtml(fmtEur(row.amount_cents))}</strong>.`),
      detailsBlock(row),
      row.summary ? paragraph(escapeHtml(row.summary)) : '',
      buttonRow([{ href: checkoutUrl, label: 'Pay now', style: ctaGreen }]),
      paragraph(`You can also review the trip in your dashboard: <a href="${escapeHtml(`${origin}/dashboard`)}" style="color:${gs.green};">${escapeHtml(`${origin}/dashboard`)}</a>.`)
    ].join('')
  })
  await sendMail(env, { to: row.customer_email, subject, html, filename: pdf.filename, pdfBytes: pdf.bytes })
}

const emailQuoteChoice = async (env, row, pdf) => {
  const origin = getSiteOrigin(env)
  const acceptHref = `${origin}/quote-reply/${row.decision_token}?choice=accept`
  const declineHref = `${origin}/quote-reply/${row.decision_token}?choice=decline`
  const first = row.customer_name.split(/\s+/)[0] || 'there'
  const subject = `Your Golf Sol quote — ${row.reference_code}`
  const html = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: `${fmtEur(row.amount_cents)} for ${row.reference_code}. Accept or decline from this email. The quote PDF is attached.`,
    heroKicker: 'Golf Sol Ireland',
    heroTitle: 'Your quote is ready',
    heroLead: `${fmtEur(row.amount_cents)} · ${row.reference_code}`,
    heroMetaHtml: '',
    bodyHtml: [
      paragraph(`Hello ${escapeHtml(first)},`),
      paragraph(`Here is the quote for <strong>${escapeHtml(row.title || 'your Costa del Sol week')}</strong>. The PDF is attached.`),
      paragraph(`Quoted total: <strong>${escapeHtml(fmtEur(row.amount_cents))}</strong>.`),
      detailsBlock(row),
      row.summary ? paragraph(escapeHtml(row.summary)) : '',
      paragraph('Accept and we email a secure pay button straight away. Decline and we will hold the price while we find a week that fits.'),
      buttonRow([
        { href: acceptHref, label: 'Accept quote', style: ctaGreen },
        { href: declineHref, label: 'Decline', style: declineButtonStyle }
      ])
    ].join('')
  })
  await sendMail(env, { to: row.customer_email, subject, html, filename: pdf.filename, pdfBytes: pdf.bytes })
}

const emailWinBack = async (env, row, pdf) => {
  const first = row.customer_name.split(/\s+/)[0] || 'there'
  const holdText = `HOLD ${row.reference_code}`
  const whatsapp = `${gsolEmailBrand.whatsappHref}?text=${encodeURIComponent(`Hi Golf Sol — ${holdText}. Can we reshape this week?`)}`
  const subject = `We kept ${row.reference_code} open for seven days`
  const html = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: `The quoted price stays open for seven days. Reply HOLD and we will reshape the week. Quote PDF attached.`,
    heroKicker: 'Golf Sol Ireland',
    heroTitle: 'The morning tee sheet is still open',
    heroLead: `Same price for seven days · ${row.reference_code}`,
    heroMetaHtml: '',
    bodyHtml: [
      paragraph(`Hello ${escapeHtml(first)},`),
      paragraph('Declining is completely fine. Dates move, and a good golf week should feel easy.'),
      paragraph(
        `For the next seven days we will hold <strong>${escapeHtml(fmtEur(row.amount_cents))}</strong> on ${escapeHtml(row.reference_code)}, including the airport pickup. The quote PDF is attached, unchanged.`
      ),
      detailsBlock(row),
      paragraph(
        'If the date was the problem, tell us the week that works. If the price was the problem, tell us the number that would make it a yes. One reply is enough — we will reshape the golf, the hotel, and the transfers around it.'
      ),
      paragraph(
        `Most groups who pause come back for a Tuesday-to-Saturday: three rounds, one hotel, one van. Reply <strong>${escapeHtml(holdText)}</strong> and we will send a pay link the same day.`
      ),
      buttonRow([{ href: whatsapp, label: 'WhatsApp the desk', style: ctaGreen }])
    ].join('')
  })
  await sendMail(env, { to: row.customer_email, subject, html, filename: pdf.filename, pdfBytes: pdf.bytes })
}

const insertDeskRow = async (db, env, userId, input) => {
  const email = cleanEmail(input.email)
  if (!email) throwStatus('Enter a valid customer email.', 400)
  const kind = input.kind
  const amountEur = Number(input.amountEur)
  const amountCents = Number.isFinite(amountEur) ? Math.round(amountEur * 100) : 0
  if (kind !== 'note' && amountCents < 50) {
    throwStatus('Enter a total of at least €0.50.', 400)
  }
  const profile = await loadProfile(db, email)
  const token = randomBytes(24).toString('hex')
  const reference = `GSQ-${Date.now().toString(36).toUpperCase()}`
  const row = {
    kind,
    profile_id: profile?.role === 'admin' ? null : profile?.id || null,
    enquiry_id: input.enquiryId || null,
    customer_email: email,
    customer_name: clip(input.name || profile?.full_name || '', 160),
    customer_phone: clip(input.phone || profile?.phone || '', 40),
    reference_code: reference,
    title: clip(input.title || (kind === 'invoice' ? 'Trip invoice' : kind === 'note' ? 'Note from the desk' : 'Trip quote'), 180),
    summary: clip(input.summary, 4000),
    amount_cents: kind === 'note' ? Math.max(0, amountCents) : amountCents,
    status: 'sent',
    decision_token: token,
    created_by: userId
  }
  const trip = normalizeTrip(input.trip)
  let inserted = await db.from('desk_quotes').insert({ ...row, trip_details: trip }).select('*').single()
  if (inserted.error && /trip_details/i.test(inserted.error.message || '')) {
    const folded = [row.summary, tripPlain(trip)].filter(Boolean).join('\n\n')
    inserted = await db.from('desk_quotes').insert({ ...row, summary: clip(folded, 4000) }).select('*').single()
    if (inserted.data) {
      inserted.data.summary = row.summary
      inserted.data.trip_details = trip
    }
  }
  if (inserted.error || !inserted.data) {
    const missing = /desk_quotes|schema cache|does not exist/i.test(inserted.error?.message || '')
    throwStatus(
      missing
        ? 'The customers table is not on the database yet. Run supabase/migrations/20261110150000_desk_quotes.sql in the Supabase SQL editor.'
        : inserted.error?.message || 'Could not save this send.',
      missing ? 400 : 500
    )
  }
  return inserted.data
}

const pdfForRow = async (row, supplied) => {
  if (supplied?.bytes) {
    return { filename: supplied.filename || `golf-sol-${row.kind}-${row.reference_code}.pdf`, bytes: supplied.bytes }
  }
  return buildPdf({
    kind: row.kind,
    title: row.title,
    reference: row.reference_code,
    name: row.customer_name,
    email: row.customer_email,
    phone: row.customer_phone,
    summary: row.summary,
    amountCents: row.amount_cents,
    trip: row.trip_details
  })
}

const readSuppliedPdf = (body) => {
  const b64 = typeof body?.pdfBase64 === 'string' ? body.pdfBase64.trim() : ''
  if (!b64) return null
  const bytes = Buffer.from(b64, 'base64')
  if (bytes.length < 5 || bytes.subarray(0, 5).toString() !== '%PDF-') {
    throwStatus('The attached file is not a PDF.', 400)
  }
  return {
    bytes,
    filename: clip(body?.pdfFilename || 'golf-sol-document.pdf', 120)
  }
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleDeskCustomers = async (body, env = process.env, meta = {}) => {
  const auth = await requireDeskAdmin(meta, env)
  const db = getAdmin(env)
  const action = typeof body?.action === 'string' ? body.action.trim() : 'list'

  if (action === 'list') {
    return listCustomers(db)
  }
  if (action === 'detail') {
    const email = cleanEmail(body?.email)
    if (!email) throwStatus('Enter a customer email.', 400)
    return customerDetail(db, email)
  }
  if (action === 'create-customer') {
    return createCustomer(db, body)
  }

  if (action === 'send-quote' || action === 'send-invoice' || action === 'send-note') {
    const kind = action === 'send-invoice' ? 'invoice' : action === 'send-note' ? 'note' : 'quote'
    const input = {
      kind,
      email: body?.email,
      name: body?.name,
      phone: body?.phone,
      title: body?.title,
      summary: body?.summary || body?.message,
      amountEur: euroFromBody(body),
      trip: body?.trip,
      enquiryId: isUuid(body?.enquiryId) ? String(body.enquiryId).trim() : null
    }
    let row
    try {
      row = await insertDeskRow(db, env, auth.user.id, input)
    } catch (error) {
      const missing = /desk_quotes|20261110150000/i.test(error instanceof Error ? error.message : '')
      if (!(kind === 'note' && missing)) {
        throw error
      }
      const email = cleanEmail(input.email)
      const pseudo = {
        kind: 'note',
        customer_email: email,
        customer_name: clip(input.name, 160),
        customer_phone: clip(input.phone, 40),
        reference_code: `NOTE-${Date.now().toString(36).toUpperCase()}`,
        title: clip(input.title || 'Note from the desk', 180),
        summary: clip(input.summary, 4000),
        amount_cents: 0
      }
      const pdf = await pdfForRow(pseudo, readSuppliedPdf(body))
      const first = pseudo.customer_name.split(/\s+/)[0] || 'there'
      const subject = clip(body?.subject || `A note from Golf Sol — ${pseudo.reference_code}`, 180)
      const html = buildGsolTransactionalEmail({
        documentTitle: subject,
        preheader: 'A note from Golf Sol Ireland. PDF attached.',
        heroKicker: 'Golf Sol Ireland',
        heroTitle: escapeHtml(pseudo.title),
        heroLead: pseudo.reference_code,
        heroMetaHtml: '',
        bodyHtml: [
          paragraph(`Hello ${escapeHtml(first)},`),
          paragraph(escapeHtml(pseudo.summary || 'Please find a short note from the Golf Sol desk attached.')),
          paragraph('The PDF copy is attached to this email.')
        ].join('')
      })
      await sendMail(env, { to: email, subject, html, filename: pdf.filename, pdfBytes: pdf.bytes })
      return {
        ok: true,
        message: `Email sent to ${email} with a PDF attached. Run supabase/migrations/20261110150000_desk_quotes.sql so quotes and invoices can be saved.`
      }
    }
    const pdf = await pdfForRow(row, readSuppliedPdf(body))
    if (kind === 'quote') {
      await emailQuoteChoice(env, row, pdf)
      return { ok: true, message: `Quote emailed to ${row.customer_email} with Accept and Decline, and the PDF attached.`, reference: row.reference_code }
    }
    if (kind === 'invoice') {
      const transferBookingId = isUuid(body?.transferBookingId) ? String(body.transferBookingId).trim() : ''
      const pay = await openCheckout(env, db, transferBookingId ? { ...row, transfer_booking_id: transferBookingId } : row)
      await emailPayLink(env, row, pay.checkoutUrl, pdf)
      return { ok: true, message: `Invoice emailed to ${row.customer_email} with a Pay now button and the PDF attached.`, reference: row.reference_code }
    }
    const first = row.customer_name.split(/\s+/)[0] || 'there'
    const subject = clip(body?.subject || `A note from Golf Sol — ${row.reference_code}`, 180)
    const html = buildGsolTransactionalEmail({
      documentTitle: subject,
      preheader: 'A note from Golf Sol Ireland. PDF attached.',
      heroKicker: 'Golf Sol Ireland',
      heroTitle: escapeHtml(row.title || 'A note from the desk'),
      heroLead: row.reference_code,
      heroMetaHtml: '',
      bodyHtml: [
        paragraph(`Hello ${escapeHtml(first)},`),
        paragraph(escapeHtml(row.summary || 'Please find a short note from the Golf Sol desk attached.')),
        paragraph('The PDF copy is attached to this email.')
      ].join('')
    })
    await sendMail(env, { to: row.customer_email, subject, html, filename: pdf.filename, pdfBytes: pdf.bytes })
    return { ok: true, message: `Email sent to ${row.customer_email} with a PDF attached.`, reference: row.reference_code }
  }

  throwStatus('Unknown customers action.', 400)
}

/**
 * Guest confirms accept or decline from the email landing page.
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 */
export const handleDeskQuoteDecision = async (body, env = process.env) => {
  const token = typeof body?.token === 'string' ? body.token.trim() : ''
  const decision = typeof body?.decision === 'string' ? body.decision.trim().toLowerCase() : ''
  if (!/^[a-f0-9]{32,64}$/i.test(token)) {
    throwStatus('This link is not valid.', 400)
  }
  if (decision !== 'accept' && decision !== 'decline') {
    throwStatus('Choose accept or decline.', 400)
  }

  const db = getAdmin(env)
  const found = await db.from('desk_quotes').select('*').eq('decision_token', token).maybeSingle()
  if (found.error) {
    throwStatus(found.error.message, 500)
  }
  const row = found.data
  if (!row) {
    throwStatus('This quote link has expired or is not recognised.', 404)
  }
  if (row.status === 'paid') {
    return { ok: true, status: 'paid', message: 'This trip is already paid. Your receipt is on its way by email.' }
  }
  if (row.kind !== 'quote' && decision === 'decline') {
    throwStatus('This document cannot be declined.', 400)
  }

  const pdf = await buildPdf({
    kind: decision === 'accept' ? 'invoice' : 'quote',
    title: row.title,
    reference: row.reference_code,
    name: row.customer_name,
    email: row.customer_email,
    phone: row.customer_phone,
    summary: row.summary,
    amountCents: row.amount_cents,
    trip: row.trip_details
  })

  if (decision === 'decline') {
    if (row.status === 'declined') {
      return { ok: true, status: 'declined', message: 'We already have your decline. The price stays open for seven days — WhatsApp the desk if you want to reshape the week.' }
    }
    await db
      .from('desk_quotes')
      .update({ status: 'declined', decided_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', row.id)
    await emailWinBack(env, row, pdf)
    return {
      ok: true,
      status: 'declined',
      message: 'Noted. We emailed you a seven-day hold on this price, with the quote PDF attached. One reply is enough if you want the week reshaped.'
    }
  }

  if (row.stripe_checkout_url && (row.status === 'accepted' || row.status === 'invoiced')) {
    await emailPayLink(env, row, row.stripe_checkout_url, pdf)
    return { ok: true, status: 'invoiced', message: 'You already accepted this quote. We have sent the pay email again.' }
  }

  await db
    .from('desk_quotes')
    .update({ status: 'accepted', decided_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', row.id)
  const pay = await openCheckout(env, db, { ...row, status: 'accepted' })
  await emailPayLink(env, row, pay.checkoutUrl, pdf)
  return {
    ok: true,
    status: 'invoiced',
    message: 'Accepted. We emailed a Pay now button and the invoice PDF. You can pay from that email.'
  }
}
