import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Star } from 'lucide-react'
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

/**
 * Premium hotel card.
 *  - Hero photo with overlaid star rating + area chip
 *  - Tagline + nearest-course chip in the body for instant context
 *  - Hover: lift, image zoom, gold underline reveal, CTA fills gold
 */
export function GeHotelCard({ hotel }: HotelCardProps) {
  return (
    <motion.a
      href={hotel.href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ge-gray100 bg-white shadow-[0_6px_20px_rgba(6,59,42,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(6,59,42,0.18)]"
      {...fadeUp}
    >
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/75 via-gs-dark/10 to-transparent"
        />
        {/* Top row: flex keeps stars + area chip from colliding on narrow 4-up grids */}
        <div className="pointer-events-none absolute left-2 right-2 top-2 z-10 flex flex-wrap items-start justify-between gap-2 sm:left-3 sm:right-3 sm:top-3">
          <div className="flex flex-wrap items-start gap-2">
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-gs-gold/60 bg-gs-dark/90 px-2 py-0.5 shadow-[0_8px_18px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-2.5 sm:py-1">
              {Array.from({ length: hotel.stars }).map((_, idx) => (
                <Star
                  key={idx}
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                  aria-hidden="true"
                  fill="#FFC72C"
                  stroke="#FFC72C"
                  strokeWidth={1.5}
                />
              ))}
            </span>
            {hotel.badge ? (
              <span className="inline-flex max-w-[11rem] items-center rounded-full border border-[#0f8a48]/18 bg-[#ecfff4] px-2.5 py-1 font-ge text-[0.62rem] font-extrabold uppercase leading-tight tracking-[0.12em] text-[#0f8a48] shadow-[0_8px_18px_rgba(15,138,72,0.14)] sm:max-w-none sm:text-[0.68rem]">
                {hotel.badge}
              </span>
            ) : null}
          </div>
          <span className="inline-flex min-w-0 max-w-[min(100%,10.5rem)] items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 font-ge text-[0.65rem] font-bold uppercase leading-tight tracking-[0.08em] text-gs-green shadow-[0_4px_12px_rgba(0,0,0,0.18)] sm:max-w-[12rem] sm:px-3 sm:text-[0.75rem] sm:tracking-[0.1em]">
            <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            <span className="truncate">{hotel.area}</span>
          </span>
        </div>
        {/* Hotel name — line clamp so long names never grow up under the chips */}
        <h3 className="absolute bottom-2 left-3 right-3 line-clamp-2 font-ge text-base font-extrabold leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] sm:bottom-3 sm:left-4 sm:right-4 sm:text-[1.15rem]">
          {hotel.name}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <p className="font-ge text-base leading-6 text-ge-gray500 sm:text-[0.92rem]">
          {hotel.tagline}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-ge-gray100 pt-3">
          <span className="font-ge text-xs font-bold uppercase tracking-[0.08em] text-gs-green sm:text-[0.72rem]">
            {hotel.nearestCourse}
          </span>
          <span className="inline-flex items-center gap-1 font-ge text-sm font-bold uppercase tracking-[0.1em] text-ge-orange transition-colors group-hover:text-gs-dark sm:text-[0.78rem]">
            Get Quote
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>

      {/* Bottom gold accent bar that grows on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gs-gold via-[#f4b41a] to-ge-orange transition-transform duration-500 group-hover:scale-x-100"
      />
    </motion.a>
  )
}
