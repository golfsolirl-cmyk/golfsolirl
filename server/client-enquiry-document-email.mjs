/**
 * Email a generated client document (PDF and/or Word) using existing Resend + branded shell.
 */
import { Resend } from 'resend'
import { escapeHtml } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml } from './email-layout.mjs'
import { buildClientEnquiryDocumentDocx } from './client-enquiry-document-docx.mjs'
import { buildClientEnquiryDocumentPdf } from './client-enquiry-document-pdf.mjs'
import {
  getAdmin,
  markClientDocumentSent,
  normalizeClientDocumentDraft,
  requireClientDocumentAdmin,
  throwStatus
} from './client-enquiry-document-service.mjs'
import { documentTypeLabel } from '../shared/client-enquiry-document.mjs'
import { resolveResendToAddress } from './resend-delivery-email.mjs'

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleClientEnquiryDocumentEmail = async (body, env = process.env, meta = {}) => {
  await requireClientDocumentAdmin(meta, env)

  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !fromEmail) {
    throwStatus('Email is not configured on the server.', 500)
  }

  const draft = normalizeClientDocumentDraft(body?.draft ?? body)
  const to = typeof body?.to === 'string' && body.to.trim() ? body.to.trim() : draft.customer.email
  if (!to || !to.includes('@')) {
    throwStatus('Enter a valid customer email address.', 400)
  }

  const attach = typeof body?.attach === 'string' ? body.attach.trim().toLowerCase() : 'pdf'
  const subject =
    typeof body?.subject === 'string' && body.subject.trim()
      ? body.subject.trim().slice(0, 180)
      : `${documentTypeLabel(draft.documentType, draft.customTitle)} — ${draft.reference}`
  const message =
    typeof body?.message === 'string' && body.message.trim()
      ? body.message.trim().slice(0, 4000)
      : `Please find your ${documentTypeLabel(draft.documentType, draft.customTitle).toLowerCase()} attached.`

  const attachments = []
  try {
    if (attach === 'pdf' || attach === 'both') {
      const pdf = await buildClientEnquiryDocumentPdf(draft)
      attachments.push({
        filename: pdf.filename,
        content: Buffer.from(pdf.bytes).toString('base64'),
        contentType: 'application/pdf'
      })
    }
    if (attach === 'word' || attach === 'docx' || attach === 'both') {
      const docx = await buildClientEnquiryDocumentDocx(draft)
      attachments.push({
        filename: docx.filename,
        content: Buffer.from(docx.bytes).toString('base64'),
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
    }
  } catch (error) {
    console.error('[client-enquiry-document-email] generate failed', error)
    throwStatus('Unable to generate the attachment. Please try again.', 500)
  }

  if (attachments.length === 0) {
    throwStatus('Choose PDF, Word, or both.', 400)
  }

  const greeting = draft.customer.name ? `Hello ${escapeHtml(draft.customer.name.split(' ')[0])},` : 'Hello,'
  const bodyHtml = `
    <p style="margin:0 0 14px 0;">${greeting}</p>
    <p style="margin:0 0 14px 0;white-space:pre-wrap;">${escapeHtml(message)}</p>
    <p style="margin:0 0 14px 0;">Reference: <strong>${escapeHtml(draft.reference)}</strong></p>
    <p style="margin:0;">Golf Sol Ireland · info@golfsolirl.com · +353 87 446 4766</p>
  `

  const rawHtml = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: `${documentTypeLabel(draft.documentType, draft.customTitle)} ${draft.reference}`,
    heroKicker: 'Golf Sol Ireland',
    heroTitle: escapeHtml(documentTypeLabel(draft.documentType, draft.customTitle)),
    heroLead: escapeHtml(`Reference ${draft.reference}`),
    heroMetaHtml: '',
    bodyHtml
  })
  const html = finalizeGsolEmailHtml(rawHtml)
  const deliverTo = resolveResendToAddress(to, env)

  const resend = new Resend(resendKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: deliverTo,
    subject,
    html,
    attachments
  })

  if (sendError) {
    console.error('[client-enquiry-document-email] resend failed', sendError)
    throwStatus('Unable to send the email. Please try again.', 502)
  }

  let saved = draft
  try {
    const admin = getAdmin(env)
    saved = await markClientDocumentSent(admin, draft)
  } catch (error) {
    console.error('[client-enquiry-document-email] mark sent failed', error)
  }

  return {
    ok: true,
    message: `Sent to ${deliverTo}.`,
    draft: saved
  }
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleClientEnquiryDocumentPdf = async (body, env = process.env, meta = {}) => {
  await requireClientDocumentAdmin(meta, env)
  try {
    const draft = normalizeClientDocumentDraft(body?.draft ?? body)
    return await buildClientEnquiryDocumentPdf(draft)
  } catch (error) {
    if (error?.statusCode) throw error
    console.error('[client-enquiry-document-pdf] generate failed', error)
    throwStatus('Unable to generate the PDF. Please try again.', 500)
  }
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleClientEnquiryDocumentDocx = async (body, env = process.env, meta = {}) => {
  await requireClientDocumentAdmin(meta, env)
  try {
    const draft = normalizeClientDocumentDraft(body?.draft ?? body)
    return await buildClientEnquiryDocumentDocx(draft)
  } catch (error) {
    if (error?.statusCode) throw error
    console.error('[client-enquiry-document-docx] generate failed', error)
    throwStatus('Unable to generate the Word document. Please try again.', 500)
  }
}
