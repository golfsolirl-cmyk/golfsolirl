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
