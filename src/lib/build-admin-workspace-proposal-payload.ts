import { COURSES } from '../data/coastal-golf-data'
import { createProposalId, formatDocumentDate } from './document-templates'
import { inferProposalPdfProductKindFromWorkspace } from './proposal-pdf-hero'
import { illustrativeTripPriceRangeEur, type TripWorkspaceDraft } from './trip-workspace-draft'

export type AdminWorkspaceEnquiryRow = {
  readonly reference_id: string
  readonly full_name: string
  readonly email: string
  readonly interest: string | null
  readonly phone_whatsapp: string | null
  readonly best_time_to_call: string | null
  readonly created_at: string
}

export type AdminWorkspaceProposalOptions = {
  readonly manualGroupTotalEur?: number | null
  readonly tripNights?: number | null
  /** Overrides auto “{nights} nights / {rounds} rounds” on the PDF when non-empty. */
  readonly tripShapeCustom?: string | null
}

const formatEur = (value: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)

const quoteScopeFromDraft = (draft: TripWorkspaceDraft): string => {
  const parts: string[] = []
  if (draft.stages.transfer) {
    parts.push('Transfers')
  }
  if (draft.stages.golf) {
    parts.push('Golf')
  }
  if (draft.stages.hotel) {
    parts.push('Hotel')
  }
  return parts.join(' · ')
}

const illustrativeLegWeightMids = (draft: TripWorkspaceDraft): readonly [number, number, number] => {
  const n = Math.max(1, draft.partySize)
  const rounds = Math.max(1, draft.courseIds.length || (draft.stages.golf ? 1 : 0))
  const t = draft.stages.transfer ? (n * (38 + 95)) / 2 : 0
  const g = draft.stages.golf ? (n * rounds * (72 + 195)) / 2 : 0
  const h = draft.stages.hotel ? (85 * n * 2 + 320 * n * 5) / 2 : 0
  return [t, g, h]
}

const allocateProportionalIntegers = (total: number, weights: readonly [number, number, number]): readonly [number, number, number] => {
  const sum = weights[0] + weights[1] + weights[2]
  if (total <= 0 || sum <= 0) {
    return [0, 0, 0]
  }
  const raw: [number, number, number] = [
    (total * weights[0]) / sum,
    (total * weights[1]) / sum,
    (total * weights[2]) / sum
  ]
  const base: [number, number, number] = [Math.floor(raw[0]), Math.floor(raw[1]), Math.floor(raw[2])]
  let rem = total - base[0] - base[1] - base[2]
  const order = [0, 1, 2].sort((a, b) => raw[b]! - Math.floor(raw[b]!) - (raw[a]! - Math.floor(raw[a]!)))
  let i = 0
  while (rem > 0) {
    base[order[i % 3]!]!++
    rem--
    i++
  }
  return base
}

/** Preview lines for admin UI — same weighting as PDF manual split. */
export const computeManualGroupPriceAllocation = (
  draft: TripWorkspaceDraft,
  manualGroupTotalEur: number
): { transferGroup: number; golfGroup: number; hotelGroup: number; perPerson: number } | null => {
  if (!Number.isFinite(manualGroupTotalEur) || manualGroupTotalEur <= 0) {
    return null
  }
  const total = Math.round(manualGroupTotalEur)
  const w = illustrativeLegWeightMids(draft)
  const [tg, gg, hg] = allocateProportionalIntegers(total, w)
  const n = Math.max(1, draft.partySize)
  if (tg + gg + hg <= 0) {
    return null
  }
  return {
    transferGroup: tg,
    golfGroup: gg,
    hotelGroup: hg,
    perPerson: Math.round(total / n)
  }
}

const resolveNights = (draft: TripWorkspaceDraft, tripNights: number | null | undefined): number => {
  const defaultNights = draft.stages.hotel ? 4 : draft.stages.golf ? 3 : 2
  if (typeof tripNights === 'number' && Number.isFinite(tripNights) && tripNights > 0) {
    return Math.min(90, Math.floor(tripNights))
  }
  return defaultNights
}

/**
 * Builds the JSON body for POST `/api/proposal-pdf` from admin trip workspace + enquiry row.
 * Uses `variant: 'public'` so the PDF matches the client-facing proposal layout family.
 */
