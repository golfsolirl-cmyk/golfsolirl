import { motion } from 'framer-motion'
import { ArrowRight, Flag, Hotel, MapPin, Sparkles, type LucideIcon } from 'lucide-react'
import { GeAlreadyBookedFlightPanel } from '../components/already-booked-flight-panel'
import { designYourPackage } from '../data/copy'

interface StepCard {
  readonly badge: string
  readonly title: string
  readonly body: string
  readonly image: string
  readonly link: string
  readonly callout: string
  readonly accent: string
  readonly icon: LucideIcon
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
      badge: '01',
      title: 'Choose your Costa del Sol base',
      body: designYourPackage.step1.body,
      image: designYourPackage.step1.image,
      link: '/accommodation',
      callout: 'Fuengirola to Sotogrande',
      accent: 'from-gs-green via-gs-green/70 to-gs-gold',
      icon: MapPin
    },
    {
      badge: '02',
      title: 'Choose your golf course',
      body: designYourPackage.step2.body,
      image: designYourPackage.step2.image,
      link: '/golf-courses',
      callout: 'Priority tee-sheet access',
      accent: 'from-gs-gold via-gs-gold-light to-ge-orange',
      icon: Flag
    },
    {
      badge: '03',
      title: 'Choose your accommodation',
      body: designYourPackage.step3.body,
      image: designYourPackage.step3.image,
      link: '/accommodation',
      callout: 'Irish-group favourites',
      accent: 'from-ge-orange via-gs-gold to-gs-green',
      icon: Hotel
    },
    {
      badge: '04',
      title: 'Leave the rest to us',
      body: 'We design the itinerary, book the tees, lock in golf-bag-friendly Mercedes transfers and meet you at AGP arrivals — every detail from arrivals hall to final putt.',
      image:
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
      link: '/contact',
      callout: 'Transfers, timings, concierge',
      accent: 'from-gs-dark via-gs-green to-gs-gold',
      icon: Sparkles
    }
  ]

  const tripPillars = [
    'Irish-owned concierge from quote to touchdown',
    'Luxury transfers built around golf bags and group timings',
    'Fast quote turnaround with one team managing the full itinerary'
  ] as const

  return (
    <section
      id="design-package"
      aria-labelledby="design-package-title"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#fbfaf5_0%,#f4f7f5_46%,#eef4f0_100%)] text-gs-dark"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-8%] top-20 h-56 w-56 rounded-full bg-gs-gold/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-[-5%] h-64 w-64 rounded-full bg-gs-green/15 blur-3xl"
      />

      <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-24 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 px-6 py-7 shadow-[0_30px_90px_rgba(6,59,42,0.12)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,199,44,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(11,107,69,0.12),transparent_38%)]"
          />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] lg:items-end">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-gs-gold/60 bg-white/80 px-4 py-2 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-gs-dark shadow-[0_14px_30px_rgba(255,199,44,0.12)]">
                <span className="h-2 w-2 rounded-full bg-gs-gold" aria-hidden="true" />
                Bespoke trip builder
              </div>
              <h2
                id="design-package-title"
                className="mt-5 max-w-3xl font-ge text-[2.35rem] font-extrabold leading-[1.02] text-gs-dark sm:text-[2.85rem] lg:text-[3.15rem]"
              >
                {designYourPackage.title}
              </h2>
              <p className="mt-4 max-w-2xl font-ge text-[0.98rem] font-bold uppercase tracking-[0.18em] text-gs-green sm:text-[1.02rem]">
                Choose your destination · Choose your golf course · Choose your accommodation
              </p>
              <p className="mt-4 max-w-2xl font-ge text-[1.06rem] leading-7 text-ge-gray500 sm:text-[1.12rem]">
                Map the stay, the tee sheet and the handoff to our local team in one clean flow.
              </p>
              <p className="mt-3 font-ge text-[1.08rem] italic text-gs-dark/78">{designYourPackage.closer}</p>
            </motion.div>

            <motion.aside
              {...fadeUp}
              className="relative overflow-hidden rounded-[1.75rem] border border-gs-dark/10 bg-[linear-gradient(145deg,#0a4f39_0%,#063B2A_52%,#04261d_100%)] p-6 text-white shadow-[0_24px_70px_rgba(6,59,42,0.22)]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-14 top-0 h-36 w-36 rounded-full border border-gs-gold/20"
              />
              <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-gs-gold-light">
                Irish-owned concierge
              </p>
              <h3 className="mt-3 max-w-sm font-ge text-[1.45rem] font-extrabold leading-tight text-white sm:text-[1.65rem]">
                A premium golf itinerary, assembled around your group instead of a generic package.
              </h3>
              <div className="mt-6 space-y-3">
                {tripPillars.map((pillar) => (
                  <div
                    key={pillar}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-gs-gold shadow-[0_0_0_5px_rgba(255,199,44,0.12)]"
                    />
                    <p className="font-ge text-sm leading-6 text-white/88">{pillar}</p>
                  </div>
                ))}
              </div>
            </motion.aside>
          </div>

          <div className="relative mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => {
              const StepIcon = step.icon

              return (
                <motion.article
                  key={step.badge}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-gs-dark/8 bg-white/96 text-gs-dark shadow-[0_18px_48px_rgba(6,59,42,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_64px_rgba(6,59,42,0.14)]"
                  {...fadeUp}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${step.accent}`}
                  />
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/58 via-gs-dark/10 to-transparent"
                    />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/88 px-2.5 py-2 shadow-[0_18px_30px_rgba(6,59,42,0.12)] backdrop-blur">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gs-dark font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-gs-gold">
                        {step.badge}
                      </span>
                      <span className="pr-1 font-ge text-[0.64rem] font-bold uppercase tracking-[0.16em] text-gs-dark/80">
                        {step.callout}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gs-bg text-gs-green ring-1 ring-gs-green/10">
                        <StepIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-gs-green">
                          Step {step.badge}
                        </p>
                        <h3 className="mt-1 font-ge text-[1.22rem] font-extrabold leading-snug text-gs-dark">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-4 font-ge text-[0.97rem] leading-7 text-ge-gray500">{step.body}</p>
                    <a
                      href={step.link}
                      className="mt-auto inline-flex min-h-[44px] items-center gap-2 pt-6 font-ge text-[0.8rem] font-extrabold uppercase tracking-[0.16em] text-gs-dark transition-colors duration-300 hover:text-gs-green"
                    >
                      Explore this step
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </motion.article>
              )
            })}
          </div>

          <div className="relative mt-14 overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#0a4f39_0%,#063B2A_52%,#04261d_100%)] px-6 py-8 shadow-[0_28px_70px_rgba(6,59,42,0.22)] sm:px-8 lg:px-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-gs-gold/12 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
              <div>
                <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-gs-gold-light">
                  Hotel already sorted?
                </p>
                <h3 className="mt-3 max-w-xl font-ge text-[1.55rem] font-extrabold leading-tight text-white sm:text-[1.85rem]">
                  Keep the stay you have and let us build the golf, transfers and timings around it.
                </h3>
                <p className="mt-3 max-w-xl font-ge text-sm leading-7 text-white/78 sm:text-[0.98rem]">
                  Send a quick arrival snapshot and our team carries the rest of the details into the full trip form.
                </p>
              </div>
            </div>

            <GeAlreadyBookedFlightPanel />
          </div>
        </div>
      </div>
    </section>
  )
}
