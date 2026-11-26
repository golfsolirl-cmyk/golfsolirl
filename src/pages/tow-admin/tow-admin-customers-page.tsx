import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { TowAdminShell } from '../../components/tow-admin/tow-admin-bar'
import { ensureAdminSession, towAdmin } from '../../lib/tow-admin-api'
import { TRIP_TRACKER_STEPS, type TripStepStatus } from '../../lib/tow-admin-constants'

type Customer = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  accountRef: string | null
  businessName: string | null
  tripTracker: Record<string, TripStepStatus>
  archivedAt: string | null
}

export function TowAdminCustomersPage() {
  const [ready, setReady] = useState(false)
  const [rows, setRows] = useState<Customer[]>([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('active')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Customers · Admin · Golf Sol Ireland'
    let cancelled = false
    void (async () => {
      const ok = await ensureAdminSession('/admin/customers')
      if (!ok || cancelled) return
      try {
        const res = await towAdmin<{ customers: Customer[] }>('customers_list')
        if (!cancelled) setRows(res.customers || [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return rows.filter((c) => {
      if (filter === 'active' && c.archivedAt) return false
      if (filter === 'archived' && !c.archivedAt) return false
      if (!s) return true
      return [c.fullName, c.email, c.businessName, c.accountRef, c.phone].some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(s)
      )
    })
  }, [rows, q, filter])

  const doneCount = (c: Customer) =>
    TRIP_TRACKER_STEPS.filter((st) => (c.tripTracker?.[st.id] || 'todo') === 'done').length

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Loading…</div>
  }

  return (
    <TowAdminShell active="customers">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-ge text-3xl font-extrabold text-gs-dark">Customers</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Each customer&apos;s trip desk, tracker and payments. No passwords here — those live in your password manager.
          </p>
        </div>
        <a
          href="/dashboard/admin"
          className="rounded-xl bg-gs-green px-4 py-2.5 font-ge text-sm font-semibold text-white hover:bg-[#0f4d38]"
        >
          + New customer
        </a>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Customers" value={rows.filter((c) => !c.archivedAt).length} />
        <Stat label="Archived" value={rows.filter((c) => c.archivedAt).length} />
        <Stat label="With trip desk" value={rows.filter((c) => c.accountRef).length} />
        <Stat label="Listed" value={rows.length} />
        <Stat label="Services to set up" value={rows.reduce((n, c) => n + (10 - doneCount(c)), 0)} tone="blue" />
      </div>

      <div className="mt-4 rounded-xl bg-emerald-50 p-3.5 text-sm text-emerald-900 ring-1 ring-emerald-200">
        ✓ Trip tracker steps email the client when you choose — no TOW hosting kill-switch or service logins here.
      </div>

      {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, business, email, reference…"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3"
          />
        </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5">
          <option value="active">All (not archived)</option>
          <option value="archived">Archived</option>
          <option value="all">Everyone</option>
        </select>
      </div>

      <section className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {shown.length === 0 ? (
          <p className="p-10 text-center text-slate-500">No customers match.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {shown.map((c) => (
              <li key={c.id}>
                <a href={`/admin/customers/${c.id}`} className="flex flex-wrap items-center gap-3 px-4 py-4 hover:bg-slate-50 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-ge font-extrabold text-gs-dark">{c.fullName || c.email || 'Customer'}</p>
                    <p className="text-sm text-slate-500">
                      {[c.businessName, c.email, c.accountRef].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
                    Trip {doneCount(c)}/10
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">Portal</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </TowAdminShell>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'blue' }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 font-ge text-3xl font-extrabold ${tone === 'blue' ? 'text-sky-600' : 'text-gs-dark'}`}>{value}</p>
    </div>
  )
}
