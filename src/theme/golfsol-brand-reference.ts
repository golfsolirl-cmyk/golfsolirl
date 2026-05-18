/**
 * GolfSol Ireland — brand reference tokens (identity mockup / art direction).
 * Use with Tailwind `brand-*` utilities and optional `.ge-page--brand-reference` shell.
 *
 * Reference artwork (local): workspace `assets/c__Users_Thomas_...brand-63ec3e77-....png`
 */
export const BRAND_REFERENCE = {
  forest: 'rgb(11, 77, 59)',
  forestHex: '#0B4D3B',
  accent: 'rgb(19, 96, 71)',
  accentHex: '#136047',
  /** Header-only locked tone — do not use for section backgrounds. */
  headerCream: 'rgb(247, 244, 236)',
  headerCreamHex: '#F7F4EC',
  surface: 'rgb(238, 242, 239)',
  surfaceHex: '#EEF2EF',
  ink: 'rgb(8, 46, 35)',
  inkHex: '#08120d'
} as const

export type BrandReferenceKey = keyof typeof BRAND_REFERENCE
