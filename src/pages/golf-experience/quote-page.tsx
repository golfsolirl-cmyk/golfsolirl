import { useMemo } from 'react'
import {
  resolveBundleFromSlug,
  type BundleTierId
} from '../../data/golf-holiday-bundles'
import { LeanPublicHero } from '../../components/home/premium-golf-hero'
import { NAMED_HERO_IMAGE_SETS } from '../../lib/page-hero-images'
import { usePageMeta } from '../../lib/use-page-meta'
import { BundleQuoteForm } from './components/bundle-quote-form'
import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'

function splitPipeList(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
}

function readQuoteParams() {
  if (typeof window === 'undefined') {
    return {
      bundleSlug: null as string | null,
      tier: 'classic' as BundleTierId,
      courses: [] as string[],
      hotel: null as string | null,
      hotels: [] as string[],
      addTransfers: false
    }
  }
  const params = new URLSearchParams(window.location.search)
  const bundleSlug = params.get('bundle')
  const tierRaw = (params.get('tier') || 'classic').toLowerCase()
  const tier: BundleTierId =
    tierRaw === 'value' || tierRaw === 'premium' || tierRaw === 'classic' ? tierRaw : 'classic'
  return {
    bundleSlug,
    tier,
    courses: splitPipeList(params.get('courses')),
    hotel: params.get('hotel')?.trim() || null,
    hotels: splitPipeList(params.get('hotels')),
    addTransfers: params.get('transfers') === '1' || params.get('transfers') === 'yes'
  }
}

/**
 * Dedicated quote page — lean hero + bundle/course/hotel preset form.
 */
export function QuotePage() {
  const params = useMemo(() => readQuoteParams(), [])
  const bundle = useMemo(() => resolveBundleFromSlug(params.bundleSlug), [params.bundleSlug])

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
          lead="Dates, golfers, and a phone number — we reply from Ireland with clear options."
          primaryCta={{ label: 'Start your quote', href: '#quote-form' }}
          secondaryCta={{ label: 'View bundles', href: '/bundles' }}
          title="Get a quote"
        />

        <section className="mx-auto max-w-[640px] px-5 py-14 sm:px-8 sm:py-16">
          <BundleQuoteForm
            bundle={bundle}
            initialTier={params.tier}
            presetCourses={params.courses}
            presetHotel={params.hotel}
            presetHotels={params.hotels}
            presetAddTransfers={params.addTransfers}
          />
        </section>
      </main>
      <GeFooter />
    </div>
  )
}
