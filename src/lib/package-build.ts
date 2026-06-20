/** Website `formPayload.form` string keys: see `src/lib/enquiry-form-registry.ts`. */
import { formatDateDdMmYy, formatDateTimeDdMmYy, looksLikeIsoOrYmdDate } from './date-format-ie'
import { ENQUIRY_STRUCTURED_FIELD_KEYS, PICKUP_DROPOFF_TYPES } from './enquiry-form-registry'
import {
  ensureTripWorkspaceDraftShape,
  isLikelyEnquiryReferenceId,
  isUnsavedDefaultTripWorkspace,
  normalizeTransferStops,
  parsePersistedTripWorkspaceFromPackage,
  type TripWorkspaceDraft
} from './trip-workspace-draft'

export type PackageBuildSource = 'landing' | 'packages'

/** Irish VAT standard rate (services) — confirm with your accountant for reduced / exempt lines. */
export const IRISH_VAT_STANDARD_RATE = 0.23
export const IRISH_VAT_REDUCED_TOURISM_RATE = 0.135

const roundMoney2 = (n: number) => Math.round(n * 100) / 100

export interface WebsiteFormAdminQuote {
  readonly grossTotalEur: number
  readonly vatRate: number
  readonly netServicesEur: number
  readonly vatAmountEur: number
  readonly deposit20Eur: number
  readonly balance80Eur: number
  readonly savedAt: string
}

export const buildWebsiteFormAdminQuote = (grossTotalEur: number, vatRate: number): WebsiteFormAdminQuote => {
  const safeRate = Number.isFinite(vatRate) && vatRate >= 0 && vatRate < 1 ? vatRate : IRISH_VAT_STANDARD_RATE
  const gross = roundMoney2(grossTotalEur)
  const netServicesEur = roundMoney2(gross / (1 + safeRate))
  const vatAmountEur = roundMoney2(gross - netServicesEur)
  return {
    grossTotalEur: gross,
    vatRate: safeRate,
    netServicesEur,
    vatAmountEur,
    deposit20Eur: roundMoney2(gross * 0.2),
    balance80Eur: roundMoney2(gross * 0.8),
    savedAt: new Date().toISOString()
  }
}

const parseWebsiteFormAdminQuote = (raw: unknown): WebsiteFormAdminQuote | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined
  }
  const o = raw as Record<string, unknown>
  const gross = Number(o.grossTotalEur)
  const rate = Number(o.vatRate)
  if (!Number.isFinite(gross) || gross <= 0 || !Number.isFinite(rate) || rate < 0 || rate >= 1) {
    return undefined
  }
  const savedAt = typeof o.savedAt === 'string' && o.savedAt.trim() ? o.savedAt.trim() : new Date().toISOString()
  const built = buildWebsiteFormAdminQuote(gross, rate)
  return { ...built, savedAt }
}

export interface PackageBuildTotals {
  readonly estimatedPerPerson: number
  readonly estimatedGroupTotal: number
  readonly depositAmount: number
  readonly remainingBalance: number
}

export interface PackageBuildConfig {
  readonly version: 1
  readonly source: PackageBuildSource
  readonly packageStyle: string
  readonly stayName: string
  readonly transferName: string
  readonly groupSize: number
  readonly nights: number
  readonly rounds: number
  readonly totals: PackageBuildTotals
  readonly courseId?: string | null
  readonly courseName?: string | null
  readonly hotelName?: string | null
  readonly hotelStars?: number | null
  readonly hotelDist?: string | null
}

const stayTierByName: Record<string, 3 | 4 | 5> = {
  'Coastal 3-star': 3,
  'Premium 4-star': 4,
  'Luxury 5-star': 5
}

const transferParamByName: Record<string, 'shared' | 'private' | 'driver'> = {
  'Shared arrival and golf transfers': 'shared',
  'Private return transfers': 'private',
  'Dedicated driver support': 'driver'
}

export const buildPackageConfig = (input: {
  readonly source: PackageBuildSource
  readonly packageStyle: string
  readonly stayName: string
  readonly transferName: string
  readonly groupSize: number
  readonly nights: number
  readonly rounds: number
  readonly totals: PackageBuildTotals
  readonly courseId?: string | null
  readonly courseName?: string | null
  readonly hotelName?: string | null
  readonly hotelStars?: number | null
  readonly hotelDist?: string | null
}): PackageBuildConfig => ({
  version: 1,
  source: input.source,
  packageStyle: input.packageStyle,
  stayName: input.stayName,
  transferName: input.transferName,
  groupSize: input.groupSize,
  nights: input.nights,
  rounds: input.rounds,
  totals: input.totals,
  courseId: input.courseId ?? null,
  courseName: input.courseName ?? null,
  hotelName: input.hotelName ?? null,
  hotelStars: input.hotelStars ?? null,
  hotelDist: input.hotelDist ?? null
})

