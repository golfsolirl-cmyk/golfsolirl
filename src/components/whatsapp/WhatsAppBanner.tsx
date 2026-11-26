import {
  createWhatsAppLink,
  trackWhatsAppClick,
  WHATSAPP_DISPLAY,
  WHATSAPP_MESSAGES,
  WHATSAPP_NUMBER
} from '../../lib/whatsapp'
import { DISMISS_STORAGE_KEYS } from '../../lib/persisted-dismiss'
import { usePersistedDismiss } from '../../hooks/use-persisted-dismiss'
import { DismissCloseButton } from '../ui/dismiss-close-button'
import { WhatsAppIcon } from './WhatsAppIcon'
import { cx } from '../../lib/utils'

type WhatsAppBannerProps = {
  readonly className?: string
  readonly heading?: string
  readonly lead?: string
  readonly message?: string
  readonly sourcePage?: string
}

/**
 * TOW-style WhatsApp section — dark Golf Sol card, green accent, no floating popup.
 * Dismissible with a 44px Close control; choice persists in localStorage.
 */
export function WhatsAppBanner({
  className,
  heading = 'Not a fan of forms? Message us on WhatsApp.',
  lead = 'Tap the button, say hello, and our Irish team will get back to you. You can also save the number and message whenever it suits.',
  message = WHATSAPP_MESSAGES.contact,
  sourcePage
}: WhatsAppBannerProps) {
  const { dismissed, dismiss, ready } = usePersistedDismiss(DISMISS_STORAGE_KEYS.whatsappBanner, 'local')
  const href = createWhatsAppLink(message)
  const telHref = `tel:+${WHATSAPP_NUMBER}`
  const path =
    sourcePage ||
    (typeof window !== 'undefined'
      ? window.location.pathname.replace(/\/+$/, '') || '/'
      : '/')

  if (!ready || dismissed) return null

  return (
    <section
      className={cx('pb-[clamp(3.5rem,2rem+5vw,7rem)] pt-4', className)}
      aria-labelledby="whatsapp-banner-heading"
    >
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        <div className="ge-on-dark relative overflow-hidden rounded-[2rem] border border-[#25D366]/25 bg-gradient-to-br from-[#063B2A] via-[#0B6B45] to-[#041F17] px-5 pb-12 pt-5 text-white sm:px-12 sm:pb-16 sm:pt-6">
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#25D366]/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-[#d4a843]/15 blur-3xl"
            aria-hidden
          />

          <div className="relative mb-6 flex justify-end">
            <DismissCloseButton onClick={dismiss} tone="dark" className="bg-white/95 text-gs-dark shadow-md hover:bg-white" />
          </div>

          <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:gap-10 lg:text-left">
            <span className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_40px_-8px_rgba(37,211,102,0.8)] sm:h-24 sm:w-24">
              <span
                className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40 motion-reduce:hidden"
                aria-hidden
                style={{ animationDuration: '2.4s' }}
              />
              <WhatsAppIcon className="relative h-10 w-10 sm:h-12 sm:w-12" />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-[#6ee7b7]"
                data-keep-color
              >
                WhatsApp
              </p>
              <h2
                id="whatsapp-banner-heading"
                className="mt-3 font-ge text-[1.65rem] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[2rem]"
                data-keep-color
              >
                {heading}
              </h2>
              <p
                className="mx-auto mt-4 max-w-2xl font-ge text-[1.02rem] leading-7 text-white/85 lg:mx-0"
                data-keep-color
              >
                {lead}
              </p>
              <p className="mt-5 font-ge text-2xl font-extrabold tracking-wide text-white sm:text-3xl" data-keep-color>
                <a href={telHref} className="text-white hover:text-[#6ee7b7]">
                  {WHATSAPP_DISPLAY}
                </a>
              </p>
            </div>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackWhatsAppClick({
                  sourcePage: path,
                  componentVariant: 'contact',
                  enquiryType: 'contact'
                })
              }
              className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 font-ge text-base font-extrabold text-[#06280f] shadow-[0_12px_28px_rgba(37,211,102,0.35)] transition hover:-translate-y-0.5 hover:bg-[#1ebe5d]"
            >
              <WhatsAppIcon className="h-6 w-6" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
