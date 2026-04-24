import { motion } from 'framer-motion'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { aboutCopy } from '../data/copy'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

function AboutTitle() {
  const t = aboutCopy.title
  const idx = t.indexOf('GolfSol')
  if (idx === -1) {
    return (
      <h2 className="font-ge text-[2.05rem] font-extrabold uppercase leading-[1.06] tracking-[0.02em] text-gs-dark sm:text-[2.45rem]">
        {t}
      </h2>
    )
  }
  const before = t.slice(0, idx)
  const after = t.slice(idx + 'GolfSol'.length)
  return (
    <h2 className="font-ge text-[2.05rem] font-extrabold uppercase leading-[1.06] tracking-[0.02em] sm:text-[2.45rem]">
      <span className="text-gs-dark">{before}</span>
      <span className="relative inline-block text-gs-green">
        GolfSol
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-gs-gold/30 via-gs-gold to-gs-gold/30 sm:-bottom-1.5"
        />
      </span>
      <span className="text-gs-dark">{after}</span>
    </h2>
  )
}

export function GeAboutBlock() {
  return (
    <GeSection
      background="soft"
      className="relative isolate overflow-hidden pt-20 pb-24 sm:pt-24 sm:pb-28"
      innerClassName="relative z-[1]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-gs-green/[0.08] blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gs-gold/[0.14] blur-[90px]"
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:gap-14">
        <motion.div
          className="relative order-2 lg:order-1"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.04 }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 rounded-[2.15rem] bg-gradient-to-br from-gs-gold/25 via-transparent to-gs-green/20 opacity-70 blur-sm sm:-inset-4"
          />
          <div className="relative overflow-hidden rounded-[2rem] border border-gs-green/12 bg-gs-dark shadow-[0_28px_70px_rgba(6,59,42,0.2)] ring-1 ring-white/10">
            <div className="relative isolate aspect-[4/3] min-h-[260px] w-full sm:aspect-[5/4] sm:min-h-[300px] lg:min-h-[380px]">
              <img
                src={aboutCopy.image}
                alt="Sunlit golf fairways on the Costa del Sol"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-gs-dark/92 via-gs-dark/35 to-gs-dark/10"
                aria-hidden
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[4px]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, #B88900 12%, #FFC72C 38%, #FFE27A 50%, #FFC72C 62%, #B88900 88%, transparent 100%)'
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-10">
                <div className="rounded-[1.35rem] border border-white/25 bg-white/[0.12] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-md ring-1 ring-gs-gold/25 sm:p-7">
                  <img
                    src="/golf-sol-ireland-logo.svg"
                    alt="GolfSol Ireland"
                    width={220}
                    height={120}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-[min(68vw,200px)] max-w-full object-contain sm:w-[min(52vw,220px)]"
                  />
                </div>
                <p className="mt-5 max-w-[16rem] text-center font-ge text-[0.72rem] font-extrabold uppercase leading-relaxed tracking-[0.2em] text-gs-gold-light/95 sm:mt-6 sm:max-w-none sm:text-[0.76rem]">
                  {aboutCopy.imageTagline}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative order-1 lg:order-2"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
        >
          <div className="relative overflow-hidden rounded-[1.75rem] border border-gs-green/10 bg-white/95 p-7 shadow-[0_22px_55px_rgba(6,59,42,0.08)] ring-1 ring-gs-green/[0.04] sm:p-9 lg:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gs-gold to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 top-24 h-40 w-40 rounded-full bg-gs-gold/[0.07] blur-3xl"
            />

            <p className="font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.2em] text-gs-green sm:text-[0.82rem]">
              {aboutCopy.eyebrow}
            </p>
            <span
              aria-hidden="true"
              className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-gs-gold to-gs-gold-light"
            />
            <div className="mt-6">
              <AboutTitle />
            </div>

            <div className="mt-8 space-y-5 border-l-2 border-gs-green/20 pl-5 sm:space-y-6 sm:pl-6">
              {aboutCopy.paragraphs.map((paragraph, i) => (
                <motion.p
                  key={paragraph}
                  className="font-ge text-[1.02rem] leading-[1.7] text-ge-gray500 sm:text-[1.06rem]"
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: 0.06 * i, ease: 'easeOut' }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-ge-gray100 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <GeButton href="/contact" variant="gs-gold" size="lg" className="w-full shrink-0 sm:w-auto">
                {aboutCopy.cta}
              </GeButton>
              <p className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gs-green/80 sm:text-right">
                {aboutCopy.ctaAside}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </GeSection>
  )
}