/** Re-open the public packages calculator with the same selections. */
export const packagesPagePathFromConfig = (config: PackageBuildConfig): string => {
  const stay = stayTierByName[config.stayName] ?? 4
  const transfer = transferParamByName[config.transferName] ?? 'private'

  const search = new URLSearchParams({
    groupSize: String(config.groupSize),
    nights: String(config.nights),
    rounds: String(config.rounds),
    transfer,
    stay: String(stay),
    package: config.packageStyle
  })

  if (config.source === 'landing') {
    search.set('from', 'landing')
  }

  if (config.courseId) {
    search.set('courseId', config.courseId)
  }
  if (config.courseName) {
    search.set('courseName', config.courseName)
  }
  if (config.hotelName) {
    search.set('hotelName', config.hotelName)
  }
  if (config.hotelStars != null) {
    search.set('hotelStars', String(config.hotelStars))
  }
  if (config.hotelDist) {
    search.set('hotelDist', config.hotelDist)
  }

  return `/packages?${search.toString()}`
}

export const defaultLabelForBuild = (config: PackageBuildConfig): string =>
  `${config.packageStyle} · ${config.groupSize} golfers · ${config.nights} nights`

export const parsePackageBuildConfig = (raw: unknown): PackageBuildConfig | null => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const o = raw as Partial<PackageBuildConfig>
  if (o.version !== 1 || typeof o.packageStyle !== 'string' || !o.totals) {
    return null
  }

  return o as PackageBuildConfig
}

// --- Admin-published manual packages (config version 2; DB source admin_transfer | admin_golf | admin_hotel) ---

export type AdminManualPackageKind = 'transfer' | 'golf' | 'hotel'

export type AdminManualBuildSource = 'admin_transfer' | 'admin_golf' | 'admin_hotel'

export interface AdminManualPackageConfig {
  readonly version: 2
  readonly kind: AdminManualPackageKind
  readonly title: string
  readonly summary: string
  readonly priceEur: number
}

export interface PortalGolfTransferLeg {
  readonly courseId: string
  readonly notes: string
  /** Optional `datetime-local` string for this leg pick-up. */
  readonly pickupAtLocal?: string
}

export interface PortalHotelTransferLeg {
  readonly hotelName: string
  readonly notes: string
  readonly pickupAtLocal?: string
}

/** Client-edited golf / hotel transfer legs; stored on `package_builds.config` (website_form v3). */
export interface PortalTransferPlan {
  readonly version: 1
  readonly updatedAt: string
  readonly golfLegs: readonly PortalGolfTransferLeg[]
  readonly hotelLegs: readonly PortalHotelTransferLeg[]
}

export interface WebsiteFormPackageConfig {
  readonly version: 3
  readonly formKey: string
  readonly enquiryReferenceId: string
  readonly submittedAt: string
  readonly fields: Readonly<Record<string, string>>
  /** Optional admin-published pricing (VAT-inclusive headline with deposit / balance). */
  readonly adminQuote?: WebsiteFormAdminQuote
  /** Client-saved transfer planning (Costa del Sol courses + hotels). */
  readonly portalTransferPlan?: PortalTransferPlan
  /** Client-saved trip workspace (route stops, stages, party) from the portal dashboard. */
  readonly portalTripWorkspace?: TripWorkspaceDraft
}

/** Human copy when pickup type is “match fleet to group” (stored as `free_text`). */
export const WEBSITE_FORM_PICKUP_FREE_TEXT_DISPLAY =
  'Mercedes fleet: E-Class, V-Class and Sprinter — matched to your group and bag count.'

export type ParsedPackageBuildConfig =
  | { readonly type: 'calculator'; readonly config: PackageBuildConfig }
  | { readonly type: 'manual'; readonly config: AdminManualPackageConfig }
  | { readonly type: 'website_form'; readonly config: WebsiteFormPackageConfig }

export const humanizeFormKey = (key: string): string =>
  key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())

const WEBSITE_FORM_FIELD_LABELS: Readonly<Record<string, string>> = {
  [ENQUIRY_STRUCTURED_FIELD_KEYS.pax]: 'Passengers',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.pickupType]: 'Pickup type',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.pickupId]: 'Pickup reference',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.pickupLabel]: 'Pickup location',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType]: 'Drop-off type',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffId]: 'Drop-off reference',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffLabel]: 'Drop-off location',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.quoteIntent]: 'Quote intent',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom]: 'Travel start date',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo]: 'Travel end date',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.alreadyAtMalagaAgp]: 'Already at Málaga (AGP)',
  Passengers: 'Passengers',
  'Trip timing': 'Trip timing',
  'Collection point': 'Collection point',
  Destination: 'Destination',
  'Collection timing': 'Collection timing',
  ASAP: 'ASAP',
  'Travel start date': 'Travel start date',
  'Travel end date': 'Travel end date',
  'Service date (already here)': 'Service date (already here)',
  'Public form': 'Public form',
  Interest: 'Interest',
  interest: 'Interest'
}

