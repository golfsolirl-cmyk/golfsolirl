import { useCallback, useEffect, useMemo, useState } from 'react'
import { Car, ScanLine } from 'lucide-react'
import { DashboardLayout, DashboardLoadingShell } from '../components/dashboard-layout'
import { PortalBottomNav } from '../components/portal-bottom-nav'
import {
  TransferPassVerifyBanner,
  verifyTransferPassAgainstBookings,
  type TransferPassRow
} from '../components/client-transfer-pass-panel'
import { TransferPassScanner } from '../components/transfer-pass-scanner'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { useAuth } from '../providers/auth-provider'
import { GeButton } from '../pages/golf-experience/components/ge-button'
import { LuxuryButton } from '../components/ui/button'
import { TransferPaymentStatusBadge } from '../components/transfer-payment-status-badge'

type RouteWaypoint = { label?: string | null }

type DriverTab = 'jobs' | 'scan'

type BookingRow = TransferPassRow & {
  status: string
  client_display_name?: string | null
  client_phone?: string | null
  route_waypoints?: RouteWaypoint[] | null
  client_timing_note?: string | null
}

const formatJobWhenDriver = (b: BookingRow) => {
  if (b.scheduled_at) {
    return new Date(b.scheduled_at).toLocaleString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    })
  }
  const note = (b.client_timing_note ?? '').trim()
  return note || 'ASAP (next available driver)'
}

const viaLineDriver = (b: BookingRow) => {
  const w = b.route_waypoints
  if (!Array.isArray(w) || !w.length) {
    return null
  }
  const labels = w.map((x) => (typeof x?.label === 'string' ? x.label.trim() : '')).filter(Boolean)
  if (!labels.length) {
    return null
  }
  return labels.join(' → ')
}

const DEFAULT_PREVIEW_DRIVER_ID = 'c0ffee00-0000-4000-8000-000000000001'

const TRANSFER_BOOKINGS_SELECT_WITH_VIAS =
  'id, status, client_display_name, client_phone, pickup_label, dropoff_label, scheduled_at, route_waypoints, client_timing_note, payment_status, deposit_percent, enquiry_reference_id, admin_price_eur'

const TRANSFER_BOOKINGS_SELECT_NO_VIAS =
  'id, status, client_display_name, client_phone, pickup_label, dropoff_label, scheduled_at, client_timing_note, payment_status, deposit_percent, enquiry_reference_id, admin_price_eur'

const isRouteWaypointsColumnError = (message: string) =>
  /route_waypoints|42703|does not exist|schema cache/i.test(message)

/** Optional override UUID for the admin preview desk (defaults to seeded Irish Driver row). */
const resolvePreviewDriverId = () =>
  (import.meta.env.VITE_PREVIEW_DRIVER_ID as string | undefined)?.trim() || DEFAULT_PREVIEW_DRIVER_ID

