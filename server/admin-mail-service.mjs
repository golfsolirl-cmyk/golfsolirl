/**
 * Admin mail desk: Gmail inbox/threads, branded Resend send, Gmail threaded replies,
 * PDF attach/generate, sent history. All routes require admin Bearer auth except OAuth callback.
 */
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { gsolEmailBrand } from './email-constants.mjs'
import { resolveResendToAddress } from './resend-delivery-email.mjs'
import {
  disconnectGmail,
  getValidGmailAccessToken,
  handleGmailOauthStart,
  loadGmailAccount,
  publicGmailStatus
} from './gmail-oauth-service.mjs'
import {
  downloadGmailAttachment,
  getGmailThread,
  listGmailThreads,
  parseFromHeader,
  sendGmailThreadedReply
} from './gmail-api-service.mjs'
import { buildAdminBrandedMailHtml, brandedMailPlainText } from './admin-mail-html.mjs'
import { buildClientEnquiryDocumentPdf } from './client-enquiry-document-pdf.mjs'
import {
  defaultClientDocumentDraft,
  formatClientDocumentLongDate,
  readEnquiryFormFields
} from '../shared/client-enquiry-document.mjs'
import {
  ADMIN_MAIL_TEMPLATES,
  ADMIN_MAIL_VARIABLES,
  applyMailTemplateVars,
  defaultMailTemplateVars,
  firstNameFromFullName,
  getMailTemplateById,
  mergeMailTemplate
} from '../shared/admin-mail-templates.mjs'

export const MAX_MAIL_ATTACHMENTS = 3
export const MAX_MAIL_ATTACHMENT_BYTES = 2.5 * 1024 * 1024

const throwStatus = (message, statusCode, code) => {
  const err = new Error(message)
  err.statusCode = statusCode
  if (code) err.code = code
  throw err
}

const isEmailSendEnabled = (env) => String(env.EMAIL_SEND_ENABLED ?? '').trim().toLowerCase() === 'true'

const requireSendEnabled = (env) => {
  if (!isEmailSendEnabled(env)) {
    throwStatus(
      'Email sending is disabled. Set EMAIL_SEND_ENABLED=true on the server when you are ready to send real mail.',
      403,
      'EMAIL_SEND_DISABLED'
    )
  }
}

const getAdminDb = (env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throwStatus('Supabase is not configured on the server.', 500)
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const requireAdmin = async (meta, env) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }
  return auth.user
}

const isMissingTable = (error, table) => {
  const code = error?.code
  const msg = String(error?.message ?? '')
  return code === '42P01' || (table && msg.toLowerCase().includes(table))
}

const activityTableMissing =
  'Email history is not installed yet. Run supabase/run-in-sql-editor-admin-mail.sql in the Supabase SQL editor, then try again.'

const optionalUuid = (value) => {
  const s = typeof value === 'string' ? value.trim() : ''
  return /^[0-9a-f-]{36}$/i.test(s) ? s : null
}

const validEmail = (value) => {
  const s = String(value ?? '').trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : ''
}

const splitAddresses = (raw) =>
  String(raw ?? '')
    .split(/[,;]/)
    .map((part) => validEmail(part))
    .filter(Boolean)

const fromAddress = (env) => {
  const configured = env.RESEND_FROM_EMAIL?.trim()
  if (configured) return configured
  return `Golf Sol Ireland <${gsolEmailBrand.email}>`
}

const replyToAddress = (env) => env.EMAIL_REPLY_TO?.trim() || ''

const assertPdfBuffer = (buf, filename) => {
  if (!Buffer.isBuffer(buf) && !(buf instanceof Uint8Array)) {
    throwStatus(`Attachment "${filename}" is not a valid PDF.`, 400)
  }
  const bytes = Buffer.from(buf)
  if (bytes.length < 5 || bytes.subarray(0, 5).toString('utf8') !== '%PDF-') {
    throwStatus(`"${filename}" is not a valid PDF.`, 400)
  }
  if (bytes.length > MAX_MAIL_ATTACHMENT_BYTES) {
    throwStatus(`The PDF exceeds the maximum attachment size (${Math.round(MAX_MAIL_ATTACHMENT_BYTES / (1024 * 1024) * 10) / 10} MB).`, 400)
  }
  return bytes
}

