/** Canonical crest paths: SVG (preferred in `<picture>`), WebP fallback, PNG for masks / export. */
export const GOLFSOL_BRAND_LOGO = {
  svg: '/golfsol-crest-brand.svg',
  webp: '/golfsol-crest-brand.webp',
  png: '/golfsol-crest-brand.png',
} as const

/** Natural pixel size of the raster crest (portrait). */
export const GOLFSOL_BRAND_LOGO_INTRINSIC = { width: 400, height: 600 } as const
