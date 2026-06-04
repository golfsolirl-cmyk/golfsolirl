import { useCallback, useState } from 'react'
import { FileDown, BookOpen, ImageDown } from 'lucide-react'
import { BUSINESS_CARD_PRESS_SPECS } from './business-cards-press-specs'
import { TOMMY_LUXURY_CARD_SPECS } from './business-cards-tommy-luxury'
import type { BusinessCardSpec } from '../lib/business-cards-catalog-types'
import { cx } from '../lib/utils'
import { businessCardContact } from '../lib/business-cards-config'

import { PremiumCardFace } from './business-cards-premium-card'

export type { BusinessCardSpec } from '../lib/business-cards-catalog-types'

export const PREMIUM_COMPANY_EXPORT_IDS = {
  front: 'premium-company-front',
  back: 'premium-company-back'
} as const

/** Operations (Martin + Greg) + executive Tommy O'Shea landscape suite. */
export const BUSINESS_CARD_SPECS: readonly BusinessCardSpec[] = [
  ...BUSINESS_CARD_PRESS_SPECS,
  ...TOMMY_LUXURY_CARD_SPECS
]

type CardSuite = {
  readonly id: string
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly specs: readonly BusinessCardSpec[]
}

const CARD_SUITES: readonly CardSuite[] = [
  {
    id: 'operations',
    eyebrow: 'Operations desk',
    title: 'Martin Kelly & Greg McDonald',
    description:
      'Exact foil mockup — forest texture front; back with contact, QR + crest, SCAN TO BOOK, and service footer.',
    specs: BUSINESS_CARD_PRESS_SPECS
  },
  {
    id: 'executive',
    eyebrow: 'Executive · Founder',
    title: "Tommy O'Shea — foil luxury",
    description:
      'Same exact mockup as reference — landscape front + Tommy O\'Shea split back with QR to golfsolirl.com.',
    specs: TOMMY_LUXURY_CARD_SPECS
  }
]

