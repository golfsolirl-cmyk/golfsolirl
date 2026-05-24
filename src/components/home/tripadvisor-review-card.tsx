import { m } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import { GOLFSOL_BRAND_LOGO_HOSTED } from '../../lib/brand-logo-assets'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.52, ease: 'easeOut' }
} as const

export function StarRow({ count = 5 }: { readonly count?: number }) {
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

export type TripadvisorReviewCardProps = {
  readonly quote: string
  readonly name: string
  readonly context: string
  readonly tripType?: string
  readonly rating?: number
  readonly badge?: string
  readonly variant?: 'live' | 'sample' | 'transfer'
  readonly delayIndex?: number
}

export function TripadvisorReviewCard({
  quote,
  name,
  context,
  tripType,
  rating = 5,
  badge,
  variant = 'live',
  delayIndex = 0
}: TripadvisorReviewCardProps) {
  const isLive = variant === 'live'
  const isTransfer = variant === 'transfer'
  const isGuestStory = badge === 'Guest story'

  return (
    <m.article
      className={[
        'group relative flex h-full min-h-[280px] w-[min(100%,320px)] shrink-0 snap-center flex-col sm:w-[340px]',
        'rounded-[1.65rem] p-6 shadow-[0_18px_45px_rgba(6,59,42,0.07)] transition-[transform,box-shadow,border-color] duration-300 sm:p-7',
        'hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(6,59,42,0.1)]',
        isGuestStory
          ? 'border border-[#d9c98a]/50 bg-[#fdfbf6] ring-1 ring-gs-dark/[0.06] hover:border-brand-700/45'
          : isLive || isTransfer
            ? 'border border-brand-700/30 bg-white ring-1 ring-gs-dark/[0.04] hover:border-brand-700/55'
            : 'border border-ge-gray100 bg-gradient-to-b from-white to-ge-gray50/40 ring-1 ring-gs-dark/[0.04] hover:border-brand-700/35'
      ].join(' ')}
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: 0.05 * (delayIndex + 1) }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-700/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="flex items-start justify-between gap-3">
        <Quote className="h-8 w-8 shrink-0 text-brand-700/90" aria-hidden strokeWidth={1.75} />
        {badge ? (
          <span
            className={
              isGuestStory
                ? 'rounded-full border border-[#d4a843]/45 bg-gs-dark px-2.5 py-1 font-ge text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-[#fbe8b5] shadow-sm'
                : 'rounded-full bg-gs-dark px-2.5 py-1 font-ge text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-white'
            }
          >
            {badge}
          </span>
        ) : (
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
        )}
      </div>
      <div className="mt-4">
        <StarRow count={rating} />
        <p className="mt-4 font-ge text-[1.02rem] font-medium leading-7 text-gs-dark sm:text-[1.05rem] sm:leading-[1.65rem]">
          “{quote}”
        </p>
      </div>
      <div className="mt-auto border-t border-[#e8e4dc]/90 pt-5">
        <p className="font-ge text-sm font-extrabold text-gs-dark">{name}</p>
        <p className="mt-1 font-ge text-xs font-semibold uppercase tracking-[0.12em] text-ge-gray600">{context}</p>
        {tripType ? (
          <div className="mt-3 flex items-center gap-2.5">
            <img
              src={GOLFSOL_BRAND_LOGO_HOSTED}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 object-contain"
              loading="lazy"
              decoding="async"
              aria-hidden
            />
            <p className="inline-flex rounded-full border border-[#d4a843]/40 bg-[#f5edd6] px-2.5 py-1 font-ge text-[0.62rem] font-bold uppercase tracking-[0.14em] text-gs-dark">
              {tripType}
            </p>
          </div>
        ) : null}
      </div>
    </m.article>
  )
}
