import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { finalizeGsolEmailHtml } from './email-layout.mjs'
import { buildBrandedPortalTicketReplyEmailHtml } from './branded-portal-ticket-reply-email.mjs'

const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

const topicFromCategory = (category) => {
  const c = String(category ?? '').trim()
  if (c === 'transfers') {
    return 'Transfers'
  }
  if (c === 'golf_courses') {
    return 'Golf courses'
  }
  if (c === 'hotels') {
    return 'Hotels'
  }
  return 'Your request'
}

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

/**
 * Admin posts a reply on an interest ticket; inserts row and emails the client.
 * @param {Record<string, unknown>} payload
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handlePortalInterestTicketReply = async (payload = {}, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const ticketId = typeof payload.ticketId === 'string' ? payload.ticketId.trim() : ''
  const bodyText = typeof payload.body === 'string' ? payload.body.trim() : ''
  if (!ticketId) {
    throwStatus('ticketId is required.', 400)
  }
  if (!bodyText) {
    throwStatus('Reply body is required.', 400)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()

  if (!url || !serviceKey) {
    throwStatus('Supabase is not configured on the server.', 500)
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data: ticket, error: tErr } = await admin
    .from('portal_interest_tickets')
    .select('id, owner_id, category')
    .eq('id', ticketId)
    .maybeSingle()

  if (tErr) {
    throwStatus(tErr.message, 500)
  }
  if (!ticket?.owner_id) {
    throwStatus('Ticket not found.', 404)
  }

  const { data: owner, error: oErr } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', ticket.owner_id)
    .maybeSingle()

  if (oErr) {
    throwStatus(oErr.message, 500)
  }

  const clientEmail = typeof owner?.email === 'string' ? owner.email.trim().toLowerCase() : ''
  if (!clientEmail || !clientEmail.includes('@')) {
    throwStatus('Client profile has no email for this ticket.', 400)
  }

  const { error: insErr } = await admin.from('portal_interest_ticket_messages').insert({
    ticket_id: ticketId,
    author_kind: 'admin',
    body: bodyText
  })

  if (insErr) {
    throwStatus(insErr.message, 500)
  }

  let emailed = false
  let emailError = ''

  if (resendKey && fromEmail) {
    try {
      const origin = getSiteOrigin(env)
      const dashboardHref = `${origin}/dashboard/login?next=${encodeURIComponent('/dashboard#portal-interest')}`
      const greeting = (owner?.full_name ?? '').toString().trim().split(/\s+/)[0] || 'there'
      const topicLabel = topicFromCategory(ticket.category)
      const { subject, html: rawHtml } = buildBrandedPortalTicketReplyEmailHtml({
        topicLabel,
        greetingName: greeting,
        dashboardHref,
        snippet: bodyText
      })
      const html = finalizeGsolEmailHtml(rawHtml)
      const resend = new Resend(resendKey)
      const { error: sendErr } = await resend.emails.send({
        from: fromEmail,
        to: [clientEmail],
        subject,
        html
      })

      if (sendErr) {
        emailError = sendErr.message || 'Resend failed'
        console.error('[portal-interest-ticket-reply] email:', emailError)
      } else {
        emailed = true
      }
    } catch (e) {
      emailError = e instanceof Error ? e.message : 'Email failed'
      console.error('[portal-interest-ticket-reply] email:', emailError)
    }
  } else {
    emailError = 'RESEND_API_KEY / RESEND_FROM_EMAIL not set'
    console.warn('[portal-interest-ticket-reply]', emailError)
  }

  return { ok: true, emailed, emailError: emailed ? '' : emailError }
}
