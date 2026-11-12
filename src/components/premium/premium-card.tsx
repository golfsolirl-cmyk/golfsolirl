import type { ReactNode } from 'react'
import { GeGoldDividerLineAbsoluteTop } from '../ge-gold-divider-line'
import { cx } from '../../lib/utils'

/**
 * Premium Card — the chrome-ringed white surface used across the homepage
 * (right card on About, body card on accommodation-intro, etc).
 *
 * Use for any white-surface content card that should match the homepage's
 * card language: top chrome hairline, soft halo bottom-right, gold/chrome
 * ring, generous shadow, rounded corners.
 *
 * Pass `tone="forest"` for the dark closer panel pattern.
 */

interface PremiumCardProps {
  readonly children: ReactNode
  readonly className?: string
  readonly tone?: 'light' | 'forest'
  /** Hide the chrome top hairline (used when nesting inside another card). */
  readonly hideTopRule?: boolean
  /** Hide the bottom-right halo (used when card sits on a busy background). */
  readonly hideHalo?: boolean
}

export function PremiumCard({
  children,
  className,
  tone = 'light',
  hideTopRule = false,
  hideHalo = false
}: PremiumCardProps) {
  if (tone === 'forest') {
    return (
      <div
        className={cx(
          'ge-on-dark relative overflow-hidden rounded-2xl',
          'border border-white/[0.06]',
          'bg-[linear-gradient(145deg,#04291a_0%,#0a5e42_50%,#04291a_100%)]',
          'shadow-[0_16px_48px_rgba(4,41,26,0.24)]',
          'p-7 sm:p-9 lg:p-10',
          className
        )}
        data-premium-card
      >
        {!hideTopRule ? <GeGoldDividerLineAbsoluteTop /> : null}
        {!hideHalo ? (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,184,127,0.12),transparent_70%)] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-28 bottom-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,122,86,0.2),transparent_72%)] blur-3xl"
            />
          </>
        ) : null}
        <div className="relative">{children}</div>
      </div>
    )
  }

  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-2xl',
        'border border-black/[0.04] bg-white',
        'shadow-[0_4px_16px_rgba(0,0,0,0.04),0_16px_48px_rgba(0,0,0,0.06)]',
        'p-7 sm:p-9 lg:p-10',
        className
      )}
      data-premium-card
    >
      {!hideTopRule ? <GeGoldDividerLineAbsoluteTop /> : null}
      {!hideHalo ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 top-12 h-32 w-32 rounded-full bg-emerald-500/[0.04] blur-3xl"
        />
      ) : null}
      <div className="relative">{children}</div>
    </div>
  )
}
