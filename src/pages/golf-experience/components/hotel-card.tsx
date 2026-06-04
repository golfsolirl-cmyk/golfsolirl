import { m  } from 'framer-motion'
import { ArrowRight, MapPin, Star } from 'lucide-react'
import { cx } from '../../../lib/utils'
import type { GeHotel } from '../data/hotels'

interface HotelCardProps {
  readonly hotel: GeHotel
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' }
} as const

function HotelStarRating({ stars }: { readonly stars: GeHotel['stars'] }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[#c9a84a]/45 bg-cream px-2.5 py-1"
      aria-label={`${stars} star hotel`}
    >
      {Array.from({ length: stars }).map((_, idx) => (
        <Star
          key={idx}
          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          aria-hidden="true"
          fill="#b8922e"
          stroke="#b8922e"
          strokeWidth={1}
        />
      ))}
    </span>
  )
}

function HotelAreaChip({ area }: { readonly area: string }) {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-gs-green/15 bg-white px-3 py-1 font-ge text-[0.72rem] font-bold uppercase leading-snug tracking-[0.08em] text-gs-green sm:text-[0.78rem] sm:tracking-[0.1em]">
      <MapPin className="h-3.5 w-3.5 shrink-0 text-gs-green/80" aria-hidden="true" />
      <span className="truncate">{area}</span>
    </span>
  )
}

/**
 * Premium hotel card.
 *  - Hero photo with hotel name only (no overlay chips)
 *  - Star rating + area sit in the card body for clear, readable labels
 *  - Tagline + nearest-course chip in the body for instant context
 *  - Hover: lift, image zoom, gold underline reveal, CTA fills gold
 */
export function GeHotelCard({ hotel }: HotelCardProps) {
  const isHighlight = Boolean(hotel.highlight)
  const editorialBadge = hotel.badge?.trim()

  return (
    <m.a
      href={hotel.href}
      className={cx(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-all duration-500 hover:-translate-y-1.5',
        isHighlight
          ? 'border-[3px] border-gs-green shadow-[0_10px_32px_rgba(11,107,69,0.22)] ring-2 ring-gs-green/25 hover:shadow-[0_22px_56px_rgba(11,107,69,0.28)]'
          : 'border border-ge-gray100 shadow-[0_6px_20px_rgba(6,59,42,0.08)] hover:shadow-[0_22px_50px_rgba(6,59,42,0.18)]'
      )}
      {...fadeUp}
    >
      {isHighlight && editorialBadge ? (
        <div className="border-b border-[#c9a84a]/35 bg-gs-green px-3 py-2.5 text-center sm:px-4">
          <span className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#f4dfa6] sm:text-[0.72rem] sm:tracking-[0.18em]">
            {editorialBadge}
          </span>
        </div>
      ) : null}

      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04130c]/92 via-[#04130c]/35 to-transparent"
        />
        <h3
          style={{ color: '#ffffff' }}
          className="absolute bottom-2 left-3 right-3 font-ge text-[1.02rem] font-extrabold leading-snug tracking-[0.01em] text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)] sm:bottom-3 sm:left-4 sm:right-4 sm:text-[1.18rem]"
        >
          {hotel.name}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <HotelStarRating stars={hotel.stars} />
          <HotelAreaChip area={hotel.area} />
        </div>
        {!isHighlight && editorialBadge ? (
          <span className="inline-flex w-fit items-center rounded-md border border-brand-700/20 bg-cream px-2.5 py-1 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-gs-green">
            {editorialBadge}
          </span>
        ) : null}
        <p className="font-ge text-base leading-6 text-ge-gray500 sm:text-[0.92rem]">{hotel.tagline}</p>
        <div className="mt-auto flex flex-col gap-3 border-t border-ge-gray100 pt-4">
          <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-gs-green/20 bg-gs-green/[0.06] px-3 py-1.5 font-ge text-[0.8125rem] font-semibold leading-snug text-gs-green">
            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
            <span className="truncate">{hotel.nearestCourse}</span>
          </span>
          <span
            className="ge-hotel-card-cta gsol-cta-primary inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 font-ge text-[0.8125rem] font-bold uppercase tracking-[0.08em] sm:text-[0.875rem]"
          >
            Get quote
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-800 via-[#136047] to-brand-700 transition-transform duration-500 group-hover:scale-x-100"
      />
    </m.a>
  )
}
