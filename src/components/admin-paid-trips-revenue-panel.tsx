import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Banknote, RefreshCw, ScanLine, Wallet } from 'lucide-react'
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

function RevenueStatCard(props: {
  readonly label: string
  readonly amount: string
  readonly detail: string
  readonly icon: ReactNode
  readonly accent?: 'default' | 'highlight'
}) {
  return (
    <article
      className={cx(
        'flex min-h-[148px] flex-col rounded-2xl border-2 p-6 sm:min-h-[156px] sm:p-7',
        props.accent === 'highlight'
          ? 'border-brand-600/30 bg-gradient-to-br from-fairway-50 to-white'
          : 'border-forest-200 bg-white shadow-sm'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-800">
          {props.icon}
        </span>
        <p className="font-ge text-sm font-extrabold uppercase tracking-[0.12em] text-forest-800">{props.label}</p>
      </div>
      <p className="font-display mt-5 text-3xl font-bold tracking-tight text-forest-950 sm:text-[2rem]">{props.amount}</p>
      <p className="mt-2 text-base leading-relaxed text-forest-700">{props.detail}</p>
    </article>
  )
}

function EmptyListCard(props: { readonly title: string; readonly body: string }) {
  return (
    <div className="mt-5 rounded-2xl border-2 border-dashed border-forest-200 bg-offwhite/80 px-6 py-10 text-center">
      <p className="font-display text-lg font-semibold text-forest-950">{props.title}</p>
      <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-forest-700">{props.body}</p>
    </div>
  )
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
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

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

  const hasAnyPayments = paidTrips.length > 0 || paidInvoices.length > 0
  const companyTotal = summary?.companyTotalDisplay ?? (loading ? '…' : '€0.00')

  return (
    <section
      aria-labelledby="admin-paid-trips-heading"
      className="admin-revenue-panel overflow-hidden rounded-[2rem] border-2 border-forest-200 bg-white shadow-soft"
      id="admin-hub-revenue"
    >
      <header className="ge-on-dark border-b border-white/10 bg-gradient-to-r from-[#0f3d24] via-[#143d28] to-[#0a2416] px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="ge-on-dark-kicker font-ge text-xs font-extrabold uppercase tracking-[0.22em] !text-[#f4dfa6] sm:text-sm">
              Revenue desk
            </p>
            <h3
              className="font-display text-2xl font-bold tracking-tight !text-white sm:text-3xl lg:text-4xl"
              id="admin-paid-trips-heading"
            >
              Paid trips &amp; company totals
            </h3>
            <p className="max-w-2xl text-base leading-[1.75] !text-white/92 sm:text-lg">
              Stripe card payments from guest transfers and trip invoices. Trip pass barcodes unlock only after{' '}
              <strong className="font-semibold !text-white">paid in full</strong>.
            </p>
          </div>
          <button
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] !text-white transition hover:bg-white/20 disabled:opacity-60"
            disabled={loading}
            onClick={() => void loadStats()}
            type="button"
          >
            <RefreshCw className={cx('h-4 w-4', loading && 'animate-spin')} aria-hidden />
            Refresh totals
          </button>
        </div>
      </header>

      <div className="admin-revenue-panel__body space-y-12 p-6 sm:space-y-14 sm:p-10" data-keep-color>
        {error ? (
          <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-base text-red-900" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !hasAnyPayments ? (
          <div className="rounded-2xl border-2 border-forest-200 bg-offwhite px-6 py-8 sm:px-8 sm:py-10">
            <p className="font-display text-xl font-semibold text-forest-950 sm:text-2xl">No payments recorded yet</p>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-forest-700 sm:text-lg">
              When a guest pays a transfer deposit, balance, or trip invoice through Stripe, totals and rows appear here
              automatically. If someone paid before this panel existed, use <strong className="font-semibold text-forest-900">Repair trip pass</strong> below.
            </p>
          </div>
        ) : null}

        <div>
          <h4 className="font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-forest-800 sm:text-base">
            Company totals
          </h4>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <RevenueStatCard
              accent="highlight"
              amount={companyTotal}
              detail="Transfer payments + invoice-only (no double count)"
              icon={<Wallet className="h-5 w-5" aria-hidden />}
              label="Company total"
            />
            <RevenueStatCard
              amount={summary?.transferCollectedDisplay ?? (loading ? '…' : '€0.00')}
              detail={
                summary
                  ? `${summary.paidTripCount} paid in full · ${summary.depositTripCount} deposit`
                  : 'Transfer deposits and paid-in-full checkout'
              }
              icon={<Banknote className="h-5 w-5" aria-hidden />}
              label="Transfer payments"
            />
            <RevenueStatCard
              amount={summary?.invoiceOnlyDisplay ?? (loading ? '…' : '€0.00')}
              detail={
                summary ? `${summary.paidInvoiceCount} paid trip invoices` : 'Trip invoices paid without a transfer row'
              }
              icon={<Banknote className="h-5 w-5" aria-hidden />}
              label="Invoice-only"
            />
          </div>
        </div>

        <div className="rounded-2xl border-2 border-amber-300/80 bg-[#fff9e8] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-brand-900">
              <ScanLine className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h4 className="font-display text-lg font-semibold text-forest-950 sm:text-xl">Repair trip pass</h4>
              <p className="mt-1 text-base leading-relaxed text-forest-700">
                Guest paid a trip invoice but no scannable pass? Enter their reference and activate.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="min-h-12 flex-1 rounded-xl border-2 border-amber-300/70 bg-white px-4 font-mono text-base text-forest-950 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
              onChange={(e) => setSyncRef(e.target.value)}
              placeholder="GSI-S2V6-6778"
              value={syncRef}
            />
            <button
              className="min-h-12 shrink-0 rounded-xl bg-brand-700 px-6 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-brand-800 disabled:opacity-60"
              disabled={syncBusy}
              onClick={() => void handleSyncTripPass()}
              type="button"
            >
              {syncBusy ? 'Syncing…' : 'Activate pass'}
            </button>
          </div>
          {syncMessage ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-white px-4 py-3 text-base leading-relaxed text-forest-900">
              {syncMessage}
            </p>
          ) : null}
        </div>

        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,380px)] xl:gap-12">
          <div className="space-y-10">
            <div>
              <h4 className="font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-forest-800 sm:text-base">
                Paid &amp; deposit trips
              </h4>
              {loading ? (
                <p className="mt-5 text-base text-forest-700">Loading…</p>
              ) : paidTrips.length === 0 ? (
                <EmptyListCard
                  body="Transfer checkout (deposit or paid in full) will list here with guest, route, and amount collected."
                  title="No transfer payments yet"
                />
              ) : (
                <ul className="mt-5 space-y-3">
                  {paidTrips.map((row) => (
                    <li key={row.id}>
                      <button
                        className={cx(
                          'w-full rounded-2xl border-2 px-5 py-4 text-left transition-colors sm:px-6 sm:py-5',
                          selectedTripId === row.id
                            ? 'border-fairway-500 bg-fairway-50'
                            : 'border-forest-200 bg-white hover:border-fairway-400 hover:bg-offwhite/60'
                        )}
                        onClick={() => {
                          setSelectedTripId(row.id)
                          setSelectedInvoiceId(null)
                        }}
                        type="button"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="font-mono text-sm font-bold text-brand-800">
                            {row.reference ?? row.id.slice(0, 8)}
                          </span>
                          <span
                            className={cx(
                              'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
                              row.needsPaymentSync
                                ? 'bg-amber-100 text-amber-950'
                                : 'bg-forest-100 text-forest-900'
                            )}
                          >
                            {row.paymentStatus}
                          </span>
                        </div>
                        <p className="mt-3 text-lg font-semibold text-forest-950">{row.guest}</p>
                        <p className="mt-1 text-base text-forest-700">{row.route}</p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-forest-100 pt-3">
                          <span className="font-display text-xl font-bold text-forest-950">{row.collectedDisplay}</span>
                          <span className="text-sm text-forest-600">{fmtWhen(row.updatedAt)}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-forest-800 sm:text-base">
                Paid invoices
              </h4>
              {loading ? (
                <p className="mt-5 text-base text-forest-700">Loading…</p>
              ) : paidInvoices.length === 0 ? (
                <EmptyListCard
                  body="Trip invoice checkout from the client Payments tab appears here once Stripe marks it paid."
                  title="No paid invoices yet"
                />
              ) : (
                <ul className="mt-5 space-y-3">
                  {paidInvoices.map((row) => (
                    <li key={row.id}>
                      <button
                        className={cx(
                          'w-full rounded-2xl border-2 px-5 py-4 text-left transition-colors sm:px-6 sm:py-5',
                          selectedInvoiceId === row.id
                            ? 'border-fairway-500 bg-fairway-50'
                            : 'border-forest-200 bg-white hover:border-fairway-400 hover:bg-offwhite/60'
                        )}
                        onClick={() => {
                          setSelectedInvoiceId(row.id)
                          setSelectedTripId(null)
                        }}
                        type="button"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="font-mono text-sm font-bold text-brand-800">
                            {row.reference ?? row.invoiceNumber ?? row.id.slice(0, 8)}
                          </span>
                          <span className="font-display text-xl font-bold text-forest-950">{row.collectedDisplay}</span>
                        </div>
                        <p className="mt-3 text-base text-forest-700">Paid {fmtWhen(row.paidAt)}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="rounded-2xl border-2 border-forest-200 bg-white p-6 shadow-sm sm:p-8 xl:sticky xl:top-6 xl:self-start">
            <p className="font-ge text-xs font-extrabold uppercase tracking-[0.16em] text-brand-700 sm:text-sm">
              Client payment view
            </p>
            <h4 className="font-display mt-3 text-xl font-semibold text-forest-950 sm:text-2xl">Payment detail</h4>
            {!selectedTripId && !selectedInvoiceId ? (
              <p className="mt-5 text-base leading-relaxed text-forest-700">
                Select a paid trip or invoice — same rows guests see under{' '}
                <strong className="font-semibold text-forest-950">Payments → All payments</strong>.
              </p>
            ) : selectedTripId ? (
              (() => {
                const row = paidTrips.find((r) => r.id === selectedTripId)
                if (!row) {
                  return null
                }
                const isDeposit = row.paymentStatus.toLowerCase() === 'deposit'
                return (
                  <dl className="mt-6 space-y-5 text-base">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Guest</dt>
                      <dd className="mt-2 font-semibold text-forest-950">{row.guest}</dd>
                    </div>
                    {row.email ? (
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Email</dt>
                        <dd className="mt-2 break-all text-forest-900">{row.email}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Route</dt>
                      <dd className="mt-2 text-forest-900">{row.route}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Reference</dt>
                      <dd className="mt-2 font-mono text-forest-950">{row.reference ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Status</dt>
                      <dd className="mt-2 font-semibold capitalize text-brand-800">{row.paymentStatus}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Collected</dt>
                      <dd className="mt-2 font-display text-2xl font-bold text-forest-950">{row.collectedDisplay}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Updated</dt>
                      <dd className="mt-2 text-forest-800">{fmtWhen(row.updatedAt)}</dd>
                    </div>
                    {row.needsPaymentSync ? (
                      <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
                        Stripe payment on file — run <strong>Activate pass</strong> if the guest still needs a trip pass.
                      </p>
                    ) : isDeposit ? (
                      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
                        Deposit only — no trip pass until paid in full.
                      </p>
                    ) : (
                      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-950">
                        Paid in full — trip pass active on the client dashboard.
                      </p>
                    )}
                  </dl>
                )
              })()
            ) : (
              (() => {
                const row = paidInvoices.find((r) => r.id === selectedInvoiceId)
                if (!row) {
                  return null
                }
                return (
                  <dl className="mt-6 space-y-5 text-base">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Invoice</dt>
                      <dd className="mt-2 font-mono text-forest-950">{row.invoiceNumber ?? row.id.slice(0, 8)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Reference</dt>
                      <dd className="mt-2 font-mono text-forest-950">{row.reference ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Amount paid</dt>
                      <dd className="mt-2 font-display text-2xl font-bold text-forest-950">{row.collectedDisplay}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Paid at</dt>
                      <dd className="mt-2 text-forest-800">{fmtWhen(row.paidAt)}</dd>
                    </div>
                  </dl>
                )
              })()
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
