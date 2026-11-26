/**
 * Admin HMAC cookie session (gsol_admin) — mirrors TOW session.ts using Node crypto.
 * Requires ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET (≥ 32 chars).
 */
import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE = 'gsol_admin'
export const SESSION_SECONDS = 60 * 60 * 24 * 7

const b64url = (buf) => Buffer.from(buf).toString('base64url')

/** @param {string} a @param {string} b */
export const safeEqual = (a, b) => {
  if (a.length !== b.length) {
    return false
  }
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

/** @param {string} s */
export const sha256 = (s) => b64url(createHash('sha256').update(s).digest())

/** @param {Record<string, string | undefined>} [env] */
export const adminConfigured = (env = process.env) =>
  Boolean(
    env.ADMIN_EMAIL?.trim() &&
      env.ADMIN_PASSWORD &&
      env.ADMIN_SESSION_SECRET &&
      env.ADMIN_SESSION_SECRET.length >= 32
  )

/** @param {string} data @param {string} secret */
const sign = (data, secret) => b64url(createHmac('sha256', secret).update(data).digest())

/** @param {Record<string, string | undefined>} [env] */
export const createSessionToken = (env = process.env) => {
  const secret = env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET is not configured.')
  }
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS
  const nonce = b64url(randomBytes(12))
  const body = `${exp}.${nonce}`
  return `${body}.${sign(body, secret)}`
}

/**
 * @param {string | undefined} token
 * @param {Record<string, string | undefined>} [env]
 */
export const verifySessionToken = (token, env = process.env) => {
  const secret = env.ADMIN_SESSION_SECRET
  if (!token || !secret || secret.length < 32) {
    return false
  }
  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }
  const [exp, nonce, sig] = parts
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) {
    return false
  }
  return safeEqual(sig, sign(`${exp}.${nonce}`, secret))
}

/** @param {string} input @param {Record<string, string | undefined>} [env] */
export const passwordMatches = (input, env = process.env) => {
  const pw = env.ADMIN_PASSWORD
  if (!pw) {
    return false
  }
  return safeEqual(sha256(input), sha256(pw))
}

/** @param {string} input @param {Record<string, string | undefined>} [env] */
export const emailMatches = (input, env = process.env) => {
  const expected = env.ADMIN_EMAIL?.trim().toLowerCase()
  if (!expected) {
    return false
  }
  return safeEqual(sha256(input.trim().toLowerCase()), sha256(expected))
}

/** @param {string | undefined} cookieHeader */
export const parseCookies = (cookieHeader) => {
  /** @type {Record<string, string>} */
  const out = {}
  if (typeof cookieHeader !== 'string' || !cookieHeader.trim()) {
    return out
  }
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf('=')
    if (eq <= 0) {
      continue
    }
    const key = trimmed.slice(0, eq)
    const val = trimmed.slice(eq + 1)
    try {
      out[key] = decodeURIComponent(val)
    } catch {
      out[key] = val
    }
  }
  return out
}

export const adminCookieFromHeader = (cookieHeader) => parseCookies(cookieHeader)[ADMIN_COOKIE]

/**
 * @param {boolean} [clear]
 * @param {Record<string, string | undefined>} [env]
 */
export const adminSetCookieHeader = (clear = false, env = process.env) => {
  const secure =
    String(env.NODE_ENV ?? '').toLowerCase() === 'production' && env.PORTAL_LOCAL_TEST !== '1'
  if (clear) {
    return [
      `${ADMIN_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict`,
      secure ? `${ADMIN_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict; Secure` : null
    ].filter(Boolean)
  }
  const token = createSessionToken(env)
  const base = `${ADMIN_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Max-Age=${SESSION_SECONDS}; SameSite=Strict`
  return secure ? `${base}; Secure` : base
}

const loginAttempts = new Map()
const LOCK_WINDOW_MS = 15 * 60_000
const LOCK_MAX = 8

/** @param {string} ip */
const pruneAttempts = (ip) => {
  const now = Date.now()
  const arr = (loginAttempts.get(ip) ?? []).filter((t) => now - t < LOCK_WINDOW_MS)
  loginAttempts.set(ip, arr)
  return arr
}

/** @param {string} ip */
export const adminLoginLocked = (ip) => pruneAttempts(ip).length >= LOCK_MAX

/** @param {string} ip */
export const noteAdminLoginFail = (ip) => {
  pruneAttempts(ip).push(Date.now())
}

/** @param {string} ip */
export const clearAdminLoginAttempts = (ip) => {
  loginAttempts.delete(ip)
}

const throwStatus = (message, statusCode, code) => {
  const err = new Error(message)
  err.statusCode = statusCode
  if (code) {
    err.code = code
  }
  throw err
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ clientIp?: string }} [runtime]
 */
export const handleAdminLogin = async (body, env = process.env, runtime = {}) => {
  if (!adminConfigured(env)) {
    throwStatus('Admin password login is not configured.', 503, 'ADMIN_NOT_CONFIGURED')
  }
  const ip = runtime.clientIp ?? 'unknown'
  if (adminLoginLocked(ip)) {
    throwStatus('Too many failed attempts. Try again in about 15 minutes.', 429, 'ADMIN_LOCKED')
  }

  const email = typeof body?.email === 'string' ? body.email : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  const emailOk = emailMatches(email, env)
  const passOk = passwordMatches(password, env)

  if (!emailOk || !passOk) {
    noteAdminLoginFail(ip)
    await new Promise((r) => setTimeout(r, 600))
    throwStatus('Email or password is not correct.', 401, 'ADMIN_WRONG')
  }

  clearAdminLoginAttempts(ip)
  return {
    ok: true,
    setCookie: adminSetCookieHeader(false, env)
  }
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {{ cookieHeader?: string }} [runtime]
 */
export const handleAdminSessionCheck = (env = process.env, runtime = {}) => {
  if (!adminConfigured(env)) {
    return { ok: false, configured: false }
  }
  const token = adminCookieFromHeader(runtime.cookieHeader)
  const valid = verifySessionToken(token, env)
  return { ok: valid, configured: true }
}

/**
 * @param {NodeJS.ProcessEnv} env
 */
export const handleAdminLogout = (env = process.env) => ({
  ok: true,
  setCookie: adminSetCookieHeader(true, env)
})