import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { CUSTOMER_TRIP_PHOTOS, type CustomerTripPhoto } from '../data/customer-trip-photos'
import { cx } from '../lib/utils'

const PHOTOS = CUSTOMER_TRIP_PHOTOS
const ROW_A = PHOTOS.filter((_, index) => index % 2 === 0)
const ROW_B = PHOTOS.filter((_, index) => index % 2 === 1)

function hideBandByPath(): boolean {
  if (typeof window === 'undefined') return false
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/' || path === '/homepagetest') return true
  return (
    path.startsWith('/dashboard') ||
    path === '/driver' ||
    path.startsWith('/driver/') ||
    path.startsWith('/packages-admin') ||
    path.startsWith('/package-admin')
  )
}

function PhotoCard({ photo, compact }: { readonly photo: CustomerTripPhoto; readonly compact: boolean }) {
  return (
    <figure
      className={cx(
        'customer-trip-card relative shrink-0 overflow-hidden rounded-[1.25rem] bg-[#062016] shadow-[0_16px_36px_rgba(6,32,22,0.16)] ring-1 ring-[#d4a843]/45',
        compact ? 'h-[168px] w-[248px] sm:h-[188px] sm:w-[280px]' : 'h-[196px] w-[280px] sm:h-[228px] sm:w-[340px]'
      )}
    >
      <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      <figcaption className="customer-trip-caption absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-[#062016]/90 px-3 py-1.5 font-ge font-extrabold uppercase">
        {photo.caption}
      </figcaption>
    </figure>
  )
}

function FilmRow({
  photos,
  reverse,
  compact,
  paused
}: {
  readonly photos: readonly CustomerTripPhoto[]
  readonly reverse?: boolean
  readonly compact: boolean
  readonly paused: boolean
}) {
  const cards = photos.map((photo) => <PhotoCard key={photo.src} photo={photo} compact={compact} />)
  const copies = photos.map((photo) => <PhotoCard key={`${photo.src}-copy`} photo={photo} compact={compact} />)

  return (
    <div className="overflow-hidden">
      <div className={cx('customer-trip-track flex w-max', reverse && 'is-reverse', paused && 'is-paused')}>
        <div className="flex gap-4 pr-4">{cards}</div>
        <div className="flex gap-4 pr-4" aria-hidden>
          {copies}
        </div>
      </div>
    </div>
  )
}

/** Moving film of recent Golf Sol trips. `band` sits above the public footer on non-home pages. */
export function CustomerTripReel({ placement = 'feature' }: { readonly placement?: 'feature' | 'band' }) {
  const reduceMotion = Boolean(useReducedMotion())
  const [paused, setPaused] = useState(false)
  const [hidden, setHidden] = useState(placement === 'band' && hideBandByPath())
  const compact = placement === 'band'

  useEffect(() => {
    if (placement !== 'band') return
    if (hideBandByPath() || document.querySelector('[data-dashboard-variant]')) setHidden(true)
  }, [placement])

  if (placement === 'band' && hidden) return null

  return (
    <section
      aria-labelledby={placement === 'feature' ? 'customer-trip-reel-title' : 'customer-trip-reel-band-title'}
      data-customer-trip-reel={placement}
      className={cx('customer-trip-reel relative overflow-hidden bg-[#faf8f3]', compact ? 'py-10 sm:py-12' : 'py-12 sm:py-16')}
    >
      <div className="mx-auto max-w-[760px] px-5 text-center sm:px-8">
        <p className="customer-trip-kicker font-ge font-extrabold uppercase">{compact ? 'Recent trips' : 'This season'}</p>
        <h2
          id={placement === 'feature' ? 'customer-trip-reel-title' : 'customer-trip-reel-band-title'}
          className="customer-trip-title mt-2 font-ge font-extrabold uppercase"
        >
          {compact ? 'Irish groups, on the ground' : 'Just off the van'}
        </h2>
        <p className="customer-trip-lead mx-auto mt-3 max-w-[38rem] font-ge">
          {compact
            ? 'Hotel doors, golf bags, and the clubhouse. A look at groups we have just looked after.'
            : 'From the kerb to the first tee. Hotel drop-offs, the group van, and the courses these Irish groups played.'}
        </p>
        {reduceMotion ? null : (
          <button
            type="button"
            className="customer-trip-pause mt-4 inline-flex min-h-11 items-center justify-center rounded-full px-4 font-ge font-extrabold uppercase"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? 'Play photos' : 'Pause photos'}
          </button>
        )}
      </div>

      {reduceMotion ? (
        <ul className="mx-auto mt-8 flex max-w-[1180px] flex-wrap justify-center gap-4 px-5">
          {PHOTOS.map((photo) => (
            <li key={photo.src}>
              <PhotoCard photo={photo} compact={compact} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="relative mt-8 space-y-4">
          <div aria-hidden className="customer-trip-fade pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-20" />
          <div aria-hidden className="customer-trip-fade is-right pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-20" />
          <FilmRow photos={ROW_A} compact={compact} paused={paused} />
          <FilmRow photos={ROW_B} reverse compact={compact} paused={paused} />
        </div>
      )}
    </section>
  )
}
