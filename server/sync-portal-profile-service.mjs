import { createClient } from '@supabase/supabase-js'
import { ensureEmailAccountAnchor } from './email-address-registry.mjs'
import { computePhoneUniquenessKey } from './phone-e164.mjs'

/**
 * Fills empty profiles.full_name / profiles.phone from the latest enquiry with the same email.
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleSyncPortalProfile = async (env = process.env, meta = {}) => {
  const raw = typeof meta.authHeader === 'string' ? meta.authHeader.trim() : ''
  const token = raw.toLowerCase().startsWith('bearer ') ? raw.slice(7).trim() : ''

  if (!token) {
    const err = new Error('Sign in required.')
    err.statusCode = 401
    throw err
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    const err = new Error('Server is not configured for profile sync.')
    err.statusCode = 500
    throw err
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData?.user?.id) {
    const err = new Error(userErr?.message ?? 'Invalid or expired session.')
    err.statusCode = 401
    throw err
  }

  const user = userData.user
  const email = (user.email ?? '').trim().toLowerCase()
  if (!email) {
    return { ok: true, updated: false }
  }

  const { data: profile, error: profErr } = await admin
    .from('profiles')
    .select('id, full_name, phone, account_reference_id, portal_contact_completed_at, portal_enquiry_autofill_disabled')
    .eq('id', user.id)
    .maybeSingle()

  if (profErr) {
    const err = new Error(profErr.message)
    err.statusCode = 500
    throw err
  }

  if (!profile) {
    const err = new Error('Profile not found.')
    err.statusCode = 404
    throw err
  }

  let updated = false

  const existingRef = String(profile.account_reference_id ?? '').trim()
  if (!existingRef) {
    const anchorRef = await ensureEmailAccountAnchor(admin, email)
    if (anchorRef) {
      const { error: anchorErr } = await admin
        .from('profiles')
        .update({ account_reference_id: anchorRef, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (anchorErr) {
        const err = new Error(anchorErr.message)
        err.statusCode = 500
        throw err
      }
      updated = true
    }
  }

  if (profile.portal_contact_completed_at) {
    return { ok: true, updated }
  }

  if (profile.portal_enquiry_autofill_disabled) {
    return { ok: true, updated }
  }

  const needsName = !String(profile.full_name ?? '').trim()
  const needsPhone = !String(profile.phone ?? '').trim()
  if (!needsName && !needsPhone) {
    return { ok: true, updated }
  }

  const { data: enquiryRows, error: enqErr } = await admin
    .from('enquiries')
    .select('full_name, phone_whatsapp')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)

  if (enqErr) {
    const err = new Error(enqErr.message)
    err.statusCode = 500
    throw err
  }

  const enquiry = enquiryRows?.[0]
  if (!enquiry) {
    return { ok: true, updated }
  }

  /** @type {Record<string, string>} */
  const patch = {}
  if (needsName && typeof enquiry.full_name === 'string' && enquiry.full_name.trim()) {
    patch.full_name = enquiry.full_name.trim()
  }
  if (needsPhone && typeof enquiry.phone_whatsapp === 'string' && enquiry.phone_whatsapp.trim()) {
    const trimmedPhone = enquiry.phone_whatsapp.trim()
    const pk = computePhoneUniquenessKey(trimmedPhone)
    if (pk) {
      const { data: clashRows, error: clashErr } = await admin
        .from('profiles')
        .select('id')
        .eq('phone_e164', pk)
        .neq('id', user.id)
        .limit(1)
      if (!clashErr && clashRows?.length) {
        // Another account already owns this number — skip autofill so sync stays non-destructive.
      } else {
        patch.phone = trimmedPhone
        patch.phone_e164 = pk
      }
    } else {
      patch.phone = trimmedPhone
    }
  }

  if (Object.keys(patch).length === 0) {
    return { ok: true, updated }
  }

  patch.updated_at = new Date().toISOString()

  const { error: upErr } = await admin.from('profiles').update(patch).eq('id', user.id)
  if (upErr) {
    const err = new Error(upErr.message)
    err.statusCode = 500
    throw err
  }

  return { ok: true, updated: true }
}