export const buildAdminWorkspaceProposalPdfPayload = (
  enquiry: AdminWorkspaceEnquiryRow,
  draft: TripWorkspaceDraft,
  options?: AdminWorkspaceProposalOptions | null
): Record<string, unknown> => {
  const n = Math.max(1, draft.partySize)
  const range = illustrativeTripPriceRangeEur(draft)
  const { low, high } = range
  const pplLow = Math.round(low / n)
  const pplHigh = Math.round(high / n)
  const depositLow = Math.round(low * 0.2)
  const depositHigh = Math.round(high * 0.2)
  const remLow = Math.max(0, low - depositLow)
  const remHigh = Math.max(0, high - depositHigh)

  const manualRaw = options?.manualGroupTotalEur
  const manualTotal =
    typeof manualRaw === 'number' && Number.isFinite(manualRaw) && manualRaw > 0 ? Math.round(manualRaw) : null
  const allocation = manualTotal !== null ? computeManualGroupPriceAllocation(draft, manualTotal) : null

  const courseNames = draft.courseIds
    .map((id) => COURSES.find((c) => c.id === id)?.name)
    .filter((name): name is string => Boolean(name))
  const courseName = draft.stages.golf ? (courseNames.length ? courseNames.join(', ') : 'Courses to be confirmed') : 'Not included'

  const transferName = draft.stages.transfer ? 'Private AGP & golf-day transfers (scope as selected)' : 'Not included'
  const stayName = draft.stages.hotel ? (draft.hotelNotes.trim() || 'Hotel — details to confirm') : 'Not included'
  const packageName = quoteScopeFromDraft(draft) || 'Custom quote'

  const nights = resolveNights(draft, options?.tripNights ?? null)
  const rounds = draft.stages.golf ? Math.max(1, draft.courseIds.length || 2) : 0

  let submitted = ''
  try {
    submitted = new Date(enquiry.created_at).toLocaleString('en-IE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    submitted = ''
  }

  const extraTripOverviewLines: string[] = []
  if (allocation && manualTotal !== null) {
    extraTripOverviewLines.push(
      `Admin-set group total: ${formatEur(manualTotal)} (split proportionally across selected legs using the same illustrative mid weights as the on-site calculator).`
    )
    if (draft.stages.transfer && allocation.transferGroup > 0) {
      extraTripOverviewLines.push(
        `Transfers (group): ${formatEur(allocation.transferGroup)} — about ${formatEur(Math.round(allocation.transferGroup / n))} per person if that leg is split evenly across the party.`
      )
    }
    if (draft.stages.golf && allocation.golfGroup > 0) {
      extraTripOverviewLines.push(
        `Golf (group): ${formatEur(allocation.golfGroup)} — about ${formatEur(Math.round(allocation.golfGroup / n))} per person (even split within golf).`
      )
    }
    if (draft.stages.hotel && allocation.hotelGroup > 0) {
      extraTripOverviewLines.push(
        `Hotel (group): ${formatEur(allocation.hotelGroup)} — about ${formatEur(Math.round(allocation.hotelGroup / n))} per person (even split within hotel).`
      )
    }
  }

  const useManual = Boolean(allocation && manualTotal !== null)

  const tripShapeCustom =
    typeof options?.tripShapeCustom === 'string' ? options.tripShapeCustom.trim() : ''

  const proposalProductKind = inferProposalPdfProductKindFromWorkspace(draft)

  return {
    variant: 'public',
    proposalId: createProposalId(),
    proposalDate: formatDocumentDate(),
    ...(proposalProductKind ? { proposalProductKind } : {}),
    packageName,
    stayName,
    transferName,
    groupSize: draft.partySize,
    nights,
    rounds,
    courseName,
    hotelName: draft.stages.hotel ? draft.hotelNotes.trim().slice(0, 160) : '',
    hotelDist: '',
    perPersonPrice: useManual
      ? `${formatEur(allocation!.perPerson)} (from admin-set group total ÷ ${n})`
      : `${formatEur(pplLow)} – ${formatEur(pplHigh)} (indicative)`,
    groupTotal: useManual ? `${formatEur(manualTotal!)} (admin-set)` : `${formatEur(low)} – ${formatEur(high)} (indicative)`,
    depositAmount: useManual
      ? `${formatEur(Math.round(manualTotal! * 0.2))} (20% of admin-set total)`
      : `${formatEur(depositLow)} – ${formatEur(depositHigh)} (20% indicative)`,
    remainingBalance: useManual
      ? `${formatEur(Math.max(0, manualTotal! - Math.round(manualTotal! * 0.2)))} (balance of admin-set total)`
      : `${formatEur(remLow)} – ${formatEur(remHigh)} (indicative)`,
    customerFullName: enquiry.full_name,
    customerEmail: enquiry.email,
    customerPhoneWhatsApp: enquiry.phone_whatsapp ?? '',
    customerInterest: enquiry.interest ?? '',
    enquiryReferenceId: enquiry.reference_id,
    quoteScopeSummary: quoteScopeFromDraft(draft),
    enquirySubmittedDisplay: submitted,
    ...(extraTripOverviewLines.length ? { extraTripOverviewLines } : {}),
    ...(tripShapeCustom ? { tripShapeCustom } : {})
  }
}
