import type { Session } from '@supabase/supabase-js'
import { ChevronDown, MessageCircle, Ticket, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ClientPortalIdentityHero, type ClientPortalTransferHeroRow } from '../components/client-portal-identity-hero'
import { ClientPortalPaymentsDue } from '../components/client-portal-payments-due'
import {
  ClientPortalShell,
  ClientPortalSection,
  type ClientPortalSectionId
} from '../components/client-portal-shell'
import { PortalTransferServiceCard, type PortalTransferServiceCardModel } from '../components/portal-transfer-service-card'
import { PortalAccountLoadingState } from '../components/portal-account-loading-state'
import {
  PortalClientProposalsPdfViewer,
  type ProposalRowLite,
  type TransferPortalDocumentRow
} from '../components/portal-client-proposals-pdf-viewer'
import { PortalAddToYourTripStrip } from '../components/portal-add-to-your-trip-strip'
import { PortalInterestCategoryGlyph } from '../components/portal-interest-category-glyph'
import { PortalClientDataCard } from '../components/portal-client-data-card'
import { PortalTransferRequestsSection } from '../components/portal-transfer-requests-section'
import { PortalInvoicesPanel } from '../components/portal-invoices-panel'
import { DashboardLayout, DashboardLoadingShell } from '../components/dashboard-layout'
import {
  buildClientDataCardSections,
  clientEnquiryDisplayFullName,
  clientGreetingFirstName,
  type ClientEnquiryRowLite
} from '../lib/client-data-card'
import { LuxuryButton } from '../components/ui/button'
import { COURSES } from '../data/coastal-golf-data'
import { fetchPackageBuildsClientList } from '../lib/fetch-package-builds'
import { GOLFSOL_BRAND_LOGO } from '../lib/brand-logo-assets'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import type { TransferReceiptVatTreatment } from '../lib/transfer-vat-receipt-pdf'

type BrowserSupabase = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>
import {
  clearTripWorkspaceDraft,
  emptyTripWorkspaceDraft,
  ensureTripWorkspaceDraftShape,
  illustrativeTripPriceRangeEur,
  isLikelyEnquiryReferenceId,
  loadTripWorkspaceDraft,
  normalizeTransferStops,
  saveTripWorkspaceDraft,
  type PortalTransferStop,
  type TripStageKey,
  type TripWorkspaceDraft
} from '../lib/trip-workspace-draft'
import { PortalTransferRouteBuilder } from '../components/portal-transfer-route-builder'
import { useAuth, type Profile } from '../providers/auth-provider'
import { cx } from '../lib/utils'
import {
  isMissingPortalInterestTicketsError,
  PORTAL_INTEREST_LABELS,
  type PortalInterestCategory,
  type PortalInterestTicketMessageRow,
  type PortalInterestTicketRow
} from '../lib/portal-interest-tickets'

interface ProposalRow {
  id: string
  proposal_id: string
  title: string | null
  status: string
  created_at: string
  payload: unknown | null
}

interface LinkedProposalMini {
  id: string
  proposal_id: string
  title: string | null
  payload: unknown
  created_at: string
}

interface PackageBuildRow {
  id: string
  label: string | null
  source: string
  config: unknown
  client_details: unknown
  created_at: string
  updated_at?: string
  linked_proposal_id?: string | null
  linked_proposal?: LinkedProposalMini | null
}

const inputClass =
  'w-full rounded-2xl border-2 border-orange-400 bg-white px-4 py-3.5 text-base text-forest-900 placeholder:text-forest-400 outline-none transition-[border-color,box-shadow] focus:border-orange-500 focus:ring-2 focus:ring-orange-300/70'

const labelClass = 'mb-1.5 block text-sm font-semibold uppercase tracking-[0.12em] text-brand-600'

const readOnlyCalcClass =
  'w-full rounded-2xl border-2 border-forest-200/90 bg-offwhite px-4 py-3.5 text-base text-forest-900'

const readOnlyCalcHintClass = 'mt-1 text-sm text-forest-500'

/** Full name for portal copy: profile row first, then auth user_metadata from signup/OAuth. */
const resolveClientDisplayFullName = (session: Session, profile: Profile | null): string => {
  const fromProfile = profile?.full_name?.trim()
  if (fromProfile) {
    return fromProfile
  }

  // One-time contact not saved: use DB only so cleared profiles (and stale JWT metadata) do not show old names.
  if (!profile?.portal_contact_completed_at) {
    return ''
  }

  const meta = session.user.user_metadata as Record<string, unknown> | undefined
  if (!meta) {
    return ''
  }

  const given = typeof meta.given_name === 'string' ? meta.given_name.trim() : ''
  const family = typeof meta.family_name === 'string' ? meta.family_name.trim() : ''
  if (given || family) {
    return [given, family].filter(Boolean).join(' ')
  }

  for (const key of ['full_name', 'name', 'display_name'] as const) {
    const v = meta[key]
    if (typeof v === 'string' && v.trim()) {
      return v.trim()
    }
  }

  return ''
}

/** Name for hero greeting — profile, then any visible enquiry (website forms), then auth metadata. */
const resolveClientGreetingFullName = (
  session: Session,
  profile: Profile | null,
  enquiries: readonly ClientEnquiryRowLite[]
): string => {
  const fromProfile = profile?.full_name?.trim()
  if (fromProfile) {
    return fromProfile
  }

  for (const row of enquiries) {
    const fromEnquiry = clientEnquiryDisplayFullName(row)
    if (fromEnquiry) {
      return fromEnquiry
    }
  }

  const meta = session.user.user_metadata as Record<string, unknown> | undefined
  if (meta) {
    const given = typeof meta.given_name === 'string' ? meta.given_name.trim() : ''
    const family = typeof meta.family_name === 'string' ? meta.family_name.trim() : ''
    if (given || family) {
      return [given, family].filter(Boolean).join(' ')
    }
    for (const key of ['full_name', 'name', 'display_name'] as const) {
      const v = meta[key]
      if (typeof v === 'string' && v.trim()) {
        return v.trim()
      }
    }
  }

  return ''
}

/** Phone for portal: profile first, then common OAuth / form metadata keys. */
const resolveClientPhone = (session: Session, profile: Profile | null): string => {
  const fromProfile = profile?.phone?.trim()
  if (fromProfile) {
    return fromProfile
  }

  if (!profile?.portal_contact_completed_at) {
    return ''
  }

  const meta = session.user.user_metadata as Record<string, unknown> | undefined
  if (!meta) {
    return ''
  }

  for (const key of ['phone', 'phone_number', 'phone_whatsapp'] as const) {
    const v = meta[key]
    if (typeof v === 'string' && v.trim()) {
      return v.trim()
    }
  }

  return ''
}

const tripStageOptionRows: readonly (readonly [TripStageKey, string, string])[] = [
  ['transfer', 'Airport & golf-day transfers', 'AGP meet-and-greet, golf-bag friendly vehicles.'],
  ['golf', 'Golf rounds', 'Pick courses — use the map for the full Sol corridor.'],
  ['hotel', 'Hotel / villa base', 'Notes for 1–8 guests; we match star level and location.']
]

