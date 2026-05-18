import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { m, useScroll, useTransform } from 'framer-motion'
import { CinematicRemoteImage } from './cinematic-remote-image'
import { CINEMATIC_REMOTE } from '../cinematic-assets'
import { BrandLogoPicture } from '../../../components/brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../../../lib/brand-logo-assets'

export function CinematicHero({ reduceMotion }: { readonly reduceMotion: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const sweepRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  })

  const yDeep = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 100])
  const yFog = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 48])
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 1.06])

  useEffect(() => {
    if (reduceMotion || !sweepRef.current) return
    const el = sweepRef.current
    gsap.set(el, { xPercent: -140 })
    const tween = gsap.to(el, {
      xPercent: 140,
      duration: 11,
      ease: 'none',
      repeat: -1,
      repeatDelay: 3
    })
    return () => {
      tween.kill()
    }
  }, [reduceMotion])

  const desk = CINEMATIC_REMOTE.heroDesktop
  const mob = CINEMATIC_REMOTE.heroMobile

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[100dvh] overflow-hidden bg-forest-950"
      aria-labelledby="cin-hero-title"
    >
      <m.div className="absolute inset-0 will-change-transform" style={{ scale: scaleBg, y: yDeep }}>
        <div className="absolute inset-0 sm:hidden" aria-hidden>
          <CinematicRemoteImage
            remoteSrc={mob.src}
            fallbackSrc={mob.fallback}
            alt=""
            role="presentation"
            className="h-full min-h-[100dvh] w-full object-cover object-[52%_42%] brightness-[0.68] contrast-[1.12] saturate-[1.14]"
            fetchPriority="high"
            decoding="async"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 hidden sm:block" aria-hidden>
          <CinematicRemoteImage
            remoteSrc={desk.src}
            fallbackSrc={desk.fallback}
            alt=""
            role="presentation"
            className="h-full min-h-[100dvh] w-full object-cover brightness-[0.7] contrast-[1.1] saturate-[1.12]"
            fetchPriority="high"
            decoding="async"
            loading="eager"
          />
        </div>
      </m.div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-950/50 via-forest-950/25 to-forest-950/92"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-950/45 to-transparent sm:from-forest-950/[0.88] sm:via-forest-950/35"
        aria-hidden
      />

      <m.div
        className="cin-fog-layer pointer-events-none absolute -left-[10%] top-0 h-[55%] w-[70%] rounded-full bg-gradient-to-br from-cream/25 via-brand-600/10 to-transparent blur-3xl"
        style={{ y: yFog }}
        aria-hidden
      />
      <m.div
        className="cin-fog-layer--slow pointer-events-none absolute -right-[5%] bottom-[10%] h-[45%] w-[60%] rounded-full bg-gradient-to-tl from-gs-dark/40 via-forest-800/30 to-transparent blur-[80px]"
        style={{ y: yFog }}
        aria-hidden
      />

      <div className="cin-vignette" aria-hidden />
      <div className="cin-grain" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col justify-end px-4 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 md:justify-center md:pb-24">
        <div className="relative mb-8 max-w-xl md:mb-10">
          <div ref={sweepRef} className="cin-light-sweep rounded-full" aria-hidden />
          <div className="relative">
            <BrandLogoPicture
              alt="GolfSol Ireland — luxury golf travel for Irish golfers"
              width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
              height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
              decoding="async"
              fetchPriority="high"
              className="cin-logo-rim h-auto w-full max-w-[200px] select-none object-contain sm:max-w-[240px] md:max-w-[280px]"
            />
          </div>
        </div>

        <m.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-silver-200/90 sm:text-[0.72rem]">
            Costa del Sol · Málaga
          </p>
          <h1
            id="cin-hero-title"
            className="cin-display max-w-[18ch] text-[2.35rem] leading-[0.98] text-cream sm:max-w-[20ch] sm:text-5xl md:text-6xl lg:text-[4.25rem]"
          >
            From Dublin to the fairways of the Costa del Sol.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg md:text-xl">
            Land in Málaga. Private Mercedes transfers, hand-picked courses, and Irish coordinators who treat your
            week like their own — so the trip starts the moment you touch down.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <m.a
              href="/packages"
              className="inline-flex min-h-[52px] min-w-[160px] items-center justify-center rounded-full bg-gradient-to-r from-brand-800 to-brand-200 px-8 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-white shadow-gs-green"
              whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(19, 96, 71,0.45)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            >
              Build your trip
            </m.a>
            <a
              href="#cin-story"
              className="inline-flex min-h-[52px] items-center text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-cream/80 underline-offset-8 transition-colors hover:text-silver-200"
            >
              The experience
            </a>
          </div>
        </m.div>
      </div>
    </section>
  )
}
