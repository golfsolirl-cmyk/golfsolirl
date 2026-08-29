/**
 * Google OAuth for Gmail (readonly + send). Tokens stored encrypted; never returned to the client.
 */
import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { encryptSecret, decryptSecret, hasOauthEncryptionKey, randomNonce, signOauthState, verifyOauthState } from './oauth-token-crypto.mjs'
import { getGsolSiteUrl } from './site-url.mjs'

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send'
]

export const GMAIL_OAUTH_COOKIE = 'gsol_gmail_oauth'

const throwStatus = (message, statusCode, code) => {
  const err = new Error(message)
  err.statusCode = statusCode
  if (code) err.code = code
  throw err
}

const getAdminDb = (env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throwStatus('Supabase is not configured on the server.', 500)
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const isMissingTable = (error) => {
  const code = error?.code
  const msg = String(error?.message ?? '')
  return code === '42P01' || /email_accounts/i.test(msg)
}

const tableMissingMessage =
  'Gmail is not installed yet. Run supabase/run-in-sql-editor-admin-mail.sql in the Supabase SQL editor, then try again.'

export const googleRedirectUri = (env) => {
  const explicit = env.GOOGLE_REDIRECT_URI?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const site = getGsolSiteUrl()
  return `${site}/api/gmail-oauth-callback`
}

const googleClientId = (env) => env.GOOGLE_CLIENT_ID?.trim() ?? ''
const googleClientSecret = (env) => env.GOOGLE_CLIENT_SECRET?.trim() ?? ''

const requireGoogleApp = (env) => {
  if (!googleClientId(env) || !googleClientSecret(env)) {
    throwStatus('Gmail is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.', 500)
  }
  if (!hasOauthEncryptionKey(env)) {
    throwStatus(
      'Gmail token encryption is not configured. Set OAUTH_TOKEN_ENCRYPTION_KEY to a 32+ character secret.',
      500
    )
  }
}

const oauthCookieFlags = (env, maxAgeSeconds) => {
  const redirect = googleRedirectUri(env)
  const secure = !/^http:\/\/localhost\b/i.test(redirect)
  const parts = [
    `${GMAIL_OAUTH_COOKIE}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`
  ]
  if (secure) parts.splice(3, 0, 'Secure')
  return parts
}

export const buildOauthCookie = (nonce, env) => {
  const flags = oauthCookieFlags(env, 600)
  flags[0] = `${GMAIL_OAUTH_COOKIE}=${encodeURIComponent(nonce)}`
  return flags.join('; ')
}

export const clearOauthCookie = (env) => {
  const flags = oauthCookieFlags(env, 0)
  flags[0] = `${GMAIL_OAUTH_COOKIE}=`
  return flags.join('; ')
}

export const readCookieValue = (cookieHeader, name) => {
  const raw = String(cookieHeader ?? '')
  const parts = raw.split(';')
  for (const part of parts) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    if (trimmed.slice(0, eq) === name) {
      return decodeURIComponent(trimmed.slice(eq + 1))
    }
  }
  return ''
}

const adminRedirectBase = (env) => {
  const redirect = googleRedirectUri(env)
  try {
    return new URL(redirect).origin
  } catch {
    return getGsolSiteUrl()
  }
}

export const adminMailDashboardUrl = (env, query) => {
  const q = new URLSearchParams(query)
  return `${adminRedirectBase(env)}/dashboard/admin?${q.toString()}`
}

/**
 * @param {unknown} _body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleGmailOauthStart = async (_body, env = process.env, meta = {}) => {
  requireGoogleApp(env)
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const nonce = randomNonce()
  const state = signOauthState(
    { uid: auth.user.id, nonce, exp: Date.now() + 10 * 60 * 1000 },
    env
  )
  const params = new URLSearchParams({
    client_id: googleClientId(env),
    redirect_uri: googleRedirectUri(env),
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'false',
    state
  })
  return {
    ok: true,
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    setCookie: buildOauthCookie(nonce, env)
  }
}

const exchangeCode = async (code, env) => {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: googleClientId(env),
      client_secret: googleClientSecret(env),
      redirect_uri: googleRedirectUri(env),
      grant_type: 'authorization_code'
    })
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.access_token) {
    throwStatus('Gmail could not complete the connection. Try Connect Gmail again.', 400)
  }
  return json
}

const gmailProfileEmail = async (accessToken) => {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    return ''
  }
  return typeof json.emailAddress === 'string' ? json.emailAddress.trim() : ''
}

/**
 * Google redirects here (no Bearer token). State is HMAC-signed with the admin user id.
 * @param {{ code?: string, state?: string, error?: string, cookieHeader?: string }} query
 * @param {NodeJS.ProcessEnv} env
 */
