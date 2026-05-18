import { m, type Variants } from 'framer-motion'
import { BedDouble, Compass, Sparkles } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { accommodationIntroCopy } from '../data/copy'

const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05
    }
  }
}

const heroItem: Variants = {
  hidden: { opacity: 0, y: 16 },
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
 * Costa del Sol stays — premium editorial header for the hotel grid.
 *
 * Pattern matches courses-spain / about / extras:
 *   • kicker pill with Sparkles icon
 *   • two-tone uppercase headline + brand-green accent bar
 *   • lead line + body paragraph
 *   • three trust-signal chips above the grid
 */
export function GeAccommodationIntro() {
  return (
    <GeSection
      background="soft"
      className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20"
    >
      {/* Editorial background — soft radial halos behind the headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(11,77,59,0.12),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6rem] bottom-[-4rem] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,190,122,0.12),transparent_72%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-700/40 to-transparent"
      />

      <m.div
        variants={heroContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="grid gap-10 lg:grid-cols-[0.45fr_0.55fr] lg:items-start lg:gap-14"
      >
        {/* —— Left column: kicker → headline → step badge —— */}
        <div className="relative">
          <m.span
            variants={heroItem}
            className="inline-flex items-center gap-2 rounded-full border border-brand-700/30 bg-white px-3.5 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-gs-green shadow-[0_8px_20px_rgba(6,59,42,0.06)] sm:text-[0.72rem]"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {accommodationIntroCopy.kicker}
          </m.span>

          <m.span
            aria-hidden="true"
            variants={heroItem}
            className="mt-5 block h-1 w-12 rounded-full bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700"
          />

          <m.p
            variants={heroItem}
            className="mt-4 inline-flex items-center gap-2 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.24em] text-gs-green/80 sm:text-[0.82rem]"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-brand-700/30 bg-gs-green/[0.08] text-[0.62rem] font-extrabold tracking-normal text-gs-green"
            >
              03
            </span>
            {accommodationIntroCopy.eyebrow}
          </m.p>

          <m.h2
            variants={heroItem}
            className="mt-4 max-w-[18ch] font-ge text-[2.2rem] font-extrabold uppercase leading-[1.04] tracking-[0.01em] text-gs-dark sm:text-[2.6rem] lg:text-[2.85rem]"
          >
            <span className="text-gs-dark">The Costa del Sol </span>
            <span className="text-gs-green">hotels</span>
            <span className="text-gs-dark"> Irish groups love</span>
          </m.h2>

          <m.p
            variants={heroItem}
            className="mt-5 max-w-xl font-ge text-[0.96rem] font-semibold uppercase tracking-[0.16em] text-gs-green sm:text-[1rem]"
          >
            {accommodationIntroCopy.lead}
          </m.p>
        </div>

        {/* —— Right column: body card + trust signals —— */}
        <m.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.08 }}
          className="relative"
        >
          {/* Soft halo behind the body card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-4 rounded-[2.1rem] bg-gradient-to-br from-brand-700/[0.06] via-transparent to-[#d9be7a]/[0.10] opacity-80 blur-2xl"
          />

          <div className="relative rounded-[1.85rem] border border-gs-green/15 bg-white p-7 shadow-[0_22px_55px_rgba(6,59,42,0.10)] ring-1 ring-chrome-300/70 sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-700 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 top-12 h-32 w-32 rounded-full bg-brand-700/[0.06] blur-3xl"
            />

            <span
              aria-hidden="true"
              className="block h-[3px] w-20 rounded-full bg-gradient-to-r from-brand-800 via-brand-600 to-transparent"
            />

            <p className="mt-6 font-ge text-[1.05rem] leading-[1.72] text-ge-gray500 sm:text-[1.1rem]">
              {accommodationIntroCopy.body}
            </p>

            <p className="mt-5 font-ge text-[1rem] font-extrabold uppercase tracking-[0.06em] text-gs-dark sm:text-[1.04rem]">
              {accommodationIntroCopy.bodyEmphasis}
            </p>
          </div>
        </m.div>
      </m.div>

      {/* —— Trust-signal strip — full-width row below the grid so each card has
           proper breathing room (was clipping inside the 0.55fr right column). —— */}
      <m.ul
        variants={heroContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-3 md:gap-5"
      >
        {accommodationIntroCopy.signals.map((signal, idx) => {
          const Icon = idx === 0 ? BedDouble : idx === 1 ? Compass : Sparkles
          return (
            <m.li
              key={signal.label}
              variants={heroItem}
              className="group relative overflow-hidden rounded-2xl border border-gs-green/15 bg-white p-5 shadow-[0_14px_32px_rgba(6,59,42,0.08)] ring-1 ring-chrome-300/70 transition-transform duration-300 hover:-translate-y-0.5 sm:p-6"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-700/45 to-transparent"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-brand-700/[0.05] blur-3xl"
              />

              <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-5">
                <span
                  aria-hidden="true"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d9be7a]/55 bg-gradient-to-br from-[#0d3a2a] via-[#0a2a1f] to-[#08231a] shadow-[0_10px_22px_rgba(6,59,42,0.32),0_0_18px_rgba(217,190,122,0.18)] ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12"
                >
                  <Icon
                    className="h-5 w-5 text-white sm:h-[1.35rem] sm:w-[1.35rem]"
                    aria-hidden
                    strokeWidth={2.2}
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-ge text-[0.84rem] font-extrabold uppercase tracking-[0.16em] text-gs-dark sm:text-[0.92rem]">
                    {signal.label}
                  </p>
                  <p className="mt-2 font-ge text-[0.94rem] leading-relaxed text-ge-gray500 sm:text-[0.98rem]">
                    {signal.detail}
                  </p>
                </div>
              </div>
            </m.li>
          )
        })}
      </m.ul>
    </GeSection>
  )
}
