/**
 * Shared enquiry / trip stages for admin cards and the client portal.
 * Derived from existing payment + review fields — no parallel status store.
 */

export type EnquiryTripStageId =
  | 'submitted'
  | 'reviewed'
  | 'quoted'
  | 'awaiting_payment'
  | 'deposit_paid'
  | 'paid'

export type EnquiryTripStage = {
  readonly id: EnquiryTripStageId
  readonly label: string
  readonly shortLabel: string
  readonly complete: boolean
  readonly current: boolean
}

export type EnquiryTripStageInput = {
  readonly adminViewedAt?: string | null
  readonly hasQuotePrice?: boolean
  readonly paymentStatus?: string | null
  readonly invoicePaid?: boolean
}

const STAGE_META: readonly { id: EnquiryTripStageId; label: string; shortLabel: string }[] = [
  { id: 'submitted', label: 'Form received', shortLabel: 'Received' },
  { id: 'reviewed', label: 'Team reviewing', shortLabel: 'Review' },
  { id: 'quoted', label: 'Price sent', shortLabel: 'Quoted' },
  { id: 'awaiting_payment', label: 'Awaiting payment', shortLabel: 'Pay' },
  { id: 'deposit_paid', label: 'Deposit paid', shortLabel: 'Deposit' },
  { id: 'paid', label: 'Fully paid', shortLabel: 'Paid' }
]

export const resolveEnquiryTripStageId = (input: EnquiryTripStageInput): EnquiryTripStageId => {
  const pay = String(input.paymentStatus ?? 'unpaid').toLowerCase()
  if (input.invoicePaid || pay === 'paid') {
    return 'paid'
  }
  if (pay === 'deposit') {
    return 'deposit_paid'
  }
  if (input.hasQuotePrice) {
    return 'awaiting_payment'
  }
  if (input.adminViewedAt) {
    return 'reviewed'
  }
  return 'submitted'
}

export const buildEnquiryTripStages = (input: EnquiryTripStageInput): readonly EnquiryTripStage[] => {
  const currentId = resolveEnquiryTripStageId(input)
  const order = STAGE_META.map((s) => s.id)
  const currentIndex = order.indexOf(currentId)

  // Hide deposit step when already fully paid without deposit, keep list simple.
  const visible = STAGE_META.filter((s) => {
    if (s.id === 'deposit_paid' && currentId === 'paid' && String(input.paymentStatus ?? '').toLowerCase() !== 'deposit') {
      return false
    }
    if (s.id === 'quoted' && currentIndex >= order.indexOf('awaiting_payment')) {
      // quoted merges into awaiting_payment once price exists
      return currentId === 'quoted'
    }
    return true
  })

  const visibleIds = visible.map((s) => s.id)
  let currentVisibleIndex = visibleIds.indexOf(currentId)
  if (currentVisibleIndex < 0 && currentId === 'awaiting_payment') {
    currentVisibleIndex = visibleIds.indexOf('quoted')
  }
  if (currentVisibleIndex < 0) {
    currentVisibleIndex = 0
  }

  return visible.map((meta, index) => ({
    id: meta.id,
    label: meta.label,
    shortLabel: meta.shortLabel,
    complete: index < currentVisibleIndex,
    current: index === currentVisibleIndex
  }))
}

export const enquiryTripStageBadgeLabel = (input: EnquiryTripStageInput): string => {
  const id = resolveEnquiryTripStageId(input)
  return STAGE_META.find((s) => s.id === id)?.label ?? 'In progress'
}
