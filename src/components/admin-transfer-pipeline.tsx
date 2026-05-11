import { useCallback, useEffect, useState } from 'react'
import { stripeCheckoutSessionDashboardUrl, stripePaymentDashboardUrl } from '../lib/stripe-dashboard-url'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { GeButton } from '../pages/golf-experience/components/ge-button'
import { LuxuryButton } from './ui/button'

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
  /** Set when this row mirrors the client portal trip planner for a package build. */
  package_build_id?: string | null
  admin_price_eur?: number | null
  admin_price_vat_treatment?: string | null
  payment_status?: string | null
  stripe_payment_intent_id?: string | null
  stripe_checkout_session_id?: string | null
}

type DriverRow = {
  id: string
  display_name: string
  active: boolean
}

const statusLabel: Record<string, string> = {
  pending: 'Pending allocation',
  allocated: 'Driver assigned',
  driver_accepted: 'Driver accepted',
  en_route: 'En route',
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
  return note || 'ASAP (next available driver)'
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

export function AdminTransferPipeline() {
  const supabase = getSupabaseBrowserClient()
  const [bookings, setBookings] = useState<TransferBookingRow[]>([])
  const [drivers, setDrivers] = useState<DriverRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pickDriverByBooking, setPickDriverByBooking] = useState<Record<string, string>>({})
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
        supabase.from('trip_reviews').select('id, rating, comment, display_name, published_at, submitted_at').order('submitted_at', { ascending: false }).limit(40)
      ])
      if (bRes.error) {
        setBookings([])
        if (bRes.error.message.includes('relation') || bRes.error.message.includes('does not exist')) {
          setError(null)
        } else {
          setError(bRes.error.message)
        }
      } else {
        setBookings((bRes.data ?? []) as TransferBookingRow[])
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
        .update({ assigned_driver_id: driverId, status: 'allocated', updated_at: new Date().toISOString() })
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
    // Do not block the Assign button on outbound email (Resend can be slow or stall in dev).
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
        'Decline this transfer and email the client that no driver is available? They can submit a new request from their dashboard.'
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
      const data = (await res.json().catch(() => ({}))) as { message?: string; partial?: boolean }
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
        `Permanently delete this transfer booking from Operations?\n\n${b.pickup_label || '—'} → ${b.dropoff_label || '—'}\nClient: ${b.client_email || '—'}${b.enquiry_reference_id ? `\nEnquiry: ${b.enquiry_reference_id}` : ''}\nStatus: ${bookingHeadline(b)}\n\nLinked events, driver positions, and trip review rows are removed with it. This cannot be undone.`
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
    return <p className="text-sm font-medium text-forest-600">Loading transfer pipeline…</p>
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-amber-200/90 bg-amber-50/90 px-5 py-4 text-sm text-amber-950">
        {error}
      </div>
    )
  }

  return (
    <section
      className="overflow-hidden rounded-[2rem] border-2 border-fairway-600/25 bg-gradient-to-br from-white via-white to-fairway-50/30 p-6 shadow-[0_22px_56px_rgba(11,73,52,0.08)] ring-1 ring-forest-900/[0.06] sm:p-8"
      aria-label="Transfer pipeline"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-gold-600">Step 3 · Drivers</p>
          <h2 className="font-display mt-1 text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">Operations — Costa del Sol transfers</h2>
        </div>
        <GeButton
          href="/driver"
          size="sm"
          title="Open driver desk: sign in at /driver/login (admins see Irish Driver preview automatically). Real drivers: link auth to drivers.auth_user_id — see supabase/run-in-sql-editor-driver-test-account.sql."
          variant="outline-gs-green"
        >
          Open driver view
        </GeButton>
      </div>

      {bookings.length === 0 ? (
        <p className="mt-6 text-sm text-forest-600">
          No transfer requests yet. Rows appear from the client dashboard map, from saved <strong className="font-medium text-forest-800">Trip details / trip planner</strong> routes (after the client saves their package), and from website transport enquiries once migrations are applied.
        </p>
      ) : (
        <ul className="mt-8 space-y-6">
          {bookings.map((b) => (
            <li
              className="scroll-mt-28 rounded-2xl border border-forest-200/80 bg-offwhite/80 p-5 shadow-inner"
              id={`admin-transfer-booking-${b.id}`}
              key={b.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-mono text-forest-700">{b.id.slice(0, 8)}…</p>
                <div className="flex flex-wrap items-center gap-2">
                  {b.package_build_id ? (
                    <span className="rounded-full bg-fairway-800/95 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                      Trip planner (saved)
                    </span>
                  ) : null}
                  {b.booking_source === 'website_enquiry' ? (
                    <span className="rounded-full bg-sky-900/90 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                      Website form
                    </span>
                  ) : null}
                  <span className="rounded-full bg-forest-900/90 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                    {bookingHeadline(b)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-forest-800">
                <span className="font-semibold">Client email:</span> {b.client_email || '—'}
              </p>
              <p className="mt-1 text-sm text-forest-800">
                <span className="font-semibold">Guest (driver sees name + phone, not email):</span>{' '}
                {(b.client_display_name ?? '').trim() || '—'} · {(b.client_phone ?? '').trim() || '—'}
              </p>
              {b.enquiry_reference_id ? (
                <p className="mt-1 text-xs text-forest-500">
                  <span className="font-semibold text-forest-600">Enquiry ref:</span> {b.enquiry_reference_id}
                </p>
              ) : null}
              <p className="mt-1 text-sm text-forest-700">
                <span className="font-semibold">Route:</span> {b.pickup_label || '—'} → {b.dropoff_label || '—'}
              </p>
              {viaSummary(b) ? (
                <p className="mt-1 text-sm text-forest-700">
                  <span className="font-semibold">Via:</span> {viaSummary(b)}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-forest-500">
                <span className="font-semibold text-forest-600">Pickup timing:</span> {formatPickupWhenAdmin(b)}
              </p>
              {typeof b.admin_price_eur === 'number' && Number.isFinite(b.admin_price_eur) ? (
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-xs font-semibold text-fairway-800">
                    <span className="text-forest-600">Quoted (admin):</span> {formatEurAdmin(b.admin_price_eur)}
                    {(b.admin_price_vat_treatment ?? '').trim() === 'services' ? (
                      <span className="text-forest-600"> · VAT services 23%</span>
                    ) : (
                      <span className="text-forest-600"> · VAT tourism 13.5%</span>
                    )}
                  </p>
                  {(b.payment_status ?? 'unpaid').toLowerCase() === 'paid' ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-emerald-950 ring-1 ring-emerald-400/35">
                      Paid · card confirmed
                    </span>
                  ) : null}
                </div>
              ) : null}
              {stripePaymentDashboardUrl(b.stripe_payment_intent_id) ||
              stripeCheckoutSessionDashboardUrl(b.stripe_checkout_session_id) ? (
                <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
                  {stripePaymentDashboardUrl(b.stripe_payment_intent_id) ? (
                    <a
                      className="text-fairway-900 underline decoration-fairway-600/60 underline-offset-2 hover:text-fairway-950"
                      href={stripePaymentDashboardUrl(b.stripe_payment_intent_id) ?? '#'}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Stripe payment / receipt
                    </a>
                  ) : null}
                  {stripeCheckoutSessionDashboardUrl(b.stripe_checkout_session_id) ? (
                    <a
                      className="text-forest-700 underline decoration-forest-400/70 underline-offset-2 hover:text-forest-900"
                      href={stripeCheckoutSessionDashboardUrl(b.stripe_checkout_session_id) ?? '#'}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Checkout session
                    </a>
                  ) : null}
                </p>
              ) : null}
              <div className="mt-4 flex flex-col gap-3 border-t border-forest-200/60 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                {b.status === 'pending' && !b.assigned_driver_id ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                        Assign driver
                        <select
                          className="mt-1 block w-56 rounded-xl border-2 border-forest-200 bg-white px-3 py-2 text-sm text-forest-900"
                          value={pickDriverByBooking[b.id] ?? ''}
                          onChange={(e) => setPickDriverByBooking((m) => ({ ...m, [b.id]: e.target.value }))}
                        >
                          <option value="">Select…</option>
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.display_name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <LuxuryButton
                        disabled={assigningId === b.id || !pickDriverByBooking[b.id] || deletingId === b.id}
                        onClick={() => void assignDriver(b.id)}
                        type="button"
                        variant="primary"
                      >
                        {assigningId === b.id ? 'Saving…' : 'Assign'}
                      </LuxuryButton>
                    </div>
                    <LuxuryButton
                      className="!border-amber-300 !text-amber-950 hover:!bg-amber-50"
                      disabled={rejectingId === b.id || assigningId === b.id || deletingId === b.id}
                      onClick={() => void rejectNoDriver(b.id)}
                      type="button"
                      variant="outline"
                    >
                      {rejectingId === b.id ? 'Declining…' : 'Decline — no driver'}
                    </LuxuryButton>
                  </div>
                ) : (
                  <span className="text-xs text-forest-500">Allocation / decline controls apply only while status is pending and no driver is assigned.</span>
                )}
                <LuxuryButton
                  className="!border-red-300 !text-red-950 hover:!bg-red-50 sm:ml-auto"
                  disabled={deletingId === b.id || assigningId === b.id || rejectingId === b.id}
                  onClick={() => void deleteBooking(b)}
                  type="button"
                  variant="outline"
                >
                  {deletingId === b.id ? 'Deleting…' : 'Delete booking'}
                </LuxuryButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {reviews.length > 0 ? (
        <div className="mt-12 border-t border-forest-200/80 pt-8">
          <h3 className="font-display text-xl font-semibold text-forest-950">Trip reviews</h3>
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-forest-200/80 bg-white p-4">
                <p className="text-sm font-semibold text-forest-900">
                  {r.rating}★ · {r.display_name ?? 'Guest'}
                </p>
                <p className="mt-2 text-sm text-forest-700">{r.comment || '—'}</p>
                {r.published_at ? (
                  <p className="mt-2 text-xs text-forest-500">Published {new Date(r.published_at).toLocaleString()}</p>
                ) : (
                  <LuxuryButton className="mt-3 !text-xs" onClick={() => void publishReview(r.id)} type="button" variant="outline">
                    Publish to homepage
                  </LuxuryButton>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
