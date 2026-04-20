import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { normalizeProposalPayload } from '../shared/document-templates.mjs'
import { createProposalFilename, createProposalPdf } from './proposal-service.mjs'

const buildProposalEmailHtml = ({ proposalId, clientName }) => {
  const name = clientName?.trim() ? clientName.trim() : 'there'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;font-family:Georgia,serif;background:#f4f6f1;color:#163a13;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f1;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dfe8d8;">
          <tr>
            <td style="background:#0a2008;padding:28px 24px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#fdc874;">Golf Sol Ireland</p>
              <p style="margin:12px 0 0;font-size:22px;font-weight:700;color:#ffffff;">Your proposal is ready</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${name},</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#2d4a28;">
                Please find your formal package proposal attached (${proposalId}). You can also download it anytime from
                <strong>your dashboard</strong> after signing in at our site.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.65;color:#2d4a28;">
                If anything needs tweaking, just reply to this email — we&apos;re here to get the Costa del Sol right for your group.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 28px;">
              <p style="margin:0;font-size:13px;color:#5c6b58;">Fairways &amp; fair play,<br /><strong>Golf Sol Ireland</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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

  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : ''

  if (!token) {
    const err = new Error('Missing authorization.')
    err.statusCode = 401
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
    const err = new Error('Only admins can send proposals to clients.')
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

  const resend = new Resend(resendKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: clientEmail,
    subject: `Your Golf Sol Ireland proposal — ${proposal.proposalId}`,
    html: buildProposalEmailHtml({ proposalId: proposal.proposalId, clientName: clientProfile.full_name }),
    attachments: [{ filename, content: Buffer.from(pdfBytes) }]
  })

  if (sendError) {
    const err = new Error(sendError.message || 'Email could not be sent.')
    err.statusCode = 502
    throw err
  }

  return { ok: true, proposalId: proposal.proposalId }
}
