import { useMemo, useState, type MouseEvent } from 'react'
import { Check, Plus } from 'lucide-react'
import { DismissCloseButton } from '../../../components/ui/dismiss-close-button'
import { usePersistedDismiss } from '../../../hooks/use-persisted-dismiss'
import { DISMISS_STORAGE_KEYS } from '../../../lib/persisted-dismiss'
import { buildTripQuoteHref } from '../../../lib/trip-quote-services'
import { coursesSpain, type GeCourse } from '../data/courses'
import { hotelsSpain, type GeHotel } from '../data/hotels'
import { GeButton } from './ge-button'

type HotelLevel = 'value' | 'classic' | 'premium'

function hotelLevelFromStars(stars: GeHotel['stars']): HotelLevel {
  if (stars <= 3) return 'value'
  if (stars >= 5) return 'premium'
  return 'classic'
}

function hotelLevelLabel(level: HotelLevel) {
  if (level === 'value') return 'Value'
  if (level === 'premium') return 'Premium'
  return 'Classic'
}

function courseMatchesHotelArea(course: GeCourse, hotelArea: string): boolean {
  const c = course.area.toLowerCase()
  const h = hotelArea.toLowerCase()
  if (c.includes(h) || h.includes(c.split('·')[0]?.trim() ?? '')) return true
  if (h.includes('fuengirola') || h.includes('torremolinos') || h.includes('benalmadena')) {
    return (
      c.includes('mijas') ||
      c.includes('marbella') ||
      c.includes('benahavís') ||
      c.includes('benahavis') ||
      c.includes('sotogrande') ||
      c.includes('casares')
    )
  }
  return false
}

const AREA_FILTERS = [
  { id: 'all', label: 'All areas' },
  { id: 'fuengirola', label: 'Fuengirola' },
  { id: 'torremolinos', label: 'Torremolinos' },
  { id: 'benalmadena', label: 'Benalmádena' },
  { id: 'marbella', label: 'Marbella' }
] as const

const LEVEL_FILTERS = [
  { id: 'all', label: 'Any level' },
  { id: 'value', label: 'Value' },
  { id: 'classic', label: 'Classic' },
  { id: 'premium', label: 'Premium' }
] as const

function hotelMatchesArea(hotel: GeHotel, areaId: string) {
  if (areaId === 'all') return true
  return hotel.area.toLowerCase().includes(areaId)
}

function oneLineNote(hotel: GeHotel) {
  const raw = hotel.tagline.trim()
  return raw.length > 110 ? `${raw.slice(0, 107)}…` : raw
}

/**
 * Find-your-hotel chooser — mirrors the golf courses flow into /quote.
 */