const splitCamelToWords = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()

/** Human-readable label for a website enquiry `fields` key (matches on-page form wording where possible). */
export const getWebsiteFormFieldLabel = (key: string): string => {
  const k = key.replace(/^form\./i, '').trim()
  if (WEBSITE_FORM_FIELD_LABELS[k]) {
    return WEBSITE_FORM_FIELD_LABELS[k]
  }
  if (k.startsWith('_')) {
    const words = splitCamelToWords(k.slice(1))
    return humanizeFormKey(words || k.slice(1))
  }
  if (/[\s/]/.test(k) || /^[A-Z][a-z]/.test(k)) {
    return k
  }
  return humanizeFormKey(splitCamelToWords(k) || k)
}

/** Airport / course / hotel pickup labels for structured enquiry fields (client + admin). */
export const humanizePickupDropoffTypeForDisplay = (raw: string): string => {
  const v = raw.trim().toLowerCase()
  if (v === PICKUP_DROPOFF_TYPES.malagaAirport) {
    return 'Private Mercedes van (Málaga AGP)'
  }
  if (v === PICKUP_DROPOFF_TYPES.golfCourse) {
    return 'Golf course'
  }
  if (v === PICKUP_DROPOFF_TYPES.hotel) {
    return 'Hotel / resort'
  }
  if (v === PICKUP_DROPOFF_TYPES.freeText) {
    return WEBSITE_FORM_PICKUP_FREE_TEXT_DISPLAY
  }
  return raw.trim()
}

const WEBSITE_FORM_DATE_VALUE_KEYS = new Set<string>([
  ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom,
  ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo,
  'Travel start date',
  'Travel end date',
  'Service date (already here)',
  'Collection timing'
])

/** Display value for website form snapshot rows (PDF, dashboard, quote preview). */
export const formatWebsiteFormFieldValueForDisplay = (key: string, raw: string): string => {
  const k = key.replace(/^form\./i, '').trim()
  const v = raw.trim()
  if (k === ENQUIRY_STRUCTURED_FIELD_KEYS.pickupType || k === ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType) {
    return humanizePickupDropoffTypeForDisplay(v)
  }
  if (WEBSITE_FORM_DATE_VALUE_KEYS.has(k) && looksLikeIsoOrYmdDate(v)) {
    return v.includes('T') && v.length >= 13 ? formatDateTimeDdMmYy(v) : formatDateDdMmYy(v)
  }
  // Do not match "collection" here — it appears in "Collection point" (a place name). Date-like collection times use
  // WEBSITE_FORM_DATE_VALUE_KEYS ("Collection timing") or keys containing "date" / "timing" / "landing".
  if (looksLikeIsoOrYmdDate(v) && /date|timing|landing/i.test(k)) {
    return v.includes('T') && v.length >= 13 ? formatDateTimeDdMmYy(v) : formatDateDdMmYy(v)
  }
  return raw
}

/** Preferred order for enquiry fields on the client dashboard card (remaining keys follow alphabetically). */
export const WEBSITE_FORM_CLIENT_CARD_FIELD_ORDER: readonly string[] = [
  'Interest',
  'interest',
  'ASAP',
  'Passengers',
  '_pax',
  'Destination',
  'Trip timing',
  'Collection point',
  'Collection timing',
  '_travelDateFrom',
  'Travel start date',
  '_travelDateTo',
  'Travel end date',
  '_pickupType',
  '_pickupLabel',
  '_dropoffType',
  '_dropoffLabel',
  '_pickupId',
  '_dropoffId',
  '_quoteIntent',
  '_alreadyAtMalagaAgp',
  'Service date (already here)',
  'Public form',
  'Primary request',
  'Also requested',
  'Page',
  'Best time to call',
  'Transfer notes',
  'Golf course ids',
  'Accommodation notes',
  'Travel from',
  'Travel to'
]

/** Machine keys hidden on client dashboard cards (human labels are stored separately). */
const WEBSITE_FORM_INTERNAL_FIELD_KEYS = new Set<string>([
  ENQUIRY_STRUCTURED_FIELD_KEYS.portalTripWorkspace,
  ENQUIRY_STRUCTURED_FIELD_KEYS.termsAccepted,
  ENQUIRY_STRUCTURED_FIELD_KEYS.termsAcceptedAt,
  ENQUIRY_STRUCTURED_FIELD_KEYS.servicePrimary,
  ENQUIRY_STRUCTURED_FIELD_KEYS.serviceStages,
  ENQUIRY_STRUCTURED_FIELD_KEYS.accountAnchorRef
])