export const handleGmailOauthCallback = async (query, env = process.env) => {
  const fail = (reason) => ({
    redirectTo: adminMailDashboardUrl(env, { mail: 'error', reason }),
    setCookie: clearOauthCookie(env)
  })

  if (query.error) {
    return fail(query.error === 'access_denied' ? 'denied' : 'oauth')
  }

  try {
    requireGoogleApp(env)
  } catch {
    return fail('config')
  }

  const code = typeof query.code === 'string' ? query.code.trim() : ''
  const state = typeof query.state === 'string' ? query.state.trim() : ''
  if (!code || !state) {
    return fail('missing_code')
  }

  let parsed
  try {
    parsed = verifyOauthState(state, env)
  } catch {
    return fail('invalid_state')
  }

  const cookieNonce = readCookieValue(query.cookieHeader, GMAIL_OAUTH_COOKIE)
  if (cookieNonce && cookieNonce !== parsed.nonce) {
    return fail('invalid_state')
  }

  let tokens
  try {
    tokens = await exchangeCode(code, env)
  } catch {
    return fail('token_failed')
  }

  const access = String(tokens.access_token ?? '')
  const refresh = String(tokens.refresh_token ?? '')
  const expiresIn = Number(tokens.expires_in) || 3600
  const scopes = typeof tokens.scope === 'string' ? tokens.scope : GMAIL_SCOPES.join(' ')
  const emailAddress = await gmailProfileEmail(access)

  const db = getAdminDb(env)
  const { data: existing } = await db
    .from('email_accounts')
    .select('refresh_token_encrypted')
    .eq('user_id', parsed.uid)
    .eq('provider', 'gmail')
    .maybeSingle()

  let refreshPacked
  if (refresh) {
    refreshPacked = encryptSecret(refresh, env)
  } else if (existing?.refresh_token_encrypted) {
    refreshPacked = existing.refresh_token_encrypted
  } else {
    return fail('token_failed')
  }

  const row = {
    user_id: parsed.uid,
    provider: 'gmail',
    email_address: emailAddress,
    access_token_encrypted: encryptSecret(access, env),
    refresh_token_encrypted: refreshPacked,
    token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    scopes,
    updated_at: new Date().toISOString()
  }

  const { error } = await db.from('email_accounts').upsert(row, { onConflict: 'user_id,provider' })
  if (error) {
    if (isMissingTable(error)) {
      return fail('setup')
    }
    console.error('[gmail-oauth] upsert failed', error.message)
    return fail('save_failed')
  }

  return {
    redirectTo: adminMailDashboardUrl(env, { mail: 'connected' }),
    setCookie: clearOauthCookie(env)
  }
}

export const loadGmailAccount = async (userId, env) => {
  const db = getAdminDb(env)
  const { data, error } = await db
    .from('email_accounts')
    .select(
      'id, user_id, provider, email_address, access_token_encrypted, refresh_token_encrypted, token_expires_at, scopes, updated_at'
    )
    .eq('user_id', userId)
    .eq('provider', 'gmail')
    .maybeSingle()

  if (error) {
    if (isMissingTable(error)) {
      throwStatus(tableMissingMessage, 500)
    }
    throwStatus('Unable to load the Gmail connection.', 500)
  }
  return data
}

const saveAccessToken = async (accountId, accessToken, expiresIn, env) => {
  const db = getAdminDb(env)
  await db
    .from('email_accounts')
    .update({
      access_token_encrypted: encryptSecret(accessToken, env),
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', accountId)
}

export const refreshGmailAccessToken = async (account, env) => {
  requireGoogleApp(env)
  const refreshToken = decryptSecret(account.refresh_token_encrypted, env)
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: googleClientId(env),
      client_secret: googleClientSecret(env),
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.access_token) {
    const err = new Error('Your Gmail connection has expired. Reconnect Gmail.')
    err.statusCode = 401
    err.code = 'GMAIL_RECONNECT'
    throw err
  }
  const expiresIn = Number(json.expires_in) || 3600
  await saveAccessToken(account.id, json.access_token, expiresIn, env)
  return json.access_token
}

export const getValidGmailAccessToken = async (account, env) => {
  const expires = account.token_expires_at ? Date.parse(account.token_expires_at) : 0
  const stillValid = Number.isFinite(expires) && expires - 60_000 > Date.now()
  if (stillValid) {
    return decryptSecret(account.access_token_encrypted, env)
  }
  return refreshGmailAccessToken(account, env)
}

export const publicGmailStatus = (account, env) => ({
  connected: Boolean(account),
  emailAddress: account?.email_address || '',
  scopes: account?.scopes || '',
  sendEnabled: String(env.EMAIL_SEND_ENABLED ?? '').trim().toLowerCase() === 'true',
  googleConfigured: Boolean(googleClientId(env) && googleClientSecret(env) && hasOauthEncryptionKey(env))
})

export const disconnectGmail = async (userId, env) => {
  requireGoogleApp(env)
  const account = await loadGmailAccount(userId, env)
  if (account?.refresh_token_encrypted) {
    try {
      const refresh = decryptSecret(account.refresh_token_encrypted, env)
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: refresh })
      })
    } catch (error) {
      console.error('[gmail-oauth] revoke failed', error instanceof Error ? error.message : error)
    }
  }
  const db = getAdminDb(env)
  const { error } = await db.from('email_accounts').delete().eq('user_id', userId).eq('provider', 'gmail')
  if (error && !isMissingTable(error)) {
    throwStatus('Unable to disconnect Gmail.', 500)
  }
  return { ok: true, connected: false }
}
