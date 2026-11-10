import { useCallback, useEffect, useId, useMemo, useState } from 'react'
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

type DeskLine = {
  id: string
  service: 'transfer' | 'golf' | 'accommodation' | 'other'
  detail: string
  when: string
  quantity: string
}

type DeskTrip = {
  golfers: string
  guests: string
  dateFrom: string
  dateTo: string
  pickup: string
  dropoff: string
  transferWhen: string
  transferNotes: string
  courses: string
  rounds: string
  golfNotes: string
  hotel: string
  nights: string
  stayNotes: string
  lines?: DeskLine[]
}

type DocumentRow = {
  id: string
  kind: string
  reference_code: string
  title: string
  amount_cents: number
  status: string
  created_at: string
  trip_details?: DeskTrip | null
}

const emptyTrip = (): DeskTrip => ({
  golfers: '',
  guests: '',
  dateFrom: '',
  dateTo: '',
  pickup: '',
  dropoff: '',
  transferWhen: '',
  transferNotes: '',
  courses: '',
  rounds: '',
  golfNotes: '',
  hotel: '',
  nights: '',
  stayNotes: ''
})

const newLine = (): DeskLine => ({
  id: `line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  service: 'transfer',
  detail: '',
  when: '',
  quantity: ''
})

const tripSnippet = (trip: DeskTrip | null | undefined) => {
  if (!trip) return ''
  const golfers = String(trip.golfers || '').trim()
  const from = String(trip.dateFrom || '').trim()
  const to = String(trip.dateTo || '').trim()
  const dates = from && to ? `${from} to ${to}` : from || to
  return [golfers ? `${golfers} golfers` : '', dates].filter(Boolean).join(' · ')
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
  const [trip, setTrip] = useState<DeskTrip>(emptyTrip)
  const [lines, setLines] = useState<DeskLine[]>([])
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
    setTrip(emptyTrip())
    setLines([])
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
        amountEur: amount,
        trip:
          action === 'send-note'
            ? undefined
            : {
                ...trip,
                lines: lines.map(({ service, detail, when: lineWhen, quantity }) => ({
                  service,
                  detail,
                  when: lineWhen,
                  quantity
                }))
              }
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
                    setTrip(emptyTrip())
                    setLines([])
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
                    meta: [row.title, tripSnippet(row.trip_details), row.amount_cents ? eur(row.amount_cents) : 'No price', row.status, when(row.created_at)]
                      .filter(Boolean)
                      .join(' · ')
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
                    ? 'They get a PDF quote with Accept and Decline. Add the golfers, dates, transfers, courses, and stay — those lines go on the PDF and in the email. Accept emails them a Pay now button. Decline emails a seven-day price hold and a WhatsApp reply.'
                    : tab === 'invoice'
                      ? 'They get a PDF invoice and an email button that opens card payment. The booking details below are printed on the PDF and in the email.'
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
                    <BookingDetailsFields
                      lines={lines}
                      onLines={setLines}
                      onTrip={(patch) => setTrip((current) => ({ ...current, ...patch }))}
                      trip={trip}
                    />
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

function Field(props: {
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly type?: string
  readonly placeholder?: string
  readonly min?: string
}) {
  const id = useId()
  return (
    <label className="block text-sm font-bold text-forest-900" htmlFor={id}>
      {props.label}
      <input
        className={fieldClass}
        id={id}
        min={props.min}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
        type={props.type || 'text'}
        value={props.value}
      />
    </label>
  )
}

function AreaField(props: {
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
}) {
  const id = useId()
  return (
    <label className="block text-sm font-bold text-forest-900 sm:col-span-2" htmlFor={id}>
      {props.label}
      <textarea
        className={cx(fieldClass, 'min-h-24')}
        id={id}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
        value={props.value}
      />
    </label>
  )
}

function BookingDetailsFields(props: {
  readonly trip: DeskTrip
  readonly lines: readonly DeskLine[]
  readonly onTrip: (patch: Partial<DeskTrip>) => void
  readonly onLines: (lines: DeskLine[]) => void
}) {
  const { trip, lines, onTrip, onLines } = props
  return (
    <div className="space-y-5 rounded-[1.5rem] border border-forest-100 bg-[#f7f4ec] p-4 sm:p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-700">Booking details</p>
        <p className="mt-1 text-sm leading-relaxed text-forest-800">
          Same kind of detail a guest puts on a quote form. Blank sections are left off the PDF.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Golfers" min="1" onChange={(value) => onTrip({ golfers: value })} placeholder="8" type="number" value={trip.golfers} />
        <Field label="Other guests" min="0" onChange={(value) => onTrip({ guests: value })} placeholder="2" type="number" value={trip.guests} />
        <Field label="Arrival" onChange={(value) => onTrip({ dateFrom: value })} type="date" value={trip.dateFrom} />
        <Field label="Departure" onChange={(value) => onTrip({ dateTo: value })} type="date" value={trip.dateTo} />
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-lg font-semibold text-forest-950">Transfers</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pickup" onChange={(value) => onTrip({ pickup: value })} placeholder="Málaga Airport, Terminal 3" value={trip.pickup} />
          <Field label="Drop-off" onChange={(value) => onTrip({ dropoff: value })} placeholder="Hotel Finca Cortesin" value={trip.dropoff} />
          <Field
            label="When"
            onChange={(value) => onTrip({ transferWhen: value })}
            placeholder="Tue 14 Apr, flight EI582 at 11:40"
            value={trip.transferWhen}
          />
          <AreaField
            label="Transfer notes"
            onChange={(value) => onTrip({ transferNotes: value })}
            placeholder="Return transfer Sunday 10:00. Golf bags. One van."
            value={trip.transferNotes}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-lg font-semibold text-forest-950">Golf courses</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rounds" min="1" onChange={(value) => onTrip({ rounds: value })} placeholder="4" type="number" value={trip.rounds} />
          <AreaField
            label="Courses"
            onChange={(value) => onTrip({ courses: value })}
            placeholder="Finca Cortesin, Valderrama, Flamingos"
            value={trip.courses}
          />
          <AreaField
            label="Tee times and notes"
            onChange={(value) => onTrip({ golfNotes: value })}
            placeholder="Morning tee times. Buggies for the group."
            value={trip.golfNotes}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-lg font-semibold text-forest-950">Accommodation</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hotel or resort" onChange={(value) => onTrip({ hotel: value })} placeholder="Finca Cortesin, Casares" value={trip.hotel} />
          <Field label="Nights" min="1" onChange={(value) => onTrip({ nights: value })} placeholder="5" type="number" value={trip.nights} />
          <AreaField
            label="Stay notes"
            onChange={(value) => onTrip({ stayNotes: value })}
            placeholder="4 twin rooms, bed and breakfast, near the first tee."
            value={trip.stayNotes}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-lg font-semibold text-forest-950">More bookings</h3>
        <p className="text-sm text-forest-800">Add another transfer, round, or stay if this quote covers more than one.</p>
        {lines.map((line, index) => (
          <div className="grid gap-3 rounded-2xl border border-forest-100 bg-white p-3 sm:grid-cols-2" key={line.id}>
            <label className="block text-sm font-bold text-forest-900">
              Service
              <select
                className={fieldClass}
                onChange={(event) =>
                  onLines(lines.map((row) => (row.id === line.id ? { ...row, service: event.target.value as DeskLine['service'] } : row)))
                }
                value={line.service}
              >
                <option value="transfer">Transfer</option>
                <option value="golf">Golf course</option>
                <option value="accommodation">Accommodation</option>
                <option value="other">Other</option>
              </select>
            </label>
            <Field
              label="When"
              onChange={(value) => onLines(lines.map((row) => (row.id === line.id ? { ...row, when: value } : row)))}
              placeholder="Wed 15 Apr"
              value={line.when}
            />
            <Field
              label="What"
              onChange={(value) => onLines(lines.map((row) => (row.id === line.id ? { ...row, detail: value } : row)))}
              placeholder={index === 0 ? 'Hotel to Valderrama, 08:00' : 'Course, hotel, or route'}
              value={line.detail}
            />
            <Field
              label="How many"
              onChange={(value) => onLines(lines.map((row) => (row.id === line.id ? { ...row, quantity: value } : row)))}
              placeholder="8 golfers"
              value={line.quantity}
            />
            <div className="sm:col-span-2">
              <button
                className="min-h-11 rounded-full px-4 text-sm font-bold text-forest-900 underline-offset-2 hover:underline"
                onClick={() => onLines(lines.filter((row) => row.id !== line.id))}
                type="button"
              >
                Remove this booking
              </button>
            </div>
          </div>
        ))}
        <LuxuryButton
          onClick={() => onLines([...lines, newLine()])}
          type="button"
          variant="outlineOnLight"
        >
          Add a booking
        </LuxuryButton>
      </div>
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
