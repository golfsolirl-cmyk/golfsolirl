import { useCallback, useEffect, useMemo, useState } from 'react'
import { Landmark } from 'lucide-react'
import { LuxuryButton } from './ui/button'

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
  readonly onUpdated?: () => void
}

const formatEur = (n: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(n)

const statusLabel: Record<string, string> = {
  awaiting_payment: 'Awaiting payment',
  deposit_received: 'Deposit received',
  paid_in_full: 'Paid in full',
  refunded: 'Refunded'
}

export function AdminEnquiryBankPaymentPanel({ row, accessToken, onUpdated }: AdminEnquiryBankPaymentPanelProps) {
  const [amountDue, setAmountDue] = useState('')
  const [deposit, setDeposit] = useState('')
  const [paymentRef, setPaymentRef] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
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
  }, [row])

  const outstanding = useMemo(() => {
    const due = Number(String(amountDue).replace(/,/g, '.'))
    if (!Number.isFinite(due) || due <= 0) {
      return null
    }
    return Math.max(0, Math.round((due - received) * 100) / 100)
  }, [amountDue, received])

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
          depositEur: deposit,
          paymentReference: paymentRef,
          paymentNotes
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
      setNote('Trip payment amounts saved.')
      onUpdated?.()
      await loadEvents()
    } finally {
      setBusy(null)
    }
  }

  const markReceived = async () => {
    if (!accessToken) {
      setNote('Sign in again as admin.')
      return
    }
    setBusy('mark')
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
          amountEur: markAmount,
          paidAt: markDate,
          note: markNote
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
      setNote('Payment recorded on the ledger.')
      onUpdated?.()
      await loadEvents()
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-[#d4a843]/40 bg-gradient-to-br from-[#fff9e8] to-white px-4 py-5 sm:px-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-white">
          <Landmark aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-lg font-semibold text-forest-950">Monzo bank transfer</h4>
          <p className="mt-1 text-sm text-forest-700">
            Track manual transfers for this enquiry. Reference defaults to <span className="font-mono">{row.reference_id}</span>.
          </p>
          <p className="mt-2 text-sm font-semibold text-forest-900">
            Status: {statusLabel[status] ?? status}
            {received > 0 ? ` · Received ${formatEur(received)}` : ''}
            {outstanding != null && outstanding > 0 ? ` · Outstanding ${formatEur(outstanding)}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`due-${row.id}`}>
            Amount due (EUR)
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
            Deposit (EUR)
          </label>
          <input
            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900"
            id={`dep-${row.id}`}
            inputMode="decimal"
            onChange={(e) => setDeposit(e.target.value)}
            value={deposit}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`pref-${row.id}`}>
            Payment reference
          </label>
          <input
            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 font-mono text-sm text-forest-900"
            id={`pref-${row.id}`}
            onChange={(e) => setPaymentRef(e.target.value)}
            value={paymentRef}
          />
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
        {busy === 'amounts' ? 'Saving…' : 'Save amounts & reference'}
      </LuxuryButton>

      <div className="mt-5 border-t border-forest-100 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">Mark payment received</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`mamt-${row.id}`}>
              Amount (EUR)
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
              value={markNote}
            />
          </div>
        </div>
        <LuxuryButton className="!mt-3" disabled={Boolean(busy)} onClick={() => void markReceived()} type="button" variant="primary">
          {busy === 'mark' ? 'Recording…' : 'Mark payment received'}
        </LuxuryButton>
      </div>

      {events.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {events.map((ev) => (
            <li className="rounded-xl border border-forest-100 bg-white px-3 py-2 text-sm text-forest-900" key={ev.id}>
              <span className="font-semibold">{formatEur(Number(ev.amount_eur))}</span>
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