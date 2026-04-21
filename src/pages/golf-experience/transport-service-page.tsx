import { GeFinalCta } from './sections/final-cta'
import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'
import { GePaymentsIreland } from './sections/payments-ireland'
import { TransportEnquireBlock } from './sections/transport-enquire-block'
import { TransportFleet } from './sections/transport-fleet'
import { TransportHero } from './sections/transport-hero'
import { TransportPromise } from './sections/transport-promise'
import { TransportRouteStory } from './sections/transport-route-story'
import { WhatsappFab } from './components/whatsapp-fab'
import { useEffect } from 'react'
import { applySeo } from '../../lib/seo'

/**
 * Dedicated Transport service page — same shell as {@link GolfExperienceHome}
 * (navbar, payments trust band, footer, WhatsApp FAB) with a brand-new
 * editorial body: cinematic hero → promise → journey → fleet → enquiry →
 * final CTA.
 */
export function TransportServicePage() {
  useEffect(() => {
    applySeo({
      title: 'Transport Services | GolfSol Ireland',
      description:
        'Premium Costa del Sol golf transport with airport transfers, golf-day shuttles, and Irish-led support from arrival to departure.',
      path: '/services/transport',
      imagePath: '/images/transport-hero-coastal-drive.jpg'
    })
  }, [])

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gs-gold focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="main">
        <TransportHero />
        <TransportPromise />
        <GePaymentsIreland />
        <TransportRouteStory />
        <TransportFleet />
        <TransportEnquireBlock />
        <GeFinalCta />
      </main>

      <GeFooter />

      <WhatsappFab />
    </div>
  )
}
