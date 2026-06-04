/**
 * Golf Sol Ireland — business cards page (portrait + landscape, Martin + Greg).
 */
import { useCallback, useEffect, useState } from 'react'
import { FileDown, ImageDown, Mail, Phone, RotateCcw } from 'lucide-react'
import { LandscapeCard } from './landscape-card'
import { PortraitCard } from './portrait-card'
import {
  CARD_COPY,
  CARD_LANDSCAPE_H,
  CARD_LANDSCAPE_W,
  CARD_PORTRAIT_H,
  CARD_PORTRAIT_W,
  CARD_STAFF,
  cardPublicUrl,
  type CardExportIds,
  type CardRenderMode
} from './tokens'
import type { BusinessCardPersonBlurb } from '../lib/business-cards-config'
import { BRAND_BUSINESS_CARD_HERO_BG_SRC } from '../lib/brand-visual-assets'

type CardKind = 'landscape' | 'portrait'

function exportIdFor(exportIds: CardExportIds, kind: CardKind, side: 'back' | 'front') {
  if (kind === 'portrait') {
    return side === 'front' ? exportIds.portraitFront : exportIds.portraitBack
  }
  return side === 'front' ? exportIds.landscapeFront : exportIds.landscapeBack
}

function CardPreview({
  kind,
  label,
  blurb,
  person,
  exportIds,
  fileSlug
}: {
  readonly kind: CardKind
  readonly label: string
  readonly blurb: string
  readonly person: BusinessCardPersonBlurb
  readonly exportIds: CardExportIds
  readonly fileSlug: string
}) {
  const [side, setSide] = useState<'back' | 'front'>('front')
  const [busy, setBusy] = useState<'pdf' | 'png' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const exportFile = useCallback(
    async (format: 'pdf' | 'png') => {
      const root = document.getElementById('business-cards-pdf-export-root')
      const slideId = exportIdFor(exportIds, kind, side)
      const slide = root?.querySelector<HTMLElement>(`[data-pdf-card-id="${CSS.escape(slideId)}"]`)
      if (!slide) {
        setError('Export not ready — wait a moment and try again.')
        return
      }
      setError(null)
      setBusy(format)
      try {
        const lib = await import('../lib/save-business-cards-pdf')
        const name = `golfsol-${fileSlug}-${kind}-${side}`
        if (format === 'pdf') await lib.saveSingleBusinessCardPdf(slide, name)
        else await lib.saveSingleBusinessCardPng(slide, name)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Export failed.')
      } finally {
        setBusy(null)
      }
    },
    [exportIds, fileSlug, kind, side]
  )

  const Card = kind === 'portrait' ? PortraitCard : LandscapeCard

  return (
    <article className="ge-on-dark rounded-[2rem] border border-white/10 bg-[#062016]/90 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.4)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="bc-gold font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.28em]">
            {kind === 'portrait' ? '55 × 85 mm · Portrait' : '85 × 55 mm · Landscape'}
          </p>
          <h2 className="mt-2 font-ge-display text-2xl font-semibold sm:text-3xl" style={{ color: '#FFFFFF' }}>
            {label}
          </h2>
          <p className="mt-2 max-w-md font-ge text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
            {blurb}
          </p>
        </div>

        <div className="flex flex-wrap gap-2" data-html2canvas-ignore>
          <button
            type="button"
            onClick={() => setSide((s) => (s === 'front' ? 'back' : 'front'))}
            className="inline-flex items-center gap-2 rounded-full border border-[#d9be7a]/35 px-4 py-2.5 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em]"
            style={{ color: '#F7F3E9' }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Flip card
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void exportFile('pdf')}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0b4d3b] to-[#136047] px-4 py-2.5 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-white disabled:opacity-60"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            {busy === 'pdf' ? 'Building…' : 'PDF'}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void exportFile('png')}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-white disabled:opacity-60"
          >
            <ImageDown className="h-4 w-4" aria-hidden />
            {busy === 'png' ? 'Saving…' : 'PNG'}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-950/50 px-4 py-3 font-ge text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex justify-center transition-opacity duration-300 gsol-business-card">
        <Card mode="preview" side={side} person={person} />
      </div>
      <p className="bc-gold mt-3 text-center font-ge text-[0.65rem] font-bold uppercase tracking-[0.18em]">
        {side} side · {person.name}
      </p>
    </article>
  )
}

function ExportSlide({
  kind,
  side,
  person,
  exportIds
}: {
  readonly kind: CardKind
  readonly side: 'back' | 'front'
  readonly person: BusinessCardPersonBlurb
  readonly exportIds: CardExportIds
}) {
  const Card = kind === 'portrait' ? PortraitCard : LandscapeCard
  const landscape = kind === 'landscape'

  return (
    <div
      className={landscape ? 'w-[850px]' : 'w-[550px]'}
      data-pdf-card-id={exportIdFor(exportIds, kind, side)}
      data-pdf-page
    >
      <Card mode="pdf" side={side} person={person} />
    </div>
  )
}

