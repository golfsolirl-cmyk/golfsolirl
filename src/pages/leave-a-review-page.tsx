import { ExternalLink } from 'lucide-react'
import { LeanPublicHero } from '../components/home/premium-golf-hero'
import { TripadvisorOwlMark } from '../components/tripadvisor-badge'
import { WhatsAppBanner } from '../components/whatsapp/WhatsAppBanner'
import { NAMED_HERO_IMAGE_SETS } from '../lib/page-hero-images'
import { usePageMeta } from '../lib/use-page-meta'
import { getTripadvisorListingHref, getTripadvisorUrls, getTripadvisorWriteReviewHref } from '../lib/tripadvisor'
import { GeButton } from './golf-experience/components/ge-button'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'

/**
 * “Leave us a review” landing — Tripadvisor is the primary CTA (listing is live).
 * On-site testimonial form remains a secondary option.
 */
export function LeaveAReviewPage() {
  usePageMeta({
    title: 'Leave us a review | GolfSol Ireland',
    description:
      'Share your GolfSol Ireland trip experience on Tripadvisor, or leave a short testimonial for other Irish golfers.',
    canonicalPath: '/leave-a-review'
  })

  const { isSearchFallback } = getTripadvisorUrls()
  const writeHref = getTripadvisorWriteReviewHref()
  const listingHref = getTripadvisorListingHref()

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-cream">
      <GeNavbar />
      <main id="main">
        <LeanPublicHero
          ariaLabel="Leave us a review"
          images={NAMED_HERO_IMAGE_SETS.quoteCostaGolf}
          kicker="GolfSol Ireland"
          lead="If your Costa del Sol golf trip went well, a short Tripadvisor review helps the next Irish group decide."
          primaryCta={{ label: 'Review us on Tripadvisor', href: writeHref, external: true }}
          secondaryCta={{ label: 'Leave a testimonial', href: '/testimonials' }}
          title="Leave us a review"
        />

        <section className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex items-start gap-4 rounded-2xl border border-forest-100 bg-white p-5 shadow-sm sm:p-6">
            <TripadvisorOwlMark className="mt-0.5 h-10 w-10 shrink-0" />
            <div>
              <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-gs-green">
                Live on Tripadvisor
              </p>
              <h2 className="mt-2 font-ge text-[1.35rem] font-extrabold tracking-tight text-forest-950">
                Review us on Tripadvisor
              </h2>
              <p className="mt-2 font-ge text-[1.02rem] leading-7 text-ge-gray600">
                {isSearchFallback
                  ? 'Our Tripadvisor listing link is temporarily unavailable — search for Golf Sol Ireland on Tripadvisor, or leave an on-site testimonial below.'
                  : 'We are officially listed as Golf Sol Ireland on Tripadvisor. Honest feedback from Irish golfers who travelled with us means a lot.'}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <GeButton
                  href={writeHref}
                  variant="gs-green"
                  size="lg"
                  className="w-full sm:w-auto"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Review us on Tripadvisor
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                </GeButton>
                {!isSearchFallback ? (
                  <GeButton
                    href={listingHref}
                    variant="outline-gs-green"
                    size="lg"
                    className="w-full sm:w-auto"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View our listing
                  </GeButton>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-forest-100 pt-10">
            <h2 className="font-ge text-[1.15rem] font-extrabold tracking-tight text-forest-950">
              Prefer to leave a testimonial here?
            </h2>
            <p className="mt-2 font-ge text-[1.02rem] leading-7 text-ge-gray600">
              You can also share a short note on our site — useful if you would rather not use Tripadvisor.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <GeButton href="/testimonials" variant="outline-gs-green" size="lg" className="w-full sm:w-auto">
                Leave a testimonial
              </GeButton>
              <GeButton href="/quote" variant="outline-gs-green" size="lg" className="w-full sm:w-auto">
                Get a quote
              </GeButton>
            </div>
          </div>
        </section>
      </main>
      <WhatsAppBanner sourcePage="/leave-a-review" />
      <GeFooter />
    </div>
  )
}
