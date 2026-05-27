import { m, type Variants } from 'framer-motion'
import { Check, ShieldCheck, Sparkles } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { transportPromiseCopy, transportPromiseStats } from '../data/transport-service'

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

const statStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.12 }
  }
}

const statItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }
  }
}

/**
 * Editorial promise band on white surface — premium pattern matching
 * homepage (kicker pill, brand-green accent bar, two-tone headline,
 * lead, body, gold-tile check icons, magazine-style stats with
 * gradient values).
 */
export function TransportPromise() {
  return (
    <GeSection
      id="transport-promise"
      background="white"
      className="relative overflow-hidden"
      innerClassName="!pt-20 pb-20 sm:!pt-24 sm:pb-24 scroll-mt-28"
    >
      {/* Editorial background halos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(11,77,59,0.08),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6rem] bottom-[-4rem] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,190,122,0.10),transparent_72%)] blur-3xl"
      />

      <m.div
        variants={heroContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16"
      >
        {/* —— Left: editorial header + checks —— */}
        <div>
          <m.span
            variants={heroItem}
            className="inline-flex items-center gap-2 rounded-full border border-brand-700/30 bg-white px-3.5 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-gs-green shadow-[0_8px_20px_rgba(6,59,42,0.06)] sm:text-[0.74rem]"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {transportPromiseCopy.eyebrow}
          </m.span>

          <m.span
            aria-hidden="true"
            variants={heroItem}
            className="mt-5 block h-1 w-14 rounded-full bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700"
          />

          <m.h2
            variants={heroItem}
            className="mt-6 max-w-[18ch] font-ge text-[2.05rem] font-extrabold uppercase leading-[1.04] tracking-[0.01em] text-gs-dark sm:text-[2.5rem] lg:text-[2.7rem]"
          >
            <span className="text-gs-dark">Land in </span>
            <span className="text-gs-green">Málaga.</span>{' '}
            <span className="text-gs-dark">Don&rsquo;t think about logistics again.</span>
          </m.h2>

          <m.p
            variants={heroItem}
            className="mt-6 max-w-2xl font-ge text-[1.04rem] leading-[1.72] text-ge-gray500 sm:text-[1.1rem]"
          >
            {transportPromiseCopy.body}
          </m.p>

          <ul className="mt-8 grid gap-3.5">
            {transportPromiseCopy.bullets.map((bullet, idx) => (
              <m.li
                key={bullet}
                variants={heroItem}
                className="flex items-start gap-3.5 font-ge text-[1rem] leading-[1.7] text-gs-dark sm:text-[1.04rem]"
                custom={idx}
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#d9be7a]/55 bg-gradient-to-br from-[#1a7a59] via-[#136047] to-[#0c3527] shadow-[0_8px_18px_rgba(6,59,42,0.32),0_0_14px_rgba(217,190,122,0.22)] ring-1 ring-white/15"
                >
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden />
                </span>
                <span>{bullet}</span>
              </m.li>
            ))}
          </ul>
        </div>

        {/* —— Right: magazine-style stats grid —— */}
        <m.div
          variants={statStagger}
          className="grid grid-cols-2 gap-3.5 sm:gap-4"
        >
          {transportPromiseStats.map((stat) => (
            <m.div
              key={stat.label}
              variants={statItem}
              className="group relative overflow-hidden rounded-2xl border border-gs-green/15 bg-white p-5 shadow-[0_14px_32px_rgba(6,59,42,0.08)] ring-1 ring-chrome-300/70 transition-transform duration-300 hover:-translate-y-0.5 sm:p-6"
            >
              {/* Top chrome hairline */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
              ><div className="mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent" />
        </span>
              {/* Brand-green left accent (premium upgrade from the previous flat green bar) */}
              <span
                aria-hidden
                className="absolute left-0 top-3 h-[calc(100%-1.5rem)] w-1 rounded-full bg-gradient-to-b from-brand-800 via-[#136047] to-[#d9be7a]"
              />
              {/* Soft halo */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-brand-700/[0.05] blur-3xl"
              />

              <p className="font-ge text-[1.95rem] font-extrabold leading-none tracking-[-0.01em] sm:text-[2.4rem]">
                <span
                  className="bg-clip-text"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #0a3a2a 0%, #136047 50%, #1a7a59 100%)',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {stat.value}
                </span>
              </p>
              <p className="mt-3 font-ge text-[0.74rem] font-extrabold uppercase tracking-[0.16em] text-gs-dark/70 sm:text-[0.82rem]">
                {stat.label}
              </p>
            </m.div>
          ))}

          {/* Reassurance footer chip */}
          <m.div
            variants={statItem}
            className="col-span-2 mt-2 flex items-center justify-center gap-2 rounded-full border border-gs-green/20 bg-gs-green/[0.04] px-4 py-3 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-gs-green sm:text-[0.78rem]"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Fully insured · Mercedes only · Replies inside 2 hours
          </m.div>
        </m.div>
      </m.div>
    </GeSection>
  )
}
