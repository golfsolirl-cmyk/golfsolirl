/** Canonical operator inbox for `/dashboard/admin/login` (override with ADMIN_LOGIN_EMAIL). */
export const DEFAULT_ADMIN_LOGIN_EMAIL = 'info@golfsolirl.com'

export const resolveAdminLoginEmail = (env = process.env) => {
  const raw = env.ADMIN_LOGIN_EMAIL?.trim().toLowerCase()
  return raw || DEFAULT_ADMIN_LOGIN_EMAIL
}

export const isAllowedAdminLoginEmail = (email, env = process.env) => {
  const allowed = resolveAdminLoginEmail(env)
  const normalized = String(email ?? '').trim().toLowerCase()
  return Boolean(normalized) && normalized === allowed
}

/**
 * Enforce one admin profile row: demote every other admin, promote the operator inbox.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase service role
 * @param {string} email normalized operator email
 * @param {string | undefined} userId auth user id when known
 */
export const ensureSingleAdminProfile = async (supabase, email, userId) => {
  const adminEmail = String(email ?? '').trim().toLowerCase()
  if (!adminEmail) {
    return
  }

  const now = new Date().toISOString()

  await supabase.from('profiles').update({ role: 'client', updated_at: now }).eq('role', 'admin')

  if (userId) {
    const { data: existing } = await supabase.from('profiles').select('id, full_name').eq('id', userId).maybeSingle()
    await supabase.from('profiles').upsert(
      {
        id: userId,
        email: adminEmail,
        role: 'admin',
        full_name: existing?.full_name?.trim() || 'Golf Sol Admin',
        updated_at: now
      },
      { onConflict: 'id' }
    )
    return
  }

  const { data: byEmail } = await supabase.from('profiles').select('id, full_name').ilike('email', adminEmail).maybeSingle()
  if (byEmail?.id) {
    await supabase
      .from('profiles')
      .update({
        role: 'admin',
        email: adminEmail,
        full_name: byEmail.full_name?.trim() || 'Golf Sol Admin',
        updated_at: now
      })
      .eq('id', byEmail.id)
  }
}
