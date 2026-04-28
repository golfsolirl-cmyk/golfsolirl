import type { ReactNode } from 'react'
import { cx } from '../lib/utils'

interface PageIdentityBarProps {
  readonly label: string
  readonly eyebrow?: string
  readonly description?: string
  readonly offsetHeader?: boolean
  readonly compact?: boolean
  readonly rightSlot?: ReactNode
  readonly className?: string
}

const headerOffsetClassName = 'pt-[74px] sm:pt-[80px] md:pt-[88px] lg:pt-[76px] xl:pt-[82px]'

export function PageIdentityBar({
  label,
  eyebrow = 'Current page',
  description,
  offsetHeader = false,
  compact = false,
  rightSlot,
  className
}: PageIdentityBarProps) {
  return (
    <section
      aria-label={`${label} page banner`}
      className={cx(
        /** z-20: stay below cinematic heroes (z-[38]) and fixed nav (z-40) so eyebrow pills are never covered. */
        'relative z-20 overflow-hidden border-b border-[#9a6f08]/30 bg-[linear-gradient(135deg,#c48916_0%,#f7d978_44%,#dea41d_100%)] text-forest-950 shadow-[0_16px_38px_rgba(203,148,26,0.18)]',
        offsetHeader && headerOffsetClassName,
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.38),transparent_34%),linear-gradient(90deg,transparent,rgba(255,255,255,0.24),transparent)] opacity-80"
      />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div
          className={cx(
            'relative flex flex-col gap-4 py-3.5 sm:py-4 md:flex-row md:items-center md:justify-between',
            compact && 'gap-3 py-3'
          )}
        >
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-950/12 bg-white/28 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-forest-950/72 backdrop-blur-sm">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-forest-950/65" />
              {eyebrow}
            </span>
            <p
              className={cx(
                'mt-2.5 truncate font-display text-[1.32rem] font-black leading-none tracking-[-0.025em] text-forest-950 sm:text-[1.52rem] md:text-[1.75rem]',
                compact && 'text-[1.18rem] sm:text-[1.3rem] md:text-[1.45rem]'
              )}
            >
              {label}
            </p>
            {description ? (
              <p
                className={cx(
                  'mt-1.5 max-w-3xl text-[0.98rem] font-medium leading-6 text-forest-950/74 sm:text-[1.03rem]',
                  compact && 'text-[0.9rem] sm:text-[0.96rem]'
                )}
              >
                {description}
              </p>
            ) : null}
          </div>

          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </div>
      </div>
    </section>
  )
}
