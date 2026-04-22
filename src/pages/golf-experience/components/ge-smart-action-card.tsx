import { ArrowRight } from 'lucide-react'
import { cx } from '../../../lib/utils'
import type { ContentSmartAction } from '../content-page-context'

export type GeSmartActionCardAppearance = 'brand' | 'clean'

interface GeSmartActionCardProps {
  readonly action: ContentSmartAction
  /** `clean` — white card, neutral type (rental editorial). Default keeps gold/dark brand tiles. */
  readonly appearance?: GeSmartActionCardAppearance
}

export function GeSmartActionCard({ action, appearance = 'brand' }: GeSmartActionCardProps) {
  if (appearance === 'clean') {
    return (
      <a
        href={action.href}
        rel={action.external ? 'noreferrer' : undefined}
        target={action.external ? '_blank' : undefined}
        className={cx(
          'group block min-h-0 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md sm:rounded-2xl sm:px-5 sm:py-4'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 font-ge text-[0.7rem] font-extrabold uppercase leading-snug tracking-[0.1em] text-neutral-900 sm:text-[0.76rem] sm:tracking-[0.12em]">
            {action.label}
          </p>
          <ArrowRight
            className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-neutral-700"
            aria-hidden
          />
        </div>
        <p className="mt-2 font-ge text-[0.88rem] leading-5 text-neutral-600 sm:text-[0.9rem] sm:leading-6">{action.description}</p>
      </a>
    )
  }

  const tones = {
    gold: 'border-gs-gold/80 bg-gs-dark text-white shadow-[0_10px_28px_rgba(6,59,42,0.5)] hover:bg-[#05291f] hover:border-gs-gold',
    dark: 'border-gs-gold/40 bg-gs-dark/90 text-white shadow-[0_8px_24px_rgba(6,59,42,0.4)] hover:bg-gs-dark hover:border-gs-gold',
    light:
      'border-2 border-gs-gold bg-gs-green text-white shadow-[0_8px_24px_rgba(6,59,42,0.4)] hover:bg-[#0a5c3c] hover:border-gs-gold-light hover:shadow-[0_12px_28px_rgba(11,107,69,0.45)]'
  } as const

  const bodyTone = 'text-white/85'

  return (
    <a
      href={action.href}
      rel={action.external ? 'noreferrer' : undefined}
      target={action.external ? '_blank' : undefined}
      className={cx(
        'group block min-h-0 w-full min-w-0 rounded-xl border px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 sm:rounded-2xl sm:px-4 sm:py-3.5',
        tones[action.tone]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 break-words font-ge text-[0.7rem] font-extrabold uppercase leading-snug tracking-[0.09em] sm:text-[0.8rem] sm:tracking-[0.12em]">
          {action.label}
        </p>
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
      </div>
      <p className={cx('mt-1.5 break-words font-ge text-[0.82rem] leading-5 sm:text-[0.86rem] sm:leading-5', bodyTone)}>{action.description}</p>
    </a>
  )
}
