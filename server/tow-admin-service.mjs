import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { sendTripStepUpdateEmail } from './trip-step-update-email.mjs'
import { getGsolSiteUrl } from './site-url.mjs'
import {
  downloadTowDocumentPdf,
  resendTowDocument,
  sendTowDocument
} from './tow-document-send.mjs'
import { resolveEnquiryFormType } from '../shared/enquiry-form-type.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

const blank = (v) => (typeof v === 'string' ? v.trim() : '')

const TRIP_STEPS = [
  'enquiry_received',
  'quote_sent',
  'deposit_paid',
  'flights_confirmed',
  'hotel_booked',
  'tee_times_booked',
  'transfers_booked',
  'balance_paid',
  'documents_sent',
  'trip_complete'
]

const defaultTracker = () =>
  Object.fromEntries(TRIP_STEPS.map((id, i) => [id, i === 0 ? 'done' : 'todo']))

const adminClient = (env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) throwStatus('Server is not configured.', 500)
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const requireAdmin = async (meta, env) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env, { cookieHeader: meta.cookieHeader })
  if (!auth.ok) throwStatus(auth.message, auth.statusCode)
  return auth.user
}

const mapEnquiry = (row) => {
  if (!row) return null
  const fp = row.form_payload && typeof row.form_payload === 'object' ? row.form_payload : {}
  const fields = fp.fields && typeof fp.fields === 'object' ? fp.fields : {}
  const name =
    blank(fields.Name) ||
    blank(fields.name) ||
    [blank(fields.first_name), blank(fields.last_name)].filter(Boolean).join(' ') ||
    blank(row.full_name) ||
    '—'
  const email = blank(fields.Email) || blank(fields.email) || blank(row.email) || ''
  const phone = blank(fields.Phone) || blank(fields.phone) || blank(row.phone) || blank(row.phone_e164) || ''
  const interest =
    blank(fields.Interest) ||
    blank(fields.Message) ||
    blank(fields.message) ||
    blank(fp.interest) ||
    ''
  const formKey = blank(fp.form) || blank(fp.source) || 'enquiry'
  const formType = resolveEnquiryFormType({
    formType: row.form_type,
    formTypeLabel: row.form_type_label,
    formSourcePage: row.form_source_page,
    formKey,
    formPayload: fp,
    interest,
    source: blank(fp.source) || null
  })
  const amount =
    typeof row.amount_due_eur === 'number'
      ? row.amount_due_eur
      : typeof row.amount_total_eur === 'number'
        ? row.amount_total_eur
        : null
  let payUi = row.payment_status || 'awaiting_payment'
  if (row.payment_customer_reported_at && payUi === 'awaiting_payment') {
    payUi = 'customer_reported'
  }
  if (amount == null && !row.payment_status) {
    payUi = 'none'
  }
  return {
    id: row.id,
    reference: blank(row.payment_reference) || blank(row.reference_id) || row.id?.slice?.(0, 8) || '',
    createdAt: row.created_at,
    name,
    email,
    phone,
    interest: interest.slice(0, 280),
    message: interest,
    formKey,
    formType: formType.id,
    formTypeLabel: formType.label,
    formTypeShort: formType.shortLabel,
    formSourcePage: formType.sourcePage || '',
    formTypeBadgeClass: formType.badgeClass,
    requestedServices: row.requested_services || null,
    adminStatus: row.admin_status || 'new',
    adminPrivateNotes: row.admin_private_notes || '',
    paymentStatus: row.payment_status || null,
    paymentUi: payUi,
    amountDue: amount,
    paidVia: row.paid_via || null,
    paymentCustomerReportedAt: row.payment_customer_reported_at || null,
    lastPaymentAt: row.last_payment_at || null,
    tripTracker: row.trip_tracker && typeof row.trip_tracker === 'object' ? row.trip_tracker : defaultTracker(),
    emailTripOnStepChange:
      typeof row.email_trip_on_step_change === 'boolean' ? row.email_trip_on_step_change : true,
    tripStepEmailLog: Array.isArray(row.trip_step_email_log) ? row.trip_step_email_log : [],
    fields,
    formPayload: fp
  }
}

