import { PublicSiteShell } from '../../components/public/public-site-shell'
import { usePageSeo } from '../../lib/use-page-seo'
import { GeFinalCta } from './sections/final-cta'
import { GePaymentsIreland } from './sections/payments-ireland'
import { TransportEnquireBlock } from './sections/transport-enquire-block'
import { TransportFleet } from './sections/transport-fleet'
import { TransportHero } from './sections/transport-hero'
import { TransportPromise } from './sections/transport-promise'
import { TransportRouteStory } from './sections/transport-route-story'

/**
 * Dedicated Transport service page — same shell as {@link GolfExperienceHome}
 * (navbar, payments trust band, footer, WhatsApp FAB) with a brand-new
 * editorial body: cinematic hero → promise → journey → fleet → enquiry →
 * final CTA.
 */
export function TransportServicePage() {
  usePageSeo({
    title: 'Golf Transport Service | Golf Sol Ireland',
    description:
      'Premium Malaga airport, hotel, and golf-course transfers for Irish golf groups on the Costa del Sol, with golf-bag-friendly vehicles and Irish-led support.',
    path: '/services/transport',
    image: '/images/transport-fleet-lineup.jpg',
    keywords: ['Malaga airport golf transfers', 'Costa del Sol golf transport', 'Irish golf trip transfers'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Golf travel transport',
      provider: {
        '@type': 'TravelAgency',
        name: 'Golf Sol Ireland'
      },
      areaServed: 'Costa del Sol',
      url: `${window.location.origin}/services/transport`
    }
  })

  return (
    <PublicSiteShell>
      <div>
        <TransportHero />
        <TransportPromise />
        <GePaymentsIreland />
        <TransportRouteStory />
        <TransportFleet />
        <TransportEnquireBlock />
        <GeFinalCta />
      </div>
    </PublicSiteShell>
  )
}