export const orderedWebsiteFormFieldEntries = (fields: Readonly<Record<string, string>>): [string, string][] => {
  const used = new Set<string>()
  const out: [string, string][] = []

  const sameCalendarDay = (a: string, b: string) => {
    const sa = a.trim().slice(0, 10)
    const sb = b.trim().slice(0, 10)
    return /^\d{4}-\d{2}-\d{2}$/.test(sa) && sa === sb.slice(0, 10)
  }

  const add = (key: string) => {
    if (used.has(key) || WEBSITE_FORM_INTERNAL_FIELD_KEYS.has(key)) {
      return
    }
    const v = fields[key]
    if (v === undefined) {
      return
    }
    if (key === '_pax' && typeof fields.Passengers === 'string' && fields.Passengers.trim() === String(v).trim()) {
      return
    }
    if (key === 'interest' && typeof fields.Interest === 'string' && fields.Interest.trim() === String(v).trim()) {
      return
    }
    if (key === 'Travel start date' && used.has(ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom)) {
      const u = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom]
      if (typeof u === 'string' && sameCalendarDay(u, String(v))) {
        return
      }
    }
    if (key === 'Travel end date' && used.has(ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo)) {
      const u = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo]
      if (typeof u === 'string' && sameCalendarDay(u, String(v))) {
        return
      }
    }
    used.add(key)
    out.push([key, String(v)])
  }

  for (const key of WEBSITE_FORM_CLIENT_CARD_FIELD_ORDER) {
    if (key in fields) {
      add(key)
    }
  }

  const rest = Object.keys(fields)
    .filter((k) => !used.has(k))
    .sort((a, b) => {
      const ua = a.startsWith('_') ? 1 : 0
      const ub = b.startsWith('_') ? 1 : 0
      if (ua !== ub) {
        return ua - ub
      }
      return a.localeCompare(b, 'en')
    })
  for (const k of rest) {
    add(k)
  }

  return out
}

export const emptyPortalTransferPlanDraft = (): PortalTransferPlan => ({
  version: 1,
  updatedAt: '',
  golfLegs: [{ courseId: '', notes: '' }],
  hotelLegs: [{ hotelName: '', notes: '' }]
})

export const normalizePortalTransferPlan = (raw: unknown): PortalTransferPlan => {
  const empty = emptyPortalTransferPlanDraft()
  if (!raw || typeof raw !== 'object') {
    return empty
  }
  const o = raw as Record<string, unknown>
  const golfRaw = Array.isArray(o.golfLegs) ? o.golfLegs : []
  const hotelRaw = Array.isArray(o.hotelLegs) ? o.hotelLegs : []
  const golfLegs = golfRaw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const g = item as Record<string, unknown>
      const courseId = typeof g.courseId === 'string' ? g.courseId.trim() : ''
      const notes = typeof g.notes === 'string' ? g.notes.trim() : ''
      const pickupAtLocal = typeof g.pickupAtLocal === 'string' ? g.pickupAtLocal.trim() : ''
      const out: PortalGolfTransferLeg = { courseId, notes }
      return pickupAtLocal ? { ...out, pickupAtLocal } : out
    })
    .filter((x): x is PortalGolfTransferLeg => Boolean(x))
  const hotelLegs = hotelRaw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const h = item as Record<string, unknown>
      const hotelName = typeof h.hotelName === 'string' ? h.hotelName.trim() : ''
      const notes = typeof h.notes === 'string' ? h.notes.trim() : ''
      const pickupAtLocal = typeof h.pickupAtLocal === 'string' ? h.pickupAtLocal.trim() : ''
      const out: PortalHotelTransferLeg = { hotelName, notes }
      return pickupAtLocal ? { ...out, pickupAtLocal } : out
    })
    .filter((x): x is PortalHotelTransferLeg => Boolean(x))

  const updatedAt = typeof o.updatedAt === 'string' && o.updatedAt.trim() ? o.updatedAt.trim() : ''

  if (golfLegs.length === 0 && hotelLegs.length === 0) {
    return empty
  }

  return {
    version: 1,
    updatedAt,
    golfLegs: golfLegs.length ? golfLegs : [{ courseId: '', notes: '' }],
    hotelLegs: hotelLegs.length ? hotelLegs : [{ hotelName: '', notes: '' }]
  }
}

export const sanitizePortalTransferPlanForSave = (plan: PortalTransferPlan): PortalTransferPlan | null => {
  const golfLegs = plan.golfLegs
    .map((l) => {
      const courseId = l.courseId.trim()
      const notes = l.notes.trim()
      const pickupAtLocal = typeof l.pickupAtLocal === 'string' ? l.pickupAtLocal.trim() : ''
      const row: PortalGolfTransferLeg = { courseId, notes }
      return pickupAtLocal ? { ...row, pickupAtLocal } : row
    })
    .filter((l) => l.courseId.length > 0)
  const hotelLegs = plan.hotelLegs
    .map((l) => {
      const hotelName = l.hotelName.trim()
      const notes = l.notes.trim()
      const pickupAtLocal = typeof l.pickupAtLocal === 'string' ? l.pickupAtLocal.trim() : ''
      const row: PortalHotelTransferLeg = { hotelName, notes }
      return pickupAtLocal ? { ...row, pickupAtLocal } : row
    })
    .filter((l) => l.hotelName.length > 0)
  if (golfLegs.length === 0 && hotelLegs.length === 0) {
    return null
  }
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    golfLegs,
    hotelLegs
  }
}