const pushActivity = (log, note) => {
  const list = Array.isArray(log) ? [...log] : []
  list.unshift({ at: new Date().toISOString(), note })
  return list.slice(0, 200)
}

/**
 * @param {import('node:process').ProcessEnv} env
 * @param {{ method?: string; authHeader?: string; cookieHeader?: string; body?: Record<string, unknown> }} meta
 */
/** Public marketing read — enabled offer only (no admin cookie). */
export const handleLaunchOfferPublic = async (env = process.env) => {
  const admin = adminClient(env)
  const { data, error } = await admin.from('site_launch_offer').select('*').eq('id', 1).maybeSingle()
  if (error) throwStatus(error.message, 500)
  if (!data || !data.enabled) {
    return { ok: true, offer: null }
  }
  const remaining = Math.max(0, (data.total_places || 0) - (data.places_claimed || 0))
  const deadlineMs = data.deadline_at ? new Date(data.deadline_at).getTime() : null
  if (deadlineMs != null && Number.isFinite(deadlineMs) && deadlineMs < Date.now()) {
    return { ok: true, offer: null }
  }
  if (remaining <= 0) {
    return { ok: true, offer: null }
  }
  return {
    ok: true,
    offer: {
      enabled: true,
      totalPlaces: data.total_places,
      placesClaimed: data.places_claimed,
      placesLeft: remaining,
      deadlineAt: data.deadline_at,
      headline:
        blank(data.headline) ||
        `${data.total_places} golf trips. Limited places. Then it's over.`
    }
  }
}

