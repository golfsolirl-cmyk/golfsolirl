import { ShieldCheck, PlaneLanding, Briefcase } from 'lucide-react'
import { LeanPublicHero } from '../../components/home/premium-golf-hero'
import { NAMED_HERO_IMAGE_SETS } from '../../lib/page-hero-images'
import { WEBSITE_ENQUIRY_FORM } from '../../lib/enquiry-form-registry'
import { usePageMeta } from '../../lib/use-page-meta'
import { SmartTripQuoteForm } from './components/smart-trip-quote-form'
import { WhatsAppBanner } from '../../components/whatsapp/WhatsAppBanner'
import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'
import { transportHeroCopy } from './data/transport-service'

const POINTS = [
  { icon: ShieldCheck, label: 'Fully insured' },
  { icon: PlaneLanding, label: 'Meet & greet' },
  { icon: Briefcase, label: 'Golf bags welcome' }
] as const

/**
 * Lean transfers page — homepage-style hero, three points, shared trip-builder form.
 */
export function TransportServicePage() {
  usePageMeta({
    title: 'Málaga Airport Golf Transfers | GolfSol Ireland',
    description:
      'Golf-bag-friendly private transfers from Málaga Airport to Costa del Sol hotels for Irish golf groups.',
    canonicalPath: '/services/transport',
    ogImage: NAMED_HERO_IMAGE_SETS.transportCoastal.desktop,
    ogImageAlt: NAMED_HERO_IMAGE_SETS.transportCoastal.alt
  })

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
        <LeanPublicHero
          ariaLabel={transportHeroCopy.title}
          images={NAMED_HERO_IMAGE_SETS.transportCoastal}
          imageObjectPosition="center 55%"
          kicker="GolfSol Ireland"
          lead={transportHeroCopy.subtitle}
          primaryCta={{ label: 'Request a transfer', href: '#transport-enquire' }}
          secondaryCta={{ label: 'Get a quote', href: '/quote' }}
          title={transportHeroCopy.title}
        />

        <section className="border-b border-chrome-100 bg-cream/80 px-5 py-8 sm:px-8">
          <ul className="mx-auto flex max-w-[720px] flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4">
            {POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 font-ge text-[0.95rem] font-bold text-gs-dark">
                <Icon className="h-5 w-5 shrink-0 text-gs-green" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-5 max-w-[720px] font-ge text-sm leading-6 text-ge-gray600">
            Private AGP → hotel or course · sized for your group and bags · clear quote from Ireland.
          </p>
        </section>

        <section id="transport-enquire" className="mx-auto max-w-[640px] scroll-mt-28 px-5 py-14 sm:px-8 sm:py-16">
          <SmartTripQuoteForm
            formId="transport-enquire-form"
            lead="Transfers is selected — add hotels or golf if you need them too."
            preset={{
              services: { transfers: true, accommodation: false, golf_courses: false },
              pageLabel: '/services/transport',
              formKey: WEBSITE_ENQUIRY_FORM.malagaAirportTransfer
            }}
            title="Transfers from Málaga Airport"
          />
        </section>
      </main>

      <WhatsAppBanner sourcePage="/services/transport" />
      <GeFooter />
    </div>
  )
}