export function BusinessCardsShowcase() {
  const [exportReady, setExportReady] = useState(false)
  const heroBg = cardPublicUrl(BRAND_BUSINESS_CARD_HERO_BG_SRC)

  useEffect(() => {
    document.title = 'Business Cards | Golf Sol Ireland'
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => setExportReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <section className="ge-on-dark relative isolate overflow-hidden bg-[#04140c]" aria-labelledby="bc-hero-title">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 38%'
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#04140c]/92 via-[#062016]/78 to-[#04140c]"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="bc-gold font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.32em]">
            Golf Sol Ireland · Print suite
          </p>
          <h1
            id="bc-hero-title"
            className="mt-4 max-w-3xl font-ge-display text-[2.15rem] font-semibold leading-[1.02] sm:text-5xl"
            style={{ color: '#F7F3E9' }}
          >
            Foil luxury cards — Martin Kelly &amp; Greg McDonald
          </h1>
          <p className="mt-5 max-w-2xl font-ge text-base leading-relaxed sm:text-lg" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Same company front on every card. Backs show <span className="bc-gold font-extrabold">Operations</span>{' '}
            with contact, QR, and SCAN TO BOOK — only the name changes between Martin Kelly and Greg McDonald.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={`mailto:${CARD_COPY.email}`}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-[#0b4d3b] to-[#136047] px-6 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-white"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {CARD_COPY.email}
            </a>
            <a
              href={`tel:${CARD_COPY.phoneIe.replace(/\s/g, '')}`}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#d9be7a]/35 px-6 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em]"
              style={{ color: '#F7F3E9' }}
            >
              <Phone className="h-4 w-4" aria-hidden />
              {CARD_COPY.phoneIe}
            </a>
          </div>
        </div>
      </section>

      {CARD_STAFF.map(({ person, exportIds, fileSlug }) => (
        <section
          key={fileSlug}
          className="ge-on-dark border-t border-white/10 bg-gradient-to-b from-[#04140c] to-[#062016] py-14 sm:py-18"
          aria-label={`${person.name} business cards`}
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <p className="bc-gold font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.28em]">
              {person.roleTitle}
            </p>
            <h2 className="mt-2 font-ge-display text-2xl font-semibold sm:text-3xl" style={{ color: '#FFFFFF' }}>
              {person.name}
            </h2>
            <p className="mt-2 max-w-2xl font-ge text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
              Portrait and landscape — flip to preview the back with {person.name} on the contact panel. Export PDF or
              PNG per side.
            </p>

            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              <CardPreview
                kind="portrait"
                person={person}
                exportIds={exportIds}
                fileSlug={fileSlug}
                label={`Portrait · ${person.name.split(' ')[0]}`}
                blurb="Company front — crest and GOLF SOL IRELAND. Back — name, Operations, phones, QR, and socials."
              />
              <CardPreview
                kind="landscape"
                person={person}
                exportIds={exportIds}
                fileSlug={fileSlug}
                label={`Landscape · ${person.name.split(' ')[0]}`}
                blurb="Split back with bold contact, gold QR, IE/ES phones, and footer details — same layout as Martin Kelly."
              />
            </div>
          </div>
        </section>
      ))}

      <section id="bc-specs" className="border-t border-[#136047]/20 bg-[#f7f4ec] py-14 sm:py-18">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="font-ge-display text-2xl font-semibold text-[#062016] sm:text-3xl">Print specifications</h2>
          <ul className="mt-5 space-y-2 font-ge text-sm font-semibold leading-relaxed text-[#425047]">
            <li>Landscape: {CARD_LANDSCAPE_W}px × {CARD_LANDSCAPE_H}px capture (85 × 55 mm at press)</li>
            <li>Portrait: {CARD_PORTRAIT_W}px × {CARD_PORTRAIT_H}px capture (55 × 85 mm at press)</li>
            <li>Add 3 mm bleed; keep copy inside a 5 mm safe zone</li>
            <li>QR links to {CARD_COPY.websiteUrl}</li>
            <li>Eight export faces — Martin Kelly and Greg McDonald, portrait and landscape</li>
          </ul>
        </div>
      </section>

      {exportReady ? (
        <div className="fixed -left-[9999px] top-0 w-[920px]" id="business-cards-pdf-export-root" data-keep-color>
          {CARD_STAFF.flatMap(({ person, exportIds }) =>
            (['portrait', 'landscape'] as const).flatMap((kind) =>
              (['front', 'back'] as const).map((side) => (
                <ExportSlide
                  key={exportIdFor(exportIds, kind, side)}
                  kind={kind}
                  side={side}
                  person={person}
                  exportIds={exportIds}
                />
              ))
            )
          )}
        </div>
      ) : null}
    </>
  )
}
