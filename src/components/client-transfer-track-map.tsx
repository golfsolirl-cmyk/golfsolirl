import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getSupabaseBrowserClient } from '../lib/supabase-client'

const makeDot = (color: string) =>
  L.divIcon({
    className: 'gsol-leaflet-dot',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })

export function ClientTransferTrackMap({ bookingId }: { readonly bookingId: string }) {
  const supabase = getSupabaseBrowserClient()
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInst = useRef<LeafletMap | null>(null)
  const driverMarker = useRef<Marker | null>(null)
  const [lastPos, setLastPos] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInst.current) {
      return
    }
    const map = L.map(mapRef.current, {
      center: [36.52, -4.88],
      zoom: 11,
      scrollWheelZoom: false
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)
    mapInst.current = map
    const t = window.setTimeout(() => map.invalidateSize(), 120)
    return () => {
      window.clearTimeout(t)
      map.remove()
      mapInst.current = null
      driverMarker.current = null
    }
  }, [])

  useEffect(() => {
    if (!supabase || !bookingId) {
      return
    }

    const loadLatest = async () => {
      const { data } = await supabase
        .from('driver_positions')
        .select('lat, lng')
        .eq('booking_id', bookingId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
        setLastPos({ lat: data.lat, lng: data.lng })
      }
    }

    void loadLatest()
    const ch = supabase
      .channel(`driver-pos-${bookingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'driver_positions', filter: `booking_id=eq.${bookingId}` },
        (payload) => {
          const row = payload.new as { lat?: number; lng?: number }
          if (typeof row.lat === 'number' && typeof row.lng === 'number') {
            setLastPos({ lat: row.lat, lng: row.lng })
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(ch)
    }
  }, [supabase, bookingId])

  useEffect(() => {
    const map = mapInst.current
    if (!map || !lastPos) {
      return
    }
    if (driverMarker.current) {
      driverMarker.current.setLatLng([lastPos.lat, lastPos.lng])
    } else {
      driverMarker.current = L.marker([lastPos.lat, lastPos.lng], { icon: makeDot('#378ADD') }).addTo(map)
    }
    map.panTo([lastPos.lat, lastPos.lng])
  }, [lastPos])

  return (
    <div className="mt-4 space-y-3">
      <div ref={mapRef} className="h-[240px] w-full overflow-hidden rounded-2xl border border-forest-200 shadow-inner sm:h-[300px]" />
      {!lastPos ? (
        <p className="text-xs text-forest-600">Waiting for driver location updates…</p>
      ) : (
        <p className="text-xs text-forest-600">Last position: {lastPos.lat.toFixed(4)}, {lastPos.lng.toFixed(4)}</p>
      )}
    </div>
  )
}
