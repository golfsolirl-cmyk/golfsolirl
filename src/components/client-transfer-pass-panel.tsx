import { Car, ShieldCheck } from 'lucide-react'
import {
  encodeTransferPaymentPass,
  formatTransferPassHumanId,
  parseTransferPaymentPass,
  transferPassIsScannable,
  transferPassPaymentLevelFromStatus
} from '../lib/transfer-payment-pass'
import { PaymentBarcode } from './payment-barcode'
import { TransferPaymentStatusBadge } from './transfer-payment-status-badge'
import { cx } from '../lib/utils'

export type TransferPassRow = {
  id: string
  pickup_label: string
  dropoff_label: string
  payment_status?: string | null
  deposit_percent?: number | null
  enquiry_reference_id?: string | null
  scheduled_at?: string | null
  admin_price_eur?: number | null
}

type ClientTransferPassPanelProps = {
  readonly guestName: string
  readonly transfers: readonly TransferPassRow[]
  readonly onSelectUnpaid?: () => void
}

const formatWhen = (scheduledAt: string | null | undefined) => {
  if (!scheduledAt) {
    return 'ASAP · next available driver'
  }
  const d = new Date(scheduledAt)
  if (Number.isNaN(d.getTime())) {
    return 'Date TBC'
  }
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function ClientTransferPassPanel({ guestName, transfers, onSelectUnpaid }: ClientTransferPassPanelProps) {
  const scannable = transfers.filter((t) => transferPassIsScannable(t.payment_status))
  const unpaid = transfers.filter((t) => !transferPassIsScannable(t.payment_status))

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-forest-100 bg-gradient-to-br from-white via-fairway-50/40 to-white p-5 shadow-soft sm:p-7">
        <p className="font-ge text-sm font-extrabold uppercase tracking-[0.18em] text-brand-600">Trip pass</p>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-forest-950 sm:text-3xl">
          Show your driver this barcode
        </h2>
        <p className="mt-3 max-w-prose text-lg leading-relaxed text-forest-700">
          After your deposit or full payment, your Costa del Sol transfer pass activates here — like a golf-trip boarding
          pass. Your driver scans it at pickup to confirm the booking is paid.
        </p>
      </div>

      {scannable.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-forest-200 bg-white p-6 text-center sm:p-8">
          <Car aria-hidden className="mx-auto h-10 w-10 text-forest-400" />
          <p className="mt-4 font-display text-xl font-semibold text-forest-950">No active pass yet</p>
          <p className="mx-auto mt-2 max-w-md text-lg leading-relaxed text-forest-600">
            Once Golf Sol Ireland quotes your transfer and you pay the deposit or balance, your barcode appears here
            automatically.
          </p>
          {unpaid.length > 0 && onSelectUnpaid ? (
            <button
              className="mt-6 inline-flex min-h-[3rem] items-center justify-center rounded-2xl bg-brand-800 px-6 py-3 text-base font-bold text-white shadow-md transition hover:bg-brand-700"
              onClick={onSelectUnpaid}
              type="button"
            >
              Go to payments
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-5">
          {scannable.map((t) => {
            const level = transferPassPaymentLevelFromStatus(t.payment_status)!
            const payload = encodeTransferPaymentPass(t.id, level)
            const humanId = formatTransferPassHumanId(t.enquiry_reference_id, t.id)
            return (
              <li
                className="overflow-hidden rounded-[1.75rem] border border-forest-100 bg-white shadow-[0_20px_50px_rgba(11,73,52,0.1)]"
                key={t.id}
              >
                <div className="ge-on-dark border-b border-forest-100 bg-gradient-to-r from-brand-800 to-forest-900 px-5 py-4 text-white sm:px-6">
                  <p className="font-ge text-sm font-bold uppercase tracking-[0.14em] text-emerald-100/90">
                    {guestName.trim() ? `${guestName.trim()}'s trip pass` : 'Your trip pass'}
                  </p>
                  <p className="mt-1 font-display text-xl font-bold sm:text-2xl">{humanId}</p>
                </div>
                <div className="space-y-4 p-5 sm:p-6">
                  <p className="text-lg font-semibold leading-snug text-forest-950">
                    {t.pickup_label} → {t.dropoff_label}
                  </p>
                  <p className="text-base text-forest-600">{formatWhen(t.scheduled_at ?? null)}</p>
                  <TransferPaymentStatusBadge
                    deposit_percent={t.deposit_percent}
                    payment_status={t.payment_status}
                    size="md"
                  />
                  <PaymentBarcode className="ring-1 ring-forest-100" value={payload} />
                  <p className="flex items-start gap-2 text-base leading-relaxed text-forest-700">
                    <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                    Present this screen at Málaga AGP meet-and-greet or hotel pickup. Your driver confirms payment before
                    you travel.
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

type TransferPassVerifyResult = {
  ok: boolean
  headline: string
  detail: string
  tone: 'success' | 'warning' | 'error'
}

export const verifyTransferPassAgainstBookings = (
  raw: string,
  bookings: readonly TransferPassRow[]
): TransferPassVerifyResult => {
  const parsed = parseTransferPaymentPass(raw)
  if (!parsed) {
    return {
      ok: false,
      headline: 'Unrecognised pass',
      detail: 'This is not a valid Golf Sol trip pass. Ask the guest to open Trip pass in their client dashboard.',
      tone: 'error'
    }
  }
  const row = bookings.find((b) => b.id === parsed.bookingId)
  if (!row) {
    return {
      ok: false,
      headline: 'Booking not on your list',
      detail: 'This transfer is not assigned to you today. Check with Golf Sol operations if you expected this job.',
      tone: 'warning'
    }
  }
  const pay = String(row.payment_status ?? 'unpaid').toLowerCase()
  if (pay === 'unpaid') {
    return {
      ok: false,
      headline: 'Not paid yet',
      detail: `${row.pickup_label} → ${row.dropoff_label} — payment still outstanding. Do not depart until ops confirms.`,
      tone: 'error'
    }
  }
  if (parsed.paymentLevel === 'deposit' && pay !== 'deposit' && pay !== 'paid') {
    return {
      ok: false,
      headline: 'Deposit mismatch',
      detail: 'Pass shows a deposit but our records differ. Contact Golf Sol before pickup.',
      tone: 'warning'
    }
  }
  const ref = formatTransferPassHumanId(row.enquiry_reference_id, row.id)
  return {
    ok: true,
    headline: pay === 'paid' ? 'Paid in full — good to go' : 'Deposit confirmed — good to go',
    detail: `${ref} · ${row.pickup_label} → ${row.dropoff_label}`,
    tone: 'success'
  }
}

export function TransferPassVerifyBanner({
  result
}: {
  readonly result: TransferPassVerifyResult | null
}) {
  if (!result) {
    return null
  }
  return (
    <div
      className={cx(
        'rounded-2xl border px-5 py-4',
        result.tone === 'success' && 'border-emerald-300 bg-fairway-50 text-forest-950',
        result.tone === 'warning' && 'border-amber-300 bg-amber-50 text-forest-950',
        result.tone === 'error' && 'border-red-300 bg-red-50 text-forest-950'
      )}
      role="status"
    >
      <p className="font-display text-xl font-bold">{result.headline}</p>
      <p className="mt-2 text-lg leading-relaxed">{result.detail}</p>
    </div>
  )
}
