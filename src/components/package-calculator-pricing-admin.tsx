import { useEffect, useState } from 'react'
import {
  DEFAULT_PACKAGE_CALCULATOR_PRICING,
  loadPackageCalculatorPricing,
  resetPackageCalculatorPricing,
  savePackageCalculatorPricing,
  type PackageCalculatorPricing
} from '../lib/package-calculator-pricing'

const fieldClass =
  'mt-1 w-full rounded-xl border border-ge-gray200 bg-white px-3 py-2.5 font-ge text-sm text-gs-dark outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/25'

export function PackageCalculatorPricingAdmin() {
  const [draft, setDraft] = useState<PackageCalculatorPricing>(() => loadPackageCalculatorPricing())
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  useEffect(() => {
    setDraft(loadPackageCalculatorPricing())
  }, [])

  const handleSave = () => {
    savePackageCalculatorPricing(draft)
    setSavedMessage('Saved. Open /packages in another tab (or refresh) to see updated calculator rates.')
  }

  const handleReset = () => {
    resetPackageCalculatorPricing()
    setDraft(DEFAULT_PACKAGE_CALCULATOR_PRICING)
    setSavedMessage('Reset to defaults.')
  }

  return (
    <section className="rounded-[1.75rem] border border-brand-700/25 bg-white p-6 shadow-[0_18px_48px_rgba(6,59,42,0.1)] md:p-8">
      <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-gs-green">Customer calculator</p>
      <h2 className="mt-3 font-ge text-2xl font-extrabold tracking-[-0.02em] text-gs-dark">
        Live package page pricing
      </h2>
      <p className="mt-3 max-w-3xl font-ge text-base leading-relaxed text-ge-gray500">
        These numbers feed the public <strong className="font-semibold text-gs-dark">/packages</strong> calculator. Changes save in this browser and apply immediately on refresh.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="font-ge text-lg font-extrabold text-gs-dark">Package styles</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {draft.packages.map((pkg, index) => (
              <div key={pkg.name} className="rounded-xl border border-ge-gray200 bg-cream p-4">
                <p className="font-ge text-sm font-extrabold text-gs-dark">{pkg.name}</p>
                <label className="mt-3 block">
                  <span className="font-ge text-xs font-bold uppercase tracking-[0.12em] text-ge-gray500">Green fee per round (EUR)</span>
                  <input
                    className={fieldClass}
                    min={0}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setDraft((current) => ({
                        ...current,
                        packages: current.packages.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, roundPrice: value } : row
                        )
                      }))
                    }}
                    step={1}
                    type="number"
                    value={pkg.roundPrice}
                  />
                </label>
                <label className="mt-3 block">
                  <span className="font-ge text-xs font-bold uppercase tracking-[0.12em] text-ge-gray500">Planning fee per person (EUR)</span>
                  <input
                    className={fieldClass}
                    min={0}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setDraft((current) => ({
                        ...current,
                        packages: current.packages.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, planningFee: value } : row
                        )
                      }))
                    }}
                    step={1}
                    type="number"
                    value={pkg.planningFee}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-ge text-lg font-extrabold text-gs-dark">Stay levels</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {draft.stays.map((stay, index) => (
              <div key={stay.name} className="rounded-xl border border-ge-gray200 bg-cream p-4">
                <p className="font-ge text-sm font-extrabold text-gs-dark">{stay.name}</p>
                <label className="mt-3 block">
                  <span className="font-ge text-xs font-bold uppercase tracking-[0.12em] text-ge-gray500">Per person / night (EUR)</span>
                  <input
                    className={fieldClass}
                    min={0}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setDraft((current) => ({
                        ...current,
                        stays: current.stays.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, pricePerNight: value } : row
                        )
                      }))
                    }}
                    step={1}
                    type="number"
                    value={stay.pricePerNight}
                  />
                </label>
                <label className="mt-3 block">
                  <span className="font-ge text-xs font-bold uppercase tracking-[0.12em] text-ge-gray500">Single supplement / night (EUR)</span>
                  <input
                    className={fieldClass}
                    min={0}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setDraft((current) => ({
                        ...current,
                        stays: current.stays.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, singleSupplementPerNight: value } : row
                        )
                      }))
                    }}
                    step={1}
                    type="number"
                    value={stay.singleSupplementPerNight}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-ge text-lg font-extrabold text-gs-dark">Transfer styles</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {draft.transfers.map((transfer, index) => (
              <div key={transfer.name} className="rounded-xl border border-ge-gray200 bg-cream p-4">
                <p className="font-ge text-sm font-extrabold text-gs-dark">{transfer.name}</p>
                <label className="mt-3 block">
                  <span className="font-ge text-xs font-bold uppercase tracking-[0.12em] text-ge-gray500">Trip cost total (EUR)</span>
                  <input
                    className={fieldClass}
                    min={0}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setDraft((current) => ({
                        ...current,
                        transfers: current.transfers.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, tripCost: value } : row
                        )
                      }))
                    }}
                    step={1}
                    type="number"
                    value={transfer.tripCost}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {savedMessage ? (
        <p className="mt-6 rounded-xl border border-brand-700/20 bg-brand-700/8 px-4 py-3 font-ge text-sm text-gs-dark" role="status">
          {savedMessage}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-gs-green px-6 font-ge text-sm font-bold uppercase tracking-[0.12em] text-white"
          onClick={handleSave}
          type="button"
        >
          Save customer calculator rates
        </button>
        <button
          className="inline-flex min-h-[48px] items-center justify-center rounded-md border-2 border-ge-gray200 bg-white px-6 font-ge text-sm font-bold uppercase tracking-[0.12em] text-gs-dark"
          onClick={handleReset}
          type="button"
        >
          Reset to defaults
        </button>
        <a
          className="inline-flex min-h-[48px] items-center justify-center rounded-md border-2 border-brand-700/30 bg-cream px-6 font-ge text-sm font-bold uppercase tracking-[0.12em] text-gs-green"
          href="/packages"
          rel="noreferrer"
          target="_blank"
        >
          Preview /packages
        </a>
      </div>
    </section>
  )
}
