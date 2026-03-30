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

/** Mirrors proposal-template URL-style fields; stored in package_builds.client_details */
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
  readonly leadGuestName: string
  readonly contactPhone: string
  readonly preferredTravelDates: string
  readonly notesForGsol: string
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
  leadGuestName: '',
  contactPhone: '',
  preferredTravelDates: '',
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
  notesForGsol: ''
})

const tripDetailKeys: readonly (keyof PackageTripDetailsForm)[] = [
  'packageName',
  'stayName',
  'transferName',
  'groupSize',
  'nights',
  'rounds',
  'perPersonPrice',
  'groupTotal',
  'depositAmount',
  'remainingBalance',
  'leadGuestName',
  'contactPhone',
  'preferredTravelDates',
  'notesForGsol'
]

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
  version: 1,
  ...form
})

export const hasMeaningfulTripDetails = (raw: unknown): boolean => {
  if (!raw || typeof raw !== 'object') {
    return false
  }

  const o = raw as Record<string, unknown>
  const nonEmpty = (k: string) => typeof o[k] === 'string' && (o[k] as string).trim() !== ''

  return (
    nonEmpty('leadGuestName') ||
    nonEmpty('contactPhone') ||
    nonEmpty('preferredTravelDates') ||
    nonEmpty('notesForGsol')
  )
}
