/**
 * One-click Quote / Invoice / Receipt send for TOW admin (enquiry + customer).
 * Monzo bank transfer is primary; Stripe checkout remains optional secondary.
 */
import { randomBytes, randomUUID } from 'node:crypto'
import { Resend } from 'resend'
import Stripe from 'stripe'
import {
  buildLeanTransactionalEmailHtml,
  escapeHtml,
  finalizeGsolEmailHtml,
  lean,
  leanEmailButtonHtml,
  leanFont
} from './email-layout.mjs'
import { buildGsolMasterDocumentPdf } from './gsol-master-document-pdf.mjs'
import { loadSitePaymentForEmail, paymentBlockFromSettings } from './load-site-payment-for-email.mjs'
import { resolveResendToAddress, resendSandboxRecipientHint } from './resend-delivery-email.mjs'
import { getGsolSiteUrl } from './site-url.mjs'
import { buildGsolCatalogEmail } from './gsol-transactional-catalog.mjs'
import {
  buildPaymentRequestMeta,
  normalizePaymentRequestMode,
  paymentRequestCustomerCopy,
  resolvePaymentRequestAmounts,
  roundMoney2
} from '../shared/payment-request-mode.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

const blank = (v) => (typeof v === 'string' ? v.trim() : '')
const clip = (v, max) => String(v ?? '').trim().slice(0, max)

const fmtEur = (cents) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format((Number(cents) || 0) / 100)

const fmtEurFromNumber = (n) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0)

const sendMail = async (env, { to, subject, html, filename, pdfBytes }) => {
  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !fromEmail) throwStatus('Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.', 500)
  const resend = new Resend(resendKey)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: resolveResendToAddress(to, env),
    subject,
    html: finalizeGsolEmailHtml(html),
    attachments: pdfBytes
      ? [{ filename: filename || 'golf-sol-document.pdf', content: Buffer.from(pdfBytes).toString('base64'), contentType: 'application/pdf' }]
      : undefined
  })
  if (error) {
    const hint = /only send|testing emails|verify a domain|not verified/i.test(error.message || '')
      ? ` ${resendSandboxRecipientHint(env)}`
      : ''
    throwStatus(`${error.message || 'The email could not be sent.'}${hint}`, 502)
  }
}

const normalizeLines = (raw) => {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, 40).flatMap((line) => {
    if (!line || typeof line !== 'object') return []
    const description = clip(line.description || line.label || line.detail, 240)
    if (!description) return []
    const qty = Math.max(1, Number(line.qty) || 1)
    const unitEur =
      typeof line.unitEur === 'number'
        ? line.unitEur
        : typeof line.amount === 'number'
          ? line.amount
          : Number(String(line.amountEur || line.unit_amount || 0).replace(',', '.')) || 0
    return [{ description, qty, unitEur }]
  })
}

const linesToTripRows = (lines) =>
  lines.map((l, i) => ({
    label: lines.length === 1 ? 'Item' : `Line ${i + 1}`,
    value: `${l.description}${l.qty !== 1 ? ` × ${l.qty}` : ''} · ${fmtEurFromNumber(l.unitEur * l.qty)}`
  }))

const buildDocPdf = async ({ kind, title, reference, name, email, phone, summary, amountCents, lines, dueDate, validUntil }) => {
  const dated = new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })
  const pdfKind = kind === 'receipt' ? 'payment_receipt' : kind === 'invoice' ? 'invoice' : 'quotation'
  const rows = linesToTripRows(lines)
  if (dueDate) rows.push({ label: 'Due', value: dueDate })
  if (validUntil) rows.push({ label: 'Valid until', value: validUntil })
  return buildGsolMasterDocumentPdf({
    kind: pdfKind,
    title: title || (kind === 'receipt' ? 'Payment receipt' : kind === 'invoice' ? 'Invoice' : 'Quotation'),
    subtitle: reference,
    reference,
    dateLabel: dated,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    rows,
    amountLabel: amountCents > 0 ? (kind === 'receipt' ? 'Amount paid' : 'Total') : '',
    amountValue: amountCents > 0 ? fmtEur(amountCents) : '',
    notes: summary,
    filename: `golf-sol-${kind}-${reference.replace(/[^\w.-]+/g, '-')}.pdf`
  })
}

