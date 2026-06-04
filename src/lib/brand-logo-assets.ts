/**

 * Canonical brand lockup — shield crest (Ireland + Spain flags).

 * Site chrome (header/footer) uses transparent crest PNG + WebP.

 */

export const GOLFSOL_BRAND_LOGO_SOURCE =

  '/images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png' as const



export const GOLFSOL_BRAND_LOGO_HOSTED =

  'https://www.golfsolirl.com/images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png' as const



/** Same-origin crest for Vite / local dev (always works offline). */

export function brandLogoAssetUrl(path: string = GOLFSOL_BRAND_LOGO.png): string {

  const clean = path.replace(/^\//, '')

  const base = import.meta.env.BASE_URL ?? '/'

  const prefix = base.endsWith('/') ? base : `${base}/`

  return `${prefix}${clean}`

}



export const GOLFSOL_BRAND_LOGO = {

  webp: '/images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.webp',

  png: '/images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png',

  /** Raster used anywhere legacy code expected an SVG path. */

  svg: '/images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png',

} as const



/** Natural pixel size of the crest raster. */

export const GOLFSOL_BRAND_LOGO_INTRINSIC = { width: 1254, height: 1254 } as const



/** Server-side PDF / Node reads (same file as web `png`). */

export const GOLFSOL_BRAND_LOGO_FILENAME = 'newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png' as const



/** Responsive `sizes` for sticky header crest (layout px × ~2 for retina). */

export const GOLFSOL_BRAND_LOGO_HEADER_SIZES =

  '(max-width: 639px) 124px, (max-width: 1023px) 132px, 148px' as const



/** Responsive `sizes` for footer crest. */

export const GOLFSOL_BRAND_LOGO_FOOTER_SIZES = '(max-width: 639px) 320px, 360px' as const

