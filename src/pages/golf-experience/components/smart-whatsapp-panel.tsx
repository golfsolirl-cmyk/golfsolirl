import { MessageCircle, Sparkles } from 'lucide-react'
import { cx } from '../../../lib/utils'
import { buildWhatsAppNumberHref } from '../../../lib/whatsapp'
import type { SmartActionButtonConfig } from '../../../lib/smart-enquiry'
import { GeButton } from './ge-button'
import { contactInfo } from '../data/copy'

interface SmartWhatsAppPanelProps {
  readonly eyebrow?: string
  readonly title: string
  readonly intro?: string
  readonly primaryLabel: string
  readonly primaryHelper: string
  readonly primaryMessage: string
  readonly quickActions: readonly SmartActionButtonConfig[]
  readonly tone?: 'light' | 'dark'
  readonly className?: string
}

export function SmartWhatsAppPanel({
  eyebrow = 'Smart WhatsApp',
  title,
  intro,
  primaryLabel,
  primaryHelper,
  primaryMessage,
  quickActions,
  tone = 'light',
  className
}: SmartWhatsAppPanelProps) {
  const primaryHref = buildWhatsAppNumberHref(contactInfo.phoneTel, primaryMessage)
  const isDark = tone === 'dark'

  return (
    <div
      className={cx(
        'overflow-hidden rounded-[1.65rem] border p-5 shadow-[0_18px_44px_rgba(6,59,42,0.12)] backdrop-blur-sm sm:p-6',
        isDark
          ? 'border-white/10 bg-white/[0.06] text-white'
          : 'border-gs-dark/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(244,248,245,0.98),rgba(255,246,227,0.9))] text-gs-dark',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cx(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
            isDark ? 'bg-gs-gold text-gs-dark' : 'bg-gs-dark text-gs-gold'
          )}
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p
            className={cx(
              'text-[0.78rem] font-bold uppercase tracking-[0.18em]',
              isDark ? 'text-gs-gold' : 'text-ge-orange'
            )}
          >
            {eyebrow}
          </p>
          <h3
            className={cx(
              'mt-2 text-[1.3rem] font-extrabold leading-tight sm:text-[1.45rem]',
              isDark ? 'text-white' : 'text-gs-green'
            )}
          >
            {title}
          </h3>
          {intro ? (
            <p className={cx('mt-2 text-base leading-7', isDark ? 'text-white/78' : 'text-ge-gray500')}>{intro}</p>
          ) : null}
        </div>
      </div>

      <div
        className={cx(
          'mt-5 rounded-[1.35rem] border p-4 sm:p-5',
          isDark ? 'border-white/10 bg-black/15' : 'border-gs-green/10 bg-white/75'
        )}
      >
        <GeButton
          href={primaryHref}
          target="_blank"
          rel="noreferrer"
          variant={isDark ? 'gs-gold' : 'gs-green'}
          size="md"
          className="w-full"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          {primaryLabel}
        </GeButton>
        <p className={cx('mt-3 text-sm leading-6', isDark ? 'text-white/70' : 'text-ge-gray500')}>{primaryHelper}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {quickActions.map((action) => {
          const actionHref = buildWhatsAppNumberHref(contactInfo.phoneTel, action.message)

          return (
            <a
              key={action.label}
              href={actionHref}
              target="_blank"
              rel="noreferrer"
              className={cx(
                'group rounded-[1.25rem] border p-4 transition-all duration-300 hover:-translate-y-0.5',
                isDark
                  ? 'border-white/10 bg-white/[0.04] hover:border-gs-gold/45 hover:bg-white/[0.08]'
                  : 'border-gs-dark/8 bg-white/85 hover:border-gs-green/25 hover:bg-white hover:shadow-[0_14px_28px_rgba(6,59,42,0.08)]'
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={cx('h-4 w-4 shrink-0', isDark ? 'text-gs-gold' : 'text-gs-green')} aria-hidden />
                <span className={cx('text-sm font-extrabold uppercase tracking-[0.12em]', isDark ? 'text-white' : 'text-gs-dark')}>
                  {action.label}
                </span>
              </div>
              <p className={cx('mt-2 text-sm leading-6', isDark ? 'text-white/68' : 'text-ge-gray500')}>{action.helper}</p>
            </a>
          )
        })}
      </div>
    </div>
  )
}
