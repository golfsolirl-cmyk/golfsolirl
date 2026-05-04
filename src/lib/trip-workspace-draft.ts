export const TRIP_DRAFT_STORAGE_KEY = 'gsol_trip_draft_v1'

export type TripStageKey = 'transfer' | 'golf' | 'hotel'

/** AGP = Málaga Airport in transfer route UI. */
export const MALAGA_AIRPORT_REF = 'agp'

export type PortalTransferStopKind = 'malaga_airport' | 'hotel' | 'golf_course'

export interface PortalTransferStop {
  readonly kind: PortalTransferStopKind
  /** `agp`, hotel slug from corridor list, or golf course id. */
  readonly ref: string
}

export interface TripWorkspaceDraft {
  readonly referenceId: string
  readonly stages: Record<TripStageKey, boolean>
  readonly partySize: number
  readonly courseIds: readonly string[]
  readonly hotelNotes: string
  readonly updatedAt: string
  /** Ordered route: stop 0 = pickup (airport or hotel only); further stops = airport, hotel, or course. Max 8 stops. */
  readonly transferStops?: readonly PortalTransferStop[]
  readonly transferContactPhone?: string
}

const defaultStages = (): Record<TripStageKey, boolean> => ({
  transfer: true,
  golf: true,
  hotel: false
})

export const defaultTransferStops = (): PortalTransferStop[] => [
  { kind: 'malaga_airport', ref: MALAGA_AIRPORT_REF }
]

const isTransferStop = (x: unknown): x is PortalTransferStop => {
  if (!x || typeof x !== 'object') {
    return false
  }
  const o = x as Record<string, unknown>
  const kind = o.kind
  const ref = o.ref
  return (
    (kind === 'malaga_airport' || kind === 'hotel' || kind === 'golf_course') &&
    typeof ref === 'string' &&
    ref.trim().length > 0
  )
}

/** Normalise and cap at 8 stops; ensure pickup is not a golf course. */
export const normalizeTransferStops = (raw: readonly PortalTransferStop[] | undefined): PortalTransferStop[] => {
  const list = raw && raw.length > 0 ? [...raw] : [...defaultTransferStops()]
  const capped = list.slice(0, 8).map((s) => ({ kind: s.kind, ref: s.ref.trim() }))
  if (capped[0]?.kind === 'golf_course') {
    capped[0] = { kind: 'malaga_airport', ref: MALAGA_AIRPORT_REF }
  }
  if (capped[0]?.kind === 'malaga_airport' && !capped[0].ref) {
    capped[0] = { kind: 'malaga_airport', ref: MALAGA_AIRPORT_REF }
  }
  return capped
}

export const ensureTripWorkspaceDraftShape = (d: TripWorkspaceDraft): TripWorkspaceDraft => ({
  ...d,
  transferStops: normalizeTransferStops(d.transferStops),
  transferContactPhone: typeof d.transferContactPhone === 'string' ? d.transferContactPhone : ''
})

export const emptyTripWorkspaceDraft = (referenceId: string): TripWorkspaceDraft => ({
  referenceId,
  stages: defaultStages(),
  partySize: 4,
  courseIds: [],
  hotelNotes: '',
  updatedAt: new Date().toISOString(),
  transferStops: defaultTransferStops(),
  transferContactPhone: ''
})

export const isLikelyEnquiryReferenceId = (value: string): boolean => /^GSI-[A-Z0-9-]+$/i.test(value.trim())

export const parseTripWorkspaceDraft = (raw: string | null): TripWorkspaceDraft | null => {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<TripWorkspaceDraft>
    if (typeof parsed.referenceId !== 'string' || !isLikelyEnquiryReferenceId(parsed.referenceId)) {
      return null
    }

    const stages = parsed.stages ?? defaultStages()
    const partySize = typeof parsed.partySize === 'number' ? Math.min(8, Math.max(1, Math.round(parsed.partySize))) : 4
    const courseIds = Array.isArray(parsed.courseIds) ? parsed.courseIds.filter((c): c is string => typeof c === 'string') : []
    const hotelNotes = typeof parsed.hotelNotes === 'string' ? parsed.hotelNotes : ''
    const rawStops = Array.isArray(parsed.transferStops) ? parsed.transferStops.filter(isTransferStop) : []
    const transferStops = normalizeTransferStops(rawStops as PortalTransferStop[])
    const transferContactPhone =
      typeof parsed.transferContactPhone === 'string' ? parsed.transferContactPhone : ''

    return {
      referenceId: parsed.referenceId.trim(),
      stages: {
        transfer: Boolean(stages.transfer),
        golf: Boolean(stages.golf),
        hotel: Boolean(stages.hotel)
      },
      partySize,
      courseIds,
      hotelNotes,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      transferStops,
      transferContactPhone
    }
  } catch {
    return null
  }
}

export const loadTripWorkspaceDraft = (): TripWorkspaceDraft | null => {
  try {
    return parseTripWorkspaceDraft(sessionStorage.getItem(TRIP_DRAFT_STORAGE_KEY))
  } catch {
    return null
  }
}

export const saveTripWorkspaceDraft = (draft: TripWorkspaceDraft): void => {
  try {
    sessionStorage.setItem(
      TRIP_DRAFT_STORAGE_KEY,
      JSON.stringify({ ...draft, updatedAt: new Date().toISOString() })
    )
  } catch {
    /* private mode */
  }
}

export const clearTripWorkspaceDraft = (): void => {
  try {
    sessionStorage.removeItem(TRIP_DRAFT_STORAGE_KEY)
  } catch {
    /* private mode */
  }
}

/** Illustrative range only — replace with supplier rates / API when you wire real pricing. */
export const illustrativeTripPriceRangeEur = (draft: TripWorkspaceDraft): { low: number; high: number } => {
  const n = draft.partySize
  const rounds = Math.max(1, draft.courseIds.length || (draft.stages.golf ? 1 : 0))
  let low = 0
  let high = 0

  if (draft.stages.transfer) {
    low += 38 * n
    high += 95 * n
  }

  if (draft.stages.golf) {
    low += 72 * n * rounds
    high += 195 * n * rounds
  }

  if (draft.stages.hotel) {
    low += 85 * n * 2
    high += 320 * n * 5
  }

  return { low: Math.round(low), high: Math.round(high) }
}

export const buildClientLoginUrlForEnquiry = (origin: string, enquiryId: string): string => {
  const base = origin.replace(/\/+$/, '')
  const next = `/dashboard?enquiry_ref=${encodeURIComponent(enquiryId)}`
  return `${base}/login?next=${encodeURIComponent(next)}`
}
