import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { transportRouteStory } from '../data/transport-service'

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.6, ease: 'easeOut' }
} as const

/**
 * Three-step editorial journey on dark green. Each step is a tall image card
 * with badge, headline, body and a tight bullet line. Reads like a Conde
 * Nast itinerary spread.
 */
export function TransportRouteStory() {
  return (
    <GeSection
      id="transport-journey"
      background="teal"
      innerClassName="!pt-20 pb-20 sm:!pt-24 sm:pb-24 scroll-mt-28"
      className="relative"
    >
      <motion.div className="mx-auto max-w-3xl text-center" {...fadeUp}>
        <p className="font-ge text-sm font-bold uppercase tracking-[0.2em] text-gs-gold sm:text-[0.85rem]">
          The route
        </p>
        <h2 className="mt-3 font-ge text-[2rem] font-extrabold leading-[1.08] tracking-[0.01em] text-white sm:text-[2.4rem] lg:text-[2.7rem]">
          Plane to fairway, in three calm beats.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-ge text-base leading-8 text-white/85 sm:text-[1.05rem]">
          We run the same proven choreography for every Irish group — so the
          only thing you’re thinking about by Tuesday lunch is the back nine.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-7 md:grid-cols-3">
        {transportRouteStory.map((step, i) => (
          <motion.article
            key={step.badge}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-gs-dark/40 ring-1 ring-white/10 shadow-[0_22px_60px_rgba(0,0,0,0.45)] transition-all duration-500 hover:-translate-y-1 hover:ring-gs-gold/40"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.08 }}
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={step.image}
                alt={step.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                width={1200}
                height={1500}
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark via-gs-dark/40 to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, #B88900 15%, #FFC72C 35%, #FFE27A 50%, #FFC72C 65%, #B88900 85%, transparent 100%)'
                }}
              />
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-gs-dark/60 px-3 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-gs-gold backdrop-blur-md sm:text-[0.78rem]">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gs-gold" />
                {step.badge}
              </span>
            </div>

            <div className="flex flex-1 flex-col px-6 pb-7 pt-6">
              <h3 className="font-ge text-[1.35rem] font-extrabold leading-tight text-white sm:text-[1.5rem]">
                {step.title}
              </h3>
              <p className="mt-3 flex-1 font-ge text-base leading-7 text-white/85 sm:text-[1rem]">
                {step.body}
              </p>
              <p className="mt-5 inline-flex items-center gap-2 border-t border-white/15 pt-4 font-ge text-sm font-bold uppercase tracking-[0.14em] text-gs-gold sm:text-[0.78rem]">
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                {step.bullet}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </GeSection>
  )
}
