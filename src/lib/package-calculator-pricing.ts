export type PackageStylePricing = {
  readonly name: string
  readonly roundPrice: number
  readonly planningFee: number
}

export type StayPricing = {
  readonly name: string
  readonly pricePerNight: number
  readonly singleSupplementPerNight: number
}

export type TransferPricing = {
  readonly name: string
  readonly tripCost: number
}

export type PackageCalculatorPricing = {
  readonly packages: readonly PackageStylePricing[]
  readonly stays: readonly StayPricing[]
  readonly transfers: readonly TransferPricing[]
}

export const PACKAGE_CALCULATOR_PRICING_STORAGE_KEY = 'gsol-package-calculator-pricing'
export const PACKAGE_CALCULATOR_PRICING_UPDATED_EVENT = 'gsol-package-calculator-pricing-updated'

export const DEFAULT_PACKAGE_CALCULATOR_PRICING: PackageCalculatorPricing = {
  packages: [
    { name: 'Social Escape', roundPrice: 118, planningFee: 105 },
    { name: 'Premium Fairway', roundPrice: 145, planningFee: 145 },
    { name: 'Signature Costa', roundPrice: 182, planningFee: 210 }
  ],
  stays: [
    { name: 'Coastal 3-star', pricePerNight: 92, singleSupplementPerNight: 26 },
    { name: 'Premium 4-star', pricePerNight: 148, singleSupplementPerNight: 34 },
    { name: 'Luxury 5-star', pricePerNight: 248, singleSupplementPerNight: 56 }
  ],
  transfers: [
    { name: 'Shared arrival and golf transfers', tripCost: 120 },
    { name: 'Private return transfers', tripCost: 260 },
    { name: 'Dedicated driver support', tripCost: 520 }
  ]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseNumber(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function mergePackages(raw: unknown): PackageCalculatorPricing['packages'] {
  return DEFAULT_PACKAGE_CALCULATOR_PRICING.packages.map((defaults) => {
    const row = Array.isArray(raw)
      ? raw.find((item) => isRecord(item) && item.name === defaults.name)
      : undefined
    if (!isRecord(row)) {
      return defaults
    }
    return {
      name: defaults.name,
      roundPrice: parseNumber(row.roundPrice, defaults.roundPrice),
      planningFee: parseNumber(row.planningFee, defaults.planningFee)
    }
  })
}

function mergeStays(raw: unknown): PackageCalculatorPricing['stays'] {
  return DEFAULT_PACKAGE_CALCULATOR_PRICING.stays.map((defaults) => {
    const row = Array.isArray(raw)
      ? raw.find((item) => isRecord(item) && item.name === defaults.name)
      : undefined
    if (!isRecord(row)) {
      return defaults
    }
    return {
      name: defaults.name,
      pricePerNight: parseNumber(row.pricePerNight, defaults.pricePerNight),
      singleSupplementPerNight: parseNumber(row.singleSupplementPerNight, defaults.singleSupplementPerNight)
    }
  })
}

function mergeTransfers(raw: unknown): PackageCalculatorPricing['transfers'] {
  return DEFAULT_PACKAGE_CALCULATOR_PRICING.transfers.map((defaults) => {
    const row = Array.isArray(raw)
      ? raw.find((item) => isRecord(item) && item.name === defaults.name)
      : undefined
    if (!isRecord(row)) {
      return defaults
    }
    return {
      name: defaults.name,
      tripCost: parseNumber(row.tripCost, defaults.tripCost)
    }
  })
}

export function normalizePackageCalculatorPricing(raw: unknown): PackageCalculatorPricing {
  if (!isRecord(raw)) {
    return DEFAULT_PACKAGE_CALCULATOR_PRICING
  }
  return {
    packages: mergePackages(raw.packages),
    stays: mergeStays(raw.stays),
    transfers: mergeTransfers(raw.transfers)
  }
}

export function loadPackageCalculatorPricing(): PackageCalculatorPricing {
  if (typeof window === 'undefined') {
    return DEFAULT_PACKAGE_CALCULATOR_PRICING
  }
  try {
    const stored = localStorage.getItem(PACKAGE_CALCULATOR_PRICING_STORAGE_KEY)
    if (!stored) {
      return DEFAULT_PACKAGE_CALCULATOR_PRICING
    }
    return normalizePackageCalculatorPricing(JSON.parse(stored))
  } catch {
    return DEFAULT_PACKAGE_CALCULATOR_PRICING
  }
}

export function savePackageCalculatorPricing(pricing: PackageCalculatorPricing): void {
  if (typeof window === 'undefined') {
    return
  }
  const normalized = normalizePackageCalculatorPricing(pricing)
  localStorage.setItem(PACKAGE_CALCULATOR_PRICING_STORAGE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent(PACKAGE_CALCULATOR_PRICING_UPDATED_EVENT))
}

export function resetPackageCalculatorPricing(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(PACKAGE_CALCULATOR_PRICING_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(PACKAGE_CALCULATOR_PRICING_UPDATED_EVENT))
}