/** Merge client portal transfer plan into existing website_form JSON (preserves `fields`, `adminQuote`, etc.). */
export const mergePortalTransferPlanIntoWebsiteFormConfig = (
  existingRaw: unknown,
  plan: PortalTransferPlan
): Record<string, unknown> => {
  if (!existingRaw || typeof existingRaw !== 'object') {
    throw new Error('Invalid package config')
  }
  const base = { ...(existingRaw as Record<string, unknown>) }
  const cleaned = sanitizePortalTransferPlanForSave(plan)
  if (!cleaned) {
    delete base.portalTransferPlan
  } else {
    base.portalTransferPlan = cleaned
  }
  return base
}

/** Persist portal trip workspace (route builder + stages) into website_form JSON. */
export const mergePortalTripWorkspaceIntoWebsiteFormConfig = (
  existingRaw: unknown,
  draft: TripWorkspaceDraft,
  enquiryReferenceId: string
): Record<string, unknown> => {
  if (!existingRaw || typeof existingRaw !== 'object') {
    throw new Error('Invalid package config')
  }
  const base = { ...(existingRaw as Record<string, unknown>) }
  const ref = enquiryReferenceId.trim()
  const aligned = ensureTripWorkspaceDraftShape({ ...draft, referenceId: ref })
  if (ref && isLikelyEnquiryReferenceId(ref)) {
    base.enquiryReferenceId = ref
  }
  const stops = normalizeTransferStops(aligned.transferStops)
  base.portalTripWorkspace = {
    stages: { ...aligned.stages },
    partySize: aligned.partySize,
    courseIds: [...aligned.courseIds],
    hotelNotes: aligned.hotelNotes,
    transferStops: stops.map((s) => {
      const row: Record<string, unknown> = { kind: s.kind, ref: s.ref }
      const pt = typeof s.pickupAtLocal === 'string' && s.pickupAtLocal.trim() ? s.pickupAtLocal.trim() : ''
      if (pt.length > 0) {
        row.pickupAtLocal = pt
      }
      return row
    }),
    transferContactPhone: aligned.transferContactPhone ?? '',
    updatedAt: aligned.updatedAt
  }
  return base
}

/** Update `adminQuote` on website_form config without dropping portal legs or trip workspace. */
export const mergeAdminQuoteIntoWebsiteFormConfig = (existingRaw: unknown, quote: WebsiteFormAdminQuote): Record<string, unknown> => {
  if (!existingRaw || typeof existingRaw !== 'object') {
    throw new Error('Invalid package config')
  }
  return { ...(existingRaw as Record<string, unknown>), adminQuote: quote }
}

export const parseManualAdminPackageConfig = (raw: unknown): AdminManualPackageConfig | null => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const o = raw as Record<string, unknown>
  if (o.version !== 2) {
    return null
  }

  const kind = o.kind
  if (kind !== 'transfer' && kind !== 'golf' && kind !== 'hotel') {
    return null
  }

  if (typeof o.title !== 'string' || !o.title.trim()) {
    return null
  }

  const price = Number(o.priceEur)
  if (!Number.isFinite(price) || price < 0) {
    return null
  }

  const summary = typeof o.summary === 'string' ? o.summary : ''

  return {
    version: 2,
    kind,
    title: o.title.trim(),
    summary,
    priceEur: price
  }
}

export const parseWebsiteFormPackageConfig = (raw: unknown): WebsiteFormPackageConfig | null => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const o = raw as Record<string, unknown>
  if (o.version !== 3) {
    return null
  }

  if (typeof o.formKey !== 'string' || !o.formKey.trim()) {
    return null
  }

  if (typeof o.enquiryReferenceId !== 'string' || !o.enquiryReferenceId.trim()) {
    return null
  }

  const submittedAt = typeof o.submittedAt === 'string' && o.submittedAt.trim() ? o.submittedAt.trim() : new Date(0).toISOString()

  const rawFields = o.fields
  const fields: Record<string, string> = {}
  if (rawFields && typeof rawFields === 'object') {
    for (const [k, v] of Object.entries(rawFields as Record<string, unknown>)) {
      if (typeof v === 'string') {
        fields[k] = v
      } else if (v != null) {
        fields[k] = String(v)
      }
    }
  }

  const adminQuote = parseWebsiteFormAdminQuote(o.adminQuote)
  const portalTransferPlanRaw = normalizePortalTransferPlan(o.portalTransferPlan)
  const hasPortalPlan =
    portalTransferPlanRaw.golfLegs.some((l) => l.courseId.trim()) ||
    portalTransferPlanRaw.hotelLegs.some((l) => l.hotelName.trim())

  const enquiryRef = o.enquiryReferenceId.trim()
  let portalTripWorkspace: TripWorkspaceDraft | undefined
  if ('portalTripWorkspace' in o) {
    const rawTw = o.portalTripWorkspace
    if (rawTw != null && typeof rawTw === 'object' && !Array.isArray(rawTw) && Object.keys(rawTw as Record<string, unknown>).length > 0) {
      const tw = parsePersistedTripWorkspaceFromPackage(rawTw, enquiryRef)
      if (tw && !isUnsavedDefaultTripWorkspace(tw, enquiryRef)) {
        portalTripWorkspace = tw
      }
    }
  }

  return {
    version: 3,
    formKey: o.formKey.trim(),
    enquiryReferenceId: enquiryRef,
    submittedAt,
    fields,
    ...(adminQuote ? { adminQuote } : {}),
    ...(hasPortalPlan ? { portalTransferPlan: portalTransferPlanRaw } : {}),
    ...(portalTripWorkspace ? { portalTripWorkspace } : {})
  }
}

