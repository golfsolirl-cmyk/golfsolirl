import { ArrowRight } from 'lucide-react'
import { cx } from '../../../lib/utils'
import type { ContentSmartAction } from '../content-page-context'
import { contactInfo } from '../data/copy'

export type GeSmartActionCardAppearance = 'brand' | 'clean'

interface GeSmartActionCardProps {
  readonly action: ContentSmartAction
  /** `clean` — white card, neutral type (rental editorial). Default keeps gold/dark brand tiles. */
  readonly appearance?: GeSmartActionCardAppearance
}

function isDualCallAction(action: ContentSmartAction) {
  return action.kind === 'call' && Boolean(action.secondaryTelHref && action.secondaryTelLabel)
}

export function GeSmartActionCard({ action, appearance = 'brand' }: GeSmartActionCardProps) {
  if (isDualCallAction(action) && action.secondaryTelHref && action.secondaryTelLabel) {
    if (appearance === 'clean') {
      return (
        <div
          className={cx(
            'min-h-0 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-4 py-4 shadow-sm transition-all duration-200 sm:rounded-2xl sm:px-5 sm:py-4'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 flex-1 font-ge text-[0.7rem] font-extrabold uppercase leading-snug tracking-[0.1em] text-neutral-900 sm:text-[0.76rem] sm:tracking-[0.12em]">
              {action.label}
            </p>
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
          </div>
          <p className="mt-2 font-ge text-[0.88rem] leading-5 text-neutral-600 sm:text-[0.9rem] sm:leading-6">{action.description}</p>
          <div className="mt-3 space-y-2 border-t border-neutral-200 pt-3">
            <a
              href={action.href}
              className="block font-ge text-[0.88rem] font-bold text-neutral-900 underline decoration-neutral-400 underline-offset-2 transition-colors hover:text-neutral-700"
            >
              {contactInfo.phoneIrishLineLabel}: {contactInfo.phoneDisplay}
            </a>
            <a
              href={action.secondaryTelHref}
              className="block font-ge text-[0.88rem] font-bold text-neutral-900 underline decoration-neutral-400 underline-offset-2 transition-colors hover:text-neutral-700"
            >
              {contactInfo.phoneSpanishLineLabel}: {action.secondaryTelLabel}
            </a>
          </div>
        </div>
      )
    }

    const tones = {
      gold: 'border-brand-700/80 bg-gs-dark text-white shadow-[0_10px_28px_rgba(6,59,42,0.5)]',
      dark: 'border-brand-700/40 bg-gs-dark/90 text-white shadow-[0_8px_24px_rgba(6,59,42,0.4)]',
      light:
        'border-2 border-brand-700 bg-gs-green text-white shadow-[0_8px_28px_rgba(6,59,42,0.4)]'
    } as const

    const bodyTone = 'text-white/85'
    const linkTone = 'font-ge text-[0.82rem] font-bold text-white underline decoration-white/40 underline-offset-2 hover:decoration-brand-600'

    return (
      <div
        className={cx(
          'min-h-0 w-full min-w-0 rounded-xl border px-3.5 py-3 sm:rounded-2xl sm:px-4 sm:py-3.5',
          tones[action.tone]
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 break-words font-ge text-[0.7rem] font-extrabold uppercase leading-snug tracking-[0.09em] sm:text-[0.8rem] sm:tracking-[0.12em]">
            {action.label}
          </p>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-white/70" aria-hidden />
        </div>
        <p className={cx('mt-1.5 break-words font-ge text-[0.82rem] leading-5 sm:text-[0.86rem] sm:leading-5', bodyTone)}>{action.description}</p>
        <div className="mt-3 space-y-2 border-t border-white/15 pt-2.5">
          <a href={action.href} className={cx('block', linkTone)}>
            {contactInfo.phoneIrishLineLabel}: {contactInfo.phoneDisplay}
          </a>
          <a href={action.secondaryTelHref} className={cx('block', linkTone)}>
            {contactInfo.phoneSpanishLineLabel}: {action.secondaryTelLabel}
          </a>
        </div>
      </div>
    )
  }

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
    gold: 'border-brand-700/80 bg-gs-dark text-white shadow-[0_10px_28px_rgba(6,59,42,0.5)] hover:bg-[#05291f] hover:border-brand-700',
    dark: 'border-brand-700/40 bg-gs-dark/90 text-white shadow-[0_8px_24px_rgba(6,59,42,0.4)] hover:bg-gs-dark hover:border-brand-700',
    light:
      'border-2 border-brand-700 bg-gs-green text-white shadow-[0_8px_24px_rgba(6,59,42,0.4)] hover:bg-[#0a5c3c] hover:border-brand-700-light hover:shadow-[0_12px_28px_rgba(11,107,69,0.45)]'
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
