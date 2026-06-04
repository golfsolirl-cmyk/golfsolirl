/**
 * Golf Sol Ireland — luxury business card launch showcase page.
 */
import { useCallback, useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileDown,
  Mail,
  Phone,
  QrCode,
  RotateCcw,
  Sparkles,
  Globe,
  Printer
} from 'lucide-react'
import { PremiumCardFace } from './business-cards-premium-card'
import { BusinessCardsCatalog, PREMIUM_COMPANY_EXPORT_IDS } from './business-cards-catalog'
import { BC_CARD_LH, BC_CARD_LW, BC_PREMIUM, BC_PRINT_SPEC } from '../lib/business-cards-premium-tokens'
import { BRAND_BUSINESS_CARD_HERO_BG_SRC } from '../lib/brand-visual-assets'
import { cx } from '../lib/utils'

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  dark = false
}: {
  readonly id: string
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly children: React.ReactNode
  readonly dark?: boolean
}) {
  return (
    <section
      id={id}
      className={cx(
        'scroll-mt-24 py-16 sm:py-24',
        dark ? 'bg-[#081A12] text-[#F7F3EA]' : 'bg-[#F7F3EA] text-[#081A12]'
      )}
    >
      <div className="mx-auto max-w-6xl px-5">
        <p
          className={cx(
            'font-bc-body text-[0.68rem] font-bold uppercase tracking-[0.28em]',
            dark ? 'text-[#C8A75D]' : 'text-[#0F3D2E]'
          )}
        >
          {eyebrow}
        </p>
        <h2
          className={cx(
            'mt-3 font-bc-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem]',
            dark ? 'text-[#F7F3EA]' : 'text-[#081A12]'
          )}
        >
          {title}
        </h2>
        <p
          className={cx(
            'mt-4 max-w-2xl font-bc-body text-base leading-relaxed sm:text-lg',
            dark ? 'text-[#F7F3EA]/80' : 'text-[#081A12]/70'
          )}
        >
          {description}
        </p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}

function MockupTile({
  label,
  children
}: {
  readonly label: string
  readonly children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#C8A75D]/20 bg-[#0F3D2E] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="relative aspect-[4/3] overflow-hidden">{children}</div>
      <p className="border-t border-[#C8A75D]/15 px-4 py-3 text-center font-bc-body text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#C8A75D]">
        {label}
      </p>
    </div>
  )
}

export function BusinessCardsLuxuryShowcase() {
  const [previewSide, setPreviewSide] = useState<'back' | 'front'>('front')
  const [exportBusy, setExportBusy] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Business Cards | Golf Sol Ireland'
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.bunny.net/css?family=playfair-display:600,700,800|inter:400,500,600,700,800&display=swap'
    link.id = 'bc-premium-fonts'
    if (!document.getElementById('bc-premium-fonts')) {
      document.head.appendChild(link)
    }
    return () => {
      document.title = 'Golf Sol Ireland'
    }
  }, [])

  const exportCard = useCallback(async (side: 'back' | 'front', format: 'pdf' | 'png') => {
    const root = document.getElementById('business-cards-pdf-export-root')
    const id = side === 'front' ? PREMIUM_COMPANY_EXPORT_IDS.front : PREMIUM_COMPANY_EXPORT_IDS.back
    const slide = root?.querySelector<HTMLElement>(`[data-pdf-card-id="${id}"]`)
    if (!slide) {
      setExportError('Export failed — refresh and try again.')
      return
    }
    setExportError(null)
    setExportBusy(`${format}-${side}`)
    try {
      if (format === 'pdf') {
        const { saveSingleBusinessCardPdf } = await import('../lib/save-business-cards-pdf')
        await saveSingleBusinessCardPdf(slide, `golfsol-premium-business-card-${side}`)
      } else {
        const { saveSingleBusinessCardPng } = await import('../lib/save-business-cards-pdf')
        await saveSingleBusinessCardPng(slide, `golfsol-premium-business-card-${side}`)
      }
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Export failed.')
    } finally {
      setExportBusy(null)
    }
  }, [])

  const cardPreview = (
    <PremiumCardFace mode="preview" side={previewSide} />
  )

  return (
    <>
      {/* —— Hero —— */}
      <section
        className="relative isolate overflow-hidden bg-[#081A12] py-20 sm:py-28"
        aria-labelledby="bc-luxury-hero-title"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${BRAND_BUSINESS_CARD_HERO_BG_SRC})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            filter: 'blur(8px) brightness(0.4)'
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#081A12]/80 via-[#0F3D2E]/90 to-[#081A12]" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 text-center">
          <p className="font-bc-body text-[0.7rem] font-bold uppercase tracking-[0.32em] text-[#C8A75D]">
            Luxury print · Costa del Sol
          </p>
          <h1
            id="bc-luxury-hero-title"
            className="mt-4 font-bc-display text-4xl font-bold leading-[1.05] tracking-tight text-[#F7F3EA] sm:text-5xl lg:text-6xl"
          >
            Golf Sol Ireland
            <span className="mt-2 block text-2xl font-semibold text-[#C8A75D] sm:text-3xl">Business Cards</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-bc-body text-base leading-relaxed text-[#F7F3EA]/85 sm:text-lg">
            Premium golf travel and private airport transfers for Irish golfers. Cards built to feel like Mercedes-Benz
            hospitality, Ryder Cup lounges, and private aviation — not generic print.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#bc-interactive"
              className="inline-flex items-center gap-2 rounded-full bg-[#C8A75D] px-6 py-3 font-bc-body text-sm font-bold uppercase tracking-[0.12em] text-[#081A12] shadow-[0_12px_40px_rgba(200,167,93,0.35)] transition hover:bg-[#E5C76B]"
            >
              <Sparkles className="size-4" aria-hidden />
              Preview cards
            </a>
            <a
              href="#bc-download"
              className="inline-flex items-center gap-2 rounded-full border border-[#C8A75D]/50 px-6 py-3 font-bc-body text-sm font-bold uppercase tracking-[0.12em] text-[#F7F3EA] transition hover:border-[#C8A75D]"
            >
              <Download className="size-4" aria-hidden />
              Download assets
            </a>
          </div>
        </div>
      </section>

      {/* —— Interactive preview —— */}
      <SectionShell
        id="bc-interactive"
        eyebrow="Interactive preview"
        title="Flip the card — front and back"
        description="Large-type luxury layout with real QR codes linking to golfsolirl.com. Tap to switch faces."
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center gap-2">
            {(['front', 'back'] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => setPreviewSide(side)}
                className={cx(
                  'rounded-full px-5 py-2.5 font-bc-body text-xs font-bold uppercase tracking-[0.14em] transition',
                  previewSide === side
                    ? 'bg-[#0F3D2E] text-[#F7F3EA]'
                    : 'border border-[#0F3D2E]/20 text-[#081A12]/70 hover:border-[#0F3D2E]/40'
                )}
              >
                {side}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <m.div
              key={previewSide}
              initial={{ opacity: 0, rotateY: previewSide === 'back' ? -8 : 8 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="perspective-[1200px]"
            >
              {cardPreview}
            </m.div>
          </AnimatePresence>
          <p className="mt-4 flex items-center justify-center gap-2 font-bc-body text-xs text-[#081A12]/55">
            <RotateCcw className="size-3.5" aria-hidden />
            85 × 55 mm landscape · bleed-safe export
          </p>
        </div>
      </SectionShell>

      {/* —— Front detail —— */}
      <SectionShell
        id="bc-front"
        dark
        eyebrow="Front face"
        title="Arrival energy — fleet, fairway, instant book"
        description="Aerial Costa del Sol golf course and Mercedes fleet, shamrock watermark, centred crest, large headline, email, and scannable QR."
      >
        <div className="mx-auto max-w-3xl">
          <PremiumCardFace mode="preview" side="front" />
        </div>
      </SectionShell>

      {/* —— Back detail —— */}
      <SectionShell
        id="bc-back"
        eyebrow="Back face"
        title="Your golf journey starts here"
        description="Deep forest green, gold crest, six service lines, large QR, and direct contact — built for Irish golfers aged 40+ and luxury societies."
      >
        <div className="mx-auto max-w-3xl">
          <PremiumCardFace mode="preview" side="back" />
        </div>
      </SectionShell>

      {/* —— QR —— */}
      <SectionShell
        id="bc-qr"
        dark
        eyebrow="QR code"
        title="Scan to book your golf transfer"
        description="High error-correction QR with crest centre, rounded white field, and gold frame — links to https://www.golfsolirl.com"
      >
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
          <div className="w-full max-w-xs rounded-2xl border border-[#C8A75D]/25 bg-[#0F3D2E] p-6 text-center">
            <QrCode className="mx-auto size-10 text-[#C8A75D]" aria-hidden />
            <p className="mt-3 font-bc-display text-lg font-bold text-[#F7F3EA]">Real QR · live link</p>
            <p className="mt-2 font-bc-body text-sm text-[#F7F3EA]/75">{BC_PREMIUM.qrUrl}</p>
          </div>
          <ul className="max-w-md space-y-3 font-bc-body text-sm text-[#F7F3EA]/85">
            <li className="flex gap-2">
              <span className="text-[#C8A75D]">✓</span> Large modules for easy mobile scanning
            </li>
            <li className="flex gap-2">
              <span className="text-[#C8A75D]">✓</span> Crest embedded at centre (H error correction)
            </li>
            <li className="flex gap-2">
              <span className="text-[#C8A75D]">✓</span> Rounded white field on dark card
            </li>
            <li className="flex gap-2">
              <span className="text-[#C8A75D]">✓</span> Gold foil frame on print
            </li>
          </ul>
        </div>
      </SectionShell>

      {/* —— Download —— */}
      <SectionShell
        id="bc-download"
        eyebrow="Download assets"
        title="Print-ready exports"
        description="Card PDF at 85×55 mm, high-resolution PNG, and team variants below."
      >
        {exportError ? (
          <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bc-body text-sm text-red-700">
            {exportError}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(['front', 'back'] as const).flatMap((side) =>
            (['pdf', 'png'] as const).map((format) => (
              <button
                key={`${side}-${format}`}
                type="button"
                disabled={exportBusy !== null}
                onClick={() => void exportCard(side, format)}
                className="flex flex-col items-start gap-2 rounded-2xl border border-[#0F3D2E]/15 bg-white p-5 text-left shadow-[0_12px_40px_rgba(8,26,18,0.08)] transition hover:-translate-y-0.5 hover:border-[#C8A75D]/40 disabled:opacity-60"
              >
                {format === 'pdf' ? (
                  <FileDown className="size-5 text-[#0F3D2E]" aria-hidden />
                ) : (
                  <Download className="size-5 text-[#0F3D2E]" aria-hidden />
                )}
                <span className="font-bc-body text-sm font-bold uppercase tracking-[0.1em] text-[#081A12]">
                  {side} · {format.toUpperCase()}
                </span>
                <span className="font-bc-body text-xs text-[#081A12]/55">
                  {exportBusy === `${format}-${side}` ? 'Building…' : `golfsol-premium-business-card-${side}.${format}`}
                </span>
              </button>
            ))
          )}
        </div>
        <p className="mt-8 font-bc-body text-sm text-[#081A12]/60">
          Static SVG templates:{' '}
          <a className="text-[#0F3D2E] underline" href="/business-cards/premium/gold-curves.svg">
            decorative assets
          </a>{' '}
          in <code className="text-xs">public/business-cards/</code>
        </p>
      </SectionShell>

      {/* —— Print spec —— */}
      <SectionShell
        id="bc-print"
        dark
        eyebrow="Print specifications"
        title="Production-ready specs"
        description="Share with your print partner for soft-touch laminate, spot UV, and gold foil."
      >
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Trim size', BC_PRINT_SPEC.trimMm],
            ['Bleed', BC_PRINT_SPEC.bleedMm],
            ['Resolution', BC_PRINT_SPEC.dpi],
            ['Finish', BC_PRINT_SPEC.finish]
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-[#C8A75D]/20 bg-[#0F3D2E] p-4">
              <dt className="font-bc-body text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#C8A75D]">{k}</dt>
              <dd className="mt-2 font-bc-body text-sm leading-relaxed text-[#F7F3EA]">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-full border border-[#C8A75D]/30 px-3 py-1 font-bc-body text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#C8A75D]">
            Gold foil
          </span>
          <span className="rounded-full border border-[#C8A75D]/30 px-3 py-1 font-bc-body text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#C8A75D]">
            Spot UV crest
          </span>
          <span className="rounded-full border border-[#C8A75D]/30 px-3 py-1 font-bc-body text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#C8A75D]">
            Embossed shamrock
          </span>
          <span className="rounded-full border border-[#C8A75D]/30 px-3 py-1 font-bc-body text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#C8A75D]">
            Soft-touch laminate
          </span>
        </div>
      </SectionShell>

      {/* —— Mobile preview —— */}
      <SectionShell
        id="bc-mobile"
        eyebrow="Mobile preview"
        title="How it looks in your hand"
        description="Front, back, and one-tap contact actions — the way Irish golfers will use your card after a society trip briefing."
      >
        <div className="mx-auto flex max-w-sm flex-col items-center">
          <div className="w-full rounded-[2.5rem] border-[10px] border-[#081A12] bg-[#081A12] p-2 shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <div className="overflow-hidden rounded-[1.75rem] bg-[#0F3D2E]">
              <div className="px-3 py-2 text-center font-bc-body text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#C8A75D]">
                {previewSide} · scan ready
              </div>
              <div className="scale-[0.92] px-1 pb-2">
                <PremiumCardFace mode="preview" side={previewSide} />
              </div>
              <div className="grid grid-cols-3 gap-1 border-t border-[#C8A75D]/20 p-2">
                <a
                  href={`mailto:${BC_PREMIUM.email}`}
                  className="flex flex-col items-center gap-1 rounded-lg py-2 font-bc-body text-[0.55rem] font-bold uppercase text-[#F7F3EA]"
                >
                  <Mail className="size-4 text-[#C8A75D]" aria-hidden />
                  Email
                </a>
                <a
                  href={BC_PREMIUM.qrUrl}
                  className="flex flex-col items-center gap-1 rounded-lg py-2 font-bc-body text-[0.55rem] font-bold uppercase text-[#F7F3EA]"
                >
                  <Globe className="size-4 text-[#C8A75D]" aria-hidden />
                  Web
                </a>
                <a
                  href="tel:+353874464766"
                  className="flex flex-col items-center gap-1 rounded-lg py-2 font-bc-body text-[0.55rem] font-bold uppercase text-[#F7F3EA]"
                >
                  <Phone className="size-4 text-[#C8A75D]" aria-hidden />
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* —— Mockups —— */}
      <SectionShell
        id="bc-mockups"
        dark
        eyebrow="Premium mockups"
        title="Luxury contexts"
        description="Stacked desk sets, fairway moments, and clubhouse hand-offs — the card should feel expensive before anyone reads a word."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MockupTile label="Floating card">
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0F3D2E] to-[#081A12] p-6">
              <div className="w-[88%] rotate-[-4deg] shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <PremiumCardFace mode="preview" side="front" />
              </div>
            </div>
          </MockupTile>
          <MockupTile label="Stack on clubhouse table">
            <div className="relative h-full bg-[#1a1208] p-4">
              <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(135deg,#3d2a14,#1a1208)' }} />
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute left-1/2 w-[78%] -translate-x-1/2"
                  style={{ top: `${12 + i * 8}%`, transform: `translateX(-50%) rotate(${-2 + i * 2}deg)`, zIndex: i }}
                >
                  <PremiumCardFace mode="preview" side={i % 2 === 0 ? 'front' : 'back'} />
                </div>
              ))}
            </div>
          </MockupTile>
          <MockupTile label="On the fairway">
            <div
              className="flex h-full items-end justify-center p-4"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(8,26,18,0.9), transparent), url(${BRAND_BUSINESS_CARD_HERO_BG_SRC})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="mb-2 w-[75%] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                <PremiumCardFace mode="preview" side="front" />
              </div>
            </div>
          </MockupTile>
        </div>
      </SectionShell>

      {/* Team cards — catalog owns the shared PDF export root */}
      <section id="bc-team" className="scroll-mt-24 border-t border-[#0F3D2E]/10 bg-[#F7F3EA] py-8">
        <div className="mx-auto max-w-6xl px-5 pb-4">
          <p className="font-bc-body text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[#0F3D2E]">
            Team desk cards
          </p>
          <h2 className="mt-2 font-bc-display text-2xl font-bold text-[#081A12]">
            Martin Kelly · Greg McDonald · Tommy O&apos;Shea
          </h2>
          <p className="mt-2 font-bc-body text-sm text-[#081A12]/65">
            Foil personal-back variants for operations and founder — export individually below.
          </p>
        </div>
        <BusinessCardsCatalog embedded includePremiumExports />
      </section>
    </>
  )
}
