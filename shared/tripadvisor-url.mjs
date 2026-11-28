/**
 * Tripadvisor listing / write-review URL helpers.
 * Default listing is live (approved Nov 2026). Override via VITE_PUBLIC_REVIEW_URL /
 * VITE_PUBLIC_TRIPADVISOR_URL / admin localStorage. Search fallback only when emptied.
 * Never invent ratings, review counts, or awards.
 */

/** Confirmed public listing (Attraction_Review-g186605-d34845428). */
export const TRIPADVISOR_DEFAULT_LISTING_URL =
  'https://www.tripadvisor.com/Attraction_Review-g186605-d34845428-Reviews-Golf_Sol_Ireland-Dublin_County_Dublin.html'

/** Used only when the configured URL is explicitly emptied. */
export const TRIPADVISOR_SEARCH_FALLBACK_URL =
  'https://www.tripadvisor.ie/Search?q=Golf%20Sol%20Ireland'

export const TRIPADVISOR_REVIEW_URL_STORAGE_KEY = 'gsol-review-url'

/**
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeHttpUrl(value) {
  const raw = String(value ?? '').trim()
  if (!raw || !/^https?:\/\//i.test(raw)) return ''
  try {
    const u = new URL(raw)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return ''
    return u.href
  } catch {
    return ''
  }
}

/**
 * True when the URL looks like a Tripadvisor business listing (not a search page).
 * @param {string} url
 */
export function isTripadvisorListingUrl(url) {
  const normalized = normalizeHttpUrl(url)
  if (!normalized) return false
  try {
    const host = new URL(normalized).hostname.toLowerCase()
    if (!host.includes('tripadvisor.')) return false
    if (/\/Search(\?|$)/i.test(normalized)) return false
    return /-(g\d+)-(d\d+)/i.test(normalized) || /\/(Attraction|Hotel|Restaurant|ShowUserReviews)_Review-/i.test(normalized)
  } catch {
    return false
  }
}

/**
 * Convert a listing URL to Tripadvisor's write-review path when g/d IDs are present.
 * @param {string} listingUrl
 * @returns {string} write-review URL, or the listing URL if not derivable
 */
export function tripadvisorWriteReviewUrl(listingUrl) {
  const normalized = normalizeHttpUrl(listingUrl)
  if (!normalized) return TRIPADVISOR_SEARCH_FALLBACK_URL
  const match = normalized.match(/-(g\d+)-(d\d+)/i)
  if (!match) return normalized
  try {
    const { origin } = new URL(normalized)
    return `${origin}/UserReviewEdit-${match[1]}-${match[2]}`
  } catch {
    return normalized
  }
}

/**
 * Resolve configured listing vs search fallback.
 * Pass empty string to force the search fallback; omit / null / undefined uses the live default
 * when no override is supplied by the caller.
 * @param {string | null | undefined} configuredUrl
 * @param {{ allowDefault?: boolean }} [opts]
 * @returns {{
 *   configuredUrl: string
 *   listingUrl: string
 *   writeReviewUrl: string
 *   isConfiguredListing: boolean
 *   isSearchFallback: boolean
 * }}
 */
export function resolveTripadvisorUrls(configuredUrl, opts = {}) {
  const allowDefault = opts.allowDefault !== false
  const raw = configuredUrl == null ? '' : String(configuredUrl).trim()

  // Explicit empty string → search fallback (admin cleared the field).
  if (configuredUrl !== null && configuredUrl !== undefined && raw === '') {
    return {
      configuredUrl: '',
      listingUrl: TRIPADVISOR_SEARCH_FALLBACK_URL,
      writeReviewUrl: TRIPADVISOR_SEARCH_FALLBACK_URL,
      isConfiguredListing: false,
      isSearchFallback: true
    }
  }

  const configured = normalizeHttpUrl(raw) || (allowDefault ? TRIPADVISOR_DEFAULT_LISTING_URL : '')
  if (!configured) {
    return {
      configuredUrl: '',
      listingUrl: TRIPADVISOR_SEARCH_FALLBACK_URL,
      writeReviewUrl: TRIPADVISOR_SEARCH_FALLBACK_URL,
      isConfiguredListing: false,
      isSearchFallback: true
    }
  }

  const isListing = isTripadvisorListingUrl(configured)
  return {
    configuredUrl: configured === TRIPADVISOR_DEFAULT_LISTING_URL && !raw ? TRIPADVISOR_DEFAULT_LISTING_URL : configured,
    listingUrl: configured,
    writeReviewUrl: isListing ? tripadvisorWriteReviewUrl(configured) : configured,
    isConfiguredListing: isListing || Boolean(configured),
    isSearchFallback: false
  }
}

/**
 * Read the configured public review / Tripadvisor URL from env (server or Vite).
 * Returns '' when unset so callers can fall through to the live default.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined> | undefined} [env]
 */
export function readConfiguredReviewUrlFromEnv(env = typeof process !== 'undefined' ? process.env : {}) {
  const keys = [
    'VITE_PUBLIC_REVIEW_URL',
    'VITE_PUBLIC_TRIPADVISOR_URL',
    'PUBLIC_REVIEW_URL',
    'TRIPADVISOR_URL'
  ]
  for (const key of keys) {
    const value = normalizeHttpUrl(env?.[key])
    if (value) return value
  }
  return ''
}

/**
 * Effective listing resolution for server code: env override → live default.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined> | undefined} [env]
 */
export function resolveTripadvisorUrlsFromEnv(env = typeof process !== 'undefined' ? process.env : {}) {
  const fromEnv = readConfiguredReviewUrlFromEnv(env)
  // Env unset → default listing. Env set to empty string is not possible via env; use default.
  return resolveTripadvisorUrls(fromEnv || null)
}
