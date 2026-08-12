import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { cx } from '../lib/utils'

type RevenueSummary = {
  companyTotalDisplay: string
  transferCollectedDisplay: string
  invoiceOnlyDisplay: string
  paidTripCount: number
  depositTripCount: number
  paidInvoiceCount: number
}

type PaidTripRow = {
  id: string
  reference: string | null
  guest: string
  email: string | null
  route: string
  paymentStatus: string
  collectedDisplay: string
  updatedAt: string | null
  needsPaymentSync?: boolean
}

type PaidInvoiceRow = {
  id: string
  reference: string | null
  invoiceNumber: string | null
  collectedDisplay: string
  paidAt: string | null
}

type UnifiedPaymentRow = {
  key: string
  kind: 'transfer' | 'invoice'
  title: string
  subtitle: string
  amount: string
  status: string
  when: string | null
  needsPass?: boolean
  trip?: PaidTripRow
  invoice?: PaidInvoiceRow
}

const fmtWhen = (iso: string | null | undefined) => {
  if (!iso) {
    return '—'
  }
  try {
    return new Intl.DateTimeFormat('en-IE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

const statusLabel = (raw: string) => {
  const s = raw.trim().toLowerCase()
  if (s === 'paid') {
    return 'Paid in full'
  }
  if (s === 'deposit') {
    return 'Deposit paid'
  }
  return raw || 'Paid'
}

export function AdminPaidTripsRevenuePanel() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<RevenueSummary | null>(null)
  const [paidTrips, setPaidTrips] = useState<PaidTripRow[]>([])
  const [paidInvoices, setPaidInvoices] = useState<PaidInvoiceRow[]>([])
  const [syncRef, setSyncRef] = useState('')
  const [syncBusy, setSyncBusy] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const sb = getSupabaseBrowserClient()
      const session = await sb?.auth.getSession()
      const token = session?.data.session?.access_token
      if (!token) {
        setError('Sign in again as admin.')
        return
      }
      const res = await fetch('/api/admin-revenue-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'stats' })
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        message?: string
        summary?: RevenueSummary
        paidTrips?: PaidTripRow[]
        paidInvoices?: PaidInvoiceRow[]
      }
      if (!res.ok) {
        throw new Error(data.message ?? res.statusText)
      }
      setSummary(data.summary ?? null)
      setPaidTrips(data.paidTrips ?? [])
      setPaidInvoices(data.paidInvoices ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load payments.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  const handleSyncTripPass = async () => {
    const ref = syncRef.trim()
    if (!ref) {
      setSyncMessage('Enter the booking reference from the guest’s form (e.g. GSI-…).')
      return
    }
    setSyncBusy(true)
    setSyncMessage(null)
    try {
      const sb = getSupabaseBrowserClient()
      const session = await sb?.auth.getSession()
      const token = session?.data.session?.access_token
      if (!token) {
        setSyncMessage('Sign in again as admin.')
        return
      }
      const res = await fetch('/api/admin-revenue-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'sync-trip-pass', referenceId: ref })
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        message?: string
        synced?: boolean
        reason?: string
      }
      if (!res.ok) {
        throw new Error(data.message ?? res.statusText)
      }
      if (data.synced) {
        setSyncMessage(`Pass activated for ${ref}.`)
      } else {
        setSyncMessage(
          data.reason === 'no_paid_invoice_for_reference'
            ? `No paid invoice found for ${ref}.`
            : `Could not activate: ${data.reason ?? 'unknown'}.`
        )
      }
      await loadStats()
    } catch (e) {
      setSyncMessage(e instanceof Error ? e.message : 'Could not activate pass.')
    } finally {
      setSyncBusy(false)
    }
  }

  const rows: UnifiedPaymentRow[] = [
    ...paidTrips.map((row) => ({
      key: `t-${row.id}`,
      kind: 'transfer' as const,
      title: row.guest,
      subtitle: row.route,
      amount: row.collectedDisplay,
      status: statusLabel(row.paymentStatus),
      when: row.updatedAt,
      needsPass: Boolean(row.needsPaymentSync),
      trip: row
    })),
    ...paidInvoices.map((row) => ({
      key: `i-${row.id}`,
      kind: 'invoice' as const,
      title: row.invoiceNumber ?? row.reference ?? 'Trip invoice',
      subtitle: row.reference ? `Ref ${row.reference}` : 'Invoice payment',
      amount: row.collectedDisplay,
      status: 'Paid in full',
      when: row.paidAt,
      invoice: row
    }))
  ]

  const selected = rows.find((r) => r.key === selectedKey) ?? null
  const companyTotal = summary?.companyTotalDisplay ?? (loading ? '…' : '€0.00')
  const tripBits = summary
    ? `${summary.paidTripCount + summary.depositTripCount} transfer · ${summary.paidInvoiceCount} invoice`
    : 'Transfers and invoices paid in Stripe'

  return (
    <section
      aria-labelledby="admin-paid-trips-heading"
      className="overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft"
      id="admin-hub-revenue"
    >
      <header className="border-b border-forest-100 bg-offwhite/80 px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">1 · Money in</p>
            <h3 className="font-display mt-1 text-xl font-semibold text-forest-950 sm:text-2xl" id="admin-paid-trips-heading">
              Payments received
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-forest-700">
              What guests have paid through Stripe. Tap a row for details.
            </p>
          </div>
          <button
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-forest-200 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-forest-900 transition hover:bg-fairway-50 disabled:opacity-60"
            disabled={loading}
            onClick={() => void loadStats()}
            type="button"
          >
            <RefreshCw className={cx('h-4 w-4', loading && 'animate-spin')} aria-hidden />
            Refresh
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-fairway-200 bg-gradient-to-br from-fairway-50 to-white px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-700">Total taken in</p>
          <p className="font-display mt-1 text-3xl font-bold tracking-tight text-forest-950 sm:text-4xl">{companyTotal}</p>
          <p className="mt-1 text-sm text-forest-600">{loading ? 'Loading…' : tripBits}</p>
        </div>
      </header>

      <div className="space-y-6 p-5 sm:p-7">
        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
          <div>
            {loading ? (
              <p className="text-sm text-forest-600">Loading payments…</p>
            ) : rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-forest-200 bg-offwhite/70 px-5 py-8 text-center">
                <p className="font-display text-lg font-semibold text-forest-950">No payments yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-forest-600">
                  When a guest pays a deposit, balance, or invoice, it shows up here.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {rows.map((row) => (
                  <li key={row.key}>
                    <button
                      className={cx(
                        'w-full rounded-2xl border px-4 py-3.5 text-left transition sm:px-5',
                        selectedKey === row.key
                          ? 'border-fairway-500 bg-fairway-50'
                          : 'border-forest-100 bg-white hover:border-fairway-300 hover:bg-offwhite/50'
                      )}
                      onClick={() => setSelectedKey(row.key)}
                      type="button"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-forest-950">{row.title}</p>
                          <p className="mt-0.5 text-sm text-forest-600">{row.subtitle}</p>
                        </div>
                        <p className="font-display text-lg font-bold text-forest-950">{row.amount}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-forest-100 px-2.5 py-0.5 font-semibold text-forest-900">
                          {row.status}
                        </span>
                        <span className="text-ge-gray500">{fmtWhen(row.when)}</span>
                        {row.needsPass ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-950">
                            Needs pass
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="rounded-2xl border border-forest-100 bg-offwhite/60 p-4 sm:p-5 lg:sticky lg:top-6 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">Details</p>
            {!selected ? (
              <p className="mt-3 text-sm leading-relaxed text-forest-600">Choose a payment on the left.</p>
            ) : selected.trip ? (
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-ge-gray500">Guest</dt>
                  <dd className="mt-0.5 font-semibold text-forest-950">{selected.trip.guest}</dd>
                </div>
                {selected.trip.email ? (
                  <div>
                    <dt className="text-xs text-ge-gray500">Email</dt>
                    <dd className="mt-0.5 break-all text-forest-900">{selected.trip.email}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs text-ge-gray500">Reference</dt>
                  <dd className="mt-0.5 font-mono text-forest-950">{selected.trip.reference ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ge-gray500">Collected</dt>
                  <dd className="mt-0.5 font-display text-xl font-bold text-forest-950">{selected.trip.collectedDisplay}</dd>
                </div>
                <p
                  className={cx(
                    'rounded-xl px-3 py-2 text-xs leading-relaxed',
                    selected.trip.needsPaymentSync || selected.trip.paymentStatus.toLowerCase() === 'deposit'
                      ? 'border border-amber-200 bg-amber-50 text-amber-950'
                      : 'border border-emerald-200 bg-emerald-50 text-emerald-950'
                  )}
                >
                  {selected.trip.needsPaymentSync
                    ? 'Payment on file — use “Fix trip pass” below if they still need a scannable pass.'
                    : selected.trip.paymentStatus.toLowerCase() === 'deposit'
                      ? 'Deposit only — trip pass unlocks when paid in full.'
                      : 'Paid in full — trip pass is active for the guest.'}
                </p>
              </dl>
            ) : selected.invoice ? (
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-ge-gray500">Invoice</dt>
                  <dd className="mt-0.5 font-mono text-forest-950">
                    {selected.invoice.invoiceNumber ?? selected.invoice.id.slice(0, 8)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ge-gray500">Reference</dt>
                  <dd className="mt-0.5 font-mono text-forest-950">{selected.invoice.reference ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ge-gray500">Paid</dt>
                  <dd className="mt-0.5 font-display text-xl font-bold text-forest-950">
                    {selected.invoice.collectedDisplay}
                  </dd>
                </div>
              </dl>
            ) : null}
          </aside>
        </div>

        <details className="rounded-2xl border border-forest-100 bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-forest-900">
            Fix trip pass (rare)
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-forest-600">
            Only if a guest paid an invoice but still has no scannable pass. Enter their booking reference.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className="min-h-11 flex-1 rounded-xl border border-forest-200 bg-offwhite px-3 font-mono text-sm text-forest-950 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
              onChange={(e) => setSyncRef(e.target.value)}
              placeholder="GSI-…"
              value={syncRef}
            />
            <button
              className="min-h-11 shrink-0 rounded-xl bg-forest-900 px-5 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
              disabled={syncBusy}
              onClick={() => void handleSyncTripPass()}
              type="button"
            >
              {syncBusy ? 'Working…' : 'Activate pass'}
            </button>
          </div>
          {syncMessage ? (
            <p className="mt-2 text-sm text-forest-800" role="status">
              {syncMessage}
            </p>
          ) : null}
        </details>
      </div>
    </section>
  )
}