function CardTile({
  spec,
  singlePdfBusyId,
  allProofsBusy,
  onCardPdf,
  onProofPdf,
  onPng
}: {
  readonly spec: BusinessCardSpec
  readonly singlePdfBusyId: string | null
  readonly allProofsBusy: boolean
  readonly onCardPdf: (spec: BusinessCardSpec) => void
  readonly onProofPdf: (spec: BusinessCardSpec) => void
  readonly onPng: (spec: BusinessCardSpec) => void
}) {
  const busy = singlePdfBusyId === spec.id
  return (
    <article className="rounded-[2rem] border border-[#136047]/22 bg-white p-5 shadow-[0_24px_70px_rgba(39,49,17,0.12)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-[#738421]">
            {spec.orientation} · {spec.side}
          </p>
          <h3 className="mt-2 font-ge text-2xl font-extrabold tracking-[-0.04em] text-[#08120d]">{spec.title}</h3>
          <p className="mt-2 max-w-xl font-ge text-sm font-semibold leading-6 text-[#4e4e4e]">{spec.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2" data-html2canvas-ignore>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#136047]/35 bg-[#08120d] px-4 py-2.5 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-[#d9be7a] shadow-[0_14px_34px_rgba(6,59,42,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0b4d3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136047] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            disabled={singlePdfBusyId !== null || allProofsBusy}
            onClick={() => onCardPdf(spec)}
          >
            <FileDown className="h-4 w-4" aria-hidden />
            {busy ? 'Building...' : 'Card PDF'}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#136047]/35 bg-[#136047] px-4 py-2.5 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_rgba(6,59,42,0.14)] transition hover:-translate-y-0.5 hover:bg-[#0b4d3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136047] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            disabled={singlePdfBusyId !== null || allProofsBusy}
            onClick={() => onProofPdf(spec)}
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            {busy ? 'Building...' : 'Proof PDF'}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#0E3B2E] px-4 py-2.5 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-[#E5C76B] transition hover:-translate-y-0.5 hover:bg-[#145A42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            disabled={singlePdfBusyId !== null || allProofsBusy}
            onClick={() => onPng(spec)}
          >
            <ImageDown className="h-4 w-4" aria-hidden />
            {busy ? 'Building...' : 'PNG'}
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-center">{spec.render('preview')}</div>
    </article>
  )
}

export function BusinessCardsCatalog({
  embedded = false,
  includePremiumExports = false
}: {
  readonly embedded?: boolean
  readonly includePremiumExports?: boolean
}) {
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [singlePdfBusyId, setSinglePdfBusyId] = useState<string | null>(null)
  const [allProofsBusy, setAllProofsBusy] = useState(false)

  const getSlide = useCallback((spec: BusinessCardSpec) => {
    const root = document.getElementById('business-cards-pdf-export-root')
    return root?.querySelector<HTMLElement>(`[data-pdf-card-id="${CSS.escape(spec.id)}"]`) ?? null
  }, [])

  const handleSingleCardPdf = useCallback(
    async (spec: BusinessCardSpec) => {
      const slide = getSlide(spec)
      if (!slide) {
        setPdfError('Could not find the print card. Refresh and try again.')
        return
      }

      setPdfError(null)
      setSinglePdfBusyId(spec.id)
      try {
        const filenameBase = `golfsol-business-card-${spec.id}`
        const { saveSingleBusinessCardPdf } = await import('../lib/save-business-cards-pdf')
        await saveSingleBusinessCardPdf(slide, filenameBase)
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Could not build the PDF.'
        setPdfError(message)
      } finally {
        setSinglePdfBusyId(null)
      }
    },
    [getSlide]
  )

  const handleSingleProofPdf = useCallback(
    async (spec: BusinessCardSpec) => {
      const slide = getSlide(spec)
      if (!slide) {
        setPdfError('Could not find the print card. Refresh and try again.')
        return
      }

      setPdfError(null)
      setSinglePdfBusyId(spec.id)
      try {
        const filenameBase = `golfsol-business-card-${spec.id}`
        const { saveSingleBusinessCardProofPdf } = await import('../lib/save-business-cards-pdf')
        await saveSingleBusinessCardProofPdf(slide, filenameBase)
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Could not build the proof PDF.'
        setPdfError(message)
      } finally {
        setSinglePdfBusyId(null)
      }
    },
    [getSlide]
  )

  const handleSinglePng = useCallback(
    async (spec: BusinessCardSpec) => {
      const slide = getSlide(spec)
      if (!slide) {
        setPdfError('Could not find the print card. Refresh and try again.')
        return
      }

      setPdfError(null)
      setSinglePdfBusyId(spec.id)
      try {
        const filenameBase = `golfsol-business-card-${spec.id}`
        const { saveSingleBusinessCardPng } = await import('../lib/save-business-cards-pdf')
        await saveSingleBusinessCardPng(slide, filenameBase)
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Could not build the PNG.'
        setPdfError(message)
      } finally {
        setSinglePdfBusyId(null)
      }
    },
    [getSlide]
  )

  const handleAllProofsPdf = useCallback(async () => {
    const root = document.getElementById('business-cards-pdf-export-root')
    if (!root) return

    const slides: { el: HTMLElement; title: string }[] = []
    for (const spec of BUSINESS_CARD_SPECS) {
      const el = root.querySelector<HTMLElement>(`[data-pdf-card-id="${CSS.escape(spec.id)}"]`)
      if (el) slides.push({ el, title: spec.title })
    }
    if (!slides.length) {
      setPdfError('No cards found. Refresh and try again.')
      return
    }

    setPdfError(null)
    setAllProofsBusy(true)
    try {
      const { saveAllBusinessCardProofsPdf } = await import('../lib/save-business-cards-pdf')
      await saveAllBusinessCardProofsPdf(slides)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not build the proof book.'
      setPdfError(message)
    } finally {
      setAllProofsBusy(false)
    }
  }, [])

  return (
    <section
      className={embedded ? 'bg-transparent py-8 sm:py-12' : 'bg-[#F4F7F5] py-16 sm:py-20'}
      aria-labelledby={embedded ? undefined : 'business-card-catalog-title'}
    >
      <div className="mx-auto max-w-6xl px-5">
        {!embedded ? (
        <div className="max-w-3xl">
          <p className="font-ge text-[0.74rem] font-extrabold uppercase tracking-[0.24em] text-[#738421]">
            Press suite
          </p>
          <h2
            id="business-card-catalog-title"
            className="mt-3 font-ge text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#08120d] sm:text-4xl"
          >
            Print-ready cards — operations team & executive founder.
          </h2>
          <p className="mt-4 font-ge text-base font-medium leading-8 text-[#4e4e4e] sm:text-lg">
            Exact foil luxury mockup — forest green texture, gold type, Celtic corners, centred brand front, split
            contact + QR back. Martin Kelly, Greg McDonald, and Tommy O&apos;Shea. Export Card PDF, proof, or PNG per face.
          </p>
          <p className="mt-3 font-ge text-sm font-semibold text-[#08120d]">
            Company desk:{' '}
            <a
              className="text-[#0b4d3b] underline decoration-[#136047]/60 underline-offset-2 hover:text-[#007C69]"
              href={`mailto:${businessCardContact.email}`}
            >
              {businessCardContact.email}
            </a>
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center gap-2.5 rounded-full border border-[#136047]/35 bg-[#136047] px-5 py-3 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_rgba(6,59,42,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0b4d3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136047] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              disabled={allProofsBusy || singlePdfBusyId !== null}
              onClick={() => void handleAllProofsPdf()}
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              {allProofsBusy ? 'Building all proofs...' : 'Download all proofs (A4)'}
            </button>
          </div>
        </div>
        ) : null}

        {pdfError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-ge text-sm font-semibold text-red-700">
            {pdfError}
          </div>
        ) : null}

        {CARD_SUITES.map((suite) => (
          <div key={suite.id} className="mt-14">
            <div className="mb-8 max-w-2xl border-b border-[#136047]/15 pb-6">
              <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-[#738421]">
                {suite.eyebrow}
              </p>
              <h3 className="mt-2 font-ge text-2xl font-extrabold tracking-[-0.03em] text-[#08120d]">{suite.title}</h3>
              <p className="mt-2 font-ge text-sm font-medium leading-7 text-[#4e4e4e]">{suite.description}</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              {suite.specs.map((spec) => (
                <CardTile
                  key={spec.id}
                  spec={spec}
                  singlePdfBusyId={singlePdfBusyId}
                  allProofsBusy={allProofsBusy}
                  onCardPdf={(s) => void handleSingleCardPdf(s)}
                  onProofPdf={(s) => void handleSingleProofPdf(s)}
                  onPng={(s) => void handleSinglePng(s)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed -left-[9999px] top-0 w-[920px]" id="business-cards-pdf-export-root" data-keep-color>
        {includePremiumExports ? (
          <>
            <div className="w-[850px]" data-pdf-card-id={PREMIUM_COMPANY_EXPORT_IDS.front} data-pdf-page>
              <PremiumCardFace mode="pdf" side="front" />
            </div>
            <div className="w-[850px]" data-pdf-card-id={PREMIUM_COMPANY_EXPORT_IDS.back} data-pdf-page>
              <PremiumCardFace mode="pdf" side="back" />
            </div>
          </>
        ) : null}
        {BUSINESS_CARD_SPECS.map((spec) => (
          <div
            key={`pdf-${spec.id}`}
            className={cx('bg-white', spec.orientation === 'landscape' ? 'w-[850px]' : 'w-[550px]')}
            data-pdf-card-id={spec.id}
            data-pdf-page
          >
            {spec.render('pdf')}
          </div>
        ))}
      </div>
    </section>
  )
}
