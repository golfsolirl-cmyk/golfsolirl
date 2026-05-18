/**
 * Premium marketing hero — GolfSol Ireland (luxury transfers + Costa del Sol golf travel).
 *
 * **WebP / image swap:** set `fleetImageSrc` to e.g. `/images/your-hero.webp` (place file in `public/images/`).
 * For `<picture>`, extend this component with `<source type="image/webp" />` + PNG fallback — pattern matches Vite static assets under `public/`.
 */
import type { MouseEvent } from 'react'
import { m, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowUpRight, ShieldCheck, Plane, UsersRound } from 'lucide-react'
import { cx } from '../lib/utils'

/** Respects Vite `base` when loading files from `public/`. */
function publicAsset(absolutePublicPath: string): string {
  const path = absolutePublicPath.startsWith('/') ? absolutePublicPath.slice(1) : absolutePublicPath
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

function scrollToHash(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (typeof document === 'undefined' || !href.startsWith('#')) return
  const id = href.slice(1)
  const el = document.getElementById(id)
  if (el) {
    event.preventDefault()
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 }
  }
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: EASE }
  }
}

export interface GolfSolHeroProps {
  readonly className?: string
  /** Primary headline (first line, cream / white). */
  readonly headlineLine1?: string
  /** Accent word(s) — rendered in mustard gold. */
  readonly headlineAccent?: string
  /** Second headline line (forest on cream band on large screens). */
  readonly headlineLine2?: string
  readonly subheading?: string
  /** Default: brand fleet / fairway plate (`public/images/golfsol.png`). */
  readonly fleetImageSrc?: string
  readonly fleetImageAlt?: string
  readonly bookHref?: string
  readonly servicesHref?: string
  readonly bookLabel?: string
  readonly servicesLabel?: string
}

const TRUST = [
  { Icon: ShieldCheck, label: 'Fully insured transfers' },
  { Icon: Plane, label: 'Málaga airport specialists' },
  { Icon: UsersRound, label: 'Golf groups welcome' }
] as const

const DEFAULT_SUB =
  'Private Málaga airport transfers, golf-bag ready Mercedes fleet, hand-picked accommodation and tee times — Irish-owned specialists for the Costa del Sol corridor.'

