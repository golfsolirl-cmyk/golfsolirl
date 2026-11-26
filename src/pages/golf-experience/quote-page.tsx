import { useMemo } from 'react'
import { resolveBundleFromSlug } from '../../data/golf-holiday-bundles'
import { LeanPublicHero } from '../../components/home/premium-golf-hero'
import { NAMED_HERO_IMAGE_SETS } from '../../lib/page-hero-images'
import { readTripQuotePresetFromSearch } from '../../lib/trip-quote-services'
import { WEBSITE_ENQUIRY_FORM } from '../../lib/enquiry-form-registry'
import { usePageMeta } from '../../lib/use-page-meta'
import { SmartTripQuoteForm } from './components/smart-trip-quote-form'
import { WhatsAppBanner } from '../../components/whatsapp/WhatsAppBanner'
import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'

/**
 * Dedicated quote page — lean hero + shared trip-builder form.
 */
export function QuotePage() {
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const preset = useMemo(() => {
    const base = readTripQuotePresetFromSearch(search)
    return {
      ...base,
      formKey: base.bundleSlug ? WEBSITE_ENQUIRY_FORM.bundleQuote : WEBSITE_ENQUIRY_FORM.contentQuickEnquiry
    }
  }, [search])
  const bundle = useMemo(() => resolveBundleFromSlug(preset.bundleSlug ?? null), [preset.bundleSlug])

  usePageMeta({
    title: bundle
      ? `Quote · ${bundle.packageName} | GolfSol Ireland`
      : 'Get a Quote | GolfSol Ireland',
    description: bundle
      ? `Request a quote for ${bundle.packageName} — ${bundle.nights} nights, ${bundle.rounds} rounds on the Costa del Sol.`
      : 'Request a clear Costa del Sol golf holiday quote from Ireland.',
    canonicalPath: '/quote',
    ogImage: NAMED_HERO_IMAGE_SETS.quoteCostaGolf.desktop,
    ogImageAlt: NAMED_HERO_IMAGE_SETS.quoteCostaGolf.alt
  })

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <GeNavbar />
      <main id="main">
        <LeanPublicHero
          ariaLabel="Get a quote"
          images={NAMED_HERO_IMAGE_SETS.quoteCostaGolf}
          kicker="GolfSol Ireland"
          lead="Pick transfers, hotels, and golf — we reply from Ireland with clear options."
          primaryCta={{ label: 'Start your quote', href: '#quote-form' }}
          secondaryCta={{ label: 'View bundles', href: '/bundles' }}
          title="Get a quote"
        />

        <section className="mx-auto max-w-[640px] px-5 py-14 sm:px-8 sm:py-16">
          <SmartTripQuoteForm
            formId="quote-form"
            lead={
              preset.courses?.length
                ? `${preset.courses.join(', ')} is ready below. Add airport transfers, hotel level, nights, rounds, dates, group size and arrival time — then send.`
                : 'Choose what you need. We only show the fields for those services.'
            }
            preset={preset}
            title={
              bundle
                ? bundle.packageName
                : preset.courses?.length === 1
                  ? `Plan a trip · ${preset.courses[0]}`
                  : 'Build your quote'
            }
          />
        </section>
      </main>
      <WhatsAppBanner sourcePage="/quote" />
      <GeFooter />
    </div>
  )
}
