import { GeButton } from './golf-experience/components/ge-button'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'
import { SITE_REVIEW_URL } from '../data/site-review'
import { usePageMeta } from '../lib/use-page-meta'
import { WhatsappFab } from './golf-experience/components/whatsapp-fab'

/**
 * Simple “Leave us a review” landing. When TripAdvisor (or another review URL)
 * is configured via SITE_REVIEW_URL / localStorage override, the primary CTA
 * opens it. Until then we collect a testimonial on-site.
 */
export function LeaveAReviewPage() {
  usePageMeta({
    title: 'Leave us a review | GolfSol Ireland',
    description: 'Share your GolfSol Ireland trip experience — TripAdvisor or a short testimonial for other Irish golfers.',
    canonicalPath: '/leave-a-review'
  })

  const externalUrl =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('gsol-review-url')?.trim() || SITE_REVIEW_URL
      : SITE_REVIEW_URL
  const hasExternal = Boolean(externalUrl && /^https?:\/\//i.test(externalUrl))

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-cream">
      <GeNavbar />
      <main id="main" className="mx-auto max-w-2xl px-5 pb-20 pt-28 sm:px-8">
        <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-gs-green">Reviews</p>
        <h1 className="mt-3 font-ge text-[2rem] font-extrabold leading-tight text-gs-dark sm:text-[2.4rem]">
          Leave us a review
        </h1>
        <p className="mt-4 font-ge text-[1.05rem] leading-7 text-ge-gray600">
          If your Costa del Sol golf trip went well, a short review helps the next Irish group decide. TripAdvisor listing
          is being set up — until then you can leave a testimonial here, or open the review link once admin adds it.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {hasExternal ? (
            <GeButton href={externalUrl!} variant="gs-green" size="lg" className="w-full sm:w-auto" target="_blank" rel="noreferrer">
              Open review page
            </GeButton>
          ) : (
            <GeButton href="/testimonials" variant="gs-green" size="lg" className="w-full sm:w-auto">
              Leave a testimonial
            </GeButton>
          )}
          <GeButton href="/contact" variant="outline-gs-green" size="lg" className="w-full sm:w-auto">
            Get a quote
          </GeButton>
        </div>

        {!hasExternal ? (
          <p className="mt-6 rounded-xl border border-dashed border-chrome-300 bg-white px-4 py-3 font-ge text-sm text-ge-gray600">
            Admin tip: set a TripAdvisor (or Google) URL in the admin desk review field, or save{' '}
            <code className="rounded bg-cream px-1 font-mono text-xs">gsol-review-url</code> in localStorage / env later.
          </p>
        ) : null}
      </main>
      <GeFooter />
      <WhatsappFab />
    </div>
  )
}
