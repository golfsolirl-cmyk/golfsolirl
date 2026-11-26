import { useMemo, useState, type MouseEvent } from 'react'
import { Check, Plus } from 'lucide-react'
import { DismissCloseButton } from '../../../components/ui/dismiss-close-button'
import { usePersistedDismiss } from '../../../hooks/use-persisted-dismiss'
import { DISMISS_STORAGE_KEYS } from '../../../lib/persisted-dismiss'
import { buildTripQuoteHref } from '../../../lib/trip-quote-services'
import { coursesSpain, type GeCourse } from '../data/courses'
import { hotelsSpain, type GeHotel } from '../data/hotels'
import { GeButton } from './ge-button'

function courseId(course: GeCourse) {
  return course.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function areaKey(area: string) {
  return area.toLowerCase()
}

/** Map course area labels onto hotel areas for “nearby” matching. */
function hotelMatchesCourseArea(hotel: GeHotel, courseArea: string): boolean {
  const c = areaKey(courseArea)
  const h = areaKey(hotel.area)
  if (c.includes(h) || h.includes(c.split('·')[0]?.trim() ?? '')) return true
  // Corridor neighbours used by existing data only
  if (c.includes('marbella') || c.includes('benahavís') || c.includes('benahavis')) {
    return h.includes('fuengirola') || h.includes('torremolinos') || h.includes('benalmadena') || h.includes('marbella')
  }
  if (c.includes('sotogrande') || c.includes('casares')) {
    return h.includes('fuengirola') || h.includes('torremolinos') || h.includes('benalmadena')
  }
  if (c.includes('málaga') || c.includes('malaga') || c.includes('mijas')) {
    return h.includes('fuengirola') || h.includes('torremolinos') || h.includes('benalmadena')
  }
  return false
}

const AREA_FILTERS = [
  { id: 'all', label: 'All areas' },
  { id: 'malaga', label: 'Málaga / Mijas' },
  { id: 'marbella', label: 'Marbella' },
  { id: 'estepona', label: 'Estepona / Casares' },
  { id: 'sotogrande', label: 'Sotogrande' }
] as const

const LEVEL_FILTERS = [
  { id: 'all', label: 'Any level' },
  { id: 'tournament', label: 'Tournament / tough' },
  { id: 'resort', label: 'Resort / flexible' },
  { id: 'classic', label: 'Classic layouts' },
  { id: 'group', label: 'Group favourites' }
] as const

function courseMatchesArea(course: GeCourse, areaId: string) {
  if (areaId === 'all') return true
  const a = areaKey(course.area)
  if (areaId === 'malaga') return a.includes('málaga') || a.includes('malaga') || a.includes('mijas') || a.includes('fuengirola') || a.includes('benalmádena') || a.includes('benalmadena')
  if (areaId === 'marbella') return a.includes('marbella') || a.includes('benahavís') || a.includes('benahavis') || a.includes('nueva')
  if (areaId === 'estepona') return a.includes('estepona') || a.includes('casares')
  if (areaId === 'sotogrande') return a.includes('sotogrande')
  return true
}

function courseMatchesLevel(course: GeCourse, levelId: string) {
  if (levelId === 'all') return true
  const b = course.badge.toLowerCase()
  if (levelId === 'tournament') return b.includes('tournament') || b.includes('solheim') || b.includes('ryder') || b.includes('tough')
  if (levelId === 'resort') return b.includes('resort') || b.includes('luxury') || b.includes('piñero') || b.includes('pinero') || b.includes('flexible')
  if (levelId === 'classic') return b.includes('trent') || b.includes('classic') || b.includes('jones')
  if (levelId === 'group') return b.includes('group') || b.includes('favourite') || b.includes('favorite')
  return true
}

function oneLineNote(course: GeCourse) {
  const raw = course.description.trim()
  const sentence = raw.split(/(?<=\.)\s+/)[0] ?? raw
  return sentence.length > 110 ? `${sentence.slice(0, 107)}…` : sentence
}

/**
 * Simple Find-your-course chooser — filters + compact cards + trip handoff to /quote.
 */
export function FindYourCourse() {
  const { dismissed: stickyDismissed, dismiss: dismissSticky, ready: stickyReady } = usePersistedDismiss(
    DISMISS_STORAGE_KEYS.stickyCourseQuoteBar,
    'session'
  )
  const [area, setArea] = useState<(typeof AREA_FILTERS)[number]['id']>('all')
  const [level, setLevel] = useState<(typeof LEVEL_FILTERS)[number]['id']>('all')
  const [nearHotel, setNearHotel] = useState('')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null)
  const [addTransfers, setAddTransfers] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return coursesSpain.filter((course) => {
      if (!courseMatchesArea(course, area)) return false
      if (!courseMatchesLevel(course, level)) return false
      if (nearHotel) {
        const hotel = hotelsSpain.find((h) => h.name === nearHotel)
        if (hotel && !hotelMatchesCourseArea(hotel, course.area)) return false
      }
      return true
    })
  }, [area, level, nearHotel])

  const toggleCourse = (name: string) => {
    setSelectedCourses((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
  }

  const quoteHref = useMemo(
    () =>
      buildTripQuoteHref({
        from: 'courses',
        courses: selectedCourses,
        hotel: selectedHotel,
        transfers: addTransfers,
        golf: true,
        accommodation: Boolean(selectedHotel)
      }),
    [selectedCourses, selectedHotel, addTransfers]
  )

  return (
    <section id="course-list" className="mx-auto max-w-[920px] px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12">
      <div className="max-w-2xl">
        <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-gs-green">Find your course</p>
        <h2 className="mt-2 font-ge text-[1.65rem] font-extrabold tracking-[-0.02em] text-gs-dark sm:text-[1.9rem]">
          Costa del Sol courses
        </h2>
        <p className="mt-2 font-ge text-[1.02rem] leading-7 text-ge-gray600">
          Filter by area and level. Add courses (and a nearby hotel) — then build your quote.
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
            Near my hotel
          </span>
          <select
            className="min-h-12 w-full rounded-xl border border-chrome-300 bg-white px-3 font-ge text-base text-gs-dark"
            value={nearHotel}
            onChange={(e) => setNearHotel(e.target.value)}
          >
            <option value="">Any hotel</option>
            {hotelsSpain.map((h) => (
              <option key={h.name} value={h.name}>
                {h.name} · {h.area}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="gsol-fly-scope mt-8 space-y-3">
        {filtered.map((course, index) => {
          const id = courseId(course)
          const selected = selectedCourses.includes(course.name)
          const open = expandedId === id
          const nearby = hotelsSpain.filter((h) => hotelMatchesCourseArea(h, course.area)).slice(0, 4)
          const eager = index < 2
          const flySide = index % 2 === 0 ? 'gsol-fly-from-left' : 'gsol-fly-from-right'
          return (
            <li
              key={course.name}
              className={`gsol-fly ${flySide} overflow-hidden rounded-2xl border border-chrome-200 bg-white`}
            >
              <div className="flex flex-col sm:flex-row">
                <img
                  src={course.image}
                  alt=""
                  className="h-36 w-full object-cover sm:h-auto sm:w-40 sm:shrink-0"
                  loading={eager ? 'eager' : 'lazy'}
                  fetchPriority={eager ? 'high' : 'auto'}
                  decoding={eager ? 'sync' : 'async'}
                  width={320}
                  height={200}
                />
                <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                  <div className="min-w-0">
                    <p className="font-ge text-[1.05rem] font-extrabold text-gs-dark">{course.name}</p>
                    <p className="mt-0.5 font-ge text-sm text-ge-gray600">
                      {course.area} · {course.badge}
                    </p>
                    <p className="mt-1.5 font-ge text-sm leading-6 text-ge-gray500">{oneLineNote(course)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <button
                      type="button"
                      onClick={() => toggleCourse(course.name)}
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
                      onClick={() => setExpandedId(open ? null : id)}
                    >
                      {open ? 'Hide hotels' : 'Nearby hotels'}
                    </button>
                  </div>
                </div>
              </div>
              {open ? (
                <div className="border-t border-chrome-100 bg-cream/60 px-4 py-3">
                  <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-ge-gray500">
                    Nearby hotels (existing list)
                  </p>
                  {nearby.length === 0 ? (
                    <p className="mt-2 font-ge text-sm text-ge-gray600">No hotel matches in our current list for this area.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {nearby.map((hotel) => {
                        const picked = selectedHotel === hotel.name
                        return (
                          <li key={hotel.name} className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-ge text-sm font-bold text-gs-dark">{hotel.name}</p>
                              <p className="font-ge text-xs text-ge-gray600">
                                {hotel.area} · {hotel.stars}★ · {hotel.tagline}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedHotel(picked ? null : hotel.name)}
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
        <p className="mt-6 font-ge text-base text-ge-gray600">No courses match these filters. Try another area or level.</p>
      ) : null}

      {stickyReady && !stickyDismissed ? (
        <div className="relative sticky bottom-3 z-20 mt-8 rounded-2xl border border-gs-dark/15 bg-white/95 p-4 pr-14 shadow-[0_12px_40px_rgba(6,32,22,0.14)] backdrop-blur-sm">
          <div className="absolute right-2 top-2">
            <DismissCloseButton onClick={dismissSticky} tone="light" />
          </div>
          <p className="font-ge text-sm text-ge-gray600">
            {selectedCourses.length === 0
              ? 'Add one or more courses to build a quote.'
              : `${selectedCourses.length} course${selectedCourses.length === 1 ? '' : 's'}${
                  selectedHotel ? ` · ${selectedHotel}` : ''
                }${addTransfers ? ' · transfers' : ''}`}
          </p>
          <div className="mt-3">
            <GeButton
              href={selectedCourses.length ? quoteHref : undefined}
              variant="gs-green"
              size="lg"
              className="w-full sm:w-auto"
              disabled={selectedCourses.length === 0}
              onClick={
                selectedCourses.length
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
            href={selectedCourses.length ? quoteHref : undefined}
            variant="gs-green"
            size="lg"
            className="w-full sm:w-auto"
            disabled={selectedCourses.length === 0}
            onClick={
              selectedCourses.length
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
