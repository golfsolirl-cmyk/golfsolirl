import { useCallback, useEffect, useMemo, useState } from 'react'
import { Car, CheckCircle2, Circle, Hotel, Users } from 'lucide-react'
import { COURSES } from '../data/coastal-golf-data'
import { stripeCheckoutSessionDashboardUrl, stripePaymentDashboardUrl } from '../lib/stripe-dashboard-url'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { MARTIN_KELLY_DRIVER, isMartinKellyDriverRow } from '../lib/operations-driver'
import { parseAnyPackageBuildRowConfig } from '../lib/package-build'
import { parseClientEnquiryFormPayload } from '../lib/client-data-card'
import { ENQUIRY_STRUCTURED_FIELD_KEYS } from '../lib/enquiry-form-registry'
import { LuxuryButton } from './ui/button'
import { TransferPaymentStatusBadge } from './transfer-payment-status-badge'
import { cx } from '../lib/utils'

type RouteWaypoint = { label?: string | null; lat?: number | null; lng?: number | null }

type TransferBookingRow = {
  id: string
  client_email: string
  client_display_name?: string | null
  client_phone?: string | null
  pickup_label: string
  dropoff_label: string
  status: string
  assigned_driver_id: string | null
  created_at: string
  scheduled_at: string | null
  cancel_reason?: string | null
  route_waypoints?: RouteWaypoint[] | null
  enquiry_reference_id?: string | null
  booking_source?: string | null
  client_timing_note?: string | null
  package_build_id?: string | null
  admin_price_eur?: number | null
  admin_price_vat_treatment?: string | null
  payment_status?: string | null
  deposit_percent?: number | null
  stripe_payment_intent_id?: string | null
  stripe_checkout_session_id?: string | null
}

type DriverRow = {
  id: string
  display_name: string
  active: boolean
}

type TripContext = {
  partySize: number | null
  courseNames: string[]
  hotelNotes: string | null
  hotelIncluded: boolean
  travelDates: string | null
}

