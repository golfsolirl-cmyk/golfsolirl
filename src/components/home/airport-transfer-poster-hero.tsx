import { useReducedMotion } from 'framer-motion'
import { m } from 'framer-motion'
import { ArrowRight, CarFront, Flag, MapPin, Phone, Plane, ShieldCheck, Star, Users, type LucideIcon } from 'lucide-react'
import { companyContact } from '../../data/site-content'
import { cx } from '../../lib/utils'

const HERO_MOBILE_SRC = '/images/hero-airport-mobile.webp'
const HERO_DESKTOP_SRC = '/images/hero-airport-desktop.webp'
const HERO_CALL_DISPLAY = '087 4464766'
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const STATS = [
  { value: '70+', label: 'Golf courses' },
  { value: '24/7', label: 'Irish support' },
  { value: '4.9', label: 'Average rating', icon: Star },
  { value: '1000+', label: 'Groups served' }
] as const

const SERVICES: readonly { readonly icon: LucideIcon; readonly label: string; readonly href: string }[] = [
  { icon: Plane, label: 'Airport Transfers', href: '/services/transport' },
  { icon: Flag, label: 'Golf Courses', href: '/golf-courses' },
  { icon: MapPin, label: 'Accommodation', href: '/accommodation' },
  { icon: CarFront, label: 'Full Packages', href: '/packages' }
]

const fadeUp = (delay: number, reduceMotion: boolean) =>
  reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: EASE, delay }
      }

function asset(publicPath: string): string {
  const path = publicPath.replace(/^\//, '')
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

/** Homepage hero: immersive full-screen with centered content */
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
            'absolute inset-0 h-full w-full object-cover object-[68%_55%]',
            !reduceMotion && 'gsol-hero-drift'
          )}
        />
      </picture>

      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#021a0e]/50 via-[#021a0e]/40 to-[#021a0e]/90" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_20%,rgba(2,26,14,0.7)_100%)]" />

      <div aria-hidden className="ge-fixed-header-spacer relative z-20 w-full shrink-0" style={{ height: 'var(--ge-fixed-header-h)' }} />

      <div className="relative z-10 mx-auto flex w-full max-w-[1340px] flex-col items-center justify-center px-5 pb-16 pt-6 text-center sm:px-8 md:min-h-[calc(100svh-var(--ge-fixed-header-h))] md:pb-20 lg:px-12">
        <m.div
          className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.08] px-5 py-2.5 backdrop-blur-md"
          {...fadeUp(0.04, reduceMotion)}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,184,127,0.6)]" />
          <span className="font-ge text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90">Irish-owned · Costa del Sol golf specialists</span>
        </m.div>

        <h1 id="premium-hero-title" className="mt-8 sm:mt-10">
          <m.span className="block font-ge text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-[3.4rem] md:text-[4.4rem] lg:text-[5.2rem]" {...fadeUp(0.08, reduceMotion)}>
            Costa del Sol
          </m.span>
          <m.span className="mt-1 block font-ge text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-[3.4rem] md:text-[4.4rem] lg:text-[5.2rem]" style={{ color: '#5ef0a0' }} {...fadeUp(0.12, reduceMotion)}>
            golf holidays.
          </m.span>
        </h1>

        <m.p className="mx-auto mt-6 max-w-[42rem] font-ge text-[1.05rem] leading-[1.72] text-white/70 sm:text-[1.2rem] md:text-[1.3rem]" {...fadeUp(0.16, reduceMotion)}>
          Private airport transfers, handpicked courses, and beachfront hotels — one Irish team plans your entire week on the Sol.
        </m.p>

        <m.div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5" {...fadeUp(0.22, reduceMotion)}>
          <a
            href="#enquire"
            data-hero-light
            className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-white px-8 font-ge text-[0.9rem] font-bold tracking-[0.02em] text-[#04291a] shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] sm:h-[56px] sm:text-[0.92rem]"
          >
            Get a free quote
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </a>
          <a
            href={`tel:${companyContact.phoneTel}`}
            aria-label={`Call Golf Sol Ireland on ${HERO_CALL_DISPLAY}`}
            className="inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl border border-white/20 bg-white/[0.06] px-7 font-ge text-[0.9rem] font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/35 hover:bg-white/[0.12] sm:h-[56px]"
          >
            <Phone className="h-4 w-4" aria-hidden strokeWidth={2} />
            {HERO_CALL_DISPLAY}
          </a>
        </m.div>

        {/* Quick service navigation pills */}
        <m.div className="mt-12 flex flex-wrap items-center justify-center gap-3" {...fadeUp(0.32, reduceMotion)}>
          {SERVICES.map((svc) => {
            const Icon = svc.icon
            return (
              <a
                key={svc.label}
                href={svc.href}
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 font-ge text-[0.78rem] font-semibold text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/[0.12] hover:text-white"
              >
                <Icon className="h-3.5 w-3.5 text-emerald-400/80 transition-colors group-hover:text-emerald-300" aria-hidden strokeWidth={2} />
                {svc.label}
              </a>
            )
          })}
        </m.div>

        {/* Stats bar */}
        <m.div
          className="mt-12 grid w-full max-w-[48rem] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md sm:grid-cols-4"
          {...fadeUp(0.4, reduceMotion)}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-4 py-5">
              <span className="flex items-center gap-1.5 font-ge text-[1.5rem] font-extrabold tracking-[-0.02em] text-white sm:text-[1.7rem]">
                {stat.value}
                {'icon' in stat && stat.icon ? <stat.icon className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden strokeWidth={0} /> : null}
              </span>
              <span className="font-ge text-[0.72rem] font-medium uppercase tracking-[0.14em] text-white/50">{stat.label}</span>
            </div>
          ))}
        </m.div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
