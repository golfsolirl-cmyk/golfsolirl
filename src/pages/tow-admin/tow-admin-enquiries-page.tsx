import { useEffect, useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { TowAdminShell } from '../../components/tow-admin/tow-admin-bar'
import { ensureAdminSession, towAdmin } from '../../lib/tow-admin-api'
import {
  ENQUIRY_ADMIN_STATUSES,
  ENQUIRY_PAYMENT_UI,
  PAY_BADGE_CLASS,
  STATUS_BADGE_CLASS,
  formatEuro,
  formatIrishDateTime
} from '../../lib/tow-admin-constants'

type EnquiryRow = {
  id: string
  reference: string
  createdAt: string
  name: string
  email: string
  phone: string
  interest: string
  formKey: string
  adminStatus: string
  paymentUi: string
  amountDue: number | null
}

type SystemStatus = {
  storage: { ok: boolean; label: string }
  email: { ok: boolean; label: string }
  payments: { ok: boolean; label: string }
  site: { ok: boolean; label: string }
}

export function TowAdminEnquiriesPage() {
  const [ready, setReady] = useState(false)
  const [rows, setRows] = useState<EnquiryRow[]>([])
  const [sys, setSys] = useState<SystemStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [kind, setKind] = useState('all')
  const [pay, setPay] = useState('all')
  const [busy, setBusy] = useState('')
  const [customerCount, setCustomerCount] = useState(0)

  useEffect(() => {
    document.title = 'Enquiries · Admin · Golf Sol Ireland'
    let cancelled = false
    void (async () => {
      const ok = await ensureAdminSession('/admin')
      if (!ok || cancelled) return
      try {
        const [list, statusRes, customers] = await Promise.all([
          towAdmin<{ enquiries: EnquiryRow[] }>('enquiries_list'),
          towAdmin<{ storage: SystemStatus['storage']; email: SystemStatus['email']; payments: SystemStatus['payments']; site: SystemStatus['site'] }>(
            'system_status'
          ),
          towAdmin<{ stats: { count: number } }>('customers_list')
        ])
        if (cancelled) return
        setRows(list.enquiries || [])
        setSys({
          storage: statusRes.storage,
          email: statusRes.email,
          payments: statusRes.payments,
          site: statusRes.site
        })
        setCustomerCount(customers.stats?.count ?? 0)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load.')
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
    return rows.filter((r) => {
      if (status === 'all' ? r.adminStatus === 'spam' : r.adminStatus !== status) {
        if (status === 'all' && r.adminStatus === 'spam') return false
        if (status !== 'all' && r.adminStatus !== status) return false
      }
      if (kind !== 'all' && r.formKey !== kind) return false
      if (pay !== 'all') {
        if (pay === 'none') {
          if (r.paymentUi !== 'none' && r.amountDue != null) return false
          if (r.amountDue != null) return false
        } else if (r.paymentUi !== pay) return false
      }
      if (!s) return true
      return [r.reference, r.name, r.email, r.phone, r.interest, r.formKey].some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(s)
      )
    })
  }, [rows, q, status, kind, pay])

  const awaiting = rows.filter((r) => r.paymentUi === 'awaiting_payment' || r.paymentUi === 'customer_reported')
  const awaitingDue = awaiting.reduce((t, r) => t + (r.amountDue || 0), 0)
  const paidCount = rows.filter((r) => r.paymentUi === 'paid_in_full').length
  const newCount = rows.filter((r) => r.adminStatus === 'new').length
  const formKeys = useMemo(() => [...new Set(rows.map((r) => r.formKey).filter(Boolean))], [rows])

  const patchPay = async (id: string, paymentUi: string) => {
    setBusy(id)
    try {
      const res = await towAdmin<{ enquiry: EnquiryRow }>('enquiries_patch', { id, paymentUi })
      setRows((ls) => ls.map((r) => (r.id === id ? { ...r, ...res.enquiry } : r)))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy('')
    }
  }

  const patchStatus = async (id: string, adminStatus: string) => {
    setBusy(id)
    try {
      const res = await towAdmin<{ enquiry: EnquiryRow }>('enquiries_patch', { id, adminStatus })
      setRows((ls) => ls.map((r) => (r.id === id ? { ...r, ...res.enquiry } : r)))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy('')
    }
  }

  const exportCsv = async () => {
    try {
      const res = await towAdmin<{ csv: string; filename: string }>('enquiries_export_csv')
      const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.filename || 'enquiries.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Export failed')
    }
  }

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 font-ge text-sm text-slate-500">Loading…</div>
  }

  return (
    <TowAdminShell active="enquiries">
      {error ? <p className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total enquiries" value={rows.length} />
        <Stat label="New" value={newCount} tone="green" />
        <Stat label="Awaiting payment" value={awaiting.length} tone="amber" sub={awaitingDue ? `${formatEuro(awaitingDue)} due` : undefined} />
        <Stat label="Paid" value={paidCount} tone="emerald" />
      </div>

      <a
        href="/admin/customers"
        className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-2xl bg-gs-dark p-5 text-white hover:bg-[#0a2f24]"
      >
        <span className="font-ge font-bold">Customers →</span>
        <span>
          <span className="font-ge text-2xl font-extrabold text-brand-400">{customerCount}</span>{' '}
          <span className="text-white/70">customers</span>
        </span>
        <span className="text-white/70">Trip desks & payments</span>
      </a>

      {sys ? (
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
          <Status ok={sys.storage.ok} title="Storage" body={sys.storage.label} />
          <Status ok={sys.email.ok} title="Email (Resend)" body={sys.email.label} />
          <Status ok={sys.payments.ok} title="Payments" body={sys.payments.label} />
          <Status ok={sys.site.ok} title="Site URL" body={sys.site.label} />
        </div>
      ) : null}

      <section className="mt-8 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
          <h1 className="font-ge text-xl font-extrabold text-gs-dark">Enquiries</h1>
          <label className="relative flex-1 lg:ml-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reference, name, email…"
              aria-label="Search enquiries"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 outline-none focus:border-gs-green"
            />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="rounded-xl border border-slate-300 px-3 py-2.5">
            <option value="all">All (except spam)</option>
            {ENQUIRY_ADMIN_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Filter by type" className="rounded-xl border border-slate-300 px-3 py-2.5">
            <option value="all">All types</option>
            {formKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select value={pay} onChange={(e) => setPay(e.target.value)} aria-label="Filter by payment" className="rounded-xl border border-slate-300 px-3 py-2.5">
            <option value="all">Any payment</option>
            {ENQUIRY_PAYMENT_UI.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void exportCsv()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gs-dark px-4 py-2.5 font-ge font-semibold text-white hover:bg-[#0a2f24]"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {shown.length === 0 ? (
          <p className="p-10 text-center text-slate-500">
            {rows.length ? 'No enquiries match those filters.' : 'No enquiries yet. Website forms will appear here.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[64rem] text-left text-[0.9375rem]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3">Received</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">What do you need</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 align-top hover:bg-slate-50">
                    <td className="whitespace-nowrap p-3 text-slate-500">
                      {formatIrishDateTime(r.createdAt)}
                      <br />
                      <span className="font-mono text-sm">{r.reference || r.id.slice(0, 8)}</span>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-gs-dark">{r.name}</p>
                      {r.email ? (
                        <a href={`mailto:${r.email}`} className="text-gs-green hover:underline">
                          {r.email}
                        </a>
                      ) : null}
                      {r.phone ? <p className="text-slate-500">{r.phone}</p> : null}
                    </td>
                    <td className="p-3">{r.formKey}</td>
                    <td className="max-w-[16rem] p-3 text-slate-600">
                      <p className="line-clamp-2">{r.interest || '—'}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold">{formatEuro(r.amountDue)}</p>
                      <select
                        disabled={busy === r.id}
                        value={r.paymentUi === 'none' ? 'awaiting_payment' : r.paymentUi}
                        onChange={(e) => void patchPay(r.id, e.target.value)}
                        aria-label={`Payment for ${r.name}`}
                        className={`mt-1 rounded-lg px-2 py-1.5 text-sm font-semibold ${PAY_BADGE_CLASS[r.paymentUi] || PAY_BADGE_CLASS.awaiting_payment}`}
                      >
                        {ENQUIRY_PAYMENT_UI.filter((s) => s.id !== 'none').map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        disabled={busy === r.id}
                        value={r.adminStatus}
                        onChange={(e) => void patchStatus(r.id, e.target.value)}
                        aria-label={`Status for ${r.name}`}
                        className={`rounded-lg px-2 py-1.5 text-sm font-semibold ${STATUS_BADGE_CLASS[r.adminStatus] || ''}`}
                      >
                        {ENQUIRY_ADMIN_STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <a
                        href={`/admin/enquiries/${r.id}`}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold hover:bg-slate-100"
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-slate-100 p-3 text-sm text-slate-400">
          Showing {shown.length} of {rows.length}. Times are Irish time.
        </p>
      </section>
    </TowAdminShell>
  )
}

function Stat({
  label,
  value,
  tone,
  sub
}: {
  label: string
  value: number
  tone?: 'green' | 'emerald' | 'amber'
  sub?: string
}) {
  const c =
    tone === 'green' ? 'text-gs-green' : tone === 'emerald' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : 'text-gs-dark'
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 font-ge text-3xl font-extrabold ${c}`}>{value}</p>
      {sub ? <p className="text-sm text-slate-500">{sub}</p> : null}
    </div>
  )
}

function Status({ ok, title, body }: { ok: boolean; title: string; body: string }) {
  return (
    <div className={`rounded-xl p-3.5 ring-1 ${ok ? 'bg-emerald-50 ring-emerald-200' : 'bg-amber-50 ring-amber-200'}`}>
      <p className="font-semibold">
        {ok ? '✓' : '!'} {title}
      </p>
      <p className="mt-0.5 break-words text-slate-600">{body}</p>
    </div>
  )
}
