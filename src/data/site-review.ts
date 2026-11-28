/**
 * Public review destination — Tripadvisor listing for Golf Sol Ireland.
 * Default: live Attraction_Review listing. Override at build time via
 * VITE_PUBLIC_REVIEW_URL / VITE_PUBLIC_TRIPADVISOR_URL, or at runtime via
 * localStorage key `gsol-review-url` (admin desk / Brand Kit).
 * Explicit empty override falls back to Tripadvisor search for “Golf Sol Ireland”.
 */
export {
  SITE_REVIEW_URL,
  TRIPADVISOR_DEFAULT_LISTING_URL,
  TRIPADVISOR_REVIEW_URL_STORAGE_KEY,
  TRIPADVISOR_SEARCH_FALLBACK_URL,
  clearReviewUrlLocalOverride,
  getTripadvisorListingHref,
  getTripadvisorSameAsUrl,
  getTripadvisorUrls,
  getTripadvisorWriteReviewHref,
  resolveTripadvisorUrls,
  writeReviewUrlLocalOverride
} from '../lib/tripadvisor'