export function GolfSolHero({
  className,
  headlineLine1 = 'Costa del Sol',
  headlineAccent = 'Golf Travel',
  headlineLine2 = 'From Touchdown.',
  subheading = DEFAULT_SUB,
  fleetImageSrc = '/images/himage.png',
  fleetImageAlt = 'Mercedes executive cars and vans on a sunlit Costa del Sol golf course — GolfSol Ireland luxury transfer fleet.',
  bookHref = '#design-package',
  servicesHref = '/services/transport',
  bookLabel = 'Book your transfer',
  servicesLabel = 'View services'
}: GolfSolHeroProps) {
  const reduce = useReducedMotion()
  const img = publicAsset(fleetImageSrc)

  return (
    <div className={cx('relative isolate w-full overflow-hidden bg-[#08120d]', className)}>
      {/* Layered backdrop — restrained, cinematic (no neon gradients). */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <m.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_12%_-10%,rgba(19, 96, 71,0.09),transparent_52%),radial-gradient(ellipse_70%_60%_at_90%_20%,rgba(11,107,69,0.22),transparent_56%)]"
          animate={
            reduce
              ? undefined
              : {
                  opacity: [0.85, 1, 0.85],
                  scale: [1, 1.02, 1]
                }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: 22,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
          }
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08120d]/30 via-transparent to-[#08120d]/95" />
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%20opacity%3D%220.08%22%2F%3E%3C%2Fsvg%3E')]"
        />
      </div>

      <div className="relative z-[1] mx-auto w-full max-w-[1440px] px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12 md:px-10 md:pb-24 md:pt-14 lg:px-12 lg:pb-28 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-16 xl:gap-20">
          <m.div
            className="min-w-0 text-white"
            variants={container}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? undefined : 'show'}
          >
            <m.p
              variants={fadeUp}
              className="font-ge text-[0.7rem] font-black uppercase tracking-[0.38em] text-[#136047]/90 sm:text-xs sm:tracking-[0.44em]"
            >
              GolfSol Ireland
            </m.p>

            <m.h1
              id="ge-hero-title"
              variants={fadeUp}
              className="mt-5 font-ge text-[clamp(2.35rem,6.4vw,4.75rem)] font-black uppercase leading-[0.95] tracking-[-0.02em] text-[#f7f9f5] [text-wrap:balance] sm:mt-6 md:leading-[0.92]"
            >
              <span className="block">{headlineLine1}</span>
              <span className="mt-1 block text-[#136047] sm:mt-1.5">{headlineAccent}</span>
              <span className="mt-3 block max-w-[18ch] rounded-sm bg-[#f4f7f5] px-3 py-2 text-[clamp(1.65rem,4.2vw,3.1rem)] font-black uppercase leading-none tracking-[-0.03em] text-[#08120d] shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:mt-4 sm:inline-block sm:px-4 sm:py-2.5">
                {headlineLine2}
              </span>
            </m.h1>

            <m.p
              variants={fadeUp}
              className="mt-7 max-w-[38rem] font-ge text-base font-semibold leading-relaxed tracking-wide text-[#e8f0ea] sm:mt-8 sm:text-lg md:text-xl md:leading-[1.65]"
            >
              {subheading}
            </m.p>

            <m.ul
              variants={fadeUp}
              className="mt-8 flex list-none flex-col gap-3 p-0 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-4"
            >
              {TRUST.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-full border border-white/10 bg-[#08120d]/55 py-2.5 pl-3 pr-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#136047]/15 text-[#136047] ring-1 ring-[#136047]/35">
                    <Icon className="size-5" strokeWidth={2.4} aria-hidden />
                  </span>
                  <span className="font-ge text-xs font-bold uppercase tracking-[0.12em] text-[#f4f7f5] sm:text-[0.8rem] sm:tracking-[0.15em]">
                    {label}
                  </span>
                </li>
              ))}
            </m.ul>

            <m.div
              variants={fadeUp}
              className="mt-10 flex w-full max-w-xl flex-col gap-4 sm:mt-11 sm:flex-row sm:items-center sm:gap-5"
            >
              <m.a
                href={bookHref}
                onClick={(e) => scrollToHash(e, bookHref)}
                whileHover={reduce ? undefined : { scale: 1.02, y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                className={cx(
                  'inline-flex min-h-[3.5rem] flex-1 items-center justify-center gap-2 rounded-full px-8 font-ge text-[0.9rem] font-black uppercase tracking-[0.18em] sm:text-base sm:tracking-[0.2em]',
                  'bg-[#136047] text-[#08120d] shadow-[0_18px_44px_rgba(19, 96, 71,0.22),inset_0_1px_0_rgba(255,255,255,0.55)]',
                  'transition-[box-shadow] hover:shadow-[0_22px_52px_rgba(19, 96, 71,0.3),inset_0_1px_0_rgba(255,255,255,0.6)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136047] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08120d]'
                )}
              >
                {bookLabel}
                <ArrowUpRight className="size-4 shrink-0" strokeWidth={2.6} aria-hidden />
              </m.a>
              <m.a
                href={servicesHref}
                whileHover={reduce ? undefined : { scale: 1.02, y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                className={cx(
                  'inline-flex min-h-[3.5rem] flex-1 items-center justify-center rounded-full border-2 border-[#136047]/55 bg-transparent px-8 font-ge text-[0.9rem] font-black uppercase tracking-[0.18em] sm:text-base sm:tracking-[0.2em]',
                  'text-[#f7f9f5] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
                  'transition-[background-color,border-color] hover:border-[#136047] hover:bg-[#08120d]/80',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136047] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08120d]'
                )}
              >
                {servicesLabel}
              </m.a>
            </m.div>
          </m.div>

          {/* Fleet visual — floating card */}
          <m.div
            className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: reduce ? 0 : 0.12 }}
          >
            <m.div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-[#136047]/25 bg-[#08120d] shadow-[0_40px_90px_rgba(0,0,0,0.45)] sm:aspect-[5/6] sm:rounded-[2.25rem] lg:aspect-[4/5]"
              animate={
                reduce
                  ? undefined
                  : {
                      y: [0, -8, 0]
                    }
              }
              transition={
                reduce
                  ? undefined
                  : {
                      duration: 7,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }
              }
            >
              <img
                src={img}
                alt={fleetImageAlt}
                decoding="async"
                fetchPriority="high"
                className="h-full w-full object-cover object-[58%_42%] sm:object-[55%_36%]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08120d]/90 via-[#08120d]/15 to-transparent sm:via-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
              />
              <p className="pointer-events-none absolute bottom-6 left-6 right-6 font-ge text-[0.65rem] font-black uppercase leading-relaxed tracking-[0.32em] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)] sm:bottom-7 sm:left-8 sm:right-8 sm:text-xs sm:tracking-[0.38em]">
                Mercedes fleet · Golf bags · Irish crew
              </p>
            </m.div>

            {/* Deck accent */}
            <div
              aria-hidden
              className="absolute top-[9%] -right-4 -z-10 hidden h-[82%] w-[92%] rounded-[2rem] border border-[#08120d] bg-[#08120d]/40 lg:block"
            />
          </m.div>
        </div>
      </div>
    </div>
  )
}
