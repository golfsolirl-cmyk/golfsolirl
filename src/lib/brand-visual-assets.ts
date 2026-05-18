/** Public-path hero used on dashboards, login, PDF preview shell, and transactional email HTML. */
export const BRAND_FLEET_HERO_IMAGE_SRC = '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.png'
/** Generated editorial plate — black Mercedes fleet (V-Class, sedan, Sprinter) on Costa del Sol fairway, golden hour. */
export const BRAND_MARKETING_HERO_FLEET_ON_FAIRWAY_SRC = '/images/hero-fleet-golf-golden-hour.png'
export const BRAND_MARKETING_HERO_FLEET_ON_FAIRWAY_ALT =
  'Mercedes-Benz V-Class, executive saloon and van at a sunlit Costa del Sol golf course — GolfSol Ireland private golf transfers from Málaga Airport.'

/** Source banner — run `node scripts/build-hero-plane-to-fairway.mjs` after edits. */
export const BRAND_MARKETING_HERO_COMPOSITE_REFERENCE_SRC =
  '/images/afeeead4-ada3-4630-9fa1-56c95b438e98.png'

/**
 * Homepage hero — desktop (full editorial banner with the
 * "MALAGA → COSTA DEL SOL GOLF TRANSFERS" headline anchored at the top).
 * Image is text-baked, so layout displays it at its native aspect (no crop).
 */
export const BRAND_MARKETING_HERO_DESKTOP = {
  png: '/images/fpf-bcadd429-0f8b-4b75-afdd-f521413396c5.png'
} as const

/**
 * Homepage hero — mobile (fleet lineup with the GolfSol Ireland badges and
 * "FROM PLANE TO FAIRWAY" circle text visible on each vehicle).
 */
export const BRAND_MARKETING_HERO_MOBILE = {
  png: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.png'
} as const

/** Legacy alias (still imported by some pages). Points at the desktop banner above. */
export const BRAND_MARKETING_HERO_COMPOSITE_SRC = BRAND_MARKETING_HERO_DESKTOP.png
export const BRAND_MARKETING_HERO_COMPOSITE_ALT =
  'Málaga to Costa del Sol golf transfers — from plane to fairway, meet-and-greet at Málaga, golf-bag friendly Mercedes transfers, and book-your-transfer call to action.'

/** Scenic split-hero photographic plate (golf resort + Mercedes) — legacy composite. */
export const BRAND_MARKETING_SCENIC_HERO_SPLIT_SRC = '/images/hero-image-p.png'
export const BRAND_MARKETING_SCENIC_HERO_SPLIT_ALT =
  'Premium Costa del Sol golf landscape with lake and palms — Mercedes E-Class and V-Class transfers in the foreground for Golf Sol Ireland.'

/** Full fleet lineup (vans & cars) — transport pages, business cards, print mockups. */
export const BRAND_FLEET_LINEUP_IMAGE_SRC = '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.png'
export const BRAND_FLEET_LINEUP_ALT =
  'Golf Sol Ireland private transfer fleet — Mercedes E-Class, V-Class and Sprinter vehicles on the Costa del Sol.'
/** Marketing golf twilight — legacy backdrop; admin/driver portals may still reference elsewhere. */
export const BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC = '/images/twilight-golf-hero.jpg'

/**
 * Homepage marketing hero — full-width composite (`hero.png`); WebP sibling `hero.webp`.
 */
export const BRAND_MARKETING_RASTER_HERO_SRC = '/images/himage.png'
export const BRAND_MARKETING_RASTER_HERO_WEBP_SRC = '/images/himage.webp'

/** Optional: combined desktop+mobile mockup — run `npm run build:hero-malaga-transfer` (needs ≥2000px wide source). */
export const BRAND_MARKETING_RASTER_HERO_REFERENCE_SRC = '/images/hero-malaga-transfer-reference.png'

/** Admin dashboard portal hero — decorative when paired with `images/admin-operations-hero.png`. */
export const BRAND_ADMIN_OPERATIONS_HERO_ALT = ''
/** Client dashboard only — wide premium illustration (van, golf bags, Costa del Sol, subtle UI motifs). */
export const BRAND_CLIENT_PORTAL_HERO_ILLUSTRATION_SRC = '/images/client-portal-hero-illustration.png'
export const BRAND_CLIENT_PORTAL_HERO_ILLUSTRATION_ALT =
  'Stylised Costa del Sol golf travel scene — luxury transfer van, golf bags, and coastal golden hour for your Golf Sol Ireland client area.'

export const BRAND_FLEET_HERO_ALT =
  'GolfSol Ireland Mercedes fleet — E-Class, V-Class and Sprinter options for Malaga airport transfers and Costa del Sol golf trips.'
