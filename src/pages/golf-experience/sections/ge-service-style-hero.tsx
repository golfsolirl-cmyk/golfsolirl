import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, CheckCircle2, ChevronDown, Phone } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { contactInfo } from '../data/copy'
import { handleScrollToFormTarget } from '../../../lib/scroll-to-form-target'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
} as const

function getMobileHeroTitleStyle(title: string) {
  const length = title.trim().length

  if (length > 72) {
    return {
      fontSize: 'clamp(1.96rem, 7.9vw, 2.56rem)',
      lineHeight: 1.08,
      letterSpacing: '-0.02em',
      maxWidth: '13ch',
      textWrap: 'balance' as const
    }
  }

  if (length > 56) {
    return {
      fontSize: 'clamp(2.08rem, 8.4vw, 2.82rem)',
      lineHeight: 1.07,
      letterSpacing: '-0.018em',
      maxWidth: '13.5ch',
      textWrap: 'balance' as const
    }
  }

  if (length > 40) {
    return {
      fontSize: 'clamp(2.18rem, 8.9vw, 2.96rem)',
      lineHeight: 1.06,
      letterSpacing: '-0.016em',
      maxWidth: '14.25ch',
      textWrap: 'balance' as const
    }
  }

  return {
    fontSize: 'clamp(2.5rem, 9.8vw, 3.35rem)',
    lineHeight: 1.04,
    letterSpacing: '-0.02em',
    maxWidth: '14.5ch',
    textWrap: 'balance' as const
  }
}

export type GeServiceStyleHeroHighlight = {
  readonly icon?: LucideIcon
  readonly label: string
}

export type GeServiceStyleHeroProps = {
  readonly id?: string
  readonly srTitle: string
  readonly eyebrow: string
  readonly title: string
  readonly subtitle: string
  readonly image: string
  readonly imageAlt: string
  readonly primaryCta: { readonly label: string; readonly href: string }
  readonly showPhoneCta?: boolean
  readonly showNavbarSpacer?: boolean
  readonly nextSectionId?: string
  readonly mobileHighlights?: readonly GeServiceStyleHeroHighlight[]
  readonly trustLine?: string
  readonly imageFit?: 'cover' | 'contain'
}

/**
 * Cinematic service hero — same composition as {@link TransportHero} but
 * driven by page props so marketing routes share one premium layout.
 */
export function GeServiceStyleHero({
  id = 'ge-service-hero-top',
  srTitle,
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  primaryCta,
  showPhoneCta = true,
  showNavbarSpacer = true,
  nextSectionId = '#ge-content-promise',
  mobileHighlights,
  trustLine = 'Irish-owned · Costa del Sol specialists · Replies inside 2 hours',
  imageFit = 'cover'
}: GeServiceStyleHeroProps) {
  const mobileTitleStyle = getMobileHeroTitleStyle(title)
  const highlights =
    mobileHighlights && mobileHighlights.length > 0
      ? mobileHighlights.slice(0, 3)
      : ([
          { icon: CheckCircle2, label: 'Plain-English planning' },
          { icon: CheckCircle2, label: 'Group-first routing & timing' },
          { icon: CheckCircle2, label: 'Fast quote turnaround' }
        ] satisfies readonly GeServiceStyleHeroHighlight[])

  return (
    <section className="relative isolate overflow-hidden bg-gs-dark text-white" aria-labelledby={`${id}-title`} id={id}>
      <h1 className="sr-only">{srTitle}</h1>
      {showNavbarSpacer ? (
        <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />
      ) : null}

      <div className="relative w-full overflow-hidden bg-gs-dark">
        <picture className="block md:absolute md:inset-0 md:h-full md:w-full">
          <img
            src={image}
            alt={imageAlt}
            className={
              imageFit === 'contain'
                ? 'block h-[54vh] min-h-[360px] w-full select-none object-contain object-center md:absolute md:inset-0 md:h-full md:min-h-0 md:w-full md:object-contain'
                : 'block h-[54vh] min-h-[360px] w-full select-none object-cover object-[58%_42%] md:absolute md:inset-0 md:h-full md:min-h-0 md:w-full md:object-[center_45%]'
            }
            fetchPriority="high"
            decoding="async"
            width={2400}
            height={1320}
          />
        </picture>

        <div className="relative w-full pb-8 md:aspect-[16/9] md:pb-0 lg:aspect-[21/9]">
          <div aria-hidden className="absolute inset-x-0 top-0 z-[5] h-[54vh] min-h-[360px] bg-gradient-to-t from-gs-dark via-gs-dark/15 to-transparent md:hidden" />

          <div className="relative z-[12] -mt-16 px-4 md:hidden">
            <motion.div
              className="mx-auto w-full max-w-[34rem] overflow-hidden rounded-[1.75rem] border border-gs-gold/30 bg-gs-dark/95 p-5 shadow-[0_26px_60px_rgba(1,16,12,0.62)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-gs-gold/35 bg-gs-dark/45 px-3 py-1.5 font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-gs-gold">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gs-gold shadow-[0_0_10px_rgba(255,199,44,0.68)]" />
                {eyebrow}
              </span>
              <h2
                id={`${id}-title`}
                className="mt-4 font-ge font-extrabold text-white"
                style={mobileTitleStyle}
              >
                {title}
              </h2>
              <p className="mt-3 font-ge text-[1.08rem] leading-8 text-white/88">{subtitle}</p>

              <ul className="mt-5 space-y-2">
                {highlights.map(({ icon: Icon = CheckCircle2, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-ge text-[0.92rem] font-semibold uppercase tracking-[0.06em] text-white/84"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gs-gold" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-3">
                <GeButton href={primaryCta.href} variant="gs-gold" size="lg" className="w-full">
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </GeButton>
                {showPhoneCta ? (
                  <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-gs-white" size="lg" className="w-full">
                    <Phone className="h-4 w-4" aria-hidden />
                    {contactInfo.phoneDisplay}
                  </GeButton>
                ) : null}
              </div>

              <p className="mt-4 font-ge text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-white/74">{trustLine}</p>
            </motion.div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] hidden bg-gradient-to-r from-gs-dark/85 via-gs-dark/55 to-transparent md:block md:from-gs-dark/80 md:via-gs-dark/40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] hidden bg-gradient-to-t from-gs-dark/75 via-transparent to-gs-dark/30 md:block"
          />

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
                  <GeButton href={primaryCta.href} variant="gs-gold" size="lg">
                    {primaryCta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </GeButton>
                  {showPhoneCta ? (
                    <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-gs-white" size="lg">
                      <Phone className="h-4 w-4" aria-hidden />
                      {contactInfo.phoneDisplay}
                    </GeButton>
                  ) : null}
                </div>

                <p className="mt-5 font-ge text-sm font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-[0.78rem]">{trustLine}</p>
              </motion.div>
            </div>
          </div>

          <motion.a
            href={nextSectionId}
            onClick={(event) => handleScrollToFormTarget(event, nextSectionId)}
            aria-label="Scroll to the next section"
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