type ClientPortalTransferBookingRow = {
  id: string
  pickup_label: string
  dropoff_label: string
  status: string
  scheduled_at: string | null
  admin_price_eur?: number | null
  admin_price_vat_treatment?: string | null
  deposit_percent?: number | null
  payment_status?: string | null
  next_available_driver?: boolean | null
  booking_source?: string | null
  package_build_id?: string | null
  enquiry_reference_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export function ClientDashboardPage() {
  const { session, profile, isLoading, refreshProfile } = useAuth()
  const contactSyncAttempted = useRef(false)
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [packageBuilds, setPackageBuilds] = useState<PackageBuildRow[]>([])
  const [proposalsError, setProposalsError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [activeClientSection, setActiveClientSection] = useState<ClientPortalSectionId>('home')
  const [teamMessagingOpen, setTeamMessagingOpen] = useState(false)
  const [documentAccess, setDocumentAccess] = useState<{ terms: boolean; welcome: boolean }>({
    terms: false,
    welcome: false
  })
  const [tripDraft, setTripDraft] = useState<TripWorkspaceDraft | null>(null)
  const [transferBuilderOpen, setTransferBuilderOpen] = useState(false)
  const [enquiries, setEnquiries] = useState<ClientEnquiryRowLite[]>([])
  const [transferBookingsPortal, setTransferBookingsPortal] = useState<ClientPortalTransferBookingRow[]>([])
  const [onboardingName, setOnboardingName] = useState('')
  const [onboardingPhone, setOnboardingPhone] = useState('')
  const [onboardingStatus, setOnboardingStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [onboardingMessage, setOnboardingMessage] = useState<string | null>(null)
  const [interestTickets, setInterestTickets] = useState<PortalInterestTicketRow[]>([])
  const [interestTicketsError, setInterestTicketsError] = useState<string | null>(null)
  const [interestModalCategory, setInterestModalCategory] = useState<PortalInterestCategory | null>(null)
  const [interestDraftBody, setInterestDraftBody] = useState('')
  const [interestSubmitBusy, setInterestSubmitBusy] = useState(false)
  const [interestSubmitError, setInterestSubmitError] = useState<string | null>(null)
  const [interestThreadTicketId, setInterestThreadTicketId] = useState<string | null>(null)
  const [interestThreadMessages, setInterestThreadMessages] = useState<PortalInterestTicketMessageRow[]>([])
  const [interestThreadLoading, setInterestThreadLoading] = useState(false)
  const [interestFollowUp, setInterestFollowUp] = useState('')
  const [interestFollowUpBusy, setInterestFollowUpBusy] = useState(false)
  const [interestFollowUpError, setInterestFollowUpError] = useState<string | null>(null)
  const [interestTicketLatestAdminAt, setInterestTicketLatestAdminAt] = useState<Record<string, string>>({})
  const [invoiceUrlBanner, setInvoiceUrlBanner] = useState<string | null>(null)
  /** Set from `?transfer_paid=1&transfer_booking_id=` after Stripe (local or prod) */
  const [stripePaidTransferBookingId, setStripePaidTransferBookingId] = useState<string | null>(null)
  const [transferServiceCardBookingId, setTransferServiceCardBookingId] = useState<string | null>(null)
  const [invoicePanelRefresh, setInvoicePanelRefresh] = useState(0)
  const [transferPortalDocuments, setTransferPortalDocuments] = useState<TransferPortalDocumentRow[]>([])
  const listDataInflightRef = useRef(0)

  const loadData = useCallback(async () => {
    if (!session?.user) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setListLoading(false)
      setProposalsError('Supabase is not configured.')
      return
    }

    listDataInflightRef.current += 1
    if (listDataInflightRef.current === 1) {
      setListLoading(true)
    }
    try {
    const [propRes, buildRes, docRes, enqRes, transferDocRes] = await Promise.all([
      supabase.from('proposals').select('id, proposal_id, title, status, created_at, payload').order('created_at', { ascending: false }),
      fetchPackageBuildsClientList(supabase, 40),
      supabase.from('client_document_access').select('document_kind').eq('owner_id', session.user.id),
      supabase
        .from('enquiries')
        .select('id, reference_id, created_at, form_payload, email, full_name')
        .order('created_at', { ascending: false })
        .limit(80),
      supabase
        .from('portal_client_transfer_documents')
        .select('id, transfer_booking_id, document_kind, title, storage_path, created_at')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(80)
    ])

    if (docRes.error) {
      setDocumentAccess({ terms: false, welcome: false })
    } else {
      const kinds = new Set((docRes.data ?? []).map((r) => r.document_kind))
      setDocumentAccess({ terms: kinds.has('terms'), welcome: kinds.has('welcome') })
    }

    if (transferDocRes.error) {
      setTransferPortalDocuments([])
    } else {
      setTransferPortalDocuments((transferDocRes.data ?? []) as TransferPortalDocumentRow[])
    }

    if (enqRes.error) {
      setEnquiries([])
    } else {
      setEnquiries((enqRes.data ?? []) as ClientEnquiryRowLite[])
    }

    const enquiryRows = (enqRes.data ?? []) as ClientEnquiryRowLite[]
    const orTransfer: string[] = [`client_user_id.eq.${session.user.id}`]
    const loginEmail = session.user.email?.trim()
    if (loginEmail) {
      orTransfer.push(`client_email.eq.${loginEmail}`)
    }
    const accountRefForTb = profile?.account_reference_id?.trim()
    if (accountRefForTb) {
      orTransfer.push(`enquiry_reference_id.eq.${accountRefForTb}`)
    }
    for (const row of enquiryRows) {
      const rid = typeof row.reference_id === 'string' ? row.reference_id.trim() : ''
      if (rid) {
        orTransfer.push(`enquiry_reference_id.eq.${rid}`)
      }
    }
    const tbRes = await supabase
      .from('transfer_bookings')
      .select(
        'id, pickup_label, dropoff_label, status, scheduled_at, admin_price_eur, admin_price_vat_treatment, deposit_percent, payment_status, next_available_driver, booking_source, package_build_id, enquiry_reference_id, created_at, updated_at'
      )
      .or(orTransfer.join(','))
      .order('created_at', { ascending: false })
      .limit(80)
    if (!tbRes.error && tbRes.data) {
      const dedupTb = new Map<string, ClientPortalTransferBookingRow>()
      for (const r of tbRes.data as ClientPortalTransferBookingRow[]) {
        dedupTb.set(r.id, r)
      }
      setTransferBookingsPortal([...dedupTb.values()])
    } else {
      setTransferBookingsPortal([])
    }

    if (propRes.error) {
      setProposalsError(propRes.error.message)
      setProposals([])
    } else {
      setProposalsError(null)
      setProposals((propRes.data ?? []) as ProposalRow[])
    }

    const resetTripShellAndModals = () => {
      clearTripWorkspaceDraft()
      setTripDraft(null)
      setTransferBuilderOpen(false)
      setTeamMessagingOpen(false)
      setInterestModalCategory(null)
      setInterestDraftBody('')
      setInterestSubmitError(null)
      setInterestThreadTicketId(null)
      setInterestFollowUp('')
      setInterestFollowUpError(null)
    }

    if (buildRes.error) {
      setPackageBuilds([])
      resetTripShellAndModals()
    } else {
      const rawBuilds = (buildRes.data ?? []) as PackageBuildRow[]
      const linkedIds = [
        ...new Set(
          rawBuilds
            .map((b) => b.linked_proposal_id)
            .filter((x): x is string => typeof x === 'string' && x.length > 0)
        )
      ]

      let proposalById: Record<string, LinkedProposalMini> = {}

      if (linkedIds.length > 0) {
        const pr = await supabase.from('proposals').select('id, proposal_id, title, payload, created_at').in('id', linkedIds)
        if (!pr.error && pr.data) {
          proposalById = Object.fromEntries(
            pr.data.map((p) => {
              const row = p as LinkedProposalMini
              return [row.id, row]
            })
          )
        }
      }

      setPackageBuilds(
        rawBuilds.map((b) => ({
          ...b,
          linked_proposal: b.linked_proposal_id ? proposalById[b.linked_proposal_id] ?? null : null
        }))
      )
      if (rawBuilds.length === 0) {
        resetTripShellAndModals()
      }
    }
    } finally {
      listDataInflightRef.current -= 1
      if (listDataInflightRef.current <= 0) {
        listDataInflightRef.current = 0
        setListLoading(false)
      }
    }
  }, [session?.user?.id, session?.user?.email, profile?.account_reference_id])

  const interestTicketsFetchSeq = useRef(0)

  const refreshInterestAdminTimes = useCallback(async (supabase: BrowserSupabase, rows: PortalInterestTicketRow[]) => {
    const ids = rows.map((t) => t.id)
    if (ids.length === 0) {
      setInterestTicketLatestAdminAt({})
      return
    }

    const { data: adminMsgs, error: adminErr } = await supabase
      .from('portal_interest_ticket_messages')
      .select('ticket_id, created_at')
      .in('ticket_id', ids)
      .eq('author_kind', 'admin')

    if (adminErr || !adminMsgs) {
      setInterestTicketLatestAdminAt({})
      return
    }

    const latest: Record<string, string> = {}
    for (const m of adminMsgs as { ticket_id: string; created_at: string }[]) {
      const prev = latest[m.ticket_id]
      if (!prev || new Date(m.created_at) > new Date(prev)) {
        latest[m.ticket_id] = m.created_at
      }
    }
    setInterestTicketLatestAdminAt(latest)
  }, [])

  const refreshInterestTickets = useCallback(async () => {
    const seq = ++interestTicketsFetchSeq.current
    const userId = session?.user?.id
    if (!userId) {
      setInterestTickets([])
      setInterestTicketsError(null)
      setInterestTicketLatestAdminAt({})
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    const { data, error } = await supabase
      .from('portal_interest_tickets')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(40)

    if (seq !== interestTicketsFetchSeq.current) {
      return
    }

    if (error) {
      if (isMissingPortalInterestTicketsError(error)) {
        setInterestTickets([])
        setInterestTicketsError(null)
      } else {
        setInterestTickets([])
        setInterestTicketsError(error.message)
      }
      setInterestTicketLatestAdminAt({})
      return
    }

    const rows = (data ?? []) as PortalInterestTicketRow[]
    setInterestTicketsError(null)
    setInterestTickets(rows)

    if (seq !== interestTicketsFetchSeq.current) {
      return
    }

    await refreshInterestAdminTimes(supabase, rows)
  }, [session?.user?.id, refreshInterestAdminTimes])

  const refetchPortal = useCallback(() => {
    void loadData()
    void refreshProfile()
    void refreshInterestTickets()
  }, [loadData, refreshProfile, refreshInterestTickets])

  useEffect(() => {
    if (isLoading || !session?.user?.id) {
      return undefined
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return undefined
    }

    const uid = session.user.id
    const emailRaw = session.user.email?.trim()
    const emailLower = emailRaw ? emailRaw.toLowerCase() : ''
    let channel = supabase
      .channel(`client-portal-live-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` }, refetchPortal)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portal_client_updates', filter: `owner_id=eq.${uid}` },
        refetchPortal
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'package_builds', filter: `owner_id=eq.${uid}` }, refetchPortal)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals', filter: `owner_id=eq.${uid}` }, refetchPortal)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transfer_bookings', filter: `client_user_id=eq.${uid}` },
        refetchPortal
      )
    if (emailLower) {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transfer_bookings',
          filter: `client_email=eq.${emailLower}`
        },
        refetchPortal
      )
    }
    channel = channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_document_access', filter: `owner_id=eq.${uid}` },
        refetchPortal
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portal_client_transfer_documents', filter: `owner_id=eq.${uid}` },
        refetchPortal
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portal_interest_tickets', filter: `owner_id=eq.${uid}` },
        refetchPortal
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(
            '[client-dashboard] Realtime unavailable; use tab focus/refresh after admin clears portal. If this persists, apply migration 20260505240000_realtime_client_portal_dashboard.sql.'
          )
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [isLoading, session?.user?.id, session?.user?.email, refetchPortal])

  useEffect(() => {
    if (isLoading || !session?.user?.id) {
      return undefined
    }
    let t: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      if (document.visibilityState !== 'visible') {
        return
      }
      if (t) {
        window.clearTimeout(t)
      }
      t = window.setTimeout(() => {
        refetchPortal()
      }, 400)
    }
    document.addEventListener('visibilitychange', schedule)
    window.addEventListener('focus', schedule)
    return () => {
      document.removeEventListener('visibilitychange', schedule)
      window.removeEventListener('focus', schedule)
      if (t) {
        window.clearTimeout(t)
      }
    }
  }, [isLoading, session?.user?.id, refetchPortal])

  useEffect(() => {
    if (isLoading) {
      return
    }
    if (session?.user) {
      return
    }

    let cancelled = false
    const verify = async () => {
      const supabase = getSupabaseBrowserClient()
      const a = await supabase?.auth.getSession()
      if (cancelled) {
        return
      }
      if (a?.data?.session?.user) {
        return
      }
      /* After Stripe redirect, storage can resolve a beat after isLoading flips */
      await new Promise((r) => setTimeout(r, 500))
      if (cancelled) {
        return
      }
      const b = await supabase?.auth.getSession()
      if (b?.data?.session?.user) {
        return
      }
      window.location.replace('/dashboard/login')
    }
    void verify()
    return () => {
      cancelled = true
    }
  }, [isLoading, session?.user?.id])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const transferCheckoutSyncAttempted = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    let cancelled = false
    let t1 = 0
    let t2 = 0
    let t3 = 0

    const run = async () => {
      const spWait = new URLSearchParams(window.location.search)
      if (
        spWait.get('transfer_paid') === '1' &&
        spWait.get('checkout_session_id')?.trim() &&
        (isLoading || !session?.access_token)
      ) {
        return
      }

      const sp0 = new URLSearchParams(window.location.search)
      const transferPaidFlag = sp0.get('transfer_paid') === '1'
      const checkoutSessionId = sp0.get('checkout_session_id')?.trim()

      if (transferPaidFlag && checkoutSessionId && transferCheckoutSyncAttempted.current !== checkoutSessionId) {
        let accessToken = session?.access_token ?? ''
        if (!accessToken) {
          const supabaseAuth = getSupabaseBrowserClient()
          const sess = await supabaseAuth?.auth.getSession()
          accessToken = sess?.data.session?.access_token ?? ''
        }
        if (accessToken) {
        transferCheckoutSyncAttempted.current = checkoutSessionId
        let syncOk = false
        let syncMessage: string | null = null

        for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
          if (attempt > 0) {
            await new Promise((r) => window.setTimeout(r, 700 + attempt * 500))
          }
          try {
            const res = await fetch('/api/transfer-checkout-sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
              },
              body: JSON.stringify({ checkoutSessionId })
            })
            const data = (await res.json().catch(() => ({}))) as {
              ok?: boolean
              updated?: boolean
              message?: string
              bookingId?: string
            }
            if (!res.ok) {
              syncMessage = data.message ?? res.statusText
              if (res.status === 401) {
                transferCheckoutSyncAttempted.current = null
                break
              }
              continue
            }
            if (data.ok === false) {
              syncMessage = data.message ?? 'Payment is still processing with Stripe.'
              continue
            }
            await loadData()
            syncOk = Boolean(data.updated)
            const bidCheck =
              sp0.get('transfer_booking_id')?.trim() || (typeof data.bookingId === 'string' ? data.bookingId.trim() : '')
            if (!syncOk && bidCheck) {
              const sbCheck = getSupabaseBrowserClient()
              const { data: tbRow } = await (sbCheck
                ?.from('transfer_bookings')
                .select('payment_status')
                .eq('id', bidCheck)
                .maybeSingle() ?? Promise.resolve({ data: null }))
              const st = String(tbRow?.payment_status ?? 'unpaid').toLowerCase()
              syncOk = st === 'deposit' || st === 'paid'
            }
            if (syncOk) {
              syncMessage = null
              break
            }
            syncMessage =
              'Payment received — syncing your dashboard. If the badge still says Awaiting payment, refresh in a few seconds.'
          } catch {
            syncMessage = 'Could not confirm payment with the server. Refresh the page or contact Golf Sol Ireland.'
          }
        }

        if (!cancelled && syncMessage && !syncOk) {
          setInvoiceUrlBanner(syncMessage)
          transferCheckoutSyncAttempted.current = null
        }
        }
      }

      if (cancelled) {
        return
      }

      const sp = new URLSearchParams(window.location.search)
      const parts: string[] = []
      let stripeSuccessPoll = false
      let stripUrl = false
      if (sp.get('invoice_paid') === '1') {
        stripUrl = true
        parts.push('Payment received — thank you. Your invoice card should show Paid within a few seconds.')
        sp.delete('invoice_paid')
        setInvoicePanelRefresh((n) => n + 1)
        stripeSuccessPoll = true
        void loadData()
      } else if (sp.get('invoice_cancel') === '1') {
        stripUrl = true
        parts.push('Checkout was cancelled. You can open Pay again from your trip invoice card whenever you are ready.')
        sp.delete('invoice_cancel')
      }
      if (sp.get('transfer_paid') === '1') {
        stripUrl = true
        const bid = sp.get('transfer_booking_id')?.trim()
        if (bid) {
          setStripePaidTransferBookingId(bid)
        }
        sp.delete('transfer_paid')
        sp.delete('transfer_booking_id')
        sp.delete('checkout_session_id')
        stripeSuccessPoll = true
        void loadData()
      } else if (sp.get('transfer_pay_cancel') === '1') {
        stripUrl = true
        parts.push('Checkout was cancelled. You can use Pay now on your transfer when you are ready.')
        sp.delete('transfer_pay_cancel')
        sp.delete('transfer_booking_id')
        sp.delete('checkout_session_id')
      }
      if (parts.length) {
        setInvoiceUrlBanner(parts.join(' '))
      }
      if (stripUrl || parts.length) {
        const qs = sp.toString()
        window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`)
      }
      if (!stripeSuccessPoll || cancelled) {
        return
      }
      t1 = window.setTimeout(() => void loadData(), 1200)
      t2 = window.setTimeout(() => void loadData(), 3200)
      t3 = window.setTimeout(() => {
        void loadData()
        setInvoicePanelRefresh((n) => n + 1)
      }, 6200)
    }

    void run()

    return () => {
      cancelled = true
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [loadData, session?.access_token, isLoading])

  useEffect(() => {
    if (!transferServiceCardBookingId) {
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTransferServiceCardBookingId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [transferServiceCardBookingId])

  useEffect(() => {
    if (session?.user) {
      void refreshProfile()
    }
  }, [session?.user?.id, refreshProfile])

  useEffect(() => {
    contactSyncAttempted.current = false
    listDataInflightRef.current = 0
  }, [session?.user?.id])

  useEffect(() => {
    if (isLoading || !session?.access_token) {
      return
    }
    if (profile?.portal_contact_completed_at) {
      return
    }
    if (contactSyncAttempted.current) {
      return
    }

    const displayName = resolveClientDisplayFullName(session, profile).trim()
    const displayPhone = resolveClientPhone(session, profile).trim()
    const enquiryName = resolveClientGreetingFullName(session, profile, enquiries).trim()
    if ((displayName || enquiryName) && displayPhone) {
      return
    }

    contactSyncAttempted.current = true
    let cancelled = false

    void (async () => {
      try {
        const res = await fetch('/api/sync-portal-profile', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (cancelled || !res.ok) {
          return
        }
        const body = (await res.json()) as { updated?: boolean }
        if (body.updated) {
          await refreshProfile()
        }
      } catch {
        /* offline or API unavailable */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    isLoading,
    session?.user?.id,
    session?.access_token,
    profile?.full_name,
    profile?.phone,
    profile?.portal_contact_completed_at,
    enquiries,
    refreshProfile
  ])

  useEffect(() => {
    if (!session || !profile) {
      return
    }
    if (profile.portal_contact_completed_at) {
      return
    }
    setOnboardingName(resolveClientDisplayFullName(session, profile))
    setOnboardingPhone(resolveClientPhone(session, profile))
  }, [session?.user?.id, profile?.portal_contact_completed_at, profile?.full_name, profile?.phone])

  useEffect(() => {
    void refreshInterestTickets()
  }, [refreshInterestTickets])

  const hasUnreadInterestReplies = useMemo(() => {
    for (const t of interestTickets) {
      const latest = interestTicketLatestAdminAt[t.id]
      if (!latest) {
        continue
      }
      const readAt = t.client_last_read_at ? new Date(t.client_last_read_at).getTime() : 0
      if (new Date(latest).getTime() > readAt) {
        return true
      }
    }
    return false
  }, [interestTickets, interestTicketLatestAdminAt])

  const enquiryRowForSignedInEmail = useMemo(() => {
    const mail = session?.user?.email?.trim().toLowerCase()
    if (!mail) {
      return null
    }
    return enquiries.find((e) => (e.email ?? '').trim().toLowerCase() === mail) ?? null
  }, [enquiries, session?.user?.email])

  const accountRefForUi = useMemo(
    () =>
      (profile?.account_reference_id?.trim() ?? '') ||
      (enquiryRowForSignedInEmail?.reference_id?.trim() ?? ''),
    [profile?.account_reference_id, enquiryRowForSignedInEmail]
  )

  useEffect(() => {
    if (!interestThreadTicketId || !session?.user) {
      setInterestThreadMessages([])
      return
    }

    let cancelled = false
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    setInterestThreadLoading(true)

    void (async () => {
      const { data, error } = await supabase
        .from('portal_interest_ticket_messages')
        .select('*')
        .eq('ticket_id', interestThreadTicketId)
        .order('created_at', { ascending: true })

      if (cancelled) {
        return
      }

      setInterestThreadLoading(false)

      if (error) {
        setInterestThreadMessages([])
        return
      }

      setInterestThreadMessages((data ?? []) as PortalInterestTicketMessageRow[])
    })()

    return () => {
      cancelled = true
    }
  }, [interestThreadTicketId, session?.user?.id])

  useEffect(() => {
    if (!interestThreadTicketId || interestThreadLoading) {
      return
    }

    let cancelled = false
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    void (async () => {
      const { error } = await supabase.rpc('mark_portal_interest_ticket_read', { p_ticket_id: interestThreadTicketId })
      if (cancelled || error) {
        return
      }
      const nowIso = new Date().toISOString()
      setInterestTickets((prev) =>
        prev.map((t) => (t.id === interestThreadTicketId ? { ...t, client_last_read_at: nowIso } : t))
      )
    })()

    return () => {
      cancelled = true
    }
  }, [interestThreadTicketId, interestThreadLoading])

  useEffect(() => {
    if (listLoading || typeof window === 'undefined') {
      return
    }
    if (window.location.hash !== '#portal-interest') {
      return
    }
    window.requestAnimationFrame(() => {
      document.getElementById('portal-interest')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [listLoading])

  useEffect(() => {
    if (isLoading || !session) {
      return
    }

    try {
      const params = new URLSearchParams(window.location.search)
      const fromUrl = params.get('enquiry_ref')?.trim() ?? ''
      if (fromUrl && isLikelyEnquiryReferenceId(fromUrl)) {
        const existing = loadTripWorkspaceDraft()
        const merged: TripWorkspaceDraft = ensureTripWorkspaceDraftShape(
          existing?.referenceId === fromUrl
            ? { ...existing, updatedAt: new Date().toISOString() }
            : emptyTripWorkspaceDraft(fromUrl)
        )
        saveTripWorkspaceDraft(merged)
        setTripDraft(merged)
        window.history.replaceState({}, document.title, '/dashboard')
        return
      }
    } catch {
      /* ignore */
    }

    const loaded = loadTripWorkspaceDraft()
    const nextDraft = loaded ? ensureTripWorkspaceDraftShape(loaded) : null
    setTripDraft((prev) => {
      const prevJson = prev ? JSON.stringify(prev) : ''
      const nextJson = nextDraft ? JSON.stringify(nextDraft) : ''
      if (prevJson === nextJson) {
        return prev
      }
      return nextDraft
    })
  }, [isLoading, session?.user?.id])

  const loadTransferPortalPdfBlob = useCallback(async (row: TransferPortalDocumentRow) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }
    const { data, error } = await supabase.storage.from('client-portal-pdfs').createSignedUrl(row.storage_path, 3600)
    if (error || !data?.signedUrl) {
      throw new Error(error?.message ?? 'Could not open document.')
    }
    const res = await fetch(data.signedUrl)
    if (!res.ok) {
      throw new Error('Could not download PDF.')
    }
    return res.blob()
  }, [])

  const loadProposalPdfBlob = useCallback(async (row: ProposalRowLite) => {
    if (!row.payload || typeof row.payload !== 'object') {
      throw new Error('This proposal has no saved PDF data. Ask Golf Sol Ireland to re-send from the admin proposal tool.')
    }

    const res = await fetch('/api/proposal-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row.payload)
    })

    if (!res.ok) {
      const errText = await res.text()
      let msg = 'Could not generate PDF.'
      try {
        const j = JSON.parse(errText) as { message?: string }
        if (j.message) {
          msg = j.message
        }
      } catch {
        if (errText.trim()) {
          msg = errText
        }
      }

      throw new Error(msg)
    }

    return res.blob()
  }, [])

  const persistTripDraft = (next: TripWorkspaceDraft) => {
    const shaped = ensureTripWorkspaceDraftShape(next)
    saveTripWorkspaceDraft(shaped)
    setTripDraft(shaped)
  }

  const handleTripStageToggle = (key: TripStageKey) => () => {
    if (!tripDraft) {
      return
    }
    const nextOn = !tripDraft.stages[key]
    if (key === 'transfer' && !nextOn) {
      setTransferBuilderOpen(false)
    }
    persistTripDraft({
      ...tripDraft,
      stages: { ...tripDraft.stages, [key]: nextOn }
    })
  }

  const handleOpenTransferBuilder = () => {
    if (!tripDraft || !session) {
      return
    }
    let next = tripDraft
    if (!tripDraft.stages.transfer) {
      next = {
        ...tripDraft,
        stages: { ...tripDraft.stages, transfer: true },
        updatedAt: new Date().toISOString()
      }
    }
    const hint = resolveClientPhone(session, profile).trim()
    if (!(next.transferContactPhone ?? '').trim() && hint) {
      next = { ...next, transferContactPhone: hint }
    }
    persistTripDraft({ ...next, updatedAt: new Date().toISOString() })
    setTransferBuilderOpen(true)
  }

  const handleTransferStopsChange = (next: PortalTransferStop[]) => {
    if (!tripDraft) {
      return
    }
    persistTripDraft({
      ...tripDraft,
      transferStops: normalizeTransferStops(next),
      updatedAt: new Date().toISOString()
    })
  }

  const handleTransferContactChange = (value: string) => {
    if (!tripDraft) {
      return
    }
    persistTripDraft({ ...tripDraft, transferContactPhone: value, updatedAt: new Date().toISOString() })
  }

  const handleTripPartyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!tripDraft) {
      return
    }
    persistTripDraft({ ...tripDraft, partySize: Number(event.target.value) })
  }

  const handleTripCoursesChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!tripDraft) {
      return
    }
    const selected = Array.from(event.target.selectedOptions).map((o) => o.value)
    persistTripDraft({ ...tripDraft, courseIds: selected })
  }

  const handleTripHotelNotes = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!tripDraft) {
      return
    }
    persistTripDraft({ ...tripDraft, hotelNotes: event.target.value })
  }

  const handleClearTripWorkspace = () => {
    clearTripWorkspaceDraft()
    setTransferBuilderOpen(false)
    setTripDraft(null)
  }

  const handlePortalOnboardingSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!session?.access_token) {
      return
    }

    setOnboardingStatus('saving')
    setOnboardingMessage(null)

    try {
      const res = await fetch('/api/portal-contact-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          fullName: onboardingName.trim(),
          phone: onboardingPhone.trim()
        })
      })
      const json = (await res.json().catch(() => ({}))) as { message?: string; accountReferenceId?: string }

      if (!res.ok) {
        throw new Error(json.message ?? 'Could not save contact details.')
      }

      setOnboardingStatus('idle')
      await refreshProfile()
    } catch (err) {
      setOnboardingStatus('error')
      setOnboardingMessage(err instanceof Error ? err.message : 'Could not save contact details.')
    }
  }

  const handleConfirmImportedContact = async () => {
    if (!session?.access_token) {
      return
    }

    const fullName = profile?.full_name?.trim() ?? ''
    const phone = profile?.phone?.trim() ?? ''
    if (!fullName || !phone) {
      return
    }

    setOnboardingStatus('saving')
    setOnboardingMessage(null)

    try {
      const res = await fetch('/api/portal-contact-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ fullName, phone })
      })
      const json = (await res.json().catch(() => ({}))) as { message?: string }

      if (!res.ok) {
        throw new Error(json.message ?? 'Could not confirm contact details.')
      }

      setOnboardingStatus('idle')
      await refreshProfile()
    } catch (err) {
      setOnboardingStatus('error')
      setOnboardingMessage(err instanceof Error ? err.message : 'Could not confirm contact details.')
    }
  }

  const openTeamMessagingAndScroll = () => {
    setActiveClientSection('messages')
    setTeamMessagingOpen(true)
    window.requestAnimationFrame(() => {
      document.getElementById('portal-interest')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const openInterestModal = (category: PortalInterestCategory) => {
    setActiveClientSection('messages')
    setTeamMessagingOpen(true)
    setInterestModalCategory(category)
    setInterestDraftBody('')
    setInterestSubmitError(null)
  }

  const closeInterestModal = () => {
    setInterestModalCategory(null)
    setInterestDraftBody('')
    setInterestSubmitError(null)
  }

  const submitInterestTicket = async () => {
    if (!interestModalCategory || !session?.user?.id) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setInterestSubmitError('Supabase is not configured.')
      return
    }

    setInterestSubmitBusy(true)
    setInterestSubmitError(null)

    try {
      const body = interestDraftBody.trim() || 'Interested — please follow up.'
      const { data: ticketRow, error: ticketErr } = await supabase
        .from('portal_interest_tickets')
        .insert({
          owner_id: session.user.id,
          category: interestModalCategory,
          status: 'open'
        })
        .select('id')
        .single()

      if (ticketErr || !ticketRow?.id) {
        throw new Error(ticketErr?.message ?? 'Could not open ticket.')
      }

      const { error: msgErr } = await supabase.from('portal_interest_ticket_messages').insert({
        ticket_id: ticketRow.id,
        author_kind: 'client',
        body
      })

      if (msgErr) {
        throw new Error(msgErr.message)
      }

      const { data: list } = await supabase
        .from('portal_interest_tickets')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(40)

      const nextRows = (list ?? []) as PortalInterestTicketRow[]
      setInterestTickets(nextRows)
      await refreshInterestAdminTimes(supabase, nextRows)
      closeInterestModal()
    } catch (err) {
      setInterestSubmitError(err instanceof Error ? err.message : 'Could not send.')
    } finally {
      setInterestSubmitBusy(false)
    }
  }

  const closeInterestThread = () => {
    setInterestThreadTicketId(null)
    setInterestFollowUp('')
    setInterestFollowUpError(null)
  }

  const selectedInterestThread = interestThreadTicketId
    ? interestTickets.find((t) => t.id === interestThreadTicketId) ?? null
    : null

  const submitInterestFollowUp = async () => {
    if (!interestThreadTicketId || !session?.user?.id) {
      return
    }

    const text = interestFollowUp.trim()
    if (!text) {
      setInterestFollowUpError('Enter a message.')
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setInterestFollowUpError('Supabase is not configured.')
      return
    }

    setInterestFollowUpBusy(true)
    setInterestFollowUpError(null)

    try {
      const { error } = await supabase.from('portal_interest_ticket_messages').insert({
        ticket_id: interestThreadTicketId,
        author_kind: 'client',
        body: text
      })

      if (error) {
        throw new Error(error.message)
      }

      setInterestFollowUp('')

      const { data: msgs } = await supabase
        .from('portal_interest_ticket_messages')
        .select('*')
        .eq('ticket_id', interestThreadTicketId)
        .order('created_at', { ascending: true })

      setInterestThreadMessages((msgs ?? []) as PortalInterestTicketMessageRow[])

      const { data: list } = await supabase
        .from('portal_interest_tickets')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(40)

      const nextRows = (list ?? []) as PortalInterestTicketRow[]
      setInterestTickets(nextRows)
      await refreshInterestAdminTimes(supabase, nextRows)
    } catch (err) {
      setInterestFollowUpError(err instanceof Error ? err.message : 'Could not send.')
    } finally {
      setInterestFollowUpBusy(false)
    }
  }

  const accountCardSections = useMemo(
    () =>
      buildClientDataCardSections({
        profile,
        userEmail: session?.user?.email ?? null,
        enquiries: [],
        packageBuilds: [],
        transferBookings: [],
        includeTransferSection: false
      }).filter((s) => s.id === 'account'),
    [profile, session?.user?.email]
  )

  const dashboardPaymentBanner = useMemo(():
    | { kind: 'transfer_paid'; headline: string; detail: string }
    | { kind: 'plain'; text: string }
    | null => {
    if (stripePaidTransferBookingId) {
      const row = transferBookingsPortal.find((r) => r.id === stripePaidTransferBookingId)
      const st = (row?.payment_status ?? 'unpaid').toLowerCase()
      if (st === 'deposit') {
        return {
          kind: 'transfer_paid',
          headline: 'Deposit received — thank you.',
          detail: row
            ? `${row.pickup_label} → ${row.dropoff_label}: your deposit is on file. Pay the remaining balance from “Your transfers” before the due time shown on that row.`
            : 'Your deposit should appear on this transfer in a few seconds. Use Pay balance when you are ready to settle the remainder.'
        }
      }
      const headline = 'Payment received — thank you.'
      const detail = row
        ? `${row.pickup_label} → ${row.dropoff_label} is now Paid in full below. Download Paid invoice for your VAT receipt PDF.`
        : 'Your transfer line should show Paid in a few seconds. Use Paid invoice for your VAT receipt.'
      return { kind: 'transfer_paid', headline, detail }
    }
    if (invoiceUrlBanner?.trim()) {
      return { kind: 'plain', text: invoiceUrlBanner.trim() }
    }
    return null
  }, [stripePaidTransferBookingId, transferBookingsPortal, invoiceUrlBanner])

  const transferServiceCardModel = useMemo((): PortalTransferServiceCardModel | null => {
    if (!transferServiceCardBookingId) {
      return null
    }
    const r = transferBookingsPortal.find((x) => x.id === transferServiceCardBookingId)
    if (!r) {
      return null
    }
    return {
      enquiryReferenceId: r.enquiry_reference_id ?? null,
      createdAt: r.created_at ?? null,
      pickupLabel: r.pickup_label,
      dropoffLabel: r.dropoff_label,
      status: r.status,
      scheduledAt: r.scheduled_at,
      bookingSource: r.booking_source ?? null,
      packageBuildId: r.package_build_id ?? null,
      paymentStatus: r.payment_status ?? null,
      depositPercent: r.deposit_percent ?? null,
      adminPriceEur: r.admin_price_eur ?? null,
      nextAvailableDriver: r.next_available_driver === true
    }
  }, [transferServiceCardBookingId, transferBookingsPortal])

  if (isLoading || !session) {
    return <DashboardLoadingShell label="Loading your dashboard…" />
  }

  const portalSupabase = getSupabaseBrowserClient()
  const tripInvoicesPanel =
    portalSupabase && session.user.id ? (
      <PortalInvoicesPanel
        accountReferenceLabel={accountRefForUi.trim() ? accountRefForUi : null}
        refreshTrigger={invoicePanelRefresh}
        supabase={portalSupabase}
        userId={session.user.id}
      />
    ) : null

  const clientDisplayFullName = resolveClientDisplayFullName(session, profile)
  const clientDisplayPhone = resolveClientPhone(session, profile)
  const accountRef = profile?.account_reference_id?.trim() ?? ''
  const accountEmailForUi = (session.user.email ?? '').trim()
  /** Identity hero “Signed in as …”: email until one-time contact saves a name; then saved full name (contact section edits update this too). */
  let enquiryDisplayNameForGreeting = ''
  for (const row of enquiries) {
    const name = clientEnquiryDisplayFullName(row)
    if (name) {
      enquiryDisplayNameForGreeting = name
      break
    }
  }

  const signedInAsLine =
    profile?.portal_contact_completed_at && profile?.full_name?.trim()
      ? profile.full_name.trim()
      : profile?.full_name?.trim() ||
        enquiryDisplayNameForGreeting ||
        accountEmailForUi ||
        '—'
  const contactOnboardingDone = Boolean(profile?.portal_contact_completed_at)
  const hasImportedContactDetails =
    Boolean(profile?.full_name?.trim()) && Boolean(profile?.phone?.trim())
  const needsManualContactForm = !contactOnboardingDone && !hasImportedContactDetails
  const needsConfirmImportedContact = !contactOnboardingDone && hasImportedContactDetails

  const greetingFullName = resolveClientGreetingFullName(session, profile, enquiries)
  const greetingFirst = clientGreetingFirstName(greetingFullName)
  const dashboardTitle = greetingFirst ? `Hello, ${greetingFirst}` : 'Your dashboard'
  const showProposalsPortal =
    profile?.portal_proposals_enabled === true ||
    profile?.portal_pdf_library_enabled === true ||
    transferPortalDocuments.length > 0
  const showFormalProposalsList = profile?.portal_proposals_enabled === true
  const showPdfLibraryOnDashboard =
    profile?.portal_pdf_library_enabled === true && (documentAccess.terms || documentAccess.welcome)

  const tripIllustrative =
    tripDraft && (tripDraft.stages.transfer || tripDraft.stages.golf || tripDraft.stages.hotel)
      ? illustrativeTripPriceRangeEur(tripDraft)
      : null

  const interestHeroAdornment =
    hasUnreadInterestReplies ? (
      <button
        className="ge-on-dark group relative flex max-w-full cursor-pointer items-center gap-3 rounded-2xl border border-emerald-400/45 bg-gradient-to-br from-emerald-900/80 via-[#0c3d2c]/85 to-gs-green/90 px-4 py-2.5 text-left shadow-[0_0_0_1px_rgba(19, 96, 71,0.12),0_12px_40px_rgba(16,185,129,0.28)] ring-1 ring-white/10 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-brand-700/50 hover:shadow-[0_0_0_1px_rgba(19, 96, 71,0.35),0_16px_48px_rgba(16,185,129,0.35)]"
        onClick={() => openTeamMessagingAndScroll()}
        type="button"
      >
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
          <MessageCircle className="relative z-[1] h-5 w-5 text-fairway-50 drop-shadow-sm" aria-hidden />
          <span className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400/25 blur-md" aria-hidden />
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chrome-300/90 opacity-80" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-chrome-400 ring-2 ring-forest-950/80" />
          </span>
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.22em] text-emerald-100/95">New reply</span>
          <span className="block truncate text-sm font-bold leading-snug text-white">In your interest messages</span>
        </span>
      </button>
    ) : null

  const vatTreatmentFromHero = (t: ClientPortalTransferHeroRow): TransferReceiptVatTreatment =>
    t.admin_price_vat_treatment === 'services'
      ? 'services'
      : t.admin_price_vat_treatment === 'tourism'
        ? 'tourism'
        : null

  const handleTransferQuotePdf = async (t: ClientPortalTransferHeroRow) => {
    const dashboardPayUrl =
      typeof window !== 'undefined' && window.location?.origin
        ? `${window.location.origin.replace(/\/+$/, '')}/dashboard`
        : 'https://golfsolirl.com/dashboard'
    try {
      const { downloadTransferQuotePdf } = await import('../lib/transfer-vat-receipt-pdf')
      await downloadTransferQuotePdf({
        transfer: {
          id: t.id,
          pickup_label: t.pickup_label,
          dropoff_label: t.dropoff_label,
          status: t.status,
          scheduled_at: t.scheduled_at,
          admin_price_eur: t.admin_price_eur,
          admin_price_vat_treatment: vatTreatmentFromHero(t),
          payment_status: t.payment_status,
          booking_source: t.booking_source
        },
        customerName: clientDisplayFullName,
        accountRef: accountRef || null,
        customerEmail: session.user.email ?? null,
        dashboardPayUrl
      })
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not create quote PDF.')
    }
  }

  const handleTransferPaidInvoicePdf = async (t: ClientPortalTransferHeroRow) => {
    try {
      const { downloadTransferPaidInvoicePdf } = await import('../lib/transfer-vat-receipt-pdf')
      const row = transferBookingsPortal.find((r) => r.id === t.id)
      const paymentRecordedHint =
        row?.updated_at
          ? `Systems updated ${new Date(row.updated_at).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' })}`
          : null
      await downloadTransferPaidInvoicePdf({
        transfer: {
          id: t.id,
          pickup_label: t.pickup_label,
          dropoff_label: t.dropoff_label,
          status: t.status,
          scheduled_at: t.scheduled_at,
          admin_price_eur: t.admin_price_eur,
          admin_price_vat_treatment: vatTreatmentFromHero(t),
          payment_status: t.payment_status,
          booking_source: t.booking_source
        },
        customerName: clientDisplayFullName,
        accountRef: accountRef || null,
        customerEmail: session.user.email ?? null,
        paymentRecordedHint
      })
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not create paid invoice PDF.')
    }
  }

  const handlePayTransfer = async (t: ClientPortalTransferHeroRow, phase: 'deposit' | 'balance' | 'full') => {
    if (!session.access_token) {
      window.alert('Sign in again to pay.')
      return
    }
    try {
      const res = await fetch('/api/transfer-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ bookingId: t.id, paymentPhase: phase })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; url?: string }
      if (!res.ok) {
        throw new Error(data.message || 'Could not start checkout.')
      }
      if (data.url) {
        window.location.assign(data.url)
      }
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Payment could not start.')
    }
  }

  return (
    <DashboardLayout
      kicker="Your client area"
      subtitle="Use the menu on the left for your trip, payments, messages, contact details, and documents — one area at a time."
      title={dashboardTitle}
      titleAdornment={interestHeroAdornment}
      variant="client"
    >
      {listLoading ? (
        <div className="fixed inset-0 z-[35] flex items-center justify-center overflow-y-auto overscroll-contain bg-white/55 backdrop-blur-md supports-[backdrop-filter]:bg-white/40">
          <PortalAccountLoadingState compact />
        </div>
      ) : null}

      <ClientPortalShell
        activeSection={activeClientSection}
        onSectionChange={setActiveClientSection}
        unreadMessages={hasUnreadInterestReplies}
      >
        <div className={dashboardPaymentBanner ? 'mb-8 space-y-3' : 'mb-8'}>
          <ClientPortalIdentityHero
            accountEmail={session.user.email ?? null}
            accountNumber={accountRefForUi.trim() ? accountRefForUi : null}
            className={dashboardPaymentBanner ? '!mb-0' : undefined}
            emphasizeTransferBookingId={stripePaidTransferBookingId}
            firstName={greetingFirst}
            signedInAs={signedInAsLine}
            onDownloadTransferQuotePdf={handleTransferQuotePdf}
            onDownloadTransferPaidInvoicePdf={handleTransferPaidInvoicePdf}
            onPayTransfer={handlePayTransfer}
            onViewTransferCard={(t) => setTransferServiceCardBookingId(t.id)}
            transfers={transferBookingsPortal}
          />
          {dashboardPaymentBanner ? (
                <div
                  className="flex flex-col gap-3 rounded-2xl border border-emerald-300/80 bg-fairway-50/95 px-4 py-3.5 text-forest-950 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  role="status"
                >
                  <div className="min-w-0 flex-1">
                    {dashboardPaymentBanner.kind === 'transfer_paid' ? (
                      <>
                        <p className="font-display text-base font-semibold tracking-tight text-forest-950 md:text-lg">
                          {dashboardPaymentBanner.headline}
                        </p>
                        <p className="mt-2 text-base leading-relaxed text-emerald-900/95 md:text-lg">{dashboardPaymentBanner.detail}</p>
                      </>
                    ) : (
                      <p className="text-base leading-relaxed text-forest-950 md:text-lg">{dashboardPaymentBanner.text}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                    {dashboardPaymentBanner.kind === 'transfer_paid' && stripePaidTransferBookingId ? (
                      <LuxuryButton
                        className="!px-4 !py-2 !text-xs"
                        onClick={() => setTransferServiceCardBookingId(stripePaidTransferBookingId)}
                        type="button"
                        variant="secondary"
                      >
                        View transfer card
                      </LuxuryButton>
                    ) : null}
                    <button
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800 underline decoration-fairway-600/60"
                      onClick={() => {
                        setInvoiceUrlBanner(null)
                        setStripePaidTransferBookingId(null)
                      }}
                      type="button"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : null}
        </div>

        <ClientPortalPaymentsDue
          anchorId="client-pay-now"
          className="mb-10"
          onGoToPaymentsTab={() => {
            setActiveClientSection('payments')
            window.requestAnimationFrame(() => {
              document.getElementById('client-pay-now')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            })
          }}
          onPayTransfer={handlePayTransfer}
          supabase={getSupabaseBrowserClient()}
          transfers={transferBookingsPortal}
          userId={session.user.id}
        />

        <ClientPortalSection activeSection={activeClientSection} section="home">
          <div className="space-y-10">
            <PortalAddToYourTripStrip onSelect={openInterestModal} variant="page" />
            {accountCardSections.length > 0 ? <PortalClientDataCard sections={accountCardSections} /> : null}
            <PortalTransferRequestsSection
              bookings={transferBookingsPortal}
              enquiries={enquiries}
              interestTickets={interestTickets}
              packageBuilds={packageBuilds}
            />
          </div>
        </ClientPortalSection>

        <ClientPortalSection activeSection={activeClientSection} section="payments">
          <div className="space-y-10">
            <ClientPortalPaymentsDue
              onPayTransfer={handlePayTransfer}
              supabase={portalSupabase}
              transfers={transferBookingsPortal}
              userId={session.user.id}
            />
            {tripInvoicesPanel ?? (
              <section className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Payments</p>
                <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">Invoices &amp; receipts</h2>
                <p className="mt-2 max-w-2xl text-base text-forest-700">
                  Trip invoices from Golf Sol Ireland appear here once sent. Transfer card payments are in the section above.
                </p>
              </section>
            )}
          </div>
        </ClientPortalSection>

        <ClientPortalSection activeSection={activeClientSection} section="trip">
      {tripDraft ? (
        <section className="rounded-[2rem] border border-fairway-200/90 bg-gradient-to-br from-offwhite via-white to-[#f4faf6] p-6 shadow-soft md:p-9">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Enquiry workspace</p>
              <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950 sm:text-4xl">Build on your enquiry</h2>
              <p className="mt-2 max-w-2xl text-base text-forest-600 md:text-lg">
                Reference <span className="font-mono font-semibold text-forest-900">{tripDraft.referenceId}</span> — choose
                what you want quoted next. This saves to this browser until we connect it to your account in the database;
                use <span className="font-medium">Save preferences</span> after each change. Your team at Golf Sol Ireland sees
                the full enquiry from your original form email.
              </p>
            </div>
            <LuxuryButton className="shrink-0" onClick={handleClearTripWorkspace} type="button" variant="outlineOnLight">
              Clear workspace
            </LuxuryButton>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] lg:items-start">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-forest-700">What should we quote?</p>
              <div className="flex flex-col gap-3">
                {tripStageOptionRows.map(([key, title, hint]) =>
                  key === 'transfer' ? (
                    <div
                      className={cx(
                        'flex gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-colors',
                        transferBuilderOpen && tripDraft.stages.transfer
                          ? 'border-fairway-400 bg-fairway-50/70'
                          : 'border-forest-100 bg-white/90 hover:border-fairway-300'
                      )}
                      key={key}
                    >
                      <input
                        checked={tripDraft.stages.transfer}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-forest-300 text-fairway-600 focus:ring-fairway-400"
                        onChange={handleTripStageToggle('transfer')}
                        onClick={(e) => e.stopPropagation()}
                        type="checkbox"
                      />
                      <button
                        className="min-w-0 flex-1 rounded-xl text-left outline-none ring-fairway-400 focus-visible:ring-2"
                        onClick={handleOpenTransferBuilder}
                        type="button"
                      >
                        <span className="block text-base font-semibold text-forest-950">{title}</span>
                        <span className="mt-0.5 block text-sm text-forest-600">{hint}</span>
                        <span className="mt-1.5 block text-sm font-semibold text-fairway-800">
                          Tap here to open the transfer planner (pick-up, drops, contact number).
                        </span>
                      </button>
                    </div>
                  ) : (
                    <label
                      className="flex cursor-pointer gap-3 rounded-2xl border border-forest-100 bg-white/90 px-4 py-3 shadow-sm transition-colors hover:border-fairway-300"
                      key={key}
                    >
                      <input
                        checked={tripDraft.stages[key]}
                        className="mt-1 h-4 w-4 rounded border-forest-300 text-fairway-600 focus:ring-fairway-400"
                        onChange={handleTripStageToggle(key)}
                        type="checkbox"
                      />
                      <span>
                        <span className="block text-base font-semibold text-forest-950">{title}</span>
                        <span className="mt-0.5 block text-sm text-forest-600">{hint}</span>
                      </span>
                    </label>
                  )
                )}
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="trip-party">
                  Guests (1–8)
                </label>
                <select
                  className={cx(inputClass, 'max-w-[200px]')}
                  id="trip-party"
                  onChange={handleTripPartyChange}
                  value={tripDraft.partySize}
                >
                  {Array.from({ length: 8 }, (_, index) => index + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
              </div>

              {tripDraft.stages.golf ? (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="trip-courses">
                    Preferred courses (multi-select)
                  </label>
                  <select
                    className="h-48 w-full rounded-2xl border-2 border-orange-400 bg-white px-3 py-2 text-sm text-forest-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-300/70"
                    id="trip-courses"
                    multiple
                    onChange={handleTripCoursesChange}
                    value={[...tripDraft.courseIds]}
                  >
                    {COURSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.region}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-forest-500">Hold Ctrl / ⌘ to select several. Corridor map: </p>
                  <LuxuryButton className="mt-2" href="/golf-map" variant="outlineOnLight">
                    Open interactive map
                  </LuxuryButton>
                </div>
              ) : null}

              {tripDraft.stages.hotel ? (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="trip-hotel">
                    Hotel notes
                  </label>
                  <textarea
                    className={cx(inputClass, 'min-h-[100px]')}
                    id="trip-hotel"
                    onChange={handleTripHotelNotes}
                    placeholder="e.g. 5★ Marbella front line, twin rooms, ground floor, B&B…"
                    value={tripDraft.hotelNotes}
                  />
                </div>
              ) : null}
            </div>

            <div className="lg:sticky lg:top-36">
              {tripDraft.stages.transfer && transferBuilderOpen ? (
                <PortalTransferRouteBuilder
                  contactPhone={tripDraft.transferContactPhone ?? ''}
                  onClose={() => setTransferBuilderOpen(false)}
                  onContactPhoneChange={handleTransferContactChange}
                  onStopsChange={handleTransferStopsChange}
                  partySize={tripDraft.partySize}
                  stops={normalizeTransferStops(tripDraft.transferStops)}
                />
              ) : tripDraft.stages.transfer ? (
                <div className="rounded-2xl border border-dashed border-forest-200 bg-white/90 p-5 text-center shadow-sm">
                  <p className="text-sm text-forest-700">
                    Build your route: Málaga Airport or a corridor hotel as pick-up, then add up to eight stops including
                    airports, hotels, and courses.
                  </p>
                  <LuxuryButton className="mt-4" onClick={() => setTransferBuilderOpen(true)} type="button" variant="outlineOnLight">
                    Open transfer planner
                  </LuxuryButton>
                </div>
              ) : (
                <p className="rounded-2xl border border-forest-100/80 bg-offwhite/60 p-4 text-sm text-forest-600 lg:max-w-none">
                  Tick <strong className="font-medium text-forest-800">Airport &amp; golf-day transfers</strong> on the left to
                  plan your corridor transfers here.
                </p>
              )}
            </div>
          </div>

          {tripIllustrative ? (
            <div className="mt-8 rounded-2xl border border-forest-200 bg-white/95 px-5 py-4 text-sm text-forest-800">
              <p className="font-semibold text-forest-950">Illustrative ballpark (not a binding quote)</p>
              <p className="mt-1 text-forest-700">
                From roughly{' '}
                <span className="font-semibold text-forest-900">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(tripIllustrative.low)}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-forest-900">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(tripIllustrative.high)}
                </span>{' '}
                depending on dates, tee times, and hotel availability. We will confirm everything in writing.
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <LuxuryButton
              onClick={() => tripDraft && persistTripDraft({ ...tripDraft, updatedAt: new Date().toISOString() })}
              type="button"
              variant="primary"
            >
              Save preferences
            </LuxuryButton>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Trip planner</p>
          <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">Build on your enquiry</h2>
          <p className="mt-2 max-w-2xl text-base text-forest-700">
            Submit a quote form on the website with this login email — your enquiry workspace opens here so you can add
            transfers, golf, and hotels.
          </p>
        </section>
      )}
        </ClientPortalSection>

        <ClientPortalSection activeSection={activeClientSection} section="contact">
      <section className="relative rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Your contact details</p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950 md:text-4xl">How we reach you</h2>

        {needsManualContactForm ? (
          <>
            <p className="mt-2 max-w-2xl text-base text-forest-600 md:text-lg">
              You signed in directly — add your name and phone once so we can reach you. Your email is the one you used to sign
              in. Website enquiries you submit later with the same email still appear in linked requests above.
              {accountRef ? (
                <>
                  {' '}
                  Your account number is already assigned (see below) — same GSI-style reference as enquiry confirmations. Only
                  name and phone can be edited here.
                </>
              ) : null}
            </p>
            <form className="mt-6 max-w-xl space-y-4" noValidate onSubmit={(e) => void handlePortalOnboardingSubmit(e)}>
              <div>
                <label className={labelClass} htmlFor="portal-onboarding-name">
                  Name
                </label>
                <input
                  autoComplete="name"
                  className={inputClass}
                  id="portal-onboarding-name"
                  onChange={(e) => setOnboardingName(e.target.value)}
                  required
                  value={onboardingName}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="portal-onboarding-email">
                  Email
                </label>
                <input
                  className={readOnlyCalcClass}
                  id="portal-onboarding-email"
                  readOnly
                  value={profile?.email ?? session.user.email ?? ''}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="portal-onboarding-phone">
                  Phone
                </label>
                <input
                  autoComplete="tel"
                  className={inputClass}
                  id="portal-onboarding-phone"
                  onChange={(e) => setOnboardingPhone(e.target.value)}
                  required
                  type="tel"
                  value={onboardingPhone}
                />
              </div>
              <div>
                <p className={labelClass}>Account number</p>
                {accountRef ? (
                  <>
                    <p className="mt-1 font-mono text-base font-semibold text-forest-950">{accountRef}</p>
                    <p className="mt-2 max-w-xl text-xs text-forest-600">
                      This is your fixed account ID — it must match the number shown in “Your account” at the top. It cannot be
                      changed here (only name and phone above).
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-forest-700">
                    Assigned automatically when you save — same style as enquiry references (e.g. GSI-…). Only name and phone can
                    be edited.
                  </p>
                )}
              </div>
              {onboardingMessage ? (
                <p className="text-sm text-red-800" role="alert">
                  {onboardingMessage}
                </p>
              ) : null}
              <LuxuryButton disabled={onboardingStatus === 'saving'} type="submit" variant="primary">
                {onboardingStatus === 'saving' ? 'Saving…' : 'Save contact details'}
              </LuxuryButton>
            </form>
          </>
        ) : needsConfirmImportedContact ? (
          <>
            <p className="mt-2 max-w-2xl text-base text-forest-600 md:text-lg">
              We imported your name and phone from your website enquiry. Confirm they are correct for this account — we then
              {accountRef ? ' unlock messaging the team.' : ' assign your account number and unlock messaging the team.'}
              {accountRef ? (
                <>
                  {' '}
                  Your account number is already on file below — the same GSI-style reference as enquiry confirmations and as in
                  “Your account” at the top.
                </>
              ) : null}
            </p>
            <dl className="mt-5 grid gap-4 text-sm text-forest-800 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-forest-500">Name</dt>
                <dd className="mt-1 font-medium text-forest-950">{profile?.full_name?.trim() || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-forest-500">Email</dt>
                <dd className="mt-1 font-medium text-forest-950">{profile?.email ?? session.user.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-forest-500">Phone</dt>
                <dd className="mt-1 font-medium text-forest-950">{profile?.phone?.trim() || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-forest-500">Account number</dt>
                <dd className="mt-1 font-mono text-base font-semibold text-forest-950">
                  {accountRef || 'Assigned when you confirm'}
                </dd>
                {accountRef ? (
                  <p className="mt-2 max-w-xl text-xs text-forest-600">
                    Must match the number in “Your account” above. This reference is not editable; only your name and phone can be
                    changed after onboarding.
                  </p>
                ) : (
                  <p className="mt-2 max-w-xl text-xs text-forest-600">
                    Same style as enquiry references (e.g. GSI-…); assigned when you confirm.
                  </p>
                )}
              </div>
            </dl>
            {onboardingMessage ? (
              <p className="mt-4 text-sm text-red-800" role="alert">
                {onboardingMessage}
              </p>
            ) : null}
            <div className="mt-6">
              <LuxuryButton
                disabled={onboardingStatus === 'saving'}
                onClick={() => void handleConfirmImportedContact()}
                type="button"
                variant="primary"
              >
                {onboardingStatus === 'saving' ? 'Saving…' : 'Confirm on my account'}
              </LuxuryButton>
            </div>
          </>
        ) : (
          <dl className="mt-5 grid gap-4 text-sm text-forest-800 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-forest-500">Name</dt>
              <dd className="mt-1 font-medium text-forest-950">{clientDisplayFullName || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-forest-500">Email</dt>
              <dd className="mt-1 font-medium text-forest-950">{profile?.email ?? session.user.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-forest-500">Phone</dt>
              <dd className="mt-1 font-medium text-forest-950">{clientDisplayPhone || '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-forest-500">Account number</dt>
              <dd className="mt-1 font-mono text-base font-semibold text-forest-950">{accountRef || '— pending'}</dd>
              {!accountRef ? (
                <p className="mt-2 max-w-xl text-xs text-forest-600">
                  This is the same style of ID as on your enquiry confirmation. Golf Sol Ireland can add it from admin when your
                  trip is on file.
                </p>
              ) : null}
            </div>
          </dl>
        )}
      </section>
        </ClientPortalSection>

        <ClientPortalSection activeSection={activeClientSection} section="messages">
      <section className="relative rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Interest tickets</p>
              <h2 className="font-display mt-2 text-xl font-semibold text-forest-950 md:text-2xl">Ask Golf Sol Ireland</h2>
              <p className="mt-1 max-w-2xl text-sm text-forest-600">
                Open a ticket for transfers, golf courses, or hotels — we reply in the thread below.
              </p>
            </div>
            <button
              aria-expanded={teamMessagingOpen}
              className={cx(
                'group relative inline-flex shrink-0 items-center gap-2.5 overflow-hidden rounded-full border border-fairway-600/40',
                'ge-on-dark bg-gradient-to-r from-forest-950 via-[#0c3d2c] to-forest-950 px-6 py-3.5 text-sm font-semibold text-white',
                'shadow-[0_10px_36px_rgba(16,185,129,0.28)] ring-1 ring-white/15 transition duration-300',
                'hover:-translate-y-0.5 hover:border-brand-400/50 hover:shadow-[0_14px_44px_rgba(16,185,129,0.38)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
              )}
              onClick={() => setTeamMessagingOpen((o) => !o)}
              type="button"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.12)_45%,transparent_90%)] opacity-0 transition group-hover:translate-x-full group-hover:opacity-100 group-hover:duration-700"
              />
              <Ticket className="relative h-4 w-4 shrink-0 text-brand-300" strokeWidth={2.25} aria-hidden />
              <span className="relative">{teamMessagingOpen ? 'Hide ticketing' : 'Open ticketing'}</span>
              <ChevronDown
                aria-hidden
                className={cx(
                  'relative h-4 w-4 shrink-0 text-emerald-100/90 transition-transform duration-300',
                  teamMessagingOpen ? 'rotate-180' : 'rotate-0'
                )}
              />
            </button>
          </div>
          {teamMessagingOpen ? (
            <div className="mt-6 scroll-mt-28 border-t border-forest-100 pt-6" id="portal-interest" tabIndex={-1}>
              <div className="mt-4 flex flex-wrap gap-3">
                <LuxuryButton onClick={() => openInterestModal('transfers')} type="button" variant="secondary">
                  <PortalInterestCategoryGlyph category="transfers" size="sm" />
                  Transfers
                </LuxuryButton>
                <LuxuryButton onClick={() => openInterestModal('golf_courses')} type="button" variant="secondary">
                  <PortalInterestCategoryGlyph category="golf_courses" size="sm" />
                  Golf courses
                </LuxuryButton>
                <LuxuryButton onClick={() => openInterestModal('hotels')} type="button" variant="secondary">
                  <PortalInterestCategoryGlyph category="hotels" size="sm" />
                  Hotels
                </LuxuryButton>
              </div>
              {interestTicketsError ? (
                <p className="mt-3 text-sm text-brand-900" role="alert">
                  {interestTicketsError}
                </p>
              ) : null}
              {interestTickets.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {interestTickets.map((t) => (
                    <li key={t.id}>
                      <button
                        className="flex w-full items-start gap-3 rounded-xl border border-forest-100 bg-offwhite/80 px-4 py-3 text-left text-sm text-forest-800 transition-colors hover:border-fairway-300 hover:bg-white"
                        onClick={() => {
                          setInterestThreadTicketId(t.id)
                          setInterestFollowUp('')
                          setInterestFollowUpError(null)
                        }}
                        type="button"
                      >
                        <PortalInterestCategoryGlyph category={t.category} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="font-semibold text-forest-950">{PORTAL_INTEREST_LABELS[t.category]}</span>
                          <span className="ml-2 text-xs text-forest-500">
                            {t.status} ·{' '}
                            {new Date(t.created_at).toLocaleString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="mt-1 block text-xs text-fairway-700">Open thread</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-forest-600">No open tickets yet — use the buttons above to start one.</p>
              )}
            </div>
          ) : null}
        </section>
        </ClientPortalSection>

        {interestThreadTicketId && selectedInterestThread ? (
          <div
            aria-labelledby="interest-thread-title"
            aria-modal="true"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-950/55 p-4"
            role="dialog"
          >
            <div className="relative max-h-[min(90vh,640px)] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-forest-200 bg-white p-6 shadow-xl md:p-8">
              <button
                className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest-600 transition-colors hover:bg-forest-100 hover:text-forest-900"
                onClick={closeInterestThread}
                type="button"
              >
                Close
              </button>
              <div className="flex items-start gap-3 pr-16">
                <PortalInterestCategoryGlyph category={selectedInterestThread.category} size="md" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold text-forest-950 md:text-xl" id="interest-thread-title">
                    {PORTAL_INTEREST_LABELS[selectedInterestThread.category]}
                  </h3>
                  <p className="mt-1 text-xs text-forest-500">
                    {selectedInterestThread.status} ·{' '}
                    {new Date(selectedInterestThread.created_at).toLocaleString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              {interestThreadLoading ? (
                <p className="mt-4 text-sm text-forest-600">Loading messages…</p>
              ) : (
                <>
                  <div className="mt-5 flex items-center gap-2 border-b border-forest-100 pb-2">
                    <PortalInterestCategoryGlyph category={selectedInterestThread.category} size="sm" />
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-forest-600">
                      Linked request messages
                    </span>
                  </div>
                  <ul className="mt-3 max-h-56 space-y-3 overflow-y-auto text-sm">
                    {interestThreadMessages.map((m) => (
                      <li
                        className={`rounded-xl border px-3 py-2 ${
                          m.author_kind === 'admin' ? 'border-fairway-200 bg-fairway-50/60' : 'border-forest-100 bg-offwhite/90'
                        }`}
                        key={m.id}
                      >
                        {m.author_kind === 'admin' ? (
                          <div className="flex min-h-[1.5rem] items-center">
                            <img
                              alt="Golf Sol Ireland"
                              className="h-6 w-auto max-w-[7rem] object-contain object-left"
                              src={GOLFSOL_BRAND_LOGO.svg}
                            />
                          </div>
                        ) : (
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forest-600">
                            <UserRound aria-hidden className="h-3.5 w-3.5 shrink-0 text-forest-500" />
                            You
                          </p>
                        )}
                        <p className="mt-1 whitespace-pre-wrap text-forest-900">{m.body}</p>
                      </li>
                    ))}
                  </ul>
                  <label className={`${labelClass} mt-5`} htmlFor="interest-follow-up">
                    Your reply
                  </label>
                  <textarea
                    className={cx(inputClass, 'mt-1 min-h-[88px] resize-y')}
                    id="interest-follow-up"
                    onChange={(e) => {
                      setInterestFollowUp(e.target.value)
                      setInterestFollowUpError(null)
                    }}
                    placeholder="Add a follow-up message…"
                    value={interestFollowUp}
                  />
                  {interestFollowUpError ? (
                    <p className="mt-2 text-sm text-red-800" role="alert">
                      {interestFollowUpError}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <LuxuryButton
                      disabled={interestFollowUpBusy}
                      onClick={() => void submitInterestFollowUp()}
                      type="button"
                      variant="primary"
                    >
                      {interestFollowUpBusy ? 'Sending…' : 'Send message'}
                    </LuxuryButton>
                    <LuxuryButton disabled={interestFollowUpBusy} onClick={closeInterestThread} type="button" variant="outlineOnLight">
                      Done
                    </LuxuryButton>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

        {transferServiceCardModel ? (
          <div
            aria-labelledby="transfer-service-card-title"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/55 p-4"
            onClick={() => setTransferServiceCardBookingId(null)}
            role="dialog"
          >
            <div
              className="relative max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-forest-200 bg-white p-6 shadow-xl md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest-600 transition-colors hover:bg-forest-100 hover:text-forest-900"
                onClick={() => setTransferServiceCardBookingId(null)}
                type="button"
              >
                Close
              </button>
              <h2 className="sr-only" id="transfer-service-card-title">
                Transfer details
              </h2>
              <PortalTransferServiceCard transfer={transferServiceCardModel} />
            </div>
          </div>
        ) : null}

        {interestModalCategory ? (
          <div
            aria-labelledby="interest-ticket-title"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/55 p-4"
            role="dialog"
          >
            <div className="relative max-h-[min(90vh,640px)] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-forest-200 bg-white p-6 shadow-xl md:p-8">
              <button
                className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest-600 transition-colors hover:bg-forest-100 hover:text-forest-900"
                onClick={closeInterestModal}
                type="button"
              >
                Close
              </button>
              <h3 className="font-display pr-16 text-lg font-semibold text-forest-950 md:text-xl" id="interest-ticket-title">
                {PORTAL_INTEREST_LABELS[interestModalCategory]}
              </h3>
              <p className="mt-2 text-sm text-forest-600">Add a note for the team (optional). We open a ticket with this heading.</p>
              <label className={`${labelClass} mt-5`} htmlFor="interest-ticket-body">
                Message
              </label>
              <textarea
                className={cx(inputClass, 'mt-1 min-h-[120px] resize-y')}
                id="interest-ticket-body"
                onChange={(e) => setInterestDraftBody(e.target.value)}
                placeholder="Dates, party size, or anything we should know…"
                value={interestDraftBody}
              />
              {interestSubmitError ? (
                <p className="mt-2 text-sm text-red-800" role="alert">
                  {interestSubmitError}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <LuxuryButton disabled={interestSubmitBusy} onClick={() => void submitInterestTicket()} type="button" variant="primary">
                  {interestSubmitBusy ? 'Sending…' : 'Send to Golf Sol Ireland'}
                </LuxuryButton>
                <LuxuryButton disabled={interestSubmitBusy} onClick={closeInterestModal} type="button" variant="outlineOnLight">
                  Cancel
                </LuxuryButton>
              </div>
            </div>
          </div>
        ) : null}

        <ClientPortalSection activeSection={activeClientSection} section="documents">
      {!listLoading ? (
        <div className="space-y-14 md:space-y-16">
          {showProposalsPortal ? (
            <section>
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Proposals &amp; PDFs</p>
                  <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">Documents from Golf Sol Ireland</h2>
                  <p className="mt-2 max-w-2xl text-base text-forest-600 md:text-lg">
                    Terms, thank-you letters, and formal proposals appear in the preview when Golf Sol Ireland enables them for
                    your account. After we save a transfer price for you, your original request snapshot, VAT quote PDF, and a
                    terms summary appear under <span className="font-semibold text-forest-800">Your paper trail</span>. The
                    preview is read-only — print, open in a new tab, download the PDF, or share a link to this dashboard.
                  </p>
                </div>
              </div>

              <PortalClientProposalsPdfViewer
                documentAccess={documentAccess}
                loadProposalPdf={loadProposalPdfBlob}
                loadTransferPortalPdf={loadTransferPortalPdfBlob}
                profilePortalPdfEnabled={profile?.portal_pdf_library_enabled === true}
                proposals={proposals}
                proposalsError={proposalsError}
                showFormalProposalsList={showFormalProposalsList}
                showPdfLibraryOnDashboard={showPdfLibraryOnDashboard}
                transferPortalDocuments={transferPortalDocuments}
              />

            {!showFormalProposalsList &&
            profile?.portal_proposals_enabled !== true &&
            profile?.portal_pdf_library_enabled === true ? (
                <div className="rounded-[2rem] border border-forest-100 bg-offwhite/90 px-6 py-8 text-sm text-forest-700 md:px-10">
                  <p className="font-semibold text-forest-900">Formal proposals</p>
                  <p className="mt-2 max-w-2xl">
                    Your PDF library can be shown separately. Formal proposal previews stay hidden until Golf Sol Ireland enables
                    that option for your account.
                  </p>
                </div>
              ) : null}
            </section>
          ) : (
            <section className="relative overflow-hidden rounded-[2rem] border border-forest-100/90 bg-gradient-to-br from-offwhite via-white to-[#eef6f0] px-6 py-9 text-sm text-forest-700 shadow-soft md:px-10 md:py-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-200/25 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-12 h-40 w-40 rounded-full bg-fairway-400/15 blur-3xl"
              />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Your paper trail, in one place</p>
                <h3 className="font-display mt-3 text-xl font-semibold tracking-tight text-forest-950 md:text-2xl">
                  The PDF shelf is almost ready
                </h3>
                <p className="mt-3 max-w-2xl leading-relaxed">
                  When Golf Sol Ireland switches this on for you, your terms, thank-you letter, and formal proposals will land
                  here as polished PDFs — same preview you get after a quote, with print and share at your fingertips. Nothing to
                  do for now except keep an eye on this card; the moment we publish a document for your trip, it will show up
                  automatically.
                </p>
              </div>
            </section>
          )}
        </div>
      ) : null}
        </ClientPortalSection>
      </ClientPortalShell>
    </DashboardLayout>
  )
}
