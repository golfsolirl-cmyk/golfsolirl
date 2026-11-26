/**
 * Shared trip-builder service selection for public quote forms + admin.
 * Keep machine keys stable — stored in form_payload and enquiries.requested_services.
 */

export type TripServiceId = 'transfers' | 'accommodation' | 'golf_courses'

export type TripServiceSelection = {
  readonly transfers: boolean
  readonly accommodation: boolean
  readonly golf_courses: boolean
}

export const TRIP_SERVICE_ORDER: readonly TripServiceId[] = [
  'transfers',
  'accommodation',
  'golf_courses'
] as const

export const TRIP_SERVICE_LABELS: Record<TripServiceId, string> = {
  transfers: 'Airport & hotel transfers',
  accommodation: 'Accommodation',
  golf_courses: 'Golf courses'
}

export const emptyTripServices = (): TripServiceSelection => ({
  transfers: false,
  accommodation: false,
  golf_courses: false
})

export function tripServicesFromFlags(flags: Partial<TripServiceSelection>): TripServiceSelection {
  return {
    transfers: Boolean(flags.transfers),
    accommodation: Boolean(flags.accommodation),
    golf_courses: Boolean(flags.golf_courses)
  }
}

export function atLeastOneTripService(s: TripServiceSelection): boolean {
  return s.transfers || s.accommodation || s.golf_courses
}

export function selectedTripServiceIds(s: TripServiceSelection): TripServiceId[] {
  return TRIP_SERVICE_ORDER.filter((id) => s[id])
}

export function missingTripServiceIds(s: TripServiceSelection): TripServiceId[] {
  return TRIP_SERVICE_ORDER.filter((id) => !s[id])
}

/** Parse `_serviceStages` JSON or requested_services column. */
export function parseTripServices(raw: unknown): TripServiceSelection | null {
  if (!raw) return null
  if (typeof raw === 'string') {
    try {
      return parseTripServices(JSON.parse(raw))
    } catch {
      return null
    }
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  // Support both trip-builder keys and legacy service-cta keys
  const transfers =
    typeof o.transfers === 'boolean'
      ? o.transfers
      : typeof o.transfer === 'boolean'
        ? o.transfer
        : null
  const accommodation =
    typeof o.accommodation === 'boolean'
      ? o.accommodation
      : typeof o.hotel === 'boolean'
        ? o.hotel
        : null
  const golf_courses =
    typeof o.golf_courses === 'boolean'
      ? o.golf_courses
      : typeof o.golf === 'boolean'
        ? o.golf
        : null
  if (transfers == null && accommodation == null && golf_courses == null) return null
  return {
    transfers: Boolean(transfers),
    accommodation: Boolean(accommodation),
    golf_courses: Boolean(golf_courses)
  }
}

export type TripQuotePreset = {
  readonly services?: Partial<TripServiceSelection>
  readonly bundleSlug?: string | null
  readonly bundleName?: string | null
  readonly nights?: number | null
  readonly rounds?: number | null
  readonly tier?: string | null
  readonly courses?: readonly string[]
  readonly hotels?: readonly string[]
  readonly hotel?: string | null
  readonly pageLabel?: string
  /** Pathname for form_type / _sourcePage */
  readonly sourcePage?: string
  /** Form registry key for form_payload.form */
  readonly formKey?: string
  /** e.g. callback | quote | booking */
  readonly intent?: string | null
  readonly area?: string | null
}

/** Build URL query for /quote from chooser selections / CTAs. */
export function buildTripQuoteHref(preset: {
  readonly courses?: readonly string[]
  readonly hotels?: readonly string[]
  readonly hotel?: string | null
  readonly transfers?: boolean
  readonly accommodation?: boolean
  readonly golf?: boolean
  readonly bundle?: string | null
  readonly tier?: string | null
  readonly from?: string
  readonly page?: string
  readonly nights?: number | null
  readonly rounds?: number | null
  readonly area?: string | null
  readonly intent?: string | null
  readonly bundleName?: string | null
}): string {
  const params = new URLSearchParams()
  if (preset.from) params.set('from', preset.from)
  if (preset.page) params.set('page', preset.page)
  if (preset.bundle) params.set('bundle', preset.bundle)
  if (preset.bundleName) params.set('bundleName', preset.bundleName)
  if (preset.tier) params.set('tier', preset.tier)
  if (preset.nights != null && Number.isFinite(preset.nights)) params.set('nights', String(preset.nights))
  if (preset.rounds != null && Number.isFinite(preset.rounds)) params.set('rounds', String(preset.rounds))
  if (preset.area) params.set('area', preset.area)
  if (preset.intent) params.set('intent', preset.intent)
  if (preset.courses?.length) params.set('courses', preset.courses.join('|'))
  if (preset.hotel) params.set('hotel', preset.hotel)
  if (preset.hotels?.length) params.set('hotels', preset.hotels.join('|'))
  if (preset.transfers) params.set('svc_transfers', '1')
  if (preset.accommodation) params.set('svc_accommodation', '1')
  if (preset.golf) params.set('svc_golf', '1')
  // Legacy chooser flag
  if (preset.transfers) params.set('transfers', '1')
  const qs = params.toString()
  return qs ? `/quote?${qs}` : '/quote'
}

export function readTripQuotePresetFromSearch(search: string): TripQuotePreset {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const from = params.get('from')?.trim() || ''
  const page = params.get('page')?.trim() || ''
  const courses = (params.get('courses') || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
  const hotels = (params.get('hotels') || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
  const hotel = params.get('hotel')?.trim() || null
  const nightsRaw = params.get('nights')
  const roundsRaw = params.get('rounds')
  const nights = nightsRaw && Number.isFinite(Number(nightsRaw)) ? Number(nightsRaw) : null
  const rounds = roundsRaw && Number.isFinite(Number(roundsRaw)) ? Number(roundsRaw) : null
  const hasSvcParam =
    params.has('svc_transfers') ||
    params.has('svc_accommodation') ||
    params.has('svc_golf') ||
    params.has('transfers') ||
    params.has('bundle') ||
    courses.length > 0 ||
    hotels.length > 0 ||
    Boolean(hotel)

  let services: Partial<TripServiceSelection> | undefined
  if (hasSvcParam) {
    const fromBundle = Boolean(params.get('bundle'))
    services = {
      transfers:
        params.get('svc_transfers') === '1' ||
        params.get('transfers') === '1' ||
        fromBundle ||
        from === 'transfers',
      accommodation:
        params.get('svc_accommodation') === '1' ||
        fromBundle ||
        from === 'hotels' ||
        hotels.length > 0 ||
        Boolean(hotel),
      golf_courses:
        params.get('svc_golf') === '1' || fromBundle || from === 'courses' || courses.length > 0
    }
  }

  const sourcePage = page || (from && from.startsWith('/') ? from : from ? `/${from}` : '/quote')

  return {
    services,
    bundleSlug: params.get('bundle'),
    bundleName: params.get('bundleName'),
    nights,
    rounds,
    tier: params.get('tier'),
    courses,
    hotels,
    hotel,
    pageLabel: sourcePage,
    sourcePage,
    intent: params.get('intent'),
    area: params.get('area')
  }
}
