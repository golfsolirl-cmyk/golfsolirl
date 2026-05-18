import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker, Polyline } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { GeButton } from '../pages/golf-experience/components/ge-button'
import { ClientTransferTrackMap } from './client-transfer-track-map'
import { filterTransferPlaceOptions, type TransferPlaceOption } from '../lib/transfer-location-suggestions'
import { cx } from '../lib/utils'
import { GOLFSOL_BRAND_LOGO } from '../lib/brand-logo-assets'

type BookingRow = {
  id: string
  status: string
  pickup_label: string
  dropoff_label: string
  created_at: string
  scheduled_at?: string | null
  cancel_reason?: string | null
}

type ViaStop = {
  id: string
  label: string
  lat: number | null
  lng: number | null
}

const MAX_VIAS = 7

/** Málaga–Costa del Sol (AGP) main terminal / typical arrivals meet — map default & quick pickup. */
const MALAGA_AGP_CENTER: [number, number] = [36.6752, -4.4988]
const MALAGA_AGP_ZOOM = 16

const LOGO_PRIMARY_SRC = GOLFSOL_BRAND_LOGO.svg
const LOGO_FALLBACK_SRC = GOLFSOL_BRAND_LOGO.png

const MAP_MARKER_W = 118
const MAP_MARKER_H = 92
const MAP_ICON_ANCHOR_X = Math.round(MAP_MARKER_W / 2)
const MAP_ICON_ANCHOR_Y = MAP_MARKER_H

const makeBrandedTransferMapIcon = (kind: 'pickup' | 'dropoff') => {
  const label = kind === 'pickup' ? 'Pickup point' : 'Drop off point'
  const chipBorder = kind === 'pickup' ? '#136047' : '#0b4934'
  const chipBg = kind === 'pickup' ? 'rgba(255,249,234,0.97)' : 'rgba(246,251,248,0.97)'
  const chipColor = kind === 'pickup' ? '#1a1404' : '#0a2008'
  const html = `<div class="gsol-transfer-map-marker-inner" style="width:${MAP_MARKER_W}px;height:${MAP_MARKER_H}px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:5px;">
    <img draggable="false" src="${LOGO_PRIMARY_SRC}" width="48" height="48" alt="" style="display:block;width:48px;height:48px;object-fit:contain;user-select:none;pointer-events:none;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.28));" onerror="this.onerror=null;this.src='${LOGO_FALLBACK_SRC}'" />
    <span style="pointer-events:none;font-family:system-ui,-apple-system,sans-serif;font-size:9px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${chipColor};background:${chipBg};border:1.5px solid ${chipBorder};border-radius:999px;padding:4px 10px;line-height:1.2;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.12);">${label}</span>
  </div>`
  return L.divIcon({
    className: 'gsol-transfer-map-marker',
    html,
    iconSize: L.point(MAP_MARKER_W, MAP_MARKER_H),
    iconAnchor: L.point(MAP_ICON_ANCHOR_X, MAP_ICON_ANCHOR_Y)
  })
}

const makeViaMapIcon = (index1: number) =>
  L.divIcon({
    className: 'gsol-transfer-map-marker',
    html: `<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(145deg,#f4c934,#ffe78a);border:2px solid #0b4934;display:flex;align-items:center;justify-content:center;font:bold 11px system-ui,sans-serif;color:#0a2008;box-shadow:0 2px 6px rgba(0,0,0,0.2);">${index1}</div>`,
    iconSize: L.point(30, 30),
    iconAnchor: L.point(15, 15)
  })

const toDatetimeLocalValue = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type PlaceTypeaheadProps = {
  readonly inputId: string
  readonly value: string
  readonly onChangeValue: (v: string) => void
  readonly onPickPlace: (p: TransferPlaceOption) => void
  readonly placeholder?: string
}

/**
 * Type-as-you-go suggestions (no native datalist dropdown): picks place map + label together.
 */
