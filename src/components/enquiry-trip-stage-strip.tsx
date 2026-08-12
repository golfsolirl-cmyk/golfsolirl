import { Check } from 'lucide-react'
import {
  buildEnquiryTripStages,
  enquiryTripStageBadgeLabel,
  type EnquiryTripStageInput
} from '../lib/enquiry-trip-stages'
import { cx } from '../lib/utils'

type EnquiryTripStageStripProps = {
  readonly input: EnquiryTripStageInput
  readonly variant?: 'admin' | 'client'
  readonly className?: string
}

export function EnquiryTripStageStrip({ input, variant = 'client', className }: EnquiryTripStageStripProps) {
  const stages = buildEnquiryTripStages(input)
  const badge = enquiryTripStageBadgeLabel(input)

  return (
    <div className={cx('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <p
          className={cx(
            'text-[11px] font-semibold uppercase tracking-[0.14em]',
            variant === 'admin' ? 'text-brand-700' : 'text-gs-green'
          )}
        >
          {variant === 'client' ? 'Where your trip is' : 'Trip stage'}
        </p>
        <span
          className={cx(
            'rounded-full px-2.5 py-1 text-xs font-semibold',
            variant === 'admin'
              ? 'bg-fairway-100 text-forest-900 ring-1 ring-fairway-200'
              : 'bg-gs-green/10 text-gs-dark ring-1 ring-gs-green/25'
          )}
        >
          {badge}
        </span>
      </div>
      <ol className="flex flex-wrap gap-2" aria-label="Trip progress">
        {stages.map((stage) => (
          <li
            key={stage.id}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              stage.current
                ? 'bg-forest-900 text-white'
                : stage.complete
                  ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200'
                  : 'bg-forest-50 text-forest-500 ring-1 ring-forest-100'
            )}
          >
            {stage.complete ? <Check aria-hidden className="h-3 w-3" /> : null}
            <span>{stage.shortLabel}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
