import { motion } from 'framer-motion'
import { Briefcase, Users } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { transportFleetIntroCopy, transportFleetTiers } from '../data/transport-service'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

/**
 * Fleet showcase — full-bleed cinematic lineup image inside a framed card,
 * intro copy beside it on desktop, then three vehicle-tier cards underneath.
 * Highlights the “Most chosen” V-Class with a gold accent.
 */
export function TransportFleet() {
  return (
    <GeSection
      id="transport-fleet"
      background="gray"
      innerClassName="!pt-20 pb-20 sm:!pt-24 sm:pb-24 scroll-mt-28"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-14">
        <motion.div {...fadeUp}>
          <p className="font-ge text-sm font-bold uppercase tracking-[0.18em] text-ge-orange sm:text-[0.85rem]">
            {transportFleetIntroCopy.eyebrow}
          </p>
          <h2 className="mt-3 font-ge text-[2rem] font-extrabold leading-[1.08] tracking-[0.01em] text-gs-green sm:text-[2.4rem] lg:text-[2.6rem]">
            {transportFleetIntroCopy.title}
          </h2>
          <p className="mt-5 font-ge text-base leading-7 text-ge-gray500 sm:text-[1.05rem] sm:leading-8">
            {transportFleetIntroCopy.body}
          </p>
        </motion.div>

        <motion.div
          className="relative overflow-hidden rounded-2xl border-2 border-gs-dark/10 shadow-[0_24px_60px_rgba(6,59,42,0.18)]"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.08 }}
        >
          <img
            src="/images/transport-fleet-lineup.jpg"
            alt="Mercedes E-Class, V-Class and Sprinter parked together on a Costa del Sol forecourt with the Sierra Blanca mountains behind."
            className="block h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            width={1800}
            height={1010}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[4px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, #B88900 15%, #FFC72C 35%, #FFE27A 50%, #FFC72C 65%, #B88900 85%, transparent 100%)'
            }}
          />
        </motion.div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
        {transportFleetTiers.map((tier, i) => {
          const featured = i === 1
          return (
            <motion.article
              key={tier.name}
              className={[
                'relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white p-6 shadow-[0_14px_40px_rgba(6,59,42,0.08)] sm:p-7',
                featured ? 'border-gs-gold ring-1 ring-gs-gold/40' : 'border-ge-gray100'
              ].join(' ')}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.07 }}
            >
              {featured ? (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-gs-gold to-gs-gold-light px-3 py-1 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-gs-dark shadow-sm sm:text-[0.7rem]">
                  {tier.accent}
                </span>
              ) : (
                <span className="absolute right-4 top-4 font-ge text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ge-gray400 sm:text-[0.7rem]">
                  {tier.accent}
                </span>
              )}

              <h3 className="font-ge text-[1.25rem] font-extrabold leading-tight text-gs-green sm:text-[1.4rem]">
                {tier.name}
              </h3>

              <ul className="mt-4 space-y-2.5 font-ge text-sm text-ge-gray500 sm:text-[0.95rem]">
                <li className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 shrink-0 text-gs-green" aria-hidden />
                  <span className="font-semibold text-gs-dark">{tier.seats}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 shrink-0 text-gs-green" aria-hidden />
                  <span>{tier.bagsLine}</span>
                </li>
              </ul>

              <ul className="mt-5 space-y-2 border-t border-ge-gray100 pt-4 font-ge text-sm text-ge-gray500 sm:text-[0.95rem]">
                {tier.bullets.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span aria-hidden className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gs-gold" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          )
        })}
      </div>
    </GeSection>
  )
}
