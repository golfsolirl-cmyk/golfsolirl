import { m } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import { brandLogoAssetUrl, GOLFSOL_BRAND_LOGO_SOURCE } from '../../lib/brand-logo-assets'
import { cx } from '../../lib/utils'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.52, ease: 'easeOut' }
} as const

export function StarRow({ count = 5 }: { readonly count?: number }) {
  const n = Math.min(5, Math.max(0, Math.round(count)))
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cx(
            'h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]',
            i < n
              ? 'fill-[#d4a843] text-[#b8922e] drop-shadow-[0_1px_6px_rgba(212,168,67,0.45)]'
              : 'fill-transparent text-ge-gray200'
          )}
          strokeWidth={0}
        />
      ))}
    </div>
  )
}

export type TripadvisorReviewCardProps = {
  readonly quote: string
  readonly name: string
  readonly context: string
  readonly tripType?: string
  readonly rating?: number
  readonly badge?: string
  readonly variant?: 'live' | 'sample' | 'transfer'
  readonly delayIndex?: number
}

type CardTone = 'guestStory' | 'transfer' | 'sample' | 'live'

function resolveTone(variant: TripadvisorReviewCardProps['variant'], badge?: string): CardTone {
  if (badge === 'Guest story') return 'guestStory'
  if (variant === 'transfer') return 'transfer'
  if (variant === 'sample') return 'sample'
  return 'live'
}

const toneStyles: Record<
  CardTone,
  {
    shell: string
    accent: string
    badge: string
    quoteMark: string
    footer: string
    tripPill: string
  }
> = {
  guestStory: {
    shell:
      'border-[#d9c98a]/55 bg-[#fdfbf6] shadow-[0_22px_50px_rgba(6,59,42,0.09),inset_0_1px_0_rgba(255,255,255,0.92)] hover:border-[#d4a843]/65 hover:shadow-[0_28px_60px_rgba(6,59,42,0.12),0_0_0_1px_rgba(212,168,67,0.12)]',
    accent: 'from-[#d4a843] via-[#ebe3cf] to-[#0B6B45]/80',
    badge:
      'border border-[#d4a843]/50 bg-gs-dark text-[#fbe8b5] shadow-[0_8px_20px_rgba(6,59,42,0.22)]',
    quoteMark: 'text-[#d4a843]/18',
    footer: 'border-[#e8dcc4]/90 bg-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]',
    tripPill: 'border-[#d4a843]/45 bg-[#f5edd6] text-gs-dark'
  },
  transfer: {
    shell:
      'border-brand-700/35 bg-white shadow-[0_20px_48px_rgba(6,59,42,0.08),inset_0_1px_0_rgba(255,255,255,1)] hover:border-brand-700/55 hover:shadow-[0_26px_58px_rgba(6,59,42,0.11),0_0_0_1px_rgba(11,107,69,0.08)]',
    accent: 'from-brand-700 via-[#ebe3cf]/90 to-gs-electric/70',
    badge:
      'border border-brand-700/30 bg-gradient-to-br from-gs-dark to-[#0a5238] text-emerald-100 shadow-[0_8px_20px_rgba(6,59,42,0.2)]',
    quoteMark: 'text-brand-700/14',
    footer: 'border-brand-700/12 bg-[#f8fbf9]/90',
    tripPill: 'border-brand-700/25 bg-brand-700/8 text-gs-dark'
  },
  live: {
    shell:
      'border-brand-700/30 bg-white shadow-[0_20px_48px_rgba(6,59,42,0.08)] hover:border-brand-700/50 hover:shadow-[0_26px_56px_rgba(6,59,42,0.11)]',
    accent: 'from-brand-700 via-[#ebe3cf] to-brand-700/60',
    badge: 'bg-gs-dark text-white shadow-[0_6px_16px_rgba(6,59,42,0.18)]',
    quoteMark: 'text-brand-700/12',
    footer: 'border-ge-gray100/90 bg-white',
    tripPill: 'border-brand-700/25 bg-brand-700/10 text-gs-dark'
  },
  sample: {
    shell:
      'border-ge-gray100 bg-gradient-to-br from-white via-white to-[#f4f7f5] shadow-[0_18px_44px_rgba(6,59,42,0.07)] hover:border-brand-700/35 hover:shadow-[0_24px_52px_rgba(6,59,42,0.1)]',
    accent: 'from-ge-gray200 via-[#ebe3cf]/80 to-brand-700/40',
    badge: 'bg-gs-dark/90 text-white',
    quoteMark: 'text-ge-gray200/80',
    footer: 'border-ge-gray100/90 bg-offwhite',
    tripPill: 'border-ge-gray200 bg-ge-gray50 text-ge-gray600'
  }
}