const parseAttachments = (raw) => {
  const list = Array.isArray(raw) ? raw : []
  if (list.length > MAX_MAIL_ATTACHMENTS) {
    throwStatus(`At most ${MAX_MAIL_ATTACHMENTS} PDF attachments are allowed.`, 400)
  }
  const out = []
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue
    const filename = typeof entry.filename === 'string' ? entry.filename.trim() : ''
    const b64 = typeof entry.contentBase64 === 'string' ? entry.contentBase64.trim() : ''
    if (!filename || !b64) {
      throwStatus('Each attachment needs a filename and file data.', 400)
    }
    if (!filename.toLowerCase().endsWith('.pdf')) {
      throwStatus('Only PDF attachments are allowed.', 400)
    }
    let buf
    try {
      buf = Buffer.from(b64, 'base64')
    } catch {
      throwStatus(`Attachment "${filename}" could not be read.`, 400)
    }
    out.push({
      filename: filename.replace(/[^\w.\- ()]/g, '_').slice(0, 120),
      bytes: assertPdfBuffer(buf, filename),
      contentType: 'application/pdf'
    })
  }
  return out
}

const enquiryVarsFromRow = (row) => {
  const fields = readEnquiryFormFields(row?.form_payload)
  const name = String(row?.full_name ?? '').trim()
  const start = fields._travelDateFrom || fields['Travel start date'] || ''
  const end = fields._travelDateTo || fields['Travel end date'] || ''
  const from = formatClientDocumentLongDate(start) || start
  const to = formatClientDocumentLongDate(end) || end
  const travelDates = from && to ? `${from} – ${to}` : from || to
  return {
    ...defaultMailTemplateVars(),
    customerName: name,
    firstName: firstNameFromFullName(name),
    email: String(row?.email ?? '').trim(),
    phone: String(row?.phone_whatsapp ?? '').trim(),
    reference: String(row?.reference_id ?? '').trim(),
    interest: String(row?.interest ?? '').trim(),
    travelDates,
    numberOfGuests: String(fields._pax || fields['Group size'] || fields.Passengers || fields['Party size'] || '').trim()
  }
}

const publicEnquiry = (row) => {
  if (!row) return null
  const vars = enquiryVarsFromRow(row)
  return {
    id: row.id,
    reference: row.reference_id,
    name: row.full_name,
    email: row.email,
    phone: row.phone_whatsapp || '',
    interest: row.interest || '',
    createdAt: row.created_at,
    travelDates: vars.travelDates,
    numberOfGuests: vars.numberOfGuests
  }
}

const matchEnquiriesByEmail = async (db, email) => {
  const address = String(email ?? '').trim().toLowerCase()
  if (!address || !address.includes('@')) return []
  const { data, error } = await db
    .from('enquiries')
    .select('id, reference_id, email, full_name, phone_whatsapp, interest, created_at, form_payload')
    .ilike('email', address)
    .order('created_at', { ascending: false })
    .limit(5)
  if (error) {
    console.error('[admin-mail] enquiry match failed', error.message)
    return []
  }
  return Array.isArray(data) ? data : []
}

const loadTemplateOverride = async (db, templateId) => {
  const { data, error } = await db
    .from('email_template_overrides')
    .select('template_id, heading, introduction, body, cta_label, cta_url, closing')
    .eq('template_id', templateId)
    .maybeSingle()
  if (error) {
    if (isMissingTable(error, 'email_template_overrides')) return null
    return null
  }
  if (!data) return null
  return {
    heading: data.heading,
    introduction: data.introduction,
    body: data.body,
    ctaLabel: data.cta_label,
    ctaUrl: data.cta_url,
    closing: data.closing
  }
}

