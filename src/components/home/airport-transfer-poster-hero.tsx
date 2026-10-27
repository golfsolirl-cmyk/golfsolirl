import { useReducedMotion } from 'framer-motion'
import { m } from 'framer-motion'
import { CarFront, Phone, Plane, ShieldCheck, Sun, Users, type LucideIcon } from 'lucide-react'
import { companyContact } from '../../data/site-content'
import { cx } from '../../lib/utils'

const HERO_SRC = '/images/hero-image.png'
const HERO_CALL_DISPLAY = '086 8515000'
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const MARKS: readonly { readonly icon: LucideIcon; readonly title: string; readonly detail: string }[] = [
  { icon: Plane, title: 'Airport pick up', detail: 'Málaga Airport to your stay' },
  { icon: Users, title: 'Private transfers', detail: 'Up to 8 people with luggage' },
  { icon: CarFront, title: 'Door to door', detail: 'Direct to your accommodation' },
  { icon: ShieldCheck, title: 'Fixed price', detail: 'Agreed before you fly' }
]

const fadeUp = (delay: number, reduceMotion: boolean) =>
  reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASE, delay }
      }

function asset(publicPath: string): string {
  const path = publicPath.replace(/^\//, '')
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

function CallBubble({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <m.a
      href={`tel:${companyContact.phoneTel}`}
      aria-label={`Call Golf Sol Ireland on ${HERO_CALL_DISPLAY}`}
      className="airport-poster-call inline-flex w-fit items-center gap-2.5 rounded-full bg-[#063b2a] py-1 pl-1 pr-4 text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)] ring-1 ring-[#e4c56a]/80"
      {...fadeUp(0.16, reduceMotion)}
    >
      <span className="airport-poster-on-gold flex h-9 w-9 items-center justify-center rounded-full bg-[#d4a843]">
        <Phone className="h-4 w-4" aria-hidden strokeWidth={2.4} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="airport-poster-gold-type airport-poster-call-kicker font-ge font-extrabold uppercase">Call Ireland</span>
        <span className="airport-poster-call-number font-ge font-extrabold text-white">{HERO_CALL_DISPLAY}</span>
      </span>
    </m.a>
  )
}

function ServiceMarks({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4 sm:gap-x-4">
      {MARKS.map((mark, index) => {
        const Icon = mark.icon
        return (
          <m.li
            key={mark.title}
            className="flex min-w-0 flex-col items-center text-center"
            {...fadeUp(0.28 + index * 0.08, reduceMotion)}
          >
            <span className="airport-poster-on-gold flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#f3e6c4] to-[#c9962e] shadow-[0_8px_16px_rgba(0,0,0,0.28)] ring-2 ring-[#f3e6c4]/70">
              <Icon className="h-5 w-5" aria-hidden strokeWidth={2.1} />
            </span>
            <span className="airport-poster-mark-title mt-1.5 font-ge font-extrabold uppercase text-[#f7f3ea]">{mark.title}</span>
            <span className="airport-poster-gold-type airport-poster-mark-detail mt-0.5 font-ge">{mark.detail}</span>
          </m.li>
        )
      })}
    </ul>
  )
}

function PriceBanner({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <a
      href="#enquire"
      className="airport-poster-on-gold group relative isolate inline-flex min-h-12 w-full max-w-[28rem] items-center gap-3 overflow-hidden rounded-full bg-[#d4a843] px-3 py-1.5 shadow-[0_14px_30px_rgba(0,0,0,0.28)] ring-1 ring-[#f3e6c4]/80 sm:w-auto sm:pr-6"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f6e7b8_0%,#d4a843_55%,#b8862b_100%)]"
      />
      <span className="airport-poster-on-dark-chip relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#062016]">
        <Phone className="h-4 w-4" aria-hidden strokeWidth={2.3} />
      </span>
      {reduceMotion ? null : (
        <span aria-hidden className="gsol-pill-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3" />
      )}
      <span className="relative min-w-0 text-left">
        <span className="airport-poster-price-title block font-ge font-extrabold uppercase leading-none">Get a price</span>
        <span className="airport-poster-price-sub mt-1 block font-ge font-bold uppercase leading-tight">
          Send your dates and number of people
        </span>
      </span>
    </a>
  )
}

/** Homepage hero: the arrivals photo fills the section, copy sits on the dark left. */
export function AirportTransferPosterHero({ className }: { readonly className?: string }) {
  const reduceMotion = Boolean(useReducedMotion())

  return (
    <section
      id="top"
      aria-labelledby="premium-hero-title"
      className={cx('airport-poster-hero ge-on-dark relative isolate overflow-hidden bg-[#041510] text-[#f7f3ea]', className)}
    >
      <img
        src={asset(HERO_SRC)}
        alt="White people-carrier with the Golf Sol crest on the door, waiting at Málaga airport arrivals, with an airliner overhead and palm trees."
        decoding="async"
        fetchPriority="high"
        className={cx(
          'absolute inset-0 h-full w-full object-cover object-[76%_62%]',
          !reduceMotion && 'gsol-hero-drift'
        )}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#041510] via-[#041510]/88 via-[58%] to-[#041510]/25 md:bg-gradient-to-r md:from-[#041510] md:from-[8%] md:via-[#041510]/80 md:via-[42%] md:to-transparent md:to-[70%]" />

      <div aria-hidden className="ge-fixed-header-spacer relative z-20 w-full shrink-0" style={{ height: 'var(--ge-fixed-header-h)' }} />

      <div className="relative z-10 mx-auto flex w-full max-w-[1340px] flex-col justify-end px-4 pb-8 pt-3 sm:px-6 md:min-h-[calc(100svh-var(--ge-fixed-header-h))] md:justify-center md:px-10 md:pb-10 md:pt-4 lg:px-12">
        <div className="airport-poster-copy w-full max-w-[40rem]">
          <m.p className="airport-poster-kicker font-ge font-extrabold uppercase text-[#f3e6c4]" {...fadeUp(0.04, reduceMotion)}>
            Golf Sol Ireland
          </m.p>
          <h1 id="premium-hero-title" className="airport-poster-title mt-1 font-ge font-extrabold uppercase">
            <m.span className="block text-[#f7f3ea]" {...fadeUp(0.08, reduceMotion)}>
              Airport
            </m.span>
            <m.span className="airport-poster-gold-type block" {...fadeUp(0.12, reduceMotion)}>
              Transfers
            </m.span>
          </h1>
          <m.span
            aria-hidden
            className="mt-2 block h-[3px] w-28 origin-left rounded-full bg-gradient-to-r from-[#f3e6c4] via-[#d4a843] to-transparent"
            initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
          />
          <m.p className="airport-poster-place mt-2 inline-flex items-center gap-2 font-ge font-extrabold uppercase text-white" {...fadeUp(0.14, reduceMotion)}>
            Costa del Sol
            <Sun className={cx('airport-poster-gold-type h-4 w-4', !reduceMotion && 'gsol-sun-rock')} aria-hidden />
          </m.p>
          <m.p className="airport-poster-lead mt-1.5 max-w-[34rem] font-ge text-[#f7f3ea]" {...fadeUp(0.16, reduceMotion)}>
            Private Málaga airport runs for Irish golf groups. Golf bags in, door to door, price agreed before you fly.
          </m.p>
          <div className="mt-3">
            <CallBubble reduceMotion={reduceMotion} />
          </div>
          <m.div className="mt-4 w-full max-w-[40rem]" {...fadeUp(0.22, reduceMotion)}>
            <ServiceMarks reduceMotion={reduceMotion} />
            <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <PriceBanner reduceMotion={reduceMotion} />
              <a href="/services/transport" className="airport-poster-more font-ge font-extrabold uppercase text-[#f3e6c4] underline decoration-[#d4a843] underline-offset-4">
                View transfer options
              </a>
            </div>
          </m.div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-7 text-[#faf8f3]">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="h-full w-full">
          <path fill="currentColor" d="M0 26c220 22 380 22 560 6s340-28 520-12 240 22 360 10v18H0Z" />
        </svg>
      </div>
    </section>
  )
}
