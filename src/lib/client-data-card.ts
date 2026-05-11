import type { Profile } from '../providers/auth-provider'
import { formatDateTimeDdMmYy } from './date-format-ie'
import { WEBSITE_ENQUIRY_FORM, type WebsiteEnquiryFormKey } from './enquiry-form-registry'
import {
  formatWebsiteFormFieldValueForDisplay,
  getWebsiteFormFieldLabel,
  humanizeFormKey,
  mergeTripDetailsWithSaved,
  orderedWebsiteFormFieldEntries,
  parseAnyPackageBuildRowConfig,
  TRIP_DETAILS_DASHBOARD_EXCLUDED_SECTION_TITLES,
  TRIP_DETAILS_SECTIONS,
  tripDetailsFromConfig,
  tripDetailsFromManualPackage,
  type TripDetailsFieldKey
} from './package-build'

export interface ClientDataCardRow {
  readonly label: string
  readonly value: string
}

export interface ClientDataCardSection {
  readonly id: string
  readonly title: string
  readonly subtitle?: string
  readonly rows: ClientDataCardRow[]
}

export interface ClientEnquiryRowLite {
  readonly id: string
  readonly reference_id: string
  readonly created_at: string
  readonly form_payload: unknown
  /** Present when selected from enquiries table — used for dashboard greeting before profile name sync */
  readonly email?: string | null
  readonly full_name?: string | null
}

export interface ClientPackageBuildLite {
  readonly id: string
  readonly label: string | null
  readonly source: string
  readonly config: unknown
  readonly client_details: unknown
  readonly created_at: string
}

export interface ClientTransferBookingLite {
  readonly id: string
  readonly pickup_label: string
  readonly dropoff_label: string
  readonly status: string
  readonly scheduled_at: string | null
}

const transfersSection = (rows: readonly ClientTransferBookingLite[]): ClientDataCardSection | null => {
  if (rows.length === 0) {
    return null
  }
  const cardRows: ClientDataCardRow[] = rows.map((r) => {
    const when = r.scheduled_at ? formatDateTimeDdMmYy(r.scheduled_at) : 'Pick-up time not set yet'
    return {
      label: `${r.pickup_label} → ${r.dropoff_label}`,
      value: `${r.status.replace(/_/g, ' ')} · ${when}`
    }
  })
  return {
    id: 'portal-transfers',
    title: 'Transfer requests',
    subtitle: 'Map requests and saved trip routes shared with Golf Sol Ireland',
    rows: cardRows
  }
}

const isWebsiteEnquiryFormKey = (key: string): key is WebsiteEnquiryFormKey =>
  (Object.values(WEBSITE_ENQUIRY_FORM) as string[]).includes(key)

const parseFormPayload = (
  raw: unknown
): { form: string | null; fields: Record<string, string> } => {
  if (!raw || typeof raw !== 'object') {
    return { form: null, fields: {} }
  }
  const o = raw as Record<string, unknown>
  const form = typeof o.form === 'string' && o.form.trim() ? o.form.trim() : null
  const fieldsObj = o.fields && typeof o.fields === 'object' ? (o.fields as Record<string, unknown>) : {}
  const fields: Record<string, string> = {}
  for (const [k, v] of Object.entries(fieldsObj)) {
    if (typeof v === 'string') {
      fields[k] = v
    } else if (v != null) {
      fields[k] = String(v)
    }
  }
  return { form, fields }
}

const nonEmpty = (s: string) => s.trim().length > 0

/** Fixed identity block for admin operations desk (overrides profile rows). */
export interface AccountDeskDisplay {
  readonly sectionTitle: string
  readonly fullName: string
  readonly phone: string
}

const accountSection = (
  profile: Profile | null,
  userEmail: string | null,
  desk?: AccountDeskDisplay | null
): ClientDataCardSection | null => {
  if (desk) {
    return {
      id: 'account',
      title: desk.sectionTitle,
      rows: [
        { label: 'Name', value: desk.fullName.trim() },
        { label: 'Phone / WhatsApp', value: desk.phone.trim() }
      ]
    }
  }
  const rows: ClientDataCardRow[] = []
  if (profile?.full_name && nonEmpty(profile.full_name)) {
    rows.push({ label: 'Name', value: profile.full_name.trim() })
  }
  if (profile?.phone && nonEmpty(profile.phone)) {
    rows.push({ label: 'Phone / WhatsApp', value: profile.phone.trim() })
  }
  if (rows.length === 0) {
    return null
  }
  return { id: 'account', title: 'Your account', rows }
}

