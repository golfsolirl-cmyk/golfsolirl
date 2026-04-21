import { useEffect } from 'react'
import { GeAboutBlock } from './sections/about-block'
import { GeAccommodationIntro } from './sections/accommodation-intro'
import { GeAccommodationSpain } from './sections/accommodation-spain'
import { GeCoursesSpain } from './sections/courses-spain'
import { GeDesignYourPackage } from './sections/design-your-package'
import { GeExtrasStrip } from './sections/extras-strip'
import { GeFacts } from './sections/facts'
import { GeFinalCta } from './sections/final-cta'
import { GeFooter } from './sections/ge-footer'
import { GeHero } from './sections/hero'
import { GeNavbar } from './sections/ge-navbar'
import { GePaymentsIreland } from './sections/payments-ireland'
import { WhatsappFab } from './components/whatsapp-fab'
import { applySeo } from '../../lib/seo'

export function GolfExperienceHome() {
  useEffect(() => {
    applySeo({
      title: 'GolfSol Ireland | Costa del Sol Golf Holidays for Irish Groups',
      description:
        'Plan premium Costa del Sol golf trips with GolfSol Ireland: tee times, hotels, airport transfers, and Irish-led support from arrival to final round.',
      path: '/',
      imagePath: '/images/hero-malaga-transfers-1600.jpg'
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
        <GeHero />
        <GePaymentsIreland />
        <GeDesignYourPackage />
        <GeCoursesSpain />
        <GeAccommodationIntro />
        <GeAccommodationSpain />
        <GeExtrasStrip />
        <GeFacts />
        <GeAboutBlock />
        <GeFinalCta />
      </main>

      <GeFooter />

      <WhatsappFab />
    </div>
  )
}
