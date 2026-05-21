import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export const generateReviewToken = () => randomBytes(24).toString('hex')

const reviewPepper = (env) =>
  env.REVIEW_TOKEN_PEPPER?.trim() ||
  env.SUPABASE_SERVICE_ROLE_KEY?.trim()?.slice(0, 32) ||
  'gsol-review-token-pepper'

/** @param {string} token @param {NodeJS.ProcessEnv} env */
export const hashReviewToken = (token, env) =>
  createHash('sha256').update(`${token}${reviewPepper(env)}`).digest('hex')

/**
 * Supports legacy plaintext tokens already stored in `review_token_hash`.
 * @param {string} token
 * @param {string | null | undefined} stored
 * @param {NodeJS.ProcessEnv} env
 */
export const verifyReviewToken = (token, stored, env) => {
  if (!token || !stored) {
    return false
  }

  if (stored === token) {
    return true
  }

  const expected = hashReviewToken(token, env)
  if (stored.length !== expected.length) {
    return false
  }

  try {
    return timingSafeEqual(Buffer.from(stored, 'utf8'), Buffer.from(expected, 'utf8'))
  } catch {
    return false
  }
}
