/**
 * Canonical brand lockup — shield crest (Ireland + Spain flags).
 * All web + email logo URLs use the hosted PNG on golfsolirl.com.
 * Local `GOLFSOL_BRAND_LOGO_SOURCE` remains for same-origin / disk paths where needed.
 */
export const GOLFSOL_BRAND_LOGO_SOURCE = '/images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png' as const

export const GOLFSOL_BRAND_LOGO_HOSTED =
  'https://golfsolirl.com/images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png' as const

export const GOLFSOL_BRAND_LOGO = {
  /** Legacy key — always the hosted crest PNG (replaces gsirl.webp). */
  webp: GOLFSOL_BRAND_LOGO_HOSTED,
  png: GOLFSOL_BRAND_LOGO_HOSTED,
  svg: GOLFSOL_BRAND_LOGO_HOSTED,
} as const

/** Natural pixel size of the crest raster. */
export const GOLFSOL_BRAND_LOGO_INTRINSIC = { width: 1254, height: 1254 } as const

/** Server-side PDF / Node reads (same file as web `png`). */
export const GOLFSOL_BRAND_LOGO_FILENAME = 'gsirl.png' as const

/** Responsive `sizes` for sticky header crest (layout px × ~2 for retina). */
export const GOLFSOL_BRAND_LOGO_HEADER_SIZES =
  '(max-width: 639px) 124px, (max-width: 1023px) 132px, 148px' as const

/** Responsive `sizes` for footer crest. */
export const GOLFSOL_BRAND_LOGO_FOOTER_SIZES = '(max-width: 639px) 320px, 360px' as const
