import type { MouseEvent } from 'react'
import { cx } from '../../lib/utils'
import {
  createWhatsAppLink,
  trackWhatsAppClick,
  WHATSAPP_CTA_LABEL,
  WHATSAPP_DISPLAY,
  type WhatsAppClickContext
} from '../../lib/whatsapp'
import { WhatsAppIcon } from './WhatsAppIcon'

export type WhatsAppPillTone = 'green' | 'light' | 'dark' | 'forest'

type WhatsAppPillProps = {
  readonly message: string
  readonly context?: WhatsAppClickContext
  /** Show the number as a smaller second line (footer / contact only). */
  readonly showNumber?: boolean
  readonly tone?: WhatsAppPillTone
  readonly className?: string
  readonly fullWidth?: boolean
  readonly ariaLabel?: string
}

const toneClass: Record<WhatsAppPillTone, string> = {
  green:
    'border-[#1ebe57]/80 bg-[#25D366] text-[#062016] shadow-[0_8px_20px_rgba(37,211,102,0.28)] hover:bg-[#1ebe57] focus-visible:ring-[#25D366]',
  light:
    'border-[#25D366]/65 bg-white text-[#0f7a3a] shadow-[0_0_18px_rgba(37,211,102,0.16)] hover:bg-[#25D366] hover:text-white focus-visible:ring-[#25D366]',
  dark:
    'border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/16 focus-visible:ring-[#f4dfa6]',
  forest:
    'border-white/25 bg-forest-900 text-white hover:border-white/40 hover:bg-[#0b4d3b] focus-visible:ring-[#f4dfa6]'
}

/**
 * Compact WhatsApp CTA — icon + “WhatsApp us” on one line.
 * Number is optional (smaller second line) for footer/contact only.
 */
export function WhatsAppPill({
  message,
  context,
  showNumber = false,
  tone = 'green',
  className,
  fullWidth = false,
  ariaLabel
}: WhatsAppPillProps) {
  const href = createWhatsAppLink(message)
  const label = ariaLabel ?? `WhatsApp us on ${WHATSAPP_DISPLAY}`

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!context) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    trackWhatsAppClick(context)
  }

  return (
    <a
      aria-label={label}
      className={cx(
        'group inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full border px-5 py-2.5 font-ge transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        showNumber ? 'flex-col gap-0.5 py-2.5' : '',
        fullWidth ? 'w-full' : '',
        toneClass[tone],
        className
      )}
      href={href}
      onClick={onClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="inline-flex items-center gap-2.5">
        <WhatsAppIcon className="h-5 w-5 shrink-0" />
        <span className="text-[0.95rem] font-bold leading-none tracking-normal">{WHATSAPP_CTA_LABEL}</span>
      </span>
      {showNumber ? (
        <span className="whitespace-nowrap font-ge text-[0.78rem] font-semibold leading-none tracking-wide opacity-90">
          {WHATSAPP_DISPLAY}
        </span>
      ) : null}
    </a>
  )
}
