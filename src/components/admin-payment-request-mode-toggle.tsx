import { normalizePaymentRequestMode, paymentRequestSummaryLabel, resolvePaymentRequestAmounts, type PaymentRequestMode } from '../lib/payment-request-mode'
import { cx } from '../lib/utils'

type AdminPaymentRequestModeToggleProps = {
  readonly mode: PaymentRequestMode
  readonly tripTotalEur: number | null
  readonly depositEur: number | null
  readonly amountReceivedEur?: number
  readonly onModeChange: (mode: PaymentRequestMode) => void
  readonly idPrefix?: string
  readonly className?: string
}

/**
 * Clear radio choice: 20% deposit vs full amount (or remaining balance).
 */
export function AdminPaymentRequestModeToggle({
  mode,
  tripTotalEur,
  depositEur,
  amountReceivedEur = 0,
  onModeChange,
  idPrefix = 'pay-mode',
  className
}: AdminPaymentRequestModeToggleProps) {
  const resolved = resolvePaymentRequestAmounts({
    mode,
    tripTotalEur,
    depositEur,
    amountReceivedEur
  })
  const selected = normalizePaymentRequestMode(mode)

  return (
    <fieldset className={cx('rounded-2xl border border-forest-200 bg-white px-4 py-4', className)}>
      <legend className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">
        Payment request now
      </legend>
      <p className="mt-1 text-sm text-forest-700">Choose what the client should pay against their Monzo reference.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Payment request mode">
        {(
          [
            {
              id: 'deposit_20' as const,
              title: '20% Deposit',
              hint: 'Due now is 20% of the trip total (editable in Deposit).'
            },
            {
              id: 'full' as const,
              title: 'Full Amount (100%)',
              hint:
                amountReceivedEur > 0
                  ? 'Requests the remaining balance after payments already received.'
                  : 'Requests the full trip total now.'
            }
          ] as const
        ).map((opt) => {
          const active = selected === opt.id
          return (
            <label
              key={opt.id}
              className={cx(
                'flex cursor-pointer gap-3 rounded-xl border px-3 py-3 transition',
                active
                  ? 'border-forest-900 bg-forest-900 text-white shadow-sm'
                  : 'border-forest-200 bg-offwhite text-forest-950 hover:border-forest-400'
              )}
              htmlFor={`${idPrefix}-${opt.id}`}
            >
              <input
                checked={active}
                className="mt-1"
                id={`${idPrefix}-${opt.id}`}
                name={`${idPrefix}-mode`}
                onChange={() => onModeChange(opt.id)}
                type="radio"
                value={opt.id}
              />
              <span className="min-w-0">
                <span className="block text-sm font-bold">{opt.title}</span>
                <span className={cx('mt-0.5 block text-xs leading-snug', active ? 'text-emerald-100' : 'text-forest-600')}>
                  {opt.hint}
                </span>
              </span>
            </label>
          )
        })}
      </div>
      <p
        className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950"
        role="status"
      >
        {paymentRequestSummaryLabel(resolved)}
      </p>
    </fieldset>
  )
}
