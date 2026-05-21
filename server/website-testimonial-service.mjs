import { createClient } from '@supabase/supabase-js'
import { assertApiRateLimit } from './api-rate-limit.mjs'

const throwStatus = (message, code = 400) => {
  const e = new Error(message)
  e.statusCode = code
  throw e
}

const trim = (value) => (typeof value === 'string' ? value.trim() : '')

const displayNameFromFullName = (fullName) => {
  const parts = fullName.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Golf Sol guest'
  if (parts.length === 1) return parts[0]
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()
  return `${parts[0]} ${lastInitial}.`
}

/**
 * Public POST: testimonial form on /testimonials — queued for admin approval (published_at null).
 * @param {import('node:process').ProcessEnv} env
 * @param {{ payload?: Record<string, unknown>; clientIp?: string }} meta
 */
export const handleWebsiteTestimonialSubmit = async (env, meta = {}) => {
  const fullName = trim(meta.payload?.fullName)
  const email = trim(meta.payload?.email).toLowerCase()
  const phone = trim(meta.payload?.phoneWhatsApp)
  const tripType = trim(meta.payload?.tripType)
  const travelMonth = trim(meta.payload?.travelMonth)
  const quoteText = trim(meta.payload?.quoteText ?? meta.payload?.notes)
  const sourcePage = trim(meta.payload?.sourcePage)
  const ratingRaw = Number(meta.payload?.rating)

  if (!fullName || !email || !phone) {
    throwStatus('Name, email, and phone/WhatsApp are required.', 400)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throwStatus('Please enter a valid email address.', 400)
  }
  if (!tripType) {
    throwStatus('Trip type is required.', 400)
  }
  if (!quoteText || quoteText.length < 20) {
    throwStatus('Please share at least a few sentences about your trip (20 characters minimum).', 400)
  }
  if (quoteText.length > 4000) {
    throwStatus('Testimonial is too long — please shorten to under 4,000 characters.', 400)
  }

  const rating = Number.isFinite(ratingRaw) ? Math.min(5, Math.max(1, Math.round(ratingRaw))) : 5

  const ip = trim(meta.clientIp) || 'unknown'
  assertApiRateLimit('website-testimonial', ip, env, {
    max: 6,
    message: 'Too many testimonial submissions from this connection. Please wait a few minutes.'
  })

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Server is not configured.', 500)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data, error } = await admin
    .from('website_testimonials')
    .insert({
      author_name: displayNameFromFullName(fullName),
      email,
      phone,
      trip_type: tripType,
      travel_month: travelMonth || null,
      quote_text: quoteText,
      rating,
      source_page: sourcePage || '/testimonials',
      published_at: null,
      hidden_at: null
    })
    .select('id, author_name, rating')
    .single()

  if (error) {
    throwStatus(error.message, 500)
  }

  return {
    ok: true,
    id: data.id,
    displayName: data.author_name,
    rating: data.rating,
    pendingApproval: true
  }
}
