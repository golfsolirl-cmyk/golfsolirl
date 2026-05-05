/**
 * Mirror selected website enquiries into `transfer_bookings` so Operations and drivers
 * see the same pipeline as dashboard map requests.
 *
 * @param {object} enquiry validated enquiry payload
 * @param {string} enquiryId enquiries.reference_id
 * @param {import('node:process').ProcessEnv} env
 */

const FORM_TRANSPORT = 'transport_service_page'
const FORM_QUICK = 'content_quick_enquiry'

const KEY_QUOTE_INTENT = '_quoteIntent'
const QUOTE_AIRPORT_ONLY = 'airport_only'
const KEY_PICKUP_LABEL = '_pickupLabel'
const KEY_DROPOFF_LABEL = '_dropoffLabel'

const norm = (s) => String(s ?? '').trim()

const fieldMap = (fields) => {
  if (!fields || typeof fields !== 'object') {
    return new Map()
  }
  const m = new Map()
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') {
      m.set(k, v.trim())
    } else if (v != null) {
      m.set(k, String(v).trim())
    }
  }
  return m
}

const looksLikeTransferEnquiry = (enquiry) => {
  const fp = enquiry?.formPayload
  if (!fp || typeof fp !== 'object') {
    return false
  }
  const form = norm(fp.form)
  const fm = fieldMap(fp.fields)
  const interest = norm(enquiry.interest).toUpperCase()

  if (form === FORM_TRANSPORT) {
    return true
  }
  if (fm.get(KEY_QUOTE_INTENT) === QUOTE_AIRPORT_ONLY) {
    return true
  }
  if (norm(fm.get(KEY_PICKUP_LABEL)) && norm(fm.get(KEY_DROPOFF_LABEL))) {
    return true
  }
  if (interest.includes('TRANSPORT PAGE')) {
    return true
  }
  if (interest.includes('AIRPORT TRANSFERS ONLY')) {
    return true
  }
  if (norm(fm.get('Collection point')) && norm(fm.get('Destination'))) {
    return true
  }
  return false
}

const pickupDropoffFromFields = (fm) => {
  let pickup = norm(fm.get(KEY_PICKUP_LABEL)) || norm(fm.get('Collection point'))
  let dropoff = norm(fm.get(KEY_DROPOFF_LABEL)) || norm(fm.get('Destination'))
  if (!pickup) {
    pickup = 'Pickup — confirm with guest'
  }
  if (!dropoff) {
    dropoff = 'Destination — confirm with guest'
  }
  return { pickup, dropoff }
}

const parseRouteWaypointsJson = (raw) => {
  const t = norm(raw)
  if (!t) {
    return null
  }
  try {
    const v = JSON.parse(t)
    if (!Array.isArray(v) || v.length === 0) {
      return null
    }
    const out = []
    for (const item of v) {
      if (!item || typeof item !== 'object') {
        continue
      }
      const label = norm(item.label)
      const lat = typeof item.lat === 'number' ? item.lat : Number(item.lat)
      const lng = typeof item.lng === 'number' ? item.lng : Number(item.lng)
      if (!label || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        continue
      }
      out.push({ label, lat, lng })
    }
    return out.length ? out : null
  } catch {
    return null
  }
}

export const insertTransferBookingFromWebsiteEnquiry = async (enquiry, enquiryId, env = process.env) => {
  if (!looksLikeTransferEnquiry(enquiry)) {
    return
  }

  const url = typeof env.SUPABASE_URL === 'string' ? env.SUPABASE_URL.trim() : ''
  const key = typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' ? env.SUPABASE_SERVICE_ROLE_KEY.trim() : ''
  if (!url || !key) {
    return
  }

  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const fp = enquiry.formPayload
  const fm = fieldMap(fp?.fields)

  const { pickup, dropoff } = pickupDropoffFromFields(fm)
  const timingRaw = norm(fm.get('Collection timing')) || norm(enquiry.bestTimeToCall) || ''

  let scheduledAt = null
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(timingRaw)) {
    const { data: ts, error: rpcErr } = await sb.rpc('parse_malaga_local_datetime_to_timestamptz', { p: timingRaw })
    if (!rpcErr && ts) {
      scheduledAt = ts
    }
  }

  const email = norm(enquiry.email).toLowerCase()
  if (!email || !email.includes('@')) {
    return
  }

  let clientUserId = null
  const { data: prof } = await sb.from('profiles').select('id').ilike('email', email).maybeSingle()
  if (prof?.id) {
    clientUserId = prof.id
  }

  const waypoints = parseRouteWaypointsJson(fm.get('_routeWaypoints'))

  const row = {
    client_user_id: clientUserId,
    client_email: email,
    client_display_name: norm(enquiry.fullName),
    client_phone: norm(enquiry.phoneWhatsApp),
    pickup_label: pickup,
    dropoff_label: dropoff,
    pickup_lat: null,
    pickup_lng: null,
    dropoff_lat: null,
    dropoff_lng: null,
    scheduled_at: scheduledAt,
    client_timing_note: timingRaw.slice(0, 500),
    status: 'pending',
    enquiry_reference_id: enquiryId,
    booking_source: 'website_enquiry',
    updated_at: new Date().toISOString()
  }
  if (waypoints) {
    row.route_waypoints = waypoints
  }

  const { error } = await sb.from('transfer_bookings').insert(row)
  if (error) {
    if (String(error.message).toLowerCase().includes('duplicate') || String(error.code) === '23505') {
      return
    }
    console.error('[insert-transfer-booking-from-enquiry] insert failed:', error.message)
  }
}
