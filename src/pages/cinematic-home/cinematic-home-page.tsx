import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from 'framer-motion'
import './cinematic-home.css'
import { CinematicShellNav } from './components/cinematic-shell-nav'
import { CinematicHero } from './components/cinematic-hero'
import { CinematicTopicSections } from './components/cinematic-topic-sections'
import { CinematicFooter } from './components/cinematic-footer'
import { m } from 'framer-motion'

const PREV_TITLE = typeof document !== 'undefined' ? document.title : ''

export function CinematicHomePage() {
  const reduceMotion = useReducedMotion()
  const rafRef = useRef<number>(0)

  useEffect(() => {
    document.title = 'Cinematic preview | GolfSol Ireland'
    return () => {
      document.title = PREV_TITLE || 'Golf Sol Ireland'
    }
  }, [])

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = 'https://images.unsplash.com'
    link.crossOrigin = ''
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  useEffect(() => {
    if (reduceMotion) return

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.8
    })

    const raf = (time: number) => {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafRef.current)
      lenis.destroy()
    }
  }, [reduceMotion])

  const motionOff = Boolean(reduceMotion)

  return (
    <div className="cinematic-root min-h-screen overflow-x-hidden bg-forest-950 text-offwhite antialiased">
      <a
        href="#cin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:uppercase focus:tracking-wide focus:text-white"
      >
        Skip to content
      </a>
      <CinematicShellNav />
      <main id="cin-main">
        <CinematicHero reduceMotion={motionOff} />
        <CinematicTopicSections />
        <section
          id="quote"
          className="relative scroll-mt-24 px-4 py-20 sm:px-8 sm:py-28"
          aria-labelledby="cin-cta-title"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-950 via-forest-900/80 to-forest-950" aria-hidden />
          <div className="relative z-10 mx-auto max-w-[720px] text-center">
            <h2 id="cin-cta-title" className="cin-display text-3xl text-cream sm:text-4xl md:text-5xl">
              Your golf trip begins the moment you arrive.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-cream/75 sm:text-lg">
              Tell us your dates, your group, and how you like to play — we will shape transfers, rounds, and stays
              into one coherent week.
            </p>
            <m.a
              href="/packages"
              className="mt-10 inline-flex min-h-[56px] min-w-[200px] items-center justify-center rounded-full bg-gradient-to-r from-brand-800 to-brand-200 px-10 text-[0.82rem] font-bold uppercase tracking-[0.18em] text-white shadow-gs-green"
              whileHover={motionOff ? undefined : { scale: 1.03, boxShadow: '0 14px 48px rgba(19, 96, 71,0.5)' }}
              whileTap={motionOff ? undefined : { scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            >
              Get a quote
            </m.a>
          </div>
        </section>
        <CinematicFooter />
      </main>
    </div>
  )
}
