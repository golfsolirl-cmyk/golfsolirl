import { Clock3, PlaneLanding, ShieldCheck } from 'lucide-react'
import { PremiumPageHero, splitHeroTitle } from '../../../components/home/premium-page-hero'
import { NAMED_HERO_IMAGE_SETS } from '../../../lib/page-hero-images'
import { transportHeroCopy } from '../data/transport-service'

const { line1, line2 } = splitHeroTitle(transportHeroCopy.title)

/**
 * Transport service hero — same cream-panel layout as the homepage, with coastal drive imagery.
 */
export function TransportHero() {
  return (
    <PremiumPageHero
      id="transport-top"
      titleId="transport-hero-title"
      srTitle={transportHeroCopy.title}
      images={NAMED_HERO_IMAGE_SETS.transportCoastal}
      kicker={transportHeroCopy.eyebrow}
      titleLine1={line1}
      titleLine2={line2}
      lead={transportHeroCopy.subtitle}
      primaryCta={{ label: transportHeroCopy.primaryCta, href: '#transport-enquire', variant: 'gs-gold' }}
      secondaryCta={{ label: 'Call Ireland or Spain', href: 'tel:+353874464766', variant: 'outline-gs-green' }}
      trustBadges={[
        { icon: PlaneLanding, label: 'Flight tracking from Ireland' },
        { icon: ShieldCheck, label: 'Golf-bag friendly fleet' },
        { icon: Clock3, label: 'Quote inside 2 hours' }
      ]}
      trustSectionTitle="Why book transfers with us"
      floatingBadges={[
        { kicker: 'Malaga AGP', title: 'Meet & greet at arrivals' },
        {
          kicker: 'Door to door',
          title: 'Resort, course & return',
          panelClass: 'border-forest-700 bg-forest-950 shadow-[0_12px_32px_rgba(6,32,22,0.4)]',
          offsetClass: 'ml-8'
        }
      ]}
      formScrollTarget="#transport-enquire"
      formScrollLabel="Get a transfer quote"
      mobileImageObjectPosition="center 55%"
    />
  )
}
