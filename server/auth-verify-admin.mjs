import { createClient } from '@supabase/supabase-js'
import { isAllowedAdminLoginEmail, resolveAdminLoginEmail } from './admin-login-email.mjs'
import { adminConfigured, adminCookieFromHeader, verifySessionToken } from './admin-session.mjs'
import { activeRequestCookieHeader } from './auth-request-context.mjs'

/**
 * @param {string | undefined} authHeader
 * @param {Record<string, string | undefined>} env
 * @param {{ cookieHeader?: string }} [opts]
 * @returns {Promise<
 *   | { ok: true; user: import('@supabase/supabase-js').User | { id: string; email: string } }
 *   | { ok: false; message: string; statusCode: number }
 * >}
 */
export const requireAdminFromBearer = async (authHeader, env, opts = {}) => {
  const cookieHeader = opts.cookieHeader ?? activeRequestCookieHeader()
  if (adminConfigured(env)) {
    const adminCookie = adminCookieFromHeader(cookieHeader)
    if (verifySessionToken(adminCookie, env)) {
      const email = resolveAdminLoginEmail(env)
      return { ok: true, user: { id: 'admin-cookie-session', email } }
    }
  }

  const supabaseUrl = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : ''

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

  const userEmail = user.email?.trim().toLowerCase() ?? ''
  if (!isAllowedAdminLoginEmail(userEmail, env)) {
    return { ok: false, message: 'Only authorized operators can perform this action.', statusCode: 403 }
  }

  const { data: profile, error: profileErr } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (profileErr || profile?.role !== 'admin') {
    return { ok: false, message: 'Only admins can perform this action.', statusCode: 403 }
  }

  return { ok: true, user }
}
