export const TRIPADVISOR_DEFAULT_LISTING_URL: string
export const TRIPADVISOR_SEARCH_FALLBACK_URL: string
export const TRIPADVISOR_REVIEW_URL_STORAGE_KEY: string

export function normalizeHttpUrl(value: unknown): string
export function isTripadvisorListingUrl(url: string): boolean
export function tripadvisorWriteReviewUrl(listingUrl: string): string

export type TripadvisorResolvedUrls = {
  configuredUrl: string
  listingUrl: string
  writeReviewUrl: string
  isConfiguredListing: boolean
  isSearchFallback: boolean
}

export function resolveTripadvisorUrls(
  configuredUrl: string | null | undefined,
  opts?: { allowDefault?: boolean }
): TripadvisorResolvedUrls

export function readConfiguredReviewUrlFromEnv(
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>
): string

export function resolveTripadvisorUrlsFromEnv(
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>
): TripadvisorResolvedUrls
