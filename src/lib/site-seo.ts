/** Production origin for absolute Open Graph / Twitter URLs (crawlers ignore relative paths). */
export const SITE_ORIGIN = 'https://golfsolirl.com' as const

/** Mercedes fleet + Costa del Sol — default link preview (1200×630). */
export const OG_IMAGE_FLEET_PATH = '/images/og-share-fleet.jpg' as const

/** GOLFSOL IRELAND crest lockup — alternate link preview (1200×630). */
export const OG_IMAGE_CREST_PATH = '/images/og-share-crest.jpg' as const

export const DEFAULT_OG_IMAGE_PATH = OG_IMAGE_FLEET_PATH

export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export const OG_IMAGE_FLEET_ALT =
  'Golf Sol Ireland — premium Mercedes fleet on the Costa del Sol with Irish and Spanish support.' as const

export const OG_IMAGE_CREST_ALT =
  'Golf Sol Ireland — premium Costa del Sol golf travel for Irish golfers.' as const

export const DEFAULT_OG_IMAGE_ALT = OG_IMAGE_FLEET_ALT

export function absoluteOgImageUrl(path: string = DEFAULT_OG_IMAGE_PATH): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE_ORIGIN}${clean}`
}
