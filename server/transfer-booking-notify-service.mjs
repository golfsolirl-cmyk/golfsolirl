import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { ctaGold, emailFonts, gs } from './branded-email-shell.mjs'
import { gsolEmailBrand } from './email-constants.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml, getGsolSiteUrl } from './email-layout.mjs'

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')

const formatTransferWhen = (booking) => {
  const note = String(booking.client_timing_note ?? '').trim()
  if (booking.scheduled_at) {
    try {
      const base = new Date(booking.scheduled_at).toLocaleString('en-IE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Madrid'
      })
      return base
    } catch {
      return note || 'ASAP'
    }
  }
  return note || 'ASAP (next available driver)'
}

const viaLabelsHtml = (booking) => {
  const w = booking.route_waypoints
  if (!Array.isArray(w) || !w.length) {
    return ''
  }
  const labels = w.map((x) => (x && typeof x.label === 'string' ? x.label.trim() : '')).filter(Boolean)
  if (!labels.length) {
    return ''
  }
  return labels.map(esc).join(' → ')
}

const driverGuestSummary = (booking) => {
  const name = esc((booking.client_display_name || '').trim() || 'Guest')
  const phone = esc((booking.client_phone || '').trim() || '—')
  return `${name} · ${phone}`
}

const throwStatus = (message, code = 400) => {
  const e = new Error(message)
  e.statusCode = code
  throw e
}

/**
 * @param {import('node:process').ProcessEnv} env
 * @param {{ authHeader?: string; payload?: { bookingId?: string; event?: string } }} meta
 */