export const parseAnyPackageBuildRowConfig = (raw: unknown): ParsedPackageBuildConfig | null => {
  const manual = parseManualAdminPackageConfig(raw)
  if (manual) {
    return { type: 'manual', config: manual }
  }

  const website = parseWebsiteFormPackageConfig(raw)
  if (website) {
    return { type: 'website_form', config: website }
  }

  const calc = parsePackageBuildConfig(raw)
  if (calc) {
    return { type: 'calculator', config: calc }
  }

  return null
}

export const adminKindFromBuildSource = (source: string): AdminManualPackageKind | null => {
  if (source === 'admin_transfer') {
    return 'transfer'
  }
  if (source === 'admin_golf') {
    return 'golf'
  }
  if (source === 'admin_hotel') {
    return 'hotel'
  }
  return null
}

export const buildSourceForAdminKind = (kind: AdminManualPackageKind): AdminManualBuildSource => {
  if (kind === 'transfer') {
    return 'admin_transfer'
  }
  if (kind === 'golf') {
    return 'admin_golf'
  }
  return 'admin_hotel'
}

export const packageBuildDbSourceLabel = (source: string): string => {
  switch (source) {
    case 'landing':
      return 'Homepage calculator'
    case 'packages':
      return 'Packages calculator'
    case 'admin_transfer':
      return 'Admin · Transfers'
    case 'admin_golf':
      return 'Admin · Golf courses'
    case 'admin_hotel':
      return 'Admin · Hotel'
    case 'website_form':
      return 'Website form'
    default:
      return source
  }
}

export const buildManualAdminPackageConfig = (input: {
  readonly kind: AdminManualPackageKind
  readonly title: string
  readonly summary: string
  readonly priceEur: number
}): AdminManualPackageConfig => ({
  version: 2,
  kind: input.kind,
  title: input.title.trim(),
  summary: input.summary.trim(),
  priceEur: input.priceEur
})

/** Default trip form rows for a manual admin quote (calculator-locked fields mirror the published price). */
export const tripDetailsFromManualPackage = (manual: AdminManualPackageConfig): PackageTripDetailsForm => {
  const base = emptyTripDetailsForm()
  const price = formatPackageEuro(manual.priceEur)
  const scope =
    manual.kind === 'transfer' ? 'Transfers (admin quote)' : manual.kind === 'golf' ? 'Golf courses (admin quote)' : 'Hotel (admin quote)'

  return {
    ...base,
    packageName: manual.title,
    stayName: scope,
    transferName: scope,
    perPersonPrice: price,
    groupTotal: price,
    depositAmount: 'TBC',
    remainingBalance: 'TBC',
    courseList: manual.kind === 'golf' ? manual.summary : base.courseList,
    hotelNameArea: manual.kind === 'hotel' ? manual.summary : base.hotelNameArea,
    airportTransfers: manual.kind === 'transfer' ? manual.summary : base.airportTransfers
  }
}

export const tripDetailsFromWebsiteFormPackage = (cfg: WebsiteFormPackageConfig): PackageTripDetailsForm => {
  const base = emptyTripDetailsForm()
  const lines = Object.entries(cfg.fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  const snapshot = [`Enquiry ${cfg.enquiryReferenceId}`, lines].filter((block) => block.length > 0).join('\n\n')

  return {
    ...base,
    packageName: `Form · ${humanizeFormKey(cfg.formKey)}`,
    stayName: cfg.enquiryReferenceId,
    transferName: 'Website submission',
    notesForGsol: snapshot || base.notesForGsol
  }
}

export const tripDefaultsForPackageRow = (configRaw: unknown): PackageTripDetailsForm => {
  const parsed = parseAnyPackageBuildRowConfig(configRaw)
  if (!parsed) {
    return emptyTripDetailsForm()
  }
  if (parsed.type === 'calculator') {
    return tripDetailsFromConfig(parsed.config)
  }
  if (parsed.type === 'website_form') {
    return tripDetailsFromWebsiteFormPackage(parsed.config)
  }
  return tripDetailsFromManualPackage(parsed.config)
}

export const formatPackageEuro = (value: number): string =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)

