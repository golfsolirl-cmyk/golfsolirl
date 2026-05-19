import { Car, Mail, MessageSquareText, Package } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  balanceAmountEur,
  depositAmountEur,
  formatBalanceDueLine,
  normalizedDepositPercent,
  transferPaymentFullUpfront
} from '../lib/transfer-payment-breakdown'
import { stripeCheckoutSessionDashboardUrl, stripePaymentDashboardUrl } from '../lib/stripe-dashboard-url'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { PORTAL_INTEREST_LABELS, type PortalInterestCategory } from '../lib/portal-interest-tickets'
import { useAuth } from '../providers/auth-provider'
import { LuxuryButton } from './ui/button'
import { TransferPaymentStatusBadge } from './transfer-payment-status-badge'
import { cx } from '../lib/utils'

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
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  transfer_refund_total_eur: number | null
  transfer_refund_status: string | null
  next_available_driver: boolean | null
  updated_at?: string | null
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

/** Compact relative label for “recent lookup” chips (Dublin-local wall clock feel). */
const formatRelativeLoaded = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return ''
  }
  const diffMs = Date.now() - d.getTime()
  const sec = Math.floor(diffMs / 1000)
  if (sec < 45) {
    return 'Just now'
  }
  const min = Math.floor(sec / 60)
  if (min < 60) {
    return `${min}m ago`
  }
  const hr = Math.floor(min / 60)
  if (hr < 36) {
    return `${hr}h ago`
  }
  return formatAdminDateTime(iso)
}

type LookupSessionMeta = {
  readonly refQueried: string
  readonly loadedAtIso: string
  readonly summaryLine: string
}

type RecentLookupChip = {
  readonly ref: string
  readonly loadedAtIso: string
}

const formatEur = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const formatEurPrecise = (n: number) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n)

/** Parent-driven ref (e.g. Recent form submissions row) — `key` must change each request so the effect re-runs. */
export type AdminAccountLookupSeed = { readonly ref: string; readonly key: number }

