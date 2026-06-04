import { m, type Variants } from 'framer-motion'
import { BedDouble, Compass, MapPin, Sparkles, Waves } from 'lucide-react'
import { GeGoldDividerLine } from '../../../components/ge-gold-divider-line'
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

const signalIcons = [BedDouble, Compass, Sparkles] as const

/**
 * Costa del Sol stays — coastal-corridor editorial intro before the hotel grid.
 */
export function GeAccommodationIntro() {
  return (
    <GeSection
      id="accommodation-stays"
      background="cream"
      className="relative overflow-hidden pt-20 pb-0 sm:pt-24"
      bottomDivider={{ fill: '#ffffff', variant: 'layered', height: 72 }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(11,77,59,0.14),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-5rem] top-32 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,190,122,0.14),transparent_72%)] blur-3xl"
      />

      <m.div
        variants={heroContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="relative mx-auto max-w-[1180px]"
      >
        {/* —— Kicker + headline —— */}
        <div className="mx-auto max-w-3xl text-center">
          <m.span
            variants={heroItem}
            className="inline-flex items-center gap-2 rounded-full border border-brand-700/30 bg-white px-3.5 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-gs-green shadow-[0_8px_20px_rgba(6,59,42,0.06)] sm:text-[0.72rem]"
          >
            <Waves className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
            {accommodationIntroCopy.kicker}
          </m.span>

          <GeGoldDividerLine className="mt-5" />

          <m.p
            variants={heroItem}
            className="mt-5 inline-flex items-center gap-2 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.24em] text-gs-green/80 sm:text-[0.82rem]"
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
            id="accommodation-stays-title"
            className="mt-4 text-balance font-ge text-[1.85rem] font-extrabold leading-[1.12] tracking-[-0.02em] text-gs-dark sm:text-[2.35rem] lg:text-[2.55rem]"
          >
            <span className="text-gs-dark">Hotels Irish groups love</span>{' '}
            <span className="text-gs-green">on the Costa del Sol</span>
          </m.h2>

          <m.p
            variants={heroItem}
            className="mt-4 font-ge text-[0.92rem] font-semibold uppercase tracking-[0.12em] text-gs-green sm:text-[0.98rem]"
          >
            {accommodationIntroCopy.lead}
          </m.p>
        </div>

        {/* —— Editorial feature: forest panel + resort image —— */}
        <m.div
          variants={heroItem}
          data-stays-dark-panel
          className="ge-on-dark relative mt-12 grid overflow-hidden rounded-[1.85rem] border border-gs-green/20 bg-gs-dark shadow-[0_28px_70px_rgba(6,59,42,0.28)] ring-1 ring-chrome-300/40 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <GeGoldDividerLine className="absolute inset-x-0 top-0 z-20 opacity-90" />

          <div className="relative z-10 flex flex-col justify-between gap-8 p-7 sm:p-9 lg:p-10">
            <div>
              <p className="font-ge text-[1.05rem] leading-[1.72] sm:text-[1.12rem]">
                {accommodationIntroCopy.body}
              </p>
              <p
                data-stays-gold
                className="mt-5 font-ge text-[0.98rem] font-extrabold uppercase tracking-[0.08em] sm:text-[1.02rem]"
              >
                {accommodationIntroCopy.bodyEmphasis}
              </p>
            </div>

            <ul className="grid grid-cols-3 gap-3 sm:gap-4">
              {accommodationIntroCopy.stats.map((stat) => (
                <li
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-center sm:px-4 sm:py-4"
                >
                  <p className="font-ge text-[1.35rem] font-extrabold leading-none sm:text-[1.55rem]">
                    {stat.value}
                  </p>
                  <p
                    data-stays-muted
                    className="mt-1.5 font-ge text-[0.62rem] font-bold uppercase leading-snug tracking-[0.1em] sm:text-[0.68rem]"
                  >
                    {stat.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[15rem] sm:min-h-[18rem] lg:min-h-full">
            <img
              src={accommodationIntroCopy.heroImage}
              alt={accommodationIntroCopy.heroImageAlt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-[#04130c]/88 via-[#04130c]/35 to-transparent lg:from-[#04130c]/75 lg:via-transparent lg:to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#04130c]/55 via-transparent to-transparent lg:hidden"
            />
            <div className="absolute bottom-4 left-4 right-4 z-10 rounded-xl border border-white/15 bg-[#04130c]/72 px-4 py-3 backdrop-blur-[2px] sm:bottom-5 sm:left-5 sm:right-5">
              <p
                data-stays-gold
                className="flex items-center gap-2 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.18em] sm:text-[0.72rem]"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Stay-and-play corridor
              </p>
              <p className="mt-1 font-ge text-[0.88rem] leading-snug sm:text-[0.94rem]">
                One Mercedes route from Málaga AGP to your base — then out to the fairways each morning.
              </p>
            </div>
          </div>
        </m.div>

        {/* —— Coastal corridor strip —— */}
        <m.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.06 }}
          className="relative mt-10 overflow-hidden rounded-[1.6rem] border border-gs-green/15 bg-white px-4 py-6 shadow-[0_18px_44px_rgba(6,59,42,0.08)] ring-1 ring-chrome-300/70 sm:px-6 sm:py-7"
        >
          <GeGoldDividerLine className="absolute inset-x-0 top-0" />

          <p className="text-center font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-gs-green sm:text-[0.76rem]">
            Where Irish groups base up — east to west
          </p>

          <div className="relative mt-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-4 right-4 top-[1.15rem] hidden h-px bg-gradient-to-r from-brand-800/20 via-[#d9be7a]/70 to-brand-800/20 sm:block"
            />

            <ol className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-6 sm:gap-2 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
              {accommodationIntroCopy.corridorStops.map((stop, idx) => (
                <li
                  key={stop.town}
                  className="group min-w-[7.25rem] shrink-0 snap-start text-center sm:min-w-0"
                >
                  <span
                    aria-hidden="true"
                    className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#d9be7a]/55 bg-gradient-to-br from-[#0d3a2a] to-[#08231a] font-ge text-[0.68rem] font-extrabold text-[#f4dfa6] shadow-[0_8px_18px_rgba(6,59,42,0.22)] transition-transform duration-300 group-hover:scale-105"
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-3 font-ge text-[0.82rem] font-extrabold uppercase tracking-[0.08em] text-gs-dark sm:text-[0.78rem]">
                    {stop.town}
                  </p>
                  <p className="mt-1 font-ge text-[0.72rem] leading-snug text-ge-gray500 sm:text-[0.7rem]">
                    {stop.hint}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </m.div>

        {/* —— Trust signals —— */}
        <m.ul
          variants={heroContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8 grid gap-4 pb-24 sm:mt-10 sm:grid-cols-3 sm:gap-5 sm:pb-28"
        >
          {accommodationIntroCopy.signals.map((signal, idx) => {
            const Icon = signalIcons[idx] ?? Sparkles
            return (
              <m.li
                key={signal.label}
                variants={heroItem}
                className="group relative overflow-hidden rounded-2xl border border-gs-green/15 bg-white p-5 shadow-[0_14px_32px_rgba(6,59,42,0.08)] ring-1 ring-chrome-300/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(6,59,42,0.12)] sm:p-6"
              >
                <GeGoldDividerLine className="absolute inset-x-0 top-0 opacity-80" />
                <span
                  aria-hidden="true"
                  className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-brand-700/[0.05] blur-2xl"
                />

                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d9be7a]/55 bg-gradient-to-br from-[#0d3a2a] via-[#0a2a1f] to-[#08231a] shadow-[0_10px_22px_rgba(6,59,42,0.32)] ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105"
                  >
                    <Icon className="h-5 w-5 text-white" aria-hidden strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-ge text-[0.84rem] font-extrabold uppercase tracking-[0.14em] text-gs-dark sm:text-[0.9rem]">
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
      </m.div>
    </GeSection>
  )
}
