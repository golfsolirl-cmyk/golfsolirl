/** In-process sliding-window rate limiter (per serverless instance). Pair with email/IP keys for abuse resistance. */

const buckets = new Map()
let lastCleanup = 0

const parsePositiveInt = (value, fallback) => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

const cleanupStale = (now) => {
  if (now - lastCleanup < 60_000) {
    return
  }
  lastCleanup = now
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) {
      buckets.delete(key)
    }
  }
}

/**
 * @param {string} namespace
 * @param {string} key
 * @param {NodeJS.ProcessEnv} env
 * @param {{ max?: number; windowMs?: number; message?: string }} [opts]
 */
export const assertApiRateLimit = (namespace, key, env, opts = {}) => {
  if (env.API_RATE_LIMIT_DISABLE === '1' || env.API_RATE_LIMIT_DISABLE === 'true') {
    return
  }

  const max = opts.max ?? parsePositiveInt(env.API_RATE_LIMIT_DEFAULT_MAX, 10)
  const windowMs = opts.windowMs ?? parsePositiveInt(env.API_RATE_LIMIT_WINDOW_MS, 900_000)
  const now = Date.now()
  cleanupStale(now)

  const bucketKey = `${namespace}:${key || 'unknown'}`
  const bucket = buckets.get(bucketKey)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(bucketKey, { n: 1, resetAt: now + windowMs })
    return
  }

  if (bucket.n >= max) {
    const error = new Error(opts.message ?? 'Too many requests. Please wait a few minutes and try again.')
    error.statusCode = 429
    throw error
  }

  bucket.n += 1
}

export { parsePositiveInt }
