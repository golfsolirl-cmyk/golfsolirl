import { useId, useState } from 'react'
import { cx } from '../../lib/utils'
import {
  WHATSAPP_DISPLAY,
  WHATSAPP_MESSAGES,
  type WhatsAppClickContext,
  type WhatsAppEnquiryType
} from '../../lib/whatsapp'
import { WhatsAppButton } from './WhatsAppButton'
import { WhatsAppVisual } from './WhatsAppVisual'

const START_OPTIONS: readonly {
  readonly id: Extract<WhatsAppEnquiryType, 'quote' | 'question' | 'booking_help'>
  readonly label: string
}[] = [
  { id: 'quote', label: "I'd Like a Golf Holiday Quote" },
  { id: 'question', label: 'I Have a Question' },
  { id: 'booking_help', label: 'I Need Help With a Booking' }
]

type WhatsAppConciergeProps = {
  readonly variant?: 'home' | 'contact'
  readonly sourcePage?: string
  readonly className?: string
}

export function WhatsAppConcierge({ variant = 'home', sourcePage = '/', className }: WhatsAppConciergeProps) {
  const headingId = useId()
  const noteId = useId()
  const [enquiryType, setEnquiryType] = useState<Extract<WhatsAppEnquiryType, 'quote' | 'question' | 'booking_help'>>('quote')
  const isContact = variant === 'contact'
  const message = isContact ? WHATSAPP_MESSAGES.contact : WHATSAPP_MESSAGES[enquiryType]
  const selectedLabel = START_OPTIONS.find((option) => option.id === enquiryType)?.label

  const context: WhatsAppClickContext = {
    sourcePage,
    componentVariant: isContact ? 'contact' : 'concierge',
    enquiryType: isContact ? 'contact' : enquiryType
  }

  return (
    <section aria-labelledby={headingId} className={cx('w-full max-w-full', className)}>
      <div className="gsol-wa-panel ge-on-dark overflow-hidden rounded-[1.75rem] border border-[#d9be7a]/45 bg-[#062016] text-white shadow-[0_28px_70px_rgba(6,32,22,0.18)] sm:rounded-[2rem]">
        <div aria-hidden="true" className="h-1 bg-gradient-to-r from-[#128C7E] via-[#d9be7a] to-[#25D366]" />
        <div className="grid lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
          <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <p className="gsol-wa-gold font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.18em]">
              Irish-owned concierge
            </p>
            <h2
              id={headingId}
              className="mt-3 max-w-[16ch] text-balance font-ge text-[2rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-white sm:max-w-none sm:text-[2.45rem] lg:text-[2.7rem]"
            >
              Not Tech Savvy?
            </h2>
            <p className="gsol-wa-gold mt-4 max-w-xl font-ge text-[1.15rem] font-semibold leading-snug sm:text-[1.28rem]">
              WhatsApp GolfSol Ireland on {WHATSAPP_DISPLAY}.
            </p>
            <p className="mt-4 max-w-xl font-ge text-base leading-7 text-white sm:text-[1.0625rem] sm:leading-8">
              {isContact
                ? "We're happy to answer your questions. No account and no form required."
                : "Simply send us a WhatsApp message and tell us what you're looking for. We'll help with golf courses, hotels, tee times and airport transfers."}
            </p>

            {isContact ? null : (
              <div className="mt-7">
                <p className="font-ge text-base font-semibold text-white" id={noteId}>
                  Or start with one of these. The button below still works straight away.
                </p>
                <div className="mt-3 grid gap-2.5" role="group" aria-labelledby={noteId}>
                  {START_OPTIONS.map((option) => {
                    const selected = enquiryType === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setEnquiryType(option.id)}
                        className={cx(
                          'min-h-12 rounded-2xl border px-4 py-3 text-left font-ge text-base font-bold leading-snug transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#062016]',
                          selected
                            ? 'border-[#25D366] bg-[#0d3b32] text-white'
                            : 'border-white/40 bg-white/10 text-white hover:border-white hover:bg-white/15'
                        )}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
                <p className="sr-only" aria-live="polite">
                  {selectedLabel} selected. The WhatsApp button will include that message.
                </p>
              </div>
            )}

            <div className="mt-7">
              <WhatsAppButton
                message={message}
                context={context}
                className="sm:min-w-[18rem]"
              >
                {isContact ? 'Message GolfSol Ireland' : 'Chat With Us on WhatsApp'}
              </WhatsAppButton>
              <p className="mt-3 font-ge text-base leading-7 text-white">
                {isContact
                  ? `Message us on ${WHATSAPP_DISPLAY}. A person in Ireland will reply.`
                  : 'No complicated forms. No hassle. Just a friendly chat.'}
              </p>
              {isContact ? null : (
                <p className="gsol-wa-gold mt-1 font-ge text-base leading-7">
                  Irish-owned. You are messaging a real GolfSol Ireland teammate on {WHATSAPP_DISPLAY}.
                </p>
              )}
            </div>
          </div>
          <div className="relative flex items-center justify-center overflow-hidden bg-[#04140f] px-3 py-6 sm:px-6 sm:py-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(244,223,166,0.22),transparent_62%)]"
            />
            <WhatsAppVisual message={message} context={context} className="relative" />
          </div>
        </div>
      </div>
    </section>
  )
}
