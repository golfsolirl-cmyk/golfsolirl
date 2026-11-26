import { BUNDLE_DURATIONS } from '../../../data/golf-holiday-bundles'
import type { ContentFormConfig, ContentFormField } from '../content-page-context'
import { golferGroupSizeSelectOptions, passengerCountSelectOptions } from './form-people-options'

/** Bundle picker options — Short breaks / Most popular / Full golf week. */
export const leanBundleSelectOptions = [
  ...BUNDLE_DURATIONS.flatMap((duration) =>
    duration.packages.map((pkg) => ({
      label: `${duration.badge}: ${pkg.name} · ${pkg.rounds} rounds`,
      value: `${duration.title} — ${pkg.name} (${pkg.rounds} rounds)`
    }))
  ),
  { label: 'Custom / not sure yet', value: 'Custom / not sure yet' }
] as const

/**
 * Essentials-only enquiry fields (Thomas feedback).
 * Name / email / phone stay in the form shell; these are the extra trip fields.
 */
export function leanTripFields(opts?: {
  readonly includeBundle?: boolean
  readonly peopleMode?: 'golfers' | 'passengers' | 'none'
  readonly notesPlaceholder?: string
  readonly notesRequired?: boolean
}): readonly ContentFormField[] {
  const includeBundle = opts?.includeBundle !== false
  const peopleMode = opts?.peopleMode ?? 'golfers'
  const notesPlaceholder =
    opts?.notesPlaceholder ?? 'Anything else we should know — courses, hotel style, flights…'

  const fields: ContentFormField[] = []
  if (includeBundle) {
    fields.push({
      id: 'bundleChoice',
      label: 'Bundle',
      type: 'select',
      required: false,
      options: [...leanBundleSelectOptions]
    })
  }
  fields.push(
    { id: 'travelDateFrom', label: 'Start date', type: 'date', required: false },
    { id: 'travelDateTo', label: 'End date', type: 'date', required: false }
  )
  if (peopleMode === 'golfers') {
    fields.push({
      id: 'groupSize',
      label: 'Golfers',
      type: 'select',
      required: true,
      options: golferGroupSizeSelectOptions
    })
  } else if (peopleMode === 'passengers') {
    fields.push({
      id: 'passengerCount',
      label: 'Passengers',
      type: 'select',
      required: true,
      options: passengerCountSelectOptions
    })
  }
  fields.push({
    id: 'notes',
    label: 'Message',
    type: 'textarea',
    placeholder: notesPlaceholder,
    rows: 4,
    required: opts?.notesRequired ?? false
  })
  return fields
}

export function leanEnquiryFormConfig(opts?: {
  readonly badge?: string
  readonly submitLabel?: string
  readonly successTitle?: string
  readonly successBody?: string
  readonly includeBundle?: boolean
  readonly peopleMode?: 'golfers' | 'passengers' | 'none'
  readonly notesPlaceholder?: string
  readonly notesRequired?: boolean
  readonly submissionKind?: ContentFormConfig['submissionKind']
  readonly extraFields?: readonly ContentFormField[]
}): ContentFormConfig {
  return {
    badge: opts?.badge ?? 'Get a quote',
    submitLabel: opts?.submitLabel ?? 'Send enquiry',
    successTitle: opts?.successTitle ?? 'Enquiry received',
    successBody:
      opts?.successBody ?? 'Thanks — we will reply from Ireland with the next clear step for your trip.',
    submissionKind: opts?.submissionKind,
    fields: [...(opts?.extraFields ?? []), ...leanTripFields({
      includeBundle: opts?.includeBundle,
      peopleMode: opts?.peopleMode,
      notesPlaceholder: opts?.notesPlaceholder,
      notesRequired: opts?.notesRequired
    })]
  }
}
