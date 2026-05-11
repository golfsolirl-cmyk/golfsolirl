import type { SupabaseClient } from '@supabase/supabase-js'
import { corridorHotelBySlug } from '../data/airport-corridor-hotels'
import { COURSES, NEARBY_HOTELS } from '../data/coastal-golf-data'
import { MALAGA_AIRPORT_REF, normalizeTransferStops, type PortalTransferStop, type TripWorkspaceDraft } from './trip-workspace-draft'

const AGP_LAT = 36.6752
const AGP_LNG = -4.4988

const slugifyHotelName = (name: string): string => {
  const s = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72)
  return s || 'hotel'
}

const labelForStop = (stop: PortalTransferStop): string => {
  if (stop.kind === 'malaga_airport' || stop.ref === MALAGA_AIRPORT_REF) {
    return 'Málaga Airport (AGP)'
  }
  if (stop.kind === 'golf_course') {
    return COURSES.find((c) => c.id === stop.ref)?.name ?? stop.ref
  }
  const hotel = corridorHotelBySlug(stop.ref)
  return hotel?.name ?? stop.ref
}

const coordsForStop = (stop: PortalTransferStop): { lat: number | null; lng: number | null } => {
  if (stop.kind === 'malaga_airport' || stop.ref === MALAGA_AIRPORT_REF) {
    return { lat: AGP_LAT, lng: AGP_LNG }
  }
  if (stop.kind === 'golf_course') {
    const c = COURSES.find((x) => x.id === stop.ref)
    return c ? { lat: c.lat, lng: c.lng } : { lat: null, lng: null }
  }
  const entry = corridorHotelBySlug(stop.ref)
  if (!entry) {
    return { lat: null, lng: null }
  }
  const target = entry.name.trim().toLowerCase()
  for (const list of Object.values(NEARBY_HOTELS)) {
    const m = list.find((h) => h.name.trim().toLowerCase() === target)
    if (m) {
      return { lat: m.lat, lng: m.lng }
    }
  }
  for (const list of Object.values(NEARBY_HOTELS)) {
    const m = list.find((h) => slugifyHotelName(h.name) === stop.ref)
    if (m) {
      return { lat: m.lat, lng: m.lng }
    }
  }
  return { lat: null, lng: null }
}

/** True when the client has a multi-stop (or non-default) route worth mirroring to Operations. */
export const tripWorkspaceWorthMirroringToTransferBooking = (draft: TripWorkspaceDraft | null): boolean => {
  if (!draft) {
    return false
  }
  const stops = normalizeTransferStops(draft.transferStops)
  if (stops.length > 1) {
    return true
  }
  return stops.some((s) => s.kind !== 'malaga_airport' || s.ref !== MALAGA_AIRPORT_REF)
}

const firstScheduledIso = (stops: PortalTransferStop[]): string | null => {
  for (const s of stops) {
    const raw = typeof s.pickupAtLocal === 'string' ? s.pickupAtLocal.trim() : ''
    if (raw.length >= 16 && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) {
      const d = new Date(raw)
      if (!Number.isNaN(d.getTime())) {
        return d.toISOString()
      }
    }
  }
  return null
}

/**
 * Upsert one `transfer_bookings` row per package so Operations sees saved trip route (not only map requests).
 */
