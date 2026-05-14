import { useCallback, useState, type ReactNode } from 'react'
import { FileDown } from 'lucide-react'
import { cx } from '../lib/utils'
import { businessCardContact, businessCardPerson } from '../lib/business-cards-config'

type BusinessCardOrientation = 'portrait' | 'landscape'
type BusinessCardSide = 'front' | 'back'
type RenderMode = 'preview' | 'pdf'

export type BusinessCardSpec = {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  readonly orientation: BusinessCardOrientation
  readonly side: BusinessCardSide
  readonly imageSrc: string
  readonly width: number
  readonly height: number
  readonly render: (mode?: RenderMode) => ReactNode
}

const pdfFaceAssets = {
  portraitFront: '/images/business-cards/golfsol-business-card-front.png',
  portraitBack: '/images/business-cards/golfsol-business-card-back.png'
} as const

function BusinessCardArtwork({
  className,
  imageSrc,
  mode = 'preview',
  orientation,
  side,
  title,
  width,
  height
}: Omit<BusinessCardSpec, 'id' | 'subtitle' | 'render'> & {
  readonly className?: string
  readonly mode?: RenderMode
}) {
  const isLandscape = orientation === 'landscape'
  const landscapeImgClass =
    mode === 'pdf'
      ? 'pointer-events-none absolute left-1/2 top-1/2 block h-[850px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-90 select-none object-cover'
      : 'pointer-events-none absolute left-1/2 top-1/2 block h-[100cqw] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-90 select-none object-cover'

  return (
    <figure
      className={cx(
        'relative mx-auto overflow-hidden bg-white',
        isLandscape ? 'aspect-[1446/936] w-full max-w-[680px] [container-type:inline-size]' : 'aspect-[936/1446] w-full max-w-[360px]',
        mode === 'preview'
          ? 'rounded-[1.1rem] shadow-[0_28px_80px_rgba(39,49,17,0.26)] ring-1 ring-[#D5C600]/20'
          : 'rounded-none shadow-none ring-0',
        className
      )}
    >
      {isLandscape ? (
        /* Portrait PDF exports rotated 90° into the landscape frame (same physical card). */
        <img
          alt={`${businessCardPerson.name} business card ${side}, landscape`}
          className={landscapeImgClass}
          decoding="async"
          draggable={false}
          height={1446}
          loading={mode === 'preview' ? 'lazy' : 'eager'}
          src={imageSrc}
          width={936}
        />
      ) : (
        <img
          alt={`${businessCardPerson.name} business card ${side}, portrait`}
          className="block h-full w-full select-none object-cover"
          decoding="async"
          draggable={false}
          height={height}
          loading={mode === 'preview' ? 'lazy' : 'eager'}
          src={imageSrc}
          width={width}
        />
      )}
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  )
}

function makeSpec(
  id: string,
  title: string,
  subtitle: string,
  orientation: BusinessCardOrientation,
  side: BusinessCardSide,
  imageSrc: string,
  width: number,
  height: number
): BusinessCardSpec {
  return {
    id,
    title,
    subtitle,
    orientation,
    side,
    imageSrc,
    width,
    height,
    render: (mode = 'preview') => (
      <BusinessCardArtwork
        height={height}
        imageSrc={imageSrc}
        mode={mode}
        orientation={orientation}
        side={side}
        title={title}
        width={width}
      />
    )
  }
}

export const BUSINESS_CARD_SPECS: readonly BusinessCardSpec[] = [
  makeSpec(
    'portrait-front',
    'Portrait front',
    'Supplied PDF page 1, rendered as the portrait business-card front.',
    'portrait',
    'front',
    pdfFaceAssets.portraitFront,
    936,
    1446
  ),
  makeSpec(
    'portrait-back',
    'Portrait back',
    'Supplied PDF page 2, rendered as the portrait business-card back.',
    'portrait',
    'back',
    pdfFaceAssets.portraitBack,
    936,
    1446
  ),
  makeSpec(
    'landscape-front',
    'Landscape front',
    'Same portrait front artwork, shown in a standard landscape frame (rotated for reading).',
    'landscape',
    'front',
    pdfFaceAssets.portraitFront,
    1446,
    936
  ),
  makeSpec(
    'landscape-back',
    'Landscape back',
    'Same portrait back artwork, shown in a standard landscape frame (rotated for reading).',
    'landscape',
    'back',
    pdfFaceAssets.portraitBack,
    1446,
    936
  )
]

export function BusinessCardsCatalog() {
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [singlePdfBusyId, setSinglePdfBusyId] = useState<string | null>(null)

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

  return (
    <section className="bg-[#F4F7F5] py-16 sm:py-20" aria-labelledby="business-card-catalog-title">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-3xl">
          <p className="font-ge text-[0.74rem] font-extrabold uppercase tracking-[0.24em] text-[#738421]">
            PDF-matched set
          </p>
          <h2
            id="business-card-catalog-title"
            className="mt-3 font-ge text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#063B2A] sm:text-4xl"
          >
            Business cards rebuilt from the supplied front and back.
          </h2>
          <p className="mt-4 font-ge text-base font-medium leading-8 text-[#4e4e4e] sm:text-lg">
            The old concept catalogue has been removed. These four downloadable faces use raster exports from the uploaded PDF so the portrait front/back match the file. Landscape views use the same portrait artwork, rotated into a wide card frame so type reads naturally on screen and in PDFs.
          </p>
          <p className="mt-3 font-ge text-sm font-semibold text-[#063B2A]">
            Contact on cards:{' '}
            <a className="text-[#0B6B45] underline decoration-[#D5C600]/60 underline-offset-2 hover:text-[#007C69]" href={`mailto:${businessCardContact.email}`}>
              {businessCardContact.email}
            </a>
          </p>
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
              className="rounded-[2rem] border border-[#D5C600]/22 bg-white p-5 shadow-[0_24px_70px_rgba(39,49,17,0.12)] sm:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-[#738421]">
                    {spec.orientation} · {spec.side}
                  </p>
                  <h3 className="mt-2 font-ge text-2xl font-extrabold tracking-[-0.04em] text-[#063B2A]">
                    {spec.title}
                  </h3>
                  <p className="mt-2 max-w-xl font-ge text-sm font-semibold leading-6 text-[#4e4e4e]">
                    {spec.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D5C600]/35 bg-[#063B2A] px-4 py-2.5 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-[#EBE486] shadow-[0_14px_34px_rgba(6,59,42,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0B6B45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5C600] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                  data-html2canvas-ignore
                  disabled={singlePdfBusyId !== null}
                  onClick={() => void handleSingleCardPdf(spec)}
                >
                  <FileDown className="h-4 w-4" aria-hidden />
                  {singlePdfBusyId === spec.id ? 'Building...' : 'Card PDF'}
                </button>
              </div>

              <div className="mt-8 flex justify-center">{spec.render('preview')}</div>
            </article>
          ))}
        </div>
      </div>

      <div className="fixed -left-[9999px] top-0 w-[920px]" id="business-cards-pdf-export-root">
        {BUSINESS_CARD_SPECS.map((spec) => (
          <div
            key={`pdf-${spec.id}`}
            className={cx(
              'bg-white',
              spec.orientation === 'landscape' ? 'w-[850px]' : 'w-[550px]'
            )}
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
