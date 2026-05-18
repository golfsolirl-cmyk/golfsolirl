/**
 * Page hero registry — single source of truth for per-page hero imagery.
 *
 * Each public page picks a *different* source photo (we never reuse the same
 * hero on two pages). The Premium Hero component then layers a unified
 * brand treatment over the photo — warm colour grade, gold accent line,
 * page-label badge, vignette — so every page reads as part of the same
 * Costa del Sol golf travel family.
 *
 * Adding a new page: add an entry here, then `<PremiumHero variant="myPage" />`.
 */

export interface PageHeroSource {
  /** Desktop wide variant (4:3 or 16:9). */
  readonly desktop: string
  /** Mobile portrait variant (4:5 or 5:6). */
  readonly mobile: string
  /** Optional WebP override per breakpoint. */
  readonly desktopWebp?: string
  readonly mobileWebp?: string
  /** Alt text — same for both breakpoints. */
  readonly alt: string
  /** Page-label chip shown above the headline (e.g. "Account access"). */
  readonly badge: string
  /** Subtle warm-tint hue layered on top of the photo (degrees + alpha). */
  readonly tintHue: 'warm' | 'cool' | 'gold' | 'forest'
}

/**
 * Each public route gets a unique photographic identity. Sources are drawn
 * from the assets already in `public/images/` so we don't ship more bytes.
 */
export const PAGE_HERO_REGISTRY = {
  /** Sign-in (client / admin / driver share the same magic-link UI). */
  login: {
    desktop: '/images/hero-malaga-composed-desktop.webp',
    mobile: '/images/hero-malaga-composed-mobile.webp',
    desktopWebp: '/images/hero-malaga-composed-desktop.webp',
    mobileWebp: '/images/hero-malaga-composed-mobile.webp',
    alt: 'Mercedes V-Class waiting at Málaga AGP — same crew greets every Irish group.',
    badge: 'Account access',
    tintHue: 'warm'
  } satisfies PageHeroSource,

  /** Logged-out / session-end. */
  loggedOut: {
    desktop: '/images/hero-fleet-golf-golden-hour.png',
    mobile: '/images/hero-malaga-fleet-mobile-portrait.png',
    alt: 'Costa del Sol fairway at golden hour — see you on the next round.',
    badge: 'Session closed',
    tintHue: 'gold'
  } satisfies PageHeroSource,

  /** Public packages browser. */
  packages: {
    desktop: '/images/hero-from-plane-to-fairway-premium.webp',
    mobile: '/images/hero-from-plane-to-fairway.png',
    desktopWebp: '/images/hero-from-plane-to-fairway-premium.webp',
    alt: 'Plane to fairway — Costa del Sol stay-and-play packages built for Irish societies.',
    badge: 'Stay & play',
    tintHue: 'warm'
  } satisfies PageHeroSource,

  /** Transport service page. */
  transport: {
    desktop: '/images/hero-malaga-transfer-desktop.webp',
    mobile: '/images/hero-malaga-transfer-mobile.webp',
    desktopWebp: '/images/hero-malaga-transfer-desktop.webp',
    mobileWebp: '/images/hero-malaga-transfer-mobile.webp',
    alt: 'Mercedes airport-to-course transfer along the Costa del Sol corridor.',
    badge: 'Costa del Sol transfers',
    tintHue: 'cool'
  } satisfies PageHeroSource,

  /** Business cards / brand showcase. */
  businessCards: {
    desktop: '/images/hero-golfsol-premium-desktop.webp',
    mobile: '/images/hero-golfsol-premium-mobile.webp',
    desktopWebp: '/images/hero-golfsol-premium-desktop.webp',
    mobileWebp: '/images/hero-golfsol-premium-mobile.webp',
    alt: 'GolfSol Ireland brand identity — premium print and digital.',
    badge: 'Brand & print',
    tintHue: 'forest'
  } satisfies PageHeroSource,

  /** Continue-trip — arrival snapshot path. */
  continueTrip: {
    desktop: '/images/hero-costa-del-sol-transfer-banner.png',
    mobile: '/images/hero-malaga-transfer-mobile.webp',
    mobileWebp: '/images/hero-malaga-transfer-mobile.webp',
    alt: 'Costa del Sol transfer banner — your Mercedes is being lined up.',
    badge: 'Trip continues',
    tintHue: 'cool'
  } satisfies PageHeroSource,

  /** Rate-your-trip post-arrival. */
  rateTrip: {
    desktop: '/images/hero-sample-sunny-mercedes-03.webp',
    mobile: '/images/hero-sample-sunny-mercedes-03-mobile.webp',
    desktopWebp: '/images/hero-sample-sunny-mercedes-03.webp',
    mobileWebp: '/images/hero-sample-sunny-mercedes-03-mobile.webp',
    alt: 'Sunny Costa del Sol drive — share how the trip went.',
    badge: 'How was your trip?',
    tintHue: 'gold'
  } satisfies PageHeroSource,

  /** Long-form content pages (terms, privacy, about, articles). */
  content: {
    desktop: '/images/hero-image.png',
    mobile: '/images/hero-image.png',
    alt: 'Costa del Sol corridor — supporting context for our long-form pages.',
    badge: 'Editorial',
    tintHue: 'warm'
  } satisfies PageHeroSource
} as const

export type PageHeroVariant = keyof typeof PAGE_HERO_REGISTRY
