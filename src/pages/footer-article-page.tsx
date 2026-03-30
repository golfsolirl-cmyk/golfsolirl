import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Quote } from 'lucide-react'
import { Navbar } from '../components/home/navbar'
import { SiteFooter } from '../components/site-footer'
import { LuxuryButton } from '../components/ui/button'
import { AmbientGolfBall } from '../components/ui/ambient-golf-ball'
import { AnimatedStepKicker } from '../components/ui/section-header'
import { WaveDivider } from '../components/ui/wave-divider'
import { getFooterArticlePage } from '../data/footer-article-pages'
import { footerSocialLinks, heroBackgroundImage, navLinks, primaryActions } from '../data/site-content'
import { cx } from '../lib/utils'
import { CookieBanner, FloatingWhatsAppButton } from './packages'

const sectionShells = [
  'section-shell bg-white pb-28 pt-24',
  'section-shell bg-forest-50 pb-28 pt-24',
  'section-shell bg-sky-muted pb-28 pt-24'
] as const

function FooterArticlePage() {
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(true)
  const [isFooterInView, setIsFooterInView] = useState(false)
  const footerRef = useRef<HTMLElement | null>(null)

  const path = useMemo(() => {
    const p = window.location.pathname.replace(/\/+$/, '')
    return p === '' ? '/' : p
  }, [])

  const page = useMemo(() => getFooterArticlePage(path), [path])
  const whatsAppHref = footerSocialLinks.find((link) => link.label === 'WhatsApp')?.href ?? 'https://www.whatsapp.com/'

  useEffect(() => {
    if (!page) {
      return
    }

    document.title = page.metaTitle
  }, [page])

  useEffect(() => {
    const dismissed = localStorage.getItem('gsol-cookie-banner-dismissed')
    setHasAcceptedCookies(dismissed === 'true')
  }, [])

  useEffect(() => {
    if (!footerRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterInView(entry.isIntersecting)
      },
      { threshold: 0.2 }
    )

    observer.observe(footerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleAcceptCookies = () => {
    localStorage.setItem('gsol-cookie-banner-dismissed', 'true')
    setHasAcceptedCookies(true)
  }

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6 text-center text-forest-900">
        <p className="font-display text-2xl font-bold">Page not found</p>
        <LuxuryButton className="mt-6" href="/">
          Back home
        </LuxuryButton>
      </div>
    )
  }

  return (
    <div className="overflow-x-hidden bg-offwhite">
      <Navbar links={navLinks} primaryCta={primaryActions.planTrip} />
      <FloatingWhatsAppButton hidden={isFooterInView} href={whatsAppHref} />
      <CookieBanner hidden={hasAcceptedCookies} onAccept={handleAcceptCookies} />

      <main>
        <section className="relative min-h-[56vh] overflow-hidden bg-forest-900 px-6 pb-28 pt-36 md:min-h-[60vh] md:pt-40">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroBackgroundImage})` }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-hero-overlay" />
          <div aria-hidden="true" className="absolute inset-0 bg-hero-bottom" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-b from-transparent via-forest-950/40 to-forest-950/75"
          />
          <div aria-hidden="true" className="absolute right-[-100px] top-[-80px] h-72 w-72 rounded-full bg-fairway-500/18 blur-3xl md:h-80 md:w-80" />
          <AmbientGolfBall className="right-[4%] top-[20%] opacity-90 lg:right-[7%]" size="md" tone="hero" variant="hero" />

          <div className="relative z-10 mx-auto max-w-7xl">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
            >
              <AnimatedStepKicker dark kicker={page.kicker} />
              <h1 className="max-w-3xl font-display text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl">
                {page.heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] md:text-lg">
                {page.heroBody}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <LuxuryButton href="/packages" showArrow>
                  View packages
                </LuxuryButton>
                <LuxuryButton href="/#plan-trip" variant="outline">
                  {primaryActions.planTrip}
                </LuxuryButton>
              </div>
            </motion.div>
          </div>

          <WaveDivider fill="#ffffff" />
        </section>

        {page.sections.map((section, index) => (
          <section key={section.title} className={cx(sectionShells[index % sectionShells.length])}>
            <div className="mx-auto max-w-7xl px-6">
              <motion.div
                className="max-w-3xl"
                initial={{ opacity: 0, y: 28 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.25 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <p className="mb-3 font-accent text-base italic tracking-wide text-fairway-600">Golf Sol Ireland</p>
                <h2 className="font-display text-3xl font-bold leading-tight text-forest-900 md:text-4xl">{section.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-forest-900/68 md:text-base">{section.body}</p>
                {section.bullets && section.bullets.length > 0 ? (
                  <ul className="mt-6 space-y-3">
                    {section.bullets.map((line) => (
                      <li key={line} className="flex items-start gap-3 text-sm text-forest-900/72 md:text-base">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-fairway-600" aria-hidden="true" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </motion.div>
            </div>
          </section>
        ))}

        {page.asideQuote ? (
          <section className="section-shell relative overflow-hidden bg-forest-900 pb-28 pt-24 text-white">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(80,163,45,0.2),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(220,88,1,0.14),transparent_40%)]" />
            <div className="relative z-10 mx-auto max-w-7xl px-6">
              <motion.div
                className="mx-auto max-w-3xl text-center"
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Quote className="mx-auto h-10 w-10 text-gold-300/80" aria-hidden="true" />
                <p className="mt-6 font-display text-2xl font-semibold leading-snug text-white md:text-3xl">{page.asideQuote.text}</p>
                <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-white/45">{page.asideQuote.attribution}</p>
              </motion.div>
            </div>
          </section>
        ) : null}

        <section className="section-shell bg-cream pb-28 pt-24">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.65 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-display text-3xl font-bold text-forest-900 md:text-4xl">Ready when you are</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-forest-900/65 md:text-base">
                Tell us your dates and group — we will come back with a sensible next step, usually by email, phone, or WhatsApp.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <LuxuryButton href="/#plan-trip" showArrow>
                  Start your enquiry
                </LuxuryButton>
                <LuxuryButton href="/" variant="white">
                  Back to home
                </LuxuryButton>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter
        copyrightNote="Golf travel planning for Irish groups heading to the Costa del Sol."
        footerRef={footerRef}
        intro="Golf Sol Ireland exists for golfers who want the Costa del Sol done properly: better courses, smarter stays, and a smoother trip from first enquiry to final round."
      />
    </div>
  )
}

export { FooterArticlePage }