/** Mirrors proposal-style fields; stored in package_builds.client_details */
export interface PackageTripDetailsForm {
  readonly packageName: string
  readonly stayName: string
  readonly transferName: string
  readonly groupSize: string
  readonly nights: string
  readonly rounds: string
  readonly perPersonPrice: string
  readonly groupTotal: string
  readonly depositAmount: string
  readonly remainingBalance: string
  readonly preferredTravelDates: string
  readonly departureAirportRoute: string
  readonly leadGuestName: string
  readonly contactPhone: string
  readonly hotelNameArea: string
  readonly courseList: string
  readonly resortArea: string
  readonly specialRequests: string
  readonly airportTransfers: string
  readonly golfDayTransport: string
  readonly boardBasis: string
  readonly upgradeNotes: string
  readonly notesForGsol: string
}

export type TripDetailsFieldKey = keyof PackageTripDetailsForm

export interface TripDetailsSectionMeta {
  readonly title: string
  readonly fields: readonly { readonly key: TripDetailsFieldKey; readonly label: string }[]
}

/** Hidden on client “Save trip details” and admin trip editor (pricing / proposal / logistics / notes). */
export const TRIP_DETAILS_DASHBOARD_EXCLUDED_SECTION_TITLES: readonly string[] = [
  'Pricing (quote)',
  'Proposal details',
  'Logistics and inclusions',
  'Notes'
]

/** Order and labels for client form + admin detail view */
export const TRIP_DETAILS_SECTIONS: readonly TripDetailsSectionMeta[] = [
  {
    title: 'Trip overview',
    fields: [
      { key: 'packageName', label: 'Package style' },
      { key: 'stayName', label: 'Stay level' },
      { key: 'transferName', label: 'Transfer style' },
      { key: 'groupSize', label: 'Group size (golfers)' }
    ]
  },
  {
    title: 'Trip shape',
    fields: [
      { key: 'nights', label: 'Nights' },
      { key: 'rounds', label: 'Rounds' },
      { key: 'preferredTravelDates', label: 'Travel dates' },
      { key: 'departureAirportRoute', label: 'Departure airport / route' },
      { key: 'leadGuestName', label: 'Lead traveller name' },
      { key: 'contactPhone', label: 'Lead contact (phone / email)' }
    ]
  },
  {
    title: 'Pricing (quote)',
    fields: [
      { key: 'perPersonPrice', label: 'Est. per person' },
      { key: 'groupTotal', label: 'Est. group total' },
      { key: 'depositAmount', label: 'Deposit' },
      { key: 'remainingBalance', label: 'Remaining balance' }
    ]
  },
  {
    title: 'Proposal details',
    fields: [
      { key: 'hotelNameArea', label: 'Hotel name / area' },
      { key: 'courseList', label: 'Course list' },
      { key: 'resortArea', label: 'Resort area' },
      { key: 'specialRequests', label: 'Special requests' }
    ]
  },
  {
    title: 'Logistics and inclusions',
    fields: [
      { key: 'airportTransfers', label: 'Airport transfers' },
      { key: 'golfDayTransport', label: 'Golf-day transport' },
      { key: 'boardBasis', label: 'Board basis' },
      { key: 'upgradeNotes', label: 'Upgrade notes' }
    ]
  },
  {
    title: 'Notes',
    fields: [{ key: 'notesForGsol', label: 'Other notes for Golf Sol Ireland' }]
  }
] as const

const tripDetailKeys: readonly TripDetailsFieldKey[] = TRIP_DETAILS_SECTIONS.flatMap((s) => s.fields.map((f) => f.key))

export const TRIP_DETAILS_LABEL_BY_KEY: Record<TripDetailsFieldKey, string> = (() => {
  const m = {} as Record<TripDetailsFieldKey, string>
  for (const section of TRIP_DETAILS_SECTIONS) {
    for (const f of section.fields) {
      m[f.key] = f.label
    }
  }

  return m
})()

export const TRIP_DETAILS_MULTILINE_KEYS: ReadonlySet<TripDetailsFieldKey> = new Set([
  'courseList',
  'specialRequests',
  'notesForGsol',
  'upgradeNotes'
])

/** Filled from the saved calculator; not editable on the client dashboard (admin can edit in CRM modal). */
export const TRIP_DETAILS_CALCULATOR_LOCKED_KEYS: ReadonlySet<TripDetailsFieldKey> = new Set([
  'packageName',
  'stayName',
  'transferName',
  'groupSize',
  'nights',
  'rounds',
  'perPersonPrice',
  'groupTotal',
  'depositAmount',
  'remainingBalance'
])

