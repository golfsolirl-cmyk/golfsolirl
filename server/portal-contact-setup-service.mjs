import { createClient } from '@supabase/supabase-js'
import { createEnquiryReferenceId } from '../shared/document-templates.mjs'

const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

/**
 * One-time: save name, phone, assign account ref if missing, set portal_contact_completed_at.
 * @param {Record<string, unknown>} payload
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handlePortalContactSetup = async (payload = {}, env = process.env, meta = {}) => {
  const raw = typeof meta.authHeader === 'string' ? meta.authHeader.trim() : ''
  const token = raw.toLowerCase().startsWith('bearer ') ? raw.slice(7).trim() : ''

  if (!token) {
    throwStatus('Sign in required.', 401)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Server is not configured for profile updates.', 500)
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData?.user?.id) {
    throwStatus(userErr?.message ?? 'Invalid or expired session.', 401)
  }

  const userId = userData.user.id

  const { data: profile, error: profErr } = await admin
    .from('profiles')
    .select('id, portal_contact_completed_at, account_reference_id')
    .eq('id', userId)
    .maybeSingle()

  if (profErr) {
    throwStatus(profErr.message, 500)
  }
  if (!profile?.id) {
    throwStatus('Profile not found.', 404)
  }

  if (profile.portal_contact_completed_at) {
    throwStatus('Contact details are already saved for this account.', 409)
  }

  const fullName = typeof payload.fullName === 'string' ? payload.fullName.trim() : ''
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : ''

  if (!fullName) {
    throwStatus('Name is required.', 400)
  }
  if (!phone) {
    throwStatus('Phone is required.', 400)
  }

  const existingRef = typeof profile.account_reference_id === 'string' ? profile.account_reference_id.trim() : ''
  const accountRef = existingRef || createEnquiryReferenceId()
  const now = new Date().toISOString()

  const { error: upErr } = await admin
    .from('profiles')
    .update({
      full_name: fullName,
      phone,
      account_reference_id: accountRef,
      portal_contact_completed_at: now,
      portal_enquiry_autofill_disabled: false,
      updated_at: now
    })
    .eq('id', userId)

  if (upErr) {
    throwStatus(upErr.message, 500)
  }

  return { ok: true, accountReferenceId: accountRef }
}
