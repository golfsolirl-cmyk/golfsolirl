import { motion } from 'framer-motion'
import type { GeHotel } from '../data/hotels'

interface HotelCardProps {
  readonly hotel: GeHotel
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' }
} as const

export function GeHotelCard({ hotel }: HotelCardProps) {
  return (
    <motion.a
      href={hotel.href}
      className="group flex flex-col overflow-hidden rounded-sm border border-ge-gray100 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)]"
      {...fadeUp}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="border-t-2 border-gs-green px-4 py-3">
        <h3 className="font-ge text-lg font-bold leading-snug text-gs-green sm:text-[1rem]">
          {hotel.name}
        </h3>
        <p className="mt-1 font-ge text-sm uppercase tracking-[0.1em] text-ge-gray500 sm:text-[0.8rem]">
          {hotel.area}
        </p>
      </div>
    </motion.a>
  )
}