/**
 * @param buildSource — `package_builds.source`; `website_form` only locks the snapshot identity lines so clients can edit the rest.
 */
export const isCalculatorLockedTripField = (key: TripDetailsFieldKey, buildSource?: string | null): boolean => {
  if (buildSource === 'website_form') {
    return key === 'packageName' || key === 'stayName' || key === 'transferName'
  }
  return TRIP_DETAILS_CALCULATOR_LOCKED_KEYS.has(key)
}

export const emptyTripDetailsForm = (): PackageTripDetailsForm => ({
  packageName: '',
  stayName: '',
  transferName: '',
  groupSize: '',
  nights: '',
  rounds: '',
  perPersonPrice: '',
  groupTotal: '',
  depositAmount: '',
  remainingBalance: '',
  preferredTravelDates: '',
  departureAirportRoute: '',
  leadGuestName: '',
  contactPhone: '',
  hotelNameArea: '',
  courseList: '',
  resortArea: '',
  specialRequests: '',
  airportTransfers: '',
  golfDayTransport: '',
  boardBasis: '',
  upgradeNotes: '',
  notesForGsol: ''
})

export const tripDetailsFromConfig = (config: PackageBuildConfig): PackageTripDetailsForm => ({
  packageName: config.packageStyle,
  stayName: config.stayName,
  transferName: config.transferName,
  groupSize: String(config.groupSize),
  nights: String(config.nights),
  rounds: String(config.rounds),
  perPersonPrice: formatPackageEuro(config.totals.estimatedPerPerson),
  groupTotal: formatPackageEuro(config.totals.estimatedGroupTotal),
  depositAmount: formatPackageEuro(config.totals.depositAmount),
  remainingBalance: formatPackageEuro(config.totals.remainingBalance),
  leadGuestName: '',
  contactPhone: '',
  preferredTravelDates: '',
  departureAirportRoute: '',
  hotelNameArea:
    config.hotelName != null && config.hotelName !== ''
      ? `${config.hotelName}${config.hotelStars != null ? ` (${config.hotelStars}★)` : ''}${config.hotelDist ? ` · ${config.hotelDist}` : ''}`
      : '',
  courseList: config.courseName ?? '',
  resortArea: '',
  specialRequests: '',
  airportTransfers: '',
  golfDayTransport: '',
  boardBasis: '',
  upgradeNotes: '',
  notesForGsol: ''
})

export const mergeTripDetailsWithSaved = (
  saved: unknown,
  defaults: PackageTripDetailsForm
): PackageTripDetailsForm => {
  if (!saved || typeof saved !== 'object') {
    return defaults
  }

  const s = saved as Record<string, unknown>
  let next = { ...defaults }

  for (const key of tripDetailKeys) {
    const v = s[key]
    if (typeof v === 'string') {
      const trimmed = v.trim()
      if (
        trimmed === '' &&
        (key === 'hotelNameArea' || key === 'courseList') &&
        typeof defaults[key] === 'string' &&
        defaults[key].trim() !== ''
      ) {
        continue
      }
      next = { ...next, [key]: v }
    } else if (typeof v === 'number' && (key === 'groupSize' || key === 'nights' || key === 'rounds')) {
      next = { ...next, [key]: String(v) }
    }
  }

  return next
}

export const serializeTripDetailsForDb = (form: PackageTripDetailsForm): Record<string, unknown> => ({
  version: 2,
  ...form
})

const meaningfulTripDetailKeys: readonly TripDetailsFieldKey[] = [
  'preferredTravelDates',
  'departureAirportRoute',
  'leadGuestName',
  'contactPhone',
  'hotelNameArea',
  'courseList',
  'resortArea',
  'specialRequests',
  'airportTransfers',
  'golfDayTransport',
  'boardBasis',
  'upgradeNotes',
  'notesForGsol'
]

export const hasMeaningfulTripDetails = (raw: unknown): boolean => {
  if (!raw || typeof raw !== 'object') {
    return false
  }

  const o = raw as Record<string, unknown>
  const nonEmpty = (k: string) => typeof o[k] === 'string' && (o[k] as string).trim() !== ''

  return meaningfulTripDetailKeys.some((k) => nonEmpty(k))
}

export const parseClientDetailsToFormShape = (raw: unknown): Partial<PackageTripDetailsForm> => {
  if (!raw || typeof raw !== 'object') {
    return {}
  }

  const o = raw as Record<string, unknown>
  const out: Record<string, string> = {}
  for (const key of tripDetailKeys) {
    const v = o[key]
    if (typeof v === 'string') {
      out[key] = v
    } else if (typeof v === 'number' && (key === 'groupSize' || key === 'nights' || key === 'rounds')) {
      out[key] = String(v)
    }
  }

  return out as Partial<PackageTripDetailsForm>
}
