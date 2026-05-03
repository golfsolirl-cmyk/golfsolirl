import { Phone } from 'lucide-react'
import { cx } from '../../../lib/utils'
import { contactInfo } from '../data/copy'
import { GeButton } from './ge-button'

const topLinkClass =
  'flex min-h-[36px] items-center gap-2 transition-colors hover:text-gs-gold'

/** Desktop top strip: both voice lines (parent row adds mail). */
export function GeDualPhoneTopBarDesktop() {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-white/95">
      <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <a className={topLinkClass} href={`tel:${contactInfo.phoneTel}`}>
        <span className="sr-only">{contactInfo.phoneIrishLineLabel}: </span>
        <span>{contactInfo.phoneDisplay}</span>
      </a>
      <span aria-hidden="true" className="text-white/40">
        ·
      </span>
      <a className={topLinkClass} href={`tel:${contactInfo.spanishPhoneTel}`}>
        <span className="sr-only">{contactInfo.phoneSpanishLineLabel}: </span>
        <span>{contactInfo.spanishPhoneDisplay}</span>
      </a>
    </div>
  )
}

const topBarMobileIconClass =
  'inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25'

/** Mobile green strip: Irish + Spanish tap targets beside mail. */
export function GeDualPhoneTopBarMobileIcons() {
  return (
    <div className="flex items-center gap-2">
      <a
        aria-label={`Call Irish support ${contactInfo.phoneDisplay}`}
        className={topBarMobileIconClass}
        href={`tel:${contactInfo.phoneTel}`}
      >
        <span className="sr-only">Ireland </span>
        <Phone className="h-4 w-4" aria-hidden="true" />
      </a>
      <a
        aria-label={`Call Spanish line ${contactInfo.spanishPhoneDisplay}`}
        className={topBarMobileIconClass}
        href={`tel:${contactInfo.spanishPhoneTel}`}
      >
        <span className="sr-only">Spain </span>
        <Phone className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  )
}

const navPhoneIconClass =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:h-11 sm:w-11'

/** Mobile header: two tap targets (Irish / Spanish). */
export function GeDualPhoneNavMobileButtons({
  borderClass,
  hoverClass
}: {
  readonly borderClass: string
  readonly hoverClass: string
}) {
  return (
    <div className="flex shrink-0 gap-1 sm:gap-1.5">
      <a
        href={`tel:${contactInfo.phoneTel}`}
        aria-label={`Call Irish support ${contactInfo.phoneDisplay}`}
        className={cx(navPhoneIconClass, borderClass, hoverClass)}
      >
        <span className="sr-only">Ireland </span>
        <Phone className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]" aria-hidden="true" />
      </a>
      <a
        href={`tel:${contactInfo.spanishPhoneTel}`}
        aria-label={`Call Spanish line ${contactInfo.spanishPhoneDisplay}`}
        className={cx(navPhoneIconClass, borderClass, hoverClass)}
      >
        <span className="sr-only">Spain </span>
        <Phone className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]" aria-hidden="true" />
      </a>
    </div>
  )
}

/** Golf experience footer contact list (two lines + mail stays in parent). */
export function GeDualPhoneFooterLines() {
  return (
    <>
      <li className="flex items-start gap-2">
        <Phone className="mt-1 h-4 w-4 shrink-0 text-gs-gold/85" aria-hidden="true" />
        <span className="min-w-0 font-ge text-[1.05rem] leading-7 text-white/95 sm:text-[0.98rem]">
          <span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/60">
            {contactInfo.phoneIrishLineLabel}
          </span>
          <a href={`tel:${contactInfo.phoneTel}`} className="hover:text-gs-green-light">
            {contactInfo.phoneDisplay}
          </a>
        </span>
      </li>
      <li className="flex items-start gap-2">
        <Phone className="mt-1 h-4 w-4 shrink-0 text-gs-gold/85" aria-hidden="true" />
        <span className="min-w-0 font-ge text-[1.05rem] leading-7 text-white/95 sm:text-[0.98rem]">
          <span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/60">
            {contactInfo.phoneSpanishLineLabel}
          </span>
          <a href={`tel:${contactInfo.spanishPhoneTel}`} className="hover:text-gs-green-light">
            {contactInfo.spanishPhoneDisplay}
          </a>
        </span>
      </li>
    </>
  )
}

const enquiryPrimaryCallClass =
  'inline-flex min-h-[52px] flex-1 items-center justify-center gap-2.5 rounded-xl bg-gs-green px-4 font-ge text-[0.95rem] font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_28px_rgba(6,59,42,0.25)] transition-all hover:bg-gs-electric hover:text-gs-dark sm:px-5 sm:text-[1rem] sm:tracking-[0.11em]'

