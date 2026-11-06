import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { adminMailRequest } from '../lib/admin-mail-api'
import { buildEnquiryFormDetailRows, buildPackageBuildDetailRows, type ClientDataCardRow } from '../lib/client-data-card'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { cx } from '../lib/utils'

type RevenueSummary = {
  companyTotalDisplay: string
  transferCollectedDisplay: string
  invoiceOnlyDisplay: string
  paidTripCount: number
  depositTripCount: number
  paidInvoiceCount: number
}

type PaidTripRow = {
  id: string
  reference: string | null
  guest: string
  email: string | null
  route: string
  paymentStatus: string
  paymentSource?: 'stripe' | 'manual' | null
  quotedEur?: number
  amountReceivedEur?: number
  collectedDisplay: string
  updatedAt: string | null
  needsPaymentSync?: boolean
}

type PaidInvoiceRow = {
  id: string
  reference: string | null
  invoiceNumber: string | null
  collectedDisplay: string
  paidAt: string | null
}

type UnifiedPaymentRow = {
  key: string
  kind: 'transfer' | 'invoice'
  title: string
  subtitle: string
  amount: string
  status: string
  when: string | null
  needsPass?: boolean
  trip?: PaidTripRow
  invoice?: PaidInvoiceRow
}

const fmtWhen = (iso: string | null | undefined) => {
  if (!iso) {
    return '—'
  }
  try {
    return new Intl.DateTimeFormat('en-IE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

type TripLeg = {
  id: string
  route: string
  when: string
  pay: string
  price: string | null
}

type PaidTripDetail = {
  email: string | null
  phone: string | null
  dates: string | null
  party: string | null
  golf: string | null
  hotel: string | null
  legs: TripLeg[]
  answers: ClientDataCardRow[]
}

type ContactChannel = 'email' | 'form' | 'portal'

type ContactItem = {
  id: string
  channel: ContactChannel
  title: string
  detail: string
  at: string | null
  who: string
}

const CONTACT_CHANNEL_LABEL: Record<ContactChannel, string> = {
  email: 'Direct email',
  form: 'Website form',
  portal: 'Portal'
}

const pickAnswer = (rows: readonly ClientDataCardRow[], needles: readonly string[]) =>
  rows.find((row) => needles.some((needle) => row.label.toLowerCase().includes(needle)))?.value ?? null

const formatLegWhen = (scheduledAt: string | null, note: string | null) => {
  if (scheduledAt) {
    return fmtWhen(scheduledAt)
  }
  const trimmed = note?.trim()
  return trimmed || 'ASAP — next available driver'
}

export type PaidClientPriceDraft = {
  email: string
  guest: string
  title: string
  summary: string
}

const draftFromPayment = (
  payment: UnifiedPaymentRow,
  detail: PaidTripDetail | null,
  email: string
): PaidClientPriceDraft => {
  const guest = payment.trip?.guest?.trim() || payment.title
  const route = payment.trip?.route?.trim()
  const title = (route && route !== '—' ? route : payment.subtitle) || `${guest} trip`
  const bits: string[] = []
  if (detail?.dates) bits.push(`Dates: ${detail.dates}`)
  if (detail?.party) bits.push(`Party: ${detail.party}`)
  if (detail?.golf) bits.push(`Golf: ${detail.golf}`)
  if (detail?.hotel) bits.push(`Hotel: ${detail.hotel}`)
  if (detail?.legs.length) {
    bits.push(detail.legs.map((leg) => `${leg.route} (${leg.when})`).join('; '))
  }
  return {
    email: email.trim(),
    guest,
    title: title.slice(0, 140),
    summary: (bits.join('\n') || payment.subtitle).slice(0, 1200)
  }
}

const statusLabel = (raw: string, source?: string | null) => {
  const s = raw.trim().toLowerCase()
  const online = source === 'stripe'
  if (s === 'paid' || s.startsWith('paid')) {
    return online ? 'Paid online' : 'Paid in full · manual'
  }
  if (s === 'deposit') {
    return online ? 'Deposit paid online' : 'Deposit paid · manual'
  }
  return raw || 'Paid'
}

export function AdminPaidTripsRevenuePanel({
  onPreparePrice
}: {
  onPreparePrice?: (draft: PaidClientPriceDraft) => void
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<RevenueSummary | null>(null)
  const [paidTrips, setPaidTrips] = useState<PaidTripRow[]>([])
  const [paidInvoices, setPaidInvoices] = useState<PaidInvoiceRow[]>([])
  const [syncRef, setSyncRef] = useState('')
  const [syncBusy, setSyncBusy] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [tripDetail, setTripDetail] = useState<PaidTripDetail | null>(null)
  const [tripDetailLoading, setTripDetailLoading] = useState(false)
  const [tripDetailError, setTripDetailError] = useState<string | null>(null)
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [contactsNote, setContactsNote] = useState<string | null>(null)
  const [contactsError, setContactsError] = useState<string | null>(null)
  const [payTotal, setPayTotal] = useState('')
  const [payReceived, setPayReceived] = useState('')
  const [payBusy, setPayBusy] = useState(false)
  const [payMessage, setPayMessage] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const sb = getSupabaseBrowserClient()
      const session = await sb?.auth.getSession()
      const token = session?.data.session?.access_token
      if (!token) {
        setError('Sign in again as admin.')
        return
      }
      const res = await fetch('/api/admin-revenue-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'stats' })
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        message?: string
        summary?: RevenueSummary
        paidTrips?: PaidTripRow[]
        paidInvoices?: PaidInvoiceRow[]
      }
      if (!res.ok) {
        throw new Error(data.message ?? res.statusText)
      }
      setSummary(data.summary ?? null)
      setPaidTrips(data.paidTrips ?? [])
      setPaidInvoices(data.paidInvoices ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load payments.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  const handleSyncTripPass = async () => {
    const ref = syncRef.trim()
    if (!ref) {
      setSyncMessage('Enter the booking reference from the guest’s form (e.g. GSI-…).')
      return
    }
    setSyncBusy(true)
    setSyncMessage(null)
    try {
      const sb = getSupabaseBrowserClient()
      const session = await sb?.auth.getSession()
      const token = session?.data.session?.access_token
      if (!token) {
        setSyncMessage('Sign in again as admin.')
        return
      }
      const res = await fetch('/api/admin-revenue-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'sync-trip-pass', referenceId: ref })
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        message?: string
        synced?: boolean
        reason?: string
      }
      if (!res.ok) {
        throw new Error(data.message ?? res.statusText)
      }
      if (data.synced) {
        setSyncMessage(`Pass activated for ${ref}.`)
      } else {
        setSyncMessage(
          data.reason === 'no_paid_invoice_for_reference'
            ? `No paid invoice found for ${ref}.`
            : `Could not activate: ${data.reason ?? 'unknown'}.`
        )
      }
      await loadStats()
    } catch (e) {
      setSyncMessage(e instanceof Error ? e.message : 'Could not activate pass.')
    } finally {
      setSyncBusy(false)
    }
  }

  const rows: UnifiedPaymentRow[] = [
    ...paidTrips.map((row) => ({
      key: `t-${row.id}`,
      kind: 'transfer' as const,
      title: row.guest,
      subtitle: row.route,
      amount: row.collectedDisplay,
      status: statusLabel(row.paymentStatus, row.paymentSource),
      when: row.updatedAt,
      needsPass: Boolean(row.needsPaymentSync),
      trip: row
    })),
    ...paidInvoices.map((row) => ({
      key: `i-${row.id}`,
      kind: 'invoice' as const,
      title: row.invoiceNumber ?? row.reference ?? 'Trip invoice',
      subtitle: row.reference ? `Ref ${row.reference}` : 'Invoice payment',
      amount: row.collectedDisplay,
      status: 'Paid online',
      when: row.paidAt,
      invoice: row
    }))
  ]

  const selected = rows.find((r) => r.key === selectedKey) ?? null

  useEffect(() => {
    const payment =
      rows.find((row) => row.key === selectedKey) ?? null
    if (!payment) {
      setTripDetail(null)
      setTripDetailError(null)
      setTripDetailLoading(false)
      return
    }

    let cancelled = false
    const loadTrip = async () => {
      setTripDetailLoading(true)
      setTripDetailError(null)
      setTripDetail(null)
      try {
        const sb = getSupabaseBrowserClient()
        if (!sb) {
          throw new Error('Supabase is not configured.')
        }
        const reference = (payment.trip?.reference ?? payment.invoice?.reference ?? '').trim()
        const bookingId = payment.trip?.id ?? null

        const bookingSelect =
          'id, client_email, client_display_name, client_phone, pickup_label, dropoff_label, scheduled_at, client_timing_note, enquiry_reference_id, package_build_id, admin_price_eur, payment_status'

        const [bookingRes, legsRes, enquiryRes] = await Promise.all([
          bookingId
            ? sb.from('transfer_bookings').select(bookingSelect).eq('id', bookingId).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          reference
            ? sb
                .from('transfer_bookings')
                .select(bookingSelect)
                .eq('enquiry_reference_id', reference)
                .order('scheduled_at', { ascending: true })
            : Promise.resolve({ data: [] as Record<string, unknown>[], error: null }),
          reference
            ? sb
                .from('enquiries')
                .select('id, reference_id, created_at, form_payload, full_name, phone, email')
                .eq('reference_id', reference)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null })
        ])

        if (bookingRes.error) {
          throw new Error(bookingRes.error.message)
        }
        if (legsRes.error) {
          throw new Error(legsRes.error.message)
        }
        if (enquiryRes.error) {
          throw new Error(enquiryRes.error.message)
        }

        const booking = (bookingRes.data ?? null) as {
          package_build_id?: string | null
          client_phone?: string | null
          client_email?: string | null
        } | null
        const packageId = booking?.package_build_id?.trim() || null
        let packageRow: {
          id: string
          label: string | null
          source: string
          config: unknown
          client_details: unknown
          created_at: string
        } | null = null

        if (packageId) {
          const packageRes = await sb
            .from('package_builds')
            .select('id, label, source, config, client_details, created_at')
            .eq('id', packageId)
            .maybeSingle()
          if (!packageRes.error) {
            packageRow = packageRes.data
          }
        } else if (reference) {
          const packageRes = await sb
            .from('package_builds')
            .select('id, label, source, config, client_details, created_at')
            .eq('enquiry_reference_id', reference)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          if (!packageRes.error) {
            packageRow = packageRes.data
          }
        }

        const enquiry = enquiryRes.data
        const packageAnswers = packageRow ? buildPackageBuildDetailRows(packageRow) : []
        const enquiryAnswers = enquiry ? buildEnquiryFormDetailRows(enquiry) : []
        const answers = (packageAnswers.length > 0 ? packageAnswers : enquiryAnswers).filter(
          (row) => !/terms accepted/i.test(row.label)
        )

        const rawLegs = (legsRes.data ?? []) as {
          id: string
          pickup_label: string | null
          dropoff_label: string | null
          scheduled_at: string | null
          client_timing_note: string | null
          payment_status: string | null
          admin_price_eur: number | null
        }[]
        const legs: TripLeg[] =
          rawLegs.length > 0
            ? rawLegs.map((leg) => ({
                id: leg.id,
                route: `${leg.pickup_label || 'Pickup'} → ${leg.dropoff_label || 'Drop-off'}`,
                when: formatLegWhen(leg.scheduled_at, leg.client_timing_note),
                pay: statusLabel(leg.payment_status ?? ''),
                price:
                  typeof leg.admin_price_eur === 'number' && Number.isFinite(leg.admin_price_eur)
                    ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                        leg.admin_price_eur
                      )
                    : null
              }))
            : payment.trip
              ? [
                  {
                    id: payment.trip.id,
                    route: payment.trip.route,
                    when: fmtWhen(payment.trip.updatedAt),
                    pay: statusLabel(payment.trip.paymentStatus),
                    price: null
                  }
                ]
              : []

        if (cancelled) {
          return
        }
        const resolvedEmail =
          booking?.client_email?.trim() ||
          (enquiry && 'email' in enquiry ? String(enquiry.email ?? '').trim() : '') ||
          payment.trip?.email?.trim() ||
          ''
        const detail: PaidTripDetail = {
          email: resolvedEmail || null,
          phone: booking?.client_phone?.trim() || enquiry?.phone?.trim() || null,
          dates: pickAnswer(answers, ['travel', 'date', 'arrival']),
          party: pickAnswer(answers, ['group', 'party', 'passenger', 'golfer', 'pax']),
          golf: pickAnswer(answers, ['golf', 'course', 'tee']),
          hotel: pickAnswer(answers, ['hotel', 'accommodation', 'stay', 'resort']),
          legs,
          answers
        }
        setTripDetail(detail)
        onPreparePrice?.(draftFromPayment(payment, detail, resolvedEmail))
      } catch (e) {
        if (!cancelled) {
          setTripDetailError(e instanceof Error ? e.message : 'Could not load this trip.')
        }
      } finally {
        if (!cancelled) {
          setTripDetailLoading(false)
        }
      }
    }

    void loadTrip()
    return () => {
      cancelled = true
    }
    // `rows` is derived from the loaded payment lists. Depend on those lists, not the array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, paidTrips, paidInvoices, onPreparePrice])

  const contactEmail = (tripDetail?.email || selected?.trip?.email || '').trim()
  const contactReference = (selected?.trip?.reference || selected?.invoice?.reference || '').trim()

  useEffect(() => {
    if (!selectedKey) {
      setContacts([])
      setContactsNote(null)
      setContactsError(null)
      setContactsLoading(false)
      return
    }
    if (!contactEmail && !contactReference) {
      setContacts([])
      setContactsNote('No email on this payment yet, so messages cannot be matched.')
      setContactsError(null)
      setContactsLoading(false)
      return
    }

    let cancelled = false
    const loadContacts = async () => {
      setContactsLoading(true)
      setContactsError(null)
      try {
        const sb = getSupabaseBrowserClient()
        const token = (await sb?.auth.getSession())?.data.session?.access_token
        if (!token) {
          throw new Error('Sign in again to load this guest’s messages.')
        }
        const data = await adminMailRequest<{
          items?: ContactItem[]
          gmailNote?: string | null
        }>(token, {
          action: 'customer-correspondence',
          email: contactEmail,
          reference: contactReference
        })
        if (cancelled) return
        setContacts(Array.isArray(data.items) ? data.items : [])
        setContactsNote(data.gmailNote?.trim() || null)
      } catch (e) {
        if (!cancelled) {
          setContacts([])
          setContactsError(e instanceof Error ? e.message : 'Could not load messages.')
        }
      } finally {
        if (!cancelled) setContactsLoading(false)
      }
    }

    void loadContacts()
    return () => {
      cancelled = true
    }
  }, [selectedKey, contactEmail, contactReference])

  useEffect(() => {
    const trip = selected?.trip
    if (!trip) {
      setPayTotal('')
      setPayReceived('')
      setPayMessage(null)
      return
    }
    setPayTotal(trip.quotedEur && trip.quotedEur > 0 ? String(trip.quotedEur) : '')
    setPayReceived(
      trip.paymentStatus === 'deposit' && trip.amountReceivedEur && trip.amountReceivedEur > 0
        ? String(trip.amountReceivedEur)
        : ''
    )
    setPayMessage(null)
    // Prefill only when the guest changes. Reloading the list must not wipe a figure being typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey])

  const markManualPayment = async (paymentStatus: 'deposit' | 'paid') => {
    const bookingId = selected?.trip?.id
    if (!bookingId) {
      setPayMessage('This row has no transfer to update. Add a price below and mark the payment there.')
      return
    }
    const total = Number(payTotal.replace(/,/g, '').trim())
    const received = Number(payReceived.replace(/,/g, '').trim())
    if (!Number.isFinite(total) || total <= 0) {
      setPayMessage('Enter the trip total in euros.')
      return
    }
    if (paymentStatus === 'deposit' && (!Number.isFinite(received) || received <= 0 || received >= total)) {
      setPayMessage('Enter the deposit you received. It must be more than zero and less than the total.')
      return
    }
    setPayBusy(true)
    setPayMessage(null)
    try {
      const sb = getSupabaseBrowserClient()
      const token = (await sb?.auth.getSession())?.data.session?.access_token
      if (!token) {
        throw new Error('Sign in again as admin.')
      }
      const res = await fetch('/api/transfer-payment-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'set_payment',
          bookingId,
          paymentStatus,
          totalEur: total,
          amountReceivedEur: paymentStatus === 'paid' ? total : received,
          paymentSource: 'manual',
          sendCustomerEmails: true
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        throw new Error(data.message || 'Could not save the payment.')
      }
      setPayMessage(
        paymentStatus === 'paid'
          ? `Marked paid in full manually · €${total}. We emailed them the invoice.`
          : `Marked deposit paid manually · €${received} of €${total}. We emailed them the invoice.`
      )
      await loadStats()
    } catch (e) {
      setPayMessage(e instanceof Error ? e.message : 'Could not save the payment.')
    } finally {
      setPayBusy(false)
    }
  }
  const companyTotal = summary?.companyTotalDisplay ?? (loading ? '…' : '€0.00')
  const tripBits = summary
    ? `${summary.paidTripCount + summary.depositTripCount} transfer · ${summary.paidInvoiceCount} invoice`
    : 'Transfers and invoices paid in Stripe'

  return (
    <section
      aria-labelledby="admin-paid-trips-heading"
      className="overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft"
      id="admin-hub-revenue"
    >
      <header className="border-b border-forest-100 bg-offwhite/80 px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">2 · Payments</p>
            <h3 className="font-display mt-1 text-xl font-semibold text-forest-950 sm:text-2xl" id="admin-paid-trips-heading">
              Payments received
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-forest-700">
              What guests have paid through Stripe. Tap a client to open the trip, every message, and fill Add a price with their email.
            </p>
          </div>
          <button
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-forest-200 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-forest-900 transition hover:bg-fairway-50 disabled:opacity-60"
            disabled={loading}
            onClick={() => void loadStats()}
            type="button"
          >
            <RefreshCw className={cx('h-4 w-4', loading && 'animate-spin')} aria-hidden />
            Refresh
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-fairway-200 bg-gradient-to-br from-fairway-50 to-white px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-700">Total taken in</p>
          <p className="font-display mt-1 text-3xl font-bold tracking-tight text-forest-950 sm:text-4xl">{companyTotal}</p>
          <p className="mt-1 text-sm text-forest-600">{loading ? 'Loading…' : tripBits}</p>
        </div>
      </header>

      <div className="space-y-6 p-5 sm:p-7">
        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
            {error}
          </p>
        ) : null}

        <div className="space-y-5">
          <div>
            {loading ? (
              <p className="text-sm text-forest-600">Loading payments…</p>
            ) : rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-forest-200 bg-offwhite/70 px-5 py-8 text-center">
                <p className="font-display text-lg font-semibold text-forest-950">No payments yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-forest-600">
                  When a guest pays a deposit, balance, or invoice, it shows up here.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {rows.map((row) => (
                  <li key={row.key}>
                    <button
                      className={cx(
                        'w-full rounded-2xl border px-4 py-3.5 text-left transition sm:px-5',
                        selectedKey === row.key
                          ? 'border-fairway-500 bg-fairway-50'
                          : 'border-forest-100 bg-white hover:border-fairway-300 hover:bg-offwhite/50'
                      )}
                      onClick={() => {
                        setSelectedKey(row.key)
                        onPreparePrice?.(draftFromPayment(row, null, row.trip?.email ?? ''))
                      }}
                      type="button"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-forest-950">{row.title}</p>
                          <p className="mt-0.5 text-sm text-forest-600">{row.subtitle}</p>
                        </div>
                        <p className="font-display text-lg font-bold text-forest-950">{row.amount}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-forest-100 px-2.5 py-0.5 font-semibold text-forest-900">
                          {row.status}
                        </span>
                        <span className="text-ge-gray500">{fmtWhen(row.when)}</span>
                        {row.needsPass ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-950">
                            Needs pass
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selected ? (
            <article className="rounded-[1.5rem] border border-forest-200 bg-offwhite/70 p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">Trip they paid for</p>
              <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-2xl font-semibold text-forest-950">{selected.title}</h4>
                  <p className="mt-1 text-sm text-forest-700">
                    {selected.trip?.email ?? 'No email on file'}
                    {tripDetail?.phone ? ` · ${tripDetail.phone}` : ''}
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-forest-900">
                    {selected.trip?.reference ?? selected.invoice?.reference ?? 'No reference'}
                    {selected.invoice?.invoiceNumber ? ` · ${selected.invoice.invoiceNumber}` : ''}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-display text-3xl font-bold text-forest-950">{selected.amount}</p>
                  <p className="mt-1 text-sm font-semibold text-forest-800">{selected.status}</p>
                </div>
              </div>

              {selected.trip ? (
                <p
                  className={cx(
                    'mt-4 rounded-xl px-3 py-2 text-sm leading-relaxed',
                    selected.trip.needsPaymentSync || selected.trip.paymentStatus.toLowerCase() === 'deposit'
                      ? 'border border-amber-200 bg-amber-50 text-amber-950'
                      : 'border border-emerald-200 bg-emerald-50 text-emerald-950'
                  )}
                >
                  {selected.trip.needsPaymentSync
                    ? 'Payment is on file. Use “Fix trip pass” below if they still need a scannable pass.'
                    : selected.trip.paymentStatus.toLowerCase() === 'deposit'
                      ? 'Deposit only. The trip pass unlocks when the balance is paid.'
                      : 'Paid in full. Their trip pass is active.'}
                </p>
              ) : null}

              {tripDetailLoading ? <p className="mt-4 text-sm text-forest-700">Loading the trip…</p> : null}
              {tripDetailError ? (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                  {tripDetailError}
                </p>
              ) : null}

              {tripDetail ? (
                <div className="mt-5 space-y-5">
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['Travel dates', tripDetail.dates],
                      ['Party', tripDetail.party],
                      ['Golf', tripDetail.golf],
                      ['Hotel', tripDetail.hotel]
                    ].map(([label, value]) =>
                      value ? (
                        <div className="rounded-xl border border-forest-100 bg-white px-4 py-3" key={label}>
                          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">{label}</dt>
                          <dd className="mt-1 text-sm font-medium leading-relaxed text-forest-950">{value}</dd>
                        </div>
                      ) : null
                    )}
                  </dl>

                  {tripDetail.legs.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">Transfers on this trip</p>
                      <ul className="mt-2 space-y-2">
                        {tripDetail.legs.map((leg) => (
                          <li className="rounded-xl border border-forest-100 bg-white px-4 py-3" key={leg.id}>
                            <p className="font-semibold text-forest-950">{leg.route}</p>
                            <p className="mt-1 text-sm text-forest-700">
                              {leg.when}
                              {' · '}
                              {leg.pay}
                              {leg.price ? ` · quoted ${leg.price}` : ''}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {tripDetail.answers.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">What they booked</p>
                      <dl className="mt-2 grid gap-px overflow-hidden rounded-xl border border-forest-100 bg-forest-100 sm:grid-cols-2">
                        {tripDetail.answers.map((row) => (
                          <div className="bg-white px-4 py-3" key={`${row.label}-${row.value}`}>
                            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">{row.label}</dt>
                            <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-forest-950">{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : !tripDetailLoading ? (
                    <p className="text-sm text-forest-700">No website form is linked to this payment yet.</p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-6 border-t border-forest-200 pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">Record a payment</p>
                <h5 className="font-display mt-1 text-lg font-semibold text-forest-950">Paid online or marked by you</h5>
                <p className="mt-1 text-sm leading-relaxed text-forest-700">
                  Stripe stays labelled paid online. Use this when you took the money yourself: type the total, then mark a deposit or paid in full with the amount.
                </p>
                {selected.trip ? (
                  <p className="mt-3 text-sm font-semibold text-forest-950">
                    Now: {statusLabel(selected.trip.paymentStatus, selected.trip.paymentSource)}
                    {selected.trip.quotedEur ? ` · total €${selected.trip.quotedEur}` : ''}
                    {selected.trip.amountReceivedEur ? ` · received €${selected.trip.amountReceivedEur}` : ''}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-forest-700">
                    This invoice was paid online. To record a manual amount, use Add a price below and mark deposit or paid in full.
                  </p>
                )}
                {selected.trip ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">
                      Trip total (€)
                      <input
                        className="mt-1 min-h-11 w-full rounded-xl border border-forest-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-forest-950 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                        inputMode="decimal"
                        min={0}
                        onChange={(e) => {
                          setPayTotal(e.target.value)
                          setPayMessage(null)
                        }}
                        type="number"
                        value={payTotal}
                      />
                    </label>
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">
                      Deposit received (€)
                      <input
                        className="mt-1 min-h-11 w-full rounded-xl border border-forest-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-forest-950 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                        inputMode="decimal"
                        min={0}
                        onChange={(e) => {
                          setPayReceived(e.target.value)
                          setPayMessage(null)
                        }}
                        placeholder="Only for a deposit"
                        type="number"
                        value={payReceived}
                      />
                    </label>
                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      <button
                        className="min-h-11 rounded-full border border-forest-300 bg-white px-5 text-sm font-semibold text-forest-950 hover:bg-offwhite disabled:opacity-60"
                        disabled={payBusy}
                        onClick={() => void markManualPayment('deposit')}
                        type="button"
                      >
                        {payBusy ? 'Saving…' : 'Mark deposit paid'}
                      </button>
                      <button
                        className="min-h-11 rounded-full bg-forest-900 px-5 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
                        disabled={payBusy}
                        onClick={() => void markManualPayment('paid')}
                        type="button"
                      >
                        {payBusy ? 'Saving…' : 'Mark paid in full'}
                      </button>
                    </div>
                    {payMessage ? (
                      <p className="text-sm font-medium text-forest-900 sm:col-span-2" role="status">
                        {payMessage}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 border-t border-forest-200 pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">Messages</p>
                <h5 className="font-display mt-1 text-lg font-semibold text-forest-950">Everything we have from this guest</h5>
                <p className="mt-1 text-sm leading-relaxed text-forest-700">
                  Each note says how they got in touch: direct email, a website form, or the client portal.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-forest-900 px-2.5 py-1 text-white">Direct email</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-950">Website form</span>
                  <span className="rounded-full bg-fairway-50 px-2.5 py-1 text-forest-950">Portal</span>
                </div>
                {contactsLoading ? <p className="mt-4 text-sm text-forest-700">Loading messages…</p> : null}
                {contactsError ? (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                    {contactsError}
                  </p>
                ) : null}
                {contactsNote ? <p className="mt-3 text-sm leading-relaxed text-forest-700">{contactsNote}</p> : null}
                {!contactsLoading && !contactsError && contacts.length === 0 ? (
                  <p className="mt-4 text-sm text-forest-700">No emails, forms, or portal tickets for this guest yet.</p>
                ) : null}
                {contacts.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {contacts.map((item) => (
                      <li className="rounded-xl border border-forest-100 bg-white px-4 py-3" key={item.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={cx(
                              'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                              item.channel === 'email' && 'bg-forest-900 text-white',
                              item.channel === 'form' && 'bg-amber-100 text-amber-950',
                              item.channel === 'portal' && 'bg-fairway-50 text-forest-950'
                            )}
                          >
                            {CONTACT_CHANNEL_LABEL[item.channel] ?? item.who}
                          </span>
                          <span className="text-xs text-forest-600">{fmtWhen(item.at)}</span>
                        </div>
                        <p className="mt-2 font-semibold text-forest-950">{item.title}</p>
                        {item.who && item.who !== CONTACT_CHANNEL_LABEL[item.channel] ? (
                          <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-forest-600">{item.who}</p>
                        ) : null}
                        {item.detail ? (
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-forest-800">{item.detail}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ) : (
            <p className="rounded-2xl border border-dashed border-forest-200 bg-white px-4 py-4 text-sm text-forest-700">
              Tap a client above to see the trip they paid for.
            </p>
          )}
        </div>

        <details className="rounded-2xl border border-forest-100 bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-forest-900">
            Fix trip pass (rare)
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-forest-600">
            Only if a guest paid an invoice but still has no scannable pass. Enter their booking reference.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className="min-h-11 flex-1 rounded-xl border border-forest-200 bg-offwhite px-3 font-mono text-sm text-forest-950 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
              onChange={(e) => setSyncRef(e.target.value)}
              placeholder="GSI-…"
              value={syncRef}
            />
            <button
              className="min-h-11 shrink-0 rounded-xl bg-forest-900 px-5 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
              disabled={syncBusy}
              onClick={() => void handleSyncTripPass()}
              type="button"
            >
              {syncBusy ? 'Working…' : 'Activate pass'}
            </button>
          </div>
          {syncMessage ? (
            <p className="mt-2 text-sm text-forest-800" role="status">
              {syncMessage}
            </p>
          ) : null}
        </details>
      </div>
    </section>
  )
}
