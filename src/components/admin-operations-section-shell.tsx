import type { ReactNode } from 'react'
import { cx } from '../lib/utils'

/**
 * Shared card chrome for admin operations blocks — matches Trip desk hero (rounded 2rem, gold border, soft shadow).
 */
export function AdminOperationsSectionShell(props: {
  readonly id?: string
  readonly kicker?: string
  readonly title?: string
  readonly description?: ReactNode
  readonly headerAside?: ReactNode
  readonly children: ReactNode
  readonly className?: string
  readonly bodyClassName?: string
  /** Omit kicker/title bar — use for composite sections that define their own inner headings. */
  readonly hideHeader?: boolean
}) {
  const showHeaderRow = !props.hideHeader && (props.headerAside != null || props.kicker != null || props.title != null || props.description != null)

  return (
    <section
      className={cx(
        'scroll-mt-28 overflow-hidden rounded-[2rem] border-2 border-brand-700/40 bg-gradient-to-br from-white via-white to-[#f0faf4] shadow-[0_22px_56px_rgba(11,73,52,0.08)] ring-1 ring-forest-900/[0.06]',
        props.className
      )}
      id={props.id}
    >
      {showHeaderRow ? (
        <div className="border-b border-forest-900/[0.05] bg-white/40 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              {props.kicker ? (
                <p className="font-ge text-xs font-extrabold uppercase tracking-[0.18em] text-brand-600 sm:text-sm">{props.kicker}</p>
              ) : null}
              {props.title ? (
                <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-forest-950 sm:text-3xl">{props.title}</h2>
              ) : null}
              {props.description ? (
                <div className="mt-2 max-w-3xl text-base leading-relaxed text-forest-700 md:text-lg">{props.description}</div>
              ) : null}
            </div>
            {props.headerAside ? <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">{props.headerAside}</div> : null}
          </div>
        </div>
      ) : null}
      <div className={cx('px-6 py-5 sm:px-8 sm:py-6', props.bodyClassName)}>{props.children}</div>
    </section>
  )
}
