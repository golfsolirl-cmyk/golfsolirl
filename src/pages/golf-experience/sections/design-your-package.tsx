import { motion } from 'framer-motion'
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
      link: designYourPackage.step1.link
    },
    {
      badge: 'Step 2',
      title: 'Pick Your Tee Times',
      body: designYourPackage.step2.body,
      image: designYourPackage.step2.image,
      link: designYourPackage.step2.link
    },
    {
      badge: 'Step 3',
      title: 'Pick Your Hotel',
      body: designYourPackage.step3.body,
      image: designYourPackage.step3.image,
      link: designYourPackage.step3.link
    },
    {
      badge: 'Step 4',
      title: 'Leave the rest to us',
      body: 'We design the itinerary, book the tees, lock in golf-bag-friendly Mercedes transfers and meet you at AGP arrivals — every detail from arrivals hall to final putt.',
      image:
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
      link: '#enquire'
    }
  ]

  return (
    <section
      id="design-package"
      aria-labelledby="design-package-title"
      className="relative bg-gs-green text-white"
    >
      <div className="mx-auto max-w-[1180px] px-5 pb-20 pt-20 sm:px-8">
        <motion.div className="text-center" {...fadeUp}>
          <h2
            id="design-package-title"
            className="font-ge text-[1.95rem] font-extrabold leading-tight text-white sm:text-[2.4rem]"
          >
            {designYourPackage.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-ge text-base font-semibold uppercase tracking-[0.16em] text-white/80 sm:text-sm">
            Choose your destination · Choose your golf course · Choose your accommodation
          </p>
          <p className="mt-2 font-ge text-base italic text-white/80">{designYourPackage.closer}</p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <motion.article
              key={step.badge}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white text-gs-dark shadow-[0_10px_28px_rgba(0,0,0,0.22)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(0,0,0,0.32)]"
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
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/60 via-transparent to-transparent"
                />
                {/* Gold step badge */}
                <span className="absolute left-3 top-3 inline-flex min-h-[32px] items-center rounded-full bg-gradient-to-br from-gs-gold to-[#f4b41a] px-3.5 py-1 font-ge text-sm font-extrabold uppercase tracking-[0.12em] text-gs-dark shadow-[0_6px_16px_rgba(255,199,44,0.45)] sm:text-[0.8rem]">
                  {step.badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-ge text-lg font-extrabold leading-snug text-gs-green sm:text-[1.1rem]">
                  {step.title}
                </h3>
                <p className="mt-2 line-clamp-4 font-ge text-base leading-6 text-ge-gray500 sm:text-[0.95rem]">
                  {step.body}
                </p>
                <a
                  href={step.link}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 self-start rounded-full bg-gs-dark/5 px-4 py-2 font-ge text-base font-bold uppercase tracking-[0.12em] text-gs-green transition-all duration-300 hover:bg-gs-gold hover:text-gs-dark group-hover:bg-gs-gold group-hover:text-gs-dark sm:text-[0.85rem]"
                >
                  Get a Quote →
                </a>
              </div>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gs-gold via-[#f4b41a] to-ge-orange transition-transform duration-500 group-hover:scale-x-100"
              />
            </motion.article>
          ))}
        </div>

        <GeAlreadyBookedFlightPanel />
      </div>
    </section>
  )
}
