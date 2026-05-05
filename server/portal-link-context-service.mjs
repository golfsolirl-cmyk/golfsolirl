import { createHmac, timingSafeEqual } from 'node:crypto'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'

const VERSION = 1
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000

const throwStatus = (message, code = 400) => {
  const e = new Error(message)
  e.statusCode = code
  throw e
}

/**
 * Prefer PORTAL_LINK_SIGNING_SECRET; dev fallback uses first 64 chars of service role (set explicit secret in prod).
 * @param {Record<string, string | undefined>} env
 */
const signingSecret = (env) => {
  const explicit = env.PORTAL_LINK_SIGNING_SECRET?.trim()
  if (explicit) {
    return explicit
  }
  const svc = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (svc && svc.length >= 32) {
    return svc.slice(0, 64)
  }
  return ''
}

/**
 * @param {{ accountReferenceId: string; portal: 'client' | 'admin'; ttlMs?: number }} input
 * @param {Record<string, string | undefined>} env
 */
export const createPortalLoginCtx = (input, env = process.env) => {
  const secret = signingSecret(env)
  if (!secret) {
    throwStatus('PORTAL_LINK_SIGNING_SECRET (or Supabase service role for dev) is not configured.', 500)
  }

  const ar = typeof input.accountReferenceId === 'string' ? input.accountReferenceId.trim().toUpperCase().replace(/\s+/g, '') : ''
  if (!ar || ar.length > 64) {
    throwStatus('accountReferenceId is required.', 400)
  }

  const portal = input.portal === 'admin' ? 'admin' : 'client'
  const ttl = typeof input.ttlMs === 'number' && input.ttlMs > 0 ? Math.min(input.ttlMs, DEFAULT_TTL_MS) : DEFAULT_TTL_MS
  const exp = Date.now() + ttl

  const body = JSON.stringify({ v: VERSION, ar, portal, exp })
  const payload = Buffer.from(body, 'utf8').toString('base64url')
  const sig = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

/**
 * @param {string} token
 * @param {Record<string, string | undefined>} env
 * @returns {{ accountReferenceId: string; portal: 'client' | 'admin'; exp: number } | null}
 */
export const verifyPortalLoginCtx = (token, env = process.env) => {
  const secret = signingSecret(env)
  if (!secret || typeof token !== 'string' || token.length < 10) {
    return null
  }

  const dot = token.lastIndexOf('.')
  if (dot <= 0 || dot >= token.length - 1) {
    return null
  }

  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  const expectedSig = createHmac('sha256', secret).update(payload).digest('base64url')
  const a = Buffer.from(sig, 'utf8')
  const b = Buffer.from(expectedSig, 'utf8')
  try {
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null
    }
  } catch {
    return null
  }

  let parsed
  try {
    const json = Buffer.from(payload, 'base64url').toString('utf8')
    parsed = JSON.parse(json)
  } catch {
    return null
  }

  if (!parsed || parsed.v !== VERSION || typeof parsed.ar !== 'string' || typeof parsed.exp !== 'number') {
    return null
  }

  if (parsed.exp < Date.now()) {
    return null
  }

  const portal = parsed.portal === 'admin' ? 'admin' : 'client'
  const ar = String(parsed.ar).trim().toUpperCase().replace(/\s+/g, '')
  if (!ar) {
    return null
  }

  return { accountReferenceId: ar, portal, exp: parsed.exp }
}

/**
 * POST { ctx } — public verify for login page (no auth).
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 */
export const handlePortalLinkVerify = async (body, env = process.env) => {
  const ctx = typeof body?.ctx === 'string' ? body.ctx.trim() : ''
  if (!ctx) {
    throwStatus('ctx is required.', 400)
  }

  const verified = verifyPortalLoginCtx(ctx, env)
  if (!verified) {
    return { ok: false, message: 'Invalid or expired link.' }
  }

  return {
    ok: true,
    accountReferenceId: verified.accountReferenceId,
    portal: verified.portal,
    expiresAt: verified.exp
  }
}

/**
 * POST { accountReferenceId, portal?, siteOrigin? } — admin only; returns signed client/admin login URL.
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handlePortalLinkIssue = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const arRaw = typeof body?.accountReferenceId === 'string' ? body.accountReferenceId.trim() : ''
  const ar = arRaw.toUpperCase().replace(/\s+/g, '')
  if (!ar) {
    throwStatus('accountReferenceId is required.', 400)
  }

  const portal = body?.portal === 'admin' ? 'admin' : 'client'
  let siteOrigin = ''
  if (typeof body?.siteOrigin === 'string' && body.siteOrigin.trim().startsWith('http')) {
    siteOrigin = body.siteOrigin.trim().replace(/\/+$/, '')
  } else if (env.SITE_URL?.trim()) {
    const raw = env.SITE_URL.trim().replace(/\/+$/, '')
    siteOrigin = raw.startsWith('http') ? raw : `https://${raw.replace(/^\/+/, '')}`
  }

  if (!siteOrigin) {
    throwStatus('siteOrigin (full https URL) or SITE_URL is required to build the login URL.', 400)
  }

  const ctx = createPortalLoginCtx({ accountReferenceId: ar, portal }, env)
  const loginPath = portal === 'admin' ? '/dashboard/admin/login' : '/dashboard/login'
  const loginUrl = `${siteOrigin}${loginPath}?ctx=${encodeURIComponent(ctx)}`

  return { ok: true, loginUrl, ctx, portal, accountReferenceId: ar }
}
