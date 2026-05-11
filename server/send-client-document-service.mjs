import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildBrandedClientDocumentInviteEmailHtml } from './branded-client-portal-email.mjs'
import { finalizeGsolEmailHtml } from './email-layout.mjs'

const getSiteOrigin = (env) => {
  const site = env.SITE_URL?.trim()

  if (site) {
    try {
      return new URL(site.startsWith('http') ? site : `https://${site}`).origin
    } catch {
      // continue
    }
  }

  const vercel = env.VERCEL_URL?.trim()

  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '')
    return `https://${host}`
  }

  return 'http://localhost:5173'
}

const documentLabels = {
  terms: { subject: 'Your Golf Sol Ireland terms and conditions', title: 'Terms and conditions' },
  welcome: { subject: 'Thank you for choosing Golf Sol Ireland', title: 'Thank you from Golf Sol Ireland' }
}

export const handleSendClientDocument = async (rawBody, env, { authHeader }) => {
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

  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : ''

  if (!token) {
    const err = new Error('Missing authorization.')
    err.statusCode = 401
    throw err
  }

  const body = typeof rawBody === 'object' && rawBody !== null ? rawBody : {}
  const clientEmail = typeof body.clientEmail === 'string' ? body.clientEmail.trim().toLowerCase() : ''
  const documentKind = body.documentKind === 'welcome' ? 'welcome' : body.documentKind === 'terms' ? 'terms' : null

  if (!clientEmail || !clientEmail.includes('@')) {
    const err = new Error('A valid client email is required.')
    err.statusCode = 400
    throw err
  }

  if (!documentKind) {
    const err = new Error('documentKind must be "terms" or "welcome".')
    err.statusCode = 400
    throw err
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser(token)

  if (userError || !user) {
    const err = new Error('Invalid or expired session.')
    err.statusCode = 401
    throw err
  }

  const { data: adminProfile, error: adminErr } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (adminErr || adminProfile?.role !== 'admin') {
    const err = new Error('Only admins can send client documents.')
    err.statusCode = 403
    throw err
  }

  const { data: clientProfile, error: clientErr } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .ilike('email', clientEmail)
    .maybeSingle()

  if (clientErr || !clientProfile?.id) {
    const err = new Error('No client account matches that email. They must sign up first.')
    err.statusCode = 404
    throw err
  }

  const { error: insertError } = await supabase.from('client_document_access').insert({
    owner_id: clientProfile.id,
    document_kind: documentKind
  })

  if (insertError && insertError.code !== '23505') {
    const err = new Error(insertError.message || 'Unable to grant document access.')
    err.statusCode = 500
    throw err
  }

  const origin = getSiteOrigin(env)
  const docPath = documentKind === 'welcome' ? '/documents/welcome' : '/documents/terms'
  const loginUrl = `${origin}/dashboard/login?next=${encodeURIComponent(docPath)}`
  const documentUrl = `${origin}${docPath}`

  const labels = documentLabels[documentKind]
  const rawHtml = buildBrandedClientDocumentInviteEmailHtml({
    greetingName: clientProfile.full_name ?? '',
    docTitle: labels.title,
    documentUrl: loginUrl
  })
  const html = finalizeGsolEmailHtml(rawHtml)

  const resend = new Resend(resendKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: clientEmail,
    subject: labels.subject,
    html
  })

  if (sendError) {
    const err = new Error(sendError.message || 'Email could not be sent.')
    err.statusCode = 502
    throw err
  }

  return { ok: true, documentKind, alreadyHadAccess: insertError?.code === '23505' }
}
