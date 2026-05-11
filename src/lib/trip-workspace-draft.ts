export const TRIP_DRAFT_STORAGE_KEY = 'gsol_trip_draft_v1'

export type TripStageKey = 'transfer' | 'golf' | 'hotel'

/** AGP = Málaga Airport in transfer route UI. */
export const MALAGA_AIRPORT_REF = 'agp'

export type PortalTransferStopKind = 'malaga_airport' | 'hotel' | 'golf_course'

export interface PortalTransferStop {
  readonly kind: PortalTransferStopKind
  /** `agp`, hotel slug from corridor list, or golf course id. */
  readonly ref: string
  /** Optional `datetime-local` value (`yyyy-MM-ddTHH:mm`) for this stop / leg pick-up. */
  readonly pickupAtLocal?: string
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

const pickupLocalFromStop = (s: PortalTransferStop): string | undefined => {
  const v = typeof s.pickupAtLocal === 'string' ? s.pickupAtLocal.trim() : ''
  return v.length > 0 ? v : undefined
}

/** Normalise and cap at 8 stops; ensure pickup is not a golf course. Preserves optional `pickupAtLocal`. */
export const normalizeTransferStops = (raw: readonly PortalTransferStop[] | undefined): PortalTransferStop[] => {
  const list = raw && raw.length > 0 ? [...raw] : [...defaultTransferStops()]
  const capped = list.slice(0, 8).map((s) => {
    const pt = pickupLocalFromStop(s)
    const base: PortalTransferStop = { kind: s.kind, ref: s.ref.trim() }
    return pt ? { ...base, pickupAtLocal: pt } : base
  })
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

/** True when a persisted workspace is only the auto-filled shell (no client edits to merge yet). */
export const isUnsavedDefaultTripWorkspace = (d: TripWorkspaceDraft, referenceId: string): boolean => {
  const ref = referenceId.trim()
  const baseline = emptyTripWorkspaceDraft(ref)
  const a = ensureTripWorkspaceDraftShape(d)
  const b = ensureTripWorkspaceDraftShape(baseline)
  return (
    a.partySize === b.partySize &&
    a.hotelNotes.trim() === b.hotelNotes.trim() &&
    a.courseIds.length === 0 &&
    (a.transferContactPhone ?? '').trim() === (b.transferContactPhone ?? '').trim() &&
    a.stages.transfer === b.stages.transfer &&
    a.stages.golf === b.stages.golf &&
    a.stages.hotel === b.stages.hotel &&
    JSON.stringify(a.transferStops) === JSON.stringify(b.transferStops)
  )
}

export const isLikelyEnquiryReferenceId = (value: string): boolean => /^GSI-[A-Z0-9-]+$/i.test(value.trim())

/**
 * Restores a trip workspace slice stored on `package_builds.config.portalTripWorkspace` (website_form v3).
 * `referenceId` is the enquiry reference — persisted JSON may omit or disagree; caller should align.
 */
export const parsePersistedTripWorkspaceFromPackage = (raw: unknown, referenceId: string): TripWorkspaceDraft | null => {
  if (raw === null || raw === undefined) {
    return null
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return null
  }

  const o = raw as Record<string, unknown>
  const stagesRaw = o.stages && typeof o.stages === 'object' && !Array.isArray(o.stages) ? (o.stages as Record<string, unknown>) : {}
  const partySizeRaw = o.partySize
  let partySize = 4
  if (typeof partySizeRaw === 'number' && Number.isFinite(partySizeRaw)) {
    partySize = Math.min(8, Math.max(1, Math.round(partySizeRaw)))
  } else if (typeof partySizeRaw === 'string' && /^\d+$/.test(partySizeRaw.trim())) {
    partySize = Math.min(8, Math.max(1, parseInt(partySizeRaw.trim(), 10)))
  }

  const courseIds = Array.isArray(o.courseIds) ? o.courseIds.filter((c): c is string => typeof c === 'string') : []
  const hotelNotes = typeof o.hotelNotes === 'string' ? o.hotelNotes : ''
  const rawStops = Array.isArray(o.transferStops) ? o.transferStops.filter(isTransferStop) : []
  const transferStops = normalizeTransferStops(rawStops as readonly PortalTransferStop[])
  const transferContactPhone =
    typeof o.transferContactPhone === 'string' ? o.transferContactPhone : ''

  const defStages = defaultStages()
  const stages = {
    transfer: typeof stagesRaw.transfer === 'boolean' ? stagesRaw.transfer : defStages.transfer,
    golf: typeof stagesRaw.golf === 'boolean' ? stagesRaw.golf : defStages.golf,
    hotel: typeof stagesRaw.hotel === 'boolean' ? stagesRaw.hotel : defStages.hotel
  }

  return ensureTripWorkspaceDraftShape({
    referenceId: referenceId.trim(),
    stages,
    partySize,
    courseIds,
    hotelNotes,
    updatedAt: typeof o.updatedAt === 'string' && o.updatedAt.trim() ? o.updatedAt.trim() : new Date().toISOString(),
    transferStops,
    transferContactPhone
  })
}

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
  return `${base}/dashboard/login?next=${encodeURIComponent(next)}`
}
