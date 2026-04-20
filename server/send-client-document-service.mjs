import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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

const buildEmailHtml = ({ clientName, documentUrl, docTitle }) => {
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
              <p style="margin:12px 0 0;font-size:22px;font-weight:700;color:#ffffff;">${docTitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${name},</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#2d4a28;">
                We have shared this document with your account. Sign in to your dashboard area to open it and save a PDF anytime.
              </p>
              <p style="margin:0 0 24px;">
                <a href="${documentUrl}" style="display:inline-block;background:#dc5801;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:999px;font-size:15px;">Open document</a>
              </p>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#5c6b58;">
                If the button does not work, copy this link into your browser:<br />
                <span style="word-break:break-all;color:#2d6a4a;">${documentUrl}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 28px;">
              <p style="margin:0;font-size:13px;color:#5c6b58;">Warm regards,<br /><strong>Golf Sol Ireland</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
  const loginUrl = `${origin}/login?next=${encodeURIComponent(docPath)}`
  const documentUrl = `${origin}${docPath}`

  const labels = documentLabels[documentKind]
  const resend = new Resend(resendKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: clientEmail,
    subject: labels.subject,
    html: buildEmailHtml({
      clientName: clientProfile.full_name,
      documentUrl: loginUrl,
      docTitle: labels.title
    })
  })

  if (sendError) {
    const err = new Error(sendError.message || 'Email could not be sent.')
    err.statusCode = 502
    throw err
  }

  return { ok: true, documentKind, alreadyHadAccess: insertError?.code === '23505' }
}
