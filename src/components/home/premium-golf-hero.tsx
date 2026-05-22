import { CarFront, Flag, PlaneLanding, Users } from 'lucide-react'
import { NAMED_HERO_IMAGE_SETS } from '../../lib/page-hero-images'
import { PremiumPageHero } from './premium-page-hero'

export const PREMIUM_HERO_DESKTOP_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.desktop
export const PREMIUM_HERO_TABLET_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.tablet
export const PREMIUM_HERO_MOBILE_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.mobile
export const PREMIUM_HERO_ALT = NAMED_HERO_IMAGE_SETS.homepageFleet.alt

const HOME_TRUST = [
  { icon: PlaneLanding, label: 'Malaga Airport Transfers' },
  { icon: CarFront, label: 'Executive Cars & People Carriers' },
  { icon: Flag, label: 'Golf Courses & Hotels' },
  { icon: Users, label: 'Built for Irish Golf Groups' }
] as const

type PremiumGolfHeroProps = {
  readonly className?: string
}

/** Homepage — fleet golden-hour hero with trust strip and floating AGP / stay+play badges. */
export function PremiumGolfHero({ className }: PremiumGolfHeroProps) {
  return (
    <PremiumPageHero
      className={className}
      images={NAMED_HERO_IMAGE_SETS.homepageFleet}
      kicker="Ireland · Costa del Sol"
      titleLine1="Ireland to Costa del Sol Golf Trips,"
      titleLine2="Handled Properly"
      lead="Premium golf holidays with executive airport transfers, handpicked courses, hotels, tee times, and local support from start to finish."
      primaryCta={{ label: 'Plan My Golf Trip', href: '/packages', variant: 'gs-gold' }}
      secondaryCta={{ label: 'View Transfer Options', href: '/services/transport', variant: 'outline-gs-green' }}
      trustBadges={HOME_TRUST}
      trustSectionTitle="What we handle"
      floatingBadges={[
        { kicker: 'Malaga AGP', title: 'Private Transfers From Malaga Airport' },
        {
          kicker: 'Stay + play',
          title: 'Tailored Golf Packages',
          panelClass: 'border-forest-700 bg-forest-950 shadow-[0_12px_32px_rgba(6,32,22,0.4)]',
          offsetClass: 'ml-8'
        }
      ]}
      formScrollTarget="#enquire"
      formScrollLabel="Plan your trip here"
      formScrollSublabel="Quick quote form below"
      srTitle="Ireland to Costa del Sol golf trips — Golf Sol Ireland"
    />
  )
}
