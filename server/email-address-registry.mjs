import { createEnquiryReferenceId } from '../shared/document-templates.mjs'

const normalizeEmail = (e) => (typeof e === 'string' ? e.trim().toLowerCase() : '')

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} sb service-role client
 * @param {string} email
 * @returns {Promise<string | null>} stable account_reference_id or null if email invalid
 */
export const ensureEmailAccountAnchor = async (sb, email) => {
  const em = normalizeEmail(email)
  if (!em || !em.includes('@')) {
    return null
  }

  const { data: existing, error: exErr } = await sb
    .from('email_account_anchors')
    .select('account_reference_id')
    .eq('email', em)
    .maybeSingle()

  if (exErr) {
    console.error('[email-address-registry] anchor select failed:', exErr.message)
    return null
  }
  if (existing?.account_reference_id) {
    return String(existing.account_reference_id)
  }

  const ref = createEnquiryReferenceId()
  const { error: insErr } = await sb.from('email_account_anchors').insert({
    email: em,
    account_reference_id: ref
  })

  if (!insErr) {
    return ref
  }

  if (String(insErr.code) === '23505') {
    const { data: again } = await sb.from('email_account_anchors').select('account_reference_id').eq('email', em).maybeSingle()
    if (again?.account_reference_id) {
      return String(again.account_reference_id)
    }
  }

  console.error('[email-address-registry] anchor insert failed:', insErr.message)
  return null
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {string} email
 */
export const isAuthEmailBlocked = async (sb, email) => {
  const em = normalizeEmail(email)
  if (!em || !em.includes('@')) {
    return false
  }
  const { data, error } = await sb.from('auth_email_blocks').select('email').eq('email', em).maybeSingle()
  if (error) {
    console.warn('[email-address-registry] block check failed:', error.message)
    return false
  }
  return Boolean(data?.email)
}
