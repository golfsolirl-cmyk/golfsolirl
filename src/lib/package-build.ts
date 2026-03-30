export type PackageBuildSource = 'landing' | 'packages'

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
}): PackageBuildConfig => ({
  version: 1,
  source: input.source,
  packageStyle: input.packageStyle,
  stayName: input.stayName,
  transferName: input.transferName,
  groupSize: input.groupSize,
  nights: input.nights,
  rounds: input.rounds,
  totals: input.totals
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
    title: 'Pricing (from calculator)',
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

export const isCalculatorLockedTripField = (key: TripDetailsFieldKey): boolean =>
  TRIP_DETAILS_CALCULATOR_LOCKED_KEYS.has(key)

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
