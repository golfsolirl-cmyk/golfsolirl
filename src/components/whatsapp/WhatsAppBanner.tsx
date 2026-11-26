import {
  createWhatsAppLink,
  trackWhatsAppClick,
  WHATSAPP_DISPLAY,
  WHATSAPP_MESSAGES,
  WHATSAPP_NUMBER
} from '../../lib/whatsapp'
import { DISMISS_STORAGE_KEYS } from '../../lib/persisted-dismiss'
import { usePersistedDismiss } from '../../hooks/use-persisted-dismiss'
import { useEscapeDismiss } from '../../hooks/use-escape-dismiss'
import { DismissCloseButton } from '../ui/dismiss-close-button'
import { WhatsAppIcon } from './WhatsAppIcon'
import { RequestCallbackCard } from './RequestCallbackCard'
import { cx } from '../../lib/utils'

type WhatsAppBannerProps = {
  readonly className?: string
  readonly heading?: string
  readonly lead?: string
  readonly message?: string
  readonly sourcePage?: string
}

/**
 * Contact help strip: WhatsApp card + Request a callback card.
 * Desktop: side-by-side. Mobile: stacked. One dismissible section.
 */
export function WhatsAppBanner({
  className,
  heading = 'Not a fan of forms? Message us on WhatsApp.',
  lead = 'Tap the button, say hello, and our Irish team will get back to you.',
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

  useEscapeDismiss(dismiss, ready && !dismissed)

  if (!ready || dismissed) return null

  return (
    <section
      className={cx('pb-[clamp(3.5rem,2rem+5vw,7rem)] pt-4', className)}
      aria-labelledby="contact-help-heading"
    >
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        <div className="ge-on-dark relative overflow-hidden rounded-[2rem] border border-[#25D366]/20 bg-gradient-to-br from-[#041F17] via-[#063B2A] to-[#0B6B45] px-4 pb-8 pt-4 text-white sm:px-6 sm:pb-10 sm:pt-5">
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#25D366]/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-[#d4a843]/12 blur-3xl"
            aria-hidden
          />

          <div className="relative mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className="font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-[#6ee7b7]"
                data-keep-color
              >
                Prefer a chat?
              </p>
              <h2
                id="contact-help-heading"
                className="mt-1 font-ge text-[1.35rem] font-extrabold leading-tight text-white sm:text-[1.55rem]"
                data-keep-color
              >
                Not tech savvy? We’ll do it for you
              </h2>
            </div>
            <DismissCloseButton
              onClick={dismiss}
              tone="light"
              aria-label="Dismiss WhatsApp and callback help"
            />
          </div>

          <div className="relative grid gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-5">
            {/* WhatsApp card */}
            <div className="flex flex-col rounded-[1.75rem] border border-[#25D366]/30 bg-[#052a1c]/90 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.7)]">
                  <WhatsAppIcon className="relative h-6 w-6" />
                </span>
                <div>
                  <p
                    className="font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[#6ee7b7]"
                    data-keep-color
                  >
                    WhatsApp
                  </p>
                  <h3 className="font-ge text-xl font-extrabold leading-tight text-white" data-keep-color>
                    {heading}
                  </h3>
                </div>
              </div>
              <p className="font-ge text-[0.98rem] leading-6 text-white/80" data-keep-color>
                {lead}
              </p>
              <p className="mt-4 font-ge text-xl font-extrabold tracking-wide text-white" data-keep-color>
                <a href={telHref} className="text-white hover:text-[#6ee7b7]">
                  {WHATSAPP_DISPLAY}
                </a>
              </p>
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
                className="mt-auto inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-6 font-ge text-base font-extrabold text-[#06280f] shadow-[0_12px_28px_rgba(37,211,102,0.35)] transition hover:bg-[#1ebe5d]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Chat on WhatsApp
              </a>
            </div>

            <RequestCallbackCard sourcePage={path} />
          </div>
        </div>
      </div>
    </section>
  )
}