export const handleTransferBookingNotify = async (env, meta = {}) => {
  const raw = typeof meta.authHeader === 'string' ? meta.authHeader.trim() : ''
  const jwt = raw.toLowerCase().startsWith('bearer ') ? raw.slice(7).trim() : ''
  if (!jwt) {
    throwStatus('Sign in required.', 401)
  }

  const bookingId = typeof meta.payload?.bookingId === 'string' ? meta.payload.bookingId.trim() : ''
  const event = typeof meta.payload?.event === 'string' ? meta.payload.event.trim() : ''
  if (!bookingId || !event) {
    throwStatus('bookingId and event are required.', 400)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Server is not configured.', 500)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt)
  if (userErr || !userData?.user?.id) {
    throwStatus('Invalid session.', 401)
  }
  const uid = userData.user.id

  const { data: profile, error: pErr } = await admin.from('profiles').select('role, email, full_name').eq('id', uid).maybeSingle()
  if (pErr || !profile) {
    throwStatus('Profile not found.', 403)
  }

  const { data: booking, error: bErr } = await admin.from('transfer_bookings').select('*').eq('id', bookingId).maybeSingle()
  if (bErr || !booking) {
    throwStatus('Booking not found.', 404)
  }

  if (event === 'allocated') {
    if (profile.role !== 'admin') {
      throwStatus('Only admins can send allocation emails.', 403)
    }
  } else if (['driver_accepted', 'en_route', 'picked_up', 'completed'].includes(event)) {
    if (profile.role !== 'driver') {
      throwStatus('Only the assigned driver can trigger this notification.', 403)
    }
    const { data: driverRow } = await admin.from('drivers').select('id, auth_user_id').eq('id', booking.assigned_driver_id).maybeSingle()
    if (!driverRow || driverRow.auth_user_id !== uid) {
      throwStatus('You are not the assigned driver for this booking.', 403)
    }
  } else {
    throwStatus('Unknown event.', 400)
  }

  const resendKey = env.RESEND_API_KEY?.trim()
  const from = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !from) {
    return { ok: true, emailed: false, reason: 'Resend not configured' }
  }

  const site = getGsolSiteUrl()
  const clientTo = (booking.client_email || '').trim()
  if (!clientTo) {
    return { ok: true, emailed: false, reason: 'No client email' }
  }

  const resend = new Resend(resendKey)

  let subject = 'Golf Sol Ireland — transfer update'
  let heroTitle = 'Transfer update'
  let heroLead = ''
  let bodyHtml = ''

  const flightLine = (() => {
    const fn = String(booking.inbound_flight_number ?? '').trim()
    return fn ? `<br />Flight: <strong>${esc(fn)}</strong>` : ''
  })()

  if (event === 'allocated') {
    const { data: dRow } = await admin
      .from('drivers')
      .select('display_name, phone')
      .eq('id', booking.assigned_driver_id)
      .maybeSingle()
    const dn = dRow?.display_name ? esc(dRow.display_name) : 'Martin Kelly'
    const irishOpsTel = esc(gsolEmailBrand.phoneTel)
    const irishOpsDisplay = esc(gsolEmailBrand.phoneDisplay)
    const spanishDisplay = esc(gsolEmailBrand.spanishPhoneDisplay)
    const spanishTel = esc(gsolEmailBrand.spanishPhoneTel)
    const spanishWaDigits = String(gsolEmailBrand.spanishPhoneTel || '').replace(/\D/g, '')
    const spanishWaHref = esc(`https://wa.me/${spanishWaDigits}`)
    const spanishSmsHref = esc(`sms:${gsolEmailBrand.spanishPhoneTel}`)
    subject = 'Your Golf Sol transfer — driver allocated'
    heroTitle = 'Your driver is confirmed'
    heroLead = `${dn} has been allocated for your transfer. Use the Spanish mobile below as your first point of contact when you land.`
    const viaClient = viaLabelsHtml(booking)
    const whenLine = esc(formatTransferWhen(booking))
    bodyHtml = `<p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.7;color:${gs.text};">Pickup: <strong>${esc(booking.pickup_label)}</strong>${flightLine}<br />Destination: <strong>${esc(booking.dropoff_label)}</strong>${viaClient ? `<br />Via: <strong>${viaClient}</strong>` : ''}<br />When: <strong>${whenLine}</strong></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;border-collapse:collapse;background:${gs.cream};border:1px solid ${gs.border};border-radius:12px;">
  <tr>
    <td style="padding:18px 20px;">
      <p style="margin:0 0 6px 0;font-family:${emailFonts.sans};font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${gs.green};">On the day</p>
      <p style="margin:0 0 12px 0;font-family:${emailFonts.sans};font-size:17px;line-height:1.45;color:${gs.text};"><strong>Your driver:</strong> ${dn}</p>
      <p style="margin:0 0 4px 0;font-family:${emailFonts.sans};font-size:14px;line-height:1.55;color:${gs.text};"><strong>Contact mobile (Spain):</strong></p>
      <p style="margin:0 0 12px 0;font-family:${emailFonts.sans};font-size:20px;line-height:1.3;font-weight:800;color:${gs.dark};">
        <a href="tel:${spanishTel}" style="color:${gs.dark};text-decoration:none;">${spanishDisplay}</a>
      </p>
      <p style="margin:0 0 14px 0;font-family:${emailFonts.sans};font-size:14px;line-height:1.65;color:${gs.text};">
        Reach ${dn} by
        <a href="tel:${spanishTel}" style="color:${gs.green};font-weight:700;text-decoration:none;">direct call</a>,
        <a href="${spanishWaHref}" style="color:${gs.green};font-weight:700;text-decoration:none;">WhatsApp</a>,
        or
        <a href="${spanishSmsHref}" style="color:${gs.green};font-weight:700;text-decoration:none;">SMS</a>.
      </p>
      <p style="margin:0;font-family:${emailFonts.sans};font-size:14px;line-height:1.7;color:${gs.text};padding:12px 14px;background:#ffffff;border-radius:8px;border-left:4px solid ${gs.gold};">
        <strong>First point of contact when you land:</strong> use this Spanish mobile as soon as you arrive at your Spanish airport. ${dn} will coordinate your pickup on this number.
      </p>
    </td>
  </tr>
</table>
<p style="margin:0;font-family:${emailFonts.sans};font-size:14px;line-height:1.65;color:${gs.muted};"><strong>Irish operations (backup / 24/7):</strong> ${irishOpsDisplay} · <a href="tel:${irishOpsTel}" style="color:${gs.green};font-weight:700;text-decoration:none;">${irishOpsTel}</a></p>`
  } else if (event === 'driver_accepted') {
    subject = 'Your driver is preparing'
    heroTitle = 'Driver accepted'
    heroLead = 'Your driver has accepted the job and will head to your pickup shortly.'
    bodyHtml = `<p style="margin:0;font-family:${emailFonts.sans};font-size:15px;line-height:1.7;color:${gs.text};">Open your <a href="${site}/dashboard" style="color:${gs.green};font-weight:800;text-decoration:none;">client dashboard</a> to follow live location once they share it.</p>`
  } else if (event === 'en_route') {
    subject = 'Your driver is on the way'
    heroTitle = 'On the way'
    heroLead = 'Heads-up: your driver has started toward the pickup point.'
    bodyHtml = ''
  } else if (event === 'picked_up') {
    subject = 'Pickup complete'
    heroTitle = 'You are on board'
    heroLead = 'Your driver has marked pickup complete. Enjoy the run.'
    bodyHtml = ''
  } else if (event === 'completed') {
    const { generateReviewToken, hashReviewToken } = await import('./review-token-crypto.mjs')
    const reviewToken = generateReviewToken()
    await admin
      .from('transfer_bookings')
      .update({ review_token_hash: hashReviewToken(reviewToken, env) })
      .eq('id', bookingId)
    const reviewUrl = `${site}/rate-trip?bid=${encodeURIComponent(bookingId)}&t=${encodeURIComponent(reviewToken)}`
    subject = 'How was your transfer?'
    heroTitle = 'Trip complete'
    heroLead = 'Thank you for travelling with Golf Sol Ireland. Rate your driver in one tap — it helps us showcase real Irish-owned service on the Sol.'
    bodyHtml = `<p style="margin:0 0 18px 0;font-family:${emailFonts.sans};font-size:15px;line-height:1.7;color:${gs.text};">We read every review. Optional public testimonial is approved by our team before it appears on the homepage.</p>
      <p style="margin:0;"><a href="${reviewUrl}" style="${ctaGold}">Rate this trip</a></p>`
  }

  const htmlRaw = buildGsolTransactionalEmail({
    documentTitle: subject,
    preheader: heroLead.slice(0, 120),
    heroKicker: 'Golf Sol Ireland',
    heroTitle,
    heroLead,
    heroMetaHtml: `<div style="font-size:12px;line-height:1.65;color:rgba(255,255,255,0.88);">Irish line: ${esc(gsolEmailBrand.phoneDisplay)} · <a href="tel:${esc(gsolEmailBrand.phoneTel)}" style="color:#ffe7a3;font-weight:700;text-decoration:none;">${esc(gsolEmailBrand.phoneTel)}</a></div>`,
    bodyHtml
  })
  const html = finalizeGsolEmailHtml(htmlRaw)

  const { error: sendErr } = await resend.emails.send({
    from,
    to: clientTo,
    subject,
    html
  })
  if (sendErr) {
    throwStatus(sendErr.message ?? 'Resend failed', 500)
  }

  if (event === 'allocated' && booking.assigned_driver_id) {
    const { data: dFull } = await admin
      .from('drivers')
      .select('email, display_name')
      .eq('id', booking.assigned_driver_id)
      .maybeSingle()
    const de = (dFull?.email || '').trim()
    if (de) {
      const viaDriver = viaLabelsHtml(booking)
      const whenDriver = esc(formatTransferWhen(booking))
      const guestDriver = driverGuestSummary(booking)
      const dhtmlRaw = buildGsolTransactionalEmail({
        documentTitle: 'New transfer job',
        preheader: 'Guest pickup details — Golf Sol Ireland.',
        heroKicker: 'Operations',
        heroTitle: 'Transfer job — dispatch',
        heroLead: `Pickup: ${esc(booking.pickup_label)} → ${esc(booking.dropoff_label)} · ${guestDriver} · ${whenDriver}.`,
        heroMetaHtml: '',
        bodyHtml: `<p style="margin:0 0 10px 0;font-family:${emailFonts.sans};font-size:14px;line-height:1.7;color:${gs.text};"><strong>Guest contact:</strong> ${guestDriver}</p><p style="margin:0 0 10px 0;font-family:${emailFonts.sans};font-size:14px;line-height:1.7;color:${gs.text};"><strong>Pickup:</strong> ${esc(booking.pickup_label)}${flightLine}<br /><strong>Drop-off:</strong> ${esc(booking.dropoff_label)}<br /><strong>When:</strong> ${whenDriver}</p>${viaDriver ? `<p style="margin:0 0 10px 0;font-family:${emailFonts.sans};font-size:14px;line-height:1.7;color:${gs.text};"><strong>Via:</strong> ${viaDriver}</p>` : ''}<p style="margin:0;font-family:${emailFonts.sans};font-size:14px;line-height:1.7;color:${gs.text};">Client email: <strong>${esc(clientTo)}</strong></p>`
      })
      await resend.emails.send({
        from,
        to: de,
        subject: 'Golf Sol — transfer dispatch (pickup details)',
        html: finalizeGsolEmailHtml(dhtmlRaw)
      })
    }
  }

  return { ok: true, emailed: true }
}
