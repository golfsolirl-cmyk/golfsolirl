import { NAMED_HERO_IMAGE_SETS } from '../../lib/page-hero-images'
import { AirportTransferPosterHero } from './airport-transfer-poster-hero'

export const PREMIUM_HERO_DESKTOP_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.desktop
export const PREMIUM_HERO_TABLET_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.tablet
export const PREMIUM_HERO_MOBILE_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.mobile
export const PREMIUM_HERO_ALT = NAMED_HERO_IMAGE_SETS.homepageFleet.alt

type PremiumGolfHeroProps = {
  readonly className?: string
}

/** Homepage hero — airport-transfers poster over the Málaga arrivals scene. */
export function PremiumGolfHero({ className }: PremiumGolfHeroProps) {
  return <AirportTransferPosterHero className={className} />
}
