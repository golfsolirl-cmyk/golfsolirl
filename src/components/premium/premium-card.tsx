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
          'ge-on-dark relative overflow-hidden rounded-[2rem]',
          'border border-[#d9be7a]/45 ring-1 ring-white/10',
          'bg-[linear-gradient(135deg,#0d3a2a_0%,#0a2d20_45%,#08231a_100%)]',
          'shadow-[0_36px_90px_rgba(6,32,22,0.42),0_0_36px_rgba(217,190,122,0.18)]',
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
              className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,190,122,0.22),transparent_70%)] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-28 bottom-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(11,107,69,0.32),transparent_72%)] blur-3xl"
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
        'relative overflow-hidden rounded-[1.85rem]',
        'border border-gs-green/15 bg-white ring-1 ring-chrome-300/70',
        'shadow-[0_22px_55px_rgba(6,59,42,0.10)]',
        'p-7 sm:p-9 lg:p-10',
        className
      )}
      data-premium-card
    >
      {!hideTopRule ? <GeGoldDividerLineAbsoluteTop /> : null}
      {!hideHalo ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 top-12 h-32 w-32 rounded-full bg-brand-700/[0.06] blur-3xl"
        />
      ) : null}
      <div className="relative">{children}</div>
    </div>
  )
}
