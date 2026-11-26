/**
 * Admin: preview / send branded upsell email for airport & hotel transfers on an enquiry.
 */
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { buildAdminBrandedMailHtml, brandedMailPlainText } from './admin-mail-html.mjs'
import { gsolEmailBrand } from './email-constants.mjs'
import { getGsolSiteUrl } from './email-layout.mjs'
import {
  defaultTransferUpsellBodyPlain,
  defaultTransferUpsellSubject,
  enquiryTransferUpsellFirstName
} from '../shared/enquiry-transfer-upsell-copy.mjs'
import { resolveResendToAddress, resendSandboxRecipientHint } from './resend-delivery-email.mjs'

export const TRANSFER_UPSELL_EMAIL_SENT_AT_KEY = '_transferUpsellEmailSentAt'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

const getAdmin = (env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throwStatus('Supabase is not configured on the server.', 500)
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const parseFormPayload = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { form: 'unknown', fields: {} }
  }
  const o = raw
  const form = typeof o.form === 'string' ? o.form.trim() : 'unknown'
  const fieldsRaw = o.fields
  const fields =
    fieldsRaw && typeof fieldsRaw === 'object' && !Array.isArray(fieldsRaw)
      ? Object.fromEntries(
          Object.entries(fieldsRaw).map(([k, v]) => [
            k,
            typeof v === 'string' ? v : v === true ? 'yes' : v === false ? 'no' : String(v ?? '')
          ])
        )
      : {}
  return { form, fields }
}

const bodyBlocksFromPlain = (plain) => {
  const chunks = String(plain ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  const hello = chunks[0]?.match(/^(hello|hi)\b/i) ? chunks.shift() : ''
  const closing =
    chunks.length >= 2 && /golf sol ireland/i.test(chunks[chunks.length - 1] ?? '')
      ? chunks.pop()
      : chunks.length >= 1 && /^best regards/i.test(chunks[chunks.length - 1] ?? '')
        ? `${chunks.pop()}\n\nGolf Sol Ireland`
        : 'Best regards,\n\nGolf Sol Ireland'
  return {
    introduction: hello,
    body: chunks.join('\n\n'),
    closing
  }
}

/**
 * @param {{ fullName: string; referenceId: string; subject?: string; bodyPlain?: string }} input
 */
export const buildTransferUpsellMail = (input) => {
  const portalUrl = `${getGsolSiteUrl()}/portal`
  const first = enquiryTransferUpsellFirstName(input.fullName)
  const subject =
    typeof input.subject === 'string' && input.subject.trim()
      ? input.subject.trim().slice(0, 180)
      : defaultTransferUpsellSubject(input.referenceId)
  const bodyPlain =
    typeof input.bodyPlain === 'string' && input.bodyPlain.trim()
      ? input.bodyPlain.trim().slice(0, 8000)
      : defaultTransferUpsellBodyPlain({
          first,
          referenceId: input.referenceId,
          portalUrl
        })

  const blocks = bodyBlocksFromPlain(bodyPlain)
  const vars = {
    customerName: input.fullName,
    referenceId: input.referenceId,
    portalUrl
  }

  const html = buildAdminBrandedMailHtml({
    heading: 'Airport & hotel transfers',
    introduction: blocks.introduction,
    body: blocks.body,
    closing: blocks.closing,
    ctaLabel: 'Open your trip desk',
    ctaUrl: portalUrl,
    customerName: input.fullName,
    vars
  })
  const plainText = brandedMailPlainText({
    heading: 'Airport & hotel transfers',
    introduction: blocks.introduction,
    body: blocks.body,
    closing: blocks.closing,
    ctaLabel: 'Open your trip desk',
    ctaUrl: portalUrl,
    vars
  })

  return { subject, html, plainText, bodyPlain }
}

const emailSendDisabled = (env) => {
  const raw = String(env.EMAIL_SEND_ENABLED ?? '').trim().toLowerCase()
  return raw === '0' || raw === 'false' || raw === 'no'
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string; cookieHeader?: string }} meta
 */
