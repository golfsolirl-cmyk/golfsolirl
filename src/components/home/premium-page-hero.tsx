import { useReducedMotion } from 'framer-motion'
import { m } from 'framer-motion'
import { ArrowRight, MapPin, type LucideIcon } from 'lucide-react'
import { GeButton } from '../../pages/golf-experience/components/ge-button'
import { cx } from '../../lib/utils'
import type { HeroImageSet } from '../../lib/page-hero-images'
import {
  HERO_FORM_SCROLL_DEFAULT_LABEL,
  HERO_FORM_SCROLL_DEFAULT_SUBLABEL,
  HeroFormScrollCue
} from './hero-form-scroll-cue'

const COPY_PANEL_CLASS =
  'premium-golf-hero-copy-panel box-border w-full min-w-0 overflow-visible rounded-2xl border border-forest-800/15 bg-[#faf8f3] shadow-[0_16px_48px_rgba(6,32,22,0.14)]'

const TRUST_BAND_CLASS =
  'premium-golf-hero-trust-band relative z-20 overflow-hidden border-t border-forest-800/12 bg-gradient-to-b from-[#f3efe6] via-[#faf8f3] to-cream'

const HERO_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function heroAsset(publicPath: string): string {
  const path = publicPath.replace(/^\//, '')
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

const fadeUp = (delay = 0, reduceMotion: boolean) =>
  reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: HERO_EASE, delay }
      }

export type PremiumPageHeroTrustBadge = {
  readonly icon: LucideIcon
  readonly label: string
}

export type PremiumPageHeroFloatingBadge = {
  readonly kicker: string
  readonly title: string
  readonly panelClass?: string
  readonly offsetClass?: string
}

type GeButtonVariant =
  | 'gs-green'
  | 'gs-gold'
  | 'outline-gs-green'
  | 'outline-gs-white'
  | 'outline-white'

export type PremiumPageHeroCta = {
  readonly label: string
  readonly href: string
  readonly variant?: GeButtonVariant
  readonly icon?: LucideIcon
}

export type PremiumPageHeroProps = {
  readonly id?: string
  readonly titleId?: string
  readonly images: HeroImageSet
  readonly kicker: string
  readonly kickerIcon?: LucideIcon
  readonly titleLine1: string
  readonly titleLine2?: string
  readonly lead: string
  readonly primaryCta: PremiumPageHeroCta
  readonly secondaryCta?: PremiumPageHeroCta
  readonly trustBadges?: readonly PremiumPageHeroTrustBadge[]
  readonly trustSectionTitle?: string
  readonly floatingBadges?: readonly PremiumPageHeroFloatingBadge[]
  readonly formScrollTarget?: string
  readonly formScrollLabel?: string
  readonly formScrollSublabel?: string
  readonly mobileImageObjectPosition?: string
  readonly className?: string
  readonly srTitle?: string
}

