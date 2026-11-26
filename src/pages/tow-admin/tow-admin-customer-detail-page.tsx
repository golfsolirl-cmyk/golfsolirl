import { useEffect, useMemo, useState } from 'react'
import { TowAdminShell } from '../../components/tow-admin/tow-admin-bar'
import { TripTrackerPanel } from '../../components/tow-admin/trip-tracker-panel'
import { ensureAdminSession, towAdmin } from '../../lib/tow-admin-api'
import {
  PAID_VIA_OPTIONS,
  formatEuro,
  formatIrishDateTime,
  type TripStepStatus
} from '../../lib/tow-admin-constants'

type Customer = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  accountRef: string | null
  businessName: string | null
  billingAddress: string | null
  adminNotes: string
  tripTracker: Record<string, TripStepStatus>
  emailRecipients: { email: string; name?: string; kind?: string }[]
  emailTripOnStepChange: boolean
  paymentsLog: { id: string; date: string; amount: number; method: string; reference?: string; kind?: string }[]
  invoicesLog: { id: string; number: string; description: string; amount: number; status: string; at: string }[]
  activityLog: { at: string; note: string }[]
  tripStepEmailLog: { at: string; stepId: string; status: string; to?: string; subject?: string }[]
  linkedEnquiryId: string | null
  portalToken: string | null
}

