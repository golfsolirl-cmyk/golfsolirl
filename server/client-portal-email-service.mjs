import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { finalizeGsolEmailHtml } from './email-layout.mjs'
import { getTransactionalEmailImageAttachments } from './enquiry-service.mjs'
import { buildBrandedClientPortalEmailHtml } from './branded-client-portal-email.mjs'

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
    const host = vercel.replace(/^https?:\/\//, '')
    return `https://${host}`
  }
  return 'http://localhost:5173'
}

const splitMessageParagraphs = (text) =>
  text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleSendClientPortalEmail = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    const err = new Error(auth.message)
    err.statusCode = auth.statusCode
    throw err
  }

  const supabaseUrl = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()

  if (!supabaseUrl || !serviceKey) {
    const err = new Error('Supabase is not configured on the server.')
    err.statusCode = 500
    throw err
  }
  if (!resendKey || !fromEmail) {
    const err = new Error('Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.')
    err.statusCode = 500
    throw err
  }

  const clientEmail = typeof body?.clientEmail === 'string' ? body.clientEmail.trim().toLowerCase() : ''
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!clientEmail || !clientEmail.includes('@')) {
    const err = new Error('A valid client login email is required.')
    err.statusCode = 400
    throw err
  }
  if (!subject) {
    const err = new Error('Subject is required.')
    err.statusCode = 400
    throw err
  }
  if (!message) {
    const err = new Error('Message is required.')
    err.statusCode = 400
    throw err
  }

  const rawAttachments = Array.isArray(body?.attachments) ? body.attachments : []
  if (rawAttachments.length > 4) {
    const err = new Error('At most four PDF attachments are allowed per send.')
    err.statusCode = 400
    throw err
  }

  /** @type {{ filename: string; content: string; contentType: string }[]} */
  const pdfAttachments = []
  const namesForLog = []

  for (const entry of rawAttachments) {
    if (!entry || typeof entry !== 'object') {
      continue
    }
    const filename = typeof entry.filename === 'string' ? entry.filename.trim() : ''
    const b64 = typeof entry.contentBase64 === 'string' ? entry.contentBase64.trim() : ''
    const contentType = typeof entry.contentType === 'string' && entry.contentType.trim() ? entry.contentType.trim() : 'application/pdf'

    if (!filename || !b64) {
      const err = new Error('Each attachment needs filename and contentBase64.')
      err.statusCode = 400
      throw err
    }
    if (!filename.toLowerCase().endsWith('.pdf')) {
      const err = new Error('Only PDF attachments are supported in this flow.')
      err.statusCode = 400
      throw err
    }

    let buf
    try {
      buf = Buffer.from(b64, 'base64')
    } catch {
      const err = new Error('Invalid attachment encoding.')
      err.statusCode = 400
      throw err
    }

    const maxBytes = 4 * 1024 * 1024
    if (buf.length > maxBytes) {
      const err = new Error(`Attachment "${filename}" is too large (max 4 MB each).`)
      err.statusCode = 400
      throw err
    }

    pdfAttachments.push({
      filename,
      content: buf.toString('base64'),
      contentType
    })
    namesForLog.push(filename)
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data: clientProfile, error: clientErr } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .ilike('email', clientEmail)
    .maybeSingle()

  if (clientErr || !clientProfile?.id) {
    const err = new Error('No client account matches that email. They must sign in once with this address first.')
    err.statusCode = 404
    throw err
  }

  const origin = getSiteOrigin(env)
  const dashboardUrl = `${origin}/login?next=${encodeURIComponent('/dashboard')}`
  const greeting = (clientProfile.full_name ?? '').trim().split(/\s+/)[0] || 'there'
  const paragraphs = splitMessageParagraphs(message)

  const rawHtml = buildBrandedClientPortalEmailHtml({
    subject,
    greetingName: greeting,
    bodyParagraphs: paragraphs,
    ctaHref: dashboardUrl,
    ctaLabel: 'Open your client dashboard'
  })

  const html = finalizeGsolEmailHtml(rawHtml)

  const imageAttachments = await getTransactionalEmailImageAttachments()

  const resend = new Resend(resendKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: [clientEmail],
    subject,
    html,
    attachments: [...imageAttachments, ...pdfAttachments]
  })

  if (sendError) {
    const err = new Error(sendError.message || 'Email could not be sent.')
    err.statusCode = 502
    throw err
  }

  const { error: logErr } = await supabase.from('portal_client_updates').insert({
    owner_id: clientProfile.id,
    title: subject.slice(0, 160),
    summary: message.slice(0, 400),
    email_subject: subject,
    template_key: 'branded',
    attachment_filenames: namesForLog
  })

  if (logErr) {
    console.error('[client-portal-email] portal_client_updates insert failed:', logErr.message)
  }

  return {
    ok: true,
    logged: !logErr,
    attachmentCount: namesForLog.length
  }
}
