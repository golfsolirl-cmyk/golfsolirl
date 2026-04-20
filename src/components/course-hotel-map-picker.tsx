import { useEffect, useRef, useState } from 'react'
import type { DivIcon, Map as LeafletMap, Marker } from 'leaflet'
import L from 'leaflet'
import { COURSES, NEARBY_HOTELS, type CourseHotelPickerValue, type NearbyHotel } from '../data/coastal-golf-data'
import { cx } from '../lib/utils'
import 'leaflet/dist/leaflet.css'

const STAR_OPTIONS = [3, 4, 5] as const

const makeIcon = (color: string, size = 14): DivIcon =>
  L.divIcon({
    className: 'gsol-leaflet-dot',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })

export interface CourseHotelMapPickerProps {
  readonly onSelectionChange?: (value: CourseHotelPickerValue) => void
  readonly initialCourseId?: string | null
  readonly initialHotel?: NearbyHotel | null
}

export function CourseHotelMapPicker({ onSelectionChange, initialCourseId, initialHotel }: CourseHotelMapPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const courseMarkersRef = useRef<Record<string, Marker>>({})
  const hotelMarkersRef = useRef<Marker[]>([])

  const [mapReady, setMapReady] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(initialCourseId ?? null)
  const [selectedHotel, setSelectedHotel] = useState<NearbyHotel | null>(initialHotel ?? null)
  const [activeStars, setActiveStars] = useState<Set<number>>(() => new Set([3, 4, 5]))

  useEffect(() => {
    setSelectedCourse(initialCourseId ?? null)
  }, [initialCourseId])

  useEffect(() => {
    setSelectedHotel(initialHotel ?? null)
  }, [initialHotel])

  useEffect(() => {
    onSelectionChange?.({ selectedCourse, selectedHotel })
  }, [selectedCourse, selectedHotel, onSelectionChange])

  useEffect(() => {
    setSelectedHotel((prev) => {
      if (!prev) {
        return prev
      }
      if (!activeStars.has(prev.stars)) {
        return null
      }
      return prev
    })
  }, [activeStars])

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

    COURSES.forEach((course) => {
      const marker = L.marker([course.lat, course.lng], {
        icon: makeIcon('#1D9E75'),
        zIndexOffset: 200
      })
        .addTo(map)
        .bindTooltip(course.name, { direction: 'top', offset: [0, -8] })

      marker.on('click', () => {
        setSelectedCourse((prev) => {
          if (prev === course.id) {
            return null
          }
          return course.id
        })
        setSelectedHotel(null)
      })
      courseMarkersRef.current[course.id] = marker
    })

    const t = window.setTimeout(() => {
      map.invalidateSize()
      setMapReady(true)
    }, 120)

    return () => {
      window.clearTimeout(t)
      map.remove()
      mapInstanceRef.current = null
      courseMarkersRef.current = {}
      setMapReady(false)
    }
  }, [])

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) {
      return
    }

    Object.entries(courseMarkersRef.current).forEach(([id, marker]) => {
      const isSel = id === selectedCourse
      marker.setIcon(makeIcon(isSel ? '#378ADD' : '#1D9E75', isSel ? 16 : 14))
    })

    if (selectedCourse) {
      const c = COURSES.find((x) => x.id === selectedCourse)
      if (c) {
        mapInstanceRef.current.panTo([c.lat, c.lng], { animate: true, duration: 0.5 })
      }
    }
  }, [selectedCourse, mapReady])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !mapReady) {
      return
    }

    hotelMarkersRef.current.forEach((m) => map.removeLayer(m))
    hotelMarkersRef.current = []

    if (!selectedCourse) {
      return
    }

    const hotels = (NEARBY_HOTELS[selectedCourse] ?? []).filter((h) => activeStars.has(h.stars))

    hotels.forEach((hotel) => {
      const isSelected = selectedHotel?.name === hotel.name
      const marker = L.marker([hotel.lat, hotel.lng], {
        icon: makeIcon(isSelected ? '#BA7517' : '#EF9F27', 12),
        zIndexOffset: isSelected ? 500 : 100
      })
        .addTo(map)
        .bindTooltip(`${hotel.name}<br>${'★'.repeat(hotel.stars)} · ${hotel.dist}`, {
          direction: 'top',
          offset: [0, -6]
        })

      marker.on('click', () => {
        setSelectedHotel((prev) => (prev?.name === hotel.name ? null : hotel))
      })
      hotelMarkersRef.current.push(marker)
    })
  }, [selectedCourse, activeStars, selectedHotel, mapReady])

  const handleClearAll = () => {
    setSelectedCourse(null)
    setSelectedHotel(null)
  }

  const handleToggleStar = (n: (typeof STAR_OPTIONS)[number]) => {
    setActiveStars((prev) => {
      const next = new Set(prev)
      if (next.has(n)) {
        if (next.size === 1) {
          return prev
        }
        next.delete(n)
      } else {
        next.add(n)
      }
      return next
    })
  }

  const handleHotelRowKeyDown = (event: React.KeyboardEvent, hotel: NearbyHotel) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }
    event.preventDefault()
    setSelectedHotel((prev) => (prev?.name === hotel.name ? null : hotel))
  }

  const filteredHotels = selectedCourse
    ? (NEARBY_HOTELS[selectedCourse] ?? []).filter((h) => activeStars.has(h.stars))
    : []

  const activeCourse = COURSES.find((c) => c.id === selectedCourse)

  return (
    <div className="w-full">
      <div
        ref={mapRef}
        className="z-0 h-[400px] w-full overflow-hidden rounded-[0.625rem] border border-forest-200 bg-offwhite"
        role="application"
        aria-label="Map of Costa del Sol golf courses. Click a pin to select a course."
      />

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-forest-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1D9E75]" aria-hidden="true" />
          Golf course
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#378ADD]" aria-hidden="true" />
          Selected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#EF9F27]" aria-hidden="true" />
          Nearby hotel
        </span>
      </div>

      {activeCourse ? (
        <div className="mt-3 overflow-hidden rounded-[0.625rem] border border-forest-200">
          <div className="flex items-center justify-between gap-3 border-b border-forest-200 bg-offwhite px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-forest-900">{activeCourse.name}</p>
              <p className="mt-0.5 text-xs text-forest-600">
                {activeCourse.region} · {activeCourse.rating}/5
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg border border-forest-200 bg-white px-2 py-1 text-xs font-medium text-forest-700 transition-colors hover:bg-forest-50"
              onClick={handleClearAll}
              aria-label="Clear course and hotel selection"
            >
              ×
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-forest-200 bg-[#f4f4f0] px-4 py-2.5">
            <span className="text-xs text-forest-600">Hotel stars:</span>
            {STAR_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                className={cx(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  activeStars.has(n)
                    ? 'border-fairway-600 bg-fairway-600 font-semibold text-white'
                    : 'border-forest-200 bg-white text-forest-600 hover:border-forest-300'
                )}
                onClick={() => handleToggleStar(n)}
                aria-pressed={activeStars.has(n)}
              >
                {n}★
              </button>
            ))}
          </div>

          {filteredHotels.length === 0 ? (
            <p className="px-4 py-4 text-center text-sm text-forest-600">No hotels match the selected star rating near this course.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {filteredHotels.map((hotel) => {
                const isSelected = selectedHotel?.name === hotel.name
                return (
                  <li
                    key={hotel.name}
                    className={cx(
                      'flex cursor-pointer items-center justify-between gap-3 border-b border-forest-100 px-4 py-3 transition-colors last:border-b-0',
                      isSelected ? 'border-l-[3px] border-l-fairway-600 bg-fairway-50/80 pl-[13px]' : 'hover:bg-offwhite'
                    )}
                    onClick={() => setSelectedHotel((prev) => (prev?.name === hotel.name ? null : hotel))}
                    onKeyDown={(e) => handleHotelRowKeyDown(e, hotel)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${hotel.name}, ${hotel.stars} stars, ${hotel.dist} from course`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-forest-900">{hotel.name}</p>
                      <p className="mt-0.5 text-xs text-gold-700">
                        {'★'.repeat(hotel.stars)}
                        {'☆'.repeat(5 - hotel.stars)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-offwhite px-2 py-0.5 text-[11px] text-forest-700">{hotel.rating}/5</span>
                      <span className="text-[11px] text-forest-500">{hotel.dist}</span>
                      {isSelected ? (
                        <span
                          className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-fairway-700 text-[10px] text-white"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-forest-200 px-4 py-3.5 text-center text-sm text-forest-500">
          Click a green pin to choose your golf course
        </p>
      )}

      {selectedCourse && selectedHotel && activeCourse ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-gold-200/60 bg-offwhite px-3 py-2.5 text-sm text-forest-900">
          <span>
            <strong>{activeCourse.name}</strong> + <strong>{selectedHotel.name}</strong> {`${'★'.repeat(selectedHotel.stars)}`}
          </span>
          <span className="text-xs font-medium text-gold-600">{selectedHotel.dist} from course</span>
          <button
            type="button"
            className="ml-auto text-xs font-semibold text-gold-700 underline decoration-gold-500/50 hover:text-gold-800"
            onClick={() => setSelectedHotel(null)}
          >
            Change hotel
          </button>
        </div>
      ) : null}
    </div>
  )
}