const composeContent = async (db, body) => {
  const templateId = typeof body?.templateId === 'string' ? body.templateId.trim() : 'general_reply'
  const override = await loadTemplateOverride(db, templateId)
  const merged = mergeMailTemplate(templateId, {
    ...(override || {}),
    heading: typeof body?.heading === 'string' ? body.heading : override?.heading,
    introduction: typeof body?.introduction === 'string' ? body.introduction : override?.introduction,
    body: typeof body?.body === 'string' ? body.body : override?.body,
    ctaLabel: typeof body?.ctaLabel === 'string' ? body.ctaLabel : override?.ctaLabel,
    ctaUrl: typeof body?.ctaUrl === 'string' ? body.ctaUrl : override?.ctaUrl,
    closing: typeof body?.closing === 'string' ? body.closing : override?.closing,
    subject: typeof body?.subject === 'string' ? body.subject : ''
  })
  const vars = { ...defaultMailTemplateVars(), ...(body?.vars && typeof body.vars === 'object' ? body.vars : {}) }
  if (typeof body?.customerName === 'string' && body.customerName.trim()) {
    vars.customerName = body.customerName.trim()
    vars.firstName = vars.firstName || firstNameFromFullName(vars.customerName)
  }
  if (typeof body?.to === 'string' && body.to.trim()) {
    vars.email = vars.email || body.to.trim()
  }
  return { merged, vars, templateId: merged.id }
}

const requireGmailAccount = async (userId, env) => {
  const account = await loadGmailAccount(userId, env)
  if (!account) {
    throwStatus('Gmail is not connected. Connect Gmail first.', 400, 'GMAIL_RECONNECT')
  }
  const accessToken = await getValidGmailAccessToken(account, env)
  return { account, accessToken }
}

const insertActivity = async (db, row) => {
  const { data, error } = await db.from('email_activity').insert(row).select('id, status, sent_at, provider, to_email, subject, template_id, attachment_names').maybeSingle()
  if (error) {
    if (isMissingTable(error, 'email_activity')) {
      throwStatus(activityTableMissing, 500)
    }
    if (error.code === '23505') {
      const { data: existing } = await db
        .from('email_activity')
        .select('id, status, sent_at, provider, to_email, subject, template_id, attachment_names, provider_message_id')
        .eq('idempotency_key', row.idempotency_key)
        .maybeSingle()
      if (existing) {
        return { ...existing, duplicate: true }
      }
    }
    throwStatus('Unable to record the email.', 500)
  }
  return data
}

const updateActivity = async (db, id, patch) => {
  await db.from('email_activity').update(patch).eq('id', id)
}

const handleStatus = async (user, env) => {
  const account = await loadGmailAccount(user.id, env).catch((error) => {
    if (error?.statusCode === 500 && /not installed/i.test(error.message)) {
      throw error
    }
    return null
  })
  return {
    ok: true,
    gmail: publicGmailStatus(account, env),
    from: fromAddress(env),
    replyTo: replyToAddress(env),
    sendEnabled: isEmailSendEnabled(env),
    resendConfigured: Boolean(env.RESEND_API_KEY?.trim() && env.RESEND_FROM_EMAIL?.trim()),
    maxAttachments: MAX_MAIL_ATTACHMENTS,
    maxAttachmentBytes: MAX_MAIL_ATTACHMENT_BYTES,
    templates: ADMIN_MAIL_TEMPLATES.map((t) => ({ id: t.id, label: t.label, blurb: t.blurb })),
    variables: ADMIN_MAIL_VARIABLES
  }
}

const handleInbox = async (user, body, env) => {
  const { accessToken } = await requireGmailAccount(user.id, env)
  const unreadOnly = Boolean(body?.unreadOnly)
  const folder = typeof body?.folder === 'string' ? body.folder.trim() : 'inbox'
  const search = typeof body?.q === 'string' ? body.q.trim() : ''
  const parts = []
  if (folder === 'sent') parts.push('in:sent')
  else parts.push('in:inbox')
  if (unreadOnly) parts.push('is:unread')
  if (search) parts.push(search)
  const listed = await listGmailThreads(accessToken, { query: parts.join(' '), max: 25 })
  return { ok: true, ...listed }
}