export function DriverDashboardPage() {
  const { session, profile, isLoading, signOut } = useAuth()
  const supabase = getSupabaseBrowserClient()
  const [driverId, setDriverId] = useState<string | null>(null)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [posBusy, setPosBusy] = useState(false)
  const [driverTab, setDriverTab] = useState<DriverTab>('jobs')
  const [scanResult, setScanResult] = useState<ReturnType<typeof verifyTransferPassAgainstBookings> | null>(null)

  const previewDriverUuid = useMemo(() => resolvePreviewDriverId(), [])
  const isAdminDriverPreview = profile?.role === 'admin'

  const refresh = useCallback(async () => {
    if (!supabase || !session?.user?.id) {
      return
    }
    setLoading(true)
    setMsg(null)
    try {
      let resolvedDriverId: string | null = null

      if (profile?.role === 'admin') {
        const { data: row, error: pvErr } = await supabase.from('drivers').select('id').eq('id', previewDriverUuid).maybeSingle()
        if (pvErr || !row?.id) {
          setDriverId(null)
          setBookings([])
          setMsg(
            'Preview driver row not found. Apply migration 20260505200000_seed_demo_transfer_driver.sql (Irish Driver preview) or set VITE_PREVIEW_DRIVER_ID to an existing drivers.id.'
          )
          return
        }
        resolvedDriverId = row.id as string
      } else {
        const { data: dr, error: dErr } = await supabase
          .from('drivers')
          .select('id')
          .eq('auth_user_id', session.user.id)
          .maybeSingle()
        if (dErr || !dr?.id) {
          setDriverId(null)
          setBookings([])
          return
        }
        resolvedDriverId = dr.id as string
      }

      setDriverId(resolvedDriverId)
      const firstRes = await supabase
        .from('transfer_bookings')
        .select(TRANSFER_BOOKINGS_SELECT_WITH_VIAS)
        .eq('assigned_driver_id', resolvedDriverId)
        .order('created_at', { ascending: false })
        .limit(40)

      if (!firstRes.error) {
        setBookings((firstRes.data ?? []) as BookingRow[])
      } else if (isRouteWaypointsColumnError(firstRes.error.message)) {
        const secondRes = await supabase
          .from('transfer_bookings')
          .select(TRANSFER_BOOKINGS_SELECT_NO_VIAS)
          .eq('assigned_driver_id', resolvedDriverId)
          .order('created_at', { ascending: false })
          .limit(40)
        if (secondRes.error) {
          setMsg(secondRes.error.message)
          setBookings([])
          return
        }
        setMsg(
          'Jobs loaded without via stops: add column transfer_bookings.route_waypoints — run supabase/run-in-sql-editor-transfer-bookings-route-waypoints.sql (or migration 20260505180000) in Supabase, then refresh.'
        )
        setBookings((secondRes.data ?? []) as BookingRow[])
      } else {
        setMsg(firstRes.error.message)
        setBookings([])
        return
      }
    } finally {
      setLoading(false)
    }
  }, [supabase, session?.user?.id, profile?.role, previewDriverUuid])

  useEffect(() => {
    if (!isLoading && session && (profile?.role === 'driver' || profile?.role === 'admin')) {
      void refresh()
    }
  }, [isLoading, session, profile?.role, refresh])

  const pushPosition = async (bookingId: string) => {
    if (!supabase) {
      return
    }
    setPosBusy(true)
    try {
      await new Promise<void>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'))
          return
        }
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { error } = await supabase.from('driver_positions').insert({
              booking_id: bookingId,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            })
            if (error) {
              reject(new Error(error.message))
            } else {
              resolve()
            }
          },
          () => reject(new Error('Could not read location')),
          { enableHighAccuracy: true, timeout: 12_000 }
        )
      })
      setMsg('Location sent to customer map.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Location failed')
    } finally {
      setPosBusy(false)
    }
  }

  const setStatus = async (bookingId: string, next: string, eventAction: string) => {
    if (!supabase) {
      return
    }
    const { error: u } = await supabase
      .from('transfer_bookings')
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
    if (u) {
      setMsg(u.message)
      return
    }
    await supabase.from('transfer_booking_events').insert({
      booking_id: bookingId,
      actor_kind: isAdminDriverPreview ? 'admin' : 'driver',
      action: eventAction,
      meta: isAdminDriverPreview ? { status: next, preview_desk: true } : { status: next }
    })
    const tok = (await supabase.auth.getSession()).data.session?.access_token
    if (tok) {
      const ev =
        next === 'driver_accepted'
          ? 'driver_accepted'
          : next === 'en_route'
            ? 'en_route'
            : next === 'picked_up'
              ? 'picked_up'
              : next === 'completed'
                ? 'completed'
                : 'update'
      await fetch('/api/transfer-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ bookingId, event: ev })
      })
    }
    await refresh()
  }

  const greetingFirst = profile?.full_name?.trim()?.split(/\s+/).filter(Boolean)[0] ?? ''
  const heroTitle =
    isAdminDriverPreview ? 'Driver desk (admin preview)' : greetingFirst ? `Hello, ${greetingFirst}` : 'Driver desk'

  const deskSubtitle = isAdminDriverPreview
    ? `Preview: jobs for Irish Driver ${previewDriverUuid.slice(0, 8)}… (admins always see this preview desk). Optional env VITE_PREVIEW_DRIVER_ID overrides the driver UUID. Real drivers: link profiles + drivers.auth_user_id — see supabase/run-in-sql-editor-driver-test-account.sql.`
    : 'Accept jobs, share your live location, and mark pickup and drop-off complete. Customer emails fire automatically.'

  const body = useMemo(() => {
    if (loading) {
      return <p className="text-sm text-forest-600">Loading jobs…</p>
    }
    if (!driverId) {
      return (
        <div className="rounded-2xl border border-chrome-200 bg-chrome-50/90 p-6 text-sm text-brand-950">
          {profile?.role === 'driver' ? (
            <p>
              Your account is not linked to a driver profile yet. Ask Golf Sol Ireland ops to connect your login to a row
              in the <code className="font-mono">drivers</code> table (<code className="font-mono">auth_user_id</code>), or
              run <code className="font-mono">supabase/run-in-sql-editor-driver-test-account.sql</code> after magic-link
              sign-up for your test email.
            </p>
          ) : (
            <p>
              Could not load the preview driver row. Ensure migration <code className="font-mono">20260505200000_seed_demo_transfer_driver.sql</code>{' '}
              is applied and see the error message above.
            </p>
          )}
        </div>
      )
    }
    if (bookings.length === 0) {
      return (
        <p className="text-sm text-forest-600">
          No jobs assigned to this driver yet. In admin, assign Irish Driver (preview) to a pending transfer to see a job here.
        </p>
      )
    }
    return (
      <ul className="space-y-8">
        {bookings.map((b) => (
          <li key={b.id} className="rounded-3xl border border-forest-200/90 bg-offwhite/90 p-6 shadow-soft">
            <p className="text-xs font-mono text-forest-600">{b.id}</p>
            <p className="mt-2 text-lg font-semibold text-forest-950">Status: {b.status}</p>
            <div className="mt-2">
              <TransferPaymentStatusBadge deposit_percent={b.deposit_percent} payment_status={b.payment_status} size="md" />
            </div>
            <p className="mt-3 text-base text-forest-800">
              <span className="font-semibold">Guest:</span> {(b.client_display_name ?? '').trim() || '—'} ·{' '}
              <span className="font-semibold">Phone / WhatsApp:</span> {(b.client_phone ?? '').trim() || '—'}
            </p>
            <p className="mt-1 text-sm text-forest-800">
              <span className="font-semibold">Pickup:</span> {b.pickup_label}
            </p>
            {viaLineDriver(b) ? (
              <p className="mt-1 text-sm text-forest-800">
                <span className="font-semibold">Via:</span> {viaLineDriver(b)}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-forest-800">
              <span className="font-semibold">Destination:</span> {b.dropoff_label}
            </p>
            <p className="mt-1 text-sm text-forest-800">
              <span className="font-semibold">Date &amp; time:</span> {formatJobWhenDriver(b)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {b.status === 'allocated' ? (
                <LuxuryButton onClick={() => void setStatus(b.id, 'driver_accepted', 'accepted')} type="button" variant="primary">
                  Accept job
                </LuxuryButton>
              ) : null}
              {b.status === 'driver_accepted' ? (
                <LuxuryButton onClick={() => void setStatus(b.id, 'en_route', 'en_route')} type="button" variant="primary">
                  On the way
                </LuxuryButton>
              ) : null}
              {['driver_accepted', 'en_route'].includes(b.status) ? (
                <GeButton size="sm" type="button" variant="outline-gs-green" disabled={posBusy} onClick={() => void pushPosition(b.id)}>
                  {posBusy ? 'Sending…' : 'Send my location'}
                </GeButton>
              ) : null}
              {b.status === 'en_route' ? (
                <LuxuryButton onClick={() => void setStatus(b.id, 'picked_up', 'picked_up')} type="button" variant="outline">
                  Picked up
                </LuxuryButton>
              ) : null}
              {b.status === 'picked_up' ? (
                <LuxuryButton onClick={() => void setStatus(b.id, 'completed', 'completed')} type="button" variant="primary">
                  Drop-off complete
                </LuxuryButton>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    )
  }, [loading, driverId, bookings, posBusy, profile?.role])

  if (isLoading || !session) {
    return <DashboardLoadingShell label="Loading driver desk…" />
  }

  const canAccessDriverDesk = profile?.role === 'driver' || profile?.role === 'admin'

  if (!canAccessDriverDesk) {
    return (
      <div className="ge-page flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-md font-ge text-forest-800">
          This area is for drivers (profile role <span className="font-mono text-sm">driver</span>) or operators signed in as{' '}
          <span className="font-mono text-sm">admin</span> (Irish Driver preview desk). Use{' '}
          <a className="font-mono text-sm text-gs-green underline" href="/driver/login">
            /driver/login
          </a>{' '}
          for magic-link access.
        </p>
        <GeButton href="/dashboard/admin" variant="outline-gs-green">
          Admin dashboard
        </GeButton>
        <GeButton href="/driver/login" variant="gs-green">
          Driver sign-in
        </GeButton>
        <button className="text-sm text-gs-green underline" type="button" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
    )
  }

  return (
    <DashboardLayout kicker="Driver" subtitle={deskSubtitle} title={heroTitle} variant="driver">
      <div className="portal-ui-root pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0">
      {isAdminDriverPreview ? (
        <p className="mb-4 rounded-2xl border border-chrome-200/90 bg-chrome-50/90 px-4 py-3 text-base text-brand-950">
          Admin preview — event log uses <span className="font-mono">actor_kind = admin</span>. Assign Irish Driver in Operations
          to exercise the flow.
        </p>
      ) : null}
      {msg ? <p className="mb-6 text-base text-forest-800">{msg}</p> : null}
      {driverTab === 'jobs' ? body : (
        <div className="space-y-5">
          <TransferPassVerifyBanner result={scanResult} />
          <TransferPassScanner
            onScan={(raw) => setScanResult(verifyTransferPassAgainstBookings(raw, bookings))}
          />
        </div>
      )}
      <PortalBottomNav
        activeId={driverTab}
        ariaLabel="Driver desk navigation"
        items={[
          { id: 'jobs', label: 'Jobs', icon: Car },
          { id: 'scan', label: 'Scan pass', icon: ScanLine }
        ]}
        onChange={setDriverTab}
      />
      </div>
    </DashboardLayout>
  )
}
