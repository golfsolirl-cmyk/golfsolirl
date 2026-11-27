/**
 * Public Monzo pay page API (TOW Revolut pay-page replica).
 * Token = desk_quotes.decision_token. Primary method = Monzo bank transfer
 * with booking/reference as payment reference. Optional Revolut/bank secondary
 * only when env REVOLUT_PAY_URL / BANK_TRANSFER_NOTE are set.
 */
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import {
  buildLeanTransactionalEmailHtml,
  escapeHtml,
  finalizeGsolEmailHtml,
  lean,
  leanFont
} from './email-layout.mjs'
import { gsolEmailBrand } from './email-constants.mjs'
import { loadSitePaymentForEmail, paymentBlockFromSettings } from './load-site-payment-for-email.mjs'
import { buildGsolCatalogEmail } from './gsol-transactional-catalog.mjs'
import { resolveResendToAddress, resendSandboxRecipientHint } from './resend-delivery-email.mjs'
import { getGsolSiteUrl } from './site-url.mjs'
import {
  paymentRequestCustomerCopy,
  readPaymentRequestMeta
} from '../shared/payment-request-mode.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

const getDb = (env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) throwStatus('Server is not configured.', 500)
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const fmtEur = (cents) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format((Number(cents) || 0) / 100)

const tokenOk = (token) => /^[a-f0-9]{32,64}$/i.test(String(token || '').trim())

const loadRow = async (db, token) => {
  const { data, error } = await db.from('desk_quotes').select('*').eq('decision_token', token).maybeSingle()
  if (error) throwStatus(error.message, 500)
  if (!data) throwStatus('This pay link is not recognised or has expired.', 404)
  return data
}

const sendHtmlMail = async (env, { to, subject, html, replyTo }) => {
  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !fromEmail) throwStatus('Email is not configured.', 500)
  const resend = new Resend(resendKey)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: resolveResendToAddress(to, env),
    subject,
    html: finalizeGsolEmailHtml(html),
    ...(replyTo ? { reply_to: replyTo } : {})
  })
  if (error) {
    const hint = /only send|testing emails|verify a domain|not verified/i.test(error.message || '')
      ? ` ${resendSandboxRecipientHint(env)}`
      : ''
    throwStatus(`${error.message || 'Email failed.'}${hint}`, 502)
  }
}

const adminNotifyEmail = (env) =>
  env.ADMIN_NOTIFY_EMAIL?.trim() ||
  env.ADMIN_EMAIL?.trim() ||
  gsolEmailBrand.email ||
  'info@golfsolirl.com'

const buildAdminPayNotice = ({ event, row, amountLabel, adminUrl }) => {
  const copy = {
    opened: {
      pill: 'Payment details opened',
      line: `${row.customer_name || 'A customer'} opened their Monzo pay page. Nothing for you to send — the page shows bank transfer details with reference ${row.reference_code}.`
    },
    reported: {
      pill: 'Customer says paid',
      line: `${row.customer_name || 'A customer'} tapped “I’ve paid”. Check Monzo for reference ${row.reference_code}, then mark Paid in admin.`
    },
    emailed: {
      pill: 'Payment details emailed',
      line: `${row.customer_name || 'A customer'} asked for payment details by email; they were sent to ${row.customer_email}.`
    }
  }
  const c = copy[event] || copy.opened
  const rows = [
    ['Name', row.customer_name || '—'],
    ['Email', row.customer_email || '—'],
    ['Reference', row.reference_code],
    ['Item', row.title || 'Trip payment'],
    ['Amount due', amountLabel]
  ]
  const html = finalizeGsolEmailHtml(
    buildLeanTransactionalEmailHtml({
      documentTitle: c.pill,
      preheader: `${c.pill} · ${row.reference_code}`,
      kicker: c.pill,
      title: 'Golf Sol Ireland — pay page activity',
      lead: c.line,
      rows,
      cta: { href: adminUrl, label: 'Open in admin' },
      footerHtml: `Pay page activity · ref ${escapeHtml(row.reference_code)}.`,
      includePastCustomersGallery: false
    })
  )
  return { subject: `Golf Sol — ${c.pill} (${row.reference_code})`, html }
}

const secondaryMethods = (env) => {
  const revolutUrl = env.REVOLUT_PAY_URL?.trim() || ''
  const bankNote = env.BANK_TRANSFER_NOTE?.trim() || ''
  return {
    revolutUrl: revolutUrl || null,
    bankNote: bankNote || null
  }
}

