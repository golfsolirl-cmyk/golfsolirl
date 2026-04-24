import { motion, type Transition } from 'framer-motion'
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
    <motion.section
      className={cx(
        'relative overflow-hidden text-left',
        featured
          ? 'rounded-[1.35rem] border-[5px] border-gs-gold/55 bg-gradient-to-br from-gs-dark via-gs-dark to-[#042a1f] px-5 py-5 shadow-[0_20px_50px_rgba(6,59,42,0.22)] sm:rounded-[1.5rem] sm:px-6 sm:py-5'
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
          'pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-r from-[#8a6914] via-gs-gold-light to-[#8a6914]',
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
            'inline-flex shrink-0 items-center justify-center rounded-2xl border-2 border-gs-gold/50 bg-gs-green/30 text-gs-gold shadow-inner',
            featured
              ? 'mx-auto h-14 w-14 sm:mx-0 sm:h-16 sm:w-16'
              : 'mt-0.5 h-11 w-11 sm:mt-0 sm:h-12 sm:w-12'
          )}
        >
          <ShieldCheck
            className={featured ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-5 w-5 sm:h-6 sm:w-6'}
            strokeWidth={2.25}
            aria-hidden
          />
        </span>
        <div className={cx('min-w-0 flex-1', featured ? 'text-center sm:text-left' : 'text-left')}>
          <p
            className={cx(
              'font-ge font-extrabold uppercase tracking-[0.2em] text-gs-gold-light/95',
              featured ? 'text-[0.68rem] sm:text-[0.72rem]' : 'text-[0.62rem] sm:text-[0.68rem]'
            )}
          >
            {copy.kicker}
          </p>
          <p
            className={cx(
              'mt-1 font-ge font-extrabold leading-tight tracking-[0.03em] text-white',
              featured ? 'text-[1.05rem] sm:mt-1.5 sm:text-[1.15rem]' : 'text-[0.95rem] sm:text-[1.05rem]'
            )}
          >
            {copy.headline}
          </p>
          <p
            className={cx(
              'mt-1.5 font-ge font-semibold leading-snug text-white',
              featured ? 'mt-2 text-[0.88rem] sm:text-[0.92rem]' : 'text-[0.8rem] sm:mt-2 sm:text-[0.86rem]'
            )}
          >
            {copy.detail}
          </p>
        </div>
      </div>
    </motion.section>
  )
}
