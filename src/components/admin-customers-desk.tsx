import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuxuryButton } from './ui/button'
import { cx } from '../lib/utils'

export type AdminCustomerDeskSeed = {
  readonly email: string
  readonly name?: string
  readonly phone?: string
  readonly tab?: CustomerTab
  readonly nonce: number
}

type CustomerTab = 'overview' | 'quote' | 'invoice' | 'email'

type CustomerRow = {
  email: string
  name: string
  phone: string
  accountReference: string
  profileId: string | null
  enquiryCount: number
  latestAt: string
}

type EnquiryRow = {
  id: string
  reference_id: string
  interest: string | null
  created_at: string
}

type InvoiceRow = {
  id: string
  invoice_number: string
  amount_cents: number
  status: string
  enquiry_reference_id: string | null
  created_at: string
  paid_at: string | null
}

type PaymentRow = {
  id: string
  pickup_label: string | null
  dropoff_label: string | null
  payment_status: string | null
  admin_price_eur: number | null
  amount_received_eur: number | null
  status: string | null
  enquiry_reference_id: string | null
  created_at: string
}

type DocumentRow = {
  id: string
  kind: string
  reference_code: string
  title: string
  amount_cents: number
  status: string
  created_at: string
}

type Detail = {
  customer: { email: string; name: string; phone: string; accountReference: string; profileId: string | null }
  enquiries: EnquiryRow[]
  invoices: InvoiceRow[]
  payments: PaymentRow[]
  documents: DocumentRow[]
  migrationNeeded?: boolean
}

