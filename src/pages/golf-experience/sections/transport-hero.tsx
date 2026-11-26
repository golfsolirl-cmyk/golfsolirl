import { LeanPublicHero } from '../../../components/home/premium-golf-hero'
import { NAMED_HERO_IMAGE_SETS } from '../../../lib/page-hero-images'
import { transportHeroCopy } from '../data/transport-service'

/**
 * Transport service hero — same lean composition as the homepage.
 */
export function TransportHero() {
  return (
    <LeanPublicHero
      ariaLabel={transportHeroCopy.title}
      images={NAMED_HERO_IMAGE_SETS.transportCoastal}
      imageObjectPosition="center 55%"
      kicker={transportHeroCopy.eyebrow || 'GolfSol Ireland'}
      lead={transportHeroCopy.subtitle}
      primaryCta={{ label: transportHeroCopy.primaryCta, href: '#transport-enquire' }}
      secondaryCta={{ label: 'Get a quote', href: '/quote' }}
      title={transportHeroCopy.title}
    />
  )
}
