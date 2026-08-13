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

/**
 * Bases that have verified `-desktop` / `-tablet` / `-mobile` siblings under `public/images/`.
 * Anything else reuses the base file for all breakpoints to avoid 404s.
 */
const RESPONSIVE_HERO_BASES = new Set<string>([
  '/images/816cf7dc-e8c0-46fe-bce3-6d0c1f7005b2',
  '/images/transport-hero-coastal-drive',
  '/images/hero-malaga-transfer',
  '/images/hero-costa-del-sol-transfer-banner',
  '/images/ge-premium-resort-hotel-hero',
  '/images/twilight-golf-hero',
  '/images/packages-hero-v3',
  '/images/ge-premium-trust-legal-hero',
  '/images/ge-premium-golf-club-rental-hero',
  '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f',
  '/images/about-golfsol-hero',
  '/images/gsol-airport-transfer-desk-hero',
  // Image-audit page-specific heroes
  '/images/destinations/marbella-golf-holiday-costa-del-sol',
  '/images/destinations/mijas-golf-holiday-costa-del-sol',
  '/images/destinations/estepona-golf-holiday-costa-del-sol',
  '/images/destinations/fuengirola-golf-holiday-costa-del-sol',
  '/images/destinations/torremolinos-golf-holiday-costa-del-sol',
  '/images/destinations/benalmadena-golf-holiday-costa-del-sol',
  '/images/destinations/malaga-golf-holiday-costa-del-sol',
  '/images/destinations/costa-del-sol-golf-holiday-overview',
  '/images/destinations/golf-holidays-from-ireland-hub',
  '/images/destinations/golf-holidays-costa-del-sol-hub',
  '/images/departures/golf-holidays-spain-from-dublin',
  '/images/departures/golf-holidays-spain-from-cork',
  '/images/departures/golf-holidays-spain-from-shannon',
  '/images/departures/golf-holidays-spain-from-belfast',
  '/images/departures/golf-holidays-spain-from-ireland',
  '/images/packages/3-night-golf-break-costa-del-sol',
  '/images/packages/4-night-golf-break-costa-del-sol',
  '/images/packages/5-night-golf-holiday-costa-del-sol',
  '/images/packages/7-night-golf-holiday-costa-del-sol',
  '/images/packages/golf-society-packages-costa-del-sol',
  '/images/packages/group-golf-holidays-costa-del-sol',
  '/images/packages/bespoke-golf-packages-costa-del-sol',
  '/images/courses/marbella-golf-valley-corridor',
  '/images/courses/mijas-fuengirola-golf-corridor',
  '/images/courses/sotogrande-golf-corridor',
  '/images/transfers/malaga-airport-golf-transfers',
  '/images/transfers/golf-group-transfers',
  '/images/transfers/golf-group-transfers-costa-del-sol'
])

/** Prefer `-desktop` / `-tablet` / `-mobile` siblings when they exist; else reuse the base asset. */
export function heroImageSetFromBase(image: string, alt: string): HeroImageSet {
  const extMatch = image.match(/\.(webp|jpg|jpeg|png)$/i)
  const ext = extMatch?.[0] ?? '.webp'
  const normalized = image.replace(/\.(webp|jpg|jpeg|png)$/i, '')

  if (RESPONSIVE_HERO_BASES.has(normalized)) {
    return {
      desktop: `${normalized}-desktop${ext}`,
      tablet: `${normalized}-tablet${ext}`,
      mobile: `${normalized}-mobile${ext}`,
      alt
    }
  }

  return {
    desktop: image,
    tablet: image,
    mobile: image,
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
    desktop: '/images/packages-hero-v3-desktop.webp',
    tablet: '/images/packages-hero-v3-tablet.webp',
    mobile: '/images/packages-hero-v3-mobile.webp',
    alt: 'Twilight golf and premium Costa del Sol stays — build your stay-and-play package with live pricing.'
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
