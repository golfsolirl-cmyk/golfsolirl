import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cx } from '../lib/utils'

type TripPhoto = {
  readonly src: string
  readonly caption: string
  readonly alt: string
}

const PHOTOS: readonly TripPhoto[] = [
  {
    src: '/images/customer-trips/bags-at-the-kerb.jpg',
    caption: 'Bags at the kerb',
    alt: 'Three golfers with travel bags beside the Golf Sol van on a Costa del Sol street.'
  },
  {
    src: '/images/customer-trips/sol-don-pablo.jpg',
    caption: 'Sol Don Pablo',
    alt: 'Golfers with their bags outside the Sol Don Pablo hotel entrance.'
  },
  {
    src: '/images/customer-trips/la-reserva-group.jpg',
    caption: 'La Reserva Club',
    alt: 'An Irish golf group beside the white van at La Reserva Club.'
  },
  {
    src: '/images/customer-trips/van-to-buggy.jpg',
    caption: 'Van to buggy',
    alt: 'Golf bags moving from the van onto a buggy at the clubhouse.'
  },
  {
    src: '/images/customer-trips/van-doors-open.jpg',
    caption: 'Doors open',
    alt: 'The white group van with the doors open at La Reserva Club.'
  },
  {
    src: '/images/customer-trips/van-at-la-reserva.jpg',
    caption: 'The group van',
    alt: 'Front of the white Golf Sol van parked at La Reserva Club.'
  },
  {
    src: '/images/customer-trips/sunset-bag-drop.jpg',
    caption: 'Last light drop-off',
    alt: 'Golfers unloading bags from the van beside a clubhouse at sunset.'
  },
  {
    src: '/images/customer-trips/evening-range.jpg',
    caption: 'Evening range',
    alt: 'A Costa del Sol driving range in the evening, with the course beyond.'
  },
  {
    src: '/images/customer-trips/la-reserva-gates.jpg',
    caption: 'Through the gates',
    alt: 'The entrance gates and sign at La Reserva Club.'
  },
  {
    src: '/images/customer-trips/sotogrande.jpg',
    caption: 'Sotogrande',
    alt: 'The white Sotogrande hotel entrance under a clear blue sky.'
  },
  {
    src: '/images/customer-trips/hotel-terrace.jpg',
    caption: 'The stay',
    alt: 'A sunny hotel terrace with planting and a small fountain.'
  },
  {
    src: '/images/customer-trips/resort-gardens.jpg',
    caption: 'Resort gardens',
    alt: 'A long reflecting pool through resort gardens on the Costa del Sol.'
  }
]

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

function PhotoCard({ photo, compact }: { readonly photo: TripPhoto; readonly compact: boolean }) {
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
  readonly photos: readonly TripPhoto[]
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

/** Moving film of recent Golf Sol trips. `feature` sits under the homepage hero. `band` sits above the public footer. */
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