export function TowAdminCustomerDetailPage() {
  const id = useMemo(() => window.location.pathname.replace(/\/+$/, '').split('/').pop() || '', [])
  const [ready, setReady] = useState(false)
  const [c, setC] = useState<Customer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [payForm, setPayForm] = useState({ date: '', amount: '', method: 'monzo', reference: '', kind: 'deposit' })
  const [invForm, setInvForm] = useState({ description: '', amount: '', dueDate: '' })
  const [recipient, setRecipient] = useState({ email: '', name: '', kind: 'to' })

  const reload = async () => {
    const res = await towAdmin<{ customer: Customer }>('customers_get', { id })
    setC(res.customer)
  }

  useEffect(() => {
    document.title = 'Customer · Admin · Golf Sol Ireland'
    let cancelled = false
    void (async () => {
      const ok = await ensureAdminSession(`/admin/customers/${id}`)
      if (!ok || cancelled) return
      try {
        await reload()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true)
    setMsg(null)
    setError(null)
    try {
      await towAdmin('customers_patch', { id, ...body })
      await reload()
      setMsg('Saved.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Loading…</div>
  }
  if (!c) {
    return (
      <TowAdminShell active="customers">
        <p className="text-rose-700">{error || 'Not found'}</p>
      </TowAdminShell>
    )
  }

  return (
    <TowAdminShell active="customers">
      <a href="/admin/customers" className="text-sm text-slate-500 hover:text-gs-dark">
        ← All customers
      </a>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-ge text-3xl font-extrabold text-gs-dark">{c.fullName || c.email}</h1>
          <p className="text-sm text-slate-500">
            {[c.businessName, c.email, c.accountRef ? `ref: ${c.accountRef}` : null].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void patch({ archive: true })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
          >
            Archive
          </button>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
      {msg ? <p className="mt-3 text-sm text-emerald-700">{msg}</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-ge text-lg font-extrabold">Who gets the trip emails</h2>
              <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold" disabled>
                Send test email
              </button>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {(c.emailRecipients || []).length === 0 ? (
                <li className="text-slate-500">Default: {c.email}</li>
              ) : (
                c.emailRecipients.map((r, i) => (
                  <li key={`${r.email}-${i}`}>
                    {r.kind || 'to'}: {r.name ? `${r.name} · ` : ''}
                    {r.email}
                  </li>
                ))
              )}
            </ul>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
              <input
                placeholder="Email"
                value={recipient.email}
                onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Name"
                value={recipient.name}
                onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={recipient.kind}
                onChange={(e) => setRecipient({ ...recipient, kind: e.target.value })}
                className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
              >
                <option value="to">To</option>
                <option value="cc">Cc</option>
              </select>
              <button
                type="button"
                disabled={busy || !recipient.email}
                onClick={() =>
                  void patch({
                    emailRecipients: [...(c.emailRecipients || []), { ...recipient }]
                  })
                }
                className="rounded-lg bg-gs-dark px-3 py-2 text-sm font-semibold text-white"
              >
                + Add
              </button>
            </div>
          </section>

          <TripTrackerPanel
            tripTracker={c.tripTracker || {}}
            emailOnStepChange={c.emailTripOnStepChange !== false}
            emailLog={c.tripStepEmailLog || []}
            busy={busy}
            onToggleEmail={(on) => void patch({ emailTripOnStepChange: on })}
            onStepChange={(stepId, status) => void patch({ tripStep: { id: stepId, status } })}
          />

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-ge text-lg font-extrabold">Payments</h2>
            <p className="text-sm text-slate-500">
              {formatEuro(c.paymentsLog.reduce((t, p) => t + (Number(p.amount) || 0), 0))} received in total
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={payForm.date}
                onChange={(e) => setPayForm({ ...payForm, date: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Amount excl. VAT (€)"
                value={payForm.amount}
                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={payForm.method}
                onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {PAID_VIA_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Reference"
                value={payForm.reference}
                onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch({ logPayment: { ...payForm, amount: Number(payForm.amount) || 0 } })}
              className="mt-3 rounded-xl bg-gs-green px-4 py-2.5 text-sm font-semibold text-white"
            >
              Log payment
            </button>
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1">Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {c.paymentsLog.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-3 text-slate-400">
                      No payments yet
                    </td>
                  </tr>
                ) : (
                  c.paymentsLog.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-2">{p.date}</td>
                      <td>{formatEuro(p.amount)}</td>
                      <td>{p.method}</td>
                      <td>{p.reference || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-ge text-lg font-extrabold">Invoices & receipts</h2>
            <div className="mt-3 grid gap-2">
              <input
                placeholder="Description"
                value={invForm.description}
                onChange={(e) => setInvForm({ ...invForm, description: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Amount incl. VAT (€)"
                value={invForm.amount}
                onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={invForm.dueDate}
                onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch({ createInvoice: { ...invForm, amount: Number(invForm.amount) || 0 } })}
              className="mt-3 rounded-xl bg-gs-green px-4 py-2.5 text-sm font-semibold text-white"
            >
              Create invoice
            </button>
            <ul className="mt-4 space-y-2 text-sm">
              {c.invoicesLog.length === 0 ? (
                <li className="text-slate-400">None yet</li>
              ) : (
                c.invoicesLog.map((inv) => (
                  <li key={inv.id} className="flex justify-between border-t border-slate-100 pt-2">
                    <span>
                      {inv.number} · {inv.description}
                    </span>
                    <span>
                      {formatEuro(inv.amount)} · {inv.status}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-ge text-lg font-extrabold">Activity log</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {(c.activityLog || []).length === 0 ? (
                <li className="text-slate-400">No activity yet</li>
              ) : (
                c.activityLog.map((a, i) => (
                  <li key={`${a.at}-${i}`}>
                    <span className="text-slate-400">{formatIrishDateTime(a.at)}</span> {a.note}
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-ge text-lg font-extrabold">Customer & billing</h2>
            <div className="mt-3 space-y-2">
              <Field
                label="Contact name"
                value={c.fullName || ''}
                onBlur={(v) => void patch({ fullName: v })}
              />
              <Field
                label="Business name"
                value={c.businessName || ''}
                onBlur={(v) => void patch({ businessName: v })}
              />
              <p className="text-sm">
                <span className="text-slate-500">Email</span>
                <br />
                {c.email}
              </p>
              <p className="text-sm">
                <span className="text-slate-500">Phone</span>
                <br />
                {c.phone || '—'}
              </p>
              <label className="block text-sm">
                <span className="text-slate-500">Billing address</span>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  rows={3}
                  defaultValue={c.billingAddress || ''}
                  onBlur={(e) => void patch({ billingAddress: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-500">Notes</span>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  rows={3}
                  defaultValue={c.adminNotes || ''}
                  onBlur={(e) => void patch({ adminNotes: e.target.value })}
                />
              </label>
            </div>
          </section>

          {c.linkedEnquiryId ? (
            <a href={`/admin/enquiries/${c.linkedEnquiryId}`} className="block text-sm text-gs-green underline">
              Original enquiry
            </a>
          ) : null}

          {c.portalToken ? (
            <a href={`/portal/${c.portalToken}`} target="_blank" rel="noreferrer" className="block break-all text-sm text-gs-green underline">
              Open portal link
            </a>
          ) : null}

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-ge text-lg font-extrabold">Emails sent to customer</h2>
            <p className="mt-2 text-sm text-slate-400">None yet</p>
          </section>
        </div>
      </div>
    </TowAdminShell>
  )
}

function Field({ label, value, onBlur }: { label: string; value: string; onBlur: (v: string) => void }) {
  const [v, setV] = useState(value)
  useEffect(() => setV(value), [value])
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => onBlur(v)}
      />
    </label>
  )
}
