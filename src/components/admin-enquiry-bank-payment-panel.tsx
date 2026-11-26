import { useCallback, useEffect, useMemo, useState } from 'react'
import { Landmark } from 'lucide-react'
import { AdminPaymentRequestModeToggle } from './admin-payment-request-mode-toggle'
import { LuxuryButton } from './ui/button'
import {
  calcDeposit20Eur,
  formatEurIe,
  normalizePaymentRequestMode,
  resolvePaymentRequestAmounts,
  roundMoney2,
  type PaymentRequestMode
} from '../lib/payment-request-mode'

export type EnquiryBankPaymentFields = {
  readonly id: string
  readonly reference_id: string
  readonly amount_due_eur?: number | null
  readonly deposit_eur?: number | null
  readonly amount_received_eur?: number | null
  readonly payment_reference?: string | null
  readonly payment_status?: string | null
  readonly payment_notes?: string | null
  readonly last_payment_at?: string | null
  /** Optional: last requested mode from form_payload._paymentRequest or desk meta */
  readonly payment_request_mode?: string | null
}

type PaymentEvent = {
  id: string
  amount_eur: number
  paid_at: string
  note: string | null
  created_at: string
}

type AdminEnquiryBankPaymentPanelProps = {
  readonly row: EnquiryBankPaymentFields
  readonly accessToken: string | null
  readonly onUpdated?: (enquiryId: string) => void
}

const statusLabel: Record<string, string> = {
  awaiting_payment: 'Awaiting payment',
  deposit_received: 'Deposit paid',
  paid_in_full: 'Paid in full',
  refunded: 'Refunded'
}

const inferMode = (row: EnquiryBankPaymentFields): PaymentRequestMode => {
  if (row.payment_request_mode) return normalizePaymentRequestMode(row.payment_request_mode)
  const due = Number(row.amount_due_eur) || 0
  const dep = Number(row.deposit_eur) || 0
  if (dep > 0 && due > 0 && dep < due - 0.001) return 'deposit_20'
  if (due > 0 && (dep <= 0 || Math.abs(dep - due) < 0.011)) return 'full'
  return 'deposit_20'
}

