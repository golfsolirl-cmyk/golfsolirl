import { useId } from 'react'
import { cx } from '../../lib/utils'
import {
  buildBookingHelpMessage,
  WHATSAPP_DISPLAY,
  type WhatsAppTripDetails
} from '../../lib/whatsapp'
import { WhatsAppVisual } from './WhatsAppVisual'

type WhatsAppBookingHelpProps = WhatsAppTripDetails & {
  readonly sourcePage?: string
  readonly className?: string
}

export function WhatsAppBookingHelp({
  sourcePage = '/',
  className,
  packageName,
  travelDates,
  golfers,
  nights,
  rounds,
  bookingReference,
  stay,
  course
}: WhatsAppBookingHelpProps) {
  const headingId = useId()
  const message = buildBookingHelpMessage({
    packageName,
    travelDates,
    golfers,
    nights,
    rounds,
    bookingReference,
    stay,
    course
  })

  const facts = [
    packageName && packageName.length <= 42 ? { label: 'Holiday', value: packageName } : null,
    travelDates ? { label: 'Dates', value: travelDates } : null,
    golfers ? { label: 'Golfers', value: golfers } : null,
    nights ? { label: 'Nights', value: String(nights) } : null,
    rounds ? { label: 'Rounds', value: String(rounds) } : null,
    stay ? { label: 'Stay', value: stay } : null,
    course ? { label: 'Course', value: course } : null
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact))

  return (
    <section aria-labelledby={headingId} className={cx('w-full max-w-full', className)}>
      <div className="gsol-wa-panel ge-on-dark overflow-hidden rounded-[1.75rem] border border-[#d9be7a]/50 bg-[#062016] text-white shadow-[0_22px_55px_rgba(6,32,22,0.16)] sm:rounded-[2rem]">
        <div aria-hidden="true" className="h-1 bg-gradient-to-r from-[#128C7E] via-[#d9be7a] to-[#25D366]" />
        <div className="grid gap-6 px-5 py-8 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:items-center lg:gap-10 lg:px-10">
          <div>
            <p className="gsol-wa-gold font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.18em]">
              Not tech savvy?
            </p>
            <h2
              id={headingId}
              className="mt-3 text-balance font-ge text-[1.85rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-white sm:text-[2.25rem]"
            >
              WhatsApp GolfSol Ireland on {WHATSAPP_DISPLAY}
            </h2>
            <p className="mt-4 max-w-2xl font-ge text-base leading-7 text-white sm:text-[1.0625rem] sm:leading-8">
              Not sure which golf package suits your group? Send us a WhatsApp message and we&apos;ll help you find the right option.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <WhatsAppVisual
              message={message}
              context={{
                sourcePage,
                componentVariant: 'booking',
                enquiryType: 'package',
                packageName
              }}
              className="max-w-[22rem]"
            />
            <p className="gsol-wa-gold mt-2 text-center font-ge text-base leading-7">
              Tap the crest. It opens WhatsApp to {WHATSAPP_DISPLAY}.
            </p>
          </div>
        </div>
        {facts.length > 0 ? (
          <dl className="grid gap-px border-t border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.label} className="px-5 py-3 sm:px-6">
                <dt className="gsol-wa-gold font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em]">{fact.label}</dt>
                <dd className="mt-1 font-ge text-base font-semibold leading-snug text-white">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  )
}
