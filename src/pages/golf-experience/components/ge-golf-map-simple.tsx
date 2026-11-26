import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { List, Map as MapIcon, MapPin } from 'lucide-react'
import { DismissCloseButton } from '../../../components/ui/dismiss-close-button'
import L from 'leaflet'
import type { DivIcon, Map as LeafletMap, Marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { COURSES, type CoastalCourse } from '../../../data/coastal-golf-data'
import { MapTapToActivate } from '../../../components/map-tap-to-activate'
import { attachLeafletScrollGuard, type LeafletScrollGuardHandle } from '../../../lib/leaflet-scroll-guard'
import { buildTripQuoteHref } from '../../../lib/trip-quote-services'
import { cx } from '../../../lib/utils'
import { GOLF_COURSES_MAP_SECTION_ID } from './ge-courses-map-visibility'
import { GeButton } from './ge-button'

type MobilePane = 'list' | 'map'

type AreaFilter = 'all' | 'east' | 'marbella' | 'west'

const AREA_CHIPS: { id: AreaFilter; label: string }[] = [
  { id: 'all', label: 'All areas' },
  { id: 'east', label: 'East (Mijas / Benalmádena)' },
  { id: 'marbella', label: 'Marbella valley' },
  { id: 'west', label: 'West (Estepona / Sotogrande)' }
]

function courseArea(c: CoastalCourse): AreaFilter {
  if (['Benalmádena', 'Alhaurín de la Torre', 'Mijas Costa', 'Mijas'].includes(c.region)) return 'east'
  if (['Marbella East', 'Marbella', 'Nueva Andalucía'].includes(c.region)) return 'marbella'
  return 'west'
}

function shortLine(c: CoastalCourse): string {
  if (c.tier === 'luxury') return 'Flagship round — tell us when you want to play.'
  if (c.tier === 'premium') return 'Strong society pick with solid routing from Málaga.'
  return 'Solid value round on the Costa corridor.'
}

function makePin(selected: boolean): DivIcon {
  const size = selected ? 28 : 18
  return L.divIcon({
    className: 'gsol-leaflet-dot',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,#0b3b2c,#136047);border:2.5px solid #fff;box-shadow:${
      selected ? '0 0 0 3px rgba(247,217,120,0.9),0 6px 16px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.28)'
    }"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

/** Handoff into SmartTripQuoteForm on /quote with this course preselected. */
function planTripHref(course: CoastalCourse): string {
  return buildTripQuoteHref({
    from: 'golf-map',
    courses: [course.name],
    golf: true,
    // Full trip builder: transfers + accommodation (hotel level) + golf course
    transfers: true,
    accommodation: true
  })
}

function viewCourseHref(course: CoastalCourse): string {
  const area = courseArea(course)
  if (area === 'east') return '/golf-courses/mijas-fuengirola'
  if (area === 'marbella') return '/golf-courses/marbella-golf-valley'
  return '/golf-courses/sotogrande'
}

/** Lean Costa golf map: list/map toggle on mobile, split on desktop, bottom sheet for selection. */
export function GeGolfMapSimple() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Record<string, Marker>>({})
  const scrollGuardRef = useRef<LeafletScrollGuardHandle | null>(null)

  const [area, setArea] = useState<AreaFilter>('all')
  const [hotelMatch, setHotelMatch] = useState(false)
  const [mobilePane, setMobilePane] = useState<MobilePane>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapInteractive, setMapInteractive] = useState(false)

  const filtered = useMemo(
    () => COURSES.filter((c) => (area === 'all' ? true : courseArea(c) === area)),
    [area]
  )

  const selected = useMemo(
    () => (selectedId ? COURSES.find((c) => c.id === selectedId) ?? null : null),
    [selectedId]
  )

  const selectCourse = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') selectCourse(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, selectCourse])

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false
    }).setView([36.48, -4.95], 9)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18
    }).addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)

    scrollGuardRef.current = attachLeafletScrollGuard(map, mapRef.current, { initiallyActive: false })
    mapInstanceRef.current = map
    setMapReady(true)

    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      scrollGuardRef.current?.destroy()
      scrollGuardRef.current = null
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = {}
    }
  }, [])

  // Markers for filtered courses
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !mapReady) return

    const keep = new Set(filtered.map((c) => c.id))
    for (const [id, marker] of Object.entries(markersRef.current)) {
      if (!keep.has(id)) {
        marker.remove()
        delete markersRef.current[id]
      }
    }

    for (const course of filtered) {
      const existing = markersRef.current[course.id]
      if (existing) {
        existing.setIcon(makePin(course.id === selectedId))
        continue
      }
      const marker = L.marker([course.lat, course.lng], {
        icon: makePin(course.id === selectedId),
        title: course.name
      }).addTo(map)
      marker.on('click', () => selectCourse(course.id))
      markersRef.current[course.id] = marker
    }

    if (filtered.length > 0) {
      const bounds = L.latLngBounds(filtered.map((c) => [c.lat, c.lng] as [number, number]))
      map.fitBounds(bounds.pad(0.18), { animate: false, maxZoom: 11 })
    }
  }, [filtered, mapReady, selectCourse, selectedId])

  // Highlight + fly when selected
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selected) return
    for (const [id, marker] of Object.entries(markersRef.current)) {
      marker.setIcon(makePin(id === selected.id))
    }
    map.panTo([selected.lat, selected.lng], { animate: true })
  }, [selected])

  // Invalidate when switching to map pane on mobile
  useEffect(() => {
    if (mobilePane !== 'map') return
    const t = window.setTimeout(() => mapInstanceRef.current?.invalidateSize(), 80)
    return () => window.clearTimeout(t)
  }, [mobilePane])

  const FilterBar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {AREA_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setArea(chip.id)}
            className={cx(
              'shrink-0 rounded-full px-3.5 py-2 font-ge text-sm font-semibold transition',
              area === chip.id
                ? 'bg-gs-dark text-white'
                : 'bg-white text-gs-dark ring-1 ring-slate-200 hover:bg-slate-50'
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white px-3.5 py-2 font-ge text-sm font-semibold text-gs-dark ring-1 ring-slate-200">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[#136047]"
          checked={hotelMatch}
          onChange={(e) => setHotelMatch(e.target.checked)}
        />
        Near hotel / transfer
      </label>
    </div>
  )

  const MobileToggle = (
    <div className="flex rounded-xl bg-slate-100 p-1 lg:hidden" role="tablist" aria-label="List or map">
      {(
        [
          { id: 'list' as const, label: 'List', Icon: List },
          { id: 'map' as const, label: 'Map', Icon: MapIcon }
        ] as const
      ).map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={mobilePane === id}
          onClick={() => setMobilePane(id)}
          className={cx(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-3 font-ge text-sm font-bold transition',
            mobilePane === id ? 'bg-white text-gs-dark shadow-sm' : 'text-slate-500'
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  )

  const CourseCard = ({ course }: { course: CoastalCourse }) => {
    const active = course.id === selectedId
    return (
      <article
        id={`golf-map-course-${course.id}`}
        className={cx(
          'rounded-2xl bg-white p-4 shadow-sm ring-1 transition',
          active ? 'ring-2 ring-gs-green' : 'ring-slate-200 hover:ring-slate-300'
        )}
      >
        <button
          type="button"
          className="w-full min-h-[44px] text-left"
          onClick={() => selectCourse(course.id)}
          aria-expanded={active}
        >
          <p className="font-ge text-lg font-extrabold text-gs-dark">{course.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {course.region}
            {hotelMatch ? ' · hotel & transfer friendly' : null}
          </p>
          <p className="mt-2 text-sm leading-snug text-slate-600">{shortLine(course)}</p>
          <p className="mt-2 font-ge text-xs font-bold uppercase tracking-wider text-gs-green">
            Tap to plan a trip →
          </p>
        </button>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <GeButton
            href={planTripHref(course)}
            variant="gs-green"
            size="md"
            className="min-h-12 w-full flex-1 !normal-case !tracking-normal"
          >
            Plan a trip here
          </GeButton>
          <GeButton
            href={viewCourseHref(course)}
            variant="outline-gs-green"
            size="md"
            className="min-h-12 w-full flex-1 !normal-case !tracking-normal"
          >
            View course
          </GeButton>
        </div>
      </article>
    )
  }

  const ListPane = (
    <div className="space-y-3 overflow-y-auto overscroll-contain lg:max-h-[min(70vh,640px)] lg:pr-1">
      <p className="font-ge text-sm font-semibold text-slate-500">
        {filtered.length} course{filtered.length === 1 ? '' : 's'}
      </p>
      {filtered.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )

  const MapPane = (
    <MapTapToActivate
      className="h-[min(62vh,520px)] w-full rounded-2xl ring-1 ring-slate-200 lg:h-full lg:min-h-[520px]"
      label="Tap to use the map · two-finger to pan"
      active={mapInteractive}
      onActivate={() => {
        setMapInteractive(true)
        scrollGuardRef.current?.activate()
      }}
    >
      <div ref={mapRef} className="h-full w-full" role="img" aria-label="Costa del Sol golf courses map" />
    </MapTapToActivate>
  )

  return (
    <section
      id={GOLF_COURSES_MAP_SECTION_ID}
      className="border-t border-slate-100 bg-slate-50"
      aria-label="Costa del Sol golf map"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <m.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="space-y-4"
        >
          <div>
            <h2 className="font-ge text-2xl font-extrabold text-gs-dark sm:text-3xl">Find a course</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-600 sm:text-base">
              Pick from the list or the map. One tap opens details — no cluttered panels.
            </p>
          </div>

          {FilterBar}
          {MobileToggle}

          {/* Mobile: one pane */}
          <div className="lg:hidden">{mobilePane === 'list' ? ListPane : MapPane}</div>

          {/* Desktop: list left, map right */}
          <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(280px,380px)_1fr] lg:items-stretch">
            {ListPane}
            <div className="min-h-[520px]">{MapPane}</div>
          </div>
        </m.div>
      </div>

      {/* Bottom sheet — selected course */}
      <AnimatePresence>
        {selected ? (
          <m.div
            key={selected.id}
            role="dialog"
            aria-label={selected.name}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-[600] mx-auto max-w-lg px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:left-auto lg:right-6 lg:max-w-md"
          >
            <div className="rounded-t-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 lg:rounded-2xl">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 lg:hidden" aria-hidden />
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-ge text-xl font-extrabold text-gs-dark">{selected.name}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {selected.region}
                    {hotelMatch ? ' · hotel & transfer friendly' : null}
                  </p>
                </div>
                <DismissCloseButton onClick={() => selectCourse(null)} tone="light" />
              </div>
              <p className="text-sm text-slate-600">{shortLine(selected)}</p>
              <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-900 ring-1 ring-emerald-100">
                Next: open the trip builder with this course filled in — add transfers, hotel level (Value / Classic /
                Premium), nights, rounds, dates, group size and arrival time.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <GeButton
                  href={planTripHref(selected)}
                  variant="gs-green"
                  size="lg"
                  className="min-h-14 w-full !normal-case !tracking-normal"
                >
                  Plan a trip here
                </GeButton>
                <GeButton
                  href={viewCourseHref(selected)}
                  variant="outline-gs-green"
                  size="md"
                  className="min-h-12 w-full !normal-case !tracking-normal"
                >
                  View course
                </GeButton>
              </div>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
