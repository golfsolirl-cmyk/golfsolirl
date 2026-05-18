import { m,  type Transition  } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { cx } from '../../../lib/utils'
import { transportFleetInsuranceBannerCopy } from '../data/transport-service'

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' }
} as const

export interface GeTransfersInsuranceBannerProps {
  /** `featured` — thick gold frame (e.g. under fleet photo). `inline` — compact band between sections. */
  readonly variant?: 'featured' | 'inline'
  readonly className?: string
  readonly motionTransition?: Transition
}

/**
 * Reusable “fully insured transfers” reassurance — copy lives in {@link transportFleetInsuranceBannerCopy}.
 */
export function GeTransfersInsuranceBanner({
  variant = 'inline',
  className,
  motionTransition
}: GeTransfersInsuranceBannerProps) {
  const copy = transportFleetInsuranceBannerCopy
  const featured = variant === 'featured'

  return (
    <m.section
      className={cx(
        'ge-on-dark relative overflow-hidden text-left',
        featured
          ? 'rounded-[1.35rem] border-[5px] border-brand-700/55 bg-gradient-to-br from-gs-dark via-gs-dark to-[#042a1f] px-5 py-5 shadow-[0_20px_50px_rgba(6,59,42,0.22)] sm:rounded-[1.5rem] sm:px-6 sm:py-5'
          : 'rounded-2xl border-2 border-gs-green bg-gradient-to-br from-gs-dark via-gs-dark to-[#042c20] px-4 py-3.5 shadow-[0_16px_40px_rgba(6,59,42,0.18)] sm:px-6 sm:py-4',
        className
      )}
      {...fadeUp}
      transition={motionTransition ?? fadeUp.transition}
      aria-label={copy.headline}
    >
      <div
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-r from-[#8a6914] via-brand-600 to-[#8a6914]',
          featured ? 'h-2.5 sm:h-3' : 'h-1.5 sm:h-2'
        )}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-gs-green/25 blur-3xl"
      />

      <div
        className={cx(
          'relative flex gap-3 sm:items-center',
          featured ? 'flex-col pt-1 sm:flex-row sm:gap-5 sm:pt-2' : 'flex-row items-start sm:items-center sm:gap-4'
        )}
      >
        <span
          className={cx(
            'inline-flex shrink-0 items-center justify-center rounded-2xl border-2 border-[#f4dfa6]/70 bg-gradient-to-br from-[#1a7a59] via-[#136047] to-[#0c3527] text-white shadow-[0_12px_28px_rgba(0,0,0,0.45),0_0_24px_rgba(217,190,122,0.32)] ring-2 ring-white/20',
            featured
              ? 'mx-auto h-14 w-14 sm:mx-0 sm:h-16 sm:w-16'
              : 'mt-0.5 h-11 w-11 sm:mt-0 sm:h-12 sm:w-12'
          )}
        >
          <ShieldCheck
            className={cx(
              'drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]',
              featured ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-5 w-5 sm:h-6 sm:w-6'
            )}
            strokeWidth={2.4}
            aria-hidden
          />
        </span>
        <div className={cx('min-w-0 flex-1', featured ? 'text-center sm:text-left' : 'text-left')}>
          <p
            className={cx(
              'ge-on-dark-kicker font-ge font-extrabold uppercase tracking-[0.22em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]',
              featured ? 'text-[0.74rem] sm:text-[0.8rem]' : 'text-[0.68rem] sm:text-[0.74rem]'
            )}
          >
            {copy.kicker}
          </p>
          <p
            className={cx(
              'mt-1 font-ge font-extrabold leading-tight tracking-[0.03em] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]',
              featured ? 'text-[1.12rem] sm:mt-1.5 sm:text-[1.24rem]' : 'text-[1.02rem] sm:text-[1.12rem]'
            )}
          >
            {copy.headline}
          </p>
          <p
            className={cx(
              'mt-1.5 font-ge font-semibold leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
              featured ? 'mt-2 text-[0.96rem] sm:text-[1rem]' : 'text-[0.88rem] sm:mt-2 sm:text-[0.94rem]'
            )}
          >
            {copy.detail}
          </p>
        </div>
      </div>
    </m.section>
  )
}