const statusLabel: Record<string, string> = {
  pending: 'Waiting for driver',
  allocated: 'Driver assigned',
  driver_accepted: 'Driver accepted',
  en_route: 'Driver en route',
  picked_up: 'Picked up',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

const formatEurAdmin = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const bookingHeadline = (b: TransferBookingRow) => {
  if (b.status === 'cancelled' && typeof b.cancel_reason === 'string' && b.cancel_reason.startsWith('no_driver')) {
    return 'Declined — no driver'
  }
  return statusLabel[b.status] ?? b.status
}

const formatPickupWhenAdmin = (b: TransferBookingRow) => {
  if (b.scheduled_at) {
    return new Date(b.scheduled_at).toLocaleString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const note = (b.client_timing_note ?? '').trim()
  return note || 'ASAP — next available driver'
}

const viaSummary = (b: TransferBookingRow) => {
  const w = b.route_waypoints
  if (!Array.isArray(w) || !w.length) {
    return ''
  }
  return w
    .map((x) => (typeof x?.label === 'string' ? x.label.trim() : ''))
    .filter(Boolean)
    .join(' → ')
}

const payStatus = (b: TransferBookingRow) => String(b.payment_status ?? 'unpaid').toLowerCase()

const isPaidInFull = (b: TransferBookingRow) => payStatus(b) === 'paid'

const hasQuotePrice = (b: TransferBookingRow) =>
  typeof b.admin_price_eur === 'number' && Number.isFinite(b.admin_price_eur) && b.admin_price_eur > 0

const isReadyToDispatch = (b: TransferBookingRow) =>
  isPaidInFull(b) && b.status === 'pending' && !b.assigned_driver_id

/** Website-form (or other) quotes waiting for the guest to pay — show in Transfers desk. */
const isQuotedAwaitingPayment = (b: TransferBookingRow) =>
  hasQuotePrice(b) &&
  b.status === 'pending' &&
  !b.assigned_driver_id &&
  payStatus(b) !== 'paid'

const courseNamesFromIds = (ids: readonly string[]) =>
  ids
    .map((id) => COURSES.find((c) => c.id === id)?.name ?? id.trim())
    .filter(Boolean)

function tripContextFromPackageConfig(configRaw: unknown): TripContext | null {
  const parsed = parseAnyPackageBuildRowConfig(configRaw)
  if (!parsed) {
    return null
  }
  if (parsed.type === 'website_form') {
    const tw = parsed.config.portalTripWorkspace
    const plan = parsed.config.portalTransferPlan
    const fields = parsed.config.fields
    const partyFromTw = tw?.partySize && tw.partySize > 0 ? tw.partySize : null
    const paxRaw = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.pax] ?? fields['Group size'] ?? fields.Passengers
    const partyFromFields = paxRaw ? parseInt(String(paxRaw).replace(/[^\d]/g, ''), 10) : NaN
    const partySize = partyFromTw ?? (Number.isFinite(partyFromFields) && partyFromFields > 0 ? partyFromFields : null)
    const fromPlanCourses = plan?.golfLegs?.length
      ? courseNamesFromIds(plan.golfLegs.map((l) => l.courseId).filter(Boolean))
      : []
    const courseNames = tw?.courseIds?.length
      ? courseNamesFromIds(tw.courseIds)
      : fromPlanCourses.length
        ? fromPlanCourses
        : fields[ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType] === 'golf_course' &&
            fields[ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffLabel]
          ? [fields[ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffLabel]!]
          : []
    const hotelFromPlan =
      plan?.hotelLegs
        ?.map((l) => [l.hotelName, l.notes].map((s) => s.trim()).filter(Boolean).join(' — '))
        .filter(Boolean)
        .join('; ') || null
    const hotelNotes = (tw?.hotelNotes ?? '').trim() || hotelFromPlan
    const hotelIncluded = Boolean(tw?.stages.hotel) || Boolean(hotelNotes)
    const from = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom] ?? fields['Travel start date']
    const to = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo] ?? fields['Travel end date']
    const travelDates = [from, to].filter(Boolean).join(' → ') || null
    return { partySize, courseNames, hotelNotes, hotelIncluded, travelDates }
  }
  if (parsed.type === 'calculator') {
    const c = parsed.config
    return {
      partySize: c.groupSize > 0 ? c.groupSize : null,
      courseNames: c.courseName ? [c.courseName] : c.courseId ? courseNamesFromIds([c.courseId]) : [],
      hotelNotes: (c.hotelName || c.stayName || '').trim() || null,
      hotelIncluded: Boolean(c.hotelName || c.stayName),
      travelDates: null
    }
  }
  if (parsed.type === 'manual') {
    const c = parsed.config
    const hotelIncluded = c.kind === 'hotel'
    const courseNames = c.kind === 'golf' && c.title.trim() ? [c.title.trim()] : []
    const hotelNotes = hotelIncluded
      ? [c.title, c.summary].map((s) => s.trim()).filter(Boolean).join(' — ') || null
      : c.summary.trim() || null
    return {
      partySize: null,
      courseNames,
      hotelNotes,
      hotelIncluded,
      travelDates: null
    }
  }
  return null
}

function tripContextFromEnquiry(formPayload: unknown): TripContext | null {
  const { fields } = parseClientEnquiryFormPayload(formPayload)
  if (!Object.keys(fields).length) {
    return null
  }
  const paxRaw = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.pax] ?? fields['Group size'] ?? fields.Passengers
  const partyParsed = paxRaw ? parseInt(String(paxRaw).replace(/[^\d]/g, ''), 10) : NaN
  const partySize = Number.isFinite(partyParsed) && partyParsed > 0 ? partyParsed : null
  const dropLabel = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffLabel]?.trim()
  const courseNames =
    fields[ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType] === 'golf_course' && dropLabel ? [dropLabel] : []
  const hotelNotes =
    fields['Accommodation notes']?.trim() ||
    fields.Destination?.trim() ||
    fields['Preferred location']?.trim() ||
    null
  const from = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom] ?? fields['Travel start date']
  const to = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo] ?? fields['Travel end date']
  const travelDates = [from, to].filter(Boolean).join(' → ') || null
  return {
    partySize,
    courseNames,
    hotelNotes,
    hotelIncluded: Boolean(hotelNotes),
    travelDates
  }
}