/** Same field list as the enquiry itinerary card — used when no package_build snapshot exists yet. */
export const buildEnquiryFormDetailRows = (row: ClientEnquiryRowLite): ClientDataCardRow[] => {
  const { fields } = parseFormPayload(row.form_payload)
  const rows: ClientDataCardRow[] = []
  for (const [key, rawVal] of orderedWebsiteFormFieldEntries(fields)) {
    const disp = formatWebsiteFormFieldValueForDisplay(key, rawVal)
    if (!nonEmpty(disp)) {
      continue
    }
    rows.push({ label: getWebsiteFormFieldLabel(key), value: disp.trim() })
  }
  return rows
}

export const buildEnquiryItinerarySection = (row: ClientEnquiryRowLite): ClientDataCardSection | null => {
  const { form } = parseFormPayload(row.form_payload)
  const rows = buildEnquiryFormDetailRows(row)
  if (rows.length === 0 && !form) {
    return null
  }
  const formLabel =
    form && isWebsiteEnquiryFormKey(form)
      ? humanizeFormKey(form.replace(/_/g, ' '))
      : form
        ? humanizeFormKey(form)
        : 'Website enquiry'
  return {
    id: `enquiry-${row.id}`,
    title: `${formLabel} · ${row.reference_id}`,
    subtitle: formatDateTimeDdMmYy(row.created_at),
    rows
  }
}

/** Detail rows for a saved package (website form snapshot or trip workspace) — reused by transfer request card. */
export const buildPackageBuildDetailRows = (row: ClientPackageBuildLite): ClientDataCardRow[] => {
  const parsed = parseAnyPackageBuildRowConfig(row.config)
  if (!parsed) {
    return []
  }

  const rows: ClientDataCardRow[] = []

  if (parsed.type === 'website_form') {
    const entries = orderedWebsiteFormFieldEntries(parsed.config.fields)
    for (const [key, rawVal] of entries) {
      const disp = formatWebsiteFormFieldValueForDisplay(key, rawVal)
      if (!nonEmpty(disp)) {
        continue
      }
      rows.push({ label: getWebsiteFormFieldLabel(key), value: disp.trim() })
    }
  } else {
    const defaults =
      parsed.type === 'manual'
        ? tripDetailsFromManualPackage(parsed.config)
        : tripDetailsFromConfig(parsed.config)
    const merged = mergeTripDetailsWithSaved(row.client_details, defaults)
    const excluded = new Set(TRIP_DETAILS_DASHBOARD_EXCLUDED_SECTION_TITLES)
    for (const section of TRIP_DETAILS_SECTIONS) {
      if (excluded.has(section.title)) {
        continue
      }
      for (const f of section.fields) {
        const v = merged[f.key as TripDetailsFieldKey]
        if (typeof v !== 'string' || !nonEmpty(v)) {
          continue
        }
        rows.push({ label: f.label, value: v.trim() })
      }
    }
  }

  return rows
}

export const extractEnquiryReferenceFromPackageBuildLite = (row: ClientPackageBuildLite | null): string | null => {
  if (!row) {
    return null
  }
  const parsed = parseAnyPackageBuildRowConfig(row.config)
  if (parsed?.type !== 'website_form') {
    return null
  }
  const id = parsed.config.enquiryReferenceId?.trim()
  return id ? id : null
}

export type TransferBookingRefLite = {
  readonly package_build_id?: string | null
  readonly enquiry_reference_id?: string | null
}

/** GSI-style reference for a transfer row (column or inferred from linked package). */
export const resolveEnquiryReferenceForTransferBooking = (
  booking: TransferBookingRefLite,
  packageBuilds: readonly ClientPackageBuildLite[]
): string => {
  const fromCol = booking.enquiry_reference_id?.trim()
  if (fromCol) {
    return fromCol
  }
  const bid = booking.package_build_id?.trim()
  if (!bid) {
    return ''
  }
  const p = packageBuilds.find((x) => x.id === bid) ?? null
  return extractEnquiryReferenceFromPackageBuildLite(p) ?? ''
}