export function FindYourHotel() {
  const { dismissed: stickyDismissed, dismiss: dismissSticky, ready: stickyReady } = usePersistedDismiss(
    DISMISS_STORAGE_KEYS.stickyHotelQuoteBar,
    'session'
  )
  const [area, setArea] = useState<(typeof AREA_FILTERS)[number]['id']>('all')
  const [level, setLevel] = useState<(typeof LEVEL_FILTERS)[number]['id']>('all')
  const [nearCourse, setNearCourse] = useState('')
  const [selectedHotels, setSelectedHotels] = useState<string[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [addTransfers, setAddTransfers] = useState(false)
  const [expandedName, setExpandedName] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return hotelsSpain.filter((hotel) => {
      if (!hotelMatchesArea(hotel, area)) return false
      if (level !== 'all' && hotelLevelFromStars(hotel.stars) !== level) return false
      if (nearCourse) {
        const course = coursesSpain.find((c) => c.name === nearCourse)
        if (course && !courseMatchesHotelArea(course, hotel.area)) return false
      }
      return true
    })
  }, [area, level, nearCourse])

  const toggleHotel = (name: string) => {
    setSelectedHotels((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
  }

  const toggleCourse = (name: string) => {
    setSelectedCourses((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
  }

  const quoteHref = useMemo(
    () =>
      buildTripQuoteHref({
        from: 'hotels',
        hotels: selectedHotels,
        hotel: selectedHotels[0] ?? null,
        courses: selectedCourses,
        transfers: addTransfers,
        accommodation: true,
        golf: selectedCourses.length > 0
      }),
    [selectedHotels, selectedCourses, addTransfers]
  )

  return (
    <section id="hotel-list" className="mx-auto max-w-[920px] px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12">
      <div className="max-w-2xl">
        <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-gs-green">Find your hotel</p>
        <h2 className="mt-2 font-ge text-[1.65rem] font-extrabold tracking-[-0.02em] text-gs-dark sm:text-[1.9rem]">
          Costa del Sol stays
        </h2>
        <p className="mt-2 font-ge text-[1.02rem] leading-7 text-ge-gray600">
          Filter by area and level. Add a hotel (and nearby courses) — then build your quote.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label className="block min-w-[10rem] flex-1">
          <span className="mb-1 block font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-ge-gray500">
            Area
          </span>
          <select
            className="min-h-12 w-full rounded-xl border border-chrome-300 bg-white px-3 font-ge text-base text-gs-dark"
            value={area}
            onChange={(e) => setArea(e.target.value as typeof area)}
          >
            {AREA_FILTERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[10rem] flex-1">
          <span className="mb-1 block font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-ge-gray500">
            Level
          </span>
          <select
            className="min-h-12 w-full rounded-xl border border-chrome-300 bg-white px-3 font-ge text-base text-gs-dark"
            value={level}
            onChange={(e) => setLevel(e.target.value as typeof level)}
          >
            {LEVEL_FILTERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[12rem] flex-[1.2]">
          <span className="mb-1 block font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-ge-gray500">
            Near a course
          </span>
          <select
            className="min-h-12 w-full rounded-xl border border-chrome-300 bg-white px-3 font-ge text-base text-gs-dark"
            value={nearCourse}
            onChange={(e) => setNearCourse(e.target.value)}
          >
            <option value="">Any course</option>
            {coursesSpain.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} · {c.area}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="gsol-fly-scope mt-8 space-y-3">
        {filtered.map((hotel, index) => {
          const selected = selectedHotels.includes(hotel.name)
          const open = expandedName === hotel.name
          const hotelLevel = hotelLevelFromStars(hotel.stars)
          const nearbyCourses = coursesSpain.filter((c) => courseMatchesHotelArea(c, hotel.area)).slice(0, 4)
          const eager = index < 2
          const flySide = index % 2 === 0 ? 'gsol-fly-from-left' : 'gsol-fly-from-right'
          return (
            <li
              key={hotel.name}
              className={`gsol-fly ${flySide} overflow-hidden rounded-2xl border border-chrome-200 bg-white`}
            >
              <div className="flex flex-col sm:flex-row">
                <img
                  src={hotel.image}
                  alt=""
                  className="h-36 w-full object-cover sm:h-auto sm:w-40 sm:shrink-0"
                  width={320}
                  height={200}
                  loading={eager ? 'eager' : 'lazy'}
                  fetchPriority={eager ? 'high' : 'auto'}
                  decoding={eager ? 'sync' : 'async'}
                />
                <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-ge text-[1.05rem] font-extrabold text-gs-dark">{hotel.name}</p>
                    <p className="mt-0.5 font-ge text-sm text-ge-gray600">
                      {hotel.area} · {hotelLevelLabel(hotelLevel)} · {hotel.stars}★
                    </p>
                    <p className="mt-1.5 font-ge text-sm leading-6 text-ge-gray500">{oneLineNote(hotel)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <button
                      type="button"
                      onClick={() => toggleHotel(hotel.name)}
                      className={
                        selected
                          ? 'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-gs-dark px-4 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-white'
                          : 'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-gs-green bg-white px-4 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-gs-green'
                      }
                    >
                      {selected ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />}
                      {selected ? 'On my trip' : 'Add to my trip'}
                    </button>
                    <button
                      type="button"
                      className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.1em] text-brand-700"
                      onClick={() => setExpandedName(open ? null : hotel.name)}
                    >
                      {open ? 'Hide courses' : 'Nearby courses'}
                    </button>
                  </div>
                </div>
              </div>
              {open ? (
                <div className="border-t border-chrome-100 bg-cream/60 px-4 py-3">
                  <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-ge-gray500">
                    Nearby courses (existing list)
                  </p>
                  {nearbyCourses.length === 0 ? (
                    <p className="mt-2 font-ge text-sm text-ge-gray600">No course matches in our current list for this area.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {nearbyCourses.map((course) => {
                        const picked = selectedCourses.includes(course.name)
                        return (
                          <li key={course.name} className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-ge text-sm font-bold text-gs-dark">{course.name}</p>
                              <p className="font-ge text-xs text-ge-gray600">
                                {course.area} · {course.badge}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleCourse(course.name)}
                              className={
                                picked
                                  ? 'shrink-0 rounded-full bg-gs-dark px-3 py-1.5 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-white'
                                  : 'shrink-0 rounded-full border border-chrome-300 px-3 py-1.5 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-gs-dark'
                              }
                            >
                              {picked ? 'Selected' : 'Select'}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  <label className="mt-3 flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-chrome-300 text-gs-green"
                      checked={addTransfers}
                      onChange={(e) => setAddTransfers(e.target.checked)}
                    />
                    <span className="font-ge text-sm text-gs-dark">Add airport & hotel transfers</span>
                  </label>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      {filtered.length === 0 ? (
        <p className="mt-6 font-ge text-base text-ge-gray600">No hotels match these filters. Try another area or level.</p>
      ) : null}

      {stickyReady && !stickyDismissed ? (
        <div className="relative sticky bottom-3 z-20 mt-8 rounded-2xl border border-gs-dark/15 bg-white/95 p-4 pr-14 shadow-[0_12px_40px_rgba(6,32,22,0.14)] backdrop-blur-sm">
          <div className="absolute right-2 top-2">
            <DismissCloseButton onClick={dismissSticky} tone="light" />
          </div>
          <p className="font-ge text-sm text-ge-gray600">
            {selectedHotels.length === 0
              ? 'Add a hotel to build a quote.'
              : `${selectedHotels.length} hotel${selectedHotels.length === 1 ? '' : 's'}${
                  selectedCourses.length
                    ? ` · ${selectedCourses.length} course${selectedCourses.length === 1 ? '' : 's'}`
                    : ''
                }${addTransfers ? ' · transfers' : ''}`}
          </p>
          <div className="mt-3">
            <GeButton
              href={selectedHotels.length ? quoteHref : undefined}
              variant="gs-green"
              size="lg"
              className="w-full sm:w-auto"
              disabled={selectedHotels.length === 0}
              onClick={
                selectedHotels.length
                  ? undefined
                  : (e: MouseEvent) => {
                      e.preventDefault()
                    }
              }
            >
              Build my quote
            </GeButton>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <GeButton
            href={selectedHotels.length ? quoteHref : undefined}
            variant="gs-green"
            size="lg"
            className="w-full sm:w-auto"
            disabled={selectedHotels.length === 0}
            onClick={
              selectedHotels.length
                ? undefined
                : (e: MouseEvent) => {
                    e.preventDefault()
                  }
            }
          >
            Build my quote
          </GeButton>
        </div>
      )}
    </section>
  )
}