const handleThread = async (user, body, env) => {
  const { accessToken } = await requireGmailAccount(user.id, env)
  const threadId = typeof body?.threadId === 'string' ? body.threadId.trim() : ''
  const allowImages = Boolean(body?.allowImages)
  const thread = await getGmailThread(accessToken, threadId, { allowImages })
  const lastFrom = thread.messages[thread.messages.length - 1]
  const sender = lastFrom?.fromEmail || ''
  const db = getAdminDb(env)
  const matches = await matchEnquiriesByEmail(db, sender)
  return {
    ok: true,
    thread,
    linkedEnquiries: matches.map(publicEnquiry),
    linkedEnquiry: matches[0] ? publicEnquiry(matches[0]) : null
  }
}

const handleGmailAttachment = async (user, body, env) => {
  const { accessToken } = await requireGmailAccount(user.id, env)
  const messageId = typeof body?.messageId === 'string' ? body.messageId.trim() : ''
  const attachmentId = typeof body?.attachmentId === 'string' ? body.attachmentId.trim() : ''
  const filename = typeof body?.filename === 'string' ? body.filename.trim() : 'attachment.bin'
  const bytes = await downloadGmailAttachment(accessToken, messageId, attachmentId)
  return {
    ok: true,
    filename,
    contentType: filename.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
    contentBase64: bytes.toString('base64'),
    size: bytes.length
  }
}

const handlePreview = async (user, body, env) => {
  const db = getAdminDb(env)
  const { merged, vars } = await composeContent(db, body)
  const html = buildAdminBrandedMailHtml({
    heading: merged.heading,
    introduction: merged.introduction,
    body: merged.body,
    closing: merged.closing,
    ctaLabel: merged.ctaLabel,
    ctaUrl: merged.ctaUrl,
    customerName: vars.customerName,
    vars
  })
  const subject = applyMailTemplateVars(typeof body?.subject === 'string' && body.subject.trim() ? body.subject : merged.subject, vars)
  return {
    ok: true,
    subject,
    html,
    text: brandedMailPlainText({ ...merged, vars }),
    from: fromAddress(env),
    sendEnabled: isEmailSendEnabled(env)
  }
}

const handleGeneratePdf = async (user, body, env) => {
  const name = typeof body?.customerName === 'string' ? body.customerName.trim() : ''
  const email = typeof body?.to === 'string' ? body.to.trim() : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : typeof body?.body === 'string' ? body.body.trim() : ''
  const reference = typeof body?.reference === 'string' ? body.reference.trim() : ''
  const documentType = body?.documentType === 'quotation' ? 'quotation' : 'enquiry_response'
  const draft = defaultClientDocumentDraft({
    documentType,
    enquiryId: typeof body?.enquiryId === 'string' ? body.enquiryId : null,
    enquiryReference: reference,
    reference: reference || undefined,
    subject: typeof body?.subject === 'string' ? body.subject : '',
    customer: {
      name,
      email,
      phone: typeof body?.phone === 'string' ? body.phone : ''
    },
    message: message || 'Please see the attached Golf Sol Ireland document.',
    sections: {
      enquiry: Boolean(body?.enquirySummary),
      message: true,
      pricing: documentType === 'quotation',
      notes: false,
      terms: true,
      payment: documentType === 'quotation',
      signature: documentType === 'quotation'
    },
    enquirySummary: typeof body?.enquirySummary === 'string' ? body.enquirySummary : ''
  })
  const file = await buildClientEnquiryDocumentPdf(draft)
  const bytes = Buffer.from(file.bytes)
  assertPdfBuffer(bytes, file.filename)
  return {
    ok: true,
    filename: file.filename,
    contentBase64: bytes.toString('base64'),
    size: bytes.length,
    contentType: 'application/pdf'
  }
}

