export const TRIP_DRAFT_STORAGE_KEY = 'gsol_trip_draft_v1'

export type TripStageKey = 'transfer' | 'golf' | 'hotel'

export interface TripWorkspaceDraft {
  readonly referenceId: string
  readonly stages: Record<TripStageKey, boolean>
  readonly partySize: number
  readonly courseIds: readonly string[]
  readonly hotelNotes: string
  readonly updatedAt: string
}

const defaultStages = (): Record<TripStageKey, boolean> => ({
  transfer: true,
  golf: true,
  hotel: false
})

export const emptyTripWorkspaceDraft = (referenceId: string): TripWorkspaceDraft => ({
  referenceId,
  stages: defaultStages(),
  partySize: 4,
  courseIds: [],
  hotelNotes: '',
  updatedAt: new Date().toISOString()
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
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
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
