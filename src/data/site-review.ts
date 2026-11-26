/**
 * Public review destination. Empty until Thomas sets TripAdvisor / Google.
 * Override at runtime via localStorage key `gsol-review-url` (admin desk).
 * Optional build-time: VITE_PUBLIC_REVIEW_URL
 */
export const SITE_REVIEW_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_REVIEW_URL?.trim()) || ''
