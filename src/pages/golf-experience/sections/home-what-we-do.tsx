import { m, useReducedMotion } from 'framer-motion'
import { BedDouble, CarFront, Flag, ArrowRight } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'

const services = [
  {
    icon: CarFront,
    title: 'Private transfers',
    body: 'We meet you at Málaga Airport and drive you to the hotel, clubs included.',
    href: '/services/transport',
    cta: 'See transfers'
  },
  {
    icon: Flag,
    title: 'Golf courses',
    body: 'Tell us the courses you want. We request the tee times between Málaga and Sotogrande.',
    href: '/golf-courses',
    cta: 'See the courses'
  },
  {
    icon: BedDouble,
    title: 'Hotels & stays',
    body: 'Fuengirola and Torremolinos bases Irish groups book again and again.',
    href: '/accommodation',
    cta: 'See the hotels'
  }
] as const

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.5, ease: 'easeOut' }
} as const

/** One calm strip — transfers, golf, hotels — inspired by the crest palette. */
export function GeHomeWhatWeDo() {
  const reduceMotion = Boolean(useReducedMotion())
  return (
    <GeSection background="white" className="pt-16 pb-20 sm:pt-20 sm:pb-24">
      <m.div className="mx-auto max-w-3xl text-center" {...fadeUp}>
        <p className="font-ge text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-gs-green sm:text-[0.76rem]">
          What we do
        </p>
        <h2 className="mt-3 font-ge text-[1.9rem] font-extrabold leading-[1.1] tracking-[-0.025em] text-gs-dark sm:text-[2.5rem] lg:text-[2.8rem]">
          Everything your golf trip needs — in one place
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-ge text-[1rem] leading-7 text-ge-gray500 sm:text-[1.05rem]">
          Transfers, tee times and the hotel. One Irish desk, one quote.
        </p>
      </m.div>

      <div className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-3 sm:gap-6">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <m.a
              key={service.title}
              href={service.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-black/[0.06] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] sm:p-7"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.06 * index }}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-gs-green transition-colors duration-300 group-hover:bg-gs-dark group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 font-ge text-[1.1rem] font-bold text-gs-dark">{service.title}</h3>
              <p className="mt-2 flex-1 font-ge text-[0.92rem] leading-relaxed text-ge-gray500">{service.body}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 font-ge text-[0.82rem] font-semibold text-gs-green transition-colors group-hover:text-gs-dark">
                {service.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </span>
            </m.a>
          )
        })}
      </div>

      <m.div className="mt-12 flex justify-center sm:mt-14" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
        <GeButton href="/contact" variant="gs-green" size="lg">
          Get a quote
          <ArrowRight className="h-4 w-4" aria-hidden />
        </GeButton>
      </m.div>
    </GeSection>
  )
}