const publicPayload = async (env, row) => {
  const settings = await loadSitePaymentForEmail(env)
  const amountLabel = fmtEur(row.amount_cents)
  const meta = readPaymentRequestMeta(row.trip_details)
  const copy = meta
    ? paymentRequestCustomerCopy(meta, { amountCentsFallback: row.amount_cents })
    : paymentRequestCustomerCopy(
        {
          mode: 'full',
          tripTotalEur: (Number(row.amount_cents) || 0) / 100,
          depositEur: 0,
          amountNowEur: (Number(row.amount_cents) || 0) / 100,
          amountReceivedEur: 0,
          remainingAfterNowEur: 0
        },
        { amountCentsFallback: row.amount_cents }
      )
  const pay = paymentBlockFromSettings(settings, {
    paymentReference: row.reference_code,
    amountDueEur: (Number(row.amount_cents) || 0) / 100
  })
  const origin = getGsolSiteUrl().replace(/\/+$/, '')
  const secondary = secondaryMethods(env)
  const status =
    row.status === 'paid'
      ? 'paid'
      : row.customer_reported_paid_at
        ? 'customer_reported'
        : 'awaiting_payment'
  return {
    ok: true,
    reference: row.reference_code,
    title: row.title || 'Your Golf Sol trip',
    summary: row.summary || '',
    amountLabel: copy.amountNowLabel || amountLabel,
    amountCents: row.amount_cents,
    paymentRequest: {
      mode: copy.mode,
      headline: copy.headline,
      leadExtra: copy.leadExtra,
      rows: copy.rows,
      amountNowLabel: copy.amountNowLabel,
      amountNowEur: copy.amountNowEur,
      tripTotalEur: meta?.tripTotalEur ?? (Number(row.amount_cents) || 0) / 100,
      remainingAfterNowEur: meta?.remainingAfterNowEur ?? 0
    },
    status,
    paidAt: row.paid_at || null,
    customerReportedAt: row.customer_reported_paid_at || null,
    dueDate: row.due_date || null,
    validUntil: row.valid_until || null,
    kind: row.kind,
    customerName: row.customer_name || '',
    customerEmail: row.customer_email || '',
    monzo: pay,
    secondary,
    stripeCheckoutUrl: row.stripe_checkout_url || null,
    payUrl: `${origin}/pay/${row.decision_token}`,
    enquiryId: row.enquiry_id || null,
    contact: {
      email: gsolEmailBrand.email || 'info@golfsolirl.com',
      irishPhone: gsolEmailBrand.phoneDisplay || '+353 86 851 5000',
      spanishPhone: gsolEmailBrand.spanishPhoneDisplay || '+34 641 81 53 66'
    }
  }
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {{ method?: string, body?: Record<string, unknown>, query?: Record<string, string> }} meta
 */
export const handleMonzoPay = async (env = process.env, meta = {}) => {
  const body = meta.body && typeof meta.body === 'object' ? meta.body : {}
  const query = meta.query && typeof meta.query === 'object' ? meta.query : {}
  const action = String(body.action || query.action || 'get').trim()
  const token = String(body.token || query.token || '').trim()
  if (!tokenOk(token)) throwStatus('Invalid pay link.', 400)

  const db = getDb(env)
  const row = await loadRow(db, token)
  const origin = getGsolSiteUrl().replace(/\/+$/, '')
  const amountLabel = fmtEur(row.amount_cents)

  if (action === 'get') {
    // Soft “opened” notice once (first get after send) — only if never reported and not paid
    if (!row.pay_details_emailed_at && !row.customer_reported_paid_at && row.status !== 'paid') {
      // no-op on get; opened notice is optional via action=opened
    }
    return publicPayload(env, row)
  }

  if (action === 'opened') {
    const adminUrl = row.enquiry_id
      ? `${origin}/admin/enquiries/${row.enquiry_id}`
      : `${origin}/admin/customers`
    const notice = buildAdminPayNotice({ event: 'opened', row, amountLabel, adminUrl })
    try {
      await sendHtmlMail(env, { to: adminNotifyEmail(env), subject: notice.subject, html: notice.html })
    } catch (err) {
      console.warn('[monzo-pay] opened notice', err instanceof Error ? err.message : err)
    }
    return { ok: true }
  }

  if (action === 'report_paid') {
    if (row.status === 'paid') {
      return { ok: true, status: 'paid', message: 'This payment is already marked paid. Thank you.' }
    }
    const now = new Date().toISOString()
    await db
      .from('desk_quotes')
      .update({ customer_reported_paid_at: now, updated_at: now })
      .eq('id', row.id)

    if (row.enquiry_id) {
      await db
        .from('enquiries')
        .update({
          payment_customer_reported_at: now,
          payment_status: 'awaiting_payment'
        })
        .eq('id', row.enquiry_id)
    }

    if (row.profile_id) {
      const { data: prof } = await db.from('profiles').select('activity_log').eq('id', row.profile_id).maybeSingle()
      const log = Array.isArray(prof?.activity_log) ? [...prof.activity_log] : []
      log.unshift({
        at: now,
        note: `Customer tapped I’ve paid on Monzo pay page (${row.reference_code})`
      })
      await db.from('profiles').update({ activity_log: log.slice(0, 200) }).eq('id', row.profile_id)
    }

    const adminUrl = row.enquiry_id
      ? `${origin}/admin/enquiries/${row.enquiry_id}`
      : `${origin}/admin/customers`
    const notice = buildAdminPayNotice({ event: 'reported', row, amountLabel, adminUrl })
    try {
      await sendHtmlMail(env, {
        to: adminNotifyEmail(env),
        subject: notice.subject,
        html: notice.html,
        replyTo: row.customer_email
      })
    } catch (err) {
      console.warn('[monzo-pay] reported notice', err instanceof Error ? err.message : err)
    }

    return {
      ok: true,
      status: 'customer_reported',
      message: 'Thanks — we have told the Golf Sol desk. They will confirm once the transfer shows with your reference.'
    }
  }

  if (action === 'email_details') {
    const settings = await loadSitePaymentForEmail(env)
    const pay = paymentBlockFromSettings(settings, {
      paymentReference: row.reference_code,
      amountDueEur: (Number(row.amount_cents) || 0) / 100
    })
    if (!pay) throwStatus('Monzo payment details are not configured yet. Ask the desk to set them in Admin → Payments.', 400)

    const payUrl = `${origin}/pay/${row.decision_token}`
    const meta = readPaymentRequestMeta(row.trip_details)
    const copy = meta
      ? paymentRequestCustomerCopy(meta, { amountCentsFallback: row.amount_cents })
      : paymentRequestCustomerCopy(
          {
            mode: 'full',
            tripTotalEur: (Number(row.amount_cents) || 0) / 100,
            depositEur: 0,
            amountNowEur: (Number(row.amount_cents) || 0) / 100,
            amountReceivedEur: 0,
            remainingAfterNowEur: 0
          },
          { amountCentsFallback: row.amount_cents }
        )
    const built = buildGsolCatalogEmail('payment-request', {
      payment: pay,
      item: row.title || 'Costa del Sol golf trip',
      payUrl,
      paymentRequestHeadline: copy.headline,
      amountNowLabel: copy.amountNowLabel
    })
    // Soften subject to “how to pay” when customer requested details themselves
    const first = (row.customer_name || '').split(/\s+/)[0] || 'there'
    const howHtml = finalizeGsolEmailHtml(
      buildLeanTransactionalEmailHtml({
        documentTitle: 'How to pay',
        preheader: `${copy.headline}: ${copy.amountNowLabel} · ref ${row.reference_code}`,
        kicker: `Payment details · ${row.reference_code}`,
        title: `Here’s how to pay, ${first}.`,
        lead: `${copy.leadExtra} Transfer from any Irish or EU bank to our Monzo account. Use reference ${row.reference_code} so we can match your payment. All payments are handled in Ireland.`,
        rows: [
          ['Item', row.title || 'Costa del Sol golf trip'],
          ...copy.rows,
          ['Reference', row.reference_code]
        ],
        payment: pay,
        cta: { href: payUrl, label: 'Open your pay page' },
        bodyHtml: `<p style="margin:16px 0 0;font-size:15px;line-height:24px;color:${lean.body};font-family:${leanFont};">Already paid? Tap “I’ve paid” on your pay page and we will confirm once it lands.</p>
          <p style="margin:24px 0 0;font-size:16px;line-height:24px;color:${lean.body};font-family:${leanFont};">Talk soon,<br><b>Golf Sol Ireland</b></p>`,
        footerHtml: `You asked for these payment details on your pay page (ref ${escapeHtml(row.reference_code)}).`
      })
    )
    await sendHtmlMail(env, {
      to: row.customer_email,
      subject: `Golf Sol Ireland — how to pay (${row.reference_code})`,
      html: howHtml
    })

    const now = new Date().toISOString()
    await db.from('desk_quotes').update({ pay_details_emailed_at: now, updated_at: now }).eq('id', row.id)

    const adminUrl = row.enquiry_id
      ? `${origin}/admin/enquiries/${row.enquiry_id}`
      : `${origin}/admin/customers`
    const notice = buildAdminPayNotice({ event: 'emailed', row, amountLabel, adminUrl })
    try {
      await sendHtmlMail(env, { to: adminNotifyEmail(env), subject: notice.subject, html: notice.html })
    } catch (err) {
      console.warn('[monzo-pay] emailed notice', err instanceof Error ? err.message : err)
    }

    return {
      ok: true,
      message: `We emailed the Monzo payment details to ${row.customer_email}.`,
      catalogFallbackSubject: built.subject
    }
  }

  throwStatus('Unknown pay action.', 400)
}

/** Build absolute Monzo pay URL for a desk quote row. */
export const monzoPayUrlForRow = (_env, row) => {
  const origin = getGsolSiteUrl().replace(/\/+$/, '')
  return `${origin}/pay/${row.decision_token}`
}
