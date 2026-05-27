/**
 * GolfSol Ireland — full-bleed marketing hero: `golfsol.png` + layered gradients.
 * Tuned for a tighter viewport footprint + subtle character (grain, script, vignette).
 */
import type { MouseEvent } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cx } from '../../../lib/utils'
import { contactInfo } from '../data/copy'

const GOLFSOL_HERO_SRC = '/images/himage.webp'

/** Subtle matte grain — avoids flat vector feel without heavy overlays. */
const NOISE_BG =
  `url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")`

const EASE_M: [number, number, number, number] = [0.16, 1, 0.3, 1]

const CHECKS = [
  'Meet & greet at Malaga AGP',
  'Golf-bag friendly Mercedes V-Class',
  'Irish-owned operator support',
  'Pre-booked tee times & resort transfers'
] as const

function assetUrl(publicPath: string): string {
  const path = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

function scrollToDesignPackage(e: MouseEvent<HTMLAnchorElement>) {
  if (typeof document === 'undefined') return
  const el = document.querySelector<HTMLElement>('#design-package')
  if (el) {
    e.preventDefault()
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function MarketingHeroSection() {
  const reduce = useReducedMotion()
  const imgSrc = assetUrl(GOLFSOL_HERO_SRC)

  return (
    <section
      className={cx(
        'relative isolate flex w-full flex-col overflow-hidden border-2 border-[#0b4d3b] bg-[#063b2e] sm:border-[3px]',
        'min-h-[min(72svh,720px)] max-[900px]:min-h-[min(78svh,760px)] min-[901px]:min-h-[min(74svh,780px)]'
      )}
      aria-label="GolfSol Ireland airport transfers hero"
    >
      {/* Warm corner kiss + inner frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_72%_48%_at_0%_0%,rgba(19, 96, 71,0.14),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-2 z-[2] rounded-[2px] ring-1 ring-inset ring-white/[0.06] min-[901px]:inset-[10px]"
      />

      <div className="relative z-30 grid h-[52px] shrink-0 grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0 bg-gradient-to-r from-[#136047] via-[#1e7558] to-[#1e7558] px-[clamp(16px,4vw,64px)] font-ge text-[12px] font-black uppercase tracking-[0.28em] text-white shadow-[0_8px_30px_rgba(0,0,0,0.2)] min-[901px]:h-[62px] min-[901px]:grid-cols-[1fr_auto_3fr] min-[901px]:gap-x-[36px] min-[901px]:text-[clamp(15px,1.65vw,24px)] min-[901px]:tracking-[0.48em] max-[430px]:text-[11px] max-[430px]:tracking-[0.24em]">
        <div className="whitespace-nowrap">MALAGA</div>
        <div className="text-[20px] leading-none tracking-normal min-[901px]:text-[24px]" aria-hidden>
          →
        </div>
        <div className="col-span-2 -mt-2.5 text-[11px] tracking-[0.26em] min-[901px]:col-span-1 min-[901px]:mt-0 min-[901px]:text-[inherit] min-[901px]:tracking-[inherit] max-[430px]:text-[9px] max-[430px]:tracking-[0.2em]">
          COSTA DEL SOL GOLF TRANSFERS
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* Background image + blend layers */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <img
            src={imgSrc}
            alt=""
            decoding="async"
            fetchPriority="high"
            className={cx(
              'absolute inset-0 h-full w-full scale-[1.02] object-cover object-[62%_center] will-change-transform max-[430px]:object-[67%_center]',
              !reduce && 'motion-safe:animate-gsol-hero-drift'
            )}
          />
          <div
            className={cx(
              'absolute inset-0',
              'bg-[linear-gradient(90deg,rgba(4,38,29,0.9)_0%,rgba(4,55,40,0.72)_38%,rgba(4,55,40,0.32)_66%,rgba(4,38,29,0.16)_100%)]',
              'max-[900px]:bg-[linear-gradient(180deg,rgba(4,38,29,0.84),rgba(4,55,40,0.52)_46%,rgba(4,38,29,0.96)_76%)]'
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,55,41,0.12)] via-transparent to-[rgba(3,41,30,0.94)]" />
          <div
            className="absolute inset-0 opacity-[0.55] mix-blend-overlay"
            style={{ backgroundImage: NOISE_BG }}
          />
        </div>

        {/* Main copy + badge */}
        <div className="relative z-[1] grid max-[900px]:grid-cols-1 max-[900px]:px-4 max-[900px]:pb-0 max-[900px]:pt-5 min-[901px]:grid-cols-[minmax(0,1.06fr)_minmax(260px,0.94fr)] min-[901px]:items-start min-[901px]:gap-5 min-[901px]:px-[clamp(20px,3.8vw,52px)] min-[901px]:pt-[clamp(20px,3.4vw,40px)]">
          <m.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_M }}
            className="min-w-0 text-white"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2 min-[901px]:mb-4 min-[901px]:gap-[clamp(10px,1.6vw,22px)]">
              <div
                className={cx(
                  'rounded-full border border-[rgba(19, 96, 71,0.45)] bg-gradient-to-b from-[rgba(0,126,87,0.92)] to-[rgba(11,77,59,0.95)] px-3.5 py-2 font-ge text-[10px] font-black uppercase tracking-[0.2em] text-[#ffffff] shadow-[inset_0_1px_rgba(255,255,255,0.18),0_8px_20px_rgba(0,0,0,0.22)] min-[901px]:px-7 min-[901px]:py-2.5 min-[901px]:text-[clamp(10px,1.05vw,15px)] min-[901px]:tracking-[0.3em]'
                )}
              >
                Malaga Arrivals
              </div>
              <div
                className={cx(
                  'max-[430px]:hidden',
                  'rounded-full border border-[rgba(19, 96, 71,0.45)] bg-gradient-to-b from-[rgba(0,126,87,0.92)] to-[rgba(11,77,59,0.95)] px-3.5 py-2 font-ge text-[10px] font-black uppercase tracking-[0.2em] text-[#ffffff] shadow-[inset_0_1px_rgba(255,255,255,0.18),0_8px_20px_rgba(0,0,0,0.22)] min-[901px]:px-7 min-[901px]:py-2.5 min-[901px]:text-[clamp(10px,1.05vw,15px)] min-[901px]:tracking-[0.3em]'
                )}
              >
                Costa Del Sol Tee-Off
              </div>
              <span
                className="hidden rounded-full border border-dashed border-[#0b4d3b]/50 bg-[#063b2e]/65 px-2.5 py-1 font-ge text-[9px] font-bold uppercase tracking-[0.35em] text-[#e3ebe6] min-[901px]:inline-flex"
                title="Irish-owned"
              >
                ☘ Irish-owned
              </span>
            </div>

            <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-5">
              <div
                className={cx(
                  'inline-flex w-fit rounded-full border border-[rgba(19, 96, 71,0.45)] bg-[#00965a] px-3 py-2 font-ge text-[9px] font-black uppercase tracking-[0.14em] text-[#ffffff] shadow-[0_10px_28px_rgba(0,0,0,0.23)] min-[901px]:px-[30px] min-[901px]:py-[9px] min-[901px]:text-[clamp(10px,1.05vw,15px)] min-[901px]:tracking-[0.24em]'
                )}
              >
                We meet you at the gate · off you go
              </div>
              <p className="font-brand-script max-w-[20rem] text-[clamp(1.08rem,2.8vw,1.52rem)] font-semibold lowercase leading-snug tracking-wide text-[#e3ebe6] [text-wrap:balance] opacity-[0.95] max-[900px]:pl-0.5 min-[901px]:max-w-[22rem]">
                smooth from runway to tee box.
              </p>
            </div>

            <h1
              id="ge-hero-title"
              className={cx(
                'mt-3 font-ge font-black uppercase leading-[0.82] tracking-[0.015em]',
                'text-[clamp(40px,11vw,64px)] min-[431px]:text-[clamp(44px,9vw,72px)] min-[901px]:text-[clamp(48px,5.8vw,88px)]',
                'max-[900px]:mt-4 max-[900px]:max-w-[620px] min-[901px]:mb-6 min-[901px]:mt-3'
              )}
              style={{ textShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
            >
              <span className="block">
                From Plane <span aria-hidden className="inline-block px-1 text-[0.42em] font-light text-[#0b4d3b]/80">
                  ★
                </span>
              </span>
              <span className="block">
                To <span className="bg-gradient-to-r from-[#eef2ef] to-[#0b4d3b] bg-clip-text text-transparent">Fairway.</span>
              </span>
            </h1>

            <p
              className={cx(
                'relative max-w-[42rem] border-l-[3px] border-[#0b4d3b]/50 pl-[18px] font-ge text-[15px] font-semibold leading-[1.5] tracking-[0.03em]',
                'min-[431px]:text-[16px] min-[901px]:text-[clamp(17px,1.35vw,21px)] min-[901px]:font-semibold'
              )}
              style={{ textShadow: '0 4px 18px rgba(0,0,0,0.35)' }}
            >
              Meet-and-greet at Malaga, golf-bag friendly Mercedes transfers, tee times sorted in advance — your crew goes
              from carousel to calm in one tidy move.
            </p>
          </m.div>

          <div className="relative max-[900px]:static min-[901px]:justify-self-end">
            <div
              className={cx(
                'relative mt-5 flex aspect-square w-[80px] items-center justify-center justify-self-end rounded-full border-[6px] border-[#0b4d3b] bg-[#008a62] text-center text-white shadow-[0_0_0_3px_rgba(255,238,119,0.38),0_14px_32px_rgba(0,0,0,0.3)] min-[901px]:mt-4 min-[901px]:mr-4 min-[901px]:w-[clamp(96px,8.5vw,124px)] min-[901px]:border-[8px]',
                'max-[900px]:absolute max-[900px]:right-3 max-[900px]:top-[96px] max-[430px]:top-[92px] max-[430px]:w-[72px]'
              )}
            >
              <div
                className={cx(
                  'pointer-events-none absolute rounded-full border-[3px] border-dotted border-[#0b4d3b]',
                  '-inset-[13px] min-[901px]:-inset-[18px]',
                  !reduce ? 'motion-safe:animate-gsol-badge-orbit' : ''
                )}
                aria-hidden
              />
              <div className="relative z-[1] font-ge font-black">
                <strong className="block text-[26px] leading-[0.8] min-[901px]:text-[clamp(28px,3vw,42px)] max-[430px]:text-[23px]">
                  24/7
                </strong>
                <small className="mt-1.5 block text-[9px] font-black uppercase tracking-[0.2em] text-cream min-[901px]:mt-2 min-[901px]:text-[clamp(10px,0.95vw,14px)]">
                  SERVICE
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom feature strip */}
        <div className="relative z-[1] mt-auto border-t-[3px] border-[#0b4d3b] bg-gradient-to-r from-[rgba(4,62,45,0.96)] to-[rgba(6,77,58,0.91)] px-4 py-6 supports-[padding:max(0px)]:pb-[max(1.35rem,env(safe-area-inset-bottom))] min-[901px]:grid min-[901px]:grid-cols-[1.22fr_0.78fr] min-[901px]:items-center min-[901px]:gap-6 min-[901px]:px-[clamp(20px,3.8vw,52px)] min-[901px]:py-[clamp(20px,3.2vw,40px)]">
          <ul className="grid list-none grid-cols-1 gap-3 p-0 min-[901px]:grid-cols-2 min-[901px]:gap-x-10 min-[901px]:gap-y-3">
            {CHECKS.map((line) => (
              <li
                key={line}
                className="flex items-center gap-3 font-ge text-[15px] font-black leading-snug text-white min-[901px]:text-[clamp(14px,1.25vw,19px)] min-[901px]:whitespace-nowrap"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#19d36f] text-[#063b2e] min-[901px]:size-10 min-[901px]:text-xl"
                  aria-hidden
                >
                  <Check className="size-4 min-[901px]:size-[1.125rem]" strokeWidth={3.5} />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col items-stretch text-center min-[901px]:mt-0 min-[901px]:items-end min-[901px]:justify-self-end">
            <m.a
              href="#design-package"
              onClick={scrollToDesignPackage}
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ duration: 0.25 }}
              className={cx(
                'inline-flex h-14 w-full min-w-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#136047] via-[#0b4d3b] to-[#136047] px-5 font-ge text-[clamp(17px,4.2vw,22px)] font-black uppercase tracking-[0.14em] text-white no-underline shadow-[0_14px_34px_rgba(0,0,0,0.28),inset_0_1px_rgba(255,255,255,0.55)] transition-[filter] hover:saturate-110 min-[901px]:h-[60px] min-[901px]:min-w-[min(312px,86vw)] min-[901px]:w-auto min-[901px]:text-[clamp(18px,1.85vw,26px)] min-[901px]:tracking-[0.2em]'
              )}
            >
              Book now
            </m.a>
            <a
              href={`tel:${contactInfo.phoneTel}`}
              className="mt-3 font-ge text-[15px] font-black uppercase tracking-[0.14em] text-[#eef2ef] min-[901px]:mt-3 min-[901px]:text-[clamp(15px,1.55vw,22px)] min-[901px]:tracking-[0.2em]"
            >
              CALL {contactInfo.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <m.a
        href="#design-package"
        onClick={scrollToDesignPackage}
        aria-label="Scroll to design your package"
        className="pointer-events-auto absolute bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] left-1/2 z-40 inline-flex size-10 -translate-x-1/2 items-center justify-center rounded-full border border-[#0b4d3b]/40 bg-[#063b2e]/88 text-[#eef2ef] shadow-[0_10px_24px_rgba(0,0,0,0.32)] min-[901px]:bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:size-11"
        whileHover={reduce ? undefined : { scale: 1.06 }}
        animate={reduce ? undefined : { y: [0, 5, 0] }}
        transition={reduce ? undefined : { y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <ChevronDown className="h-4 w-4 min-[901px]:h-[1.125rem] min-[901px]:w-[1.125rem]" aria-hidden />
      </m.a>
    </section>
  )
}
