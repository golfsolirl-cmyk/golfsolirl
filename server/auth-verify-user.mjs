import { createClient } from '@supabase/supabase-js'

const extractBearer = (authHeader) =>
  typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : ''

/**
 * @param {string | undefined} authHeader
 * @param {Record<string, string | undefined>} env
 */
export const requireUserFromBearer = async (authHeader, env) => {
  const supabaseUrl = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const token = extractBearer(authHeader)

  if (!supabaseUrl || !serviceKey) {
    return { ok: false, message: 'Supabase is not configured on the server.', statusCode: 500 }
  }

  if (!token) {
    return { ok: false, message: 'Missing authorization.', statusCode: 401 }
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser(token)

  if (userError || !user) {
    return { ok: false, message: 'Invalid or expired session.', statusCode: 401 }
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileErr) {
    return { ok: false, message: 'Could not verify account.', statusCode: 500 }
  }

  return { ok: true, user, role: profile?.role ?? 'client' }
}
