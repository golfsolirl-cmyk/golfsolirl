import { useCallback, useEffect, useState } from 'react'
import { Banknote, RefreshCw, ScanLine, Wallet } from 'lucide-react'
import { getSupabaseBrowserClient } from '../lib/supabase-browser'
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
}

type PaidInvoiceRow = {
  id: string
  reference: string | null
  invoiceNumber: string | null
  collectedDisplay: string
  paidAt: string | null
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

export function AdminPaidTripsRevenuePanel() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<RevenueSummary | null>(null)
  const [paidTrips, setPaidTrips] = useState<PaidTripRow[]>([])
  const [paidInvoices, setPaidInvoices] = useState<PaidInvoiceRow[]>([])
  const [syncRef, setSyncRef] = useState('GSI-S2V6-6778')
  const [syncBusy, setSyncBusy] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

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
      setError(e instanceof Error ? e.message : 'Could not load revenue stats.')
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
      setSyncMessage('Enter a reference ID (e.g. GSI-S2V6-6778).')
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
        bookingId?: string
        reason?: string
      }
      if (!res.ok) {
        throw new Error(data.message ?? res.statusText)
      }
      if (data.synced) {
        setSyncMessage(`Trip pass activated for ${ref}${data.bookingId ? ` (booking ${data.bookingId.slice(0, 8)}…)` : ''}.`)
      } else {
        setSyncMessage(data.reason === 'no_paid_invoice_for_reference' ? `No paid invoice found for ${ref}.` : `Could not sync: ${data.reason ?? 'unknown'}.`)
      }
      await loadStats()
    } catch (e) {
      setSyncMessage(e instanceof Error ? e.message : 'Sync failed.')
    } finally {
      setSyncBusy(false)
    }
  }

  return (
    <section
      aria-labelledby="admin-paid-trips-heading"
      className="overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft"
      id="admin-hub-revenue"
    >
      <header className="border-b border-forest-100 bg-gradient-to-r from-[#0f3d24] via-[#143d28] to-[#0a2416] px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-[#d4a843]">Revenue desk</p>
            <h3 className="font-display mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl" id="admin-paid-trips-heading">
              Paid trips &amp; company totals
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/88">
              Trips with a deposit or full payment show a scannable trip pass in the client dashboard. Invoice-only payments now
              activate the pass automatically — use repair below if a guest paid before this fix.
            </p>
          </div>
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/15 disabled:opacity-60"
            disabled={loading}
            onClick={() => void loadStats()}
            type="button"
          >
            <RefreshCw className={cx('h-4 w-4', loading && 'animate-spin')} aria-hidden />
            Refresh
          </button>
        </div>
      </header>

      <div className="space-y-8 p-6 sm:p-8">
        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-brand-700/25 bg-gradient-to-br from-white to-ge-gray50/80 p-5 ring-1 ring-gs-green/10">
            <div className="flex items-center gap-2 text-brand-700">
              <Wallet className="h-4 w-4" aria-hidden />
              <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.16em]">Company total</p>
            </div>
            <p className="font-display mt-3 text-2xl font-bold text-forest-950">{summary?.companyTotalDisplay ?? '—'}</p>
            <p className="mt-1 text-xs text-forest-600">Transfers collected + invoice-only (no double count)</p>
          </article>
          <article className="rounded-2xl border border-forest-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-forest-700">
              <Banknote className="h-4 w-4" aria-hidden />
              <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.16em]">Transfer payments</p>
            </div>
            <p className="font-display mt-3 text-2xl font-bold text-forest-950">{summary?.transferCollectedDisplay ?? '—'}</p>
            <p className="mt-1 text-xs text-forest-600">
              {summary ? `${summary.paidTripCount} paid · ${summary.depositTripCount} deposit` : '—'}
            </p>
          </article>
          <article className="rounded-2xl border border-forest-100 bg-white p-5 shadow-sm">
            <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-forest-700">Invoice-only</p>
            <p className="font-display mt-3 text-2xl font-bold text-forest-950">{summary?.invoiceOnlyDisplay ?? '—'}</p>
            <p className="mt-1 text-xs text-forest-600">{summary ? `${summary.paidInvoiceCount} paid invoices` : '—'}</p>
          </article>
          <article className="rounded-2xl border border-amber-200/80 bg-[#fff9e8] p-5">
            <div className="flex items-center gap-2 text-brand-900">
              <ScanLine className="h-4 w-4" aria-hidden />
              <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.16em]">Repair trip pass</p>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                className="min-h-11 flex-1 rounded-xl border border-brand-700/30 bg-white px-3 font-mono text-sm text-forest-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                onChange={(e) => setSyncRef(e.target.value)}
                placeholder="GSI-S2V6-6778"
                value={syncRef}
              />
              <button
                className="min-h-11 rounded-xl bg-brand-700 px-4 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-brand-800 disabled:opacity-60"
                disabled={syncBusy}
                onClick={() => void handleSyncTripPass()}
                type="button"
              >
                {syncBusy ? 'Syncing…' : 'Activate pass'}
              </button>
            </div>
            {syncMessage ? <p className="mt-2 text-xs leading-relaxed text-brand-900">{syncMessage}</p> : null}
          </article>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="font-ge text-sm font-extrabold uppercase tracking-[0.14em] text-brand-700">Paid &amp; deposit trips</h4>
            {loading ? (
              <p className="mt-3 text-sm text-forest-600">Loading…</p>
            ) : paidTrips.length === 0 ? (
              <p className="mt-3 text-sm text-forest-600">No paid or deposit trips yet.</p>
            ) : (
              <ul className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">
                {paidTrips.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-xl border border-forest-100 bg-offwhite/50 px-4 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-brand-800">{row.reference ?? row.id.slice(0, 8)}</span>
                      <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-forest-800">
                        {row.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-forest-950">{row.guest}</p>
                    <p className="text-xs text-forest-600">{row.route}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-forest-900">{row.collectedDisplay} collected</span>
                      <span className="text-ge-gray500">{fmtWhen(row.updatedAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="font-ge text-sm font-extrabold uppercase tracking-[0.14em] text-brand-700">Paid invoices</h4>
            {loading ? (
              <p className="mt-3 text-sm text-forest-600">Loading…</p>
            ) : paidInvoices.length === 0 ? (
              <p className="mt-3 text-sm text-forest-600">No paid invoices yet.</p>
            ) : (
              <ul className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">
                {paidInvoices.map((row) => (
                  <li key={row.id} className="rounded-xl border border-forest-100 bg-white px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-brand-800">{row.reference ?? row.invoiceNumber ?? row.id.slice(0, 8)}</span>
                      <span className="font-semibold text-forest-900">{row.collectedDisplay}</span>
                    </div>
                    <p className="mt-1 text-xs text-ge-gray500">{fmtWhen(row.paidAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
