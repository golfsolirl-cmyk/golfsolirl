import { useCallback, useMemo, useState } from 'react'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { PORTAL_INTEREST_LABELS, type PortalInterestCategory } from '../lib/portal-interest-tickets'
import { useAuth } from '../providers/auth-provider'
import { LuxuryButton } from './ui/button'

type VatTreatmentChoice = 'tourism' | 'services'

type HubBookingRow = {
  id: string
  pickup_label: string
  dropoff_label: string
  status: string
  scheduled_at: string | null
  client_email: string | null
  booking_source: string | null
  enquiry_reference_id: string | null
  package_build_id: string | null
  payment_status: string | null
  deposit_percent: number | null
  balance_remind_at: string | null
  balance_remind_sent_at: string | null
  admin_price_eur: number | null
  admin_price_vat_treatment: string | null
  assigned_driver_id: string | null
  created_at: string
}

type EnquiryLite = {
  id: string
  reference_id: string
  created_at: string
  interest: string | null
  full_name: string | null
}

type PackageLite = {
  id: string
  label: string | null
  source: string
  created_at: string
}

type TicketLite = {
  id: string
  category: string
  status: string
  created_at: string
}

type ActivityItem =
  | { kind: 'transfer'; at: string; bookingId: string }
  | { kind: 'enquiry'; at: string; enquiry: EnquiryLite }
  | { kind: 'package'; at: string; pkg: PackageLite }
  | { kind: 'ticket'; at: string; ticket: TicketLite }

const formatAdminDateTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return iso
  }
  return d.toLocaleString('en-GB', {
    timeZone: 'Europe/Dublin',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const formatEur = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export function AdminAccountTransfersHub() {
  const { session, profile } = useAuth()
  const supabase = getSupabaseBrowserClient()
  const [inputRef, setInputRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(null)
  const [rows, setRows] = useState<HubBookingRow[]>([])
  const [enquiryRows, setEnquiryRows] = useState<EnquiryLite[]>([])
  const [packageRows, setPackageRows] = useState<PackageLite[]>([])
  const [ticketRows, setTicketRows] = useState<TicketLite[]>([])
  const [priceDraft, setPriceDraft] = useState<Record<string, string>>({})
  const [vatDraft, setVatDraft] = useState<Record<string, VatTreatmentChoice>>({})
  const [priceBusyId, setPriceBusyId] = useState<string | null>(null)
  const [payBusyId, setPayBusyId] = useState<string | null>(null)
  const [payRequestBusyId, setPayRequestBusyId] = useState<string | null>(null)
  const [sendCustomerEmails, setSendCustomerEmails] = useState(true)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const isAdmin = profile?.role === 'admin'

  const activityTimeline = useMemo((): ActivityItem[] => {
    const items: ActivityItem[] = []
    for (const b of rows) {
      items.push({ kind: 'transfer', at: b.created_at, bookingId: b.id })
    }
    for (const e of enquiryRows) {
      items.push({ kind: 'enquiry', at: e.created_at, enquiry: e })
    }
    for (const p of packageRows) {
      items.push({ kind: 'package', at: p.created_at, pkg: p })
    }
    for (const t of ticketRows) {
      items.push({ kind: 'ticket', at: t.created_at, ticket: t })
    }
    return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  }, [rows, enquiryRows, packageRows, ticketRows])

  const loadByAccountRef = useCallback(async () => {
    setStatusMsg(null)
    setError(null)
    const raw = inputRef.trim()
    if (!raw || !supabase || !session?.access_token) {
      setError(!raw ? 'Paste an account or enquiry reference (e.g. GSI-…).' : 'Sign in again as admin.')
      return
    }
    if (!isAdmin) {
      return
    }

    setLoading(true)
    try {
      const refIds = new Set<string>([raw])

      const prof = await supabase
        .from('profiles')
        .select('id, email, full_name, account_reference_id')
        .ilike('account_reference_id', raw)
        .maybeSingle()

      let uid: string | null = null
      let email: string | null = null
      let label = `Reference ${raw}`

      if (!prof.error && prof.data) {
        const p = prof.data as { id: string; email: string | null; full_name: string | null; account_reference_id: string | null }
        uid = p.id
        email = (p.email ?? '').trim().toLowerCase() || null
        label = `${(p.full_name ?? '').trim() || 'Client'} · ${email ?? p.id}`
      }

      const enqOne = await supabase.from('enquiries').select('email, reference_id, full_name').eq('reference_id', raw).maybeSingle()
      if (!enqOne.error && enqOne.data) {
        const e = enqOne.data as { email: string; reference_id: string; full_name: string | null }
        const em = (e.email ?? '').trim().toLowerCase()
        if (em) {
          email = em
        }
        if (e.reference_id) {
          refIds.add(e.reference_id.trim())
        }
        if (!uid) {
          label = `${(e.full_name ?? '').trim() || 'Enquiry'} · ${em || raw}`
        }
      }

      if (email && !uid) {
        const pr2 = await supabase.from('profiles').select('id, email, full_name').ilike('email', email).maybeSingle()
        if (!pr2.error && pr2.data) {
          uid = (pr2.data as { id: string }).id
          const fn = (pr2.data as { full_name?: string | null }).full_name
          label = `${(fn ?? '').trim() || 'Client'} · ${email}`
        }
      }

      if (email) {
        const enqAll = await supabase.from('enquiries').select('reference_id').ilike('email', email)
        if (!enqAll.error && enqAll.data) {
          for (const r of enqAll.data as { reference_id: string }[]) {
            if (r.reference_id?.trim()) {
              refIds.add(r.reference_id.trim())
            }
          }
        }
      }

      const orParts: string[] = []
      if (uid) {
        orParts.push(`client_user_id.eq.${uid}`)
      }
      if (email) {
        orParts.push(`client_email.eq.${email}`)
      }
      for (const r of refIds) {
        if (r) {
          orParts.push(`enquiry_reference_id.eq.${r}`)
        }
      }

      if (orParts.length === 0) {
        setRows([])
        setEnquiryRows([])
        setPackageRows([])
        setTicketRows([])
        setResolvedLabel(null)
        setError('No profile or enquiry matched that reference. Check the pasted ID.')
        return
      }

      const enquirySelect = email
        ? supabase
            .from('enquiries')
            .select('id, reference_id, created_at, interest, full_name')
            .ilike('email', email)
            .order('created_at', { ascending: false })
            .limit(50)
        : Promise.resolve({ data: [], error: null as null })

      const packageSelect = uid
        ? supabase
            .from('package_builds')
            .select('id, label, source, created_at')
            .eq('owner_id', uid)
            .order('created_at', { ascending: false })
            .limit(40)
        : Promise.resolve({ data: [], error: null as null })

      const ticketSelect = uid
        ? supabase
            .from('portal_interest_tickets')
            .select('id, category, status, created_at')
            .eq('owner_id', uid)
            .order('created_at', { ascending: false })
            .limit(40)
        : Promise.resolve({ data: [], error: null as null })

      const [tb, enqRes, pkgRes, tktRes] = await Promise.all([
        supabase
          .from('transfer_bookings')
          .select(
            'id, pickup_label, dropoff_label, status, scheduled_at, client_email, booking_source, enquiry_reference_id, package_build_id, payment_status, deposit_percent, balance_remind_at, balance_remind_sent_at, admin_price_eur, admin_price_vat_treatment, assigned_driver_id, created_at'
          )
          .or(orParts.join(','))
          .order('created_at', { ascending: false })
          .limit(120),
        enquirySelect,
        packageSelect,
        ticketSelect
      ])

      if (tb.error) {
        setRows([])
        setEnquiryRows([])
        setPackageRows([])
        setTicketRows([])
        setResolvedLabel(null)
        setError(tb.error.message)
        return
      }

      const dedup = new Map<string, HubBookingRow>()
      for (const row of (tb.data ?? []) as HubBookingRow[]) {
        dedup.set(row.id, row)
      }
      const list = [...dedup.values()]
      setRows(list)

      if (!enqRes.error && enqRes.data) {
        setEnquiryRows(enqRes.data as EnquiryLite[])
      } else {
        setEnquiryRows([])
      }

      if (!pkgRes.error && pkgRes.data) {
        setPackageRows(pkgRes.data as PackageLite[])
      } else {
        setPackageRows([])
      }

      if (!tktRes.error && tktRes.data) {
        setTicketRows(tktRes.data as TicketLite[])
      } else {
        setTicketRows([])
      }

      const nEnq = !enqRes.error ? (enqRes.data ?? []).length : 0
      const nPkg = !pkgRes.error ? (pkgRes.data ?? []).length : 0
      const nTkt = !tktRes.error ? (tktRes.data ?? []).length : 0
      setResolvedLabel(
        `${label} · ${list.length} transfer job${list.length === 1 ? '' : 's'} · ${nEnq} enquiry row${nEnq === 1 ? '' : 's'} · ${nPkg} saved package${nPkg === 1 ? '' : 's'} · ${nTkt} portal ticket${nTkt === 1 ? '' : 's'}`
      )

      const nextDraft: Record<string, string> = {}
      const nextVat: Record<string, VatTreatmentChoice> = {}
      for (const r of list) {
        nextDraft[r.id] =
          typeof r.admin_price_eur === 'number' && Number.isFinite(r.admin_price_eur) ? String(r.admin_price_eur) : ''
        nextVat[r.id] = r.admin_price_vat_treatment === 'services' ? 'services' : 'tourism'
      }
      setPriceDraft(nextDraft)
      setVatDraft(nextVat)
    } finally {
      setLoading(false)
    }
  }, [inputRef, isAdmin, session?.access_token, supabase])

  const savePrice = async (bookingId: string) => {
    setStatusMsg(null)
    setError(null)
    if (!session?.access_token) {
      setError('Sign in again as admin.')
      return
    }
    const raw = (priceDraft[bookingId] ?? '').trim().replace(/,/g, '')
    setPriceBusyId(bookingId)
    try {
      const res = await fetch('/api/transfer-payment-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'set_admin_price',
          bookingId,
          adminPriceEur: raw === '' ? null : Number(raw),
          adminPriceVatTreatment: raw === '' ? null : (vatDraft[bookingId] ?? 'tourism')
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        throw new Error(data.message || 'Could not save price.')
      }
      setStatusMsg('Quoted EUR saved.')
      const cur = rows.find((r) => r.id === bookingId)
      if (cur) {
        const n =
          raw === '' || !Number.isFinite(Number(raw))
            ? null
            : Math.round(Number(raw) * 100) / 100
        const vt =
          n === null ? null : (vatDraft[bookingId] ?? 'tourism') === 'services' ? 'services' : 'tourism'
        setRows((prev) =>
          prev.map((r) =>
            r.id === bookingId ? { ...r, admin_price_eur: n, admin_price_vat_treatment: vt } : r
          )
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setPriceBusyId(null)
    }
  }

  const setPayment = async (bookingId: string, paymentStatus: 'unpaid' | 'deposit' | 'paid') => {
    setStatusMsg(null)
    setError(null)
    if (!session?.access_token) {
      setError('Sign in again as admin.')
      return
    }
    setPayBusyId(bookingId)
    try {
      const res = await fetch('/api/transfer-payment-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'set_payment',
          bookingId,
          paymentStatus,
          depositPercent: 20,
          sendCustomerEmails
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        throw new Error(data.message || 'Payment update failed.')
      }
      setStatusMsg(data.message || 'Payment status updated.')
      const { data: one } = await supabase!
        .from('transfer_bookings')
        .select('payment_status, deposit_percent, balance_remind_at, balance_remind_sent_at')
        .eq('id', bookingId)
        .maybeSingle()
      if (one) {
        const u = one as HubBookingRow
        setRows((prev) =>
          prev.map((r) =>
            r.id === bookingId
              ? {
                  ...r,
                  payment_status: u.payment_status,
                  deposit_percent: u.deposit_percent,
                  balance_remind_at: u.balance_remind_at,
                  balance_remind_sent_at: u.balance_remind_sent_at
                }
              : r
          )
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment update failed.')
    } finally {
      setPayBusyId(null)
    }
  }

  const sendPaymentRequestEmail = async (bookingId: string) => {
    setStatusMsg(null)
    setError(null)
    if (!session?.access_token) {
      setError('Sign in again as admin.')
      return
    }
    setPayRequestBusyId(bookingId)
    try {
      const res = await fetch('/api/transfer-payment-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'send_payment_request_email',
          bookingId
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; sentTo?: string | null }
      if (!res.ok) {
        throw new Error(data.message || 'Could not send email.')
      }
      setStatusMsg(
        data.sentTo ? `Payment request email sent to ${data.sentTo}` : 'Payment request email sent.'
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Email failed.')
    } finally {
      setPayRequestBusyId(null)
    }
  }

  const scrollToPipelineRow = (bookingId: string) => {
    document.getElementById(`admin-transfer-booking-${bookingId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const renderTransferCard = (b: HubBookingRow) => {
    const paySt = (b.payment_status ?? 'unpaid').toLowerCase()
    const pct = typeof b.deposit_percent === 'number' ? b.deposit_percent : 20
    const payBusy = payBusyId === b.id
    const priceBusy = priceBusyId === b.id
    const reqBusy = payRequestBusyId === b.id
    const src =
      b.booking_source === 'website_enquiry'
        ? 'Website form'
        : b.package_build_id
          ? 'Trip planner (saved)'
          : 'Client dashboard'
    const clientMail = (b.client_email ?? '').trim()
    return (
      <div className="rounded-2xl border border-forest-200/90 bg-white/95 p-4 shadow-inner sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-forest-900">
              {b.pickup_label} → {b.dropoff_label}
            </p>
            <p className="mt-1 text-xs text-forest-600">
              {src} · {b.status.replace(/_/g, ' ')}
              {b.scheduled_at ? ` · ${formatAdminDateTime(b.scheduled_at)}` : ' · Pick-up time TBC'}
            </p>
            <p className="mt-1 text-xs text-forest-500">
              {clientMail || '—'}
              {b.enquiry_reference_id ? ` · Enquiry ${b.enquiry_reference_id}` : ''}
            </p>
            <p className="mt-1 font-mono text-[0.65rem] text-forest-400">{b.id}</p>
          </div>
          <LuxuryButton
            className="!px-3 !py-2 !text-xs shrink-0"
            onClick={() => scrollToPipelineRow(b.id)}
            type="button"
            variant="outline"
          >
            Assign driver in pipeline
          </LuxuryButton>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-forest-100 pt-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="block">
            <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wide text-gold-600">Quoted EUR (VAT incl.)</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="w-28 rounded-xl border border-forest-200 px-3 py-2 text-sm text-forest-900"
                inputMode="decimal"
                onChange={(e) => setPriceDraft((m) => ({ ...m, [b.id]: e.target.value }))}
                placeholder="—"
                type="text"
                value={priceDraft[b.id] ?? ''}
              />
              <LuxuryButton
                className="!px-3 !py-2 !text-xs"
                disabled={priceBusy}
                onClick={() => void savePrice(b.id)}
                type="button"
                variant="secondary"
              >
                {priceBusy ? 'Saving…' : 'Save price'}
              </LuxuryButton>
            </div>
          </label>
          <fieldset className="min-w-0 flex-1 rounded-xl border border-forest-100 bg-offwhite/80 px-3 py-2">
            <legend className="px-1 text-[0.62rem] font-bold uppercase tracking-wide text-forest-600">
              Irish VAT on total
            </legend>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-forest-800">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  checked={(vatDraft[b.id] ?? 'tourism') === 'tourism'}
                  className="h-4 w-4 shrink-0 rounded border-forest-300 text-fairway-700 focus:ring-fairway-500"
                  name={`vat-${b.id}`}
                  onChange={() => setVatDraft((m) => ({ ...m, [b.id]: 'tourism' }))}
                  type="radio"
                />
                <span>Tourism 13.5%</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  checked={(vatDraft[b.id] ?? 'tourism') === 'services'}
                  className="h-4 w-4 shrink-0 rounded border-forest-300 text-fairway-700 focus:ring-fairway-500"
                  name={`vat-${b.id}`}
                  onChange={() => setVatDraft((m) => ({ ...m, [b.id]: 'services' }))}
                  type="radio"
                />
                <span>Services 23%</span>
              </label>
            </div>
          </fieldset>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
              paySt === 'paid'
                ? 'bg-fairway-100 text-fairway-900'
                : paySt === 'deposit'
                  ? 'bg-amber-100 text-amber-950'
                  : 'bg-offwhite text-forest-600'
            }`}
          >
            {paySt === 'paid' ? 'Paid in full' : paySt === 'deposit' ? `${pct}% deposit` : 'Unpaid'}
          </span>
          {typeof b.admin_price_eur === 'number' && Number.isFinite(b.admin_price_eur) ? (
            <span className="text-xs font-semibold text-fairway-800">
              {formatEur(b.admin_price_eur)} quoted · VAT{' '}
              {b.admin_price_vat_treatment === 'services' ? 'services 23%' : 'tourism 13.5%'}
            </span>
          ) : null}
          {b.assigned_driver_id ? (
            <span className="text-xs text-forest-600">Driver assigned</span>
          ) : (
            <span className="text-xs text-forest-500">No driver yet</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <LuxuryButton
            className="!px-3 !py-2 !text-xs"
            disabled={payBusy || paySt === 'unpaid'}
            onClick={() => void setPayment(b.id, 'unpaid')}
            type="button"
            variant="white"
          >
            Unpaid
          </LuxuryButton>
          <LuxuryButton
            className="!px-3 !py-2 !text-xs !font-semibold shadow-sm"
            disabled={payBusy || paySt === 'deposit'}
            onClick={() => void setPayment(b.id, 'deposit')}
            type="button"
            variant="secondary"
          >
            20% deposit
          </LuxuryButton>
          <LuxuryButton
            className="!px-3 !py-2 !text-xs"
            disabled={payBusy || paySt === 'paid'}
            onClick={() => void setPayment(b.id, 'paid')}
            type="button"
            variant="primary"
          >
            Paid in full
          </LuxuryButton>
          <LuxuryButton
            className="!px-3 !py-2 !text-xs !font-semibold !border-2 !border-amber-700/35 !bg-amber-100 !text-amber-950 hover:!bg-amber-200/90 hover:!border-amber-800/40"
            disabled={reqBusy || !clientMail}
            onClick={() => void sendPaymentRequestEmail(b.id)}
            title={!clientMail ? 'No client email on this transfer row' : 'Branded email with dashboard payment preview link'}
            type="button"
            variant="white"
          >
            {reqBusy ? 'Sending…' : 'Email payment request'}
          </LuxuryButton>
        </div>
      </div>
    )
  }

  if (!isAdmin || !supabase) {
    return null
  }

  return (
    <section
      aria-label="Look up transfers by account number"
      className="rounded-3xl border-2 border-gs-green/20 bg-gradient-to-br from-white via-offwhite/90 to-fairway-50/40 p-6 shadow-soft sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Account lookup</p>
      <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">Customer activity &amp; transfers</h2>
      <p className="mt-2 max-w-3xl text-sm text-forest-600">
        Paste an <strong className="font-medium text-forest-800">account number</strong> or{' '}
        <strong className="font-medium text-forest-800">GSI-</strong> enquiry ref. You will see{' '}
        <strong className="font-medium text-forest-800">form enquiries</strong>,{' '}
        <strong className="font-medium text-forest-800">saved packages</strong>,{' '}
        <strong className="font-medium text-forest-800">portal interest tickets</strong>, and{' '}
        <strong className="font-medium text-forest-800">transfer jobs</strong> in one timeline (newest first). For each transfer,
        set quoted EUR, record payment, or send a <strong className="font-medium text-forest-800">branded payment-request email</strong>{' '}
        with a dashboard preview link (live card checkout can replace this later).
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">Account / enquiry ref</span>
          <input
            className="w-full rounded-2xl border-2 border-forest-200 bg-white px-4 py-3 font-mono text-sm text-forest-900 outline-none transition focus:border-fairway-500"
            onChange={(e) => setInputRef(e.target.value)}
            placeholder="GSI-…"
            type="text"
            value={inputRef}
          />
        </label>
        <LuxuryButton disabled={loading} onClick={() => void loadByAccountRef()} type="button" variant="primary">
          {loading ? 'Loading…' : 'Load customer'}
        </LuxuryButton>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-forest-800">
        <input
          checked={sendCustomerEmails}
          className="mt-1 h-4 w-4 shrink-0 rounded border-forest-300 text-fairway-700 focus:ring-fairway-500"
          onChange={(e) => setSendCustomerEmails(e.target.checked)}
          type="checkbox"
        />
        <span>
          <span className="font-medium">Send customer thank-you email</span> when marking deposit or paid (same as enquiry workspace).
        </span>
      </label>

      {error ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950" role="alert">
          {error}
        </p>
      ) : null}
      {statusMsg && !error ? (
        <p className="mt-4 text-sm font-medium text-fairway-900" role="status">
          {statusMsg}
        </p>
      ) : null}

      {resolvedLabel ? (
        <p className="mt-4 text-sm font-semibold text-forest-800">{resolvedLabel}</p>
      ) : null}

      {activityTimeline.length > 0 ? (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Activity timeline</p>
          <p className="mt-1 text-xs text-forest-500">Includes enquiries and portal requests when we can match email or profile.</p>
          <ul className="mt-4 space-y-4">
            {activityTimeline.map((item) => {
              const key =
                item.kind === 'transfer'
                  ? `t-${item.bookingId}`
                  : item.kind === 'enquiry'
                    ? `e-${item.enquiry.id}`
                    : item.kind === 'package'
                      ? `p-${item.pkg.id}`
                      : `tk-${item.ticket.id}`
              if (item.kind === 'transfer') {
                const b = rows.find((r) => r.id === item.bookingId)
                if (!b) {
                  return null
                }
                return (
                  <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-[calc(100%-8px)] before:w-px before:bg-forest-200 last:before:hidden" key={key}>
                    <p className="mb-2 font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-gold-600">
                      Transfer · {formatAdminDateTime(item.at)}
                    </p>
                    {renderTransferCard(b)}
                  </li>
                )
              }
              if (item.kind === 'enquiry') {
                const e = item.enquiry
                return (
                  <li
                    className="relative rounded-2xl border border-sky-200/90 bg-sky-50/40 px-4 py-3 pl-4 sm:px-5 before:absolute before:left-0 before:top-3 before:h-2 before:w-2 before:rounded-full before:bg-sky-500"
                    key={key}
                  >
                    <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-sky-800">
                      Website enquiry · {formatAdminDateTime(item.at)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-forest-900">
                      {(e.full_name ?? '').trim() || 'Guest'}{' '}
                      <span className="font-mono text-xs font-normal text-forest-600">{e.reference_id}</span>
                    </p>
                    {e.interest ? (
                      <p className="mt-1 text-xs text-forest-600">
                        <span className="font-medium text-forest-700">Interest:</span> {e.interest}
                      </p>
                    ) : null}
                  </li>
                )
              }
              if (item.kind === 'package') {
                const p = item.pkg
                return (
                  <li
                    className="relative rounded-2xl border border-fairway-200/90 bg-fairway-50/35 px-4 py-3 sm:px-5 before:absolute before:left-0 before:top-3 before:h-2 before:w-2 before:rounded-full before:bg-fairway-600"
                    key={key}
                  >
                    <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-fairway-900">
                      Saved package · {formatAdminDateTime(item.at)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-forest-900">{(p.label ?? '').trim() || 'Untitled package'}</p>
                    <p className="mt-1 text-xs text-forest-600">Source: {p.source}</p>
                  </li>
                )
              }
              const t = item.ticket
              const catLabel =
                PORTAL_INTEREST_LABELS[t.category as PortalInterestCategory] ?? t.category.replace(/_/g, ' ')
              return (
                <li
                  className="relative rounded-2xl border border-violet-200/90 bg-violet-50/40 px-4 py-3 sm:px-5 before:absolute before:left-0 before:top-3 before:h-2 before:w-2 before:rounded-full before:bg-violet-500"
                  key={key}
                >
                  <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-violet-900">
                    Portal interest · {formatAdminDateTime(item.at)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-forest-900">{catLabel}</p>
                  <p className="mt-1 text-xs capitalize text-forest-600">Status: {t.status.replace(/_/g, ' ')}</p>
                </li>
              )
            })}
          </ul>
        </div>
      ) : resolvedLabel && !loading ? (
        <p className="mt-6 text-sm text-forest-600">No rows matched this lookup yet.</p>
      ) : null}
    </section>
  )
}
