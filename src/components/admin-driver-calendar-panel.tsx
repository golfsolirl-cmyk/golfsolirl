import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuxuryButton } from './ui/button'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { useAuth } from '../providers/auth-provider'

type BookingRow = {
  id: string
  service_day: string
  customer_name: string
  customer_email: string
  customer_phone: string
  reference_id: string | null
  notes: string | null
  created_at: string
}

type CalendarGridCell = { kind: 'blank' } | { kind: 'day'; iso: string; n: number }

type TransferMonthRow = {
  scheduled_at: string
  admin_price_eur: number | null
  status: string | null
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function isoFromYmd(y: number, m0: number, d: number) {
  return `${y}-${pad2(m0 + 1)}-${pad2(d)}`
}

function daysInMonth(y: number, m0: number) {
  return new Date(y, m0 + 1, 0).getDate()
}

function weekdayLabels() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
}

/** Align transfer counts with calendar cells (Costa ops day = Europe/Madrid civil date). */
function serviceDayKeyMadrid(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' })
  } catch {
    return iso.slice(0, 10)
  }
}

const formatEurCompact = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

/** Monday-based week index (0 = Mon) for first of month */
function mondayOffset(y: number, m0: number) {
  const js = new Date(y, m0, 1).getDay()
  return (js + 6) % 7
}

/** Row with no customer / ref on file — used only to block the website diary. */
function isWebsiteCapacityBlockRow(r: BookingRow): boolean {
  return (
    !r.customer_name?.trim() &&
    !r.customer_email?.trim() &&
    !r.customer_phone?.trim() &&
    !r.reference_id?.trim()
  )
}