const handleSendBranded = async (user, body, env) => {
  requireSendEnabled(env)
  const resendKey = env.RESEND_API_KEY?.trim()
  if (!resendKey) {
    throwStatus('Resend is not configured. Set RESEND_API_KEY.', 500)
  }
  const to = validEmail(body?.to)
  if (!to) {
    throwStatus('Enter a valid recipient email address.', 400)
  }
  const subjectRaw = typeof body?.subject === 'string' ? body.subject.trim() : ''
  if (!subjectRaw) {
    throwStatus('Subject is required.', 400)
  }
  const attachments = parseAttachments(body?.attachments)
  const db = getAdminDb(env)
  const { merged, vars, templateId } = await composeContent(db, body)
  const subject = applyMailTemplateVars(subjectRaw, vars)
  const html = buildAdminBrandedMailHtml({
    heading: merged.heading,
    introduction: merged.introduction,
    body: merged.body,
    closing: merged.closing,
    ctaLabel: merged.ctaLabel,
    ctaUrl: merged.ctaUrl,
    customerName: vars.customerName,
    vars
  })
  const text = brandedMailPlainText({ ...merged, vars })
  const from = fromAddress(env)
  const cc = splitAddresses(body?.cc)
  const bcc = splitAddresses(body?.bcc)
  const idempotencyKey =
    typeof body?.idempotencyKey === 'string' && body.idempotencyKey.trim()
      ? body.idempotencyKey.trim().slice(0, 80)
      : undefined

  const activity = await insertActivity(db, {
    created_by: user.id,
    enquiry_id: optionalUuid(body?.enquiryId),
    gmail_thread_id: typeof body?.gmailThreadId === 'string' ? body.gmailThreadId : null,
    provider: 'resend',
    to_email: to,
    cc_email: cc.join(', '),
    bcc_email: bcc.join(', '),
    from_email: from,
    subject,
    template_id: templateId,
    status: 'sending',
    attachment_names: attachments.map((a) => a.filename),
    idempotency_key: idempotencyKey || null
  })
  if (activity?.duplicate && activity.status === 'sent') {
    return { ok: true, duplicate: true, activity }
  }

  const deliverTo = resolveResendToAddress(to, env)
  const payload = {
    from,
    to: deliverTo,
    subject,
    html,
    text,
    attachments: attachments.map((a) => ({
      filename: a.filename,
      content: a.bytes.toString('base64')
    }))
  }
  if (cc.length) payload.cc = cc
  if (bcc.length) payload.bcc = bcc
  const replyTo = replyToAddress(env)
  if (replyTo) payload.replyTo = replyTo

  const resend = new Resend(resendKey)
  const { data, error } = await resend.emails.send(payload)
  if (error) {
    console.error('[admin-mail] resend failed', error)
    if (activity?.id) {
      await updateActivity(db, activity.id, { status: 'failed', error_message: 'provider_rejected' })
    }
    throwStatus('The email could not be sent. No message was delivered.', 502)
  }

  const sentAt = new Date().toISOString()
  if (activity?.id) {
    await updateActivity(db, activity.id, {
      status: 'sent',
      provider_message_id: data?.id || null,
      sent_at: sentAt,
      error_message: null
    })
  }

  return {
    ok: true,
    provider: 'resend',
    to: deliverTo,
    subject,
    attachments: attachments.map((a) => a.filename),
    sentAt,
    activityId: activity?.id || null,
    templateId
  }
}