export function PremiumPageHero({
  id = 'top',
  titleId = 'premium-hero-title',
  images,
  kicker,
  kickerIcon: KickerIcon = MapPin,
  titleLine1,
  titleLine2,
  lead,
  primaryCta,
  secondaryCta,
  trustBadges,
  trustSectionTitle = 'What we handle',
  floatingBadges,
  formScrollTarget,
  formScrollLabel,
  formScrollSublabel,
  mobileImageObjectPosition = 'center 72%',
  className,
  srTitle
}: PremiumPageHeroProps) {
  const reduceMotion = useReducedMotion()
  const desktopSrc = heroAsset(images.desktop)
  const tabletSrc = heroAsset(images.tablet)
  const mobileSrc = heroAsset(images.mobile)
  const PrimaryIcon = primaryCta.icon ?? ArrowRight
  const SecondaryIcon = secondaryCta?.icon ?? ArrowRight
  const showTrust = trustBadges && trustBadges.length > 0
  const scrollLabel = formScrollLabel ?? HERO_FORM_SCROLL_DEFAULT_LABEL
  const scrollSublabel = formScrollSublabel ?? HERO_FORM_SCROLL_DEFAULT_SUBLABEL

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cx('relative isolate overflow-visible bg-cream', className)}
    >
      {srTitle ? <h1 className="sr-only">{srTitle}</h1> : null}

      <div
        aria-hidden="true"
        className="relative z-20 h-[116px] w-full shrink-0 bg-cream max-sm:h-[126px] sm:h-[140px] md:h-[154px] lg:h-[124px] xl:h-[132px]"
      />

      <div className="relative max-md:-mt-5 max-sm:max-md:-mt-6 overflow-visible md:-mt-2 lg:-mt-3">
        <div className="relative md:hidden">
          <div className="relative h-[min(52vh,400px)] min-h-[260px] w-full overflow-hidden">
            <img
              src={mobileSrc}
              alt={images.alt}
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: mobileImageObjectPosition }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent via-cream/40 to-cream"
            />
          </div>

          {formScrollTarget ? (
            <HeroFormScrollCue
              href={formScrollTarget}
              label={scrollLabel}
              sublabel={scrollSublabel}
              placement="inline"
              className="bg-cream pb-2 pt-3"
            />
          ) : null}

          <div className="premium-golf-hero-mobile-copy border-t border-forest-800/10 bg-cream px-5 py-7 sm:px-6 sm:py-8">
            <HeroCopyPanel
              titleId={titleId}
              kicker={kicker}
              kickerIcon={KickerIcon}
              titleLine1={titleLine1}
              titleLine2={titleLine2}
              lead={lead}
              primaryCta={primaryCta}
              secondaryCta={secondaryCta}
              PrimaryIcon={PrimaryIcon}
              SecondaryIcon={SecondaryIcon}
              reduceMotion={Boolean(reduceMotion)}
              layout="mobile"
            />
          </div>

          {showTrust ? (
            <HeroTrustSection
              badges={trustBadges}
              title={trustSectionTitle}
              reduceMotion={Boolean(reduceMotion)}
              layout="scroll"
            />
          ) : null}
        </div>

        <div className="relative hidden md:block">
          <div className="relative">
            <picture className="block w-full lg:-mt-2">
              <source media="(min-width: 1024px)" srcSet={desktopSrc} type="image/webp" />
              <source media="(min-width: 768px)" srcSet={tabletSrc} type="image/webp" />
              <img
                src={tabletSrc}
                alt={images.alt}
                decoding="async"
                fetchPriority="high"
                className="block h-auto w-full max-w-full select-none object-cover object-top"
              />
            </picture>

            <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-start pt-5 md:pt-6 lg:pt-8">
              <div className="pointer-events-auto ml-5 w-full max-w-[22.5rem] md:ml-6 md:max-w-[24rem] lg:ml-10 lg:max-w-[26.5rem] xl:max-w-[28rem]">
                <div className={cx(COPY_PANEL_CLASS, 'p-5 md:p-5 lg:p-6')}>
                  <HeroCopyPanel
                    titleId={titleId}
                    kicker={kicker}
                    kickerIcon={KickerIcon}
                    titleLine1={titleLine1}
                    titleLine2={titleLine2}
                    lead={lead}
                    primaryCta={primaryCta}
                    secondaryCta={secondaryCta}
                    PrimaryIcon={PrimaryIcon}
                    SecondaryIcon={SecondaryIcon}
                    reduceMotion={Boolean(reduceMotion)}
                    layout="desktop"
                  />
                </div>
              </div>
            </div>

            {formScrollTarget ? (
              <HeroFormScrollCue
                href={formScrollTarget}
                label={scrollLabel}
                sublabel={scrollSublabel}
                placement="overlay"
                className="bottom-[18%] left-1/2 right-auto max-md:max-w-[min(100%,18.5rem)] md:bottom-[14%] lg:bottom-10"
              />
            ) : null}

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-b from-transparent to-cream/90 lg:h-16"
            />
          </div>

          {showTrust ? (
            <HeroTrustSection
              badges={trustBadges}
              title={trustSectionTitle}
              reduceMotion={Boolean(reduceMotion)}
              layout="grid"
            />
          ) : null}
        </div>

        {floatingBadges && floatingBadges.length > 0 ? (
          <HeroFloatingBadges badges={floatingBadges} reduceMotion={Boolean(reduceMotion)} />
        ) : null}
      </div>
    </section>
  )
}

