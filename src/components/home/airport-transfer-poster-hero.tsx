import { useReducedMotion } from 'framer-motion'
import { m } from 'framer-motion'
import { ArrowRight, CarFront, Phone, Plane, ShieldCheck, Users, type LucideIcon } from 'lucide-react'
import { companyContact } from '../../data/site-content'
import { cx } from '../../lib/utils'

const HERO_MOBILE_SRC = '/images/hero-airport-mobile.webp'
const HERO_DESKTOP_SRC = '/images/hero-airport-desktop.webp'
const HERO_CALL_DISPLAY = '087 4464766'
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const MARKS: readonly { readonly icon: LucideIcon; readonly title: string; readonly detail: string }[] = [
  { icon: Plane, title: 'Airport pick up', detail: 'Málaga Airport to your stay' },
  { icon: Users, title: 'Private transfers', detail: 'Up to 8 with luggage' },
  { icon: CarFront, title: 'Door to door', detail: 'Direct to accommodation' },
  { icon: ShieldCheck, title: 'Fixed price', detail: 'Agreed before you fly' }
]

const fadeUp = (delay: number, reduceMotion: boolean) =>
  reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: EASE, delay }
      }

function asset(publicPath: string): string {
  const path = publicPath.replace(/^\//, '')
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

function ServiceMarks({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {MARKS.map((mark, index) => {
        const Icon = mark.icon
        return (
          <m.li
            key={mark.title}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-4 text-center backdrop-blur-sm"
            {...fadeUp(0.32 + index * 0.06, reduceMotion)}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300 ring-1 ring-white/10">
              <Icon className="h-5 w-5" aria-hidden strokeWidth={1.8} />
            </span>
            <span className="font-ge text-[0.8rem] font-bold leading-tight text-white">{mark.title}</span>
            <span className="font-ge text-[0.72rem] leading-tight text-white/60">{mark.detail}</span>
          </m.li>
        )
      })}
    </ul>
  )
}

/** Homepage hero: the arrivals photo fills the section, copy sits on the dark left. */
export function AirportTransferPosterHero({ className }: { readonly className?: string }) {
  const reduceMotion = Boolean(useReducedMotion())

  return (
    <section
      id="top"
      aria-labelledby="premium-hero-title"
      className={cx('airport-poster-hero ge-on-dark relative isolate overflow-hidden bg-[#021a0e] text-white', className)}
    >
      <picture className="absolute inset-0 block h-full w-full">
        <source media="(min-width: 768px)" srcSet={asset(HERO_DESKTOP_SRC)} type="image/webp" />
        <img
          src={asset(HERO_MOBILE_SRC)}
          alt="White people-carrier with the Golf Sol crest on the door, waiting at Málaga airport arrivals, with an airliner overhead and palm trees."
          decoding="async"
          fetchPriority="high"
          width={828}
          height={466}
          className={cx(
            'absolute inset-0 h-full w-full object-cover object-[76%_62%]',
            !reduceMotion && 'gsol-hero-drift'
          )}
        />
      </picture>

      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#021a0e]/70 via-[#021a0e]/60 to-[#021a0e]/95 md:bg-[linear-gradient(to_right,#021a0e_0%,rgba(2,26,14,0.85)_35%,rgba(2,26,14,0.4)_55%,transparent_75%)]" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#021a0e] via-transparent to-transparent opacity-80" />

      <div aria-hidden className="ge-fixed-header-spacer relative z-20 w-full shrink-0" style={{ height: 'var(--ge-fixed-header-h)' }} />

      <div className="relative z-10 mx-auto flex w-full max-w-[1340px] flex-col justify-end px-5 pb-12 pt-4 sm:px-8 md:min-h-[calc(100svh-var(--ge-fixed-header-h))] md:justify-center md:pb-16 md:pt-6 lg:px-12">
        <div className="airport-poster-copy w-full max-w-[42rem]">
          <m.div
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 backdrop-blur-sm"
            {...fadeUp(0.04, reduceMotion)}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-ge text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/80">Irish-owned · Costa del Sol specialists</span>
          </m.div>

          <h1 id="premium-hero-title" className="mt-6">
            <m.span className="block font-ge text-[2.8rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-[3.6rem] md:text-[4.2rem] lg:text-[4.8rem]" {...fadeUp(0.08, reduceMotion)}>
              Your golf trip
            </m.span>
            <m.span className="block font-ge text-[2.8rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-emerald-300 sm:text-[3.6rem] md:text-[4.2rem] lg:text-[4.8rem]" {...fadeUp(0.12, reduceMotion)}>
              starts here.
            </m.span>
          </h1>

          <m.p className="mt-5 max-w-[36rem] font-ge text-[1.05rem] leading-[1.7] text-white/75 sm:text-[1.15rem] md:text-[1.2rem]" {...fadeUp(0.16, reduceMotion)}>
            Private Málaga airport transfers, handpicked courses, and hotels Irish groups love — one team plans the whole week.
          </m.p>

          <m.div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4" {...fadeUp(0.22, reduceMotion)}>
            <a
              href="#enquire"
              className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-white px-7 font-ge text-[0.88rem] font-bold text-[#04291a] shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] sm:h-[52px]"
            >
              Get a quote
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </a>
            <a
              href={`tel:${companyContact.phoneTel}`}
              aria-label={`Call Golf Sol Ireland on ${HERO_CALL_DISPLAY}`}
              className="inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl border border-white/20 bg-white/[0.06] px-6 font-ge text-[0.88rem] font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/[0.1] sm:h-[52px]"
            >
              <Phone className="h-4 w-4" aria-hidden strokeWidth={2} />
              {HERO_CALL_DISPLAY}
            </a>
          </m.div>

          <m.div className="mt-10 w-full max-w-[44rem]" {...fadeUp(0.3, reduceMotion)}>
            <ServiceMarks reduceMotion={reduceMotion} />
          </m.div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
    </section>
  )
}