const handleGmailReply = async (user, body, env) => {
  requireSendEnabled(env)
  const to = validEmail(body?.to)
  if (!to) {
    throwStatus('Enter a valid recipient email address.', 400)
  }
  const threadId = typeof body?.threadId === 'string' ? body.threadId.trim() : ''
  const inReplyTo = typeof body?.inReplyTo === 'string' ? body.inReplyTo.trim() : ''
  if (!threadId || !inReplyTo) {
    throwStatus('Gmail threading requires the original conversation. Open the thread and use Reply via Gmail.', 400)
  }
  const subjectRaw = typeof body?.subject === 'string' ? body.subject.trim() : ''
  if (!subjectRaw) {
    throwStatus('Subject is required.', 400)
  }
  const attachments = parseAttachments(body?.attachments)
  const { account, accessToken } = await requireGmailAccount(user.id, env)
  const db = getAdminDb(env)
  const { merged, vars, templateId } = await composeContent(db, body)
  const useBranded = body?.branded !== false
  const html = useBranded
    ? buildAdminBrandedMailHtml({
        heading: merged.heading,
        introduction: merged.introduction,
        body: merged.body,
        closing: merged.closing,
        ctaLabel: merged.ctaLabel,
        ctaUrl: merged.ctaUrl,
        customerName: vars.customerName,
        vars
      })
    : `<div>${String(body?.body || '')
        .split('\n')
        .map((line) => line.replace(/&/g, '&amp;').replace(/</g, '&lt;'))
        .join('<br/>')}</div>`
  const text = useBranded
    ? brandedMailPlainText({ ...merged, vars })
    : String(body?.body || '')
  const subject = applyMailTemplateVars(subjectRaw, vars)
  const from = account.email_address || fromAddress(env)
  const references = [typeof body?.references === 'string' ? body.references.trim() : '', inReplyTo]
    .filter(Boolean)
    .join(' ')
  const idempotencyKey =
    typeof body?.idempotencyKey === 'string' && body.idempotencyKey.trim()
      ? body.idempotencyKey.trim().slice(0, 80)
      : undefined

  const activity = await insertActivity(db, {
    created_by: user.id,
    enquiry_id: optionalUuid(body?.enquiryId),
    gmail_thread_id: threadId,
    provider: 'gmail',
    to_email: to,
    cc_email: splitAddresses(body?.cc).join(', '),
    bcc_email: splitAddresses(body?.bcc).join(', '),
    from_email: from,
    subject,
    template_id: templateId,
    status: 'sending',
    attachment_names: attachments.map((a) => a.filename),
    idempotency_key: idempotencyKey || null
  })
  if (activity?.duplicate && activity.status === 'sent') {
    return { ok: true, duplicate: true, activity }
  }

  try {
    const sent = await sendGmailThreadedReply(accessToken, {
      from,
      to,
      cc: splitAddresses(body?.cc).join(', '),
      bcc: splitAddresses(body?.bcc).join(', '),
      subject,
      html,
      text,
      threadId,
      inReplyTo,
      references,
      attachments
    })
    const sentAt = new Date().toISOString()
    if (activity?.id) {
      await updateActivity(db, activity.id, {
        status: 'sent',
        provider_message_id: sent.id || null,
        gmail_message_id: sent.id || null,
        gmail_thread_id: sent.threadId || threadId,
        sent_at: sentAt,
        error_message: null
      })
    }
    return {
      ok: true,
      provider: 'gmail',
      to,
      subject,
      attachments: attachments.map((a) => a.filename),
      sentAt,
      activityId: activity?.id || null,
      threadId: sent.threadId || threadId,
      templateId
    }
  } catch (error) {
    if (activity?.id) {
      await updateActivity(db, activity.id, { status: 'failed', error_message: 'provider_rejected' })
    }
    throw error
  }
}

