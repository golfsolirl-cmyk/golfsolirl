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
    <GeSection background="cream" className="pt-14 pb-16 sm:pt-16 sm:pb-20">
      <m.div className="mx-auto max-w-3xl text-center" {...fadeUp}>
        <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-gs-green sm:text-[0.78rem]">
          Irish-owned · Costa del Sol golf specialists
        </p>
        <h2 className="mt-4 font-ge text-[1.85rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-gs-dark sm:text-[2.35rem]">
          Everything your golf trip needs — in one place
        </h2>
        <m.span
          aria-hidden
          className="mx-auto mt-4 block h-[3px] w-24 origin-left rounded-full bg-gradient-to-r from-brand-700 via-[#d4a843] to-transparent"
          initial={reduceMotion ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        />
        <p className="mx-auto mt-4 max-w-2xl font-ge text-[1.02rem] leading-7 text-ge-gray500">
          Transfers, tee times and the hotel. One Irish desk, one quote.
        </p>
      </m.div>

      <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <m.a
              key={service.title}
              href={service.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-chrome-300/80 bg-white p-5 shadow-[0_10px_28px_rgba(6,32,22,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-700/35 hover:shadow-[0_18px_40px_rgba(6,32,22,0.1)] sm:p-6"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.06 * index }}
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-brand-700 via-[#d4a843] to-transparent transition-transform duration-500 group-hover:scale-x-100 motion-reduce:scale-x-100"
              />
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gs-dark text-white shadow-[0_10px_22px_rgba(6,59,42,0.2)]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-ge text-[1.05rem] font-extrabold text-gs-dark">{service.title}</h3>
              <p className="mt-2 flex-1 font-ge text-[0.92rem] leading-6 text-ge-gray500">{service.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-brand-700 transition-colors group-hover:text-gs-dark">
                {service.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </m.a>
          )
        })}
      </div>

      <m.div className="mt-10 flex justify-center sm:mt-12" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
        <GeButton href="/contact" variant="gs-green" size="lg">
          Get a quote
          <ArrowRight className="h-4 w-4" aria-hidden />
        </GeButton>
      </m.div>
    </GeSection>
  )
}
