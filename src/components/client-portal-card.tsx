import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '../lib/utils'

export type ClientPortalCardId =
  | 'trip'
  | 'documents'
  | 'payments'
  | 'messages'
  | 'planner'
  | 'contact'

type ClientPortalCardProps = {
  readonly id: ClientPortalCardId
  readonly title: string
  readonly description: string
  readonly icon: LucideIcon
  readonly badge?: string | null
  readonly expanded: boolean
  readonly onToggle: () => void
  readonly summary?: ReactNode
  readonly children: ReactNode
}

export function ClientPortalCard({
  id,
  title,
  description,
  icon: Icon,
  badge,
  expanded,
  onToggle,
  summary,
  children
}: ClientPortalCardProps) {
  return (
    <motion.div
      className={cx(
        'overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow',
        expanded ? 'border-fairway-400/60 ring-2 ring-fairway-200/50' : 'border-forest-100/90 hover:border-fairway-200/80 hover:shadow-md'
      )}
      layout
    >
      <button
        aria-controls={`portal-card-panel-${id}`}
        aria-expanded={expanded}
        className="flex w-full items-start gap-4 p-5 text-left md:p-6"
        onClick={onToggle}
        type="button"
      >
        <span
          className={cx(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            expanded ? 'bg-fairway-800 text-white' : 'bg-fairway-50 text-fairway-800'
          )}
        >
          <Icon aria-hidden className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-semibold text-forest-950">{title}</span>
            {badge ? (
              <span className="inline-flex rounded-full bg-fairway-100 px-2.5 py-0.5 text-xs font-semibold text-fairway-900 ring-1 ring-fairway-200/80">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-forest-600">{description}</span>
          {!expanded && summary ? <span className="mt-3 block text-sm text-forest-800">{summary}</span> : null}
        </span>
        <ChevronDown
          aria-hidden
          className={cx('mt-1 h-5 w-5 shrink-0 text-forest-500 transition-transform', expanded && 'rotate-180')}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-forest-100/80 bg-offwhite/40"
            exit={{ height: 0, opacity: 0 }}
            id={`portal-card-panel-${id}`}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div className="overflow-hidden">
              <div className="p-5 md:p-6">{children}</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
