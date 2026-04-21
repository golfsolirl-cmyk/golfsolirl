import { GeFinalCta } from './sections/final-cta'
import { GePaymentsIreland } from './sections/payments-ireland'
import { TransportEnquireBlock } from './sections/transport-enquire-block'
import { TransportFleet } from './sections/transport-fleet'
import { TransportHero } from './sections/transport-hero'
import { TransportPromise } from './sections/transport-promise'
import { TransportRouteStory } from './sections/transport-route-story'
import { PublicSiteShell } from '../../components/public/public-site-shell'
import { buildWebPageJsonLd, usePageMetadata } from '../../lib/page-metadata'

/**
 * Dedicated Transport service page — same shell as {@link GolfExperienceHome}
 * (navbar, payments trust band, footer, WhatsApp FAB) with a brand-new
 * editorial body: cinematic hero → promise → journey → fleet → enquiry →
 * final CTA.
 */
export function TransportServicePage() {
  usePageMetadata({
    title: 'Costa del Sol golf transport from Malaga AGP',
    description:
      'Book GolfSol Ireland transport for Costa del Sol golf trips, including Malaga airport pickups, hotel transfers, course shuttles, and premium Mercedes vehicles for Irish groups.',
    canonicalPath: '/services/transport',
    image: '/images/transport-hero-coastal-drive.jpg',
    type: 'article',
    keywords: [
      'GolfSol Ireland transport',
      'Malaga golf transfers',
      'Costa del Sol golf transport',
      'Mercedes golf transfers Spain'
    ],
    jsonLd: buildWebPageJsonLd({
      title: 'Costa del Sol golf transport from Malaga AGP',
      description:
        'Book GolfSol Ireland transport for Costa del Sol golf trips, including Malaga airport pickups, hotel transfers, course shuttles, and premium Mercedes vehicles for Irish groups.',
      canonicalUrl: 'https://golfsolirl.com/services/transport',
      image: 'https://golfsolirl.com/images/transport-hero-coastal-drive.jpg',
      type: 'Article'
    })
  })

  return (
    <PublicSiteShell>
      <main id="main">
        <TransportHero />
        <TransportPromise />
        <GePaymentsIreland />
        <TransportRouteStory />
        <TransportFleet />
        <TransportEnquireBlock />
        <GeFinalCta />
      </main>
    </PublicSiteShell>
  )
}
