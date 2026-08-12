import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuxuryButton } from './ui/button'
import { TransferPaymentStatusBadge } from './transfer-payment-status-badge'
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

type TransferCalendarRow = {
  id: string
  scheduled_at: string
  admin_price_eur: number | null
  status: string | null
  payment_status: string | null
  deposit_percent: number | null
  pickup_label: string
  dropoff_label: string
  client_display_name: string | null
  client_email: string | null
  client_phone: string | null
  enquiry_reference_id: string | null
  client_timing_note: string | null
  booking_source: string | null
  next_available_driver: boolean | null
}

type CalendarGridCell = { kind: 'blank' } | { kind: 'day'; iso: string; n: number }

type DayTransferAgg = { depositCount: number; paidCount: number; sumEur: number }

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

const formatTransferWhen = (scheduledAt: string | null | undefined, nextAvailable?: boolean | null) => {
  if (!scheduledAt) {
    return nextAvailable ? 'ASAP · next available driver' : 'Date TBC'
  }
  const d = new Date(scheduledAt)
  if (Number.isNaN(d.getTime())) {
    return 'Date TBC'
  }
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' })
}

const formatSelectedDayLabel = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

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
  const [transferMonthRows, setTransferMonthRows] = useState<TransferCalendarRow[]>([])
  const [unscheduledPaidTransfers, setUnscheduledPaidTransfers] = useState<TransferCalendarRow[]>([])
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
  /** Which full-width close-day action the admin is filling in. */
  const [closeDayIntent, setCloseDayIntent] = useState<'full' | 'print'>('full')
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

    const [dayRes, tbRes, unschedRes] = await Promise.all([
      supabase
        .from('driver_calendar_bookings')
        .select('id, service_day, customer_name, customer_email, customer_phone, reference_id, notes, created_at')
        .gte('service_day', from)
        .lte('service_day', to)
        .order('service_day', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase
        .from('transfer_bookings')
        .select(
          'id, scheduled_at, admin_price_eur, status, payment_status, deposit_percent, pickup_label, dropoff_label, client_display_name, client_email, client_phone, enquiry_reference_id, client_timing_note, booking_source, next_available_driver'
        )
        .in('payment_status', ['deposit', 'paid'])
        .not('scheduled_at', 'is', null)
        .gte('scheduled_at', rangeStartUtc)
        .lt('scheduled_at', rangeEndUtcExclusive),
      supabase
        .from('transfer_bookings')
        .select(
          'id, scheduled_at, admin_price_eur, status, payment_status, deposit_percent, pickup_label, dropoff_label, client_display_name, client_email, client_phone, enquiry_reference_id, client_timing_note, booking_source, next_available_driver'
        )
        .in('payment_status', ['deposit', 'paid'])
        .is('scheduled_at', null)
        .order('updated_at', { ascending: false })
        .limit(24)
    ])

    const { data, error } = dayRes

    if (tbRes.error) {
      if (!tbRes.error.message.includes('does not exist') && tbRes.error.code !== '42P01') {
        /* non-fatal: diary still loads */
      }
      setTransferMonthRows([])
    } else {
      setTransferMonthRows((tbRes.data ?? []) as TransferCalendarRow[])
    }

    if (unschedRes.error) {
      setUnscheduledPaidTransfers([])
    } else {
      setUnscheduledPaidTransfers((unschedRes.data ?? []) as TransferCalendarRow[])
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
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }
    const channel = supabase
      .channel('admin-driver-calendar-transfers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transfer_bookings' }, () => {
        void load()
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [session, isAdmin, load])

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
    const m = new Map<string, DayTransferAgg>()
    for (const r of transferMonthRows) {
      if (!r.scheduled_at) {
        continue
      }
      if ((r.status ?? '').toLowerCase() === 'cancelled') {
        continue
      }
      const k = serviceDayKeyMadrid(r.scheduled_at)
      const cur = m.get(k) ?? { depositCount: 0, paidCount: 0, sumEur: 0 }
      const pay = (r.payment_status ?? 'unpaid').toLowerCase()
      if (pay === 'deposit') {
        cur.depositCount += 1
      } else if (pay === 'paid') {
        cur.paidCount += 1
      }
      const p = r.admin_price_eur
      if (typeof p === 'number' && Number.isFinite(p)) {
        cur.sumEur += p
      }
      m.set(k, cur)
    }
    return m
  }, [transferMonthRows])

  const transfersByDay = useMemo(() => {
    const m = new Map<string, TransferCalendarRow[]>()
    for (const r of transferMonthRows) {
      if (!r.scheduled_at || (r.status ?? '').toLowerCase() === 'cancelled') {
        continue
      }
      const k = serviceDayKeyMadrid(r.scheduled_at)
      const arr = m.get(k) ?? []
      arr.push(r)
      m.set(k, arr)
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => String(a.scheduled_at).localeCompare(String(b.scheduled_at)))
    }
    return m
  }, [transferMonthRows])

  const selectedTransfers = selectedIso ? (transfersByDay.get(selectedIso) ?? []) : []

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
      setFormMessage('Pick a day first (calendar or date field).')
      return
    }
    const existing = byDay.get(day) ?? []
    if (existing.length > 0) {
      setFormMessage(
        'This day is already Full. To add a printable guest, use choice B. To take bookings again, use Re-open day on the right.'
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
    setFormMessage('Saved — that day is Full on public forms (guests see “fully booked” before submit).')
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
      setFormMessage('Pick a day first (calendar or date field).')
      return
    }
    const name = formName.trim()
    const email = formEmail.trim()
    const phone = formPhone.trim()
    const notes = formNotes.trim()
    if (!name && !email && !phone && !notes && !formRef.trim()) {
      setFormMessage('For a print sheet, add at least a guest name or driver notes. Or use Mark Full (choice A) instead.')
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
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      reference_id: formRef.trim() || null,
      notes: notes || null
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
    setFormMessage('Saved on the day sheet — website also shows this day as Full. Use Print day sheet when ready.')
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
    if (!window.confirm('Remove this day-sheet row? If it’s the last one, the website will take enquiries on that date again.')) {
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
        `Re-open ${dayLabel}? This removes ${selectedBookings.length} day-sheet row(s) and lets the website take that date again.`
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">Busy season shortcut</p>
        <h3 className="mt-1 font-display text-lg font-semibold text-forest-950">Hide pickup time on the website form</h3>
        <p className="mt-1 max-w-2xl text-sm text-forest-600">
          When AGP days are slammed, turn off the collection date/time picker on the public transport form. Guests still
          send trip dates — you confirm exact pickup by phone or message.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <LuxuryButton
            disabled={!hideCollectionLoaded || hideCollectionBusy}
            onClick={() => void toggleHideCollection()}
            type="button"
            variant={hideCollectionOnWebsite ? 'primary' : 'outline'}
          >
            {hideCollectionBusy
              ? 'Saving…'
              : hideCollectionOnWebsite
                ? 'Show pickup time on website again'
                : 'Hide pickup time on website'}
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

      <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-2xl border border-forest-100 bg-white px-4 py-3 text-xs text-forest-700 print:hidden">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm border border-brand-400 bg-brand-50" />
          Paid / deposit run
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm border border-brand-300 bg-brand-50/80" />
          Full on website
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm border border-forest-100 bg-offwhite/60" />
          Open for enquiries
        </span>
        <span className="text-forest-500">Pickup times = Madrid · dep = deposit · paid = paid in full</span>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-chrome-200 bg-chrome-50/90 px-4 py-3 text-sm text-brand-950" role="alert">
          {loadError}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] print:block">
        <div className="space-y-6">
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
            const hasDiary = (byDay.get(cell.iso)?.length ?? 0) > 0
            const trAgg = transferAggByDay.get(cell.iso)
            const hasTransfers = Boolean(trAgg && (trAgg.depositCount > 0 || trAgg.paidCount > 0))
            const sel = selectedIso === cell.iso
            return (
              <button
                className={`min-h-[4rem] rounded-xl border px-1 py-2 text-left text-sm transition-colors print:hidden ${
                  sel
                    ? 'border-fairway-500 bg-fairway-50 text-forest-950 ring-2 ring-fairway-300/50'
                    : hasTransfers
                      ? 'border-brand-400 bg-brand-50/90 text-forest-900 hover:border-fairway-400'
                      : hasDiary
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
                {hasDiary ? (
                  <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-brand-700">Full</span>
                ) : null}
                {hasTransfers && trAgg ? (
                  <span className="mt-0.5 block text-[9px] font-semibold leading-tight text-fairway-900">
                    {trAgg.depositCount > 0 ? `${trAgg.depositCount} dep` : null}
                    {trAgg.depositCount > 0 && trAgg.paidCount > 0 ? ' · ' : null}
                    {trAgg.paidCount > 0 ? `${trAgg.paidCount} paid` : null}
                    {trAgg.sumEur > 0 ? ` · ${formatEurCompact(trAgg.sumEur)}` : ''}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {unscheduledPaidTransfers.length > 0 ? (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-soft print:hidden">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-900">Needs a pickup time</p>
          <p className="mt-1 text-sm text-forest-700">
            Paid or deposit on file, but no scheduled day yet (ASAP / next available). Set the time under Transfers &amp;
            drivers so they appear on this calendar.
          </p>
          <ul className="mt-3 space-y-2">
            {unscheduledPaidTransfers.map((t) => (
              <li className="rounded-xl border border-forest-100 bg-offwhite/70 px-3 py-2 text-sm" key={t.id}>
                <p className="font-semibold text-forest-950">
                  {t.pickup_label} → {t.dropoff_label}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <TransferPaymentStatusBadge deposit_percent={t.deposit_percent} payment_status={t.payment_status} size="sm" />
                  {t.enquiry_reference_id ? (
                    <span className="font-mono text-xs text-forest-600">{t.enquiry_reference_id}</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
        </div>

        <aside className="print:hidden lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-[1.75rem] border border-forest-100 bg-white p-5 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">That day’s runs</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-forest-950">
              {selectedIso ? formatSelectedDayLabel(selectedIso) : 'Pick a date'}
            </h3>
            {!selectedIso ? (
              <p className="mt-3 text-sm leading-relaxed text-forest-600">
                Click a day to see AGP / hotel / course pickups with deposit or paid in full, plus whether the website is
                marked Full.
              </p>
            ) : (
              <div className="mt-4 space-y-5">
                <section>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-fairway-800">
                    On the road ({selectedTransfers.length})
                  </p>
                  {selectedTransfers.length === 0 ? (
                    <p className="mt-2 text-sm text-forest-600">No paid or deposit runs scheduled this Madrid day yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {selectedTransfers.map((t) => (
                        <li className="rounded-2xl border border-forest-100 bg-offwhite/80 px-4 py-3 text-sm" key={t.id}>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="font-semibold leading-snug text-forest-950">
                              {t.pickup_label} → {t.dropoff_label}
                            </p>
                            <TransferPaymentStatusBadge
                              deposit_percent={t.deposit_percent}
                              payment_status={t.payment_status}
                              size="sm"
                            />
                          </div>
                          <p className="mt-2 text-forest-700">{formatTransferWhen(t.scheduled_at, t.next_available_driver)}</p>
                          <p className="mt-2 font-medium text-forest-950">{t.client_display_name?.trim() || '—'}</p>
                          <p className="break-all text-forest-800">{t.client_email?.trim() || '—'}</p>
                          <p className="text-forest-800">{t.client_phone?.trim() || '—'}</p>
                          {t.enquiry_reference_id ? (
                            <p className="mt-2 font-mono text-xs text-forest-700">Ref {t.enquiry_reference_id}</p>
                          ) : null}
                          {typeof t.admin_price_eur === 'number' && Number.isFinite(t.admin_price_eur) ? (
                            <p className="mt-2 text-sm font-semibold text-brand-800">
                              Quoted {formatEurCompact(t.admin_price_eur)}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs uppercase tracking-wide text-forest-500">
                            Ops · {(t.status ?? 'pending').replace(/_/g, ' ')}
                            {t.booking_source ? ` · ${t.booking_source.replace(/_/g, ' ')}` : ''}
                          </p>
                          {t.client_timing_note?.trim() ? (
                            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-white px-3 py-2 text-forest-700 ring-1 ring-forest-100">
                              {t.client_timing_note.trim()}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="border-t border-forest-100 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">
                      Website capacity ({selectedBookings.length})
                    </p>
                    {selectedBookings.length > 0 ? (
                      <LuxuryButton
                        className="!text-fairway-700 hover:!text-fairway-800"
                        disabled={busy}
                        onClick={() => void handleClearBookedDay()}
                        type="button"
                        variant="white"
                      >
                        Re-open day
                      </LuxuryButton>
                    ) : null}
                  </div>
                  {selectedBookings.length === 0 ? (
                    <div className="mt-3 space-y-3 rounded-2xl border border-fairway-200 bg-fairway-50/50 px-4 py-3">
                      <p className="text-sm text-forest-700">
                        Website still takes enquiries for this date. Mark Full when every van is spoken for.
                      </p>
                      <LuxuryButton disabled={busy} onClick={() => void handleQuickBlockDay()} type="button" variant="primary">
                        {busy ? 'Saving…' : 'Mark day Full'}
                      </LuxuryButton>
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {selectedBookings.map((b) => (
                        <li className="rounded-2xl border border-forest-100 bg-offwhite/80 px-4 py-3 text-sm" key={b.id}>
                          <div className="flex flex-col gap-2">
                            <div className="min-w-0 space-y-1">
                              {isWebsiteCapacityBlockRow(b) ? (
                                <p className="font-semibold text-forest-950">Marked Full (no guest row)</p>
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
                            <LuxuryButton disabled={busy} onClick={() => void handleDelete(b.id)} type="button" variant="outline">
                              Remove
                            </LuxuryButton>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            )}
          </div>
        </aside>
      </div>

      <section
        aria-label="Close a day on the website or add a printable guest"
        className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft print:hidden sm:p-8 md:p-10"
      >
        <header className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Step after the calendar</p>
          <h3 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Close a day</h3>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-forest-700">
            <li>Choose the day (click the calendar above, or use the date field).</li>
            <li>Pick what you want to do — stop website bookings, or save a guest for print.</li>
            <li>Press the green button.</li>
          </ol>
        </header>

        <div className="mt-8 rounded-2xl border-2 border-forest-100 bg-offwhite/70 px-5 py-5 sm:px-6">
          <label className="block max-w-sm">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">Day</span>
            <input
              className="w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-3 text-base text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
              onChange={(e) => {
                const v = e.target.value
                setFormDay(v)
                if (v) setSelectedIso(v)
                setFormMessage(null)
              }}
              type="date"
              value={formDay || selectedIso || ''}
            />
          </label>
          <p className="mt-3 text-base font-semibold text-forest-950">
            {(formDay || selectedIso)
              ? formatSelectedDayLabel((formDay || selectedIso || '').slice(0, 10))
              : 'No day selected yet'}
          </p>
        </div>

        <div
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          role="tablist"
          aria-label="What do you want to do?"
        >
          <button
            aria-selected={closeDayIntent === 'full'}
            className={
              closeDayIntent === 'full'
                ? 'rounded-2xl border-2 border-forest-900 bg-forest-900 px-5 py-4 text-left text-white shadow-md'
                : 'rounded-2xl border-2 border-forest-200 bg-white px-5 py-4 text-left text-forest-900 hover:border-fairway-400'
            }
            onClick={() => {
              setCloseDayIntent('full')
              setFormMessage(null)
            }}
            role="tab"
            type="button"
          >
            <span className="block text-sm font-semibold">1 · Stop website bookings</span>
            <span
              className={
                closeDayIntent === 'full' ? 'mt-1 block text-xs text-white/80' : 'mt-1 block text-xs text-forest-600'
              }
            >
              Mark the day Full — no guest details
            </span>
          </button>
          <button
            aria-selected={closeDayIntent === 'print'}
            className={
              closeDayIntent === 'print'
                ? 'rounded-2xl border-2 border-forest-900 bg-forest-900 px-5 py-4 text-left text-white shadow-md'
                : 'rounded-2xl border-2 border-forest-200 bg-white px-5 py-4 text-left text-forest-900 hover:border-fairway-400'
            }
            onClick={() => {
              setCloseDayIntent('print')
              setFormMessage(null)
            }}
            role="tab"
            type="button"
          >
            <span className="block text-sm font-semibold">2 · Guest for Arrivals print</span>
            <span
              className={
                closeDayIntent === 'print' ? 'mt-1 block text-xs text-white/80' : 'mt-1 block text-xs text-forest-600'
              }
            >
              Name, flight notes — also marks Full
            </span>
          </button>
        </div>

        <div className="mt-8 max-w-2xl" role="tabpanel">
          {closeDayIntent === 'full' ? (
            <div className="space-y-5 rounded-2xl border border-forest-100 bg-offwhite/50 px-5 py-6 sm:px-7 sm:py-8">
              <div>
                <p className="text-lg font-semibold text-forest-950">Mark this day Full</p>
                <p className="mt-2 text-sm leading-relaxed text-forest-600">
                  Public forms stop taking that transfer date. Guests see “fully booked”. You do not need a name or phone.
                </p>
              </div>
              <LuxuryButton
                disabled={busy || !(formDay || selectedIso || '').trim()}
                onClick={() => void handleQuickBlockDay()}
                type="button"
                variant="primary"
              >
                {busy ? 'Saving…' : 'Mark day Full'}
              </LuxuryButton>
            </div>
          ) : (
            <div className="space-y-6 rounded-2xl border border-forest-100 bg-offwhite/50 px-5 py-6 sm:px-7 sm:py-8">
              <div>
                <p className="text-lg font-semibold text-forest-950">Add guest to the day sheet</p>
                <p className="mt-2 text-sm leading-relaxed text-forest-600">
                  Saved for Print day sheet at the top. This also marks the day Full on the website.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">
                    Guest name
                  </span>
                  <input
                    className="w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500"
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="As on the booking"
                    type="text"
                    value={formName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">Phone</span>
                  <input
                    className="w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500"
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+353…"
                    type="tel"
                    value={formPhone}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">Email</span>
                  <input
                    className="w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500"
                    onChange={(e) => setFormEmail(e.target.value)}
                    type="email"
                    value={formEmail}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">
                    Account / ref
                  </span>
                  <input
                    className="w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-3 font-mono text-sm text-forest-900 outline-none focus:border-fairway-500"
                    onChange={(e) => setFormRef(e.target.value)}
                    placeholder="GSI-…"
                    type="text"
                    value={formRef}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">
                    Notes for the driver
                  </span>
                  <textarea
                    className="min-h-[100px] w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500"
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Flight EI582 · 3 golf bags · Hotel Sol Timor"
                    value={formNotes}
                  />
                </label>
              </div>
              <LuxuryButton
                disabled={busy || !(formDay || selectedIso || '').trim()}
                onClick={() => void handleAdd()}
                type="button"
                variant="primary"
              >
                {busy ? 'Saving…' : 'Save guest for print'}
              </LuxuryButton>
            </div>
          )}
        </div>

        {formMessage ? (
          <p className="mt-6 text-sm font-medium text-forest-800" role="status">
            {formMessage}
          </p>
        ) : null}
      </section>
    </div>
  )
}
