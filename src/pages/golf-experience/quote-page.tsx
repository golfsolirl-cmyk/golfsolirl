import { useEffect, useMemo } from 'react'
import { resolveBundleFromSlug } from '../../data/golf-holiday-bundles'
import { NAMED_HERO_IMAGE_SETS } from '../../lib/page-hero-images'
import { readTripQuotePresetFromSearch } from '../../lib/trip-quote-services'
import { WEBSITE_ENQUIRY_FORM } from '../../lib/enquiry-form-registry'
import { bindFormHashScroll } from '../../lib/scroll-to-form-target'
import { usePageMeta } from '../../lib/use-page-meta'
import { SmartTripQuoteForm } from './components/smart-trip-quote-form'
import { WhatsAppBanner } from '../../components/whatsapp/WhatsAppBanner'
import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'

/**
 * Dedicated quote / enquire form page — form-first (no big hero).
 * CTAs across the site land here with query prefill so the form is above the fold.
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

  useEffect(() => bindFormHashScroll(), [])

  useEffect(() => {
    // Land at top so the form is above the fold (no hero to scroll past).
    window.scrollTo({ top: 0, behavior: 'auto' })
    const t = window.setTimeout(() => {
      const root = document.getElementById('quote-form')
      const field = root?.querySelector<HTMLElement>(
        'input:not([type="hidden"]), select, textarea, button[data-service-chip]'
      )
      field?.focus({ preventScroll: true })
    }, 120)
    return () => window.clearTimeout(t)
  }, [search])

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

  const contextBits = [
    bundle?.packageName,
    preset.nights != null ? `${preset.nights} nights` : null,
    preset.rounds != null ? `${preset.rounds} rounds` : null,
    preset.area,
    preset.courses?.length === 1 ? preset.courses[0] : preset.courses?.length ? `${preset.courses.length} courses` : null,
    preset.hotels?.length || preset.hotel ? 'hotel selected' : null
  ].filter(Boolean)

  const heading =
    preset.intent === 'callback'
      ? 'Request a callback'
      : bundle
        ? bundle.packageName
        : preset.courses?.length === 1
          ? `Plan a trip · ${preset.courses[0]}`
          : 'Get a quote'

  const lead =
    contextBits.length > 0
      ? `${contextBits.join(' · ')}. Confirm the details below — we reply from Ireland.`
      : 'Transfers, hotels, and golf — only the fields you need. We reply from Ireland.'

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-[#F4F7F5]">
      <GeNavbar />
      <main id="main" className="mx-auto w-full max-w-[640px] px-4 pb-28 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-6 sm:pt-24">
        <header className="mb-5 sm:mb-6">
          <p className="font-ge text-[0.75rem] font-extrabold uppercase tracking-[0.14em] text-brand-700">
            GolfSol Ireland
          </p>
          <h1 className="mt-1 font-ge text-[1.65rem] font-extrabold leading-tight text-gs-dark sm:text-3xl">
            {heading}
          </h1>
          <p className="mt-2 max-w-prose font-ge text-[0.98rem] leading-snug text-forest-800 sm:text-base">
            {lead}
          </p>
        </header>

        <SmartTripQuoteForm
          formId="quote-form"
          lead=""
          preset={preset}
          title=""
          compact
        />
      </main>
      <WhatsAppBanner sourcePage={preset.sourcePage || '/quote'} />
      <GeFooter />
    </div>
  )
}
