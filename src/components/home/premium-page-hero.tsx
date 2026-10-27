import { useReducedMotion } from 'framer-motion'
import { m } from 'framer-motion'
import { ArrowRight, ChevronRight, Phone, Sun, type LucideIcon } from 'lucide-react'
import { companyContact } from '../../data/site-content'
import { cx } from '../../lib/utils'
import type { HeroImageSet } from '../../lib/page-hero-images'

const HERO_CALL_DISPLAY = '086 8515000'
const HERO_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function heroAsset(publicPath: string): string {
  const path = publicPath.replace(/^\//, '')
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

function sourceType(src: string): string | undefined {
  const lower = src.toLowerCase()
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  return undefined
}

const fadeUp = (delay = 0, reduceMotion: boolean) =>
  reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: HERO_EASE, delay }
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

export type PremiumPageHeroCrumb = {
  readonly name: string
  readonly path: string
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
  readonly breadcrumbs?: readonly PremiumPageHeroCrumb[]
  readonly formScrollTarget?: string
  readonly formScrollLabel?: string
  readonly formScrollSublabel?: string
  readonly formScrollShellTone?: 'solid-dark' | 'solid-light'
  /** Dark green call bubble with the Irish desk number. On for every page hero. */
  readonly showCallBubble?: boolean
  readonly mobileImageObjectPosition?: string
  /** When true, skip the cream wave so baked-in hero footer art stays visible. */
  readonly preserveFooterArt?: boolean
  readonly className?: string
  readonly srTitle?: string
}

function splitMarkLabel(label: string): { readonly title: string; readonly detail: string } {
  const words = label.trim().split(/\s+/).filter(Boolean)
  if (words.length <= 1) return { title: label.trim(), detail: 'Costa del Sol' }
  if (words.length === 2) return { title: words[0] ?? label, detail: words[1] ?? '' }
  const cut = Math.min(3, Math.ceil(words.length / 2))
  return {
    title: words.slice(0, cut).join(' '),
    detail: words.slice(cut).join(' ')
  }
}

function CallBubble({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <m.a
      href={`tel:${companyContact.phoneTel}`}
      aria-label={`Call Golf Sol Ireland on ${HERO_CALL_DISPLAY}`}
      className="airport-poster-call inline-flex w-fit items-center gap-2.5 rounded-full bg-[#063b2a] py-1 pl-1 pr-4 text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)] ring-1 ring-[#e4c56a]/80"
      {...fadeUp(0.16, reduceMotion)}
    >
      <span className="airport-poster-on-gold flex h-9 w-9 items-center justify-center rounded-full bg-[#d4a843]">
        <Phone className="h-4 w-4" aria-hidden strokeWidth={2.4} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="airport-poster-gold-type airport-poster-call-kicker font-ge font-extrabold uppercase">Call Ireland</span>
        <span className="airport-poster-call-number font-ge font-extrabold text-white">{HERO_CALL_DISPLAY}</span>
      </span>
    </m.a>
  )
}

function ServiceMarks({
  badges,
  reduceMotion
}: {
  readonly badges: readonly PremiumPageHeroTrustBadge[]
  readonly reduceMotion: boolean
}) {
  const columns = badges.length >= 4 ? 'sm:grid-cols-4' : badges.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
  return (
    <ul className={cx('grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-x-4', columns)}>
      {badges.slice(0, 4).map((mark, index) => {
        const Icon = mark.icon
        const lines = splitMarkLabel(mark.label)
        return (
          <m.li
            key={mark.label}
            className="flex min-w-0 flex-col items-center text-center"
            {...fadeUp(0.28 + index * 0.08, reduceMotion)}
          >
            <span className="airport-poster-on-gold flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#f3e6c4] to-[#c9962e] shadow-[0_8px_16px_rgba(0,0,0,0.28)] ring-2 ring-[#f3e6c4]/70">
              <Icon className="h-5 w-5" aria-hidden strokeWidth={2.1} />
            </span>
            <span className="airport-poster-mark-title mt-1.5 font-ge font-extrabold uppercase text-[#f7f3ea]">{lines.title}</span>
            <span className="airport-poster-gold-type airport-poster-mark-detail mt-0.5 font-ge">{lines.detail}</span>
          </m.li>
        )
      })}
    </ul>
  )
}

function ActionPill({
  href,
  title,
  subtitle,
  icon: Icon,
  reduceMotion
}: {
  readonly href: string
  readonly title: string
  readonly subtitle: string
  readonly icon: LucideIcon
  readonly reduceMotion: boolean
}) {
  return (
    <a
      href={href}
      className="airport-poster-on-gold group relative isolate inline-flex min-h-12 w-full max-w-[28rem] items-center gap-3 overflow-hidden rounded-full bg-[#d4a843] px-3 py-1.5 shadow-[0_14px_30px_rgba(0,0,0,0.28)] ring-1 ring-[#f3e6c4]/80 sm:w-auto sm:pr-6"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f6e7b8_0%,#d4a843_55%,#b8862b_100%)]"
      />
      <span className="airport-poster-on-dark-chip relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#062016]">
        <Icon className="h-4 w-4" aria-hidden strokeWidth={2.3} />
      </span>
      {reduceMotion ? null : (
        <span aria-hidden className="gsol-pill-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3" />
      )}
      <span className="relative min-w-0 text-left">
        <span className="airport-poster-price-title block font-ge font-extrabold uppercase leading-none">{title}</span>
        <span className="airport-poster-price-sub mt-1 block font-ge font-bold uppercase leading-tight">{subtitle}</span>
      </span>
    </a>
  )
}

function HeroBreadcrumbs({ crumbs }: { readonly crumbs: readonly PremiumPageHeroCrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={`${crumb.path}-${crumb.name}`} className="flex items-center gap-1.5">
              {index > 0 ? <ChevronRight className="airport-poster-gold-type h-3 w-3 shrink-0" aria-hidden /> : null}
              {isLast ? (
                <span aria-current="page" className="airport-poster-gold-type airport-poster-crumb font-ge font-extrabold">
                  {crumb.name}
                </span>
              ) : (
                <a href={crumb.path} className="airport-poster-crumb font-ge font-bold underline decoration-[#d4a843]/70 underline-offset-4">
                  {crumb.name}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Inner-page hero in the same poster layout as the homepage, with this page’s photo and copy. */
export function PremiumPageHero({
  id = 'top',
  titleId = 'premium-hero-title',
  images,
  kicker,
  titleLine1,
  titleLine2,
  lead,
  primaryCta,
  secondaryCta,
  trustBadges,
  floatingBadges,
  breadcrumbs,
  formScrollTarget,
  formScrollLabel,
  formScrollSublabel,
  showCallBubble = true,
  mobileImageObjectPosition = 'center 42%',
  preserveFooterArt = false,
  className,
  srTitle
}: PremiumPageHeroProps) {
  const reduceMotion = Boolean(useReducedMotion())
  const desktopSrc = heroAsset(images.desktop)
  const tabletSrc = heroAsset(images.tablet)
  const mobileSrc = heroAsset(images.mobile)
  const desktopType = sourceType(images.desktop)
  const tabletType = sourceType(images.tablet)
  const PillIcon = primaryCta.icon ?? ArrowRight
  const marks = trustBadges?.slice(0, 4) ?? []
  const place = floatingBadges?.[0]
  const customSublabel = formScrollSublabel && formScrollSublabel !== 'Quick quote form below' ? formScrollSublabel : undefined
  const pointsAtForm = Boolean(formScrollTarget) && primaryCta.href === formScrollTarget
  const rawSubtitle = customSublabel ?? (pointsAtForm ? formScrollLabel : undefined) ?? 'We reply from Ireland'
  const pillSubtitle =
    rawSubtitle.trim().toLowerCase() === primaryCta.label.trim().toLowerCase()
      ? 'Tell us your dates and group size'
      : rawSubtitle

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cx('airport-poster-hero ge-on-dark relative isolate overflow-hidden bg-[#041510] text-[#f7f3ea]', className)}
    >
      <picture className="absolute inset-0 block h-full w-full">
        {desktopSrc !== mobileSrc ? (
          <source media="(min-width: 1024px)" srcSet={desktopSrc} {...(desktopType ? { type: desktopType } : {})} />
        ) : null}
        {tabletSrc !== mobileSrc ? (
          <source media="(min-width: 768px)" srcSet={tabletSrc} {...(tabletType ? { type: tabletType } : {})} />
        ) : null}
        <img
          src={mobileSrc}
          alt={images.alt}
          decoding="async"
          fetchPriority="high"
          className={cx('absolute inset-0 h-full w-full object-cover', !reduceMotion && 'gsol-hero-drift')}
          style={{ objectPosition: mobileImageObjectPosition }}
        />
      </picture>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#041510] via-[#041510]/88 via-[58%] to-[#041510]/25 md:bg-gradient-to-r md:from-[#041510] md:from-[8%] md:via-[#041510]/80 md:via-[42%] md:to-transparent md:to-[70%]"
      />

      <div aria-hidden className="ge-fixed-header-spacer relative z-20 w-full shrink-0" style={{ height: 'var(--ge-fixed-header-h)' }} />

      <div className="relative z-10 mx-auto flex w-full max-w-[1340px] flex-col justify-end px-4 pb-8 pt-3 sm:px-6 md:min-h-[calc(100svh-var(--ge-fixed-header-h))] md:justify-center md:px-10 md:pb-10 md:pt-4 lg:px-12">
        <div className="airport-poster-copy w-full max-w-[40rem]">
          {breadcrumbs && breadcrumbs.length > 0 ? <HeroBreadcrumbs crumbs={breadcrumbs} /> : null}
          <m.p className="airport-poster-kicker font-ge font-extrabold uppercase text-[#f3e6c4]" {...fadeUp(0.04, reduceMotion)}>
            {kicker}
          </m.p>
          <h1 id={titleId} aria-label={srTitle} className="airport-poster-title airport-poster-title-page mt-1 font-ge font-extrabold uppercase">
            <m.span className="block text-[#f7f3ea]" {...fadeUp(0.08, reduceMotion)}>
              {titleLine1}
            </m.span>
            {titleLine2 ? (
              <m.span className="airport-poster-gold-type block" {...fadeUp(0.12, reduceMotion)}>
                {titleLine2}
              </m.span>
            ) : null}
          </h1>
          <m.span
            aria-hidden
            className="mt-2 block h-[3px] w-28 origin-left rounded-full bg-gradient-to-r from-[#f3e6c4] via-[#d4a843] to-transparent"
            initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: HERO_EASE }}
          />
          <m.p className="airport-poster-place mt-2 inline-flex items-center gap-2 font-ge font-extrabold uppercase text-white" {...fadeUp(0.14, reduceMotion)}>
            {place ? `${place.kicker} · ${place.title}` : 'Costa del Sol'}
            <Sun className={cx('airport-poster-gold-type h-4 w-4 shrink-0', !reduceMotion && 'gsol-sun-rock')} aria-hidden />
          </m.p>
          <m.p className="airport-poster-lead mt-1.5 max-w-[34rem] font-ge text-[#f7f3ea]" {...fadeUp(0.16, reduceMotion)}>
            {lead}
          </m.p>
          {showCallBubble ? (
            <div className="mt-3">
              <CallBubble reduceMotion={reduceMotion} />
            </div>
          ) : null}
          <m.div className="mt-4 w-full max-w-[40rem]" {...fadeUp(0.22, reduceMotion)}>
            {marks.length > 0 ? <ServiceMarks badges={marks} reduceMotion={reduceMotion} /> : null}
            <div className={cx('flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center', marks.length > 0 && 'mt-4')}>
              <ActionPill href={primaryCta.href} title={primaryCta.label} subtitle={pillSubtitle} icon={PillIcon} reduceMotion={reduceMotion} />
              {secondaryCta ? (
                <a
                  href={secondaryCta.href}
                  className="airport-poster-more font-ge font-extrabold uppercase text-[#f3e6c4] underline decoration-[#d4a843] underline-offset-4"
                >
                  {secondaryCta.label}
                </a>
              ) : null}
            </div>
          </m.div>
        </div>
      </div>

      {preserveFooterArt ? null : (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-7 text-[#faf8f3]">
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="h-full w-full">
            <path fill="currentColor" d="M0 26c220 22 380 22 560 6s340-28 520-12 240 22 360 10v18H0Z" />
          </svg>
        </div>
      )}
    </section>
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
