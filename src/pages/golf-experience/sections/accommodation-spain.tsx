import { m, type Variants } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GeHotelCard } from '../components/hotel-card'
import { GeSection } from '../components/ge-section'
import { hotelListsCopy } from '../data/copy'
import { hotelsSpain } from '../data/hotels'

const cardStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08
    }
  }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }
  }
}

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

/**
 * Costa del Sol hotel grid — premium framing.
 *  • Editorial header: kicker + two-tone headline + lead line
 *  • Stagger-revealed hotel cards
 *  • "Not limited to what you see here" reassurance card with chrome trim
 *  • Dual-CTA closer panel
 */
export function GeAccommodationSpain() {
  return (
    <GeSection
      background="white"
      id="accommodation-spain"
      className="relative overflow-hidden pt-12 pb-20 sm:pt-14 sm:pb-24"
    >
      {/* Slim bridge from intro — grid starts without repeating the full headline */}
      <m.div
        {...fadeUp}
        className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
      >
        <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-gs-green sm:text-[0.76rem]">
          {hotelListsCopy.kicker}
        </p>
        <p className="mt-3 font-ge text-base leading-relaxed text-ge-gray500 sm:text-[1.05rem]">
          {hotelListsCopy.lead}
        </p>
      </m.div>

      {/* Editorial background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(11,77,59,0.08),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6rem] top-40 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,190,122,0.10),transparent_72%)] blur-3xl"
      />

      {/* —— Hotel grid —— */}
      <m.div
        variants={cardStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-14 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {hotelsSpain.map((hotel) => (
          <m.div key={hotel.name} variants={cardItem} className="h-full">
            <GeHotelCard hotel={hotel} />
          </m.div>
        ))}
      </m.div>

      {/* —— "Not limited to what you see here" —— */}
      <m.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.06 }}
        id="hotels-not-limited"
        className="relative mx-auto mt-14 max-w-[44rem] scroll-mt-28 overflow-hidden rounded-[1.6rem] border border-gs-green/20 bg-white px-7 py-7 text-center shadow-[0_22px_55px_rgba(6,59,42,0.10)] ring-1 ring-chrome-300/70 sm:px-9 sm:py-8"
      >
        {/* chrome top hairline */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
        ><div className="mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent" />
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-brand-700/[0.06] blur-3xl"
        />

        <span className="inline-flex items-center gap-2 rounded-full border border-brand-700/30 bg-gs-green/[0.06] px-3 py-1 font-ge text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-gs-green sm:text-[0.7rem]">
          <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
          Got somewhere else in mind?
        </span>

        <p className="mt-4 font-ge text-[0.98rem] font-extrabold uppercase tracking-[0.18em] text-gs-dark sm:text-[1.05rem]">
          {hotelListsCopy.beyondTitle}
        </p>
        <p className="mx-auto mt-3 max-w-[36rem] font-ge text-[1rem] leading-relaxed text-ge-gray500 sm:text-[1.05rem]">
          {hotelListsCopy.beyondBody}
        </p>
      </m.div>

      {/* —— Dual CTA closer —— */}
      <m.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4"
      >
        <GeButton href="/contact" variant="gs-green" size="lg" className="w-full sm:w-auto sm:min-w-[14rem]">
          {hotelListsCopy.cta}
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
        </GeButton>
        <GeButton
          href="#enquire"
          variant="outline-gs-green"
          size="lg"
          className="gsol-cta-outline-on-light w-full sm:w-auto sm:min-w-[14rem]"
        >
          {hotelListsCopy.secondaryCta}
        </GeButton>
      </m.div>
    </GeSection>
  )
}