export function AdminEnquiryBankPaymentPanel({ row, accessToken, onUpdated }: AdminEnquiryBankPaymentPanelProps) {
  const [amountDue, setAmountDue] = useState('')
  const [deposit, setDeposit] = useState('')
  const [paymentRef, setPaymentRef] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [requestMode, setRequestMode] = useState<PaymentRequestMode>(() => inferMode(row))
  const [depositTouched, setDepositTouched] = useState(false)
  const [markAmount, setMarkAmount] = useState('')
  const [markDate, setMarkDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [markNote, setMarkNote] = useState('')
  const [events, setEvents] = useState<PaymentEvent[]>([])
  const [status, setStatus] = useState(row.payment_status ?? 'awaiting_payment')
  const [received, setReceived] = useState(Number(row.amount_received_eur) || 0)
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    setAmountDue(row.amount_due_eur != null ? String(row.amount_due_eur) : '')
    setDeposit(row.deposit_eur != null ? String(row.deposit_eur) : '')
    setPaymentRef((row.payment_reference?.trim() || row.reference_id || '').trim())
    setPaymentNotes(row.payment_notes?.trim() ?? '')
    setStatus(row.payment_status ?? 'awaiting_payment')
    setReceived(Number(row.amount_received_eur) || 0)
    setRequestMode(inferMode(row))
    setDepositTouched(row.deposit_eur != null && Number(row.deposit_eur) > 0)
  }, [row])

  const tripTotal = useMemo(() => roundMoney2(amountDue) ?? 0, [amountDue])

  // Live-update deposit to 20% when total changes and admin has not manually overridden deposit.
  useEffect(() => {
    if (depositTouched) return
    if (requestMode !== 'deposit_20') return
    const auto = calcDeposit20Eur(tripTotal)
    if (auto == null) return
    setDeposit(String(auto))
  }, [tripTotal, requestMode, depositTouched])

  const resolved = useMemo(
    () =>
      resolvePaymentRequestAmounts({
        mode: requestMode,
        tripTotalEur: tripTotal,
        depositEur: roundMoney2(deposit),
        amountReceivedEur: received
      }),
    [requestMode, tripTotal, deposit, received]
  )

  const outstanding = resolved.outstandingEur

  const loadEvents = useCallback(async () => {
    if (!accessToken) {
      return
    }
    const res = await fetch('/api/enquiry-payment-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ action: 'list_events', enquiryId: row.id })
    })
    const data = (await res.json().catch(() => ({}))) as {
      events?: PaymentEvent[]
      enquiry?: EnquiryBankPaymentFields
      message?: string
    }
    if (res.ok) {
      setEvents(Array.isArray(data.events) ? data.events : [])
      if (data.enquiry) {
        setStatus(data.enquiry.payment_status ?? status)
        setReceived(Number(data.enquiry.amount_received_eur) || 0)
        if (data.enquiry.payment_request_mode) {
          setRequestMode(normalizePaymentRequestMode(data.enquiry.payment_request_mode))
        }
      }
    }
  }, [accessToken, row.id, status])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  const saveAmounts = async () => {
    if (!accessToken) {
      setNote('Sign in again as admin.')
      return
    }
    setBusy('amounts')
    setNote(null)
    try {
      const nextDeposit =
        requestMode === 'deposit_20'
          ? resolved.depositEur
          : roundMoney2(deposit) != null
            ? roundMoney2(deposit)
            : null
      const res = await fetch('/api/enquiry-payment-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: 'set_amounts',
          enquiryId: row.id,
          amountDueEur: amountDue,
          depositEur: nextDeposit,
          paymentReference: paymentRef,
          paymentNotes,
          paymentStatus: status,
          paymentRequestMode: requestMode
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; paymentStatus?: string }
      if (!res.ok) {
        setNote(data.message ?? 'Save failed.')
        return
      }
      if (data.paymentStatus) {
        setStatus(data.paymentStatus)
      }
      setNote('Trip payment amounts & request mode saved.')
      onUpdated?.(row.id)
      await loadEvents()
    } finally {
      setBusy(null)
    }
  }

  const markReceived = async (preset?: 'deposit' | 'full' | 'custom') => {
    if (!accessToken) {
      setNote('Sign in again as admin.')
      return
    }
    setBusy(preset === 'deposit' ? 'mark-deposit' : preset === 'full' ? 'mark-full' : 'mark')
    setNote(null)
    try {
      const res = await fetch('/api/enquiry-payment-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: 'mark_payment_received',
          enquiryId: row.id,
          amountEur: preset === 'custom' || !preset ? markAmount : undefined,
          paidAt: markDate,
          note: markNote,
          preset: preset === 'custom' ? undefined : preset
        })
      })
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        amountReceivedEur?: number
        paymentStatus?: string
      }
      if (!res.ok) {
        setNote(data.message ?? 'Could not record payment.')
        return
      }
      if (typeof data.amountReceivedEur === 'number') {
        setReceived(data.amountReceivedEur)
      }
      if (data.paymentStatus) {
        setStatus(data.paymentStatus)
      }
      setMarkAmount('')
      setMarkNote('')
      setNote(data.message ?? 'Payment recorded on the ledger against the Monzo reference.')
      onUpdated?.(row.id)
      await loadEvents()
    } finally {
      setBusy(null)
    }
  }

  const depositStillDue = Math.max(0, Math.round((resolved.depositEur - received) * 100) / 100)
  const canRecordDeposit = depositStillDue > 0.001 && outstanding > 0.001
  const canRecordFull = outstanding > 0.001

  return (
    <section className="rounded-[1.5rem] border border-[#d4a843]/40 bg-gradient-to-br from-[#fff9e8] to-white px-4 py-5 sm:px-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-white">
          <Landmark aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-lg font-semibold text-forest-950">Monzo bank transfer</h4>
          <p className="mt-1 text-sm text-forest-700">
            Track manual transfers for this enquiry. Reference defaults to{' '}
            <span className="font-mono">{row.reference_id}</span>. When Monzo lands against that ref, record it here.
          </p>
          <p className="mt-2 text-sm font-semibold text-forest-900">
            Status: {statusLabel[status] ?? status}
            {received > 0 ? ` · Received ${formatEurIe(received)}` : ''}
            {outstanding > 0 ? ` · Outstanding ${formatEurIe(outstanding)}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <AdminPaymentRequestModeToggle
          amountReceivedEur={received}
          depositEur={roundMoney2(deposit)}
          idPrefix={`enq-pay-${row.id}`}
          mode={requestMode}
          onModeChange={(next) => {
            setRequestMode(next)
            if (next === 'deposit_20' && !depositTouched) {
              const auto = calcDeposit20Eur(tripTotal)
              if (auto != null) setDeposit(String(auto))
            }
          }}
          tripTotalEur={tripTotal > 0 ? tripTotal : null}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`due-${row.id}`}>
            Trip total / amount due (EUR)
          </label>
          <input
            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900"
            id={`due-${row.id}`}
            inputMode="decimal"
            onChange={(e) => setAmountDue(e.target.value)}
            value={amountDue}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`dep-${row.id}`}>
            Deposit (EUR){requestMode === 'deposit_20' ? ' · auto 20%' : ''}
          </label>
          <input
            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900"
            id={`dep-${row.id}`}
            inputMode="decimal"
            onChange={(e) => {
              setDepositTouched(true)
              setDeposit(e.target.value)
            }}
            value={deposit}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`pref-${row.id}`}>
            Payment reference (Monzo)
          </label>
          <input
            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 font-mono text-sm text-forest-900"
            id={`pref-${row.id}`}
            onChange={(e) => setPaymentRef(e.target.value)}
            value={paymentRef}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`pstatus-${row.id}`}>
            Payment status
          </label>
          <select
            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm font-medium text-forest-900"
            id={`pstatus-${row.id}`}
            onChange={(e) => setStatus(e.target.value)}
            value={status}
          >
            {Object.entries(statusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`pnotes-${row.id}`}>
            Internal payment notes
          </label>
          <textarea
            className="min-h-[72px] w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900"
            id={`pnotes-${row.id}`}
            onChange={(e) => setPaymentNotes(e.target.value)}
            value={paymentNotes}
          />
        </div>
      </div>

      <LuxuryButton className="!mt-3" disabled={Boolean(busy)} onClick={() => void saveAmounts()} type="button" variant="outline">
        {busy === 'amounts' ? 'Saving…' : 'Save amounts, mode & reference'}
      </LuxuryButton>

      <div className="mt-5 border-t border-forest-100 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">Record Monzo payment received</p>
        <p className="mt-1 text-sm text-forest-700">
          Match the transfer to reference <span className="font-mono font-semibold">{paymentRef || row.reference_id}</span>, then
          record it in one click.
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <LuxuryButton
            className="!px-4 !py-2.5"
            disabled={Boolean(busy) || !canRecordDeposit}
            onClick={() => void markReceived('deposit')}
            type="button"
            variant="primary"
          >
            {busy === 'mark-deposit'
              ? 'Recording…'
              : `Record 20% deposit received (${formatEurIe(Math.min(depositStillDue, outstanding || depositStillDue))})`}
          </LuxuryButton>
          <LuxuryButton
            className="!px-4 !py-2.5"
            disabled={Boolean(busy) || !canRecordFull}
            onClick={() => void markReceived('full')}
            type="button"
            variant="outline"
          >
            {busy === 'mark-full' ? 'Recording…' : `Record full payment received (${formatEurIe(outstanding)})`}
          </LuxuryButton>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`mamt-${row.id}`}>
              Custom amount (EUR)
            </label>
            <input
              className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm"
              id={`mamt-${row.id}`}
              inputMode="decimal"
              onChange={(e) => setMarkAmount(e.target.value)}
              value={markAmount}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`mdate-${row.id}`}>
              Date paid
            </label>
            <input
              className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm"
              id={`mdate-${row.id}`}
              onChange={(e) => setMarkDate(e.target.value)}
              type="date"
              value={markDate}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`mnote-${row.id}`}>
              Note (optional)
            </label>
            <input
              className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm"
              id={`mnote-${row.id}`}
              onChange={(e) => setMarkNote(e.target.value)}
              placeholder="Seen in Monzo against ref…"
              value={markNote}
            />
          </div>
        </div>
        <LuxuryButton className="!mt-3" disabled={Boolean(busy)} onClick={() => void markReceived('custom')} type="button" variant="outline">
          {busy === 'mark' ? 'Recording…' : 'Record custom amount received'}
        </LuxuryButton>
      </div>

      {events.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {events.map((ev) => (
            <li className="rounded-xl border border-forest-100 bg-white px-3 py-2 text-sm text-forest-900" key={ev.id}>
              <span className="font-semibold">{formatEurIe(Number(ev.amount_eur))}</span>
              {' · '}
              {ev.paid_at}
              {ev.note ? ` — ${ev.note}` : ''}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-xs text-forest-600">No bank-transfer payments logged yet.</p>
      )}

      {note ? (
        <p className="mt-3 text-sm text-forest-800" role="status">
          {note}
        </p>
      ) : null}
    </section>
  )
}