export function TripadvisorReviewCard({
  quote,
  name,
  context,
  tripType,
  rating = 5,
  badge,
  variant = 'live',
  delayIndex = 0
}: TripadvisorReviewCardProps) {
  const tone = resolveTone(variant, badge)
  const styles = toneStyles[tone]
  const showTripadvisorLockup = !badge && variant === 'sample'

  return (
    <m.article
      className={cx(
        'group relative flex h-full min-h-[300px] w-[min(100%,320px)] shrink-0 snap-center flex-col overflow-hidden',
        'rounded-[1.75rem] border p-6 transition-[transform,box-shadow,border-color] duration-300 sm:min-h-[320px] sm:w-[340px] sm:p-7',
        'hover:-translate-y-1',
        styles.shell
      )}
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: 0.05 * (delayIndex + 1) }}
      whileHover={variant !== 'sample' ? { y: -4 } : undefined}
    >
      {/* Chrome accent spine */}
      <div
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute inset-y-5 left-0 w-[3px] rounded-r-full bg-gradient-to-b opacity-90',
          styles.accent
        )}
      />

      {/* Warm top wash — guest story only */}
      {tone === 'guestStory' ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[#d4a843]/14 blur-2xl"
        />
      ) : null}

      {/* Watermark quote */}
      <Quote
        aria-hidden
        className={cx(
          'pointer-events-none absolute -right-1 top-14 h-24 w-24 rotate-12 select-none',
          styles.quoteMark
        )}
        strokeWidth={1}
      />

      {/* Top hairline on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 flex justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <div className="mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent" />
      </div>

      <div className="relative z-[1] flex items-start justify-between gap-3 pl-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-brand-700/15 bg-white shadow-[0_6px_16px_rgba(6,59,42,0.06)]">
          <Quote className="h-5 w-5 text-brand-700" aria-hidden strokeWidth={1.75} />
        </div>
        {badge ? (
          <span
            className={cx(
              'rounded-full px-2.5 py-1 font-ge text-[0.6rem] font-extrabold uppercase tracking-[0.14em]',
              styles.badge
            )}
          >
            {badge}
          </span>
        ) : showTripadvisorLockup ? (
          <img
            src="/images/tripadvisor-lockup.svg"
            alt=""
            width={120}
            height={24}
            className="h-5 w-auto opacity-60 transition-opacity group-hover:opacity-90"
            loading="lazy"
            decoding="async"
            aria-hidden
          />
        ) : null}
      </div>

      <div className="relative z-[1] mt-5 pl-1">
        <StarRow count={rating} />
        <p className="mt-4 font-ge text-[1.02rem] font-medium leading-7 text-gs-dark sm:text-[1.05rem] sm:leading-[1.65rem]">
          <span className="text-brand-700/70">&ldquo;</span>
          {quote}
          <span className="text-brand-700/70">&rdquo;</span>
        </p>
      </div>

      <div
        className={cx(
          'relative z-[1] mt-auto rounded-2xl border px-4 py-4 pl-5',
          styles.footer
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#d4a843]/35 to-transparent"
        />
        <p className="font-ge text-sm font-extrabold tracking-[-0.01em] text-gs-dark">{name}</p>
        <p className="mt-1 font-ge text-xs font-semibold uppercase tracking-[0.12em] text-ge-gray600">{context}</p>
        {tripType ? (
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d4a843]/25 bg-white shadow-[0_4px_12px_rgba(6,59,42,0.08)]">
              <img
                src={brandLogoAssetUrl(GOLFSOL_BRAND_LOGO_SOURCE)}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                loading="lazy"
                decoding="async"
                aria-hidden
              />
            </div>
            <p
              className={cx(
                'inline-flex rounded-full border px-2.5 py-1 font-ge text-[0.62rem] font-bold uppercase tracking-[0.14em]',
                styles.tripPill
              )}
            >
              {tripType}
            </p>
          </div>
        ) : null}
      </div>
    </m.article>
  )
}
