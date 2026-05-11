import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Compass, MapPin, Send, Sparkles, X } from 'lucide-react'
import L from 'leaflet'
import type { DivIcon, Map as LeafletMap, Marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { COURSES, type CoastalCourse, type CourseTier } from '../../../data/coastal-golf-data'
import { contactInfo } from '../data/copy'
import { golferGroupSizeSelectOptions } from '../data/form-people-options'
import { assertDatesNotBooked, loadBookedServiceDayIsoSet } from '../../../lib/booked-service-days'
import { getLocalDateIso } from '../../../lib/local-date-iso'
import { plannedTravelDatesErrorMessage, travelEndMinIso, travelStartMinIso } from '../../../lib/travel-date-bounds'
import {
  ENQUIRY_STRUCTURED_FIELD_KEYS,
  PICKUP_DROPOFF_TYPES,
  TRIP_ARRIVAL_MODE,
  WEBSITE_ENQUIRY_FORM
} from '../../../lib/enquiry-form-registry'
import { getSupabaseBrowserClient } from '../../../lib/supabase-client'
import { ENQUIRY_CONFLICT_EXISTING_PHONE, postWebsiteEnquiry } from '../../../lib/post-enquiry-client'
import { BookedDatesAvailabilityNotice } from '../../../components/booked-dates-availability-notice'
import { GeButton } from './ge-button'
import { cx } from '../../../lib/utils'

export const GOLF_COURSES_MAP_SECTION_ID = 'golf-sol-course-corridor'

/** Interactive corridor map: main + cluster golf course URLs and the promo golf map page. */
export function shouldShowInteractiveCourseMap(path: string): boolean {
  return path === '/golf-map' || path.includes('/golf-courses')
}

const labelClass =
  'mb-1.5 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.14em] text-ge-gray500 sm:text-[0.82rem]'
const inputClass =
  'h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1.02rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25 sm:text-[1.04rem]'

const tierLabel: Record<CourseTier, string> = {
  value: 'Great value',
  premium: 'Premium pick',
  luxury: 'Signature / flagship'
}

const tierAccent: Record<CourseTier, string> = {
  value: 'from-gs-green/90 to-emerald-700',
  premium: 'from-amber-600 to-gs-gold',
  luxury: 'from-amber-900 to-gs-gold'
}

function makeCourseIcon(tier: CourseTier, selected: boolean): DivIcon {
  const core =
    tier === 'luxury'
      ? 'linear-gradient(135deg,#3d2914,#8b5a2a)'
      : tier === 'premium'
        ? 'linear-gradient(135deg,#9a6f08,#f7d978)'
        : 'linear-gradient(135deg,#063b2a,#1d9e75)'
  const size = selected ? 26 : 18
  const ring = selected ? '0 0 0 3px rgba(247,217,120,0.95),0 6px 18px rgba(6,59,42,0.45)' : '0 2px 8px rgba(0,0,0,0.28)'
  return L.divIcon({
    className: 'gsol-leaflet-dot',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${core};border:2.5px solid #fff;box-shadow:${ring}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

function visibleCoursesForPath(path: string): readonly CoastalCourse[] {
  if (path.includes('/golf-courses/sotogrande')) {
    return COURSES.filter(
      (c) =>
        ['Sotogrande', 'San Roque', 'Casares'].some((r) => c.region.includes(r)) ||
        ['valderrama', 'sotogrande', 'sanroque', 'lahacienda', 'fincacortesin'].includes(c.id)
    )
  }
  if (path.includes('/golf-courses/marbella-golf-valley')) {
    return COURSES.filter(
      (c) =>
        ['Nueva Andalucía', 'Marbella', 'Marbella East'].includes(c.region) ||
        ['lasbrisas', 'losnaranjos', 'cabopino', 'santamaria', 'santaclara', 'higueron'].includes(c.id)
    )
  }
  if (path.includes('/golf-courses/mijas-fuengirola')) {
    return COURSES.filter(
      (c) =>
        ['Mijas', 'Mijas Costa', 'Benalmádena', 'Alhaurín de la Torre'].includes(c.region) ||
        ['torrequebrada', 'lauro', 'chaparral', 'lacala'].includes(c.id)
    )
  }
  return COURSES
}

function corridorSubtitle(path: string): string {
  if (path.includes('/golf-courses/sotogrande')) return 'Pins focused on the Sotogrande & western corridor — tap a course to open your Irish-team brief.'
  if (path.includes('/golf-courses/marbella-golf-valley')) return 'Nueva Andalucía & Marbella clusters — compare pins, then tell us how your society likes to play.'
  if (path.includes('/golf-courses/mijas-fuengirola')) return 'Mijas, Mijas Costa & Benalmádena belt — pick a course and we shape tee windows around your base.'
  if (path === '/golf-map')
    return 'Promo map view — the same Sol corridor pins as our course pages. Tap the map or roster to brief the Irish team with route context.'
  return 'Málaga to Sotogrande — every pin is a course we route Irish groups to. Tap the map or the roster to generate your brief.'
}

export interface GeCoursesInteractiveCorridorProps {
  readonly path: string
  readonly routeLabel: string
}

export function GeCoursesInteractiveCorridor({ path, routeLabel }: GeCoursesInteractiveCorridorProps) {
  const formId = useId()
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Record<string, Marker>>({})

  const visibleCourses = useMemo(() => visibleCoursesForPath(path), [path])
  const [mapReady, setMapReady] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('')
  const [tripArrivalMode, setTripArrivalMode] = useState<(typeof TRIP_ARRIVAL_MODE)[keyof typeof TRIP_ARRIVAL_MODE]>(
    TRIP_ARRIVAL_MODE.planned
  )
  const [travelDateFrom, setTravelDateFrom] = useState('')
  const [travelDateTo, setTravelDateTo] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [bookedDays, setBookedDays] = useState<Set<string>>(() => new Set())

  const selectedCourse = useMemo(
    () => (selectedId ? visibleCourses.find((c) => c.id === selectedId) ?? null : null),
    [selectedId, visibleCourses]
  )

  const selectCourse = useCallback((id: string | null) => {
    setSelectedId(id)
    setStatus('idle')
    setErrorMessage(null)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const booked = await loadBookedServiceDayIsoSet(getSupabaseBrowserClient())
      if (!cancelled) {
        setBookedDays(booked)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (tripArrivalMode !== TRIP_ARRIVAL_MODE.alreadyAtAgp) {
      return
    }
    const iso = getLocalDateIso()
    setTravelDateFrom(iso)
    setTravelDateTo(iso)
  }, [tripArrivalMode])

  useEffect(() => {
    if (tripArrivalMode !== TRIP_ARRIVAL_MODE.planned) {
      return
    }
    const t = travelStartMinIso()
    const df = travelDateFrom.trim().slice(0, 10)
    const dt = travelDateTo.trim().slice(0, 10)
    if (df.length === 10 && df < t) {
      setTravelDateFrom(t)
      return
    }
    if (df.length === 10 && dt.length === 10) {
      const endMin = travelEndMinIso(df)
      if (dt < endMin) {
        setTravelDateTo(endMin)
      }
    }
  }, [tripArrivalMode, travelDateFrom, travelDateTo])

  useEffect(() => {
    setSelectedId((prev) => {
      if (!prev) {
        return null
      }
      return visibleCourses.some((c) => c.id === prev) ? prev : null
    })
  }, [path, visibleCourses])

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) {
      return
    }

    const map = L.map(mapRef.current, {
      center: [36.44, -4.98],
      zoom: 10,
      scrollWheelZoom: false,
      zoomControl: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)

    mapInstanceRef.current = map

    const t = window.setTimeout(() => {
      map.invalidateSize()
      setMapReady(true)
    }, 160)

    return () => {
      window.clearTimeout(t)
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = {}
      setMapReady(false)
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !mapReady) {
      return
    }

    Object.values(markersRef.current).forEach((m) => map.removeLayer(m))
    markersRef.current = {}

    visibleCourses.forEach((course) => {
      const marker = L.marker([course.lat, course.lng], {
        icon: makeCourseIcon(course.tier, course.id === selectedId),
        zIndexOffset: course.id === selectedId ? 800 : 200
      })
        .addTo(map)
        .bindTooltip(`${course.name}`, { direction: 'top', offset: [0, -10], className: 'gsol-course-tooltip' })

      marker.on('click', () => {
        selectCourse(course.id)
      })
      markersRef.current[course.id] = marker
    })

    if (visibleCourses.length > 0) {
      const bounds = L.latLngBounds(visibleCourses.map((c) => [c.lat, c.lng] as [number, number]))
      map.fitBounds(bounds.pad(0.14), { animate: false })
    }

    window.setTimeout(() => map.invalidateSize(), 80)
  }, [mapReady, visibleCourses, selectCourse])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !mapReady) {
      return
    }
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const course = visibleCourses.find((c) => c.id === id)
      if (!course) {
        return
      }
      marker.setIcon(makeCourseIcon(course.tier, id === selectedId))
      marker.setZIndexOffset(id === selectedId ? 800 : 200)
    })
    if (selectedId) {
      const c = visibleCourses.find((x) => x.id === selectedId)
      if (c) {
        map.panTo([c.lat, c.lng], { animate: true, duration: 0.45 })
      }
    }
  }, [selectedId, mapReady, visibleCourses])

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) {
      return
    }
    const map = mapInstanceRef.current
    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(() => map.invalidateSize())
    })
    if (mapRef.current) {
      ro.observe(mapRef.current)
    }
    return () => ro.disconnect()
  }, [mapReady])

  useEffect(() => {
    if (!selectedCourse) {
      return
    }
    const t = window.setTimeout(() => mapInstanceRef.current?.invalidateSize(), 320)
    return () => window.clearTimeout(t)
  }, [selectedCourse])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    if (!selectedCourse) {
      return
    }

    const name = fullName.trim()
    const mail = email.trim().toLowerCase()
    const phone = phoneWhatsApp.trim()
    const df = travelDateFrom.trim()
    const dt = travelDateTo.trim()
    const size = groupSize.trim()
    const note = notes.trim()

    if (!name || !mail || !phone || !size) {
      setErrorMessage('Please add name, email, phone, and group size.')
      setStatus('error')
      return
    }
    if (tripArrivalMode === TRIP_ARRIVAL_MODE.planned && (!df || !dt)) {
      setErrorMessage('Add travel start and end dates, or choose “Already at Málaga (AGP)”.')
      setStatus('error')
      return
    }
    if (tripArrivalMode === TRIP_ARRIVAL_MODE.planned) {
      const plannedErr = plannedTravelDatesErrorMessage(df, dt)
      if (plannedErr) {
        setErrorMessage(plannedErr)
        setStatus('error')
        return
      }
    }
    if (tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp) {
      const today = getLocalDateIso()
      if (df !== today || dt !== today) {
        setErrorMessage('When you are already here, both travel dates must be set to today only.')
        setStatus('error')
        return
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setErrorMessage('Please enter a valid email address.')
      setStatus('error')
      return
    }

    const bookedDates = tripArrivalMode === TRIP_ARRIVAL_MODE.planned ? [df, dt] : [df, dt]
    const bookedMsg = assertDatesNotBooked(bookedDays, bookedDates)
    if (bookedMsg) {
      setErrorMessage(bookedMsg)
      setStatus('error')
      return
    }

    const datesSummary =
      tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
        ? `Trip timing: Already at Málaga (AGP)${df || dt ? ` (${[df, dt].filter(Boolean).join(' → ')})` : ''}`
        : `Trip timing: ${df} → ${dt}`

    const interest = [
      `COURSE MAP — ${selectedCourse.name}`,
      `Course ID: ${selectedCourse.id}`,
      `Region: ${selectedCourse.region}`,
      `Tier: ${tierLabel[selectedCourse.tier]}`,
      `Page: ${routeLabel} (${path})`,
      datesSummary,
      `Group size: ${size}`,
      note ? `Notes: ${note}` : null
    ]
      .filter(Boolean)
      .join('\n')

    const sizePax = size.trim().match(/^(\d+)/)

    setStatus('submitting')
    setErrorCode(null)
    try {
      const result = await postWebsiteEnquiry({
        fullName: name,
        email: mail,
        phoneWhatsApp: phone,
        interest,
        bestTimeToCall: 'Course map enquiry',
        formPayload: {
          form: WEBSITE_ENQUIRY_FORM.courseMap,
          fields: {
            Course: selectedCourse.name,
            'Course ID': selectedCourse.id,
            Region: selectedCourse.region,
            Tier: tierLabel[selectedCourse.tier],
            Page: `${routeLabel} (${path})`,
            'Trip timing':
              tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
                ? 'Already at Málaga (AGP) — need transfers now'
                : 'Planned trip — dated',
            [ENQUIRY_STRUCTURED_FIELD_KEYS.alreadyAtMalagaAgp]:
              tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp ? 'yes' : 'no',
            ...(df ? { [ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom]: df, 'Travel start date': df } : {}),
            ...(dt ? { [ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo]: dt, 'Travel end date': dt } : {}),
            'Group size': size,
            [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType]: PICKUP_DROPOFF_TYPES.golfCourse,
            [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffId]: selectedCourse.id,
            [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffLabel]: selectedCourse.name,
            ...(sizePax?.[1] ? { [ENQUIRY_STRUCTURED_FIELD_KEYS.pax]: sizePax[1] } : {}),
            ...(note ? { Notes: note } : {})
          }
        }
      })

      if (!result.ok) {
        setStatus('error')
        setErrorMessage(result.message)
        setErrorCode(result.code ?? null)
        return
      }

      setStatus('success')
      setErrorCode(null)
      setFullName('')
      setEmail('')
      setPhoneWhatsApp('')
      setTripArrivalMode(TRIP_ARRIVAL_MODE.planned)
      setTravelDateFrom('')
      setTravelDateTo('')
      setGroupSize('')
      setNotes('')
    } catch (e) {
      setStatus('error')
      setErrorCode(null)
      setErrorMessage(e instanceof Error ? e.message : 'Could not send your request right now.')
    }
  }

  const corridorAgpToday = getLocalDateIso()
  const corridorPlannedStartMin = tripArrivalMode === TRIP_ARRIVAL_MODE.planned ? travelStartMinIso() : undefined
  const corridorPlannedEndMin = tripArrivalMode === TRIP_ARRIVAL_MODE.planned ? travelEndMinIso(travelDateFrom) : undefined

  return (
    <section
      id={GOLF_COURSES_MAP_SECTION_ID}
      aria-labelledby={`${formId}-corridor-title`}
      className="relative scroll-mt-28 overflow-hidden border-y border-amber-200/50 bg-[linear-gradient(180deg,#fffdf8_0%,#fff6e8_42%,#f3faf6_100%)] py-16 text-gs-dark sm:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(255,214,140,0.35),transparent_45%),radial-gradient(ellipse_at_90%_20%,rgba(180,230,210,0.28),transparent_40%),radial-gradient(ellipse_at_50%_100%,rgba(255,235,200,0.4),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:repeating-linear-gradient(-11deg,transparent,transparent_5px,rgba(6,59,42,0.03)_5px,rgba(6,59,42,0.03)_6px)]"
      />

      <div className="relative mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-gs-green">
              <Compass className="h-4 w-4 text-gs-gold" aria-hidden />
              Interactive corridor
            </p>
            <h2
              id={`${formId}-corridor-title`}
              className="mt-3 font-ge text-[2rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-gs-dark sm:text-[2.45rem] lg:text-[2.75rem]"
            >
              Pin your course.{' '}
              <span className="bg-gradient-to-r from-amber-700 via-gs-gold to-amber-600 bg-clip-text text-transparent">We build the sheet.</span>
            </h2>
            <p className="mt-4 max-w-2xl font-ge text-[1.05rem] leading-8 text-ge-gray600 sm:text-[1.08rem]">{corridorSubtitle(path)}</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="rounded-full border border-amber-200/80 bg-white px-3 py-1.5 font-ge text-[0.68rem] font-bold uppercase tracking-[0.14em] text-gs-dark shadow-sm">
              {visibleCourses.length} courses
            </span>
            <span className="rounded-full border border-gs-green/25 bg-[#e8f5ef] px-3 py-1.5 font-ge text-[0.68rem] font-bold uppercase tracking-[0.14em] text-gs-green">
              Irish routing
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-stretch">
          <div className="relative min-h-[min(72vh,520px)] overflow-hidden rounded-[1.85rem] border-2 border-amber-200/90 bg-white shadow-[0_24px_70px_rgba(203,148,26,0.15)] ring-1 ring-gs-green/10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65),inset_0_-20px_50px_rgba(255,214,140,0.12)]"
            />
            <div ref={mapRef} className="relative z-[1] h-full min-h-[min(72vh,520px)] w-full bg-[#eef6f1]" role="application" aria-label="Interactive map of Costa del Sol golf courses" />
            <div className="pointer-events-none absolute bottom-4 left-4 z-[400] flex max-w-[min(100%,260px)] flex-col gap-1.5 rounded-xl border-2 border-amber-200/90 bg-[#fffdf8] px-3 py-2.5 text-[0.7rem] font-medium text-gs-dark shadow-md sm:text-[0.72rem]">
              <span className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-gs-green">Legend</span>
              <span className="flex items-center gap-2 text-ge-gray600">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-gs-green to-emerald-600" aria-hidden /> Value
              </span>
              <span className="flex items-center gap-2 text-ge-gray600">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-600 to-gs-gold" aria-hidden /> Premium
              </span>
              <span className="flex items-center gap-2 text-ge-gray600">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-950 to-amber-700" aria-hidden /> Luxury
              </span>
              <span className="mt-1 border-t border-amber-100 pt-1.5 text-[0.65rem] text-ge-gray500">Two-finger pan · + / − to zoom</span>
            </div>
          </div>

          <aside className="flex max-h-[min(72vh,520px)] flex-col rounded-[1.5rem] border border-amber-200/70 bg-white p-4 shadow-[0_16px_40px_rgba(203,148,26,0.1)] sm:p-5">
            <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-gs-green">Course roster</p>
            <p className="mt-1 font-ge text-xs leading-relaxed text-ge-gray500">Select a row — the map and your brief stay in sync.</p>
            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 [scrollbar-color:rgba(6,59,42,0.2)_transparent] [scrollbar-width:thin]">
              {visibleCourses.map((course) => {
                const active = course.id === selectedId
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => selectCourse(course.id)}
                    className={cx(
                      'group flex w-full flex-col rounded-xl border px-3.5 py-3 text-left transition-all duration-300',
                      active
                        ? 'border-gs-gold/70 bg-gradient-to-br from-amber-50 to-white shadow-md ring-1 ring-gs-gold/30'
                        : 'border-ge-gray100 bg-[#fffef9] hover:border-amber-200 hover:bg-white'
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-ge text-[0.95rem] font-bold leading-snug text-gs-dark">{course.name}</span>
                      <MapPin className={cx('mt-0.5 h-4 w-4 shrink-0', active ? 'text-gs-gold' : 'text-ge-gray300')} aria-hidden />
                    </span>
                    <span className="mt-1 font-ge text-[0.78rem] text-ge-gray500">{course.region}</span>
                    <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50/90 px-2 py-0.5 font-ge text-[0.65rem] font-bold uppercase tracking-[0.12em] text-gs-dark">
                      <span className={cx('h-1.5 w-8 rounded-full bg-gradient-to-r', tierAccent[course.tier])} aria-hidden />
                      {tierLabel[course.tier]}
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>
        </div>

        <AnimatePresence mode="wait">
          {selectedCourse ? (
            <motion.div
              key={selectedCourse.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 overflow-hidden rounded-[1.85rem] border border-gs-gold/35 bg-[linear-gradient(145deg,rgba(255,250,240,0.98)_0%,#fff_48%,#faf6ec_100%)] text-gs-dark shadow-[0_32px_90px_rgba(6,59,42,0.28)]"
            >
              <div className="relative border-b border-gs-dark/8 bg-[linear-gradient(90deg,rgba(6,59,42,0.04),transparent)] px-6 py-5 sm:px-8 sm:py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-gs-green">
                      <Sparkles className="h-4 w-4 text-gs-gold" aria-hidden />
                      Brief unlocked
                    </p>
                    <h3 className="mt-2 font-ge text-[1.65rem] font-extrabold leading-tight text-gs-dark sm:text-[1.9rem]">{selectedCourse.name}</h3>
                    <p className="mt-2 font-ge text-sm text-ge-gray500">
                      {selectedCourse.region} · {selectedCourse.rating.toFixed(1)} community rating · {tierLabel[selectedCourse.tier]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectCourse(null)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gs-dark/10 bg-white text-gs-dark transition-colors hover:border-gs-green hover:bg-gs-green hover:text-white"
                    aria-label="Clear course selection"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {status === 'success' ? (
                <div className="px-6 py-10 text-center sm:px-8 sm:py-12">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-gs-green" aria-hidden />
                  <p className="mt-4 font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-gs-green">Request received</p>
                  <p className="mx-auto mt-3 max-w-lg font-ge text-base leading-relaxed text-ge-gray500">
                    The Irish desk has your pick for <strong>{selectedCourse.name}</strong>. We will reply with tee-window ideas and routing that fits your group.
                  </p>
                  <GeButton type="button" variant="outline-gs-green" size="md" className="mt-6" onClick={() => selectCourse(null)}>
                    Choose another course
                  </GeButton>
                </div>
              ) : (
                <>
                  <BookedDatesAvailabilityNotice
                    bookedDays={bookedDays}
                    className="px-6 pt-6 sm:px-8 sm:pt-8"
                    watchDates={[travelDateFrom, travelDateTo]}
                  />
                  <form
                    id={`${formId}-course-brief`}
                    className="space-y-4 px-6 pb-6 pt-2 sm:space-y-5 sm:px-8 sm:pb-8 sm:pt-3"
                    onSubmit={handleSubmit}
                    noValidate
                  >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-1">
                      <span className={labelClass}>Full name</span>
                      <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required placeholder="Organiser name" />
                    </label>
                    <label className="block sm:col-span-1">
                      <span className={labelClass}>Email</span>
                      <input
                        className={inputClass}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className={labelClass}>Phone / WhatsApp</span>
                      <input
                        className={inputClass}
                        value={phoneWhatsApp}
                        onChange={(e) => setPhoneWhatsApp(e.target.value)}
                        type="tel"
                        autoComplete="tel"
                        required
                        placeholder={contactInfo.phoneFieldPlaceholder}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className={labelClass}>Trip timing</span>
                      <select
                        className={inputClass}
                        value={tripArrivalMode}
                        onChange={(e) => {
                          const next =
                            e.target.value === TRIP_ARRIVAL_MODE.alreadyAtAgp
                              ? TRIP_ARRIVAL_MODE.alreadyAtAgp
                              : TRIP_ARRIVAL_MODE.planned
                          setTripArrivalMode(next)
                          if (next === TRIP_ARRIVAL_MODE.alreadyAtAgp) {
                            const t = getLocalDateIso()
                            setTravelDateFrom(t)
                            setTravelDateTo(t)
                          }
                        }}
                      >
                        <option value={TRIP_ARRIVAL_MODE.planned}>I have travel dates (arrival and departure)</option>
                        <option value={TRIP_ARRIVAL_MODE.alreadyAtAgp}>Already at Málaga (AGP) — need transfers now</option>
                      </select>
                    </label>
                    <label className="block sm:col-span-1">
                      <span className={labelClass}>Travel start date</span>
                      <input
                        className={inputClass}
                        type="date"
                        value={travelDateFrom}
                        min={
                          tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
                            ? corridorAgpToday
                            : tripArrivalMode === TRIP_ARRIVAL_MODE.planned
                              ? corridorPlannedStartMin
                              : undefined
                        }
                        max={tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp ? corridorAgpToday : undefined}
                        onChange={(e) => setTravelDateFrom(e.target.value)}
                      />
                    </label>
                    <label className="block sm:col-span-1">
                      <span className={labelClass}>Travel end date</span>
                      <input
                        className={inputClass}
                        type="date"
                        value={travelDateTo}
                        min={
                          tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
                            ? corridorAgpToday
                            : tripArrivalMode === TRIP_ARRIVAL_MODE.planned
                              ? corridorPlannedEndMin
                              : undefined
                        }
                        max={tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp ? corridorAgpToday : undefined}
                        onChange={(e) => setTravelDateTo(e.target.value)}
                      />
                    </label>
                    <label className="block sm:col-span-1">
                      <span className={labelClass}>Group size</span>
                      <select className={inputClass} value={groupSize} onChange={(e) => setGroupSize(e.target.value)} required>
                        <option value="">Select</option>
                        {golferGroupSizeSelectOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block sm:col-span-2">
                      <span className={labelClass}>What should we know?</span>
                      <textarea
                        className="min-h-[120px] w-full rounded-xl border border-ge-gray200 bg-white px-3.5 py-3 font-ge text-[1.02rem] leading-7 text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25 sm:text-[1.04rem]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Handicap mix, must-play second course, twilight vs morning, society pace…"
                      />
                    </label>
                  </div>

                  {status === 'error' && errorMessage ? (
                    <div className="rounded-xl border border-ge-orange/40 bg-orange-50 px-3 py-2.5 font-ge text-sm text-gs-dark">
                      <p>{errorMessage}</p>
                      {errorCode === ENQUIRY_CONFLICT_EXISTING_PHONE ? (
                        <p className="mt-2 font-semibold text-gs-green">
                          <a className="underline underline-offset-2" href="/dashboard/login">
                            Sign in to your trip desk
                          </a>
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-4 border-t border-gs-dark/6 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-md font-ge text-xs leading-relaxed text-ge-gray500">
                      Prefer the long-form brief?{' '}
                      <a href="#ge-content-enquire" className="font-bold text-gs-green underline decoration-gs-gold/40 decoration-2 underline-offset-4 hover:text-gs-dark">
                        Jump to the full enquiry
                      </a>
                      .
                    </p>
                    <GeButton type="submit" variant="gs-gold" size="lg" disabled={status === 'submitting'} className="w-full min-w-[200px] sm:w-auto">
                      <Send className="h-4 w-4" aria-hidden />
                      {status === 'submitting' ? 'Sending…' : 'Send course brief'}
                    </GeButton>
                  </div>
                </form>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10 rounded-2xl border border-dashed border-amber-200/90 bg-white/80 px-6 py-8 text-center shadow-sm sm:py-10"
            >
              <p className="font-ge text-sm font-semibold text-gs-dark sm:text-base">Select a course on the map or from the roster to generate your branded brief card.</p>
              <p className="mx-auto mt-2 max-w-lg font-ge text-xs leading-relaxed text-ge-gray500 sm:text-sm">
                Your choice drives the enquiry — we attach routing context automatically so the Irish team sees the same course you tapped.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
