import { createClient } from '@supabase/supabase-js'
import { createEnquiryReferenceId } from '../shared/document-templates.mjs'
import { computePhoneUniquenessKey } from './phone-e164.mjs'

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

  const updateDisplayNameOnly =
    payload.updateDisplayNameOnly === true ||
    payload.updateDisplayNameOnly === 'true' ||
    payload.mode === 'display_name_only'

  if (updateDisplayNameOnly) {
    if (!profile.portal_contact_completed_at) {
      throwStatus('Save your contact details once before updating your display name.', 400)
    }
    const displayName = typeof payload.fullName === 'string' ? payload.fullName.trim() : ''
    if (!displayName) {
      throwStatus('Name is required.', 400)
    }
    const now = new Date().toISOString()
    const { error: nameErr } = await admin
      .from('profiles')
      .update({ full_name: displayName, updated_at: now })
      .eq('id', userId)
    if (nameErr) {
      throwStatus(nameErr.message, 500)
    }
    return { ok: true, updated: 'display_name' }
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
  const phoneKey = computePhoneUniquenessKey(phone)
  /** @type {Record<string, string | null>} */
  let phoneE164Patch = {}
  if (phoneKey) {
    const { data: clashRows, error: clashErr } = await admin
      .from('profiles')
      .select('id')
      .eq('phone_e164', phoneKey)
      .neq('id', userId)
      .limit(1)
    const clashMsg = String(clashErr?.message ?? '').toLowerCase()
    if (clashErr && (clashMsg.includes('phone_e164') || clashMsg.includes('column'))) {
      phoneE164Patch = {}
    } else if (clashErr) {
      throwStatus(clashErr.message, 500)
    } else if (clashRows?.length) {
      throwStatus(
        'That phone number is already linked to another Golf Sol account. Sign in with that account or contact us if this is a mistake.',
        409
      )
    } else {
      phoneE164Patch = { phone_e164: phoneKey }
    }
  } else {
    phoneE164Patch = { phone_e164: null }
  }

  const baseUpdate = {
    full_name: fullName,
    phone,
    account_reference_id: accountRef,
    portal_contact_completed_at: now,
    portal_enquiry_autofill_disabled: false,
    updated_at: now
  }

  let { error: upErr } = await admin.from('profiles').update({ ...baseUpdate, ...phoneE164Patch }).eq('id', userId)

  if (upErr && phoneE164Patch.phone_e164 && String(upErr.message).toLowerCase().includes('phone_e164')) {
    const retry = await admin.from('profiles').update(baseUpdate).eq('id', userId)
    upErr = retry.error
  }

  if (upErr) {
    throwStatus(upErr.message, 500)
  }

  return { ok: true, accountReferenceId: accountRef }
}
