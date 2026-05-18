import {
  BRAND_FLEET_LINEUP_IMAGE_SRC,
  BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC,
  BRAND_FLEET_HERO_IMAGE_SRC
} from '../../lib/brand-visual-assets'

/** Stable Unsplash `photo-{id}` segments — `auto=format&fit=crop` for weight. */
function unsplash(photoId: string, w: number) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&q=82`
}

const HERO_DESKTOP_W = 1920
const HERO_MOBILE_W = 900
const SECTION_W = 1600

export type CinematicImageKey =
  | 'heroDesktop'
  | 'heroMobile'
  | 'transfers'
  | 'courses'
  | 'resorts'
  | 'fleet'
  | 'bags'
  | 'stay'
  | 'support'
  | 'experience'

export const CINEMATIC_REMOTE: Record<
  CinematicImageKey,
  { readonly src: string; readonly alt: string; readonly fallback: string }
> = {
  heroDesktop: {
    src: unsplash('1472214103451-9374bd1c798e', HERO_DESKTOP_W),
    alt: 'Dramatic misty mountain landscape at golden hour',
    fallback: BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC
  },
  heroMobile: {
    src: unsplash('1472214103451-9374bd1c798e', HERO_MOBILE_W),
    alt: 'Dramatic misty mountain landscape at golden hour',
    fallback: BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC
  },
  transfers: {
    src: unsplash('1436491868662-623837c8d06', SECTION_W),
    alt: 'Airport terminal corridor with warm light',
    fallback: BRAND_FLEET_HERO_IMAGE_SRC
  },
  courses: {
    src: unsplash('1535131749008-f36976f03631', SECTION_W),
    alt: 'Rolling golf fairway at sunrise',
    fallback: BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC
  },
  resorts: {
    src: unsplash('1566073771259-6a8506099945', SECTION_W),
    alt: 'Luxury resort pool and architecture at dusk',
    fallback: BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC
  },
  fleet: {
    src: unsplash('1619405399517-d7fce0f13302', SECTION_W),
    alt: 'Premium vehicle interior detail',
    fallback: BRAND_FLEET_LINEUP_IMAGE_SRC
  },
  bags: {
    src: unsplash('1592919508534-7d85a4c0d7ed', SECTION_W),
    alt: 'Golf bag and clubs in warm sunlight',
    fallback: BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC
  },
  stay: {
    src: unsplash('1618773905601-09bec1e751d7', SECTION_W),
    alt: 'Boutique hotel suite with soft evening light',
    fallback: BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC
  },
  support: {
    src: unsplash('1522071820081-009f0129c71c', SECTION_W),
    alt: 'Team collaboration in a bright modern space',
    fallback: BRAND_FLEET_HERO_IMAGE_SRC
  },
  experience: {
    src: unsplash('1507525428034-b723cf961d3e', SECTION_W),
    alt: 'Ocean coastline at sunset',
    fallback: BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC
  }
}