function HeroCopyPanel({
  titleId,
  kicker,
  kickerIcon: KickerIcon,
  titleLine1,
  titleLine2,
  lead,
  primaryCta,
  secondaryCta,
  PrimaryIcon,
  SecondaryIcon,
  reduceMotion,
  layout
}: {
  readonly titleId: string
  readonly kicker: string
  readonly kickerIcon: LucideIcon
  readonly titleLine1: string
  readonly titleLine2?: string
  readonly lead: string
  readonly primaryCta: PremiumPageHeroCta
  readonly secondaryCta?: PremiumPageHeroCta
  readonly PrimaryIcon: LucideIcon
  readonly SecondaryIcon: LucideIcon
  readonly reduceMotion: boolean
  readonly layout: 'mobile' | 'desktop'
}) {
  const isMobile = layout === 'mobile'

  return (
    <div className={cx('flex flex-col', isMobile ? 'gap-5' : 'gap-4 md:gap-5')}>
      {isMobile ? (
        <m.p
          data-keep-color
          className="font-ge text-[0.8rem] font-extrabold uppercase leading-snug tracking-[0.16em] text-forest-800/85"
          {...fadeUp(0, reduceMotion)}
        >
          {kicker}
        </m.p>
      ) : (
        <m.p
          data-keep-color
          className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-forest-800/25 bg-white px-3.5 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase leading-snug tracking-[0.11em] text-[#062016] sm:px-4 sm:py-1.5 sm:text-[0.8rem] sm:tracking-[0.14em]"
          {...fadeUp(0, reduceMotion)}
        >
          <KickerIcon className="h-3.5 w-3.5 shrink-0 text-forest-800 sm:h-4 sm:w-4" aria-hidden />
          {kicker}
        </m.p>
      )}

      <m.h2
        id={titleId}
        data-keep-color
        className={cx(
          'max-w-full font-ge font-extrabold tracking-[-0.02em] text-[#062016]',
          isMobile
            ? 'text-[1.78rem] leading-[1.15] sm:text-[1.95rem] sm:leading-[1.13]'
            : 'text-[1.55rem] leading-[1.16] sm:text-[1.78rem] sm:leading-[1.12] md:text-[2.55rem] md:leading-[1.08] lg:text-[3rem] lg:leading-[1.06] xl:text-[3.25rem]'
        )}
        {...fadeUp(0.06, reduceMotion)}
      >
        <span className="block text-balance" style={{ color: '#062016' }}>
          {titleLine1}
        </span>
        {titleLine2 ? (
          <span className={cx('block text-balance', isMobile ? 'mt-2' : 'mt-1.5 md:mt-2')} style={{ color: '#062016' }}>
            {titleLine2}
          </span>
        ) : null}
      </m.h2>

      <m.p
        data-keep-color
        className={cx(
          'premium-golf-hero-lead max-w-full text-pretty font-ge text-[#0b4d3b]',
          isMobile
            ? 'text-[1.08rem] leading-[1.68]'
            : 'text-[0.98rem] leading-[1.66] sm:text-[1.06rem] sm:leading-[1.7] md:text-[1.12rem] md:leading-[1.72] lg:text-[1.16rem] lg:leading-[1.74]'
        )}
        {...fadeUp(0.12, reduceMotion)}
      >
        {lead}
      </m.p>

      <m.div
        className={cx(
          'flex flex-col',
          isMobile ? 'gap-3 pt-1' : 'gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3'
        )}
        {...fadeUp(0.18, reduceMotion)}
      >
        <GeButton
          href={primaryCta.href}
          variant={primaryCta.variant ?? 'gs-gold'}
          size={isMobile ? 'md' : 'lg'}
          className="w-full min-w-0 !text-[1.06rem] !leading-snug !tracking-[0.1em] sm:w-auto sm:!text-[1.03rem] md:!text-[1.06rem] lg:!text-[1.1rem]"
        >
          {primaryCta.label}
          <PrimaryIcon className="h-4 w-4 shrink-0 sm:h-[1.05rem] sm:w-[1.05rem]" aria-hidden />
        </GeButton>
        {secondaryCta ? (
          <GeButton
            href={secondaryCta.href}
            variant={secondaryCta.variant ?? 'outline-gs-green'}
            size={isMobile ? 'md' : 'lg'}
            className="w-full min-w-0 !text-[1.06rem] !leading-snug !tracking-[0.1em] sm:w-auto sm:!text-[1.03rem] md:!text-[1.06rem] lg:!text-[1.1rem]"
          >
            {secondaryCta.label}
            <SecondaryIcon className="h-4 w-4 shrink-0 sm:h-[1.05rem] sm:w-[1.05rem]" aria-hidden />
          </GeButton>
        ) : null}
      </m.div>
    </div>
  )
}

function HeroTrustSection({
  badges,
  title,
  reduceMotion,
  layout,
  className
}: {
  readonly badges: readonly PremiumPageHeroTrustBadge[]
  readonly title: string
  readonly reduceMotion: boolean
  readonly layout: 'scroll' | 'grid'
  readonly className?: string
}) {
  const isScroll = layout === 'scroll'

  return (
    <m.section
      aria-label={title}
      className={cx(TRUST_BAND_CLASS, isScroll ? 'px-5 pb-6 pt-5 sm:px-6' : 'px-5 py-6 md:px-6 lg:px-10 lg:py-8', className)}
      {...fadeUp(0.2, reduceMotion)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4a843]/70 to-transparent"
      />
      <div className={cx('relative', isScroll ? '' : 'mx-auto max-w-[1240px]')}>
        <div className="mb-4 flex items-center gap-3 md:mb-5">
          <span
            aria-hidden
            className="h-px w-10 shrink-0 bg-gradient-to-r from-[#d4a843] to-forest-800/50 sm:w-12"
          />
          <h2 className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-forest-950 sm:text-[0.72rem]">
            {title}
          </h2>
          <span
            aria-hidden
            className="h-px min-w-[2rem] flex-1 bg-gradient-to-r from-forest-800/25 to-transparent"
          />
        </div>

        <ul
          className={cx(
            'premium-golf-hero-trust',
            isScroll
              ? '-mx-0.5 flex gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 pt-0.5 [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden'
              : 'grid grid-cols-2 gap-3 md:gap-3.5 lg:grid-cols-4 lg:gap-4'
          )}
        >
          {badges.map((badge, index) => (
            <HeroTrustCard key={badge.label} {...badge} layout={layout} index={index} />
          ))}
        </ul>
      </div>
    </m.section>
  )
}

function HeroTrustCard({
  icon: Icon,
  label,
  layout,
  index
}: PremiumPageHeroTrustBadge & { readonly layout: 'scroll' | 'grid'; readonly index: number }) {
  const isScroll = layout === 'scroll'

  return (
    <li
      data-keep-color
      className={cx(
        'premium-golf-hero-trust-item group relative overflow-hidden rounded-2xl border border-forest-800/15',
        'bg-gradient-to-b from-white to-[#f5f1e8] shadow-[0_10px_28px_rgba(6,32,22,0.09),inset_0_1px_0_rgba(255,255,255,0.95)]',
        'transition-transform duration-300 md:hover:-translate-y-0.5 md:hover:shadow-[0_14px_36px_rgba(6,32,22,0.14)]',
        isScroll ? 'w-[10.25rem] shrink-0 snap-start p-3.5 sm:w-[11rem] sm:p-4' : 'flex min-h-[5.75rem] flex-col p-3.5 sm:min-h-[6.25rem] sm:p-4'
      )}
    >
      <span
        aria-hidden
        className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#d4a843] to-transparent opacity-90"
      />
      <span
        aria-hidden
        className={cx(
          'pointer-events-none absolute -right-3 -top-3 h-14 w-14 rounded-full opacity-[0.07]',
          index % 2 === 0 ? 'bg-forest-800' : 'bg-[#d4a843]'
        )}
      />
      <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-forest-800 to-brand-700 text-white shadow-[0_6px_18px_rgba(11,77,59,0.32)] ring-2 ring-white/80 sm:h-10 sm:w-10">
        <Icon className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" aria-hidden strokeWidth={2.25} />
      </span>
      <span
        data-keep-color
        className={cx(
          'premium-golf-hero-trust-label relative mt-3 font-ge font-bold leading-snug text-[#0b4d3b]',
          isScroll ? 'text-[0.8rem] leading-[1.38] sm:text-[0.84rem]' : 'text-[0.84rem] leading-[1.38] sm:text-[0.9rem]'
        )}
      >
        {label}
      </span>
    </li>
  )
}

function HeroFloatingBadges({
  badges,
  reduceMotion
}: {
  readonly badges: readonly PremiumPageHeroFloatingBadge[]
  readonly reduceMotion: boolean
}) {
  return (
    <div className="ge-on-dark pointer-events-none absolute right-6 top-[38%] z-30 hidden flex-col gap-3 lg:flex xl:right-10">
      {badges.map((badge, index) => (
        <HeroFloatingBadge key={badge.kicker} {...badge} reduceMotion={reduceMotion} entranceDelay={0.32 + index * 0.12} />
      ))}
    </div>
  )
}

function HeroFloatingBadge({
  kicker,
  title,
  panelClass = 'border-forest-700 bg-forest-900 shadow-[0_12px_32px_rgba(6,32,22,0.35)]',
  offsetClass = '',
  reduceMotion,
  entranceDelay
}: PremiumPageHeroFloatingBadge & { readonly reduceMotion: boolean; readonly entranceDelay: number }) {
  const panel = (
    <div className={cx('relative overflow-hidden rounded-xl border px-4 py-3', panelClass)}>
      <p className="relative font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-white/85">{kicker}</p>
      <p className="relative mt-1 font-ge text-sm font-bold text-white">{title}</p>
    </div>
  )

  if (reduceMotion) {
    return <div className={offsetClass}>{panel}</div>
  }

  return (
    <m.div
      className={offsetClass}
      initial={{ opacity: 0, x: 32, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.62, delay: entranceDelay, ease: HERO_EASE }}
    >
      <m.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.6 + entranceDelay, repeat: Infinity, ease: 'easeInOut', delay: entranceDelay + 0.5 }}
      >
        {panel}
      </m.div>
    </m.div>
  )
}

export function splitHeroTitle(title: string): { readonly line1: string; readonly line2?: string } {
  const comma = title.indexOf(',')
  if (comma >= 0 && comma < title.length - 2) {
    return {
      line1: title.slice(0, comma + 1).trim(),
      line2: title.slice(comma + 1).trim()
    }
  }

  const words = title.trim().split(/\s+/)
  if (words.length <= 7) {
    return { line1: title.trim() }
  }

  const mid = Math.ceil(words.length / 2)
  return {
    line1: words.slice(0, mid).join(' '),
    line2: words.slice(mid).join(' ')
  }
}
