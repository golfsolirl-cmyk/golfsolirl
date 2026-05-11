import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { normalizeProposalPayload } from '../shared/document-templates.mjs'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { createProposalFilename, createProposalPdf } from './proposal-service.mjs'
import { buildBrandedProposalAttachedEmailHtml } from './branded-client-portal-email.mjs'
import { finalizeGsolEmailHtml } from './email-layout.mjs'

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

export const handleSendProposalToClient = async (rawBody, env, { authHeader }) => {
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

  const body = typeof rawBody === 'object' && rawBody !== null ? rawBody : {}
  const clientEmail = typeof body.clientEmail === 'string' ? body.clientEmail.trim().toLowerCase() : ''
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const proposalPayload = body.proposalPayload && typeof body.proposalPayload === 'object' ? body.proposalPayload : null

  if (!clientEmail || !clientEmail.includes('@')) {
    const err = new Error('A valid client email is required.')
    err.statusCode = 400
    throw err
  }

  if (!proposalPayload) {
    const err = new Error('proposalPayload is required.')
    err.statusCode = 400
    throw err
  }

  const auth = await requireAdminFromBearer(authHeader, env)
  if (!auth.ok) {
    const err = new Error(auth.message)
    err.statusCode = auth.statusCode
    throw err
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
    const err = new Error('No client account matches that email. They must sign up first.')
    err.statusCode = 404
    throw err
  }

  const normalized = { ...normalizeProposalPayload(proposalPayload), variant: 'public' }
  const { pdfBytes, proposal } = await createProposalPdf(normalized)
  const filename = createProposalFilename(proposal.proposalId)

  const { error: insertError } = await supabase.from('proposals').insert({
    proposal_id: proposal.proposalId,
    owner_id: clientProfile.id,
    title: title || `Proposal ${proposal.proposalId}`,
    status: 'sent',
    payload: normalized,
    updated_at: new Date().toISOString()
  })

  if (insertError) {
    if (insertError.code === '23505') {
      const err = new Error('That proposal reference already exists. Generate a new proposal ID and try again.')
      err.statusCode = 409
      throw err
    }

    const err = new Error(insertError.message || 'Unable to save proposal record.')
    err.statusCode = 500
    throw err
  }

  const origin = getSiteOrigin(env)
  const dashboardLoginUrl = `${origin}/dashboard/login?next=${encodeURIComponent('/dashboard')}`
  const rawHtml = buildBrandedProposalAttachedEmailHtml({
    greetingName: clientProfile.full_name ?? '',
    proposalId: proposal.proposalId,
    dashboardLoginUrl
  })
  const html = finalizeGsolEmailHtml(rawHtml)
  const pdfAttachment = {
    filename,
    content: Buffer.from(pdfBytes).toString('base64'),
    contentType: 'application/pdf'
  }

  const resend = new Resend(resendKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: clientEmail,
    subject: `Your Golf Sol Ireland proposal — ${proposal.proposalId}`,
    html,
    attachments: [pdfAttachment]
  })

  if (sendError) {
    const err = new Error(sendError.message || 'Email could not be sent.')
    err.statusCode = 502
    throw err
  }

  return { ok: true, proposalId: proposal.proposalId }
}
