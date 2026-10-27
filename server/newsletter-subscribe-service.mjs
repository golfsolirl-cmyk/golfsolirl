import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { assertApiRateLimit } from './api-rate-limit.mjs'
import { emailFonts, escapeHtml, gs } from './branded-email-shell.mjs'
import { gsolEmailBrand } from './email-constants.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml } from './email-layout.mjs'
import { resolveResendToAddress } from './resend-delivery-email.mjs'

const throwStatus = (message, code = 400) => {
  const error = new Error(message)
  error.statusCode = code
  throw error
}

const trim = (value) => (typeof value === 'string' ? value.trim() : '')

const welcomeHtml = (name) => {
  const hello = name ? `Hello ${escapeHtml(name)},` : 'Hello,'
  return buildGsolTransactionalEmail({
    documentTitle: 'You are on the Golf Sol Ireland list',
    preheader: 'Occasional Costa del Sol golf notes for Irish travellers. Unsubscribe any time.',
    heroKicker: 'Newsletter',
    heroTitle: 'You are on the list',
    heroLead: 'We will email you when there is a useful note for Irish golfers heading to the Costa del Sol.',
    bodyHtml: `<p style="margin:0 0 14px;font-family:${emailFonts.sans};font-size:16px;line-height:1.7;color:${gs.text};">${hello}</p>
<p style="margin:0 0 14px;font-family:${emailFonts.sans};font-size:16px;line-height:1.7;color:${gs.text};">Expect a short note now and then: tee-time timing, a travel reminder, or a seasonal offer. Not a weekly blast.</p>
<p style="margin:0;font-family:${emailFonts.sans};font-size:16px;line-height:1.7;color:${gs.text};">Reply to this email if you want off the list.</p>`
  })
}

const deskHtml = ({ email, name, sourcePage }) =>
  buildGsolTransactionalEmail({
    documentTitle: 'New newsletter signup',
    preheader: `${email} subscribed from the website.`,
    heroKicker: 'Newsletter',
    heroTitle: 'New signup',
    heroLead: 'Someone joined the Costa del Sol golf list.',
    bodyHtml: `<p style="margin:0 0 8px;font-family:${emailFonts.sans};font-size:16px;line-height:1.7;color:${gs.text};"><strong>Email:</strong> ${escapeHtml(email)}</p>
<p style="margin:0 0 8px;font-family:${emailFonts.sans};font-size:16px;line-height:1.7;color:${gs.text};"><strong>Name:</strong> ${escapeHtml(name || 'Not given')}</p>
<p style="margin:0;font-family:${emailFonts.sans};font-size:16px;line-height:1.7;color:${gs.text};"><strong>Page:</strong> ${escapeHtml(sourcePage || '/newsletter')}</p>`
  })

const sendMail = async (env, { to, subject, html }) => {
  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !fromEmail) {
    return false
  }
  const resend = new Resend(resendKey)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [resolveResendToAddress(to, env)],
    subject,
    html: finalizeGsolEmailHtml(html)
  })
  if (error) {
    console.error('[newsletter] resend failed', error.message ?? error)
    return false
  }
  return true
}

/**
 * Public POST: email-only signup from /newsletter.
 * @param {Record<string, unknown>} payload
 * @param {import('node:process').ProcessEnv} env
 * @param {{ clientIp?: string }} [meta]
 */
export const handleNewsletterSubscribe = async (payload, env, meta = {}) => {
  const email = trim(payload?.email).toLowerCase()
  const fullName = trim(payload?.fullName).slice(0, 80)
  const sourcePage = trim(payload?.sourcePage).slice(0, 180) || '/newsletter'
  const consent = payload?.consent === true

  if (!email) {
    throwStatus('Add your email address.', 400)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throwStatus('Enter a valid email address.', 400)
  }
  if (!consent) {
    throwStatus('Tick the box so we can email you updates.', 400)
  }

  const ip = trim(meta.clientIp) || 'unknown'
  assertApiRateLimit('newsletter-subscribe', `${ip}:${email}`, env, {
    max: 8,
    message: 'Too many signup attempts. Wait a few minutes and try again.'
  })

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Signup is not configured yet.', 500)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const now = new Date().toISOString()

  const { data: existing, error: lookupError } = await admin
    .from('newsletter_subscribers')
    .select('id, unsubscribed_at')
    .eq('email_normalized', email)
    .maybeSingle()

  if (lookupError) {
    console.error('[newsletter] lookup failed', lookupError.message)
    throwStatus('Could not save your signup. Try again in a moment.', 500)
  }

  const alreadyOnList = Boolean(existing && !existing.unsubscribed_at)

  if (existing?.id) {
    const { error: updateError } = await admin
      .from('newsletter_subscribers')
      .update({
        email,
        full_name: fullName || null,
        source_page: sourcePage,
        consented_at: now,
        unsubscribed_at: null
      })
      .eq('id', existing.id)
    if (updateError) {
      console.error('[newsletter] update failed', updateError.message)
      throwStatus('Could not save your signup. Try again in a moment.', 500)
    }
  } else {
    const { error: insertError } = await admin.from('newsletter_subscribers').insert({
      email,
      email_normalized: email,
      full_name: fullName || null,
      source_page: sourcePage,
      consented_at: now
    })
    if (insertError) {
      console.error('[newsletter] insert failed', insertError.message)
      throwStatus('Could not save your signup. Try again in a moment.', 500)
    }
  }

  if (!alreadyOnList) {
    await sendMail(env, {
      to: email,
      subject: 'You are on the Golf Sol Ireland list',
      html: welcomeHtml(fullName)
    })
    await sendMail(env, {
      to: gsolEmailBrand.email,
      subject: `Newsletter signup — ${email}`,
      html: deskHtml({ email, name: fullName, sourcePage })
    })
  }

  return {
    ok: true,
    alreadySubscribed: alreadyOnList,
    message: alreadyOnList
      ? 'You are already on the list. We will keep the notes coming.'
      : 'You are subscribed. Watch your inbox for a short confirmation.'
  }
}