const eur = (cents: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format((cents || 0) / 100)

const when = (iso: string | null | undefined) => {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' })
}

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-base text-forest-950 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/70'

async function deskRequest<T>(token: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch('/api/desk-customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  })
  const data = (await res.json().catch(() => ({}))) as { message?: string }
  if (!res.ok) {
    throw new Error(data.message || 'Request failed.')
  }
  return data as T
}

export function AdminCustomersDesk(props: {
  readonly accessToken: string | null
  readonly seed?: AdminCustomerDeskSeed | null
  readonly onSeedConsumed?: () => void
}) {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [query, setQuery] = useState('')
  const [selectedEmail, setSelectedEmail] = useState('')
  const [detail, setDetail] = useState<Detail | null>(null)
  const [tab, setTab] = useState<CustomerTab>('overview')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('Costa del Sol golf week')
  const [amount, setAmount] = useState('')
  const [summary, setSummary] = useState('')
  const [subject, setSubject] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const loadList = useCallback(async () => {
    if (!props.accessToken) return
    setBusy('list')
    setError(null)
    try {
      const data = await deskRequest<{ customers: CustomerRow[] }>(props.accessToken, { action: 'list' })
      setCustomers(data.customers ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load customers.')
    } finally {
      setBusy(null)
    }
  }, [props.accessToken])

  const loadDetail = useCallback(
    async (email: string) => {
      if (!props.accessToken || !email) return
      setBusy('detail')
      setError(null)
      try {
        const data = await deskRequest<Detail>(props.accessToken, { action: 'detail', email })
        setDetail(data)
        setName((current) => current || data.customer.name || '')
        setPhone((current) => current || data.customer.phone || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not open this customer.')
      } finally {
        setBusy(null)
      }
    },
    [props.accessToken]
  )

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!props.seed?.email) return
    setSelectedEmail(props.seed.email.trim().toLowerCase())
    setTab(props.seed.tab || 'overview')
    setName(props.seed.name || '')
    setPhone(props.seed.phone || '')
    setNotice(null)
    setError(null)
    props.onSeedConsumed?.()
  }, [props.seed?.nonce])

  useEffect(() => {
    if (!selectedEmail) {
      setDetail(null)
      return
    }
    void loadDetail(selectedEmail)
  }, [selectedEmail, loadDetail])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((row) =>
      [row.name, row.email, row.phone, row.accountReference].join(' ').toLowerCase().includes(q)
    )
  }, [customers, query])

  const send = async (action: 'send-quote' | 'send-invoice' | 'send-note') => {
    if (!props.accessToken || !selectedEmail) return
    setBusy(action)
    setError(null)
    setNotice(null)
    try {
      const data = await deskRequest<{ message: string }>(props.accessToken, {
        action,
        email: selectedEmail,
        name,
        phone,
        title,
        summary,
        subject,
        amountEur: amount
      })
      setNotice(data.message)
      setSummary('')
      await loadDetail(selectedEmail)
      setTab('overview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send.')
    } finally {
      setBusy(null)
    }
  }

  const tabs: { id: CustomerTab; label: string }[] = [
    { id: 'overview', label: 'Everything' },
    { id: 'quote', label: 'Send quote' },
    { id: 'invoice', label: 'Send invoice' },
    { id: 'email', label: 'Send email' }
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <section className="rounded-[2rem] border border-forest-100 bg-white p-4 shadow-soft sm:p-5">
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-forest-700" htmlFor="customer-search">
          Find a customer
        </label>
        <input
          className={fieldClass}
          id="customer-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, email, phone, or account"
          type="search"
          value={query}
        />
        <p className="mt-3 text-sm text-forest-700">
          {busy === 'list' ? 'Loading customers…' : `${filtered.length} customer${filtered.length === 1 ? '' : 's'}`}
        </p>
        <ul className="mt-3 max-h-[36rem] space-y-2 overflow-y-auto">
          {filtered.map((row) => {
            const active = selectedEmail === row.email
            return (
              <li key={row.email}>
                <button
                  className={cx(
                    'w-full rounded-2xl border px-4 py-3 text-left transition',
                    active ? 'border-forest-900 bg-forest-900 text-white' : 'border-forest-100 bg-offwhite text-forest-950 hover:border-forest-300'
                  )}
                  onClick={() => {
                    setSelectedEmail(row.email)
                    setName(row.name)
                    setPhone(row.phone)
                    setTab('overview')
                    setNotice(null)
                    setError(null)
                  }}
                  type="button"
                >
                  <span className="block text-base font-semibold">{row.name || 'Guest'}</span>
                  <span className={cx('mt-0.5 block text-sm', active ? 'text-emerald-100' : 'text-forest-700')}>{row.email}</span>
                  <span className={cx('mt-1 block text-xs', active ? 'text-emerald-100' : 'text-forest-600')}>
                    {row.accountReference || 'No account number'} · {row.enquiryCount} form{row.enquiryCount === 1 ? '' : 's'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="min-w-0 rounded-[2rem] border border-forest-100 bg-white p-5 shadow-soft sm:p-7">
        {!selectedEmail ? (
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest-950">Customers</h2>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-forest-800">
              Pick someone on the left. You will see their quotes, invoices, and payments, and you can email a quote or an invoice from the tabs.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Customer</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-forest-950">{detail?.customer.name || name || 'Guest'}</h2>
            <p className="mt-1 text-base text-forest-800">{selectedEmail}</p>
            <p className="text-sm text-forest-700">
              {detail?.customer.phone || phone || 'No phone'} · {detail?.customer.accountReference || 'No account number'}
            </p>

            <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Customer actions">
              {tabs.map((item) => (
                <button
                  aria-selected={tab === item.id}
                  className={cx(
                    'min-h-11 rounded-full px-4 py-2 text-sm font-bold',
                    tab === item.id ? 'bg-forest-900 text-white' : 'bg-offwhite text-forest-900 ring-1 ring-forest-200'
                  )}
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  role="tab"
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950" role="alert">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950" role="status">
                {notice}
              </p>
            ) : null}
            {detail?.migrationNeeded ? (
              <p className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                Run supabase/migrations/20261110150000_desk_quotes.sql in the Supabase SQL editor before sending quotes or invoices.
              </p>
            ) : null}

            {tab === 'overview' ? (
              <div className="mt-6 space-y-6">
                <RecordList
                  empty="No quotes or invoices sent from this desk yet."
                  rows={(detail?.documents ?? []).map((row) => ({
                    id: row.id,
                    title: `${row.kind === 'invoice' ? 'Invoice' : row.kind === 'note' ? 'Email' : 'Quote'} · ${row.reference_code}`,
                    meta: `${row.title} · ${row.amount_cents ? eur(row.amount_cents) : 'No price'} · ${row.status} · ${when(row.created_at)}`
                  }))}
                  title="Quotes, invoices, and emails"
                />
                <RecordList
                  empty="No trip invoices on their account yet."
                  rows={(detail?.invoices ?? []).map((row) => ({
                    id: row.id,
                    title: row.invoice_number,
                    meta: `${eur(row.amount_cents)} · ${row.status} · ${row.enquiry_reference_id || 'Trip'} · ${when(row.paid_at || row.created_at)}`
                  }))}
                  title="Payments due"
                />
                <RecordList
                  empty="No transfer payments for this email yet."
                  rows={(detail?.payments ?? []).map((row) => ({
                    id: row.id,
                    title: [row.pickup_label, row.dropoff_label].filter(Boolean).join(' → ') || 'Transfer',
                    meta: `${row.payment_status || 'unpaid'} · ${typeof row.admin_price_eur === 'number' ? `€${row.admin_price_eur}` : 'No price'} · received ${typeof row.amount_received_eur === 'number' ? `€${row.amount_received_eur}` : '€0'} · ${when(row.created_at)}`
                  }))}
                  title="Transfer payments"
                />
                <RecordList
                  empty="No website forms for this email."
                  rows={(detail?.enquiries ?? []).map((row) => ({
                    id: row.id,
                    title: row.reference_id,
                    meta: `${row.interest || 'Website form'} · ${when(row.created_at)}`
                  }))}
                  title="Website forms"
                />
              </div>
            ) : null}

            {tab === 'quote' || tab === 'invoice' || tab === 'email' ? (
              <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  void send(tab === 'quote' ? 'send-quote' : tab === 'invoice' ? 'send-invoice' : 'send-note')
                }}
              >
                <p className="text-base leading-relaxed text-forest-800">
                  {tab === 'quote'
                    ? 'They get a PDF quote with Accept and Decline. Accept emails them a Pay now button. Decline emails a seven-day price hold and a WhatsApp reply.'
                    : tab === 'invoice'
                      ? 'They get a PDF invoice and an email button that opens card payment.'
                      : 'A short Golf Sol email. A PDF copy of the note is attached.'}
                </p>
                <label className="block text-sm font-bold text-forest-900">
                  Name
                  <input className={fieldClass} onChange={(event) => setName(event.target.value)} value={name} />
                </label>
                <label className="block text-sm font-bold text-forest-900">
                  Phone
                  <input className={fieldClass} onChange={(event) => setPhone(event.target.value)} value={phone} />
                </label>
                {tab !== 'email' ? (
                  <>
                    <label className="block text-sm font-bold text-forest-900">
                      What it is for
                      <input className={fieldClass} onChange={(event) => setTitle(event.target.value)} value={title} />
                    </label>
                    <label className="block text-sm font-bold text-forest-900">
                      Total (EUR)
                      <input className={fieldClass} inputMode="decimal" onChange={(event) => setAmount(event.target.value)} value={amount} />
                    </label>
                  </>
                ) : (
                  <label className="block text-sm font-bold text-forest-900">
                    Subject
                    <input className={fieldClass} onChange={(event) => setSubject(event.target.value)} value={subject} />
                  </label>
                )}
                <label className="block text-sm font-bold text-forest-900">
                  {tab === 'email' ? 'Message' : 'Note on the PDF and in the email'}
                  <textarea className={cx(fieldClass, 'min-h-28')} onChange={(event) => setSummary(event.target.value)} value={summary} />
                </label>
                <LuxuryButton disabled={Boolean(busy)} type="submit">
                  {busy?.startsWith('send')
                    ? 'Sending…'
                    : tab === 'quote'
                      ? 'Send quote'
                      : tab === 'invoice'
                        ? 'Send invoice'
                        : 'Send email'}
                </LuxuryButton>
              </form>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}

function RecordList(props: {
  readonly title: string
  readonly empty: string
  readonly rows: readonly { id: string; title: string; meta: string }[]
}) {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold text-forest-950">{props.title}</h3>
      {props.rows.length === 0 ? (
        <p className="mt-2 text-sm text-forest-700">{props.empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-forest-100 rounded-2xl border border-forest-100">
          {props.rows.map((row) => (
            <li className="px-4 py-3" key={row.id}>
              <p className="font-semibold text-forest-950">{row.title}</p>
              <p className="text-sm text-forest-700">{row.meta}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
