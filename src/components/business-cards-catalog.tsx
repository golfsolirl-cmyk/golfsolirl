import { useCallback, useState } from 'react'
import { FileDown, BookOpen } from 'lucide-react'
import { BUSINESS_CARD_PRESS_SPECS } from './business-cards-press-specs'
import type { BusinessCardSpec } from '../lib/business-cards-catalog-types'
import { cx } from '../lib/utils'
import { businessCardContact } from '../lib/business-cards-config'

export type { BusinessCardSpec } from '../lib/business-cards-catalog-types'

/** All tiles on `/business-cards` — unified press suite (portrait + landscape). */
export const BUSINESS_CARD_SPECS: readonly BusinessCardSpec[] = [...BUSINESS_CARD_PRESS_SPECS]

export function BusinessCardsCatalog() {
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [singlePdfBusyId, setSinglePdfBusyId] = useState<string | null>(null)
  const [allProofsBusy, setAllProofsBusy] = useState(false)

  const handleSingleCardPdf = useCallback(async (spec: BusinessCardSpec) => {
    const root = document.getElementById('business-cards-pdf-export-root')
    const slide = root?.querySelector<HTMLElement>(`[data-pdf-card-id="${CSS.escape(spec.id)}"]`)
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
  }, [])

  const handleSingleProofPdf = useCallback(async (spec: BusinessCardSpec) => {
    const root = document.getElementById('business-cards-pdf-export-root')
    const slide = root?.querySelector<HTMLElement>(`[data-pdf-card-id="${CSS.escape(spec.id)}"]`)
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
  }, [])

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
    <section className="bg-[#F4F7F5] py-16 sm:py-20" aria-labelledby="business-card-catalog-title">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-3xl">
          <p className="font-ge text-[0.74rem] font-extrabold uppercase tracking-[0.24em] text-[#738421]">
            Press suite
          </p>
          <h2
            id="business-card-catalog-title"
            className="mt-3 font-ge text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#08120d] sm:text-4xl"
          >
            Eight faces — homepage hero, crest, and one contact system.
          </h2>
          <p className="mt-4 font-ge text-base font-medium leading-8 text-[#4e4e4e] sm:text-lg">
            Martin Kelly and Greg McDonald each have portrait and landscape cards. Every face uses the homepage hero
            plate, the site crest on the left, a gold divider, Operations Manager on the right, and a contact dock with
            social icons, Irish phone, email, and web.
          </p>
          <p className="mt-3 font-ge text-sm font-semibold text-[#08120d]">
            Contact on cards:{' '}
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

        {pdfError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-ge text-sm font-semibold text-red-700">
            {pdfError}
          </div>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {BUSINESS_CARD_SPECS.map((spec) => (
            <article
              key={spec.id}
              className="rounded-[2rem] border border-[#136047]/22 bg-white p-5 shadow-[0_24px_70px_rgba(39,49,17,0.12)] sm:p-7"
            >
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
                    onClick={() => void handleSingleCardPdf(spec)}
                  >
                    <FileDown className="h-4 w-4" aria-hidden />
                    {singlePdfBusyId === spec.id ? 'Building...' : 'Card PDF'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-[#136047]/35 bg-[#136047] px-4 py-2.5 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_rgba(6,59,42,0.14)] transition hover:-translate-y-0.5 hover:bg-[#0b4d3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136047] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                    disabled={singlePdfBusyId !== null || allProofsBusy}
                    onClick={() => void handleSingleProofPdf(spec)}
                  >
                    <BookOpen className="h-4 w-4" aria-hidden />
                    {singlePdfBusyId === spec.id ? 'Building...' : 'Proof PDF'}
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-center">{spec.render('preview')}</div>
            </article>
          ))}
        </div>
      </div>

      <div className="fixed -left-[9999px] top-0 w-[920px]" id="business-cards-pdf-export-root" data-keep-color>
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
