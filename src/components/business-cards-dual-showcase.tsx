/**
 * Golf Sol Ireland — two premium business cards (portrait + landscape).
 * Homepage brand: forest green, cream, gold chrome, fleet photography.
 */
import { useCallback, useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { FileDown, ImageDown, Mail, Phone, RotateCcw, Sparkles } from 'lucide-react'
import { CARD_LH, CARD_LW, CARD_PH, CARD_PW } from './business-cards/brand-card-shared'
import { LandscapeBrandCardFace } from './business-cards/landscape-brand-card'
import { PortraitBrandCardFace } from './business-cards/portrait-brand-card'
import type { BusinessCardSpec } from '../lib/business-cards-catalog-types'
import { businessCardContact } from '../lib/business-cards-config'
import { BRAND_BUSINESS_CARD_HERO_BG_SRC } from '../lib/brand-visual-assets'
import { cx } from '../lib/utils'

export type DualCardKey = 'landscape' | 'portrait'

const DUAL_CARD_EXPORT_IDS = {
  portraitFront: 'gsol-portrait-front',
  portraitBack: 'gsol-portrait-back',
  landscapeFront: 'gsol-landscape-front',
  landscapeBack: 'gsol-landscape-back'
} as const

const DUAL_BUSINESS_CARD_SPECS: readonly BusinessCardSpec[] = [
  {
    id: DUAL_CARD_EXPORT_IDS.portraitFront,
    title: 'Portrait · Front',
    subtitle: 'Vertical membership — fleet hero, crest, QR & badges',
    orientation: 'portrait',
    side: 'front',
    imageSrc: BRAND_BUSINESS_CARD_HERO_BG_SRC,
    width: CARD_PW,
    height: CARD_PH,
    render: (mode = 'preview') => <PortraitBrandCardFace mode={mode} side="front" />
  },
  {
    id: DUAL_CARD_EXPORT_IDS.portraitBack,
    title: 'Portrait · Back',
    subtitle: 'Forest prestige — services, QR & contact',
    orientation: 'portrait',
    side: 'back',
    imageSrc: BRAND_BUSINESS_CARD_HERO_BG_SRC,
    width: CARD_PW,
    height: CARD_PH,
    render: (mode = 'preview') => <PortraitBrandCardFace mode={mode} side="back" />
  },
  {
    id: DUAL_CARD_EXPORT_IDS.landscapeFront,
    title: 'Landscape · Front',
    subtitle: 'Split concierge — brand panel & fleet QR',
    orientation: 'landscape',
    side: 'front',
    imageSrc: BRAND_BUSINESS_CARD_HERO_BG_SRC,
    width: CARD_LW,
    height: CARD_LH,
    render: (mode = 'preview') => <LandscapeBrandCardFace mode={mode} side="front" />
  },
  {
    id: DUAL_CARD_EXPORT_IDS.landscapeBack,
    title: 'Landscape · Back',
    subtitle: 'Cream desk card — contact grid & QR',
    orientation: 'landscape',
    side: 'back',
    imageSrc: BRAND_BUSINESS_CARD_HERO_BG_SRC,
    width: CARD_LW,
    height: CARD_LH,
    render: (mode = 'preview') => <LandscapeBrandCardFace mode={mode} side="back" />
  }
]

function dualSpecFor(key: DualCardKey, side: 'back' | 'front'): BusinessCardSpec {
  const id =
    key === 'portrait'
      ? side === 'front'
        ? DUAL_CARD_EXPORT_IDS.portraitFront
        : DUAL_CARD_EXPORT_IDS.portraitBack
      : side === 'front'
        ? DUAL_CARD_EXPORT_IDS.landscapeFront
        : DUAL_CARD_EXPORT_IDS.landscapeBack
  const spec = DUAL_BUSINESS_CARD_SPECS.find((s) => s.id === id)
  if (!spec) throw new Error(`Missing dual card spec: ${id}`)
  return spec
}

const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
const HERO_BG = `${base}${BRAND_BUSINESS_CARD_HERO_BG_SRC.replace(/^\//, '')}`

function CardPanel({
  cardKey,
  label,
  description
}: {
  readonly cardKey: DualCardKey
  readonly label: string
  readonly description: string
}) {
  const [side, setSide] = useState<'back' | 'front'>('front')
  const [busy, setBusy] = useState<'pdf' | 'png' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const exportCard = useCallback(
    async (format: 'pdf' | 'png') => {
      const spec = dualSpecFor(cardKey, side)
      const root = document.getElementById('business-cards-pdf-export-root')
      const slide = root?.querySelector<HTMLElement>(`[data-pdf-card-id="${CSS.escape(spec.id)}"]`)
      if (!slide) {
        setError('Export unavailable — refresh and try again.')
        return
      }
      setError(null)
      setBusy(format)
      try {
        if (format === 'pdf') {
          const { saveSingleBusinessCardPdf } = await import('../lib/save-business-cards-pdf')
          await saveSingleBusinessCardPdf(slide, `golfsol-${cardKey}-${side}`)
        } else {
          const { saveSingleBusinessCardPng } = await import('../lib/save-business-cards-pdf')
          await saveSingleBusinessCardPng(slide, `golfsol-${cardKey}-${side}`)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Export failed.')
      } finally {
        setBusy(null)
      }
    },
    [cardKey, side]
  )

  return (
    <article className="rounded-[2rem] border border-white/10 bg-[#062016]/80 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.28em] text-[#d9be7a]">
            {cardKey === 'portrait' ? '55 × 85 mm · Portrait' : '85 × 55 mm · Landscape'}
          </p>
          <h3 className="mt-2 font-ge-display text-2xl font-semibold text-white sm:text-3xl">{label}</h3>
          <p className="mt-2 max-w-md font-ge text-sm font-medium leading-relaxed text-[#eef2ef]/80">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2" data-html2canvas-ignore>
          <button
            type="button"
            onClick={() => setSide((s) => (s === 'front' ? 'back' : 'front'))}
            className="inline-flex items-center gap-2 rounded-full border border-[#d9be7a]/35 bg-[#0b4d3b]/40 px-4 py-2.5 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#f7f4ec] transition hover:bg-[#136047]/50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {side === 'front' ? 'View back' : 'View front'}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void exportCard('pdf')}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0b4d3b] to-[#136047] px-4 py-2.5 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_12px_32px_rgba(19,96,71,0.35)] disabled:opacity-60"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            {busy === 'pdf' ? 'Building…' : 'PDF'}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void exportCard('png')}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-white disabled:opacity-60"
          >
            <ImageDown className="h-4 w-4" aria-hidden />
            {busy === 'png' ? 'Saving…' : 'PNG'}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-3 font-ge text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex justify-center [perspective:1200px]">
        <AnimatePresence mode="wait">
          <m.div
            key={`${cardKey}-${side}`}
            initial={{ opacity: 0, rotateY: side === 'back' ? -14 : 14, scale: 0.96 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: side === 'back' ? 14 : -14, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {cardKey === 'portrait' ? (
              <PortraitBrandCardFace mode="preview" side={side} />
            ) : (
              <LandscapeBrandCardFace mode="preview" side={side} />
            )}
          </m.div>
        </AnimatePresence>
      </div>

      <p className="mt-4 text-center font-ge text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#d9be7a]/70">
        Showing {side}
      </p>
    </article>
  )
}

export function BusinessCardsDualShowcase() {
  const [exportReady, setExportReady] = useState(false)

  useEffect(() => {
    document.title = 'Business Cards | Golf Sol Ireland'
  }, [])

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setExportReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  return (
    <>
      {/* Hero */}
      <section
        className="relative isolate overflow-hidden bg-forest-950"
        aria-labelledby="bc-dual-hero-title"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%'
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#04140c]/90 via-[#062016]/75 to-[#04140c]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[10%] top-0 h-[50%] w-[60%] rounded-full bg-gradient-to-br from-[#136047]/20 to-transparent blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
          <p className="font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.32em] text-[#d9be7a]">
            Print-ready · Homepage brand
          </p>
          <h1
            id="bc-dual-hero-title"
            className="mt-4 max-w-3xl font-ge-display text-[2.2rem] font-semibold leading-[1.02] text-[#f7f4ec] sm:text-5xl lg:text-[3.4rem]"
          >
            Two cards. One premium story.
          </h1>
          <p className="mt-5 max-w-2xl font-ge text-base font-medium leading-relaxed text-[#eef2ef]/85 sm:text-lg">
            Portrait and landscape layouts built from the same Golf Sol Ireland identity — forest green, cream,
            gold chrome, Mercedes fleet photography, and a scannable QR to{' '}
            <span className="text-[#d9be7a]">{businessCardContact.websiteDisplay}</span>.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {['Portrait 55×85', 'Landscape 85×55', 'QR booking', 'PDF export'].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#d9be7a]/30 bg-[#0b4d3b]/35 px-4 py-2 font-ge text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#f7f4ec]"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={`mailto:${businessCardContact.email}`}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-[#0b4d3b] to-[#136047] px-6 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_14px_40px_rgba(19,96,71,0.4)]"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {businessCardContact.email}
            </a>
            <a
              href={`tel:${businessCardContact.phoneIe.replace(/\s/g, '')}`}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#d9be7a]/35 px-6 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[#f7f4ec]"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {businessCardContact.phoneIe}
            </a>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-gradient-to-b from-[#04140c] to-[#062016] py-16 sm:py-24" aria-label="Business card designs">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-12">
          <CardPanel
            cardKey="portrait"
            label="Portrait card"
            description="Vertical membership feel — aerial fleet hero, centred crest, large gold type, QR and trust badges. Ideal for hand-offs and wallet carry."
          />
          <CardPanel
            cardKey="landscape"
            label="Landscape card"
            description="Split concierge layout — forest brand panel with Málaga ribbon, fleet photo with QR, cream back with full contact grid. Classic desk-drop format."
          />
        </div>
      </section>

      {/* Print spec + mobile preview */}
      <section className="border-t border-[#136047]/20 bg-[#f7f4ec] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.28em] text-[#136047]">
                Print specifications
              </p>
              <h2 className="mt-2 font-ge-display text-3xl font-semibold text-[#062016]">Press-ready details</h2>
              <ul className="mt-6 space-y-3 font-ge text-sm font-semibold leading-relaxed text-[#425047]">
                <li>Standard ISO business card — 85 × 55 mm (landscape) or 55 × 85 mm (portrait)</li>
                <li>Add 3 mm bleed; keep type inside 5 mm safe zone</li>
                <li>Export PDF at 300 DPI via the buttons above</li>
                <li>QR links to {businessCardContact.websiteUrl} with crest centre mark</li>
                <li>Colours: forest #0b4d3b · cream #f7f4ec · gold #d9be7a</li>
              </ul>
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#136047]/15 bg-white p-5 shadow-brand-card">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#136047]" aria-hidden />
                <p className="font-ge text-sm leading-relaxed text-[#425047]">
                  For foil, spot UV, or embossed crest on press — supply the exported PDF and reference the gold
                  gradient areas on the portrait front and landscape header band.
                </p>
              </div>
            </div>

            <div>
              <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.28em] text-[#136047]">
                Mobile preview
              </p>
              <h2 className="mt-2 font-ge-display text-3xl font-semibold text-[#062016]">Tap to contact</h2>
              <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#136047]/15 bg-[#062016] p-4 shadow-[0_24px_60px_rgba(6,32,22,0.25)] sm:p-6">
                <div className="mx-auto max-w-[280px] rounded-[1.75rem] border border-white/10 bg-[#04140c] p-3">
                  <PortraitBrandCardFace mode="preview" side="front" />
                  <div className="mt-4 flex flex-col gap-2">
                    <a
                      href={`mailto:${businessCardContact.email}`}
                      className="flex min-h-[44px] items-center justify-center rounded-xl bg-[#136047] font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-white"
                    >
                      Email us
                    </a>
                    <a
                      href={businessCardContact.websiteUrl}
                      className="flex min-h-[44px] items-center justify-center rounded-xl border border-[#d9be7a]/40 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-[#d9be7a]"
                    >
                      Visit website
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hidden PDF export root — mounted after first paint so dev HMR stays stable */}
      {exportReady ? (
        <div className="fixed -left-[9999px] top-0 w-[920px]" id="business-cards-pdf-export-root" data-keep-color>
          {DUAL_BUSINESS_CARD_SPECS.map((spec) => (
            <div
              key={spec.id}
              className={cx(spec.orientation === 'landscape' ? 'w-[850px]' : 'w-[550px]')}
              data-pdf-card-id={spec.id}
              data-pdf-page
            >
              {spec.render('pdf')}
            </div>
          ))}
        </div>
      ) : null}
    </>
  )
}
