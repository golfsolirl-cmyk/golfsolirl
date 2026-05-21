import { assertApiRateLimit, parsePositiveInt } from './api-rate-limit.mjs'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { requireUserFromBearer } from './auth-verify-user.mjs'

/**
 * @param {import('http').IncomingMessage} req
 * @param {NodeJS.ProcessEnv} env
 * @param {(req: import('http').IncomingMessage) => string} getClientIp
 */
export const guardProposalPdfRequest = async (req, env, getClientIp) => {
  assertApiRateLimit('proposal-pdf', getClientIp(req), env, {
    max: parsePositiveInt(env.PDF_RATE_LIMIT_PER_WINDOW, 20),
    windowMs: parsePositiveInt(env.PDF_RATE_WINDOW_MS, 900_000),
    message: 'Too many PDF requests. Please wait and try again.'
  })

  const auth = await requireUserFromBearer(req.headers.authorization, env)
  if (!auth.ok) {
    const error = new Error(auth.message)
    error.statusCode = auth.statusCode
    throw error
  }

  return auth
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {NodeJS.ProcessEnv} env
 * @param {(req: import('http').IncomingMessage) => string} getClientIp
 */
export const guardHomepageClientPdfRequest = async (req, env, getClientIp) => {
  assertApiRateLimit('homepage-client-pdf', getClientIp(req), env, {
    max: parsePositiveInt(env.PDF_RATE_LIMIT_PER_WINDOW, 10),
    windowMs: parsePositiveInt(env.PDF_RATE_WINDOW_MS, 900_000),
    message: 'Too many PDF requests. Please wait and try again.'
  })

  const auth = await requireAdminFromBearer(req.headers.authorization, env)
  if (!auth.ok) {
    const error = new Error(auth.message)
    error.statusCode = auth.statusCode
    throw error
  }

  return auth
}
