import { LeanPublicHero } from '../components/home/premium-golf-hero'
import { WhatsAppBanner } from '../components/whatsapp/WhatsAppBanner'
import { NAMED_HERO_IMAGE_SETS } from '../lib/page-hero-images'
import { usePageMeta } from '../lib/use-page-meta'
import { SITE_REVIEW_URL } from '../data/site-review'
import { GeButton } from './golf-experience/components/ge-button'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'

/**
 * Simple “Leave us a review” landing. When TripAdvisor (or another review URL)
 * is configured via SITE_REVIEW_URL / localStorage override, the primary CTA
 * opens it. Until then we collect a testimonial on-site.
 */
export function LeaveAReviewPage() {
  usePageMeta({
    title: 'Leave us a review | GolfSol Ireland',
    description:
      'Share your GolfSol Ireland trip experience — TripAdvisor or a short testimonial for other Irish golfers.',
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
      <main id="main">
        <LeanPublicHero
          ariaLabel="Leave us a review"
          images={NAMED_HERO_IMAGE_SETS.quoteCostaGolf}
          kicker="GolfSol Ireland"
          lead="If your Costa del Sol golf trip went well, a short review helps the next Irish group decide."
          primaryCta={
            hasExternal
              ? { label: 'Open review page', href: externalUrl! }
              : { label: 'Leave a testimonial', href: '/testimonials' }
          }
          secondaryCta={{ label: 'Get a quote', href: '/quote' }}
          title="Leave us a review"
        />

        <section className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-16">
          <p className="font-ge text-[1.05rem] leading-7 text-ge-gray600">
            TripAdvisor listing is being set up — until then you can leave a testimonial here, or open the review link
            once admin adds it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {hasExternal ? (
              <GeButton
                href={externalUrl!}
                variant="gs-green"
                size="lg"
                className="w-full sm:w-auto"
                target="_blank"
                rel="noreferrer"
              >
                Open review page
              </GeButton>
            ) : (
              <GeButton href="/testimonials" variant="gs-green" size="lg" className="w-full sm:w-auto">
                Leave a testimonial
              </GeButton>
            )}
            <GeButton href="/quote" variant="outline-gs-green" size="lg" className="w-full sm:w-auto">
              Get a quote
            </GeButton>
          </div>
        </section>
      </main>
      <WhatsAppBanner sourcePage="/leave-a-review" />
      <GeFooter />
    </div>
  )
}