export function AdminDriverCalendarPanel() {
  const { session, profile, isLoading } = useAuth()
  const [cursor, setCursor] = useState(() => {
    const n = new Date()
    return { y: n.getFullYear(), m0: n.getMonth() }
  })
  const [rows, setRows] = useState<BookingRow[]>([])
  const [transferMonthRows, setTransferMonthRows] = useState<TransferMonthRow[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [selectedIso, setSelectedIso] = useState<string | null>(null)
  const [formDay, setFormDay] = useState('')
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formRef, setFormRef] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [hideCollectionOnWebsite, setHideCollectionOnWebsite] = useState(false)
  const [hideCollectionLoaded, setHideCollectionLoaded] = useState(false)
  const [hideCollectionBusy, setHideCollectionBusy] = useState(false)
  const [hideCollectionError, setHideCollectionError] = useState<string | null>(null)

  const isAdmin = profile?.role === 'admin'

  const monthLabel = useMemo(
    () =>
      new Date(cursor.y, cursor.m0, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric'
      }),
    [cursor.y, cursor.m0]
  )

  const load = useCallback(async () => {
    if (!session || !isAdmin) {
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setLoadError('Supabase is not configured.')
      return
    }
    setLoadError(null)
    const from = isoFromYmd(cursor.y, cursor.m0, 1)
    const dim = daysInMonth(cursor.y, cursor.m0)
    const to = isoFromYmd(cursor.y, cursor.m0, dim)
    const nextMonthStart =
      cursor.m0 === 11 ? isoFromYmd(cursor.y + 1, 0, 1) : isoFromYmd(cursor.y, cursor.m0 + 1, 1)
    const rangeStartUtc = `${from}T00:00:00.000Z`
    const rangeEndUtcExclusive = `${nextMonthStart}T00:00:00.000Z`

    const [dayRes, tbRes] = await Promise.all([
      supabase
        .from('driver_calendar_bookings')
        .select('id, service_day, customer_name, customer_email, customer_phone, reference_id, notes, created_at')
        .gte('service_day', from)
        .lte('service_day', to)
        .order('service_day', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase
        .from('transfer_bookings')
        .select('scheduled_at, admin_price_eur, status')
        .not('scheduled_at', 'is', null)
        .gte('scheduled_at', rangeStartUtc)
        .lt('scheduled_at', rangeEndUtcExclusive)
    ])

    const { data, error } = dayRes

    if (tbRes.error) {
      if (!tbRes.error.message.includes('does not exist') && tbRes.error.code !== '42P01') {
        /* non-fatal: diary still loads */
      }
      setTransferMonthRows([])
    } else {
      setTransferMonthRows((tbRes.data ?? []) as TransferMonthRow[])
    }

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        setLoadError(
          'Table driver_calendar_bookings is missing. Apply supabase/migrations/20260501130000_driver_calendar_bookings.sql (or run-in-sql-editor-driver-calendar-bookings.sql).'
        )
      } else {
        setLoadError(error.message)
      }
      setRows([])
      return
    }
    setRows((data ?? []) as BookingRow[])
  }, [session, isAdmin, cursor.y, cursor.m0])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!session || !isAdmin) {
      return
    }
    let cancelled = false
    ;(async () => {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) {
        return
      }
      const { data, error } = await supabase.from('transport_form_public_flags').select('hide_collection_datetime').eq('id', 1).maybeSingle()
      if (cancelled) {
        return
      }
      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          setHideCollectionError(
            'Table transport_form_public_flags is missing. Apply supabase/migrations/20260501141500_transport_form_public_flags.sql.'
          )
        } else {
          setHideCollectionError(error.message)
        }
        setHideCollectionLoaded(true)
        return
      }
      setHideCollectionOnWebsite(Boolean(data?.hide_collection_datetime))
      setHideCollectionLoaded(true)
      setHideCollectionError(null)
    })()
    return () => {
      cancelled = true
    }
  }, [session, isAdmin])

  const toggleHideCollection = async () => {
    setHideCollectionError(null)
    if (!session || !isAdmin) {
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setHideCollectionError('Supabase is not configured.')
      return
    }
    const next = !hideCollectionOnWebsite
    setHideCollectionBusy(true)
    const { error } = await supabase
      .from('transport_form_public_flags')
      .update({ hide_collection_datetime: next, updated_at: new Date().toISOString() })
      .eq('id', 1)
    setHideCollectionBusy(false)
    if (error) {
      setHideCollectionError(error.message)
      return
    }
    setHideCollectionOnWebsite(next)
  }

  const byDay = useMemo(() => {
    const m = new Map<string, BookingRow[]>()
    for (const r of rows) {
      const k = r.service_day.slice(0, 10)
      const arr = m.get(k) ?? []
      arr.push(r)
      m.set(k, arr)
    }
    return m
  }, [rows])

  const transferAggByDay = useMemo(() => {
    const m = new Map<string, { count: number; sumEur: number }>()
    for (const r of transferMonthRows) {
      if (!r.scheduled_at) {
        continue
      }
      if ((r.status ?? '').toLowerCase() === 'cancelled') {
        continue
      }
      const k = serviceDayKeyMadrid(r.scheduled_at)
      const cur = m.get(k) ?? { count: 0, sumEur: 0 }
      cur.count += 1
      const p = r.admin_price_eur
      if (typeof p === 'number' && Number.isFinite(p)) {
        cur.sumEur += p
      }
      m.set(k, cur)
    }
    return m
  }, [transferMonthRows])

  const selectedBookings = selectedIso ? (byDay.get(selectedIso) ?? []) : []

  const gridCells = useMemo(() => {
    const dim = daysInMonth(cursor.y, cursor.m0)
    const offset = mondayOffset(cursor.y, cursor.m0)
    const cells: CalendarGridCell[] = []
    for (let i = 0; i < offset; i += 1) {
      cells.push({ kind: 'blank' })
    }
    for (let d = 1; d <= dim; d += 1) {
      cells.push({ kind: 'day', iso: isoFromYmd(cursor.y, cursor.m0, d), n: d })
    }
    while (cells.length % 7 !== 0) {
      cells.push({ kind: 'blank' })
    }
    return cells
  }, [cursor.y, cursor.m0])

  const prevMonth = () => {
    setCursor((c) => {
      if (c.m0 === 0) {
        return { y: c.y - 1, m0: 11 }
      }
      return { y: c.y, m0: c.m0 - 1 }
    })
    setSelectedIso(null)
  }

  const nextMonth = () => {
    setCursor((c) => {
      if (c.m0 === 11) {
        return { y: c.y + 1, m0: 0 }
      }
      return { y: c.y, m0: c.m0 + 1 }
    })
    setSelectedIso(null)
  }

  const handleQuickBlockDay = async () => {
    setFormMessage(null)
    if (!session || !isAdmin) {
      return
    }
    const day = (formDay || selectedIso || '').trim().slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      setFormMessage('Pick a date on the calendar or set the service day first.')
      return
    }
    const existing = byDay.get(day) ?? []
    if (existing.length > 0) {
      setFormMessage(
        'This date already has a calendar row, so transfers are already blocked on the website for that day. Add details below if you need a printable run sheet.'
      )
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setFormMessage('Supabase is not configured.')
      return
    }
    setBusy(true)
    const { error } = await supabase.from('driver_calendar_bookings').insert({
      service_day: day,
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      reference_id: null,
      notes: 'Website diary: fully booked (no customer record — admin capacity block).'
    })
    setBusy(false)
    if (error) {
      setFormMessage(error.message)
      return
    }
    setFormMessage('Saved — that day is blocked on public forms and appears in the “fully booked” notice before customers submit.')
    setSelectedIso(day)
    await load()
  }

  const handleAdd = async () => {
    setFormMessage(null)
    if (!session || !isAdmin) {
      return
    }
    const day = (formDay || selectedIso || '').trim().slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      setFormMessage('Pick a valid service day (yyyy-mm-dd).')
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setFormMessage('Supabase is not configured.')
      return
    }
    setBusy(true)
    const { error } = await supabase.from('driver_calendar_bookings').insert({
      service_day: day,
      customer_name: formName.trim(),
      customer_email: formEmail.trim(),
      customer_phone: formPhone.trim(),
      reference_id: formRef.trim() || null,
      notes: formNotes.trim() || null
    })
    setBusy(false)
    if (error) {
      setFormMessage(error.message)
      return
    }
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormRef('')
    setFormNotes('')
    setFormMessage('Saved — that day is now blocked on public forms.')
    setSelectedIso(day)
    await load()
  }

  const handleDelete = async (id: string) => {
    if (!session || !isAdmin) {
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }
    if (!window.confirm('Remove this booking row? The day may become available if no other rows remain.')) {
      return
    }
    setBusy(true)
    const { error } = await supabase.from('driver_calendar_bookings').delete().eq('id', id)
    setBusy(false)
    if (error) {
      setFormMessage(error.message)
      return
    }
    await load()
  }

  const handleClearBookedDay = async () => {
    setFormMessage(null)
    if (!session || !isAdmin || !selectedIso) {
      return
    }
    if (selectedBookings.length === 0) {
      return
    }
    const dayLabel = new Date(`${selectedIso}T12:00:00`).toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    if (
      !window.confirm(
        `Remove all ${selectedBookings.length} booking row(s) for ${dayLabel}? The website will allow new enquiries on this date again.`
      )
    ) {
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setFormMessage('Supabase is not configured.')
      return
    }
    setBusy(true)
    const { error } = await supabase.from('driver_calendar_bookings').delete().eq('service_day', selectedIso)
    setBusy(false)
    if (error) {
      setFormMessage(error.message)
      return
    }
    setFormMessage('This day is open again on all public forms.')
    await load()
  }

  const printSelected = () => {
    window.print()
  }

  if (isLoading || !session) {
    return null
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6 print:block">
      <div className="rounded-[2rem] border border-forest-100 bg-offwhite/40 p-5 shadow-soft print:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Transport enquiry page</p>
        <p className="mt-2 max-w-2xl text-sm text-forest-700">
          When you are very busy, hide the collection date and time field on the public transport form. Customers still choose trip
          timing and travel dates; collection is confirmed by phone or message instead.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <LuxuryButton
            disabled={!hideCollectionLoaded || hideCollectionBusy}
            onClick={() => void toggleHideCollection()}
            type="button"
            variant={hideCollectionOnWebsite ? 'primary' : 'outline'}
          >
            {hideCollectionBusy ? 'Saving…' : hideCollectionOnWebsite ? 'Collection picker is hidden — click to show again' : 'Hide collection date & time on website'}
          </LuxuryButton>
          {hideCollectionLoaded ? (
            <span className="text-sm font-medium text-forest-800">
              {hideCollectionOnWebsite ? 'Hidden on live site' : 'Visible on live site'}
            </span>
          ) : null}
        </div>
        {hideCollectionError ? (
          <p className="mt-3 text-sm text-brand-900" role="alert">
            {hideCollectionError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-2">
          <LuxuryButton
            className="!border-fairway-600 !bg-fairway-50 !text-fairway-800 shadow-none hover:!translate-y-0 hover:!border-fairway-700 hover:!bg-fairway-100 hover:!text-fairway-900 px-5 py-2.5 text-sm"
            onClick={prevMonth}
            type="button"
            variant="white"
          >
            Previous
          </LuxuryButton>
          <p className="min-w-[10rem] text-center font-display text-lg font-semibold text-fairway-800">{monthLabel}</p>
          <LuxuryButton
            className="!border-fairway-600 !bg-fairway-50 !text-fairway-800 shadow-none hover:!translate-y-0 hover:!border-fairway-700 hover:!bg-fairway-100 hover:!text-fairway-900 px-5 py-2.5 text-sm"
            onClick={nextMonth}
            type="button"
            variant="white"
          >
            Next
          </LuxuryButton>
        </div>
        <LuxuryButton disabled={!selectedIso || selectedBookings.length === 0} onClick={printSelected} type="button" variant="secondary">
          Print day sheet
        </LuxuryButton>
      </div>

      <p className="max-w-3xl text-xs text-forest-600 print:hidden">
        <span className="font-semibold text-forest-800">Transfer pipeline</span> (below): day cells show scheduled runs with a pick-up
        on that date in <span className="font-medium">Europe/Madrid</span> and the sum of saved <span className="font-medium">quoted EUR</span>{' '}
        (excludes cancelled). Diary &quot;Booked&quot; rows are separate website capacity blocks.
      </p>

      {loadError ? (
        <div className="rounded-2xl border border-chrome-200 bg-chrome-50/90 px-4 py-3 text-sm text-brand-950" role="alert">
          {loadError}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-forest-100 bg-white p-4 shadow-soft print:border-0 print:shadow-none">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-600 print:hidden">
          {weekdayLabels().map((w) => (
            <div className="py-2" key={w}>
              {w}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1 print:mt-0">
          {gridCells.map((cell, idx) => {
            if (cell.kind === 'blank') {
              return <div className="min-h-[3rem] rounded-xl bg-offwhite/40 print:min-h-0" key={`b-${idx}`} />
            }
            const has = (byDay.get(cell.iso)?.length ?? 0) > 0
            const trAgg = transferAggByDay.get(cell.iso)
            const sel = selectedIso === cell.iso
            return (
              <button
                className={`min-h-[3rem] rounded-xl border px-1 py-2 text-left text-sm transition-colors print:hidden ${
                  sel
                    ? 'border-fairway-500 bg-fairway-50 text-forest-950'
                    : has
                      ? 'border-brand-300 bg-brand-50/80 text-forest-900 hover:border-fairway-400'
                      : 'border-forest-100 bg-offwhite/60 text-forest-700 hover:border-fairway-300'
                }`}
                key={cell.iso}
                onClick={() => {
                  setSelectedIso(cell.iso)
                  setFormDay(cell.iso)
                  setFormMessage(null)
                }}
                type="button"
              >
                <span className="block font-semibold">{cell.n}</span>
                {has ? <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-brand-700">Booked</span> : null}
                {trAgg && trAgg.count > 0 ? (
                  <span className="mt-0.5 block text-[9px] font-semibold leading-tight text-fairway-900">
                    {trAgg.count} run{trAgg.count === 1 ? '' : 's'}
                    {trAgg.sumEur > 0 ? ` · ${formatEurCompact(trAgg.sumEur)}` : ''}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="mt-6 border-t border-forest-100 pt-6 print:mt-4 print:border-t-0 print:pt-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:block">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600 print:text-sm">
              {selectedIso
                ? `Bookings — ${new Date(`${selectedIso}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}`
                : 'Select a date on the calendar'}
            </p>
            {selectedIso && selectedBookings.length > 0 ? (
              <LuxuryButton
                className="print:hidden sm:ml-4 sm:shrink-0 !text-fairway-700 hover:!text-fairway-800"
                disabled={busy}
                onClick={() => void handleClearBookedDay()}
                type="button"
                variant="white"
              >
                Open day for website
              </LuxuryButton>
            ) : null}
          </div>

          {selectedBookings.length === 0 && selectedIso ? (
            <div className="mt-3 space-y-3 rounded-2xl border border-fairway-200 bg-fairway-50/50 px-4 py-3 print:hidden">
              <p className="text-sm text-forest-700">
                No diary row yet — the website still allows transfer enquiries on this date. Use a quick block if you are at capacity but
                do not have a booking to attach, or add a full row with customer details for the printable day sheet.
              </p>
              <LuxuryButton disabled={busy} onClick={() => void handleQuickBlockDay()} type="button" variant="primary">
                {busy ? 'Saving…' : 'Block transfers on website (no customer details)'}
              </LuxuryButton>
            </div>
          ) : null}

          <ul className="mt-3 space-y-3 print:block">
            {selectedBookings.map((b) => (
              <li
                className="rounded-2xl border border-forest-100 bg-offwhite/80 px-4 py-3 text-sm text-forest-900 print:break-inside-avoid"
                key={b.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    {isWebsiteCapacityBlockRow(b) ? (
                      <p className="font-semibold text-forest-950">
                        Website capacity block <span className="font-normal text-forest-600">(no customer on file)</span>
                      </p>
                    ) : (
                      <p className="font-semibold text-forest-950">{b.customer_name || '—'}</p>
                    )}
                    {!isWebsiteCapacityBlockRow(b) ? (
                      <>
                        <p className="break-all text-forest-800">{b.customer_email || '—'}</p>
                        <p>{b.customer_phone || '—'}</p>
                      </>
                    ) : null}
                    {b.reference_id ? <p className="font-mono text-xs">Ref {b.reference_id}</p> : null}
                    {b.notes ? <p className="whitespace-pre-wrap text-forest-700">{b.notes}</p> : null}
                  </div>
                  <LuxuryButton
                    className="print:hidden"
                    disabled={busy}
                    onClick={() => void handleDelete(b.id)}
                    type="button"
                    variant="outline"
                  >
                    Remove
                  </LuxuryButton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft print:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Add booking or block a day</p>
        <p className="mt-2 max-w-2xl text-sm text-forest-600">
          One row on a date is enough: public enquiry forms load that date as <strong className="font-medium text-forest-800">fully booked</strong> and show a notice before submit. Customer fields can stay empty for a capacity-only block — or use{' '}
          <strong className="font-medium text-forest-800">Block transfers on website</strong> above after selecting a day.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-1">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">Service day</span>
            <input
              className="w-full rounded-xl border border-forest-200 px-3 py-2.5 text-sm text-forest-900"
              onChange={(e) => setFormDay(e.target.value)}
              type="date"
              value={formDay || selectedIso || ''}
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">Reference (optional)</span>
            <input
              className="w-full rounded-xl border border-forest-200 px-3 py-2.5 font-mono text-sm text-forest-900"
              onChange={(e) => setFormRef(e.target.value)}
              placeholder="GSI-…"
              type="text"
              value={formRef}
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">Customer name (optional)</span>
            <input
              className="w-full rounded-xl border border-forest-200 px-3 py-2.5 text-sm text-forest-900"
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Leave blank for diary-only block"
              type="text"
              value={formName}
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">Email (optional)</span>
            <input
              className="w-full rounded-xl border border-forest-200 px-3 py-2.5 text-sm text-forest-900"
              onChange={(e) => setFormEmail(e.target.value)}
              type="email"
              value={formEmail}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">Phone (optional)</span>
            <input
              className="w-full rounded-xl border border-forest-200 px-3 py-2.5 text-sm text-forest-900"
              onChange={(e) => setFormPhone(e.target.value)}
              type="tel"
              value={formPhone}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">Notes (printable)</span>
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-forest-200 px-3 py-2.5 text-sm text-forest-900"
              onChange={(e) => setFormNotes(e.target.value)}
              value={formNotes}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <LuxuryButton disabled={busy} onClick={() => void handleAdd()} type="button" variant="primary">
            {busy ? 'Saving…' : 'Save row (blocks website even with empty customer fields)'}
          </LuxuryButton>
          <LuxuryButton
            disabled={busy || !(formDay || selectedIso || '').trim()}
            onClick={() => void handleQuickBlockDay()}
            type="button"
            variant="outline"
          >
            Quick block from date field only
          </LuxuryButton>
        </div>
        {formMessage ? (
          <p className="mt-3 text-sm font-medium text-forest-800" role="status">
            {formMessage}
          </p>
        ) : null}
      </div>
    </div>
  )
}
