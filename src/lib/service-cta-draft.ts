import { ENQUIRY_STRUCTURED_FIELD_KEYS } from './enquiry-form-registry'
import {
  defaultTransferStops,
  emptyTripWorkspaceDraft,
  ensureTripWorkspaceDraftShape,
  isLikelyEnquiryReferenceId,
  saveTripWorkspaceDraft,
  type TripWorkspaceDraft
} from './trip-workspace-draft'

export const SERVICE_CTA_DRAFT_STORAGE_KEY = 'gsol_service_cta_draft_v1'

export type ServiceCtaPrimary = 'transfer' | 'golf' | 'accommodation'

export interface ServiceCtaStages {
  readonly transfer: boolean
  readonly golf: boolean
  readonly accommodation: boolean
}

export interface ServiceCtaDraft {
  readonly primary: ServiceCtaPrimary
  readonly stages: ServiceCtaStages
  readonly fullName: string
  readonly email: string
  readonly phoneWhatsApp: string
  readonly partySize: number
  readonly travelDateFrom: string
  readonly travelDateTo: string
  readonly transferNotes: string
  readonly golfCourseIds: readonly string[]
  readonly accommodationNotes: string
  readonly bestTimeToCall: string
  readonly pageLabel: string
  readonly updatedAt: string
}

export const SERVICE_CTA_PRIMARY_LABELS: Record<ServiceCtaPrimary, string> = {
  transfer: 'Transfer',
  golf: 'Golf course',
  accommodation: 'Accommodation'
}

export const defaultServiceCtaStages = (primary: ServiceCtaPrimary): ServiceCtaStages => ({
  transfer: primary === 'transfer',
  golf: primary === 'golf',
  accommodation: primary === 'accommodation'
})

export const emptyServiceCtaDraft = (primary: ServiceCtaPrimary, pageLabel = ''): ServiceCtaDraft => ({
  primary,
  stages: defaultServiceCtaStages(primary),
  fullName: '',
  email: '',
  phoneWhatsApp: '',
  partySize: 4,
  travelDateFrom: '',
  travelDateTo: '',
  transferNotes: '',
  golfCourseIds: [],
  accommodationNotes: '',
  bestTimeToCall: 'Any time',
  pageLabel,
  updatedAt: new Date().toISOString()
})

const parseStages = (raw: unknown, primary: ServiceCtaPrimary): ServiceCtaStages => {
  const fallback = defaultServiceCtaStages(primary)
  if (!raw || typeof raw !== 'object') {
    return fallback
  }
  const o = raw as Record<string, unknown>
  return {
    transfer: typeof o.transfer === 'boolean' ? o.transfer : fallback.transfer,
    golf: typeof o.golf === 'boolean' ? o.golf : fallback.golf,
    accommodation: typeof o.accommodation === 'boolean' ? o.accommodation : fallback.accommodation
  }
}

export const parseServiceCtaDraft = (raw: string | null): ServiceCtaDraft | null => {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ServiceCtaDraft>
    const primary =
      parsed.primary === 'transfer' || parsed.primary === 'golf' || parsed.primary === 'accommodation'
        ? parsed.primary
        : 'transfer'

    const partySize =
      typeof parsed.partySize === 'number' && Number.isFinite(parsed.partySize)
        ? Math.min(8, Math.max(1, Math.round(parsed.partySize)))
        : 4

    const golfCourseIds = Array.isArray(parsed.golfCourseIds)
      ? parsed.golfCourseIds.filter((id): id is string => typeof id === 'string')
      : []

    return {
      primary,
      stages: parseStages(parsed.stages, primary),
      fullName: typeof parsed.fullName === 'string' ? parsed.fullName : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      phoneWhatsApp: typeof parsed.phoneWhatsApp === 'string' ? parsed.phoneWhatsApp : '',
      partySize,
      travelDateFrom: typeof parsed.travelDateFrom === 'string' ? parsed.travelDateFrom : '',
      travelDateTo: typeof parsed.travelDateTo === 'string' ? parsed.travelDateTo : '',
      transferNotes: typeof parsed.transferNotes === 'string' ? parsed.transferNotes : '',
      golfCourseIds,
      accommodationNotes: typeof parsed.accommodationNotes === 'string' ? parsed.accommodationNotes : '',
      bestTimeToCall: typeof parsed.bestTimeToCall === 'string' && parsed.bestTimeToCall.trim() ? parsed.bestTimeToCall : 'Any time',
      pageLabel: typeof parsed.pageLabel === 'string' ? parsed.pageLabel : '',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
    }
  } catch {
    return null
  }
}

