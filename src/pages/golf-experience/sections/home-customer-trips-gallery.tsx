import { useEffect, useId, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { FocusTrapDialog } from '../../../components/focus-trap-dialog'
import { TripadvisorNowLiveCard } from '../../../components/home/tripadvisor-now-live-card'
import {
  CUSTOMER_TRIP_FEATURED_INDEX,
  CUSTOMER_TRIP_PHOTOS,
  type CustomerTripPhoto
} from '../../../data/customer-trip-photos'
import { cx } from '../../../lib/utils'
import { GeSection } from '../components/ge-section'

const PHOTOS = CUSTOMER_TRIP_PHOTOS
const FEATURED = PHOTOS[CUSTOMER_TRIP_FEATURED_INDEX] ?? PHOTOS[0]
const MOSAIC = PHOTOS.filter((_, index) => index !== CUSTOMER_TRIP_FEATURED_INDEX)
const MOSAIC_SIDE = MOSAIC.slice(0, 2)
const MOSAIC_MID = MOSAIC.slice(2, 5)
const MOSAIC_BOTTOM = MOSAIC.slice(5)

function GalleryTile({
  photo,
  index,
  featured = false,
  className,
  onOpen
}: {
  readonly photo: CustomerTripPhoto
  readonly index: number
  readonly featured?: boolean
  readonly className?: string
  readonly onOpen: (index: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className={cx(
        'group relative block w-full overflow-hidden rounded-[1.15rem] bg-[#041610] text-left ring-1 ring-[#d4a843]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a843] focus-visible:ring-offset-2 focus-visible:ring-offset-[#062016]',
        featured ? 'shadow-[0_28px_60px_rgba(0,0,0,0.35)]' : 'shadow-[0_14px_32px_rgba(0,0,0,0.22)]',
        className
      )}
      aria-label={`Open photo: ${photo.caption}`}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading="eager"
        decoding="async"
        className={cx(
          'h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]',
          featured ? 'min-h-[280px] sm:min-h-[360px] lg:min-h-full' : 'min-h-[140px] sm:min-h-[160px]'
        )}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#041610]/85 via-[#041610]/15 to-transparent opacity-90 transition group-hover:opacity-100"
      />
      <span
        className={cx(
          'pointer-events-none absolute bottom-3 left-3 right-3 font-ge font-extrabold uppercase tracking-[0.12em] text-[#f7f3ea]',
          featured ? 'text-[0.78rem] sm:text-[0.85rem]' : 'truncate text-[0.68rem] sm:text-[0.72rem]'
        )}
      >
        {photo.caption}
      </span>
      {featured ? (
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#d4a843] px-3 py-1 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[#062016]">
          Past customers
        </span>
      ) : null}
    </button>
  )
}

function photoIndex(photo: CustomerTripPhoto): number {
  return PHOTOS.findIndex((item) => item.src === photo.src)
}

function TripLightbox({
  activeIndex,
  titleId,
  onClose,
  onPrev,
  onNext
}: {
  readonly activeIndex: number | null
  readonly titleId: string
  readonly onClose: () => void
  readonly onPrev: () => void
  readonly onNext: () => void
}) {
  const photo = activeIndex == null ? null : PHOTOS[activeIndex]

  useEffect(() => {
    if (activeIndex == null) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [activeIndex])

  useEffect(() => {
    if (activeIndex == null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, onNext, onPrev])

  return (
    <AnimatePresence>
      {photo && activeIndex != null ? (
        <m.div
          key="trip-lightbox"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#041610]/92 p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <FocusTrapDialog
            active
            labelledBy={titleId}
            onClose={onClose}
            className="relative flex max-h-[min(92vh,920px)] w-full max-w-[1080px] flex-col"
          >
            <m.div
              role="presentation"
              className="relative overflow-hidden rounded-[1.25rem] bg-[#062016] shadow-[0_40px_80px_rgba(0,0,0,0.45)] ring-1 ring-[#d4a843]/40"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <p id={titleId} className="truncate font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.16em] text-[#d4a843]">
                    {photo.caption}
                  </p>
                  <p className="mt-0.5 font-ge text-[0.72rem] text-white/65">
                    {activeIndex + 1} / {PHOTOS.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a843]"
                  aria-label="Close photo"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="relative bg-black">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="mx-auto max-h-[min(68vh,720px)] w-full object-contain"
                />
                <button
                  type="button"
                  onClick={onPrev}
                  className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#062016]/80 text-[#f7f3ea] ring-1 ring-[#d4a843]/35 transition hover:bg-[#062016] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a843] sm:left-3"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#062016]/80 text-[#f7f3ea] ring-1 ring-[#d4a843]/35 transition hover:bg-[#062016] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a843] sm:right-3"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <p className="px-4 py-3 font-ge text-[0.92rem] leading-6 text-[#f7f3ea]/88 sm:px-5">{photo.alt}</p>
            </m.div>
          </FocusTrapDialog>
        </m.div>
      ) : null}
    </AnimatePresence>
  )
}

/**
 * Homepage highlight — editorial mosaic of real past-customer golf holiday photos
 * (restored from CustomerTripReel assets removed in the homepage simplification).
 */
export function GeHomeCustomerTripsGallery() {
  const reduceMotion = Boolean(useReducedMotion())
  const titleId = useId()
  const lightboxTitleId = useId()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
  )

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)')
    const sync = () => setIsCompact(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const reveal = reduceMotion
    ? undefined
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }
      }

  return (
    <GeSection
      id="past-customers"
      background="brandDark"
      className="home-customer-trips-gallery border-y border-[#d4a843]/25"
      innerClassName="relative !py-14 sm:!py-16 lg:!py-20 scroll-mt-28"
      fullBleed
    >
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <m.div {...(reveal ?? {})} className="mx-auto max-w-[40rem] text-center">
          <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-[#d4a843]">
            Past customers
          </p>
          <h2
            id={titleId}
            className="mt-3 font-ge text-[1.85rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-[#f7f3ea] sm:text-[2.45rem]"
          >
            Real Irish groups on real golf holidays.
          </h2>
          <p className="mx-auto mt-4 max-w-[34rem] font-ge text-[1.02rem] leading-7 text-[#f7f3ea]/78">
            Hotel doors, the group van, La Reserva, Sotogrande — photos from trips we have just looked after on the Costa del Sol.
          </p>
        </m.div>

        {isCompact ? (
          <div className="mt-9" aria-labelledby={titleId}>
            <GalleryTile
              photo={FEATURED}
              index={CUSTOMER_TRIP_FEATURED_INDEX}
              featured
              className="aspect-[4/3]"
              onOpen={setActiveIndex}
            />
            <div className="-mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {MOSAIC.map((photo) => (
                <div key={photo.src} className="w-[78%] shrink-0 snap-center">
                  <GalleryTile photo={photo} index={photoIndex(photo)} className="aspect-[4/3]" onOpen={setActiveIndex} />
                </div>
              ))}
            </div>
            <p className="mt-3 text-center font-ge text-[0.78rem] text-[#f7f3ea]/55">Swipe for more · tap to enlarge</p>
          </div>
        ) : (
          <m.div
            {...(reveal ?? {})}
            className="mt-10 grid grid-cols-12 gap-3 sm:mt-12 sm:gap-4"
            aria-labelledby={titleId}
          >
            <div className="col-span-7 row-span-2">
              <GalleryTile
                photo={FEATURED}
                index={CUSTOMER_TRIP_FEATURED_INDEX}
                featured
                className="h-full min-h-[360px] lg:min-h-[440px]"
                onOpen={setActiveIndex}
              />
            </div>
            {MOSAIC_SIDE.map((photo) => (
              <div key={photo.src} className="col-span-5 min-h-[168px] lg:min-h-[210px]">
                <GalleryTile photo={photo} index={photoIndex(photo)} className="h-full" onOpen={setActiveIndex} />
              </div>
            ))}
            {MOSAIC_MID.map((photo) => (
              <div key={photo.src} className="col-span-4 aspect-[4/3]">
                <GalleryTile photo={photo} index={photoIndex(photo)} className="h-full" onOpen={setActiveIndex} />
              </div>
            ))}
            {MOSAIC_BOTTOM.map((photo) => (
              <div key={photo.src} className="col-span-3 aspect-[4/3] sm:col-span-3">
                <GalleryTile photo={photo} index={photoIndex(photo)} className="h-full" onOpen={setActiveIndex} />
              </div>
            ))}
          </m.div>
        )}

        <TripadvisorNowLiveCard />
      </div>

      <TripLightbox
        activeIndex={activeIndex}
        titleId={lightboxTitleId}
        onClose={() => setActiveIndex(null)}
        onPrev={() =>
          setActiveIndex((current) =>
            current == null ? current : (current - 1 + PHOTOS.length) % PHOTOS.length
          )
        }
        onNext={() =>
          setActiveIndex((current) => (current == null ? current : (current + 1) % PHOTOS.length))
        }
      />
    </GeSection>
  )
}
