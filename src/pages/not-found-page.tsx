import { usePageSeo } from '../lib/use-page-seo'
import { LuxuryButton } from '../components/ui/button'

export function NotFoundPage() {
  usePageSeo({
    title: 'Page not found | Golf Sol Ireland',
    description: 'The page you requested could not be found. Explore Golf Sol Ireland golf travel pages or return to the homepage.',
    canonicalPath: window.location.pathname,
    noIndex: true
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-offwhite px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-600">404</p>
        <h1 className="font-display mt-4 text-4xl font-bold tracking-[-0.03em] text-forest-950 md:text-5xl">
          That page is off the fairway
        </h1>
        <p className="mt-4 text-base leading-8 text-forest-600 md:text-lg">
          The link may have moved, expired, or never existed. Use the homepage to continue planning your Costa del Sol golf trip.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <LuxuryButton href="/" showArrow>
            Back to homepage
          </LuxuryButton>
          <LuxuryButton href="/contact" variant="white">
            Get a quote
          </LuxuryButton>
        </div>
      </div>
    </div>
  )
}