export const handleTowAdmin = async (env = process.env, meta = {}) => {
  await requireAdmin(meta, env)
  const admin = adminClient(env)
  const body = meta.body && typeof meta.body === 'object' ? meta.body : {}
  const action = blank(body.action)

  if (action === 'system_status') {
    const { data: pay } = await admin.from('site_payment_settings').select('*').eq('id', 1).maybeSingle()
    const siteUrl = blank(env.PUBLIC_SITE_URL) || blank(env.VITE_SITE_URL) || 'https://www.golfsolirl.com'
    const hasResend = Boolean(blank(env.RESEND_API_KEY))
    const hasMonzo = Boolean(blank(pay?.monzo_iban) && blank(pay?.monzo_account_name))
    return {
      ok: true,
      storage: { ok: true, label: 'Supabase Postgres' },
      email: {
        ok: hasResend,
        label: hasResend
          ? 'Sending confirmation + notification emails'
          : 'Resend not configured (RESEND_API_KEY)'
      },
      payments: {
        ok: hasMonzo,
        label: hasMonzo
          ? `Monzo ${blank(pay.monzo_iban_display) || blank(pay.monzo_iban)} · Revolut · bank transfer`
          : 'Monzo IBAN not set yet'
      },
      site: { ok: !siteUrl.includes('vercel.app'), label: siteUrl }
    }
  }

  if (action === 'enquiries_list') {
    const { data, error } = await admin
      .from('enquiries')
      .select(
        'id, created_at, email, phone, phone_e164, form_payload, source, form_type, form_type_label, form_source_page, admin_status, admin_private_notes, payment_status, payment_reference, amount_due_eur, amount_total_eur, paid_via, payment_customer_reported_at, last_payment_at, requested_services, reference_id, full_name, interest, trip_tracker, email_trip_on_step_change, trip_step_email_log'
      )
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throwStatus(error.message, 500)
    return { ok: true, enquiries: (data || []).map(mapEnquiry) }
  }

  if (action === 'enquiries_get') {
    const id = blank(body.id)
    if (!id) throwStatus('Enquiry id required.')
    const { data, error } = await admin.from('enquiries').select('*').eq('id', id).maybeSingle()
    if (error) throwStatus(error.message, 500)
    if (!data) throwStatus('Enquiry not found.', 404)
    let linkedProfile = null
    const { data: prof } = await admin
      .from('profiles')
      .select('id, email, full_name, account_reference_id, portal_token, business_name')
      .or(`linked_enquiry_id.eq.${id},email.eq.${blank(data.email)}`)
      .limit(1)
      .maybeSingle()
    if (prof) linkedProfile = prof
    return { ok: true, enquiry: mapEnquiry(data), raw: data, linkedProfile }
  }

  if (action === 'enquiries_patch') {
    const id = blank(body.id)
    if (!id) throwStatus('Enquiry id required.')
    const { data: existing, error: gErr } = await admin.from('enquiries').select('*').eq('id', id).maybeSingle()
    if (gErr) throwStatus(gErr.message, 500)
    if (!existing) throwStatus('Enquiry not found.', 404)

    const patch = {}
    if (typeof body.adminStatus === 'string') patch.admin_status = blank(body.adminStatus)
    if (typeof body.adminPrivateNotes === 'string') patch.admin_private_notes = body.adminPrivateNotes
    if (typeof body.paidVia === 'string') patch.paid_via = blank(body.paidVia) || null
    if (typeof body.amountDueEur === 'number') patch.amount_due_eur = body.amountDueEur
    if (typeof body.emailTripOnStepChange === 'boolean') {
      patch.email_trip_on_step_change = body.emailTripOnStepChange
    }
    if (body.paymentUi === 'customer_reported') {
      patch.payment_customer_reported_at = new Date().toISOString()
      patch.payment_status = 'awaiting_payment'
    }
    if (body.paymentUi === 'awaiting_payment') {
      patch.payment_customer_reported_at = null
      patch.payment_status = 'awaiting_payment'
    }
    if (body.paymentUi === 'paid_in_full' || body.paymentStatus === 'paid_in_full') {
      patch.payment_status = 'paid_in_full'
      patch.last_payment_at = new Date().toISOString()
      patch.payment_customer_reported_at = null
    }
    if (body.paymentUi === 'deposit_received') patch.payment_status = 'deposit_received'
    if (body.paymentUi === 'refunded') patch.payment_status = 'refunded'

    let stepEmailResult = null
    let receiptResult = null
    if (body.tripStep && typeof body.tripStep === 'object') {
      const stepId = blank(body.tripStep.id)
      const status = blank(body.tripStep.status)
      if (!TRIP_STEPS.includes(stepId)) throwStatus('Unknown trip step.')
      if (!['todo', 'doing', 'done', 'skip'].includes(status)) throwStatus('Invalid step status.')
      const tracker = {
        ...(existing.trip_tracker && typeof existing.trip_tracker === 'object'
          ? existing.trip_tracker
          : defaultTracker()),
        [stepId]: status
      }
      patch.trip_tracker = tracker

      const emailOn =
        typeof body.emailTripOnStepChange === 'boolean'
          ? body.emailTripOnStepChange
          : typeof existing.email_trip_on_step_change === 'boolean'
            ? existing.email_trip_on_step_change
            : true
      const mapped = mapEnquiry(existing)
      if (emailOn && mapped.email) {
        const site = getGsolSiteUrl().replace(/\/+$/, '')
        const { data: prof } = await admin
          .from('profiles')
          .select('portal_token')
          .or(`linked_enquiry_id.eq.${id},email.eq.${mapped.email}`)
          .limit(1)
          .maybeSingle()
        const portalUrl = prof?.portal_token ? `${site}/portal/${prof.portal_token}` : `${site}/portal`
        stepEmailResult = await sendTripStepUpdateEmail(env, {
          firstName: mapped.name,
          email: mapped.email,
          reference: mapped.reference || id.slice(0, 8),
          stepId,
          status,
          tracker,
          portalUrl
        })
        if (stepEmailResult?.sent) {
          const log = Array.isArray(existing.trip_step_email_log) ? [...existing.trip_step_email_log] : []
          log.unshift({
            at: new Date().toISOString(),
            stepId,
            status,
            to: stepEmailResult.to || mapped.email,
            subject: stepEmailResult.subject || ''
          })
          patch.trip_step_email_log = log.slice(0, 100)
        }
      }
    }

    if (Object.keys(patch).length === 0 && !body.emailReceipt) throwStatus('Nothing to update.')
    let data = existing
    if (Object.keys(patch).length > 0) {
      const updated = await admin.from('enquiries').update(patch).eq('id', id).select('*').maybeSingle()
      if (updated.error) throwStatus(updated.error.message, 500)
      data = updated.data
    }

    // One-click receipt when marking Paid with emailReceipt
    if (
      body.emailReceipt === true &&
      (body.paymentUi === 'paid_in_full' || body.paymentStatus === 'paid_in_full')
    ) {
      const mapped = mapEnquiry(data)
      if (mapped.email) {
        const { data: prof } = await admin
          .from('profiles')
          .select('id')
          .or(`linked_enquiry_id.eq.${id},email.eq.${mapped.email}`)
          .limit(1)
          .maybeSingle()
        const profileId = prof?.id || null
        try {
          receiptResult = await sendTowDocument(admin, env, {
            kind: 'receipt',
            email: mapped.email,
            name: mapped.name,
            phone: mapped.phone,
            title: 'Payment receipt',
            summary: `Payment received for enquiry ${mapped.reference || id.slice(0, 8)}.`,
            amountEur:
              typeof body.amountDueEur === 'number'
                ? body.amountDueEur
                : typeof mapped.amountDue === 'number'
                  ? mapped.amountDue
                  : 0,
            enquiryId: id,
            profileId,
            createdBy: null,
            paidVia: blank(body.paidVia) || blank(data.paid_via) || 'monzo'
          })
        } catch (err) {
          receiptResult = {
            ok: false,
            message: err instanceof Error ? err.message : 'Receipt email failed'
          }
        }
      }
    }

    return {
      ok: true,
      enquiry: mapEnquiry(data),
      stepEmail: stepEmailResult,
      receipt: receiptResult
    }
  }

  if (action === 'enquiries_delete') {
    const id = blank(body.id)
    if (!id) throwStatus('Enquiry id required.')
    const { error } = await admin.from('enquiries').delete().eq('id', id)
    if (error) throwStatus(error.message, 500)
    return { ok: true }
  }

  if (action === 'enquiries_export_csv') {
    const { data, error } = await admin
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2000)
    if (error) throwStatus(error.message, 500)
    const rows = (data || []).map(mapEnquiry)
    const header = [
      'Reference',
      'Received',
      'Name',
      'Email',
      'Phone',
      'Form type',
      'Form type id',
      'Form key',
      'Source page',
      'Interest',
      'Payment',
      'Amount',
      'Status'
    ]
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.reference,
          r.createdAt,
          r.name,
          r.email,
          r.phone,
          r.formTypeLabel,
          r.formType,
          r.formKey,
          r.formSourcePage,
          r.interest,
          r.paymentUi,
          r.amountDue ?? '',
          r.adminStatus
        ]
          .map(esc)
          .join(',')
      )
    ]
    return { ok: true, csv: lines.join('\n'), filename: `golfsol-enquiries-${new Date().toISOString().slice(0, 10)}.csv` }
  }

  if (action === 'send_document') {
    const user = await requireAdmin(meta, env)
    const kind = blank(body.kind)
    if (!['quote', 'invoice', 'receipt'].includes(kind)) throwStatus('kind must be quote, invoice, or receipt.')
    const enquiryId = blank(body.enquiryId) || null
    const customerId = blank(body.customerId) || null
    let email = blank(body.email).toLowerCase()
    let name = blank(body.name)
    let phone = blank(body.phone)
    let profileId = customerId || null
    let amountEur = typeof body.amountEur === 'number' ? body.amountEur : Number(body.amountEur)

    if (enquiryId) {
      const { data: enq, error } = await admin.from('enquiries').select('*').eq('id', enquiryId).maybeSingle()
      if (error) throwStatus(error.message, 500)
      if (!enq) throwStatus('Enquiry not found.', 404)
      const mapped = mapEnquiry(enq)
      email = email || mapped.email
      name = name || mapped.name
      phone = phone || mapped.phone
      if (!Number.isFinite(amountEur) || amountEur <= 0) amountEur = mapped.amountDue || 0
      if (!profileId) {
        const { data: prof } = await admin
          .from('profiles')
          .select('id')
          .or(`linked_enquiry_id.eq.${enquiryId},email.eq.${email}`)
          .limit(1)
          .maybeSingle()
        profileId = prof?.id || null
      }
    } else if (customerId) {
      const { data: cust, error } = await admin.from('profiles').select('*').eq('id', customerId).maybeSingle()
      if (error) throwStatus(error.message, 500)
      if (!cust) throwStatus('Customer not found.', 404)
      email = email || blank(cust.email)
      name = name || blank(cust.full_name)
      phone = phone || blank(cust.phone_e164)
      profileId = cust.id
    }

    const result = await sendTowDocument(admin, env, {
      kind,
      email,
      name,
      phone,
      title: blank(body.title) || undefined,
      summary: blank(body.summary) || blank(body.description) || undefined,
      amountEur: Number.isFinite(amountEur) ? amountEur : 0,
      lines: Array.isArray(body.lines) ? body.lines : undefined,
      validUntil: blank(body.validUntil) || undefined,
      dueDate: blank(body.dueDate) || undefined,
      enquiryId,
      profileId,
      createdBy: user?.id || null,
      paidVia: blank(body.paidVia) || 'monzo',
      invoiceMode: blank(body.invoiceMode) || 'full'
    })
    return result
  }

  if (action === 'resend_document') {
    const result = await resendTowDocument(admin, env, {
      deskQuoteId: blank(body.deskQuoteId) || blank(body.id),
      profileId: blank(body.customerId) || null
    })
    return result
  }

  if (action === 'download_document') {
    return downloadTowDocumentPdf(admin, blank(body.deskQuoteId) || blank(body.id))
  }

  if (action === 'list_documents') {
    const email = blank(body.email).toLowerCase()
    const enquiryId = blank(body.enquiryId)
    const profileId = blank(body.customerId)
    let q = admin.from('desk_quotes').select('*').order('created_at', { ascending: false }).limit(100)
    if (enquiryId) q = q.eq('enquiry_id', enquiryId)
    else if (profileId) q = q.eq('profile_id', profileId)
    else if (email) q = q.ilike('customer_email', email)
    else throwStatus('enquiryId, customerId, or email required.')
    const { data, error } = await q
    if (error) throwStatus(error.message, 500)
    const origin = getGsolSiteUrl().replace(/\/+$/, '')
    return {
      ok: true,
      documents: (data || []).map((row) => ({
        id: row.id,
        kind: row.document_kind || row.kind,
        reference: row.reference_code,
        title: row.title,
        amountCents: row.amount_cents,
        status: row.status,
        createdAt: row.created_at,
        dueDate: row.due_date,
        validUntil: row.valid_until,
        payUrl: `${origin}/pay/${row.decision_token}`,
        customerReportedAt: row.customer_reported_paid_at || null
      }))
    }
  }

  if (action === 'customers_list') {
    const { data, error } = await admin
      .from('profiles')
      .select(
        'id, email, full_name, phone_e164, account_reference_id, business_name, trip_tracker, payments_log, archived_at, created_at, role'
      )
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throwStatus(error.message, 500)
    const customers = (data || []).filter((p) => !body.includeArchived || true)
    return {
      ok: true,
      customers: customers.map((p) => ({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        phone: p.phone_e164,
        accountRef: p.account_reference_id,
        businessName: p.business_name,
        tripTracker: p.trip_tracker || defaultTracker(),
        paymentsLog: Array.isArray(p.payments_log) ? p.payments_log : [],
        archivedAt: p.archived_at,
        createdAt: p.created_at
      })),
      stats: {
        count: customers.filter((c) => !c.archived_at).length,
        archived: customers.filter((c) => c.archived_at).length
      }
    }
  }

  if (action === 'customers_get') {
    const id = blank(body.id)
    if (!id) throwStatus('Customer id required.')
    const { data, error } = await admin.from('profiles').select('*').eq('id', id).maybeSingle()
    if (error) throwStatus(error.message, 500)
    if (!data) throwStatus('Customer not found.', 404)
    return {
      ok: true,
      customer: {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        phone: data.phone_e164,
        accountRef: data.account_reference_id,
        businessName: data.business_name,
        billingAddress: data.billing_address,
        adminNotes: data.admin_notes || '',
        tripTracker: data.trip_tracker && typeof data.trip_tracker === 'object' ? data.trip_tracker : defaultTracker(),
        emailRecipients: Array.isArray(data.email_recipients) ? data.email_recipients : [],
        emailTripOnStepChange:
          typeof data.email_trip_on_step_change === 'boolean' ? data.email_trip_on_step_change : true,
        paymentsLog: Array.isArray(data.payments_log) ? data.payments_log : [],
        invoicesLog: Array.isArray(data.invoices_log) ? data.invoices_log : [],
        activityLog: Array.isArray(data.activity_log) ? data.activity_log : [],
        tripStepEmailLog: Array.isArray(data.trip_step_email_log) ? data.trip_step_email_log : [],
        archivedAt: data.archived_at,
        linkedEnquiryId: data.linked_enquiry_id,
        portalToken: data.portal_token,
        createdAt: data.created_at
      }
    }
  }

  if (action === 'customers_patch') {
    const id = blank(body.id)
    if (!id) throwStatus('Customer id required.')
    const { data: existing, error: gErr } = await admin.from('profiles').select('*').eq('id', id).maybeSingle()
    if (gErr) throwStatus(gErr.message, 500)
    if (!existing) throwStatus('Customer not found.', 404)

    const patch = {}
    if (typeof body.fullName === 'string') patch.full_name = blank(body.fullName)
    if (typeof body.businessName === 'string') patch.business_name = blank(body.businessName)
    if (typeof body.billingAddress === 'string') patch.billing_address = body.billingAddress
    if (typeof body.adminNotes === 'string') patch.admin_notes = body.adminNotes
    if (typeof body.emailTripOnStepChange === 'boolean') patch.email_trip_on_step_change = body.emailTripOnStepChange
    if (Array.isArray(body.emailRecipients)) patch.email_recipients = body.emailRecipients
    if (body.tripTracker && typeof body.tripTracker === 'object') patch.trip_tracker = body.tripTracker
    if (body.archive === true) patch.archived_at = new Date().toISOString()
    if (body.archive === false) patch.archived_at = null

    if (body.logPayment && typeof body.logPayment === 'object') {
      const p = body.logPayment
      const entry = {
        id: randomUUID(),
        date: blank(p.date) || new Date().toISOString().slice(0, 10),
        amount: Number(p.amount) || 0,
        method: blank(p.method) || 'monzo',
        reference: blank(p.reference),
        kind: blank(p.kind) || 'deposit',
        at: new Date().toISOString()
      }
      const log = Array.isArray(existing.payments_log) ? [...existing.payments_log] : []
      log.unshift(entry)
      patch.payments_log = log.slice(0, 200)
      patch.activity_log = pushActivity(existing.activity_log, `Payment logged €${entry.amount} via ${entry.method}`)
    }

    if (body.createInvoice && typeof body.createInvoice === 'object') {
      const inv = body.createInvoice
      const entry = {
        id: randomUUID(),
        number: `GS-${Date.now().toString(36).toUpperCase()}`,
        description: blank(inv.description) || 'Trip invoice',
        amount: Number(inv.amount) || 0,
        dueDate: blank(inv.dueDate),
        status: 'open',
        at: new Date().toISOString()
      }
      const log = Array.isArray(existing.invoices_log) ? [...existing.invoices_log] : []
      log.unshift(entry)
      patch.invoices_log = log.slice(0, 200)
      patch.activity_log = pushActivity(existing.activity_log, `Invoice ${entry.number} created (€${entry.amount})`)
    }

    let stepEmailResult = null
    if (body.tripStep && typeof body.tripStep === 'object') {
      const stepId = blank(body.tripStep.id)
      const status = blank(body.tripStep.status)
      if (!TRIP_STEPS.includes(stepId)) throwStatus('Unknown trip step.')
      if (!['todo', 'doing', 'done', 'skip'].includes(status)) throwStatus('Invalid step status.')
      const tracker = {
        ...(existing.trip_tracker && typeof existing.trip_tracker === 'object' ? existing.trip_tracker : defaultTracker()),
        [stepId]: status
      }
      patch.trip_tracker = tracker
      patch.activity_log = pushActivity(existing.activity_log, `Trip: ${stepId} → ${status}`)

      const emailOn =
        typeof body.emailTripOnStepChange === 'boolean'
          ? body.emailTripOnStepChange
          : typeof existing.email_trip_on_step_change === 'boolean'
            ? existing.email_trip_on_step_change
            : true
      const to = blank(existing.email)
      if (emailOn && to) {
        const site = getGsolSiteUrl().replace(/\/+$/, '')
        const portalUrl = existing.portal_token
          ? `${site}/portal/${existing.portal_token}`
          : `${site}/portal`
        stepEmailResult = await sendTripStepUpdateEmail(env, {
          firstName: blank(existing.full_name) || to,
          email: to,
          reference: blank(existing.account_reference_id) || id.slice(0, 8),
          stepId,
          status,
          tracker,
          portalUrl
        })
        if (stepEmailResult?.sent) {
          const elog = Array.isArray(existing.trip_step_email_log) ? [...existing.trip_step_email_log] : []
          elog.unshift({
            at: new Date().toISOString(),
            stepId,
            status,
            to: stepEmailResult.to || to,
            subject: stepEmailResult.subject || ''
          })
          patch.trip_step_email_log = elog.slice(0, 100)
        }
      }
    }

    const { data, error } = await admin.from('profiles').update(patch).eq('id', id).select('*').maybeSingle()
    if (error) throwStatus(error.message, 500)
    return { ok: true, customerId: data.id, stepEmail: stepEmailResult }
  }

  if (action === 'customers_link_enquiry') {
    const enquiryId = blank(body.enquiryId)
    const customerId = blank(body.customerId)
    if (!enquiryId || !customerId) throwStatus('Enquiry and customer ids required.')
    const { error } = await admin
      .from('profiles')
      .update({ linked_enquiry_id: enquiryId })
      .eq('id', customerId)
    if (error) throwStatus(error.message, 500)
    return { ok: true, customerId }
  }

  if (action === 'offer_get') {
    const { data, error } = await admin.from('site_launch_offer').select('*').eq('id', 1).maybeSingle()
    if (error) throwStatus(error.message, 500)
    return {
      ok: true,
      offer: {
        enabled: Boolean(data?.enabled),
        totalPlaces: data?.total_places ?? 25,
        placesClaimed: data?.places_claimed ?? 0,
        deadlineAt: data?.deadline_at ?? null,
        headline: data?.headline ?? ''
      }
    }
  }

  if (action === 'offer_save') {
    const patch = {
      enabled: Boolean(body.enabled),
      total_places: Math.max(0, Number(body.totalPlaces) || 0),
      places_claimed: Math.max(0, Number(body.placesClaimed) || 0),
      deadline_at: blank(body.deadlineAt) || null,
      headline: typeof body.headline === 'string' ? body.headline : '',
      updated_at: new Date().toISOString()
    }
    const { data, error } = await admin
      .from('site_launch_offer')
      .upsert({ id: 1, ...patch }, { onConflict: 'id' })
      .select('*')
      .maybeSingle()
    if (error) throwStatus(error.message, 500)
    return {
      ok: true,
      offer: {
        enabled: Boolean(data.enabled),
        totalPlaces: data.total_places,
        placesClaimed: data.places_claimed,
        deadlineAt: data.deadline_at,
        headline: data.headline || ''
      }
    }
  }

  throwStatus('Unknown action.', 400)
}