export const syncTripWorkspaceToTransferBooking = async (
  supabase: SupabaseClient,
  args: {
    packageBuildId: string
    clientUserId: string
    enquiryReferenceId: string
    tripDraft: TripWorkspaceDraft | null
    clientDisplayName: string
    clientPhone: string
  }
): Promise<{ ok: true; skipped?: boolean } | { ok: false; message: string }> => {
  const { packageBuildId, clientUserId, enquiryReferenceId, tripDraft, clientDisplayName, clientPhone } = args

  if (!tripWorkspaceWorthMirroringToTransferBooking(tripDraft)) {
    const { error: delErr } = await supabase.from('transfer_bookings').delete().eq('package_build_id', packageBuildId)
    if (delErr && !delErr.message.includes('does not exist') && delErr.code !== '42703') {
      return { ok: false, message: delErr.message }
    }
    return { ok: true, skipped: true }
  }

  const stops = normalizeTransferStops(tripDraft!.transferStops)
  const first = stops[0]
  const last = stops[stops.length - 1]
  const pickupLabel = labelForStop(first)
  const dropoffLabel = labelForStop(last)
  const p0 = coordsForStop(first)
  const p1 = coordsForStop(last)

  const middle = stops.slice(1, -1)
  const viaResolved = middle
    .map((s) => {
      const g = coordsForStop(s)
      if (g.lat == null || g.lng == null) {
        return null
      }
      return { label: labelForStop(s), lat: g.lat, lng: g.lng }
    })
    .filter((x): x is { label: string; lat: number; lng: number } => x != null)
  const route_waypoints = viaResolved.length > 0 ? viaResolved : null

  const timingNote = [
    `Trip planner mirror · ${enquiryReferenceId}`,
    tripDraft!.partySize ? `${tripDraft!.partySize} guests` : '',
    stops.map((s, i) => `${i + 1}. ${labelForStop(s)}${(s.pickupAtLocal ?? '').trim() ? ` · ${(s.pickupAtLocal ?? '').replace('T', ' ')}` : ''}`).join(' · ')
  ]
    .filter(Boolean)
    .join('\n')

  const scheduled_at = firstScheduledIso(stops)
  const next_available_driver = !scheduled_at

  const baseRow: Record<string, unknown> = {
    client_user_id: clientUserId,
    client_display_name: clientDisplayName.trim(),
    client_phone: clientPhone.trim(),
    booking_source: 'client_dashboard',
    /** Omit enquiry ref on mirror rows — unique index `transfer_bookings_enquiry_reference_id_key` is reserved for website_enquiry. */
    enquiry_reference_id: null,
    package_build_id: packageBuildId,
    pickup_lat: p0.lat,
    pickup_lng: p0.lng,
    pickup_label: pickupLabel,
    dropoff_lat: p1.lat,
    dropoff_lng: p1.lng,
    dropoff_label: dropoffLabel,
    scheduled_at,
    next_available_driver,
    client_timing_note: timingNote.slice(0, 4000),
    route_waypoints: route_waypoints && route_waypoints.length ? route_waypoints : null,
    updated_at: new Date().toISOString()
  }

  const { data: existing, error: selErr } = await supabase
    .from('transfer_bookings')
    .select('id,status,assigned_driver_id')
    .eq('package_build_id', packageBuildId)
    .maybeSingle()

  if (selErr) {
    if (selErr.message.includes('package_build_id') || selErr.code === '42703') {
      return {
        ok: false,
        message:
          'Database is missing package_build_id on transfer_bookings. Apply supabase/migrations/20260505290000_transfer_bookings_package_build_mirror.sql in Supabase.'
      }
    }
    return { ok: false, message: selErr.message }
  }

  if (existing?.id) {
    const preserveOps =
      existing.status &&
      existing.status !== 'pending' &&
      existing.status !== 'cancelled' &&
      Boolean(existing.assigned_driver_id)

    const patch: Record<string, unknown> = { ...baseRow }
    if (preserveOps) {
      delete patch.status
    } else {
      patch.status = 'pending'
    }

    const { error: uErr } = await supabase.from('transfer_bookings').update(patch).eq('id', existing.id)
    if (uErr) {
      return { ok: false, message: uErr.message }
    }
    return { ok: true }
  }

  const insertRow = {
    ...baseRow,
    status: 'pending'
  }

  const { error: iErr } = await supabase.from('transfer_bookings').insert(insertRow)
  if (iErr) {
    return { ok: false, message: iErr.message }
  }
  return { ok: true }
}
