/**
 * Client Tripadvisor / public review URL helpers.
 * Default: live Golf Sol Ireland listing. Override via VITE_PUBLIC_REVIEW_URL /
 * VITE_PUBLIC_TRIPADVISOR_URL, or localStorage `gsol-review-url` (admin / Brand Kit).
 * Explicit empty override → Tripadvisor search fallback.
 */
// @ts-ignore Shared runtime module lives outside src (see shared/tripadvisor-url.mjs)
import * as ta from '../../shared/tripadvisor-url.mjs'

export type TripadvisorResolvedUrls = {
  configuredUrl: string
  listingUrl: string
  writeReviewUrl: string
  isConfiguredListing: boolean
  isSearchFallback: boolean
}

export const TRIPADVISOR_DEFAULT_LISTING_URL: string = ta.TRIPADVISOR_DEFAULT_LISTING_URL
export const TRIPADVISOR_SEARCH_FALLBACK_URL: string = ta.TRIPADVISOR_SEARCH_FALLBACK_URL
export const TRIPADVISOR_REVIEW_URL_STORAGE_KEY: string = ta.TRIPADVISOR_REVIEW_URL_STORAGE_KEY

export const normalizeHttpUrl = (value: unknown): string => ta.normalizeHttpUrl(value)
export const isTripadvisorListingUrl = (url: string): boolean => ta.isTripadvisorListingUrl(url)
export const tripadvisorWriteReviewUrl = (listingUrl: string): string =>
  ta.tripadvisorWriteReviewUrl(listingUrl)
export const resolveTripadvisorUrls = (
  configuredUrl: string | null | undefined,
  opts?: { allowDefault?: boolean }
): TripadvisorResolvedUrls => ta.resolveTripadvisorUrls(configuredUrl, opts)

function envConfiguredReviewUrl(): string {
  if (typeof import.meta === 'undefined') return ''
  const fromReview = normalizeHttpUrl(import.meta.env?.VITE_PUBLIC_REVIEW_URL)
  if (fromReview) return fromReview
  return normalizeHttpUrl(import.meta.env?.VITE_PUBLIC_TRIPADVISOR_URL)
}

/**
 * Build-time public review URL when env is set; otherwise the live listing default.
 */
export const SITE_REVIEW_URL = envConfiguredReviewUrl() || TRIPADVISOR_DEFAULT_LISTING_URL

type LocalOverride = { present: boolean; value: string }

function readLocalOverride(): LocalOverride {
  if (typeof window === 'undefined') return { present: false, value: '' }
  try {
    const raw = window.localStorage.getItem(TRIPADVISOR_REVIEW_URL_STORAGE_KEY)
    if (raw === null) return { present: false, value: '' }
    return { present: true, value: String(raw).trim() }
  } catch {
    return { present: false, value: '' }
  }
}

export function readReviewUrlLocalOverride(): string {
  const override = readLocalOverride()
  if (!override.present) return ''
  return normalizeHttpUrl(override.value)
}

export function writeReviewUrlLocalOverride(url: string): void {
  if (typeof window === 'undefined') return
  try {
    const next = String(url ?? '').trim()
    if (!next) {
      window.localStorage.setItem(TRIPADVISOR_REVIEW_URL_STORAGE_KEY, '')
      return
    }
    window.localStorage.setItem(TRIPADVISOR_REVIEW_URL_STORAGE_KEY, next)
  } catch {
    /* private mode */
  }
}

export function clearReviewUrlLocalOverride(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(TRIPADVISOR_REVIEW_URL_STORAGE_KEY)
  } catch {
    /* private mode */
  }
}

function effectiveConfiguredRaw(): string | null {
  const local = readLocalOverride()
  if (local.present) return local.value
  const fromEnv = envConfiguredReviewUrl()
  if (fromEnv) return fromEnv
  return null
}

export function getTripadvisorUrls(): TripadvisorResolvedUrls {
  return resolveTripadvisorUrls(effectiveConfiguredRaw())
}

export function getTripadvisorListingHref(): string {
  return getTripadvisorUrls().listingUrl
}

export function getTripadvisorWriteReviewHref(): string {
  return getTripadvisorUrls().writeReviewUrl
}

/** Real listing URL only — for Organization sameAs (never the search fallback). */
export function getTripadvisorSameAsUrl(): string | null {
  const resolved = getTripadvisorUrls()
  if (resolved.isSearchFallback) return null
  if (!isTripadvisorListingUrl(resolved.listingUrl)) return null
  return resolved.listingUrl
}
