import { m  } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Quote, Star } from 'lucide-react'
import { getSupabaseBrowserClient } from '../../../lib/supabase-client'
import { GeSection } from '../components/ge-section'
import { tripadvisorReviewsSectionCopy, tripadvisorSampleReviews } from '../data/tripadvisor-sample-reviews'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.52, ease: 'easeOut' }
} as const

function StarRow({ count = 5 }: { readonly count?: number }) {
  const n = Math.min(5, Math.max(0, Math.round(count)))
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < n
              ? 'h-4 w-4 fill-brand-600 text-brand-700 sm:h-[1.05rem] sm:w-[1.05rem]'
              : 'h-4 w-4 fill-transparent text-ge-gray200 sm:h-[1.05rem] sm:w-[1.05rem]'
          }
          strokeWidth={0}
        />
      ))}
    </div>
  )
}

type PublishedGuestReview = {
  id: string
  rating: number
  comment: string
  display_name: string | null
}

export function GeHomeTripadvisorReviews() {
  const { eyebrow, title, lead, disclaimer, ctaLabel, ctaHref, ctaNote } = tripadvisorReviewsSectionCopy
  const [guestReviews, setGuestReviews] = useState<PublishedGuestReview[]>([])

  useEffect(() => {
    const sb = getSupabaseBrowserClient()
    if (!sb) {
      return
    }
    let cancelled = false
    void (async () => {
      const { data, error } = await sb
        .from('trip_reviews')
        .select('id, rating, comment, display_name')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(9)
      if (cancelled || error || !data) {
        return
      }
      setGuestReviews(data as PublishedGuestReview[])
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
            <p className="mt-4 font-ge text-[0.98rem] leading-relaxed text-ge-gray500 sm:text-[1.05rem] sm:leading-8">{lead}</p>
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
              {disclaimer}
            </p>
          </div>
        </m.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {guestReviews.map((review, index) => (
            <m.article
              key={review.id}
              className="group relative flex flex-col rounded-[1.65rem] border border-brand-700/35 bg-gradient-to-b from-white to-brand-700/[0.06] p-6 shadow-[0_18px_45px_rgba(6,59,42,0.07)] ring-1 ring-gs-dark/[0.04] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-brand-700/60 hover:shadow-[0_24px_55px_rgba(6,59,42,0.1)] sm:p-7"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 * (index + 1) }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-700/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="flex items-start justify-between gap-3">
                <Quote className="h-8 w-8 shrink-0 text-brand-700/90" aria-hidden strokeWidth={1.75} />
                <span className="rounded-full bg-gs-dark/90 px-2 py-0.5 font-ge text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-white">
                  Guest story
                </span>
              </div>
              <div className="mt-4">
                <StarRow count={review.rating} />
                <p className="mt-4 font-ge text-[1.02rem] font-medium leading-7 text-gs-dark/92 sm:text-[1.05rem] sm:leading-[1.65rem]">
                  “{review.comment || 'Great service.'}”
                </p>
              </div>
              <div className="mt-auto border-t border-ge-gray100/90 pt-5">
                <p className="font-ge text-sm font-extrabold text-gs-dark">{review.display_name ?? 'Golf Sol guest'}</p>
                <p className="mt-1 font-ge text-xs font-semibold uppercase tracking-[0.12em] text-ge-gray500">
                  Verified transfer review
                </p>
              </div>
            </m.article>
          ))}
          {tripadvisorSampleReviews.map((review, index) => (
            <m.article
              key={review.name}
              className="group relative flex flex-col rounded-[1.65rem] border border-ge-gray100 bg-gradient-to-b from-white to-ge-gray50/40 p-6 shadow-[0_18px_45px_rgba(6,59,42,0.07)] ring-1 ring-gs-dark/[0.04] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-brand-700/35 hover:shadow-[0_24px_55px_rgba(6,59,42,0.1)] sm:p-7"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 * (index + 1) }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-700/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="flex items-start justify-between gap-3">
                <Quote className="h-8 w-8 shrink-0 text-brand-700/90" aria-hidden strokeWidth={1.75} />
                <img
                  src="/images/tripadvisor-lockup.svg"
                  alt=""
                  width={120}
                  height={24}
                  className="h-5 w-auto opacity-60 transition-opacity group-hover:opacity-90"
                  loading="lazy"
                  decoding="async"
                  aria-hidden
                />
              </div>
              <div className="mt-4">
                <StarRow count={5} />
                <p className="mt-4 font-ge text-[1.02rem] font-medium leading-7 text-gs-dark/92 sm:text-[1.05rem] sm:leading-[1.65rem]">
                  “{review.quote}”
                </p>
              </div>
              <div className="mt-auto border-t border-ge-gray100/90 pt-5">
                <p className="font-ge text-sm font-extrabold text-gs-dark">{review.name}</p>
                <p className="mt-1 font-ge text-xs font-semibold uppercase tracking-[0.12em] text-ge-gray500">{review.context}</p>
                <p className="mt-2 inline-flex rounded-full border border-brand-700/25 bg-brand-700/10 px-2.5 py-0.5 font-ge text-[0.62rem] font-bold uppercase tracking-[0.14em] text-gs-dark/80">
                  {review.tripType}
                </p>
              </div>
            </m.article>
          ))}
        </div>

        <m.div
          className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-3 text-center sm:mt-14"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
        >
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-gs-green/25 bg-gs-dark px-6 py-3 font-ge text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_14px_36px_rgba(6,59,42,0.18)] transition-colors hover:border-brand-700 hover:bg-gs-green"
          >
            {ctaLabel}
          </a>
          <p className="max-w-md font-ge text-[0.72rem] leading-relaxed text-ge-gray500">{ctaNote}</p>
        </m.div>
      </div>
    </GeSection>
  )
}