export function AdminTransferPipeline() {
  const supabase = getSupabaseBrowserClient()
  const [bookings, setBookings] = useState<TransferBookingRow[]>([])
  const [drivers, setDrivers] = useState<DriverRow[]>([])
  const [tripByBookingId, setTripByBookingId] = useState<Record<string, TripContext>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pickDriverByBooking, setPickDriverByBooking] = useState<Record<string, string>>({})
  const [listMode, setListMode] = useState<'desk' | 'ready' | 'awaiting_pay' | 'all'>('desk')
  const [reviews, setReviews] = useState<
    { id: string; rating: number; comment: string; display_name: string | null; published_at: string | null; submitted_at: string }[]
  >([])

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      setError('Supabase is not configured.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [bRes, dRes, rRes] = await Promise.all([
        supabase.from('transfer_bookings').select('*').order('created_at', { ascending: false }).limit(150),
        supabase.from('drivers').select('id, display_name, active').eq('active', true).order('display_name'),
        supabase
          .from('trip_reviews')
          .select('id, rating, comment, display_name, published_at, submitted_at')
          .order('submitted_at', { ascending: false })
          .limit(40)
      ])
      if (bRes.error) {
        setBookings([])
        if (!(bRes.error.message.includes('relation') || bRes.error.message.includes('does not exist'))) {
          setError(bRes.error.message)
        }
      } else {
        const list = (bRes.data ?? []) as TransferBookingRow[]
        setBookings(list)

        const packageIds = [...new Set(list.map((b) => b.package_build_id).filter((id): id is string => Boolean(id)))]
        const refs = [
          ...new Set(list.map((b) => b.enquiry_reference_id).filter((r): r is string => Boolean(r?.trim())))
        ]

        const ctx: Record<string, TripContext> = {}
        const [pRes, eRes] = await Promise.all([
          packageIds.length
            ? supabase.from('package_builds').select('id, config, enquiry_reference_id').in('id', packageIds)
            : Promise.resolve({ data: [] as { id: string; config: unknown; enquiry_reference_id?: string | null }[] }),
          refs.length
            ? supabase.from('enquiries').select('reference_id, form_payload').in('reference_id', refs)
            : Promise.resolve({ data: [] as { reference_id: string; form_payload: unknown }[] })
        ])

        const packageById = new Map(
          ((pRes.data ?? []) as { id: string; config: unknown }[]).map((p) => [p.id, p.config])
        )
        const enquiryByRef = new Map(
          ((eRes.data ?? []) as { reference_id: string; form_payload: unknown }[]).map((e) => [
            e.reference_id,
            e.form_payload
          ])
        )

        for (const b of list) {
          let trip: TripContext | null = null
          if (b.package_build_id && packageById.has(b.package_build_id)) {
            trip = tripContextFromPackageConfig(packageById.get(b.package_build_id))
          }
          if (!trip && b.enquiry_reference_id && enquiryByRef.has(b.enquiry_reference_id)) {
            trip = tripContextFromEnquiry(enquiryByRef.get(b.enquiry_reference_id))
          }
          if (trip) {
            ctx[b.id] = trip
          }
        }
        setTripByBookingId(ctx)
      }
      if (!dRes.error && dRes.data) {
        setDrivers(dRes.data as DriverRow[])
      } else {
        setDrivers([])
      }
      if (!rRes.error && rRes.data) {
        setReviews(rRes.data as typeof reviews)
      } else {
        setReviews([])
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }
    window.addEventListener('focus', onVisible)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onVisible)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  useEffect(() => {
    const martin = drivers.find(isMartinKellyDriverRow)
    if (!martin) {
      return
    }
    setPickDriverByBooking((prev) => {
      const next = { ...prev }
      let changed = false
      for (const b of bookings) {
        if (b.status === 'pending' && !b.assigned_driver_id && !next[b.id]) {
          next[b.id] = martin.id
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [drivers, bookings])

  const readyRows = useMemo(() => bookings.filter(isReadyToDispatch), [bookings])
  const awaitingPayRows = useMemo(() => bookings.filter(isQuotedAwaitingPayment), [bookings])
  const deskRows = useMemo(() => {
    const seen = new Set<string>()
    const out: TransferBookingRow[] = []
    for (const b of [...readyRows, ...awaitingPayRows]) {
      if (seen.has(b.id)) continue
      seen.add(b.id)
      out.push(b)
    }
    return out
  }, [readyRows, awaitingPayRows])

  const visibleRows = useMemo(() => {
    if (listMode === 'desk') {
      return deskRows
    }
    if (listMode === 'ready') {
      return readyRows
    }
    if (listMode === 'awaiting_pay') {
      return awaitingPayRows
    }
    return bookings
  }, [listMode, deskRows, readyRows, awaitingPayRows, bookings])

  const assignDriver = async (bookingId: string) => {
    if (!supabase) {
      return
    }
    const driverId = pickDriverByBooking[bookingId]?.trim()
    if (!driverId) {
      return
    }
    setAssigningId(bookingId)
    setError(null)
    try {
      const { error: uErr } = await supabase
        .from('transfer_bookings')
        .update({ assigned_driver_id: driverId, status: 'en_route', updated_at: new Date().toISOString() })
        .eq('id', bookingId)
      if (uErr) {
        setError(uErr.message)
        return
      }
      const { error: evErr } = await supabase.from('transfer_booking_events').insert({
        booking_id: bookingId,
        actor_kind: 'admin',
        action: 'allocated',
        meta: { driver_id: driverId }
      })
      if (evErr) {
        console.error('[admin-transfer-pipeline] transfer_booking_events insert', evErr.message)
      }
      await refresh()
    } finally {
      setAssigningId(null)
    }
    void (async () => {
      try {
        const session = await supabase.auth.getSession()
        const token = session.data.session?.access_token
        if (!token) {
          return
        }
        const ctrl = new AbortController()
        const tid = window.setTimeout(() => ctrl.abort(), 20_000)
        try {
          const res = await fetch('/api/transfer-notify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ bookingId, event: 'allocated' }),
            signal: ctrl.signal
          })
          if (!res.ok) {
            const j = (await res.json().catch(() => ({}))) as { message?: string }
            console.warn('[admin-transfer-pipeline] transfer-notify', res.status, j.message ?? res.statusText)
          }
        } finally {
          window.clearTimeout(tid)
        }
      } catch (e) {
        console.warn('[admin-transfer-pipeline] transfer-notify', e)
      }
    })()
  }

  const rejectNoDriver = async (bookingId: string) => {
    if (!supabase) {
      return
    }
    if (
      !window.confirm(
        'Decline this transfer without sending email? The booking will be cancelled. Email the guest yourself when ready.'
      )
    ) {
      return
    }
    setRejectingId(bookingId)
    setError(null)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) {
        setError('Sign in again to decline transfers.')
        return
      }
      const res = await fetch('/api/transfer-reject-no-driver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        setError(data.message ?? res.statusText)
        return
      }
      await refresh()
    } finally {
      setRejectingId(null)
    }
  }

  const deleteBooking = async (b: TransferBookingRow) => {
    if (!supabase) {
      return
    }
    if (
      !window.confirm(
        `Permanently delete this transfer?\n\n${b.pickup_label || '—'} → ${b.dropoff_label || '—'}\n${b.client_display_name || b.client_email || '—'}\n\nThis cannot be undone.`
      )
    ) {
      return
    }
    setDeletingId(b.id)
    setError(null)
    try {
      const { error: dErr } = await supabase.from('transfer_bookings').delete().eq('id', b.id)
      if (dErr) {
        setError(dErr.message)
        return
      }
      await refresh()
    } finally {
      setDeletingId(null)
    }
  }

  const publishReview = async (reviewId: string) => {
    if (!supabase) {
      return
    }
    const { error: e } = await supabase.from('trip_reviews').update({ published_at: new Date().toISOString() }).eq('id', reviewId)
    if (e) {
      setError(e.message)
      return
    }
    await refresh()
  }

  if (!supabase) {
    return null
  }

  if (loading) {
    return <p className="text-sm font-medium text-forest-600">Loading transfers…</p>
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-chrome-200/90 bg-chrome-50/90 px-5 py-4 text-sm text-brand-950">
        {error}
      </div>
    )
  }

  const renderBookingCard = (b: TransferBookingRow, emphasizeReady: boolean) => {
    const trip = tripByBookingId[b.id]
    const paid = isPaidInFull(b)
    const guestName = (b.client_display_name ?? '').trim() || 'Guest'
    const phone = (b.client_phone ?? '').trim()
    const canDispatch = b.status === 'pending' && !b.assigned_driver_id

    return (
      <li
        className={cx(
          'scroll-mt-28 rounded-2xl border p-5 shadow-sm',
          emphasizeReady
            ? 'border-fairway-300 bg-gradient-to-br from-fairway-50/90 to-white ring-1 ring-fairway-200/80'
            : 'border-forest-200/80 bg-offwhite/80'
        )}
        id={`admin-transfer-booking-${b.id}`}
        key={b.id}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-forest-950">{guestName}</p>
            <p className="mt-1 text-sm text-forest-700">
              {phone || 'No phone on file'}
              {b.enquiry_reference_id ? (
                <>
                  {' · '}
                  <span className="font-mono text-xs font-semibold text-forest-800">{b.enquiry_reference_id}</span>
                </>
              ) : null}
            </p>
            <p className="mt-0.5 break-all text-xs text-ge-gray500">{b.client_email || '—'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {b.booking_source === 'website_enquiry' ? (
              <span className="rounded-full bg-sky-900/90 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                Website form
              </span>
            ) : null}
            <TransferPaymentStatusBadge
              deposit_percent={b.deposit_percent}
              payment_status={b.payment_status}
              size="sm"
            />
            <span className="rounded-full bg-forest-900/90 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
              {bookingHeadline(b)}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-forest-100 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">Transfer</p>
            <p className="mt-1 text-sm font-medium text-forest-900">
              {b.pickup_label || '—'} → {b.dropoff_label || '—'}
            </p>
            {viaSummary(b) ? <p className="mt-1 text-xs text-forest-600">Via: {viaSummary(b)}</p> : null}
            <p className="mt-2 text-xs text-forest-700">
              <span className="font-semibold">When:</span> {formatPickupWhenAdmin(b)}
            </p>
          </div>

          <div className="rounded-xl border border-forest-100 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">Before you dispatch</p>
            <ul className="mt-2 space-y-1.5 text-sm text-forest-800">
              <li className="flex items-start gap-2">
                {paid ? (
                  <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-fairway-700" />
                ) : (
                  <Circle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                )}
                <span>{paid ? 'Paid in full' : 'Payment not complete yet'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Users aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                <span>
                  Party:{' '}
                  {trip?.partySize
                    ? `${trip.partySize} ${trip.partySize === 1 ? 'golfer' : 'golfers'}`
                    : 'Confirm party size'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Car aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                <span>
                  Golf:{' '}
                  {trip?.courseNames?.length
                    ? trip.courseNames.join(', ')
                    : 'No course on file — confirm tee times'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Hotel aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                <span>
                  Accommodation:{' '}
                  {trip?.hotelNotes
                    ? trip.hotelNotes
                    : trip?.hotelIncluded
                      ? 'Hotel on trip — confirm we have booked it'
                      : 'Not on this trip / confirm separately'}
                </span>
              </li>
            </ul>
            {trip?.travelDates ? (
              <p className="mt-2 text-xs text-ge-gray500">Trip dates: {trip.travelDates}</p>
            ) : null}
          </div>
        </div>

        {typeof b.admin_price_eur === 'number' && Number.isFinite(b.admin_price_eur) ? (
          <p className="mt-3 text-xs font-semibold text-fairway-900">
            Quoted: {formatEurAdmin(b.admin_price_eur)}
            {(b.admin_price_vat_treatment ?? '').trim() === 'services' ? ' · VAT 23%' : ' · VAT tourism 13.5%'}
          </p>
        ) : null}

        {stripePaymentDashboardUrl(b.stripe_payment_intent_id) ||
        stripeCheckoutSessionDashboardUrl(b.stripe_checkout_session_id) ? (
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
            {stripePaymentDashboardUrl(b.stripe_payment_intent_id) ? (
              <a
                className="text-fairway-900 underline decoration-fairway-600/60 underline-offset-2"
                href={stripePaymentDashboardUrl(b.stripe_payment_intent_id) ?? '#'}
                rel="noreferrer"
                target="_blank"
              >
                Stripe payment
              </a>
            ) : null}
            {stripeCheckoutSessionDashboardUrl(b.stripe_checkout_session_id) ? (
              <a
                className="text-forest-700 underline decoration-forest-400/70 underline-offset-2"
                href={stripeCheckoutSessionDashboardUrl(b.stripe_checkout_session_id) ?? '#'}
                rel="noreferrer"
                target="_blank"
              >
                Checkout session
              </a>
            ) : null}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 border-t border-forest-200/60 pt-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          {canDispatch ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
                Driver
                <select
                  className="mt-1 block w-56 rounded-xl border-2 border-forest-200 bg-white px-3 py-2 text-sm text-forest-900"
                  onChange={(e) => setPickDriverByBooking((m) => ({ ...m, [b.id]: e.target.value }))}
                  value={pickDriverByBooking[b.id] ?? drivers.find(isMartinKellyDriverRow)?.id ?? ''}
                >
                  <option value="">Select…</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.display_name}
                      {isMartinKellyDriverRow(d) ? ' (default)' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <LuxuryButton
                disabled={
                  assigningId === b.id ||
                  !pickDriverByBooking[b.id] ||
                  deletingId === b.id ||
                  (!paid && emphasizeReady)
                }
                onClick={() => void assignDriver(b.id)}
                type="button"
                variant="primary"
              >
                {assigningId === b.id
                  ? 'Dispatching…'
                  : paid
                    ? `Dispatch ${MARTIN_KELLY_DRIVER.displayName}`
                    : 'Dispatch (payment incomplete)'}
              </LuxuryButton>
              {!paid ? (
                <p className="text-xs text-amber-900 sm:max-w-[14rem]">
                  Prefer waiting until paid in full before dispatch.
                </p>
              ) : null}
              <LuxuryButton
                className="!border-chrome-300 !text-brand-950 hover:!bg-chrome-50"
                disabled={rejectingId === b.id || assigningId === b.id || deletingId === b.id}
                onClick={() => void rejectNoDriver(b.id)}
                type="button"
                variant="outline"
              >
                {rejectingId === b.id ? 'Declining…' : 'Decline'}
              </LuxuryButton>
            </div>
          ) : (
            <p className="text-xs text-ge-gray500">Driver already assigned or job is no longer waiting.</p>
          )}
          <LuxuryButton
            className="!border-red-300 !text-red-950 hover:!bg-red-50 sm:ml-auto"
            disabled={deletingId === b.id || assigningId === b.id || rejectingId === b.id}
            onClick={() => void deleteBooking(b)}
            type="button"
            variant="outline"
          >
            {deletingId === b.id ? 'Deleting…' : 'Delete'}
          </LuxuryButton>
        </div>
      </li>
    )
  }

  return (
    <section
      aria-label="Transfers and driver dispatch"
      className="overflow-hidden rounded-[2rem] border-2 border-fairway-600/25 bg-gradient-to-br from-white via-white to-fairway-50/30 p-6 shadow-[0_22px_56px_rgba(11,73,52,0.08)] ring-1 ring-forest-900/[0.06] sm:p-8"
      id="admin-transfer-pipeline"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-brand-600">
            Quotes &amp; dispatch
          </p>
          <h2 className="font-display mt-1 text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
            Transfers from website forms
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-forest-600">
            When you send a deposit or full price from <strong className="font-semibold text-forest-800">Website forms</strong>,
            the job appears here. After the guest pays in full, dispatch a driver — email goes to{' '}
            <strong className="font-semibold text-forest-800">{MARTIN_KELLY_DRIVER.email}</strong>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-center min-w-[5.5rem]">
            <p className="font-display text-xl font-bold text-amber-950">{awaitingPayRows.length}</p>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-forest-600">Quoted</p>
          </div>
          <div className="rounded-xl border border-fairway-200 bg-white px-3.5 py-2 text-center min-w-[5.5rem]">
            <p className="font-display text-xl font-bold text-fairway-900">{readyRows.length}</p>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-forest-600">Paid · ready</p>
          </div>
          <div className="rounded-xl border border-forest-200 bg-white px-3.5 py-2 text-center min-w-[5.5rem]">
            <p className="font-display text-xl font-bold text-forest-800">{bookings.length}</p>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-forest-600">All jobs</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ['desk', `Active desk (${deskRows.length})`],
            ['awaiting_pay', `Quoted — awaiting pay (${awaitingPayRows.length})`],
            ['ready', `Paid — ready to dispatch (${readyRows.length})`],
            ['all', `All jobs (${bookings.length})`]
          ] as const
        ).map(([mode, label]) => (
          <button
            className={cx(
              'rounded-full px-4 py-2 text-xs font-semibold transition',
              listMode === mode
                ? 'bg-forest-900 text-white'
                : 'border border-forest-200 bg-white text-forest-800 hover:border-fairway-400'
            )}
            key={mode}
            onClick={() => setListMode(mode)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-forest-200 bg-offwhite px-5 py-10 text-center">
          <p className="font-display text-lg font-semibold text-forest-950">No transfer jobs yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-forest-600">
            Open a Website forms card, send a deposit or full price — the guest’s job will show up here under Quoted.
          </p>
        </div>
      ) : visibleRows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-fairway-200 bg-fairway-50/50 px-5 py-8 text-center sm:text-left">
          <p className="font-display text-lg font-semibold text-forest-950">
            {listMode === 'ready'
              ? 'No paid trips waiting for a driver'
              : listMode === 'awaiting_pay'
                ? 'No quoted jobs awaiting payment'
                : listMode === 'desk'
                  ? 'Nothing on the active desk'
                  : 'No jobs in this list'}
          </p>
          <p className="mt-2 text-sm text-forest-700">
            {listMode === 'ready' || listMode === 'desk'
              ? 'Send a price from Website forms to create a job, or wait for a guest to pay in full.'
              : 'Switch tabs to see other jobs.'}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-5">
          {visibleRows.map((b) =>
            renderBookingCard(b, isReadyToDispatch(b) || (listMode === 'desk' && isQuotedAwaitingPayment(b)))
          )}
        </ul>
      )}

      {reviews.length > 0 ? (
        <details className="mt-10 border-t border-forest-200/80 pt-6">
          <summary className="cursor-pointer font-display text-lg font-semibold text-forest-950">
            Trip reviews ({reviews.length})
          </summary>
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-forest-200/80 bg-white p-4">
                <p className="text-sm font-semibold text-forest-900">
                  {r.rating}★ · {r.display_name ?? 'Guest'}
                </p>
                <p className="mt-2 text-sm text-forest-700">{r.comment || '—'}</p>
                {r.published_at ? (
                  <p className="mt-2 text-xs text-ge-gray500">Published {new Date(r.published_at).toLocaleString()}</p>
                ) : (
                  <LuxuryButton className="mt-3 !text-xs" onClick={() => void publishReview(r.id)} type="button" variant="outline">
                    Publish to homepage
                  </LuxuryButton>
                )}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
