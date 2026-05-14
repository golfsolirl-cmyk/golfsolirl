import { m  } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GeDualPhoneHeroButtons } from '../components/ge-dual-phone-contact'
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
  /** Light, sunny Costa treatment (cream + sky scrims) — golf course & map routes. */
  readonly visualTone?: 'cinematic' | 'solstice'
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
  imageFit = 'cover',
  visualTone = 'cinematic'
}: GeServiceStyleHeroProps) {
  const sunny = visualTone === 'solstice'
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
    <section
      className={sunny ? 'relative isolate z-[38] overflow-hidden bg-[#fffbf5] text-gs-dark' : 'relative isolate z-[38] overflow-hidden bg-gs-dark text-white'}
      aria-labelledby={`${id}-title`}
      id={id}
    >
      <h1 className="sr-only">{srTitle}</h1>
      {showNavbarSpacer ? (
        <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />
      ) : null}

      <div className={sunny ? 'relative w-full overflow-hidden bg-[#faf6ec]' : 'relative w-full overflow-hidden bg-gs-dark'}>
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
          <div
            aria-hidden
            className={
              sunny
                ? 'absolute inset-x-0 top-0 z-[5] h-[54vh] min-h-[360px] bg-gradient-to-t from-[#fffbf5] via-[#fffbf5]/55 to-transparent md:hidden'
                : 'absolute inset-x-0 top-0 z-[5] h-[54vh] min-h-[360px] bg-gradient-to-t from-gs-dark via-gs-dark/15 to-transparent md:hidden'
            }
          />

          <div className="relative z-[12] -mt-16 px-4 md:hidden">
            <m.div
              className={
                sunny
                  ? 'mx-auto w-full max-w-[34rem] overflow-hidden rounded-[1.75rem] border border-amber-200/70 bg-white p-5 shadow-[0_22px_50px_rgba(115,132,33,0.18)]'
                  : 'mx-auto w-full max-w-[34rem] overflow-hidden rounded-[1.75rem] border border-gs-gold/30 bg-gs-dark/95 p-5 shadow-[0_26px_60px_rgba(1,16,12,0.62)] backdrop-blur-xl'
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <span
                className={
                  sunny
                    ? 'inline-flex items-center gap-2 rounded-full border border-gs-gold/45 bg-amber-50/90 px-3 py-1.5 font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-gs-green'
                    : 'inline-flex items-center gap-2 rounded-full border border-gs-gold/35 bg-gs-dark/45 px-3 py-1.5 font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-gs-gold'
                }
              >
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gs-gold shadow-[0_0_10px_rgba(213,198,0,0.68)]" />
                {eyebrow}
              </span>
              <h2
                id={`${id}-title`}
                className={sunny ? 'mt-4 font-ge font-extrabold text-gs-dark' : 'mt-4 font-ge font-extrabold text-white'}
                style={mobileTitleStyle}
              >
                {title}
              </h2>
              <p className={sunny ? 'mt-3 font-ge text-[1.08rem] leading-8 text-ge-gray500' : 'mt-3 font-ge text-[1.08rem] leading-8 text-white/88'}>{subtitle}</p>

              <ul className="mt-5 space-y-2">
                {highlights.map(({ icon: Icon = CheckCircle2, label }) => (
                  <li
                    key={label}
                    className={
                      sunny
                        ? 'flex items-center gap-2.5 rounded-xl border border-amber-100 bg-[#fffef9] px-3 py-2.5 font-ge text-[0.92rem] font-semibold uppercase tracking-[0.06em] text-gs-dark'
                        : 'flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-ge text-[0.92rem] font-semibold uppercase tracking-[0.06em] text-white/84'
                    }
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
                {showPhoneCta ? <GeDualPhoneHeroButtons tone={sunny ? 'sunny' : 'dark'} className="w-full" /> : null}
              </div>

              <p
                className={
                  sunny
                    ? 'mt-4 font-ge text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-ge-gray500'
                    : 'mt-4 font-ge text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-white/74'
                }
              >
                {trustLine}
              </p>
            </m.div>
          </div>

          <div
            aria-hidden
            className={
              sunny
                ? 'pointer-events-none absolute inset-0 z-[5] hidden bg-gradient-to-r from-white/90 via-white/45 to-transparent md:block'
                : 'pointer-events-none absolute inset-0 z-[5] hidden bg-gradient-to-r from-gs-dark/85 via-gs-dark/55 to-transparent md:block md:from-gs-dark/80 md:via-gs-dark/40'
            }
          />
          <div
            aria-hidden
            className={
              sunny
                ? 'pointer-events-none absolute inset-0 z-[5] hidden bg-gradient-to-t from-[#fff8ed]/85 via-transparent to-sky-100/25 md:block'
                : 'pointer-events-none absolute inset-0 z-[5] hidden bg-gradient-to-t from-gs-dark/75 via-transparent to-gs-dark/30 md:block'
            }
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[7] hidden h-[3px] md:block"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(184,137,0,0.5) 12%, #D5C600 28%, #EBE486 50%, #D5C600 72%, rgba(184,137,0,0.5) 88%, transparent 100%)'
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] hidden h-[3px] md:block"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(184,137,0,0.45) 14%, #D5C600 30%, #EBE486 50%, #D5C600 70%, rgba(184,137,0,0.45) 86%, transparent 100%)'
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

          <div className="absolute inset-0 z-[12] hidden items-end pb-12 sm:items-center sm:pb-0 md:flex md:pt-8 lg:pt-12">
            <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
              <m.div className="max-w-2xl" {...fadeUp}>
                <span
                  className={
                    sunny
                      ? 'inline-flex items-center gap-2 rounded-full border border-gs-gold/50 bg-white px-3 py-1.5 font-ge text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gs-green shadow-sm sm:text-[0.78rem]'
                      : 'inline-flex items-center gap-2 rounded-full border border-gs-gold/40 bg-gs-dark/35 px-3 py-1.5 font-ge text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gs-gold backdrop-blur-sm sm:text-[0.78rem]'
                  }
                >
                  <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gs-gold shadow-[0_0_10px_rgba(213,198,0,0.7)]" />
                  {eyebrow}
                </span>
                <h2
                  className={
                    sunny
                      ? 'mt-5 font-ge text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.005em] text-gs-dark drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem]'
                      : 'mt-5 font-ge text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.005em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem]'
                  }
                >
                  {title}
                </h2>

                <p
                  className={
                    sunny
                      ? 'mt-5 max-w-xl font-ge text-base leading-7 text-ge-gray600 sm:text-[1.05rem] sm:leading-8 lg:text-[1.125rem]'
                      : 'mt-5 max-w-xl font-ge text-base leading-7 text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-[1.05rem] sm:leading-8 lg:text-[1.125rem]'
                  }
                >
                  {subtitle}
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <GeButton href={primaryCta.href} variant="gs-gold" size="lg">
                    {primaryCta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </GeButton>
                  {showPhoneCta ? (
                    <GeDualPhoneHeroButtons tone={sunny ? 'sunny' : 'dark'} className="w-full min-w-0 sm:w-auto sm:flex-1" />
                  ) : null}
                </div>

                <p
                  className={
                    sunny
                      ? 'mt-5 font-ge text-sm font-semibold uppercase tracking-[0.16em] text-ge-gray500 sm:text-[0.78rem]'
                      : 'mt-5 font-ge text-sm font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-[0.78rem]'
                  }
                >
                  {trustLine}
                </p>
              </m.div>
            </div>
          </div>

          <m.a
            href={nextSectionId}
            onClick={(event) => handleScrollToFormTarget(event, nextSectionId)}
            aria-label="Scroll to the next section"
            className={
              sunny
                ? 'absolute bottom-4 right-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-gs-gold/60 bg-white text-gs-green shadow-md transition-colors hover:border-gs-green hover:bg-amber-50 md:bottom-6 md:left-1/2 md:right-auto md:h-12 md:w-12 md:-translate-x-1/2'
                : 'absolute bottom-4 right-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/85 bg-gs-dark/55 text-white backdrop-blur-md transition-colors hover:border-gs-gold hover:bg-gs-dark/75 hover:text-gs-gold md:bottom-6 md:left-1/2 md:right-auto md:h-12 md:w-12 md:-translate-x-1/2'
            }
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          >
            <ChevronDown className="h-5 w-5" />
          </m.a>
        </div>
      </div>
    </section>
  )
}
