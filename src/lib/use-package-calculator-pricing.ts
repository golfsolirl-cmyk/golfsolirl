import { useEffect, useState } from 'react'
import {
  DEFAULT_PACKAGE_CALCULATOR_PRICING,
  loadPackageCalculatorPricing,
  PACKAGE_CALCULATOR_PRICING_UPDATED_EVENT,
  type PackageCalculatorPricing
} from './package-calculator-pricing'

export function usePackageCalculatorPricing(): PackageCalculatorPricing {
  const [pricing, setPricing] = useState<PackageCalculatorPricing>(() =>
    typeof window === 'undefined' ? DEFAULT_PACKAGE_CALCULATOR_PRICING : loadPackageCalculatorPricing()
  )

  useEffect(() => {
    const refresh = () => {
      setPricing(loadPackageCalculatorPricing())
    }
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener(PACKAGE_CALCULATOR_PRICING_UPDATED_EVENT, refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(PACKAGE_CALCULATOR_PRICING_UPDATED_EVENT, refresh)
    }
  }, [])

  return pricing
}
