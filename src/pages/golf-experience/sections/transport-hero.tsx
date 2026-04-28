import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Clock3, PlaneLanding, Phone, ShieldCheck } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { contactInfo } from '../data/copy'
import { transportHeroCopy } from '../data/transport-service'
import { handleScrollToFormTarget } from '../../../lib/scroll-to-form-target'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
} as const

/**
 * Cinematic transport hero — full-bleed coastal Mercedes V-Class image,
 * deep editorial overlay (eyebrow, big headline, lead, dual CTAs), gold
 * frame chrome consistent with the rest of the site, and a chevron pointing
 * to the promise section. Same navbar spacer as homepage hero.
 */
export function TransportHero() {
  const mobileHighlights = [
    { icon: PlaneLanding, label: 'Flight tracking from Ireland' },
    { icon: ShieldCheck, label: 'Golf-bag friendly Mercedes fleet' },
    { icon: Clock3, label: 'Fast quote turnaround' }
  ] as const

  return (
    <section
      className="relative isolate z-[38] overflow-hidden bg-gs-dark text-white"
      aria-labelledby="transport-hero-title"
      id="transport-top"
    >
      {/* z-[38]: above PageIdentityBar (z-20); below GeNavbar (z-40). */}
      <h1 id="transport-hero-title" className="sr-only">
        {transportHeroCopy.title}
      </h1>

      <div className="relative w-full overflow-hidden bg-gs-dark">
        {/* Image — dedicated mobile stage + locked editorial aspect desktop */}
        <picture className="block md:absolute md:inset-0 md:h-full md:w-full">
          <img
            src="/images/transport-hero-coastal-drive.jpg"
            alt="Black Mercedes V-Class on the AP-7 coastal motorway above Marbella at golden hour, Mediterranean sea on the right."
            className="block h-[54vh] min-h-[360px] w-full select-none object-cover object-[58%_42%] md:absolute md:inset-0 md:h-full md:min-h-0 md:w-full md:object-[center_45%]"
            fetchPriority="high"
            decoding="async"
            width={2400}
            height={1320}
          />
        </picture>

        {/* Aspect frame for tablet+ — keeps editorial proportions */}
        <div className="relative w-full pb-8 md:aspect-[16/9] md:pb-0 lg:aspect-[21/9]">
          <div aria-hidden className="absolute inset-x-0 top-0 z-[5] h-[54vh] min-h-[360px] bg-gradient-to-t from-gs-dark via-gs-dark/15 to-transparent md:hidden" />

          {/* Mobile composition — detached content card to avoid cramped overlays */}
          <div className="relative z-[12] -mt-16 px-4 md:hidden">
            <motion.div
              className="mx-auto w-full max-w-[34rem] overflow-hidden rounded-[1.75rem] border border-gs-gold/30 bg-gs-dark/95 p-5 shadow-[0_26px_60px_rgba(1,16,12,0.62)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-gs-gold/35 bg-gs-dark/45 px-3 py-1.5 font-ge text-[0.66rem] font-bold uppercase tracking-[0.18em] text-gs-gold">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gs-gold shadow-[0_0_10px_rgba(255,199,44,0.68)]" />
                {transportHeroCopy.eyebrow}
              </span>
              <h2 className="mt-4 font-ge text-[2.05rem] font-extrabold leading-[1.04] tracking-[-0.01em] text-white">
                {transportHeroCopy.title}
              </h2>

              <p className="mt-3 font-ge text-[1.02rem] leading-7 text-white/85">{transportHeroCopy.subtitle}</p>

              <ul className="mt-5 space-y-2">
                {mobileHighlights.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-ge text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-white/82"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gs-gold" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-3">
                <GeButton href="#transport-enquire" variant="gs-gold" size="lg" className="w-full">
                  {transportHeroCopy.primaryCta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </GeButton>
                <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-gs-white" size="lg" className="w-full">
                  <Phone className="h-4 w-4" aria-hidden />
                  {contactInfo.phoneDisplay}
                </GeButton>
              </div>

              <p className="mt-4 font-ge text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white/68">
                Irish-owned · Mercedes fleet · Replies inside 2 hours
              </p>
            </motion.div>
          </div>

          {/* Vignette + readability scrims (left-anchored copy) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] hidden bg-gradient-to-r from-gs-dark/85 via-gs-dark/55 to-transparent md:block md:from-gs-dark/80 md:via-gs-dark/40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] hidden bg-gradient-to-t from-gs-dark/75 via-transparent to-gs-dark/30 md:block"
          />

          {/* Gold hairline frame */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[7] hidden h-[3px] md:block"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(184,137,0,0.5) 12%, #FFC72C 28%, #FFE27A 50%, #FFC72C 72%, rgba(184,137,0,0.5) 88%, transparent 100%)'
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] hidden h-[3px] md:block"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(184,137,0,0.45) 14%, #FFC72C 30%, #FFE27A 50%, #FFC72C 70%, rgba(184,137,0,0.45) 86%, transparent 100%)'
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[10%] left-0 top-[10%] z-[7] hidden w-px bg-gradient-to-b from-transparent via-gs-gold/55 to-transparent md:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[10%] right-0 top-[10%] z-[7] hidden w-px bg-gradient-to-b from-transparent via-gs-gold/45 to-transparent md:block"
          />

          {/* Overlay copy */}
          <div className="absolute inset-0 z-[12] hidden items-end pb-12 sm:items-center sm:pb-0 md:flex md:pt-8 lg:pt-12">
            <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
              <motion.div className="max-w-2xl" {...fadeUp}>
                <span className="inline-flex items-center gap-2 rounded-full border border-gs-gold/40 bg-gs-dark/35 px-3 py-1.5 font-ge text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gs-gold backdrop-blur-sm sm:text-[0.78rem]">
                  <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gs-gold shadow-[0_0_10px_rgba(255,199,44,0.7)]" />
                  {transportHeroCopy.eyebrow}
                </span>
                <h2 className="mt-5 font-ge text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.005em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem]">
                  {transportHeroCopy.title}
                </h2>

                <p className="mt-5 max-w-xl font-ge text-base leading-7 text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-[1.05rem] sm:leading-8 lg:text-[1.125rem]">
                  {transportHeroCopy.subtitle}
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <GeButton href="#transport-enquire" variant="gs-gold" size="lg">
                    {transportHeroCopy.primaryCta}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </GeButton>
                  <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-gs-white" size="lg">
                    <Phone className="h-4 w-4" aria-hidden />
                    {contactInfo.phoneDisplay}
                  </GeButton>
                </div>

                <p className="mt-5 font-ge text-sm font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-[0.78rem]">
                  Irish-owned · Mercedes fleet · Replies inside 2 hours
                </p>
              </motion.div>
            </div>
          </div>

          <motion.a
            href="#transport-promise"
            onClick={(event) => handleScrollToFormTarget(event, '#transport-promise')}
            aria-label="Scroll to the GolfSol Ireland transport promise"
            className="absolute bottom-4 right-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/85 bg-gs-dark/55 text-white backdrop-blur-md transition-colors hover:border-gs-gold hover:bg-gs-dark/75 hover:text-gs-gold md:bottom-6 md:left-1/2 md:right-auto md:h-12 md:w-12 md:-translate-x-1/2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.a>
        </div>
      </div>
    </section>
  )
}
