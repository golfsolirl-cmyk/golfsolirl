import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Phone } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { contactInfo } from '../data/copy'
import { transportHeroCopy } from '../data/transport-service'

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
  return (
    <section
      className="relative isolate overflow-hidden bg-gs-dark text-white"
      aria-labelledby="transport-hero-title"
      id="transport-top"
    >
      <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />

      <div className="relative w-full overflow-hidden bg-gs-dark">
        {/* Image — natural height on mobile, locked aspect on desktop */}
        <picture className="block md:absolute md:inset-0 md:h-full md:w-full">
          <img
            src="/images/transport-hero-coastal-drive.jpg"
            alt="Black Mercedes V-Class on the AP-7 coastal motorway above Marbella at golden hour, Mediterranean sea on the right."
            className="block h-auto w-full select-none object-cover object-[center_45%] md:absolute md:inset-0 md:h-full md:w-full"
            fetchPriority="high"
            decoding="async"
            width={2400}
            height={1320}
          />
        </picture>

        {/* Aspect frame for tablet+ — keeps editorial proportions */}
        <div className="relative w-full md:aspect-[16/9] lg:aspect-[21/9]">
          {/* Vignette + readability scrims (left-anchored copy) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-r from-gs-dark/85 via-gs-dark/55 to-transparent md:from-gs-dark/80 md:via-gs-dark/40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-gs-dark/75 via-transparent to-gs-dark/30"
          />

          {/* Gold hairline frame */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[7] h-[3px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(184,137,0,0.5) 12%, #FFC72C 28%, #FFE27A 50%, #FFC72C 72%, rgba(184,137,0,0.5) 88%, transparent 100%)'
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] h-[3px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(184,137,0,0.45) 14%, #FFC72C 30%, #FFE27A 50%, #FFC72C 70%, rgba(184,137,0,0.45) 86%, transparent 100%)'
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[10%] left-0 top-[10%] z-[7] w-px bg-gradient-to-b from-transparent via-gs-gold/55 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[10%] right-0 top-[10%] z-[7] w-px bg-gradient-to-b from-transparent via-gs-gold/45 to-transparent"
          />

          {/* Overlay copy */}
          <div className="absolute inset-0 z-[10] flex items-end pb-12 sm:items-center sm:pb-0">
            <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
              <motion.div className="max-w-2xl" {...fadeUp}>
                <span className="inline-flex items-center gap-2 rounded-full border border-gs-gold/40 bg-gs-dark/35 px-3 py-1.5 font-ge text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gs-gold backdrop-blur-sm sm:text-[0.78rem]">
                  <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gs-gold shadow-[0_0_10px_rgba(255,199,44,0.7)]" />
                  {transportHeroCopy.eyebrow}
                </span>

                <h1
                  id="transport-hero-title"
                  className="mt-5 font-ge text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.005em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem]"
                >
                  {transportHeroCopy.title}
                </h1>

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
