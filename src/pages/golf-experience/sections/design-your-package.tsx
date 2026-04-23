import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { GeAlreadyBookedFlightPanel } from '../components/already-booked-flight-panel'
import { designYourPackage } from '../data/copy'

interface StepCard {
  readonly badge: string
  readonly title: string
  readonly body: string
  readonly image: string
  readonly link: string
}

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

export function GeDesignYourPackage() {
  // 4 steps — Costa del Sol focused, all CTAs route into the quote flow.
  const steps: readonly StepCard[] = [
    {
      badge: 'Step 1',
      title: 'Pick Your Sol Base',
      body: designYourPackage.step1.body,
      image: designYourPackage.step1.image,
      link: '/accommodation'
    },
    {
      badge: 'Step 2',
      title: 'Pick Your Tee Times',
      body: designYourPackage.step2.body,
      image: designYourPackage.step2.image,
      link: '/golf-courses'
    },
    {
      badge: 'Step 3',
      title: 'Pick Your Hotel',
      body: designYourPackage.step3.body,
      image: designYourPackage.step3.image,
      link: '/accommodation'
    },
    {
      badge: 'Step 4',
      title: 'Leave the rest to us',
      body: 'We design the itinerary, book the tees, lock in golf-bag-friendly Mercedes transfers and meet you at AGP arrivals — every detail from arrivals hall to final putt.',
      image:
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
      link: '/contact'
    }
  ]

  return (
    <section
      id="design-package"
      aria-labelledby="design-package-title"
      className="relative overflow-hidden bg-[#f6f0e2] text-gs-dark"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,199,44,0.24),_transparent_28%),radial-gradient(circle_at_85%_16%,_rgba(6,59,42,0.15),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(246,240,226,0.98)_36%,_rgba(235,227,207,0.96)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(90deg,transparent_0%,rgba(255,199,44,0.82)_20%,rgba(255,226,122,1)_50%,rgba(255,199,44,0.82)_80%,transparent_100%)] opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-28 h-64 w-[min(68rem,92vw)] -translate-x-1/2 rounded-full bg-gs-dark/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1180px] px-5 pb-24 pt-24 sm:px-8">
        <motion.div
          className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gs-dark px-6 py-10 text-center shadow-[0_28px_80px_rgba(6,59,42,0.22)] sm:px-10 sm:py-12"
          {...fadeUp}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,199,44,0.28),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_28%),linear-gradient(135deg,_rgba(6,59,42,0.96),_rgba(8,44,33,0.93)_48%,_rgba(10,30,22,0.96)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-gs-gold/90 to-transparent"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-gs-gold/35 bg-white/6 px-4 py-2 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-gs-gold-light">
              <Sparkles className="h-3.5 w-3.5 text-gs-gold" aria-hidden />
              Concierge-built trip design
            </span>
            <h2
              id="design-package-title"
              className="mx-auto mt-5 max-w-4xl text-balance font-ge text-[2.35rem] font-extrabold leading-[1.02] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)] sm:text-[2.95rem] lg:text-[3.45rem]"
            >
              {designYourPackage.title}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-balance font-ge text-[0.86rem] font-semibold uppercase tracking-[0.22em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)] sm:text-[0.96rem]">
              Choose your destination · Choose your golf course · Choose your accommodation
            </p>
            <p className="mx-auto mt-4 max-w-2xl font-ge text-[1.05rem] leading-8 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.28)] sm:text-[1.12rem]">
              {designYourPackage.closer}{' '}
              <span className="font-semibold text-gs-gold-light">We shape the full Sol itinerary around your group.</span>
            </p>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <motion.article
              key={step.badge}
              className="group relative flex flex-col overflow-hidden rounded-[1.8rem] border border-white/75 bg-white/88 text-gs-dark shadow-[0_18px_45px_rgba(69,53,24,0.14)] ring-1 ring-[#e6dcc5] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_rgba(69,53,24,0.2)]"
              {...fadeUp}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/70 via-gs-dark/12 to-transparent"
                />
                <span className="absolute left-3 top-3 inline-flex min-h-[36px] items-center rounded-full border border-white/30 bg-white/92 px-3.5 py-1.5 font-ge text-[0.86rem] font-extrabold uppercase tracking-[0.12em] text-gs-dark shadow-[0_10px_24px_rgba(12,32,24,0.18)] sm:min-h-[32px] sm:py-1 sm:text-[0.76rem]">
                  {step.badge}
                </span>
                <div
                  aria-hidden="true"
                  className="absolute inset-x-5 bottom-4 h-px bg-gradient-to-r from-white/0 via-gs-gold/90 to-white/0 opacity-90"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="font-ge text-[0.7rem] font-bold uppercase tracking-[0.22em] text-ge-gray500">
                  Costa del Sol step
                </p>
                <h3 className="mt-2 font-ge text-[1.26rem] font-extrabold leading-snug text-gs-dark sm:text-[1.14rem]">
                  {step.title}
                </h3>
                <p className="mt-3 line-clamp-4 font-ge text-[1.01rem] leading-7 text-ge-gray500 sm:text-[0.95rem]">
                  {step.body}
                </p>
                <a
                  href={step.link}
                  className="mt-5 inline-flex min-h-[48px] items-center gap-2 self-start rounded-full border border-gs-dark/12 bg-gs-dark px-4 py-2.5 font-ge text-[0.92rem] font-bold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:bg-gs-gold hover:text-gs-dark group-hover:border-gs-gold/60 group-hover:bg-gs-gold group-hover:text-gs-dark sm:min-h-[44px] sm:py-2 sm:text-[0.8rem]"
                >
                  Get a Quote
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-gs-gold via-[#f4b41a] to-ge-orange transition-transform duration-500 group-hover:scale-x-100"
              />
            </motion.article>
          ))}
        </div>

        <GeAlreadyBookedFlightPanel />
      </div>
    </section>
  )
}