const enquirySecondaryCallClass =
  'inline-flex min-h-[52px] flex-1 items-center justify-center gap-2.5 rounded-xl border-2 border-gs-green bg-white px-4 font-ge text-[0.95rem] font-bold uppercase tracking-[0.1em] text-gs-green transition-all hover:bg-gs-green/10 sm:px-5 sm:text-[1rem] sm:tracking-[0.11em]'

/** Enquiry band: Irish + Spanish call row (WhatsApp stays beside in parent). */
export function GeDualPhoneEnquiryCallRow() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
      <a href={`tel:${contactInfo.phoneTel}`} className={enquiryPrimaryCallClass}>
        <Phone className="h-4 w-4 shrink-0" aria-hidden />
        <span className="min-w-0 text-center">{contactInfo.phoneDisplay}</span>
      </a>
      <a href={`tel:${contactInfo.spanishPhoneTel}`} className={enquirySecondaryCallClass}>
        <Phone className="h-4 w-4 shrink-0" aria-hidden />
        <span className="min-w-0 text-center">{contactInfo.spanishPhoneDisplay}</span>
      </a>
    </div>
  )
}

export type GeDualPhoneHeroTone = 'sunny' | 'dark'

/** Hero / transport hero: paired call buttons (full width on narrow columns). */
export function GeDualPhoneHeroButtons({
  tone,
  className
}: {
  readonly tone: GeDualPhoneHeroTone
  readonly className?: string
}) {
  const variant = tone === 'sunny' ? 'outline-gs-green' : 'outline-gs-white'
  return (
    <div className={cx('flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3', className)}>
      <GeButton href={`tel:${contactInfo.phoneTel}`} variant={variant} size="lg" className="w-full min-w-0 sm:flex-1">
        <Phone className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{contactInfo.phoneDisplay}</span>
      </GeButton>
      <GeButton href={`tel:${contactInfo.spanishPhoneTel}`} variant={variant} size="lg" className="w-full min-w-0 sm:flex-1">
        <Phone className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{contactInfo.spanishPhoneDisplay}</span>
      </GeButton>
    </div>
  )
}

/** Final CTA section: email stays in parent; this is the call row only. */
export function GeDualPhoneFinalCtaRow() {
  return (
    <div className="flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap">
      <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-gs-green" size="lg" className="min-w-0 sm:min-w-[200px]">
        <span className="sm:hidden">Ireland </span>
        <span className="hidden sm:inline">Irish </span>
        {contactInfo.phoneDisplay}
      </GeButton>
      <GeButton href={`tel:${contactInfo.spanishPhoneTel}`} variant="outline-gs-green" size="lg" className="min-w-0 sm:min-w-[200px]">
        <span className="sm:hidden">Spain </span>
        <span className="hidden sm:inline">Spanish </span>
        {contactInfo.spanishPhoneDisplay}
      </GeButton>
    </div>
  )
}

const airportCardClass =
  'group inline-flex min-h-[62px] w-full items-center justify-center gap-3 rounded-full border border-[#ddd0b0] bg-[#fffaf0] px-4 py-3 font-ge font-extrabold text-gs-dark shadow-[0_14px_28px_rgba(69,53,24,0.08)] transition-colors hover:border-gs-gold/[0.5] hover:text-gs-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:min-h-[64px] sm:px-5'

/** Home airport transfers: stacked Irish + Spanish call cards. */
export function GeDualPhoneAirportTransferCalls() {
  return (
    <div className="mt-4 flex flex-col items-stretch gap-3">
      <p className="font-ge text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-gs-dark/[0.68] sm:text-[0.82rem] sm:tracking-[0.16em]">
        Meet & greet · Resort drop-off · Golf bag friendly
      </p>
      <a
        href={`tel:${contactInfo.phoneTel}`}
        aria-label={`Call Irish support on ${contactInfo.phoneDisplay}`}
        className={airportCardClass}
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gs-green text-white shadow-[0_10px_22px_rgba(6,59,42,0.18)] transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12">
          <Phone className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-gs-dark/55 sm:text-[0.68rem]">Call Irish support</span>
          <span className="mt-0.5 block text-[1.08rem] tracking-[0.01em] text-gs-dark sm:text-[1.18rem]">
            {contactInfo.phoneDisplay}
          </span>
        </span>
      </a>
      <a
        href={`tel:${contactInfo.spanishPhoneTel}`}
        aria-label={`Call Spanish line on ${contactInfo.spanishPhoneDisplay}`}
        className={airportCardClass}
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gs-green/40 bg-white text-gs-green shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12">
          <Phone className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-gs-dark/55 sm:text-[0.68rem]">Call Spanish line</span>
          <span className="mt-0.5 block text-[1.08rem] tracking-[0.01em] text-gs-dark sm:text-[1.18rem]">
            {contactInfo.spanishPhoneDisplay}
          </span>
        </span>
      </a>
    </div>
  )
}