export const loadServiceCtaDraft = (): ServiceCtaDraft | null => {
  try {
    return parseServiceCtaDraft(sessionStorage.getItem(SERVICE_CTA_DRAFT_STORAGE_KEY))
  } catch {
    return null
  }
}

export const saveServiceCtaDraft = (draft: ServiceCtaDraft): void => {
  try {
    sessionStorage.setItem(
      SERVICE_CTA_DRAFT_STORAGE_KEY,
      JSON.stringify({ ...draft, updatedAt: new Date().toISOString() })
    )
  } catch {
    /* private mode */
  }
}

export const serviceCtaInterestSummary = (draft: ServiceCtaDraft): string => {
  const parts: string[] = []
  if (draft.stages.transfer) {
    parts.push('Private transfers (Málaga AGP)')
  }
  if (draft.stages.golf) {
    parts.push('Golf courses & tee times')
  }
  if (draft.stages.accommodation) {
    parts.push('Hotels & accommodation')
  }
  const services = parts.length > 0 ? parts.join(' · ') : SERVICE_CTA_PRIMARY_LABELS[draft.primary]
  const page = draft.pageLabel.trim() ? ` · ${draft.pageLabel.trim()}` : ''
  return `Trip service request: ${services}${page}`
}

export const serviceCtaToTripWorkspace = (draft: ServiceCtaDraft, referenceId: string): TripWorkspaceDraft => {
  const ref = referenceId.trim()
  const base = isLikelyEnquiryReferenceId(ref) ? emptyTripWorkspaceDraft(ref) : emptyTripWorkspaceDraft('GSI-PENDING')

  const hotelNotes = [
    draft.accommodationNotes.trim(),
    draft.stages.accommodation && !draft.accommodationNotes.trim() ? 'Accommodation requested — details to follow.' : ''
  ]
    .filter(Boolean)
    .join('\n')

  return ensureTripWorkspaceDraftShape({
    ...base,
    referenceId: isLikelyEnquiryReferenceId(ref) ? ref : base.referenceId,
    stages: {
      transfer: draft.stages.transfer,
      golf: draft.stages.golf,
      hotel: draft.stages.accommodation
    },
    partySize: draft.partySize,
    courseIds: [...draft.golfCourseIds],
    hotelNotes,
    transferContactPhone: draft.phoneWhatsApp.trim(),
    transferStops: defaultTransferStops(),
    updatedAt: new Date().toISOString()
  })
}

export const persistServiceCtaAsTripDraft = (draft: ServiceCtaDraft, referenceId: string): TripWorkspaceDraft => {
  const workspace = serviceCtaToTripWorkspace(draft, referenceId)
  saveTripWorkspaceDraft(workspace)
  return workspace
}

export const buildServiceCtaEnquiryFields = (
  draft: ServiceCtaDraft,
  workspace: TripWorkspaceDraft
): Record<string, string> => {
  const fields: Record<string, string> = {
    [ENQUIRY_STRUCTURED_FIELD_KEYS.pax]: String(draft.partySize),
    _servicePrimary: draft.primary,
    _serviceStages: JSON.stringify(draft.stages),
    _portalTripWorkspace: JSON.stringify(workspace),
    'Primary request': SERVICE_CTA_PRIMARY_LABELS[draft.primary],
    'Also requested': [
      draft.stages.transfer ? 'Transfers' : '',
      draft.stages.golf ? 'Golf' : '',
      draft.stages.accommodation ? 'Accommodation' : ''
    ]
      .filter(Boolean)
      .join(', '),
    'Page': draft.pageLabel.trim() || 'Website',
    'Best time to call': draft.bestTimeToCall.trim() || 'Any time'
  }

  if (draft.travelDateFrom.trim()) {
    fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom] = draft.travelDateFrom.trim().slice(0, 10)
    fields['Travel from'] = draft.travelDateFrom.trim().slice(0, 10)
  }
  if (draft.travelDateTo.trim()) {
    fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo] = draft.travelDateTo.trim().slice(0, 10)
    fields['Travel to'] = draft.travelDateTo.trim().slice(0, 10)
  }
  if (draft.transferNotes.trim()) {
    fields['Transfer notes'] = draft.transferNotes.trim()
  }
  if (draft.golfCourseIds.length > 0) {
    fields['Golf course ids'] = draft.golfCourseIds.join(', ')
  }
  if (draft.accommodationNotes.trim()) {
    fields['Accommodation notes'] = draft.accommodationNotes.trim()
  }

  return fields
}
