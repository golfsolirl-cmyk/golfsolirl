import { createClient } from '@supabase/supabase-js'

/**
 * Returns the signed-in user's profile using the service role (bypasses broken client RLS
 * when `is_admin()` is not executable by `authenticated`).
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleProfileMe = async (env = process.env, meta = {}) => {
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
    const err = new Error('Server is not configured for profile lookup.')
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

  const userId = userData.user.id
  const { data: profile, error: profErr } = await admin.from('profiles').select('*').eq('id', userId).maybeSingle()

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

  return { profile }
}