const pushProfileLogs = async (db, profileId, { invoiceEntry, activityNote, paymentEntry }) => {
  if (!profileId) return
  const { data: prof } = await db
    .from('profiles')
    .select('invoices_log, activity_log, payments_log')
    .eq('id', profileId)
    .maybeSingle()
  if (!prof) return
  const patch = {}
  if (invoiceEntry) {
    const log = Array.isArray(prof.invoices_log) ? [...prof.invoices_log] : []
    log.unshift(invoiceEntry)
    patch.invoices_log = log.slice(0, 200)
  }
  if (activityNote) {
    const log = Array.isArray(prof.activity_log) ? [...prof.activity_log] : []
    log.unshift({ at: new Date().toISOString(), note: activityNote })
    patch.activity_log = log.slice(0, 200)
  }
  if (paymentEntry) {
    const log = Array.isArray(prof.payments_log) ? [...prof.payments_log] : []
    log.unshift(paymentEntry)
    patch.payments_log = log.slice(0, 200)
  }
  if (Object.keys(patch).length) {
    await db.from('profiles').update(patch).eq('id', profileId)
  }
}

const ensurePortalInvoice = async (db, { profileId, enquiryId, reference, amountCents, createdBy, dueDate }) => {
  if (!profileId) return null
  const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`
  const inserted = await db
    .from('portal_invoices')
    .insert({
      profile_id: profileId,
      enquiry_id: enquiryId || null,
      enquiry_reference_id: reference,
      amount_cents: amountCents,
      currency: 'eur',
      status: 'sent',
      invoice_number: invoiceNumber,
      sent_by: createdBy || null,
      ...(dueDate ? { due_at: dueDate } : {})
    })
    .select('id, invoice_number')
    .single()
  if (inserted.error) {
    // due_at may not exist — retry without
    if (/due_at/i.test(inserted.error.message || '')) {
      const retry = await db
        .from('portal_invoices')
        .insert({
          profile_id: profileId,
          enquiry_id: enquiryId || null,
          enquiry_reference_id: reference,
          amount_cents: amountCents,
          currency: 'eur',
          status: 'sent',
          invoice_number: invoiceNumber,
          sent_by: createdBy || null
        })
        .select('id, invoice_number')
        .single()
      if (retry.error || !retry.data) return null
      return retry.data
    }
    console.warn('[tow-document-send] portal_invoices', inserted.error.message)
    return null
  }
  return inserted.data
}

const optionalStripeCheckout = async (env, db, row, portalInvoiceId) => {
  const stripeKey = env.STRIPE_SECRET_KEY?.trim()
  if (!stripeKey) return { checkoutUrl: null, sessionId: null }
  try {
    const origin = getGsolSiteUrl().replace(/\/+$/, '')
    const stripe = new Stripe(stripeKey)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: row.customer_email,
      client_reference_id: portalInvoiceId || row.id,
      metadata: {
        desk_quote_id: row.id,
        ...(portalInvoiceId ? { portal_invoice_id: portalInvoiceId } : {})
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: row.amount_cents,
            product_data: {
              name: row.title || `Golf Sol ${row.reference_code}`,
              description: clip([row.reference_code, row.summary].filter(Boolean).join(' — '), 400)
            }
          }
        }
      ],
      success_url: `${origin}/pay/${row.decision_token}?paid=1`,
      cancel_url: `${origin}/pay/${row.decision_token}`
    })
    if (session?.url) {
      await db
        .from('desk_quotes')
        .update({
          stripe_checkout_session_id: session.id,
          stripe_checkout_url: session.url,
          updated_at: new Date().toISOString()
        })
        .eq('id', row.id)
      if (portalInvoiceId) {
        await db
          .from('portal_invoices')
          .update({ stripe_checkout_session_id: session.id, stripe_checkout_url: session.url })
          .eq('id', portalInvoiceId)
      }
      return { checkoutUrl: session.url, sessionId: session.id }
    }
  } catch (err) {
    console.warn('[tow-document-send] optional Stripe', err instanceof Error ? err.message : err)
  }
  return { checkoutUrl: null, sessionId: null }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {NodeJS.ProcessEnv} env
 * @param {{
 *   kind: 'quote' | 'invoice' | 'receipt'
 *   email: string
 *   name?: string
 *   phone?: string
 *   title?: string
 *   summary?: string
 *   amountEur: number
 *   lines?: unknown[]
 *   validUntil?: string
 *   dueDate?: string
 *   enquiryId?: string | null
 *   profileId?: string | null
 *   createdBy?: string | null
 *   paidVia?: string
 *   invoiceMode?: 'deposit' | 'balance' | 'full' | 'deposit_20'
 *   paymentRequestMode?: 'deposit_20' | 'full'
 *   depositEur?: number
 *   amountReceivedEur?: number
 * }} input
 */
export const sendTowDocument = async (db, env, input) => {
  const kind = input.kind
  if (!['quote', 'invoice', 'receipt'].includes(kind)) throwStatus('Document kind must be quote, invoice, or receipt.')
  const email = blank(input.email).toLowerCase()
  if (!email.includes('@')) throwStatus('Customer email is required.')
  const tripTotalEur = roundMoney2(input.amountEur) ?? 0
  const mode = normalizePaymentRequestMode(
    input.paymentRequestMode ??
      (input.invoiceMode === 'deposit' || input.invoiceMode === 'deposit_20'
        ? 'deposit_20'
        : input.invoiceMode === 'balance' || input.invoiceMode === 'full'
          ? 'full'
          : 'deposit_20')
  )
  const depositEur =
    roundMoney2(input.depositEur) ??
    (mode === 'deposit_20' ? Math.round(tripTotalEur * 0.2 * 100) / 100 : tripTotalEur)
  const amountReceivedEur = roundMoney2(input.amountReceivedEur) ?? 0
  const resolved = resolvePaymentRequestAmounts({
    mode,
    tripTotalEur,
    depositEur,
    amountReceivedEur
  })
  const paymentMeta = buildPaymentRequestMeta(resolved)
  // Quotes show trip total; invoices charge amount due now (deposit or remaining).
  const chargeEur = kind === 'quote' || kind === 'receipt' ? tripTotalEur : resolved.amountNowEur
  const amountCents = Math.round((chargeEur || 0) * 100)
  if (kind !== 'receipt' && amountCents < 50) throwStatus('Enter a total of at least €0.50.')
  if (kind === 'receipt' && amountCents < 1) throwStatus('Receipt needs a paid amount.')

  const lines = normalizeLines(input.lines)
  if (!lines.length && amountCents > 0) {
    lines.push({
      description: clip(
        input.title ||
          (kind === 'quote'
            ? 'Trip quote'
            : kind === 'invoice'
              ? mode === 'deposit_20'
                ? '20% deposit'
                : 'Trip invoice'
              : 'Payment received'),
        240
      ),
      qty: 1,
      unitEur: amountCents / 100
    })
  }

  const settings = await loadSitePaymentForEmail(env)
  const origin = getGsolSiteUrl().replace(/\/+$/, '')
  const token = randomBytes(24).toString('hex')
  const reference =
    kind === 'receipt'
      ? `GSR-${Date.now().toString(36).toUpperCase()}`
      : kind === 'invoice'
        ? `GSI-${Date.now().toString(36).toUpperCase()}`
        : `GSQ-${Date.now().toString(36).toUpperCase()}`

  const rowBase = {
    kind: kind === 'receipt' ? 'invoice' : kind,
    document_kind: kind,
    profile_id: input.profileId || null,
    enquiry_id: input.enquiryId || null,
    customer_email: email,
    customer_name: clip(input.name, 160),
    customer_phone: clip(input.phone, 40),
    reference_code: reference,
    title: clip(
      input.title ||
        (kind === 'quote'
          ? 'Trip quote'
          : kind === 'invoice'
            ? mode === 'deposit_20'
              ? 'Deposit invoice (20%)'
              : amountReceivedEur > 0
                ? 'Balance invoice'
                : 'Trip invoice'
            : 'Payment receipt'),
      180
    ),
    summary: clip(input.summary, 4000),
    amount_cents: amountCents,
    status: kind === 'receipt' ? 'paid' : 'sent',
    decision_token: token,
    created_by: input.createdBy || null,
    line_items: lines,
    valid_until: blank(input.validUntil) || null,
    due_date: blank(input.dueDate) || null,
    paid_at: kind === 'receipt' ? new Date().toISOString() : null,
    trip_details: { paymentRequest: paymentMeta }
  }

  let inserted = await db.from('desk_quotes').insert(rowBase).select('*').single()
  if (
    inserted.error &&
    /document_kind|line_items|valid_until|due_date|customer_reported|trip_details/i.test(inserted.error.message || '')
  ) {
    // Migration not applied yet — insert lean row
    const leanRow = { ...rowBase }
    delete leanRow.document_kind
    delete leanRow.line_items
    delete leanRow.valid_until
    delete leanRow.due_date
    delete leanRow.trip_details
    inserted = await db.from('desk_quotes').insert(leanRow).select('*').single()
    if (inserted.data) {
      inserted.data.trip_details = rowBase.trip_details
    }
  }
  if (inserted.error || !inserted.data) {
    throwStatus(inserted.error?.message || 'Could not save document.', 500)
  }
  const row = inserted.data
  const payUrl = `${origin}/pay/${row.decision_token}`
  const amountLabel = fmtEur(amountCents)
  const customerCopy = paymentRequestCustomerCopy(paymentMeta, { amountCentsFallback: amountCents })
  const pay = paymentBlockFromSettings(settings, {
    paymentReference: reference,
    amountDueEur: amountCents / 100
  })

  const pdf = await buildDocPdf({
    kind,
    title: row.title,
    reference,
    name: row.customer_name,
    email: row.customer_email,
    phone: row.customer_phone,
    summary: row.summary,
    amountCents,
    lines,
    dueDate: blank(input.dueDate),
    validUntil: blank(input.validUntil)
  })

  let portalInvoice = null
  let stripe = { checkoutUrl: null }

  if (kind === 'invoice') {
    portalInvoice = await ensurePortalInvoice(db, {
      profileId: input.profileId,
      enquiryId: input.enquiryId,
      reference,
      amountCents,
      createdBy: input.createdBy,
      dueDate: blank(input.dueDate)
    })
    if (portalInvoice?.id) {
      await db
        .from('desk_quotes')
        .update({ portal_invoice_id: portalInvoice.id, status: 'invoiced', updated_at: new Date().toISOString() })
        .eq('id', row.id)
      row.portal_invoice_id = portalInvoice.id
      row.status = 'invoiced'
    }
    stripe = await optionalStripeCheckout(env, db, row, portalInvoice?.id || null)
  }

  const first = (row.customer_name || '').split(/\s+/)[0] || 'there'
  let subject = ''
  let html = ''

  if (kind === 'quote') {
    const acceptHref = `${origin}/quote-reply/${row.decision_token}?choice=accept`
    const declineHref = `${origin}/quote-reply/${row.decision_token}?choice=decline`
    subject = `Your Golf Sol quote — ${reference}`
    const validNote = blank(input.validUntil) ? ` Valid until ${blank(input.validUntil)}.` : ''
    html = finalizeGsolEmailHtml(
      buildLeanTransactionalEmailHtml({
        documentTitle: subject,
        preheader: `${amountLabel} for ${reference}.${validNote} PDF attached.`,
        kicker: `Quote · ${reference}`,
        title: 'Your quote is ready',
        lead: `Hello ${first}, here is the quote for ${row.title}. The PDF is attached.${validNote}`,
        rows: [
          ['Quoted total', amountLabel],
          ['Reference', reference],
          ...(blank(input.validUntil) ? [['Valid until', blank(input.validUntil)]] : []),
          ...lines.slice(0, 6).map((l) => [l.description, fmtEurFromNumber(l.unitEur * l.qty)])
        ],
        bodyHtml: `${row.summary ? `<p style="margin:0 0 14px;font-size:15px;line-height:24px;color:${lean.body};font-family:${leanFont};">${escapeHtml(row.summary)}</p>` : ''}
          <div style="margin:16px 0;">${leanEmailButtonHtml({ href: acceptHref, label: 'Accept quote' })}</div>
          <div style="margin:8px 0 16px;">${leanEmailButtonHtml({ href: declineHref, label: 'Decline', bg: lean.cream || '#F5F0E6', color: lean.ink || '#063B2A' })}</div>
          <p style="margin:24px 0 0;font-size:16px;line-height:24px;color:${lean.body};font-family:${leanFont};">Talk soon,<br><b>Golf Sol Ireland</b></p>`,
        footerHtml: `Quote ${escapeHtml(reference)}. All payments handled in Ireland.`
      })
    )
  } else if (kind === 'invoice') {
    subject = `Your Golf Sol invoice — ${reference}`
    const modeLabel = customerCopy.headline
    html = finalizeGsolEmailHtml(
      buildLeanTransactionalEmailHtml({
        documentTitle: subject,
        preheader: `${modeLabel}: ${customerCopy.amountNowLabel} · ref ${reference}. PDF attached.`,
        kicker: `${modeLabel} · ${reference}`,
        title: 'Your invoice is ready',
        lead: `Hello ${first}, ${customerCopy.leadExtra} Transfer to our Monzo account using reference ${reference}.`,
        rows: [
          ...customerCopy.rows,
          ['Reference', reference],
          ...(blank(input.dueDate) ? [['Due', blank(input.dueDate)]] : []),
          ...lines.slice(0, 6).map((l) => [l.description, fmtEurFromNumber(l.unitEur * l.qty)])
        ],
        payment: pay,
        cta: { href: payUrl, label: 'Open Monzo pay page' },
        bodyHtml: `${
          stripe.checkoutUrl
            ? `<div style="margin:12px 0;">${leanEmailButtonHtml({ href: stripe.checkoutUrl, label: 'Pay by card (optional)', bg: lean.ink || '#063B2A', color: '#fff' })}</div>`
            : ''
        }<p style="margin:16px 0 0;font-size:15px;line-height:24px;color:${lean.body};font-family:${leanFont};">Already paid? Tap “I’ve paid” on the pay page so we can match your transfer.</p>
          <p style="margin:24px 0 0;font-size:16px;line-height:24px;color:${lean.body};font-family:${leanFont};">Talk soon,<br><b>Golf Sol Ireland</b></p>`,
        footerHtml: `Invoice ${escapeHtml(reference)}. All payments handled in Ireland.`
      })
    )
  } else {
    const built = buildGsolCatalogEmail('payment-receipt', {
      amountLabel,
      reference,
      method: blank(input.paidVia) === 'revolut' ? 'Revolut' : blank(input.paidVia) === 'bank_transfer' ? 'Bank transfer' : 'Bank transfer (Monzo)',
      date: new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })
    })
    subject = built.subject
    html = built.html
  }

  await sendMail(env, { to: email, subject, html, filename: pdf.filename, pdfBytes: pdf.bytes })

  if (kind === 'invoice' && input.enquiryId) {
    const { data: enq } = await db.from('enquiries').select('form_payload').eq('id', input.enquiryId).maybeSingle()
    const payload =
      enq?.form_payload && typeof enq.form_payload === 'object' && !Array.isArray(enq.form_payload)
        ? { ...enq.form_payload }
        : {}
    payload._paymentRequest = {
      mode,
      tripTotalEur,
      depositEur: resolved.depositEur,
      amountNowEur: resolved.amountNowEur,
      updatedAt: new Date().toISOString()
    }
    await db
      .from('enquiries')
      .update({
        payment_status: 'awaiting_payment',
        amount_due_eur: tripTotalEur,
        deposit_eur: resolved.depositEur,
        payment_reference: reference,
        form_payload: payload
      })
      .eq('id', input.enquiryId)
  }

  if (kind === 'receipt' && input.enquiryId) {
    await db
      .from('enquiries')
      .update({
        payment_status: 'paid_in_full',
        last_payment_at: new Date().toISOString(),
        paid_via: blank(input.paidVia) || 'monzo',
        payment_customer_reported_at: null
      })
      .eq('id', input.enquiryId)
  }

  const invoiceEntry = {
    id: randomUUID(),
    number: portalInvoice?.invoice_number || reference,
    description: row.title,
    amount: amountCents / 100,
    dueDate: blank(input.dueDate) || blank(input.validUntil) || '',
    status: kind === 'receipt' ? 'paid' : kind === 'invoice' ? 'sent' : 'quote',
    kind,
    deskQuoteId: row.id,
    decisionToken: row.decision_token,
    payUrl: kind === 'invoice' ? payUrl : null,
    at: new Date().toISOString()
  }

  await pushProfileLogs(db, input.profileId, {
    invoiceEntry,
    activityNote: `${kind === 'quote' ? 'Quote' : kind === 'invoice' ? 'Invoice' : 'Receipt'} ${reference} emailed (€${(amountCents / 100).toFixed(2)})`,
    paymentEntry:
      kind === 'receipt'
        ? {
            id: randomUUID(),
            date: new Date().toISOString().slice(0, 10),
            amount: amountCents / 100,
            method: blank(input.paidVia) || 'monzo',
            reference,
            kind: 'paid_in_full',
            at: new Date().toISOString()
          }
        : null
  })

  return {
    ok: true,
    kind,
    reference,
    deskQuoteId: row.id,
    decisionToken: row.decision_token,
    payUrl: kind === 'invoice' || kind === 'quote' ? payUrl : null,
    stripeCheckoutUrl: stripe.checkoutUrl,
    portalInvoiceId: portalInvoice?.id || null,
    message: `${kind === 'quote' ? 'Quote' : kind === 'invoice' ? 'Invoice' : 'Receipt'} emailed to ${email} with PDF attached.`
  }
}

/**
 * Resend an existing desk document email (regenerates PDF).
 */
export const resendTowDocument = async (db, env, { deskQuoteId, profileId }) => {
  const id = blank(deskQuoteId)
  if (!id) throwStatus('Document id required.')
  const { data: row, error } = await db.from('desk_quotes').select('*').eq('id', id).maybeSingle()
  if (error) throwStatus(error.message, 500)
  if (!row) throwStatus('Document not found.', 404)

  const kind =
    row.document_kind === 'receipt' || row.status === 'paid'
      ? row.document_kind === 'quote'
        ? 'quote'
        : row.status === 'paid' && row.document_kind !== 'invoice'
          ? 'receipt'
          : row.document_kind || (row.kind === 'quote' ? 'quote' : row.status === 'paid' ? 'receipt' : 'invoice')
      : row.kind === 'quote'
        ? 'quote'
        : 'invoice'

  const lines = Array.isArray(row.line_items) && row.line_items.length
    ? normalizeLines(row.line_items)
    : [{ description: row.title || 'Trip', qty: 1, unitEur: (row.amount_cents || 0) / 100 }]

  const pdf = await buildDocPdf({
    kind: kind === 'receipt' ? 'receipt' : kind,
    title: row.title,
    reference: row.reference_code,
    name: row.customer_name,
    email: row.customer_email,
    phone: row.customer_phone,
    summary: row.summary,
    amountCents: row.amount_cents,
    lines,
    dueDate: row.due_date || '',
    validUntil: row.valid_until || ''
  })

  const origin = getGsolSiteUrl().replace(/\/+$/, '')
  const payUrl = `${origin}/pay/${row.decision_token}`
  const settings = await loadSitePaymentForEmail(env)
  const pay = paymentBlockFromSettings(settings, {
    paymentReference: row.reference_code,
    amountDueEur: (row.amount_cents || 0) / 100
  })
  const amountLabel = fmtEur(row.amount_cents)
  const first = (row.customer_name || '').split(/\s+/)[0] || 'there'

  let subject = `Golf Sol — ${row.reference_code}`
  let html = ''
  if (kind === 'quote') {
    subject = `Your Golf Sol quote — ${row.reference_code}`
    html = finalizeGsolEmailHtml(
      buildLeanTransactionalEmailHtml({
        documentTitle: subject,
        preheader: `${amountLabel} · ${row.reference_code}`,
        kicker: `Quote · ${row.reference_code}`,
        title: 'Your quote (resent)',
        lead: `Hello ${first}, here is your quote again. PDF attached.`,
        rows: [['Quoted total', amountLabel], ['Reference', row.reference_code]],
        cta: { href: `${origin}/quote-reply/${row.decision_token}?choice=accept`, label: 'Accept quote' },
        footerHtml: `Quote ${escapeHtml(row.reference_code)}.`
      })
    )
  } else if (kind === 'receipt') {
    const built = buildGsolCatalogEmail('payment-receipt', {
      amountLabel,
      reference: row.reference_code,
      method: 'Bank transfer (Monzo)',
      date: new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })
    })
    subject = built.subject
    html = built.html
  } else {
    subject = `Your Golf Sol invoice — ${row.reference_code}`
    html = finalizeGsolEmailHtml(
      buildLeanTransactionalEmailHtml({
        documentTitle: subject,
        preheader: `Pay ${amountLabel} · ${row.reference_code}`,
        kicker: `Invoice · ${row.reference_code}`,
        title: 'Your invoice (resent)',
        lead: `Hello ${first}, here is your invoice again with Monzo payment details.`,
        rows: [['Amount due', amountLabel], ['Reference', row.reference_code]],
        payment: pay,
        cta: { href: payUrl, label: 'Open Monzo pay page' },
        footerHtml: `Invoice ${escapeHtml(row.reference_code)}.`
      })
    )
  }

  await sendMail(env, {
    to: row.customer_email,
    subject,
    html,
    filename: pdf.filename,
    pdfBytes: pdf.bytes
  })

  await pushProfileLogs(db, profileId || row.profile_id, {
    activityNote: `Resent ${kind} ${row.reference_code} to ${row.customer_email}`
  })

  return { ok: true, message: `Resent to ${row.customer_email}.`, reference: row.reference_code }
}

/**
 * Return PDF bytes for download (admin).
 */
export const downloadTowDocumentPdf = async (db, deskQuoteId) => {
  const id = blank(deskQuoteId)
  if (!id) throwStatus('Document id required.')
  const { data: row, error } = await db.from('desk_quotes').select('*').eq('id', id).maybeSingle()
  if (error) throwStatus(error.message, 500)
  if (!row) throwStatus('Document not found.', 404)
  const kind =
    row.document_kind === 'receipt' || (row.status === 'paid' && row.kind !== 'quote')
      ? 'receipt'
      : row.kind === 'quote'
        ? 'quote'
        : 'invoice'
  const lines = Array.isArray(row.line_items) && row.line_items.length
    ? normalizeLines(row.line_items)
    : [{ description: row.title || 'Trip', qty: 1, unitEur: (row.amount_cents || 0) / 100 }]
  const pdf = await buildDocPdf({
    kind,
    title: row.title,
    reference: row.reference_code,
    name: row.customer_name,
    email: row.customer_email,
    phone: row.customer_phone,
    summary: row.summary,
    amountCents: row.amount_cents,
    lines,
    dueDate: row.due_date || '',
    validUntil: row.valid_until || ''
  })
  return {
    ok: true,
    filename: pdf.filename,
    pdfBase64: Buffer.from(pdf.bytes).toString('base64'),
    reference: row.reference_code,
    kind
  }
}
