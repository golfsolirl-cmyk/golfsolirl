import type { MouseEvent } from 'react'
import { cx } from '../../lib/utils'
import {
  createWhatsAppLink,
  trackWhatsAppClick,
  WHATSAPP_DISPLAY,
  type WhatsAppClickContext
} from '../../lib/whatsapp'
import { WhatsAppIcon } from './WhatsAppIcon'

type WhatsAppButtonProps = {
  readonly message: string
  readonly children: string
  readonly context: WhatsAppClickContext
  readonly className?: string
  readonly fullWidth?: boolean
}

export function WhatsAppButton({ message, children, context, className, fullWidth = true }: WhatsAppButtonProps) {
  const href = createWhatsAppLink(message)

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    trackWhatsAppClick(context)
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cx(
        'group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#075E54] px-6 py-3 text-center font-ge text-[1.05rem] font-bold leading-tight text-white shadow-[0_12px_28px_rgba(7,94,84,0.35)] transition duration-200',
        'hover:bg-[#064e46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#062016]',
        'gsol-wa-cta motion-safe:hover:-translate-y-0.5',
        fullWidth ? 'w-full sm:w-auto' : '',
        className
      )}
    >
      <WhatsAppIcon className="h-7 w-7 shrink-0 text-white" />
      <span>{children}</span>
      <span className="sr-only">Opens WhatsApp to message GolfSol Ireland on {WHATSAPP_DISPLAY}. A new tab opens.</span>
    </a>
  )
}
