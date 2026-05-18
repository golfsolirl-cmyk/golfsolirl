import { m, type Variants } from 'framer-motion'
import { Briefcase, Sparkles, Star, Users } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { transportFleetIntroCopy, transportFleetTiers } from '../data/transport-service'

const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 }
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

const cardStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 }
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

/**
 * Fleet showcase — solid premium pattern. Magazine-style intro + the real
 * GolfSol fleet image + three vehicle tier cards (E-Class / V-Class /
 * Sprinter) with the V-Class flagged as "Most chosen" in a gold ribbon.
 */
export function TransportFleet() {
  return (
    <GeSection
      id="transport-fleet"
      background="cream"
      className="relative overflow-hidden bg-[#f7f1e3]"
      innerClassName="!pt-24 pb-24 sm:!pt-28 sm:pb-28 scroll-mt-28"
    >
      {/* Solid section framing — no grid / stripe / glass patterns. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(217,190,122,0.55) 18%, #136047 38%, #f4dfa6 50%, #136047 62%, rgba(217,190,122,0.55) 82%, transparent 100%)'
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gs-green/30 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 hidden h-full w-[9px] bg-gradient-to-b from-[#d9be7a] via-[#136047] to-[#f4dfa6] opacity-80 lg:block"
      />

      <m.div
        variants={heroContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16"
      >
        <div>
          <m.span
            variants={heroItem}
            className="inline-flex items-center gap-2 rounded-full border border-brand-700/30 bg-white px-3.5 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-gs-green shadow-[0_8px_20px_rgba(6,59,42,0.06)] sm:text-[0.74rem]"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {transportFleetIntroCopy.eyebrow}
          </m.span>

          <m.span
            aria-hidden="true"
            variants={heroItem}
            className="mt-5 block h-1 w-14 rounded-full bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700"
          />

          <m.h2
            variants={heroItem}
            className="mt-6 font-ge text-[2.05rem] font-extrabold uppercase leading-[1.05] tracking-[0.01em] text-gs-dark sm:text-[2.5rem] lg:text-[2.7rem]"
          >
            <span className="text-gs-dark">All vehicles. </span>
            <span className="text-gs-green">Sized to the group.</span>
          </m.h2>

          <m.p
            variants={heroItem}
            className="mt-5 max-w-xl font-ge text-[0.96rem] font-semibold uppercase tracking-[0.16em] text-gs-green sm:text-[1rem]"
          >
            Mercedes only · 1 → 8 passengers · Golf-bag friendly
          </m.p>

          <m.p
            variants={heroItem}
            className="mt-5 max-w-xl font-ge text-[1.04rem] leading-[1.72] text-ge-gray500 sm:text-[1.08rem]"
          >
            {transportFleetIntroCopy.body}
          </m.p>
        </div>

        <m.div variants={heroItem} className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2 rounded-[2rem] border border-[#d9be7a]/35"
          />
          <div className="relative overflow-hidden rounded-[1.85rem] border border-gs-dark/10 bg-gs-dark shadow-[0_28px_70px_rgba(6,59,42,0.2)] ring-1 ring-chrome-300/70">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-0 z-[2] h-px bg-gradient-to-r from-transparent via-[#f4dfa6]/55 to-transparent"
          />
          <img
            src="/images/88054e80-6dd1-483f-8557-cdc45caa2442.png"
            alt="GolfSol Ireland Mercedes V-Class, E-Class and Sprinter parked on a Costa del Sol forecourt beside a manicured fairway with the Sierra Blanca mountains behind."
            className="block aspect-[16/10] h-full w-full object-cover object-[center_54%] sm:aspect-[16/9]"
            loading="lazy"
            decoding="async"
            width={1600}
            height={900}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04130c]/82 via-[#04130c]/10 to-transparent"
          />
          <div className="absolute bottom-4 left-4 right-4 z-[3] rounded-2xl border border-[#f4dfa6]/40 bg-[#06150f]/95 px-4 py-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:bottom-5 sm:left-5 sm:right-5 sm:px-5 sm:py-4">
            <p
              className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.24em]"
              data-keep-color
              style={{ color: '#fbe8b5' }}
            >
              Fleet matched to the bag count
            </p>
            <p className="mt-1.5 font-ge text-[0.94rem] font-semibold leading-relaxed sm:text-[1rem]" style={{ color: 'rgba(255,255,255,0.94)' }}>
              V-Class, E-Class and Sprinter options, briefed for airport arrivals, resort runs and golf-day shuttles.
            </p>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[4px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(217,190,122,0.55) 18%, #136047 38%, #f4dfa6 50%, #136047 62%, rgba(217,190,122,0.55) 82%, transparent 100%)'
            }}
          />
          </div>
        </m.div>
      </m.div>

      {/* —— Tier cards —— */}
      <m.div
        variants={cardStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
      >
        {transportFleetTiers.map((tier, i) => {
          const featured = i === 1
          return (
            <m.article
              key={tier.name}
              variants={cardItem}
              className={[
                'group relative flex flex-col overflow-hidden rounded-[1.6rem] bg-white p-6 pt-5 transition-all duration-300 hover:-translate-y-0.5 sm:p-7 sm:pt-6',
                featured
                  ? 'border-2 border-[#d9be7a]/65 shadow-[0_24px_60px_rgba(6,59,42,0.14),0_0_28px_rgba(217,190,122,0.22)] ring-1 ring-chrome-300/80'
                  : 'border border-gs-green/15 shadow-[0_14px_32px_rgba(6,59,42,0.08)] ring-1 ring-chrome-300/70'
              ].join(' ')}
            >
              {/* Top hairline (gold for featured, brand-green for others) */}
              <span
                aria-hidden="true"
                className={[
                  'pointer-events-none absolute inset-x-7 top-0 h-px',
                  featured
                    ? 'bg-gradient-to-r from-transparent via-[#d9be7a]/85 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-brand-700/55 to-transparent'
                ].join(' ')}
              />
              {/* Soft halo */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-brand-700/[0.06] blur-3xl"
              />

              {featured ? (
                <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#d9be7a]/65 bg-gradient-to-r from-[#fff5cf] via-[#f4dfa6] to-[#d9be7a] px-3 py-1 font-ge text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-gs-dark shadow-[0_10px_22px_rgba(217,190,122,0.32)] sm:text-[0.7rem]">
                  <Star className="h-3 w-3" aria-hidden fill="#0c3527" />
                  {tier.accent}
                </span>
              ) : (
                <span className="mb-3 block font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-ge-gray400 sm:text-[0.7rem]">
                  {tier.accent}
                </span>
              )}

              <h3 className="font-ge text-[1.32rem] font-extrabold uppercase leading-tight tracking-[0.02em] text-gs-green sm:text-[1.5rem]">
                {tier.name}
              </h3>

              <ul className="mt-5 space-y-3 font-ge text-[0.95rem] text-ge-gray500 sm:text-[0.98rem]">
                <li className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#d9be7a]/55 bg-gradient-to-br from-[#1a7a59] via-[#136047] to-[#0c3527] shadow-[0_8px_18px_rgba(6,59,42,0.32)] ring-1 ring-white/10"
                  >
                    <Users className="h-[1.05rem] w-[1.05rem] text-white" aria-hidden strokeWidth={2.2} />
                  </span>
                  <span className="font-extrabold text-gs-dark">{tier.seats}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#d9be7a]/55 bg-gradient-to-br from-[#1a7a59] via-[#136047] to-[#0c3527] shadow-[0_8px_18px_rgba(6,59,42,0.32)] ring-1 ring-white/10"
                  >
                    <Briefcase className="h-[1.05rem] w-[1.05rem] text-white" aria-hidden strokeWidth={2.2} />
                  </span>
                  <span>{tier.bagsLine}</span>
                </li>
              </ul>

              <ul className="mt-5 space-y-2.5 border-t border-gs-green/15 pt-4 font-ge text-[0.94rem] text-ge-gray500 sm:text-[0.97rem]">
                {tier.bullets.map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-brand-800 via-brand-600 to-brand-700"
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              {/* Bottom gold accent grows on hover (matches hotel card pattern) */}
              <span
                aria-hidden="true"
                className={[
                  'absolute inset-x-0 bottom-0 h-[3px] transition-transform duration-500 group-hover:scale-x-100',
                  featured ? 'origin-center scale-x-100' : 'origin-left scale-x-0'
                ].join(' ')}
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(217,190,122,0.55) 18%, #136047 38%, #f4dfa6 50%, #136047 62%, rgba(217,190,122,0.55) 82%, transparent 100%)'
                }}
              />
            </m.article>
          )
        })}
      </m.div>
    </GeSection>
  )
}