export function AdminAccountTransfersHub(props: {
  readonly accountLookupSeed?: AdminAccountLookupSeed | null
  readonly onAccountLookupSeedApplied?: () => void
} = {}) {
  const { session, profile } = useAuth()
  const supabase = getSupabaseBrowserClient()
  const [inputRef, setInputRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<HubBookingRow[]>([])
  const [enquiryRows, setEnquiryRows] = useState<EnquiryLite[]>([])
  const [packageRows, setPackageRows] = useState<PackageLite[]>([])
  const [ticketRows, setTicketRows] = useState<TicketLite[]>([])
  const [priceDraft, setPriceDraft] = useState<Record<string, string>>({})
  const [vatDraft, setVatDraft] = useState<Record<string, VatTreatmentChoice>>({})
  const [priceBusyId, setPriceBusyId] = useState<string | null>(null)
  const [payBusyId, setPayBusyId] = useState<string | null>(null)
  const [payRequestBusyId, setPayRequestBusyId] = useState<string | null>(null)
  const [refundDraft, setRefundDraft] = useState<Record<string, string>>({})
  const [refundBusyId, setRefundBusyId] = useState<string | null>(null)
  const [refundNotifyCustomer, setRefundNotifyCustomer] = useState(true)
  const [sendCustomerEmails, setSendCustomerEmails] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [asapBusyId, setAsapBusyId] = useState<string | null>(null)
  const [lookupSession, setLookupSession] = useState<LookupSessionMeta | null>(null)
  const [recentLookups, setRecentLookups] = useState<readonly RecentLookupChip[]>([])

  const isAdmin = profile?.role === 'admin'

  const toggleNextAvailableDriver = async (bookingId: string, value: boolean) => {
    if (!supabase) {
      return
    }
    setAsapBusyId(bookingId)
    setError(null)
    try {
      const { error } = await supabase.from('transfer_bookings').update({ next_available_driver: value }).eq('id', bookingId)
      if (error) {
        throw new Error(error.message)
      }
      setRows((prev) => prev.map((r) => (r.id === bookingId ? { ...r, next_available_driver: value } : r)))
      setStatusMsg(value ? 'Marked as ASAP / full payment on client checkout.' : 'Cleared ASAP flag — deposit + balance schedule applies when pickup is scheduled.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update ASAP flag.')
    } finally {
      setAsapBusyId(null)
    }
  }

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

  const inputRefValue = useRef(inputRef)
  inputRefValue.current = inputRef

  const withQueryTimeout = async <T,>(label: string, promise: PromiseLike<T>, ms = 28_000): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      return await Promise.race([
        Promise.resolve(promise),
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`${label} timed out — try again or check Supabase.`)), ms)
        })
      ])
    } finally {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }

  const loadByAccountRef = useCallback(async (overrideRaw?: string) => {
    setStatusMsg(null)
    setError(null)
    const raw = (overrideRaw ?? inputRefValue.current).trim()
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

      const prof = await withQueryTimeout(
        'Profile lookup',
        supabase
          .from('profiles')
          .select('id, email, full_name, account_reference_id')
          .ilike('account_reference_id', raw)
          .maybeSingle()
      )

      let uid: string | null = null
      let email: string | null = null
      let label = `Reference ${raw}`

      if (!prof.error && prof.data) {
        const p = prof.data as { id: string; email: string | null; full_name: string | null; account_reference_id: string | null }
        uid = p.id
        email = (p.email ?? '').trim().toLowerCase() || null
        label = `${(p.full_name ?? '').trim() || 'Client'} · ${email ?? p.id}`
      }

      const enqOne = await withQueryTimeout(
        'Enquiry lookup',
        supabase.from('enquiries').select('email, reference_id, full_name').eq('reference_id', raw).maybeSingle()
      )
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
        const pr2 = await withQueryTimeout(
          'Profile by email',
          supabase.from('profiles').select('id, email, full_name').ilike('email', email).maybeSingle()
        )
        if (!pr2.error && pr2.data) {
          uid = (pr2.data as { id: string }).id
          const fn = (pr2.data as { full_name?: string | null }).full_name
          label = `${(fn ?? '').trim() || 'Client'} · ${email}`
        }
      }

      if (email) {
        const enqAll = await withQueryTimeout(
          'Enquiries by email',
          supabase.from('enquiries').select('reference_id').ilike('email', email)
        )
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
        setLookupSession(null)
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

      const transferSelect = () =>
        supabase
          .from('transfer_bookings')
          .select(
            'id, pickup_label, dropoff_label, status, scheduled_at, client_email, booking_source, enquiry_reference_id, package_build_id, payment_status, deposit_percent, balance_remind_at, balance_remind_sent_at, admin_price_eur, admin_price_vat_treatment, assigned_driver_id, stripe_payment_intent_id, stripe_checkout_session_id, transfer_refund_total_eur, transfer_refund_status, next_available_driver, created_at'
          )
          .or(orParts.join(','))
          .order('created_at', { ascending: false })
          .limit(120)

      const [tb, enqRes, pkgRes, tktRes] = await withQueryTimeout(
        'Customer activity',
        Promise.all([transferSelect(), enquirySelect, packageSelect, ticketSelect])
      )

      if (tb.error) {
        setRows([])
        setEnquiryRows([])
        setPackageRows([])
        setTicketRows([])
        setLookupSession(null)
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
      const summaryLine = `${label} · ${list.length} transfer job${list.length === 1 ? '' : 's'} · ${nEnq} enquiry row${nEnq === 1 ? '' : 's'} · ${nPkg} saved package${nPkg === 1 ? '' : 's'} · ${nTkt} portal ticket${nTkt === 1 ? '' : 's'}`
      const loadedAtIso = new Date().toISOString()
      setLookupSession({
        refQueried: raw,
        loadedAtIso,
        summaryLine
      })
      setRecentLookups((prev) => {
        const next = [{ ref: raw, loadedAtIso }, ...prev.filter((x) => x.ref !== raw)]
        return next.slice(0, 8)
      })

      const nextDraft: Record<string, string> = {}
      const nextVat: Record<string, VatTreatmentChoice> = {}
      for (const r of list) {
        nextDraft[r.id] =
          typeof r.admin_price_eur === 'number' && Number.isFinite(r.admin_price_eur) ? String(r.admin_price_eur) : ''
        nextVat[r.id] = r.admin_price_vat_treatment === 'services' ? 'services' : 'tourism'
      }
      setPriceDraft(nextDraft)
      setVatDraft(nextVat)
    } catch (e) {
      setRows([])
      setEnquiryRows([])
      setPackageRows([])
      setTicketRows([])
      setLookupSession(null)
      setError(e instanceof Error ? e.message : 'Lookup failed.')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, session?.access_token, supabase])

  const onSeedAppliedRef = useRef(props.onAccountLookupSeedApplied)
  onSeedAppliedRef.current = props.onAccountLookupSeedApplied

  const seedKey = props.accountLookupSeed?.key
  const seedRefValue = props.accountLookupSeed?.ref

  useEffect(() => {
    if (seedKey == null || !seedRefValue?.trim()) {
      return
    }
    const raw = seedRefValue.trim()
    setInputRef(raw)
    let cancelled = false
    void (async () => {
      await loadByAccountRef(raw)
      if (cancelled) {
        return
      }
      onSeedAppliedRef.current?.()
      document.getElementById('admin-hub-account-lookup')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })()
    return () => {
      cancelled = true
    }
  }, [seedKey, seedRefValue, loadByAccountRef])

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
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        pdfPortal?: { ok?: boolean; reason?: string; message?: string }
      }
      if (!res.ok) {
        throw new Error(data.message || 'Could not save price.')
      }
      const pdf = data.pdfPortal
      if (pdf && pdf.ok === false) {
        const detail = [pdf.reason, pdf.message].filter(Boolean).join(' — ')
        setStatusMsg(`Quoted EUR saved. Client PDF shelf: ${detail || 'could not publish (check server logs).'}`)
      } else {
        setStatusMsg('Quoted EUR saved.')
      }
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

  const issueRefund = async (bookingId: string, fullRemaining: boolean) => {
    setStatusMsg(null)
    setError(null)
    if (!session?.access_token) {
      setError('Sign in again as admin.')
      return
    }
    setRefundBusyId(bookingId)
    try {
      const body: Record<string, unknown> = {
        bookingId,
        sendCustomerEmail: refundNotifyCustomer
      }
      if (fullRemaining) {
        body.fullRemaining = true
      } else {
        const raw = (refundDraft[bookingId] ?? '').trim().replace(/,/g, '.')
        const n = Number(raw)
        if (!Number.isFinite(n) || n <= 0) {
          throw new Error('Enter a valid refund amount in EUR.')
        }
        body.amountEur = n
      }
      const res = await fetch('/api/transfer-refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      })
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        booking?: HubBookingRow
        emailedTo?: string | null
        emailError?: string | null
        refundAmountEur?: number
      }
      if (!res.ok) {
        throw new Error(data.message || 'Refund failed.')
      }
      const parts: string[] = []
      if (typeof data.refundAmountEur === 'number') {
        parts.push(`Refunded ${formatEurPrecise(data.refundAmountEur)}`)
      }
      if (data.emailedTo) {
        parts.push(`Refund PDF emailed to ${data.emailedTo}`)
      } else if (data.emailError) {
        parts.push(`Email: ${data.emailError}`)
      }
      setStatusMsg(parts.join(' · ') || 'Refund processed.')
      if (data.booking) {
        const u = data.booking as HubBookingRow
        setRows((prev) => prev.map((r) => (r.id === bookingId ? { ...r, ...u } : r)))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refund failed.')
    } finally {
      setRefundBusyId(null)
    }
  }

  const scrollToPipelineRow = (bookingId: string) => {
    document.getElementById(`admin-transfer-booking-${bookingId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const renderTransferCard = (b: HubBookingRow) => {
    const paySt = (b.payment_status ?? 'unpaid').toLowerCase()
    const pct = normalizedDepositPercent(b.deposit_percent)
    const payBusy = payBusyId === b.id
    const priceBusy = priceBusyId === b.id
    const reqBusy = payRequestBusyId === b.id
    const refundBusy = refundBusyId === b.id
    const refundSt = String(b.transfer_refund_status ?? 'none').toLowerCase()
    const refundedTotal = typeof b.transfer_refund_total_eur === 'number' ? b.transfer_refund_total_eur : 0
    const piOk = typeof b.stripe_payment_intent_id === 'string' && b.stripe_payment_intent_id.trim().startsWith('pi_')
    const checkoutOk =
      typeof b.stripe_checkout_session_id === 'string' && b.stripe_checkout_session_id.trim().startsWith('cs_')
    const hasStripeCharge = piOk || checkoutOk
    const canIssueRefund =
      (paySt === 'paid' || paySt === 'deposit') && refundSt !== 'full' && hasStripeCharge
    const showRefundUnavailableHint =
      (paySt === 'paid' || paySt === 'deposit') && refundSt !== 'full' && !hasStripeCharge
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
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-forest-900">
                {b.pickup_label} → {b.dropoff_label}
              </p>
              <TransferPaymentStatusBadge deposit_percent={b.deposit_percent} payment_status={b.payment_status} size="sm" />
            </div>
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
            <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wide text-brand-600">Quoted EUR (VAT incl.)</span>
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

        {typeof b.admin_price_eur === 'number' && Number.isFinite(b.admin_price_eur) ? (
          <div className="mt-4 rounded-xl border border-forest-100 bg-offwhite/90 px-3 py-3 text-xs text-forest-800">
            {(() => {
              const gross = b.admin_price_eur
              const splitRow = {
                next_available_driver: b.next_available_driver,
                scheduled_at: b.scheduled_at,
                admin_price_eur: gross,
                deposit_percent: pct
              }
              const fullUp = transferPaymentFullUpfront(splitRow)
              if (fullUp) {
                return (
                  <p>
                    <span className="font-semibold text-forest-900">Client checkout:</span> one payment for the full quoted{' '}
                    {formatEur(gross)} (ASAP / next available driver, or no fixed pickup time yet).
                  </p>
                )
              }
              const dep = depositAmountEur(gross, pct)
              const bal = balanceAmountEur(gross, pct)
              const due = formatBalanceDueLine(b.scheduled_at)
              return (
                <div className="space-y-1">
                  <p className="font-semibold text-forest-900">Payment schedule (client dashboard)</p>
                  <p>
                    {pct}% deposit {formatEur(dep)} · Balance {formatEur(bal)}
                  </p>
                  {due ? <p className="text-forest-600">{due}</p> : null}
                  <p className="text-forest-600">
                    Automated balance reminder emails run on a schedule once the due time is reached if the balance is still
                    unpaid; terms cover deposit forfeiture if the booking is released.
                  </p>
                </div>
              )
            })()}
            <label className="mt-3 flex cursor-pointer items-start gap-2 border-t border-forest-100 pt-3">
              <input
                checked={b.next_available_driver === true}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-forest-300 text-fairway-700"
                disabled={asapBusyId === b.id}
                onChange={(e) => void toggleNextAvailableDriver(b.id, e.target.checked)}
                type="checkbox"
              />
              <span>
                <span className="font-semibold text-forest-900">Next available / ASAP</span>
                <span className="ml-1 text-forest-600">
                  — guest wants the next slot: client pays the full quote in one step (no 20% deposit split).
                </span>
              </span>
            </label>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TransferPaymentStatusBadge deposit_percent={b.deposit_percent} payment_status={b.payment_status} />
          {typeof b.admin_price_eur === 'number' && Number.isFinite(b.admin_price_eur) ? (
            <span className="text-xs font-semibold text-fairway-800">
              {formatEur(b.admin_price_eur)} quoted · VAT{' '}
              {b.admin_price_vat_treatment === 'services' ? 'services 23%' : 'tourism 13.5%'}
            </span>
          ) : null}
          {(paySt === 'paid' || paySt === 'deposit') && hasStripeCharge ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-forest-950 ring-1 ring-emerald-400/35">
              Stripe confirmed
            </span>
          ) : null}
          {refundSt === 'partial' ? (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-rose-950 ring-1 ring-rose-400/40">
              Partial refund
            </span>
          ) : null}
          {refundSt === 'full' ? (
            <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-rose-950 ring-1 ring-rose-500/35">
              Fully refunded
            </span>
          ) : null}
          {refundedTotal > 0 ? (
            <span className="text-xs font-semibold text-rose-900">
              {formatEurPrecise(refundedTotal)} refunded (cumulative)
            </span>
          ) : null}
          {stripePaymentDashboardUrl(b.stripe_payment_intent_id) ||
          stripeCheckoutSessionDashboardUrl(b.stripe_checkout_session_id) ? (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
              {stripePaymentDashboardUrl(b.stripe_payment_intent_id) ? (
                <a
                  className="text-fairway-900 underline decoration-fairway-600/60 underline-offset-2 hover:text-fairway-950"
                  href={stripePaymentDashboardUrl(b.stripe_payment_intent_id) ?? '#'}
                  rel="noreferrer"
                  target="_blank"
                >
                  Stripe receipt
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
            className="!px-3 !py-2 !text-xs !font-semibold !border-2 !border-chrome-700/35 !bg-chrome-100 !text-brand-950 hover:!bg-chrome-200/90 hover:!border-chrome-800/40"
            disabled={reqBusy || !clientMail}
            onClick={() => void sendPaymentRequestEmail(b.id)}
            title={!clientMail ? 'No client email on this transfer row' : 'Branded email with dashboard payment preview link'}
            type="button"
            variant="white"
          >
            {reqBusy ? 'Sending…' : 'Email payment request'}
          </LuxuryButton>
        </div>

        {canIssueRefund ? (
          <div className="mt-4 rounded-2xl border border-rose-200/80 bg-rose-50/50 px-4 py-3 sm:px-5">
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-rose-900">Stripe card refund</p>
            <p className="mt-1 text-xs text-forest-600">
              Issues a partial or full refund in Stripe, updates this booking, and optionally emails the guest a refund confirmation PDF.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="block min-w-0">
                <span className="mb-1 block text-[0.62rem] font-semibold uppercase tracking-wide text-forest-600">
                  Amount (EUR)
                </span>
                <input
                  className="w-32 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-forest-900"
                  inputMode="decimal"
                  onChange={(e) => setRefundDraft((m) => ({ ...m, [b.id]: e.target.value }))}
                  placeholder="e.g. 50"
                  type="text"
                  value={refundDraft[b.id] ?? ''}
                />
              </label>
              <LuxuryButton
                className="!px-3 !py-2 !text-xs"
                disabled={refundBusy}
                onClick={() => void issueRefund(b.id, false)}
                type="button"
                variant="secondary"
              >
                {refundBusy ? 'Processing…' : 'Refund this amount'}
              </LuxuryButton>
              <LuxuryButton
                className="!px-3 !py-2 !text-xs !font-semibold"
                disabled={refundBusy}
                onClick={() => void issueRefund(b.id, true)}
                type="button"
                variant="white"
              >
                {refundBusy ? 'Processing…' : 'Refund full remaining'}
              </LuxuryButton>
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-forest-800">
              <input
                checked={refundNotifyCustomer}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-rose-300 text-rose-700 focus:ring-rose-500"
                onChange={(e) => setRefundNotifyCustomer(e.target.checked)}
                type="checkbox"
              />
              <span>
                <span className="font-medium">Email customer</span> — branded message with PDF attachment (uses profile / transfer email).
              </span>
            </label>
          </div>
        ) : refundSt === 'full' ? (
          <p className="mt-4 text-xs text-forest-500">This transfer is fully refunded on the card; no further Stripe refunds.</p>
        ) : showRefundUnavailableHint ? (
          <div className="mt-4 rounded-2xl border border-forest-200 bg-offwhite/90 px-4 py-3 text-xs text-forest-600">
            <p className="font-semibold text-forest-800">Stripe refund unavailable</p>
            <p className="mt-1">
              This booking is marked paid or deposit but has no <span className="font-mono text-[0.65rem]">pi_</span> Payment
              Intent or <span className="font-mono text-[0.65rem]">cs_</span> Checkout session on file — refunds cannot be
              issued from Golf Sol until the card payment is linked (e.g. guest completes Checkout so the webhook saves Stripe
              IDs), or handle the refund manually outside the app.
            </p>
          </div>
        ) : null}
      </div>
    )
  }

  if (!isAdmin || !supabase) {
    return null
  }

  return (
    <section
      aria-label="Look up transfers by account number"
      className="scroll-mt-28 overflow-hidden rounded-[2rem] border-2 border-brand-700/35 bg-gradient-to-br from-white via-offwhite/95 to-fairway-50/40 p-6 shadow-[0_22px_56px_rgba(11,73,52,0.08)] ring-1 ring-forest-900/[0.06] sm:p-8"
      id="admin-hub-account-lookup"
    >
      <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-brand-600">Account lookup</p>
      <h2 className="font-display mt-2 text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">Customer activity &amp; transfers</h2>
      <p className="mt-2 max-w-3xl text-sm text-forest-600">
        Paste an <strong className="font-medium text-forest-800">account number</strong> or{' '}
        <strong className="font-medium text-forest-800">GSI-</strong> enquiry ref. You will see (newest first).
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
        <p className="mt-4 rounded-xl border border-chrome-200 bg-chrome-50/90 px-4 py-3 text-sm text-brand-950" role="alert">
          {error}
        </p>
      ) : null}
      {statusMsg && !error ? (
        <p className="mt-4 text-sm font-medium text-fairway-900" role="status">
          {statusMsg}
        </p>
      ) : null}

      {lookupSession ? (
        <div
          className="mt-6 overflow-hidden rounded-[1.35rem] border-2 border-fairway-400/45 bg-gradient-to-br from-fairway-50/95 via-white to-brand-50/35 shadow-[0_14px_44px_rgba(11,73,52,0.08)] ring-1 ring-fairway-900/[0.07]"
          role="status"
        >
          <div className="border-b border-fairway-200/70 bg-white/55 px-4 py-3.5 sm:px-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-fairway-900">
                Timeline scope
              </span>
              <span
                className="rounded-lg bg-forest-950 px-2.5 py-1 font-mono text-[0.78rem] font-bold tracking-tight text-white shadow-inner"
                title="Account or enquiry reference for this result set"
              >
                {lookupSession.refQueried}
              </span>
              <span className="text-xs text-forest-600">
                Loaded{' '}
                <time dateTime={lookupSession.loadedAtIso}>{formatAdminDateTime(lookupSession.loadedAtIso)}</time>
                <span className="text-forest-400"> · Ireland</span>
              </span>
            </div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-forest-800">{lookupSession.summaryLine}</p>
            <p className="mt-2 border-t border-fairway-100 pt-2 text-[0.65rem] leading-snug text-forest-500">
              Events below are tied to this lookup only. Switch refs or use <strong className="font-semibold text-forest-700">Recent lookups</strong>{' '}
              to compare another customer.
            </p>
          </div>
        </div>
      ) : null}

      {recentLookups.length > 0 ? (
        <div className="mt-5">
          <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-forest-500">Recent lookups</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recentLookups.map((r) => {
              const active = lookupSession?.refQueried === r.ref
              return (
                <button
                  key={r.ref}
                  className={cx(
                    'inline-flex max-w-full flex-col gap-0.5 rounded-2xl border-2 px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fairway-400 sm:flex-row sm:items-center sm:gap-2',
                    active
                      ? 'border-fairway-600 bg-fairway-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]'
                      : 'border-forest-200 bg-white hover:border-fairway-400 hover:bg-fairway-50/70'
                  )}
                  onClick={() => {
                    setInputRef(r.ref)
                    void loadByAccountRef(r.ref)
                  }}
                  type="button"
                >
                  <span className="font-mono text-[0.72rem] font-bold text-forest-950">{r.ref}</span>
                  <span className="text-[0.62rem] font-medium text-forest-500">{formatRelativeLoaded(r.loadedAtIso)}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {activityTimeline.length > 0 ? (
        <div className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-forest-100 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Activity timeline</p>
              <p className="mt-1 max-w-prose text-xs leading-relaxed text-forest-600">
                Newest first. Colour icons separate{' '}
                <span className="font-medium text-brand-800">transfers</span>,{' '}
                <span className="font-medium text-sky-800">website enquiries</span>,{' '}
                <span className="font-medium text-fairway-900">saved packages</span>, and{' '}
                <span className="font-medium text-violet-900">portal requests</span>.
              </p>
            </div>
            {lookupSession ? (
              <span className="rounded-full bg-forest-950/90 px-3 py-1 font-mono text-[0.65rem] font-bold text-white">
                {lookupSession.refQueried}
              </span>
            ) : null}
          </div>

          <div className="relative mt-5">
            {activityTimeline.length > 1 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute left-[21px] top-12 bottom-12 z-0 w-[3px] rounded-full bg-gradient-to-b from-brand-400/90 via-fairway-300/80 to-violet-400/90 opacity-75"
              />
            ) : null}
            <ul className="relative z-[1] space-y-8">
              {activityTimeline.map((item, idx) => {
                const key =
                  item.kind === 'transfer'
                    ? `t-${item.bookingId}`
                    : item.kind === 'enquiry'
                      ? `e-${item.enquiry.id}`
                      : item.kind === 'package'
                        ? `p-${item.pkg.id}`
                        : `tk-${item.ticket.id}`
                const step = idx + 1
                const when = formatAdminDateTime(item.at)

                if (item.kind === 'transfer') {
                  const b = rows.find((r) => r.id === item.bookingId)
                  if (!b) {
                    return null
                  }
                  return (
                    <li className="flex gap-3 sm:gap-4" key={key}>
                      <div className="relative flex shrink-0 flex-col items-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-amber-900/15 ring-2 ring-amber-400/40">
                          <Car className="h-5 w-5 text-white" aria-hidden />
                        </div>
                        <span className="mt-2 font-mono text-[0.6rem] font-bold tabular-nums text-forest-400">#{step}</span>
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="rounded-lg bg-chrome-100 px-2 py-0.5 font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-brand-950 ring-1 ring-amber-300/60">
                            Transfer job
                          </span>
                          <span className="text-[0.65rem] font-semibold tabular-nums text-forest-500">{when}</span>
                        </div>
                        {renderTransferCard(b)}
                      </div>
                    </li>
                  )
                }

                if (item.kind === 'enquiry') {
                  const e = item.enquiry
                  return (
                    <li className="flex gap-3 sm:gap-4" key={key}>
                      <div className="relative flex shrink-0 flex-col items-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg shadow-sky-900/15 ring-2 ring-sky-400/45">
                          <Mail className="h-5 w-5 text-white" aria-hidden />
                        </div>
                        <span className="mt-2 font-mono text-[0.6rem] font-bold tabular-nums text-forest-400">#{step}</span>
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="rounded-lg bg-sky-100 px-2 py-0.5 font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-sky-950 ring-1 ring-sky-300/70">
                            Website enquiry
                          </span>
                          <span className="text-[0.65rem] font-semibold tabular-nums text-forest-500">{when}</span>
                        </div>
                        <div className="rounded-2xl border-2 border-sky-200/90 bg-gradient-to-br from-sky-50/90 to-white px-4 py-4 shadow-sm sm:px-5">
                          <p className="text-sm font-semibold text-forest-900">
                            {(e.full_name ?? '').trim() || 'Guest'}{' '}
                            <span className="font-mono text-xs font-normal text-sky-900/90">{e.reference_id}</span>
                          </p>
                          {e.interest ? (
                            <p className="mt-2 text-xs leading-relaxed text-forest-700">
                              <span className="font-semibold text-forest-800">Interest:</span> {e.interest}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  )
                }

                if (item.kind === 'package') {
                  const p = item.pkg
                  return (
                    <li className="flex gap-3 sm:gap-4" key={key}>
                      <div className="relative flex shrink-0 flex-col items-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-fairway-600 to-emerald-800 shadow-lg shadow-forest-950/20 ring-2 ring-fairway-400/40">
                          <Package className="h-5 w-5 text-white" aria-hidden />
                        </div>
                        <span className="mt-2 font-mono text-[0.6rem] font-bold tabular-nums text-forest-400">#{step}</span>
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="rounded-lg bg-fairway-100 px-2 py-0.5 font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-fairway-950 ring-1 ring-fairway-300/70">
                            Saved package
                          </span>
                          <span className="text-[0.65rem] font-semibold tabular-nums text-forest-500">{when}</span>
                        </div>
                        <div className="rounded-2xl border-2 border-fairway-200/90 bg-gradient-to-br from-fairway-50/80 to-white px-4 py-4 shadow-sm sm:px-5">
                          <p className="text-sm font-semibold text-forest-900">{(p.label ?? '').trim() || 'Untitled package'}</p>
                          <p className="mt-2 text-xs text-forest-600">
                            <span className="font-semibold text-forest-700">Source:</span> {p.source}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                }

                const t = item.ticket
                const catLabel =
                  PORTAL_INTEREST_LABELS[t.category as PortalInterestCategory] ?? t.category.replace(/_/g, ' ')
                return (
                  <li className="flex gap-3 sm:gap-4" key={key}>
                    <div className="relative flex shrink-0 flex-col items-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-violet-500 to-violet-800 shadow-lg shadow-violet-950/25 ring-2 ring-violet-400/45">
                        <MessageSquareText className="h-5 w-5 text-white" aria-hidden />
                      </div>
                      <span className="mt-2 font-mono text-[0.6rem] font-bold tabular-nums text-forest-400">#{step}</span>
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="rounded-lg bg-violet-100 px-2 py-0.5 font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-violet-950 ring-1 ring-violet-300/70">
                          Portal interest
                        </span>
                        <span className="text-[0.65rem] font-semibold tabular-nums text-forest-500">{when}</span>
                      </div>
                      <div className="rounded-2xl border-2 border-violet-200/90 bg-gradient-to-br from-violet-50/90 to-white px-4 py-4 shadow-sm sm:px-5">
                        <p className="text-sm font-semibold text-forest-900">{catLabel}</p>
                        <p className="mt-2 text-xs capitalize text-forest-700">
                          <span className="font-semibold text-forest-800">Status:</span> {t.status.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      ) : lookupSession && !loading ? (
        <p className="mt-6 rounded-2xl border border-dashed border-forest-200 bg-offwhite/80 px-4 py-6 text-center text-sm text-forest-600">
          No timeline rows for <span className="font-mono font-semibold text-forest-900">{lookupSession.refQueried}</span> yet — transfers and
          matched enquiries will appear here after they exist.
        </p>
      ) : null}
    </section>
  )
}