/**
 * Earliest website_form package snapshot for this enquiry ref (first submitted calculator-style form).
 * Falls back to the row referenced by `package_build_id` when no ref match.
 */
export const resolveFirstWebsiteFormPackageBuildForTransfer = (
  booking: TransferBookingRefLite,
  packageBuilds: readonly ClientPackageBuildLite[]
): ClientPackageBuildLite | null => {
  const ref = resolveEnquiryReferenceForTransferBooking(booking, packageBuilds)
  const websiteRows: ClientPackageBuildLite[] = []
  for (const row of packageBuilds) {
    const parsed = parseAnyPackageBuildRowConfig(row.config)
    if (parsed?.type === 'website_form' && parsed.config.enquiryReferenceId?.trim()) {
      websiteRows.push(row)
    }
  }
  if (ref) {
    const matches = websiteRows.filter((row) => {
      const parsed = parseAnyPackageBuildRowConfig(row.config)
      return parsed?.type === 'website_form' && parsed.config.enquiryReferenceId.trim() === ref
    })
    if (matches.length > 0) {
      return matches.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0] ?? null
    }
  }
  const bid = booking.package_build_id?.trim()
  if (bid) {
    return packageBuilds.find((x) => x.id === bid) ?? null
  }
  return null
}

/** One-line title for an enquiry row (matches package card style). */
export const enquirySnapshotKicker = (row: ClientEnquiryRowLite): string => {
  const { form } = parseFormPayload(row.form_payload)
  const formLabel =
    form && isWebsiteEnquiryFormKey(form)
      ? humanizeFormKey(form.replace(/_/g, ' '))
      : form
        ? humanizeFormKey(form)
        : 'Website enquiry'
  return `${formLabel} · ${row.reference_id}`
}

export const findFirstEnquiryForReference = (
  ref: string | null | undefined,
  enquiries: readonly ClientEnquiryRowLite[]
): ClientEnquiryRowLite | null => {
  const r = ref?.trim()
  if (!r) {
    return null
  }
  const hits = enquiries.filter((e) => (e.reference_id ?? '').trim() === r)
  if (hits.length === 0) {
    return null
  }
  return hits.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0] ?? null
}

const packageBuildSection = (row: ClientPackageBuildLite): ClientDataCardSection | null => {
  const parsed = parseAnyPackageBuildRowConfig(row.config)
  if (!parsed) {
    return null
  }

  const rows = buildPackageBuildDetailRows(row)

  if (rows.length === 0) {
    return null
  }

  const label = row.label?.trim() || (parsed.type === 'website_form' ? parsed.config.enquiryReferenceId : 'Package')
  return {
    id: `build-${row.id}`,
    title: `Saved package · ${label}`,
    subtitle: formatDateTimeDdMmYy(row.created_at),
    rows
  }
}

/**
 * Builds dashboard card sections: only non-empty fields from profile, enquiries, and package builds.
 */
export const buildClientDataCardSections = (input: {
  readonly profile: Profile | null
  readonly userEmail: string | null
  readonly enquiries: readonly ClientEnquiryRowLite[]
  readonly packageBuilds: readonly ClientPackageBuildLite[]
  readonly transferBookings?: readonly ClientTransferBookingLite[]
  /** When false, omit the transfer summary section (e.g. client dashboard renders a custom transfer card). */
  readonly includeTransferSection?: boolean
  /** Admin desk: fixed section title and contact lines instead of the signed-in profile. */
  readonly accountDesk?: AccountDeskDisplay | null
}): ClientDataCardSection[] => {
  const out: ClientDataCardSection[] = []
  const acc = accountSection(input.profile, input.userEmail, input.accountDesk)
  if (acc) {
    out.push(acc)
  }

  const includeTransfers = input.includeTransferSection !== false
  if (includeTransfers) {
    const tr = transfersSection(input.transferBookings ?? [])
    if (tr) {
      out.push(tr)
    }
  }

  const enquiriesSorted = [...input.enquiries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  for (const e of enquiriesSorted) {
    const s = buildEnquiryItinerarySection(e)
    if (s && s.rows.length > 0) {
      out.push(s)
    }
  }

  const buildsSorted = [...input.packageBuilds].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  for (const b of buildsSorted) {
    const s = packageBuildSection(b)
    if (s) {
      out.push(s)
    }
  }

  return out
}
