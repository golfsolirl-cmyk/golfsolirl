import {
  PAGE_HERO_REGISTRY,
  type PageHeroSource,
  type PageHeroVariant
} from '../components/premium/page-hero-registry'
import type { GeContentPageData } from '../pages/golf-experience/data/content-pages'
import { getContentPageHeroMedia } from '../pages/golf-experience/content-page-context'

export type HeroImageSet = {
  readonly desktop: string
  readonly tablet: string
  readonly mobile: string
  readonly alt: string
}

/** Prefer `-desktop` / `-tablet` / `-mobile` siblings when they exist; else reuse the base asset. */
export function heroImageSetFromBase(image: string, alt: string): HeroImageSet {
  const normalized = image.replace(/\.(webp|jpg|jpeg|png)$/i, '')
  const ext = image.match(/\.(webp|jpg|jpeg|png)$/i)?.[0] ?? '.webp'

  const desktop = `${normalized}-desktop${ext}`
  const tablet = `${normalized}-tablet${ext}`
  const mobile = `${normalized}-mobile${ext}`

  return {
    desktop,
    tablet,
    mobile,
    alt
  }
}

export function heroImageSetFromRegistry(variant: PageHeroVariant): HeroImageSet {
  const source: PageHeroSource = PAGE_HERO_REGISTRY[variant]
  return {
    desktop: source.desktopWebp ?? source.desktop,
    tablet: source.desktopWebp ?? source.desktop,
    mobile: source.mobileWebp ?? source.mobile,
    alt: source.alt
  }
}

export function heroImageSetForContentPage(path: string, page: GeContentPageData): HeroImageSet {
  const media = getContentPageHeroMedia(path, page)
  return heroImageSetFromBase(media.image, media.alt)
}

/** Known multi-breakpoint sets (verified filenames under `public/images/`). */
export const NAMED_HERO_IMAGE_SETS = {
  homepageFleet: {
    desktop: '/images/816cf7dc-e8c0-46fe-bce3-6d0c1f7005b2-desktop.webp',
    tablet: '/images/816cf7dc-e8c0-46fe-bce3-6d0c1f7005b2-tablet.webp',
    mobile: '/images/816cf7dc-e8c0-46fe-bce3-6d0c1f7005b2-mobile.webp',
    alt: 'GolfSol Ireland Mercedes fleet at a golden-hour Costa del Sol golf resort — private transfers from Málaga Airport to the fairway.'
  },
  transportCoastal: {
    desktop: '/images/transport-hero-coastal-drive-desktop.webp',
    tablet: '/images/transport-hero-coastal-drive-tablet.webp',
    mobile: '/images/transport-hero-coastal-drive-mobile.webp',
    alt: 'Private transfer along the Costa del Sol — golf bags, resort runs, and Málaga airport legs.'
  },
  malagaTransfer: {
    desktop: '/images/hero-malaga-transfer-desktop.webp',
    tablet: '/images/hero-malaga-transfer-desktop.webp',
    mobile: '/images/hero-malaga-transfer-mobile.webp',
    alt: 'Málaga airport meet-and-greet and executive transfer to your Costa del Sol golf base.'
  },
  resortHotel: {
    desktop: '/images/ge-premium-resort-hotel-hero-desktop.webp',
    tablet: '/images/ge-premium-resort-hotel-hero-tablet.webp',
    mobile: '/images/ge-premium-resort-hotel-hero-mobile.webp',
    alt: 'Boutique resort terrace on the Costa del Sol — accommodation for Irish golf groups.'
  },
  fairwayCoastal: {
    desktop: '/images/ge-premium-golf-fairway-coastal.webp',
    tablet: '/images/ge-premium-golf-fairway-coastal.webp',
    mobile: '/images/ge-premium-golf-fairway-coastal.webp',
    alt: 'Championship Costa del Sol fairway toward the Mediterranean.'
  },
  twilightGolf: {
    desktop: '/images/twilight-golf-hero-desktop.webp',
    tablet: '/images/twilight-golf-hero-tablet.webp',
    mobile: '/images/twilight-golf-hero-mobile.webp',
    alt: 'Twilight golf on the Costa del Sol — softer light and great value tee times.'
  },
  packages: {
    desktop: '/images/hero-from-plane-to-fairway-premium-desktop.webp',
    tablet: '/images/hero-from-plane-to-fairway-premium.webp',
    mobile: '/images/hero-from-plane-to-fairway-mobile.webp',
    alt: 'Stay-and-play golf packages for Irish societies on the Costa del Sol.'
  },
  testimonial: {
    desktop: '/images/ge-premium-golf-group-testimonial.webp',
    tablet: '/images/ge-premium-golf-group-testimonial.webp',
    mobile: '/images/ge-premium-golf-group-testimonial.webp',
    alt: 'Irish golf group celebrating a round on the Costa del Sol.'
  },
  legal: {
    desktop: '/images/ge-premium-trust-legal-hero-desktop.webp',
    tablet: '/images/ge-premium-trust-legal-hero-tablet.webp',
    mobile: '/images/ge-premium-trust-legal-hero-mobile.webp',
    alt: 'Trusted booking terms and legal context for Golf Sol Ireland.'
  },
  about: {
    desktop: '/images/about-golfsol-hero.webp',
    tablet: '/images/about-golfsol-hero.webp',
    mobile: '/images/about-golfsol-hero.webp',
    alt: 'Golf Sol Ireland — Irish-owned Costa del Sol golf travel.'
  },
  editorial: {
    desktop: '/images/ge-premium-editorial-travel-news.webp',
    tablet: '/images/ge-premium-editorial-travel-news.webp',
    mobile: '/images/ge-premium-editorial-travel-news.webp',
    alt: 'Editorial travel planning for Costa del Sol golf trips.'
  },
  fleetCover: {
    desktop: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f-desktop.webp',
    tablet: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f-tablet.webp',
    mobile: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f-mobile.webp',
    alt: 'Golf Sol Ireland executive fleet on the Costa del Sol.'
  }
} as const satisfies Record<string, HeroImageSet>
