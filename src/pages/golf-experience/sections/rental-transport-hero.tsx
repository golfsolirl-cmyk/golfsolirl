import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Clock3, Package, Phone, ShieldCheck } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GeCinematicHeroScrims } from '../components/ge-cinematic-hero-scrims'
import { GeRentalBagEmbroideredLogo } from '../components/ge-rental-bag-embroidered-logo'
import { GeRentalPremiumHeroOverlay } from '../components/ge-rental-premium-hero-overlay'
import { GeSmartActionCard } from '../components/ge-smart-action-card'
import { contactInfo } from '../data/copy'
import type { ContentSmartAction } from '../content-page-context'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
} as const

const mobileHighlights = [
  { icon: Package, label: 'Sets matched to your trip' },
  { icon: ShieldCheck, label: 'Irish-owned coordination' },
  { icon: Clock3, label: 'Fast rental confirmations' }
] as const

export interface RentalTransportHeroProps {
  readonly eyebrow: string
  readonly title: string
  readonly subtitle: string
  readonly heroImage: string
  readonly heroAlt: string
  readonly smartActions: readonly ContentSmartAction[]
}

/**
 * Same cinematic shell as {@link TransportHero}: full-bleed image, aspect frame,
 * mobile “floating” card, desktop left-anchored overlay, gold hairline at photo bottom,
 * chevron — plus a dark band of {@link GeSmartActionCard}s under the hero
 * (rental smart buttons).
 */
export function RentalTransportHero({
  eyebrow,
  title,
  subtitle,
  heroImage,
  heroAlt,
  smartActions
}: RentalTransportHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-gs-dark text-white" aria-labelledby="rental-hero-title" id="rental-top">
      <h1 id="rental-hero-title" className="sr-only">
        {title}
      </h1>
      <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />

      <div className="relative w-full overflow-hidden bg-gs-dark">
        <div className="relative block md:absolute md:inset-0 md:h-full md:w-full">
          <img
            src={heroImage}
            alt={heroAlt}
            className="block h-[54vh] min-h-[360px] w-full select-none object-cover object-[58%_42%] md:absolute md:inset-0 md:h-full md:min-h-0 md:w-full md:object-[center_45%]"
            fetchPriority="high"
            decoding="async"
            width={2200}
            height={1100}
          />
          <GeRentalBagEmbroideredLogo />
          {/* Gold hairline flush with bottom of hero photo (mobile: image box; md+ same as frame). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-[3px] md:hidden"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(184,137,0,0.45) 14%, #FFC72C 30%, #FFE27A 50%, #FFC72C 70%, rgba(184,137,0,0.45) 86%, transparent 100%)'
            }}
          />
        </div>

        <div className="relative w-full pb-8 md:aspect-[16/9] md:pb-0 lg:aspect-[21/9]">
          <div aria-hidden className="absolute inset-x-0 top-0 z-[5] h-[54vh] min-h-[360px] bg-gradient-to-t from-gs-dark via-gs-dark/15 to-transparent md:hidden" />

          <div className="relative z-[12] -mt-16 px-4 md:hidden">
            <motion.div
              className="mx-auto w-full max-w-[34rem] overflow-hidden rounded-[1.75rem] border border-gs-gold/30 bg-gs-dark/95 p-5 shadow-[0_26px_60px_rgba(1,16,12,0.62)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-gs-gold/35 bg-gs-dark/45 px-3 py-1.5 font-ge text-[0.66rem] font-bold uppercase tracking-[0.18em] text-gs-gold">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gs-gold shadow-[0_0_10px_rgba(255,199,44,0.68)]" />
                {eyebrow}
              </span>
              <h2 className="mt-4 font-ge text-[2.05rem] font-extrabold leading-[1.04] tracking-[-0.01em] text-white">{title}</h2>
              <p className="mt-3 font-ge text-[1.02rem] leading-7 text-white/85">{subtitle}</p>

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
                <GeButton href="#ge-enquiry-form" variant="gs-gold" size="lg" className="w-full">
                  Request rental options
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </GeButton>
                <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-gs-white" size="lg" className="w-full">
                  <Phone className="h-4 w-4" aria-hidden />
                  {contactInfo.phoneDisplay}
                </GeButton>
              </div>

              <p className="mt-4 font-ge text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white/68">
                Irish-owned · Hotel delivery where available · Fast replies
              </p>
            </motion.div>
          </div>

          <GeCinematicHeroScrims coverage="left" />
          <GeRentalPremiumHeroOverlay />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[18] hidden h-[3px] md:block"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(184,137,0,0.45) 14%, #FFC72C 30%, #FFE27A 50%, #FFC72C 70%, rgba(184,137,0,0.45) 86%, transparent 100%)'
            }}
          />

          <div className="absolute inset-0 z-[10] hidden items-end pb-12 sm:items-center sm:pb-0 md:flex">
            <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
              <motion.div className="max-w-2xl" {...fadeUp}>
                <span className="inline-flex items-center gap-2 rounded-full border border-gs-gold/40 bg-gs-dark/35 px-3 py-1.5 font-ge text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gs-gold backdrop-blur-sm sm:text-[0.78rem]">
                  <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gs-gold shadow-[0_0_10px_rgba(255,199,44,0.7)]" />
                  {eyebrow}
                </span>
                <h2 className="mt-5 font-ge text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.005em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem]">
                  {title}
                </h2>
                <p className="mt-5 max-w-xl font-ge text-base leading-7 text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-[1.05rem] sm:leading-8 lg:text-[1.125rem]">
                  {subtitle}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <GeButton href="#ge-enquiry-form" variant="gs-gold" size="lg">
                    Request rental options
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </GeButton>
                  <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-gs-white" size="lg">
                    <Phone className="h-4 w-4" aria-hidden />
                    {contactInfo.phoneDisplay}
                  </GeButton>
                </div>
                <p className="mt-5 font-ge text-sm font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-[0.78rem]">
                  Irish-owned · Hotel delivery where available · Fast replies
                </p>
              </motion.div>
            </div>
          </div>

          <motion.div
            className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 sm:bottom-3 md:bottom-4 lg:bottom-5"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          >
            <a
              href="#rental-content"
              aria-label="Scroll to club rental details"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/85 bg-gs-dark/55 text-white backdrop-blur-md transition-colors hover:border-gs-gold hover:bg-gs-dark/75 hover:text-gs-gold md:h-12 md:w-12"
            >
              <ChevronDown className="h-5 w-5" aria-hidden />
            </a>
          </motion.div>
        </div>

        {smartActions.length > 0 ? (
          <div className="border-t border-gs-gold/35 bg-gs-dark px-4 py-6 sm:px-8">
            <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {smartActions.map((action) => (
                <GeSmartActionCard key={action.label} action={action} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