export const handleEnquiryTransferUpsellEmail = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env, { cookieHeader: meta.cookieHeader })
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const action = typeof body?.action === 'string' ? body.action.trim().toLowerCase() : 'preview'
  const enquiryId = typeof body?.enquiryId === 'string' ? body.enquiryId.trim() : ''
  if (!enquiryId) {
    throwStatus('enquiryId is required.', 400)
  }

  const admin = getAdmin(env)
  const { data: enquiry, error } = await admin
    .from('enquiries')
    .select('id, reference_id, email, full_name, phone_whatsapp, payment_notes, form_payload')
    .eq('id', enquiryId)
    .maybeSingle()
  if (error) {
    throwStatus(error.message, 500)
  }
  if (!enquiry?.email?.trim()) {
    throwStatus('Enquiry not found or has no email.', 404)
  }

  const subjectIn = typeof body?.subject === 'string' ? body.subject : undefined
  const bodyPlainIn = typeof body?.bodyPlain === 'string' ? body.bodyPlain : undefined
  const built = buildTransferUpsellMail({
    fullName: enquiry.full_name ?? '',
    referenceId: enquiry.reference_id ?? '',
    subject: subjectIn,
    bodyPlain: bodyPlainIn
  })

  const payload = parseFormPayload(enquiry.form_payload)
  const sentAtExisting = payload.fields[TRANSFER_UPSELL_EMAIL_SENT_AT_KEY] ?? null

  if (action === 'preview') {
    return {
      ok: true,
      action: 'preview',
      subject: built.subject,
      bodyPlain: built.bodyPlain,
      html: built.html,
      plainText: built.plainText,
      sentAt: sentAtExisting,
      to: enquiry.email.trim()
    }
  }

  if (action !== 'send') {
    throwStatus('Unknown action.', 400)
  }

  if (emailSendDisabled(env)) {
    throwStatus(
      'Email sending is disabled. Set EMAIL_SEND_ENABLED=true on the server when you are ready to send real mail.',
      503
    )
  }

  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !fromEmail) {
    throwStatus('Email is not configured on the server.', 500)
  }

  const to = enquiry.email.trim().toLowerCase()
  const deliverTo = resolveResendToAddress(to, env)
  const resend = new Resend(resendKey)
  const { error: sendError } = await resend.emails.send({
    from: `${gsolEmailBrand.fromName} <${fromEmail}>`,
    to: deliverTo,
    subject: built.subject,
    html: built.html,
  text: built.plainText,
    replyTo: fromEmail
  })
  if (sendError) {
    const hint = resendSandboxRecipientHint(fromEmail, deliverTo)
    throwStatus(sendError.message + (hint ? ` ${hint}` : ''), 502)
  }

  const sentAt = new Date().toISOString()
  const nextFields = {
    ...payload.fields,
    [TRANSFER_UPSELL_EMAIL_SENT_AT_KEY]: sentAt
  }
  const nextPayload = {
    form: payload.form || 'admin_transfer_upsell',
    fields: nextFields
  }
  const noteLine = `Transfer upsell email sent ${sentAt.slice(0, 19).replace('T', ' ')} UTC`
  const prevNotes = typeof enquiry.payment_notes === 'string' ? enquiry.payment_notes.trim() : ''
  const paymentNotes = prevNotes ? `${prevNotes}\n${noteLine}` : noteLine

  const { error: uErr } = await admin
    .from('enquiries')
    .update({
      form_payload: nextPayload,
      payment_notes: paymentNotes
    })
    .eq('id', enquiryId)
  if (uErr) {
    console.error('[enquiry-transfer-upsell-email] log update failed', uErr.message)
    throwStatus('Email was sent but logging failed. Refresh and check the enquiry.', 500)
  }

  return {
    ok: true,
    action: 'send',
    sentAt,
    subject: built.subject,
    to: deliverTo
  }
}