const handleSentList = async (user, body, env) => {
  const db = getAdminDb(env)
  const { data, error } = await db
    .from('email_activity')
    .select(
      'id, created_by, enquiry_id, gmail_thread_id, provider, provider_message_id, to_email, from_email, subject, template_id, status, attachment_names, sent_at, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(80)
  if (error) {
    if (isMissingTable(error, 'email_activity')) {
      throwStatus(activityTableMissing, 500)
    }
    throwStatus('Unable to load sent email.', 500)
  }
  return { ok: true, rows: data ?? [] }
}

const handleSaveDraft = async (user, body, env) => {
  const db = getAdminDb(env)
  const to = typeof body?.to === 'string' ? body.to.trim() : ''
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : ''
  const { templateId } = await composeContent(db, body)
  const row = await insertActivity(db, {
    created_by: user.id,
    enquiry_id: optionalUuid(body?.enquiryId),
    gmail_thread_id: typeof body?.threadId === 'string' ? body.threadId : null,
    provider: body?.provider === 'gmail' ? 'gmail' : 'resend',
    to_email: to,
    from_email: fromAddress(env),
    subject,
    template_id: templateId,
    status: 'draft',
    attachment_names: Array.isArray(body?.attachmentNames) ? body.attachmentNames.slice(0, 8) : []
  })
  return { ok: true, draftId: row?.id || null }
}

const handleListTemplates = async (user, env) => {
  const db = getAdminDb(env)
  const { data } = await db.from('email_template_overrides').select('template_id, heading, introduction, body, cta_label, cta_url, closing, updated_at')
  const overrides = new Map((data || []).map((row) => [row.template_id, row]))
  return {
    ok: true,
    templates: ADMIN_MAIL_TEMPLATES.map((t) => {
      const o = overrides.get(t.id)
      return mergeMailTemplate(t.id, o
        ? {
            heading: o.heading,
            introduction: o.introduction,
            body: o.body,
            ctaLabel: o.cta_label,
            ctaUrl: o.cta_url,
            closing: o.closing
          }
        : null)
    }),
    variables: ADMIN_MAIL_VARIABLES
  }
}

const handleSaveTemplate = async (user, body, env) => {
  const id = typeof body?.templateId === 'string' ? body.templateId.trim() : ''
  if (!getMailTemplateById(id) || !ADMIN_MAIL_TEMPLATES.some((t) => t.id === id)) {
    throwStatus('Unknown template.', 400)
  }
  const db = getAdminDb(env)
  const row = {
    template_id: id,
    heading: String(body?.heading ?? '').slice(0, 200),
    introduction: String(body?.introduction ?? '').slice(0, 2000),
    body: String(body?.body ?? '').slice(0, 12000),
    cta_label: String(body?.ctaLabel ?? '').slice(0, 80),
    cta_url: String(body?.ctaUrl ?? '').slice(0, 400),
    closing: String(body?.closing ?? '').slice(0, 2000),
    updated_by: user.id,
    updated_at: new Date().toISOString()
  }
  const { error } = await db.from('email_template_overrides').upsert(row, { onConflict: 'template_id' })
  if (error) {
    if (isMissingTable(error, 'email_template_overrides')) {
      throwStatus(activityTableMissing, 500)
    }
    throwStatus('Unable to save the template.', 500)
  }
  return { ok: true }
}

const handleMatchEnquiry = async (user, body, env) => {
  const db = getAdminDb(env)
  const matches = await matchEnquiriesByEmail(db, body?.email)
  return { ok: true, linkedEnquiries: matches.map(publicEnquiry), linkedEnquiry: matches[0] ? publicEnquiry(matches[0]) : null }
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleAdminMail = async (body, env = process.env, meta = {}) => {
  const action = typeof body?.action === 'string' ? body.action.trim() : 'status'
  const user = await requireAdmin(meta, env)

  switch (action) {
    case 'status':
      return handleStatus(user, env)
    case 'oauth-start':
      return handleGmailOauthStart(body, env, meta)
    case 'disconnect':
      await disconnectGmail(user.id, env)
      return { ok: true, gmail: publicGmailStatus(null, env) }
    case 'inbox':
      return handleInbox(user, body, env)
    case 'thread':
      return handleThread(user, body, env)
    case 'attachment':
      return handleGmailAttachment(user, body, env)
    case 'preview':
      return handlePreview(user, body, env)
    case 'generate-pdf':
      return handleGeneratePdf(user, body, env)
    case 'send-branded':
      return handleSendBranded(user, body, env)
    case 'send-gmail-reply':
      return handleGmailReply(user, body, env)
    case 'sent':
      return handleSentList(user, body, env)
    case 'save-draft':
      return handleSaveDraft(user, body, env)
    case 'templates':
      return handleListTemplates(user, env)
    case 'save-template':
      return handleSaveTemplate(user, body, env)
    case 'match-enquiry':
      return handleMatchEnquiry(user, body, env)
    default:
      throwStatus('Unknown mail action.', 400)
  }
}

export { handleGmailOauthCallback } from './gmail-oauth-service.mjs'
