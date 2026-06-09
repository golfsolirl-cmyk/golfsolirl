import { GeFinalCta } from './sections/final-cta'
import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'
import { GePaymentsIreland } from './sections/payments-ireland'
import { TransportEnquireBlock } from './sections/transport-enquire-block'
import { TransportFleet } from './sections/transport-fleet'
import { TransportHero } from './sections/transport-hero'
import { TransportPromise } from './sections/transport-promise'
import { TransportRouteStory } from './sections/transport-route-story'
import { GeTransfersInsuranceBanner } from './components/ge-transfers-insurance-banner'
import { TripServiceBookingCta } from '../../components/trip-service-booking-cta'
import { WhatsappFab } from './components/whatsapp-fab'

/**
 * Dedicated Transport service page — same shell as {@link GolfExperienceHome}
 * (navbar, payments trust band, footer, WhatsApp FAB) with a brand-new
 * editorial body: cinematic hero → promise → journey → fleet → enquiry →
 * final CTA.
 */
export function TransportServicePage() {
  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-white"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="main">
        <TransportHero />
        <TransportPromise />
        <GePaymentsIreland />
        <div className="bg-white px-5 py-6 sm:px-8 sm:py-7">
          <div className="mx-auto max-w-[1180px]">
            <GeTransfersInsuranceBanner variant="inline" />
          </div>
        </div>
        <TransportRouteStory />
        <TransportFleet />
        <div className="bg-cream px-3 py-6 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-[1180px]">
            <TripServiceBookingCta
              pageLabel="Transport"
              sectionLead="Book Málaga airport transfers for your group — optionally add golf rounds or accommodation in the same request."
            />
          </div>
        </div>
        <TransportEnquireBlock />
        <GeFinalCta />
      </main>

      <GeFooter />

      <WhatsappFab />
    </div>
  )
}
