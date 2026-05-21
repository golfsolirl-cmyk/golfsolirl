import { m, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TripadvisorReviewCard } from '../../../components/home/tripadvisor-review-card'
import { getSupabaseBrowserClient } from '../../../lib/supabase-client'
import { GeSection } from '../components/ge-section'
import { tripadvisorReviewsSectionCopy, tripadvisorSampleReviews } from '../data/tripadvisor-sample-reviews'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.52, ease: 'easeOut' }
} as const

type WebsiteTestimonialRow = {
  id: string
  author_name: string
  trip_type: string
  travel_month: string | null
  quote_text: string
  rating: number
}

type PublishedGuestReview = {
  id: string
  rating: number
  comment: string
  display_name: string | null
}

type ReviewCarouselItem = {
  id: string
  quote: string
  name: string
  context: string
  tripType?: string
  rating: number
  variant: 'live' | 'sample' | 'transfer'
  badge?: string
}

function buildContext(tripType: string, travelMonth: string | null) {
  const parts = [tripType]
  if (travelMonth?.trim()) {
    parts.push(travelMonth.trim())
  }
  return parts.join(' · ')
}

export function GeHomeTripadvisorReviews() {
  const reduceMotion = useReducedMotion()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [websiteTestimonials, setWebsiteTestimonials] = useState<WebsiteTestimonialRow[]>([])
  const [transferReviews, setTransferReviews] = useState<PublishedGuestReview[]>([])
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const liveCount = websiteTestimonials.length + transferReviews.length
  const hasLive = liveCount > 0

  const { eyebrow, title, lead, disclaimer, ctaLabel, ctaHref, ctaNote } = tripadvisorReviewsSectionCopy

  const sectionLead = hasLive
    ? 'Real feedback from Irish groups who travelled with Golf Sol — fresh stories from our testimonials page and transfer reviews.'
    : lead

  const sectionDisclaimer = hasLive
    ? `${liveCount} live review${liveCount === 1 ? '' : 's'} on your homepage · sample cards hidden while guest stories are showing`
    : disclaimer

  useEffect(() => {
    const sb = getSupabaseBrowserClient()
    if (!sb) {
      return
    }
    let cancelled = false
    void (async () => {
      const [testimonialRes, transferRes] = await Promise.all([
        sb
          .from('website_testimonials')
          .select('id, author_name, trip_type, travel_month, quote_text, rating')
          .is('hidden_at', null)
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(24),
        sb
          .from('trip_reviews')
          .select('id, rating, comment, display_name')
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(12)
      ])
      if (cancelled) {
        return
      }
      if (!testimonialRes.error && testimonialRes.data) {
        setWebsiteTestimonials(testimonialRes.data as WebsiteTestimonialRow[])
      }
      if (!transferRes.error && transferRes.data) {
        setTransferReviews(transferRes.data as PublishedGuestReview[])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const carouselItems: ReviewCarouselItem[] = hasLive
    ? [
        ...websiteTestimonials.map((row) => ({
          id: `wt-${row.id}`,
          quote: row.quote_text,
          name: row.author_name,
          context: buildContext(row.trip_type, row.travel_month),
          tripType: row.trip_type,
          rating: row.rating,
          variant: 'live' as const,
          badge: 'Guest story'
        })),
        ...transferReviews.map((row) => ({
          id: `tr-${row.id}`,
          quote: row.comment || 'Great service.',
          name: row.display_name ?? 'Golf Sol guest',
          context: 'Verified transfer review',
          rating: row.rating,
          variant: 'transfer' as const,
          badge: 'Transfer review'
        }))
      ]
    : tripadvisorSampleReviews.map((review, index) => ({
        id: `sample-${index}`,
        quote: review.quote,
        name: review.name,
        context: review.context,
        tripType: review.tripType,
        rating: 5,
        variant: 'sample' as const
      }))

  const updateScrollHints = useCallback(() => {
    const el = scrollRef.current
    if (!el) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < maxScroll - 8)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) {
      return
    }
    updateScrollHints()
    el.addEventListener('scroll', updateScrollHints, { passive: true })
    const ro = new ResizeObserver(updateScrollHints)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollHints)
      ro.disconnect()
    }
  }, [carouselItems.length, updateScrollHints])

  useEffect(() => {
    if (reduceMotion || carouselItems.length < 4) {
      return
    }
    const el = scrollRef.current
    if (!el || el.scrollWidth <= el.clientWidth + 16) {
      return
    }
    let paused = false
    const onEnter = () => {
      paused = true
    }
    const onLeave = () => {
      paused = false
    }
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('focusin', onEnter)
    el.addEventListener('focusout', onLeave)

    const tick = window.setInterval(() => {
      if (paused) {
        return
      }
      const maxScroll = el.scrollWidth - el.clientWidth
      if (maxScroll <= 0) {
        return
      }
      const next = el.scrollLeft >= maxScroll - 4 ? 0 : el.scrollLeft + 280
      el.scrollTo({ left: next, behavior: 'smooth' })
    }, 5200)

    return () => {
      window.clearInterval(tick)
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('focusin', onEnter)
      el.removeEventListener('focusout', onLeave)
    }
  }, [carouselItems.length, reduceMotion])

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollRef.current
    if (!el) {
      return
    }
    el.scrollBy({ left: direction * Math.min(340, el.clientWidth * 0.85), behavior: 'smooth' })
  }

  return (
    <GeSection
      id="tripadvisor-reviews"
      background="white"
      className="relative isolate border-t border-[#e8e4dc] pt-16 pb-20 sm:pt-20 sm:pb-24"
      innerClassName="relative z-[1]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-700/50 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-gs-green/[0.06] blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-brand-700/[0.08] blur-[80px]"
      />

      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <m.div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" {...fadeUp}>
          <div className="max-w-2xl">
            <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-gs-green">{eyebrow}</p>
            <h2 className="mt-3 font-ge text-[1.85rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-gs-dark sm:text-[2.15rem] lg:text-[2.35rem]">
              {title}
            </h2>
            <p className="mt-4 font-ge text-[0.98rem] leading-relaxed text-ge-gray500 sm:text-[1.05rem] sm:leading-8">
              {sectionLead}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end lg:items-end">
            <img
              src="/images/tripadvisor-lockup.svg"
              alt="Tripadvisor"
              width={200}
              height={40}
              className="h-9 w-auto opacity-95 sm:h-10"
              loading="lazy"
              decoding="async"
            />
            <p className="max-w-xs text-left font-ge text-[0.68rem] font-semibold uppercase leading-snug tracking-[0.14em] text-ge-gray500 sm:text-right">
              {sectionDisclaimer}
            </p>
          </div>
        </m.div>

        <div className="relative mt-12">
          {carouselItems.length > 1 ? (
            <div className="mb-4 flex items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Scroll reviews left"
                disabled={!canScrollLeft}
                onClick={() => scrollByPage(-1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ge-gray200 bg-white text-gs-dark shadow-sm transition enabled:hover:border-brand-700/40 enabled:hover:bg-brand-700/5 disabled:opacity-35"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Scroll reviews right"
                disabled={!canScrollRight}
                onClick={() => scrollByPage(1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ge-gray200 bg-white text-gs-dark shadow-sm transition enabled:hover:border-brand-700/40 enabled:hover:bg-brand-700/5 disabled:opacity-35"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
          ) : null}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-8 bg-gradient-to-r from-white to-transparent sm:w-12"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-8 bg-gradient-to-l from-white to-transparent sm:w-12"
          />

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="region"
            aria-label="Traveller reviews carousel"
            tabIndex={0}
          >
            {carouselItems.map((review, index) => (
              <TripadvisorReviewCard
                key={review.id}
                quote={review.quote}
                name={review.name}
                context={review.context}
                tripType={review.tripType}
                rating={review.rating}
                badge={review.badge}
                variant={review.variant}
                delayIndex={index}
              />
            ))}
          </div>
        </div>

        <m.div
          className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-3 text-center sm:mt-14"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
        >
          <a
            href={hasLive ? '/testimonials' : ctaHref}
            target={hasLive ? undefined : '_blank'}
            rel={hasLive ? undefined : 'noopener noreferrer'}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-gs-green/25 bg-gs-dark px-6 py-3 font-ge text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_14px_36px_rgba(6,59,42,0.18)] transition-colors hover:border-brand-700 hover:bg-gs-green"
          >
            {hasLive ? 'Share your trip story' : ctaLabel}
          </a>
          <p className="max-w-md font-ge text-[0.72rem] leading-relaxed text-ge-gray500">
            {hasLive
              ? 'Travelled with us? Submit a review on our testimonials page — we approve it before it appears here.'
              : ctaNote}
          </p>
        </m.div>
      </div>
    </GeSection>
  )
}
