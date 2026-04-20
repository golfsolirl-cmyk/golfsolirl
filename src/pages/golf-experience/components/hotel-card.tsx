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
        {/* Star rating pill — dark-green pill with gold filled stars so it
            stays legible over any photo. */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-0.5 rounded-full border border-gs-gold/60 bg-gs-dark/90 px-2.5 py-1 shadow-[0_8px_18px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          {Array.from({ length: hotel.stars }).map((_, idx) => (
            <Star
              key={idx}
              className="h-3.5 w-3.5"
              aria-hidden="true"
              fill="#FFC72C"
              stroke="#FFC72C"
              strokeWidth={1.5}
            />
          ))}
        </span>
        {/* Area chip */}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 font-ge text-xs font-bold uppercase tracking-[0.1em] text-gs-green shadow-[0_4px_12px_rgba(0,0,0,0.18)] sm:text-[0.75rem]">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {hotel.area}
        </span>
        {/* Hotel name on the photo */}
        <h3 className="absolute bottom-3 left-4 right-4 font-ge text-lg font-extrabold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] sm:text-[1.15rem]">
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