function PlaceTypeahead({ inputId, value, onChangeValue, onPickPlace, placeholder }: PlaceTypeaheadProps) {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const blurTimer = useRef<number | null>(null)
  const suggestions = useMemo(() => filterTransferPlaceOptions(value, 14), [value])

  useEffect(() => {
    if (!open) {
      return
    }
    setHi(0)
  }, [value, open])

  const cancelBlurTimer = () => {
    if (blurTimer.current != null) {
      window.clearTimeout(blurTimer.current)
      blurTimer.current = null
    }
  }

  const scheduleClose = () => {
    cancelBlurTimer()
    blurTimer.current = window.setTimeout(() => setOpen(false), 160)
  }

  return (
    <div className="relative">
      <input
        autoComplete="off"
        className="mt-1 w-full rounded-xl border-2 border-forest-200 px-3 py-2 text-sm text-forest-900 outline-none ring-fairway-400/30 focus:border-fairway-500 focus:ring-2"
        id={inputId}
        onBlur={scheduleClose}
        onChange={(e) => {
          const v = e.target.value
          onChangeValue(v)
          setOpen(v.trim().length >= 2)
        }}
        onFocus={() => {
          cancelBlurTimer()
          if (value.trim().length >= 2) {
            setOpen(true)
          }
        }}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) {
            return
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHi((h) => Math.min(suggestions.length - 1, h + 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHi((h) => Math.max(0, h - 1))
          } else if (e.key === 'Enter') {
            e.preventDefault()
            onPickPlace(suggestions[hi])
            setOpen(false)
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      {open && suggestions.length > 0 ? (
        <ul
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-auto rounded-xl border border-forest-200 bg-white py-1 shadow-lg ring-1 ring-black/5"
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li key={`${s.label}-${i}`} role="option" aria-selected={i === hi}>
              <button
                className={cx(
                  'w-full px-3 py-2.5 text-left text-sm text-forest-900 transition-colors',
                  i === hi ? 'bg-fairway-50' : 'hover:bg-offwhite/90'
                )}
                onMouseDown={(e) => e.preventDefault()}
                type="button"
                onClick={() => {
                  cancelBlurTimer()
                  onPickPlace(s)
                  setOpen(false)
                }}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function ClientTransferRequestPanel() {
  const supabase = getSupabaseBrowserClient()
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInst = useRef<LeafletMap | null>(null)
  const pickupMarker = useRef<Marker | null>(null)
  const dropMarker = useRef<Marker | null>(null)
  const viaMarkers = useRef<Marker[]>([])
  const routeLine = useRef<Polyline | null>(null)
  const activeMapTargetRef = useRef<'pickup' | 'dropoff'>('pickup')

  const [activeMapTarget, setActiveMapTarget] = useState<'pickup' | 'dropoff'>('pickup')
  const [pickup, setPickup] = useState<{ lat: number; lng: number } | null>(null)
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number } | null>(null)
  const [pickupLabel, setPickupLabel] = useState('')
  const [dropoffLabel, setDropoffLabel] = useState('')
  const [vias, setVias] = useState<ViaStop[]>([])
  const [scheduleMode, setScheduleMode] = useState<'asap' | 'scheduled'>('asap')
  const [scheduledAtLocal, setScheduledAtLocal] = useState('')
  const [datetimeMin, setDatetimeMin] = useState(() => toDatetimeLocalValue(new Date()))
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [tableMissing, setTableMissing] = useState(false)

  useEffect(() => {
    activeMapTargetRef.current = activeMapTarget
  }, [activeMapTarget])

  useEffect(() => {
    const id = window.setInterval(() => setDatetimeMin(toDatetimeLocalValue(new Date())), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const wirePickupMarker = useCallback((map: LeafletMap, lat: number, lng: number) => {
    if (pickupMarker.current) {
      map.removeLayer(pickupMarker.current)
    }
    const m = L.marker([lat, lng], { icon: makeBrandedTransferMapIcon('pickup'), draggable: true }).addTo(map)
    m.on('dragend', () => {
      const p = m.getLatLng()
      setPickup({ lat: p.lat, lng: p.lng })
    })
    pickupMarker.current = m
  }, [])

  const wireDropoffMarker = useCallback((map: LeafletMap, lat: number, lng: number) => {
    if (dropMarker.current) {
      map.removeLayer(dropMarker.current)
    }
    const m = L.marker([lat, lng], { icon: makeBrandedTransferMapIcon('dropoff'), draggable: true }).addTo(map)
    m.on('dragend', () => {
      const p = m.getLatLng()
      setDropoff({ lat: p.lat, lng: p.lng })
    })
    dropMarker.current = m
  }, [])

  const refreshOverlays = useCallback(() => {
    const map = mapInst.current
    if (!map) {
      return
    }

    if (pickup) {
      wirePickupMarker(map, pickup.lat, pickup.lng)
    } else if (pickupMarker.current) {
      map.removeLayer(pickupMarker.current)
      pickupMarker.current = null
    }

    if (dropoff) {
      wireDropoffMarker(map, dropoff.lat, dropoff.lng)
    } else if (dropMarker.current) {
      map.removeLayer(dropMarker.current)
      dropMarker.current = null
    }

    for (const m of viaMarkers.current) {
      map.removeLayer(m)
    }
    viaMarkers.current = []
    vias.forEach((v, idx) => {
      if (v.lat != null && v.lng != null) {
        const m = L.marker([v.lat, v.lng], { icon: makeViaMapIcon(idx + 1), draggable: true }).addTo(map)
        m.on('dragend', () => {
          const p = m.getLatLng()
          setVias((prev) =>
            prev.map((row) => (row.id === v.id ? { ...row, lat: p.lat, lng: p.lng } : row))
          )
        })
        viaMarkers.current.push(m)
      }
    })

    if (routeLine.current) {
      map.removeLayer(routeLine.current)
      routeLine.current = null
    }
    const pts: [number, number][] = []
    if (pickup) {
      pts.push([pickup.lat, pickup.lng])
    }
    for (const v of vias) {
      if (v.lat != null && v.lng != null) {
        pts.push([v.lat, v.lng])
      }
    }
    if (dropoff) {
      pts.push([dropoff.lat, dropoff.lng])
    }
    if (pts.length >= 2) {
      const line = L.polyline(pts, {
        color: '#0b4934',
        weight: 4,
        opacity: 0.88,
        dashArray: '10 7'
      }).addTo(map)
      routeLine.current = line
      map.fitBounds(line.getBounds(), { padding: [28, 28], maxZoom: 15, animate: true })
    }
  }, [dropoff, pickup, vias, wireDropoffMarker, wirePickupMarker])

  const loadBookings = useCallback(async () => {
    if (!supabase) {
      return
    }
    const { data, error } = await supabase
      .from('transfer_bookings')
      .select('id, status, pickup_label, dropoff_label, created_at, scheduled_at, cancel_reason')
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        setTableMissing(true)
      }
      setBookings([])
      return
    }
    setTableMissing(false)
    setBookings((data ?? []) as BookingRow[])
  }, [supabase])

  useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  useEffect(() => {
    if (!mapRef.current || mapInst.current) {
      return
    }
    const map = L.map(mapRef.current, {
      center: MALAGA_AGP_CENTER,
      zoom: MALAGA_AGP_ZOOM,
      scrollWheelZoom: false
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)
    mapInst.current = map

    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      const t = activeMapTargetRef.current
      if (t === 'pickup') {
        setPickup({ lat, lng })
      } else {
        setDropoff({ lat, lng })
      }
    })

    const t = window.setTimeout(() => map.invalidateSize(), 120)

    const onMapViewChange = () => {
      const pu = pickupMarker.current?.getLatLng()
      if (pu) {
        pickupMarker.current?.setLatLng(pu)
      }
      const dr = dropMarker.current?.getLatLng()
      if (dr) {
        dropMarker.current?.setLatLng(dr)
      }
    }
    map.on('zoomend', onMapViewChange)
    map.on('moveend', onMapViewChange)

    return () => {
      map.off('zoomend', onMapViewChange)
      map.off('moveend', onMapViewChange)
      window.clearTimeout(t)
      if (routeLine.current) {
        map.removeLayer(routeLine.current)
        routeLine.current = null
      }
      for (const m of viaMarkers.current) {
        map.removeLayer(m)
      }
      viaMarkers.current = []
      map.remove()
      mapInst.current = null
      pickupMarker.current = null
      dropMarker.current = null
    }
  }, [])

  useEffect(() => {
    refreshOverlays()
  }, [refreshOverlays])

  const setPickupToAgpTerminal = useCallback(() => {
    const map = mapInst.current
    if (!map) {
      return
    }
    const [lat, lng] = MALAGA_AGP_CENTER
    map.flyTo([lat, lng], MALAGA_AGP_ZOOM, { duration: 0.55 })
    setPickup({ lat, lng })
    setActiveMapTarget('dropoff')
    if (!pickupLabel.trim()) {
      setPickupLabel('Málaga AGP — terminal meet')
    }
  }, [pickupLabel])

  const addViaRow = () => {
    setVias((v) =>
      v.length >= MAX_VIAS
        ? v
        : [...v, { id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), label: '', lat: null, lng: null }]
    )
  }

  const removeViaRow = (id: string) => {
    setVias((v) => v.filter((row) => row.id !== id))
  }

  const submit = async () => {
    if (!supabase) {
      return
    }
    if (!pickup || !dropoff) {
      setMsg('Set pickup and drop-off using the suggestions (typing a match and choosing it) or tap the map after choosing what each tap sets.')
      return
    }
    if (!pickupLabel.trim() || !dropoffLabel.trim()) {
      setMsg('Add a label for pickup and destination.')
      return
    }
    for (const v of vias) {
      const lt = v.label.trim()
      if (!lt) {
        continue
      }
      if (v.lat == null || v.lng == null) {
        setMsg(`Via “${lt}”: choose a matching suggestion so we have coordinates, or clear the row.`)
        return
      }
    }

    let scheduledAtIso: string | null = null
    if (scheduleMode === 'scheduled') {
      if (!scheduledAtLocal.trim()) {
        setMsg('Choose a date and time for pickup, or switch to “As soon as possible”.')
        return
      }
      const chosen = new Date(scheduledAtLocal)
      if (Number.isNaN(chosen.getTime())) {
        setMsg('That date and time is not valid.')
        return
      }
      if (chosen.getTime() < Date.now() - 30_000) {
        setMsg('Pickup time cannot be in the past. Pick a future time or use ASAP.')
        return
      }
      scheduledAtIso = chosen.toISOString()
    }

    const resolvedVias = vias
      .filter((v) => v.label.trim() && v.lat != null && v.lng != null)
      .map((v) => ({ label: v.label.trim(), lat: v.lat as number, lng: v.lng as number }))

    setBusy(true)
    setMsg(null)
    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser()
      const uid = authData.user?.id
      if (authErr || !uid) {
        setMsg('Sign in again to request a transfer.')
        return
      }

      const { data: prof } = await supabase.from('profiles').select('full_name, phone').eq('id', uid).maybeSingle()
      const displayName = (prof?.full_name ?? '').toString().trim()
      const phone = (prof?.phone ?? '').toString().trim()

      const row: Record<string, unknown> = {
        client_user_id: uid,
        client_display_name: displayName,
        client_phone: phone,
        booking_source: 'client_dashboard',
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        pickup_label: pickupLabel.trim(),
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        dropoff_label: dropoffLabel.trim(),
        status: 'pending',
        scheduled_at: scheduledAtIso,
        next_available_driver: scheduleMode === 'asap'
      }
      if (resolvedVias.length > 0) {
        row.route_waypoints = resolvedVias
      }

      const { error } = await supabase.from('transfer_bookings').insert(row)
      if (error) {
        if (error.message.toLowerCase().includes('route_waypoints') || error.message.includes('schema cache')) {
          setMsg('Save your via stops: apply the latest Supabase migration (route_waypoints column), then try again.')
        } else {
          setMsg(error.message)
        }
        return
      }
      setPickup(null)
      setDropoff(null)
      setPickupLabel('')
      setDropoffLabel('')
      setVias([])
      setScheduleMode('asap')
      setScheduledAtLocal('')
      setActiveMapTarget('pickup')
      if (mapInst.current) {
        mapInst.current.flyTo(MALAGA_AGP_CENTER, MALAGA_AGP_ZOOM, { duration: 0.4 })
      }
      await loadBookings()
      setMsg('Request sent. Golf Sol Ireland will allocate a driver.')
    } finally {
      setBusy(false)
    }
  }

  if (!supabase) {
    return null
  }

  if (tableMissing) {
    return (
      <p className="text-sm text-forest-600">
        Transfer requests will appear here after the latest Supabase migration is applied.
      </p>
    )
  }

  const activeTrack = bookings.find((b) =>
    ['allocated', 'driver_accepted', 'en_route', 'picked_up'].includes(b.status)
  )

  const statusLine = (b: BookingRow) => {
    if (b.status === 'cancelled' && typeof b.cancel_reason === 'string' && b.cancel_reason.startsWith('no_driver')) {
      return 'No driver available — see email & portal updates'
    }
    return b.status.replace(/_/g, ' ')
  }

  const formatScheduledShort = (iso: string | null | undefined) => {
    if (!iso) {
      return 'ASAP'
    }
    return new Date(iso).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const pickupInputId = 'transfer-pickup-label'
  const dropoffInputId = 'transfer-dropoff-label'

  return (
    <section className="rounded-3xl border-2 border-gs-green/30 bg-white p-6 shadow-soft sm:p-8" aria-label="Book a Costa del Sol transfer">
      <h2 className="font-display text-xl font-semibold text-forest-950">Book a Costa del Sol transfer</h2>
      <p className="mt-2 text-sm text-forest-600">
        Map opens on <strong className="font-medium text-forest-800">Málaga AGP</strong>. Type a few letters in each label and{' '}
        <strong className="font-medium text-forest-800">choose a suggestion</strong> to place pins and draw the route — or tap the map after
        selecting what each tap sets (pickup vs drop-off). Add up to <strong className="font-medium text-forest-800">{MAX_VIAS}</strong>{' '}
        optional via stops the same way.
      </p>

      <div className="mt-4 rounded-2xl border border-forest-200/90 bg-offwhite/70 px-4 py-3 text-sm text-forest-800">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Next map tap sets</span>
        <div className="mt-2 flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              checked={activeMapTarget === 'pickup'}
              className="h-4 w-4 border-forest-300 text-fairway-600 focus:ring-fairway-500"
              name="map-target"
              onChange={() => setActiveMapTarget('pickup')}
              type="radio"
            />
            Pickup point
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              checked={activeMapTarget === 'dropoff'}
              className="h-4 w-4 border-forest-300 text-fairway-600 focus:ring-fairway-500"
              name="map-target"
              onChange={() => setActiveMapTarget('dropoff')}
              type="radio"
            />
            Drop-off point
          </label>
        </div>
      </div>

      <div ref={mapRef} className="mt-4 h-[280px] w-full overflow-hidden rounded-2xl border border-forest-200 shadow-inner sm:h-[340px]" />

      <div className="mt-3">
        <GeButton size="sm" type="button" variant="outline-gs-green" onClick={() => setPickupToAgpTerminal()}>
          Use AGP terminal meet (pickup here)
        </GeButton>
      </div>

      <fieldset className="mt-5 rounded-2xl border border-forest-200/90 bg-offwhite/60 px-4 py-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">When do you need pickup?</legend>
        <div className="mt-2 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-forest-800">
            <input
              checked={scheduleMode === 'asap'}
              className="mt-1 h-4 w-4 shrink-0 border-forest-300 text-fairway-600 focus:ring-fairway-500"
              name="transfer-schedule"
              onChange={() => {
                setScheduleMode('asap')
                setMsg(null)
              }}
              type="radio"
              value="asap"
            />
            <span>
              <span className="font-semibold text-forest-900">As soon as possible</span>
              <span className="mt-0.5 block text-xs text-forest-600">Next available driver.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-forest-800">
            <input
              checked={scheduleMode === 'scheduled'}
              className="mt-1 h-4 w-4 shrink-0 border-forest-300 text-fairway-600 focus:ring-fairway-500"
              name="transfer-schedule"
              onChange={() => {
                setScheduleMode('scheduled')
                setDatetimeMin(toDatetimeLocalValue(new Date()))
                setMsg(null)
              }}
              type="radio"
              value="scheduled"
            />
            <span className="min-w-0 flex-1">
              <span className="font-semibold text-forest-900">Specific date &amp; time</span>
              {scheduleMode === 'scheduled' ? (
                <input
                  className="mt-2 w-full max-w-[20rem] rounded-xl border-2 border-forest-200 bg-white px-3 py-2 text-sm text-forest-900"
                  min={datetimeMin}
                  onChange={(e) => setScheduledAtLocal(e.target.value)}
                  type="datetime-local"
                  value={scheduledAtLocal}
                />
              ) : null}
              <span className="mt-1 block text-xs text-forest-600">Past times are not allowed.</span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-forest-700" htmlFor={pickupInputId}>
            Pickup label
          </label>
          <PlaceTypeahead
            inputId={pickupInputId}
            onChangeValue={(v) => {
              setPickupLabel(v)
              setPickup(null)
            }}
            onPickPlace={(p) => {
              setPickupLabel(p.label)
              setPickup({ lat: p.lat, lng: p.lng })
              setActiveMapTarget('dropoff')
            }}
            placeholder="Type 2+ letters, then pick a suggestion"
            value={pickupLabel}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-forest-700" htmlFor={dropoffInputId}>
            Destination label
          </label>
          <PlaceTypeahead
            inputId={dropoffInputId}
            onChangeValue={(v) => {
              setDropoffLabel(v)
              setDropoff(null)
            }}
            onPickPlace={(p) => {
              setDropoffLabel(p.label)
              setDropoff({ lat: p.lat, lng: p.lng })
            }}
            placeholder="Type 2+ letters, then pick a suggestion"
            value={dropoffLabel}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-forest-200/90 bg-white/90 px-4 py-4 shadow-inner">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Via stops (optional)</p>
            <p className="mt-1 text-xs text-forest-600">Up to {MAX_VIAS} intermediate points — same suggestions as labels. Route updates on the map.</p>
          </div>
          <GeButton
            disabled={vias.length >= MAX_VIAS}
            size="sm"
            type="button"
            variant="outline-gs-green"
            onClick={() => addViaRow()}
          >
            Add via
          </GeButton>
        </div>
        {vias.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {vias.map((row, idx) => (
              <li className="rounded-xl border border-forest-100 bg-offwhite/60 p-3" key={row.id}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-forest-600">Via {idx + 1}</span>
                  <button
                    className="text-xs font-semibold text-brand-800 underline decoration-amber-600/50"
                    onClick={() => removeViaRow(row.id)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <PlaceTypeahead
                  inputId={`via-${row.id}`}
                  onChangeValue={(v) => {
                    setVias((prev) => prev.map((r) => (r.id === row.id ? { ...r, label: v, lat: null, lng: null } : r)))
                  }}
                  onPickPlace={(p) => {
                    setVias((prev) =>
                      prev.map((r) => (r.id === row.id ? { ...r, label: p.label, lat: p.lat, lng: p.lng } : r))
                    )
                  }}
                  placeholder="Hotel, course, or airport"
                  value={row.label}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <GeButton size="md" type="button" variant="gs-green" className="disabled:opacity-50" disabled={busy} onClick={() => void submit()}>
          {busy ? 'Sending…' : 'Submit transfer request'}
        </GeButton>
        <GeButton
          size="md"
          type="button"
          variant="outline-gs-green"
          onClick={() => {
            setPickup(null)
            setDropoff(null)
            setPickupLabel('')
            setDropoffLabel('')
            setVias([])
            setScheduleMode('asap')
            setScheduledAtLocal('')
            setActiveMapTarget('pickup')
            setMsg(null)
            if (mapInst.current) {
              mapInst.current.flyTo(MALAGA_AGP_CENTER, MALAGA_AGP_ZOOM, { duration: 0.4 })
            }
          }}
        >
          Reset map
        </GeButton>
      </div>
      {msg ? <p className="mt-3 text-sm text-forest-800">{msg}</p> : null}

      {activeTrack ? (
        <div className="mt-10 border-t border-forest-200/80 pt-8">
          <h3 className="font-display text-lg font-semibold text-forest-950">Live tracking</h3>
          <ClientTransferTrackMap bookingId={activeTrack.id} />
        </div>
      ) : null}

      {bookings.length > 0 ? (
        <div className="mt-8">
          <h3 className="font-display text-lg font-semibold text-forest-950">Your requests</h3>
          <ul className="mt-3 space-y-2 text-sm text-forest-700">
            {bookings.map((b) => (
              <li
                key={b.id}
                className={`rounded-xl border border-forest-200/80 px-3 py-2 ${
                  b.status === 'cancelled' ? 'bg-chrome-50/90 text-forest-800' : 'bg-offwhite/80'
                }`}
              >
                <span className="font-semibold capitalize">{statusLine(b)}</span> · {formatScheduledShort(b.scheduled_at ?? null)} ·{' '}
                {b.pickup_label} → {b.dropoff_label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
