import type { Session } from '@supabase/supabase-js'
import { MessageCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { DashboardLayout, DashboardLoadingShell } from '../components/dashboard-layout'
import { LuxuryButton } from '../components/ui/button'
import {
  emptyTripDetailsForm,
  isCalculatorLockedTripField,
  mergeTripDetailsWithSaved,
  packagesPagePathFromConfig,
  packageBuildDbSourceLabel,
  parseAnyPackageBuildRowConfig,
  serializeTripDetailsForDb,
  tripDefaultsForPackageRow,
  TRIP_DETAILS_MULTILINE_KEYS,
  TRIP_DETAILS_SECTIONS,
  type PackageTripDetailsForm,
  type TripDetailsFieldKey
} from '../lib/package-build'
import { COURSES } from '../data/coastal-golf-data'
import { fetchPackageBuildsClientList, isMissingClientDetailsColumnError } from '../lib/fetch-package-builds'
import { fetchPortalClientUpdates, isMissingPortalUpdatesTableError, type PortalClientUpdateRow } from '../lib/fetch-portal-updates'
import { getSupabaseBrowserClient } from '../lib/supabase-client'

type BrowserSupabase = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>
import { formatTravelDateInput } from '../lib/format-travel-date'
import {
  clearTripWorkspaceDraft,
  emptyTripWorkspaceDraft,
  illustrativeTripPriceRangeEur,
  isLikelyEnquiryReferenceId,
  loadTripWorkspaceDraft,
  saveTripWorkspaceDraft,
  type TripStageKey,
  type TripWorkspaceDraft
} from '../lib/trip-workspace-draft'
import { FormalProposalPayloadSummary, type FormalProposalPayload } from '../components/formal-proposal-payload-summary'
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
  linked_proposal_id?: string | null
  linked_proposal?: LinkedProposalMini | null
}

const statusStyles: Record<string, string> = {
  draft: 'bg-forest-800 text-white ring-1 ring-forest-600/80',
  sent: 'bg-fairway-700 text-white ring-1 ring-fairway-500/80',
  accepted: 'bg-gold-50 text-gold-700 ring-1 ring-gold-200/80',
  archived: 'bg-forest-800 text-white ring-1 ring-forest-600/80'
}

const formatEur = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)

const inputClass =
  'w-full rounded-2xl border-2 border-orange-400 bg-white px-4 py-3 text-sm text-forest-900 placeholder:text-forest-400 outline-none transition-[border-color,box-shadow] focus:border-orange-500 focus:ring-2 focus:ring-orange-300/70'

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-gold-600'

const readOnlyCalcClass =
  'w-full rounded-2xl border-2 border-forest-200/90 bg-offwhite px-4 py-3 text-sm text-forest-900'

const readOnlyCalcHintClass = 'mt-1 text-xs text-forest-500'

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

const formatWebsiteFormFieldLabel = (key: string) => {
  const k = key.replace(/^form\./i, '').replace(/_/g, ' ').trim()
  return k || key
}

const websiteFormFieldValueText = (v: unknown) => {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'string') return v.trim() || '—'
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

export function ClientDashboardPage() {
  const { session, profile, isLoading, refreshProfile } = useAuth()
  const contactSyncAttempted = useRef(false)
  const detailsMessageRef = useRef<HTMLParagraphElement>(null)
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [packageBuilds, setPackageBuilds] = useState<PackageBuildRow[]>([])
  const [proposalsError, setProposalsError] = useState<string | null>(null)
  const [buildsError, setBuildsError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [selectedBuildId, setSelectedBuildId] = useState('')
  const [tripForm, setTripForm] = useState<PackageTripDetailsForm>(() => emptyTripDetailsForm())
  const [detailsStatus, setDetailsStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [detailsMessage, setDetailsMessage] = useState<string | null>(null)
  const [teamMessagingOpen, setTeamMessagingOpen] = useState(false)
  const [proposalPdfLoadingId, setProposalPdfLoadingId] = useState<string | null>(null)
  const [linkedProposalPdfLoadingBuildId, setLinkedProposalPdfLoadingBuildId] = useState<string | null>(null)
  const [expandedFormalProposalBuildId, setExpandedFormalProposalBuildId] = useState<string | null>(null)
  const [documentAccess, setDocumentAccess] = useState<{ terms: boolean; welcome: boolean }>({
    terms: false,
    welcome: false
  })
  const [tripDraft, setTripDraft] = useState<TripWorkspaceDraft | null>(null)
  const [portalUpdates, setPortalUpdates] = useState<PortalClientUpdateRow[]>([])
  const [portalUpdatesError, setPortalUpdatesError] = useState<string | null>(null)
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

  const loadData = useCallback(async () => {
    if (!session?.user) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setListLoading(false)
      setProposalsError('Supabase is not configured.')
      setBuildsError('Supabase is not configured.')
      return
    }

    setListLoading(true)
    const [propRes, buildRes, docRes, portalRes] = await Promise.all([
      supabase.from('proposals').select('id, proposal_id, title, status, created_at, payload').order('created_at', { ascending: false }),
      fetchPackageBuildsClientList(supabase, 40),
      supabase.from('client_document_access').select('document_kind').eq('owner_id', session.user.id),
      fetchPortalClientUpdates(supabase, 30)
    ])

    if (docRes.error) {
      setDocumentAccess({ terms: false, welcome: false })
    } else {
      const kinds = new Set((docRes.data ?? []).map((r) => r.document_kind))
      setDocumentAccess({ terms: kinds.has('terms'), welcome: kinds.has('welcome') })
    }

    if (portalRes.error) {
      if (isMissingPortalUpdatesTableError(portalRes.error)) {
        setPortalUpdates([])
        setPortalUpdatesError(null)
      } else {
        setPortalUpdates([])
        setPortalUpdatesError(portalRes.error.message)
      }
    } else {
      setPortalUpdatesError(null)
      setPortalUpdates((portalRes.data ?? []) as PortalClientUpdateRow[])
    }

    if (propRes.error) {
      setProposalsError(propRes.error.message)
      setProposals([])
    } else {
      setProposalsError(null)
      setProposals((propRes.data ?? []) as ProposalRow[])
    }

    if (buildRes.error) {
      setBuildsError(buildRes.error.message)
      setPackageBuilds([])
    } else {
      setBuildsError(null)
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
    }

    setListLoading(false)
  }, [session?.user])

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

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!session) {
      window.location.replace('/login')
    }
  }, [isLoading, session])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    if (session?.user) {
      void refreshProfile()
    }
  }, [session?.user?.id, refreshProfile])

  useEffect(() => {
    contactSyncAttempted.current = false
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
    if (displayName && displayPhone) {
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
  }, [isLoading, session, profile, profile?.portal_contact_completed_at, refreshProfile])

  useEffect(() => {
    if (!session || !profile) {
      return
    }
    if (profile.portal_contact_completed_at) {
      return
    }
    setOnboardingName(resolveClientDisplayFullName(session, profile))
    setOnboardingPhone(resolveClientPhone(session, profile))
  }, [session, profile, profile?.portal_contact_completed_at, profile?.full_name, profile?.phone])

  useEffect(() => {
    if (!session?.user?.id || !profile?.portal_contact_completed_at) {
      setInterestTickets([])
      setInterestTicketsError(null)
      setInterestTicketLatestAdminAt({})
      return
    }

    let cancelled = false
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    void (async () => {
      const { data, error } = await supabase
        .from('portal_interest_tickets')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(40)

      if (cancelled) {
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

      if (cancelled) {
        return
      }

      await refreshInterestAdminTimes(supabase, rows)
    })()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id, profile?.portal_contact_completed_at, refreshInterestAdminTimes])

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
        const merged: TripWorkspaceDraft =
          existing?.referenceId === fromUrl
            ? { ...existing, updatedAt: new Date().toISOString() }
            : emptyTripWorkspaceDraft(fromUrl)
        saveTripWorkspaceDraft(merged)
        setTripDraft(merged)
        window.history.replaceState({}, document.title, '/dashboard')
        return
      }
    } catch {
      /* ignore */
    }

    setTripDraft(loadTripWorkspaceDraft())
  }, [isLoading, session])

  useEffect(() => {
    if (!selectedBuildId) {
      setTripForm(emptyTripDetailsForm())
      return
    }

    const row = packageBuilds.find((b) => b.id === selectedBuildId)
    if (!row) {
      return
    }

    const defaults = tripDefaultsForPackageRow(row.config)
    setTripForm(mergeTripDetailsWithSaved(row.client_details, defaults))
  }, [selectedBuildId, packageBuilds])

  useEffect(() => {
    if (selectedBuildId && !packageBuilds.some((b) => b.id === selectedBuildId)) {
      setSelectedBuildId('')
      setDetailsStatus('idle')
      setDetailsMessage(null)
    }
  }, [packageBuilds, selectedBuildId])

  useEffect(() => {
    if (detailsStatus === 'saved') {
      detailsMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [detailsStatus])

  const handleTripFieldChange = (field: TripDetailsFieldKey) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'preferredTravelDates' ? formatTravelDateInput(event.target.value) : event.target.value
    setTripForm((prev) => ({ ...prev, [field]: value }))
    setDetailsStatus('idle')
    setDetailsMessage(null)
  }

  const handleSaveTripDetails = async (event: FormEvent) => {
    event.preventDefault()
    setDetailsMessage(null)

    if (!selectedBuildId || !session?.user) {
      setDetailsMessage('Choose a saved trip from the list first.')
      setDetailsStatus('error')
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setDetailsMessage('Could not connect.')
      setDetailsStatus('error')
      return
    }

    setDetailsStatus('saving')
    const { error } = await supabase
      .from('package_builds')
      .update({
        client_details: serializeTripDetailsForDb(tripForm),
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedBuildId)

    if (error) {
      setDetailsMessage(
        isMissingClientDetailsColumnError(error)
          ? 'Database is missing client_details. Run supabase/run-in-sql-editor-add-client-details.sql in Supabase SQL Editor, then try again.'
          : error.message
      )
      setDetailsStatus('error')
      return
    }

    setDetailsStatus('saved')
    setDetailsMessage('Your trip details are saved.')
    await loadData()
  }

  const handleDownloadLinkedBuildProposalPdf = async (build: PackageBuildRow) => {
    const lp = build.linked_proposal
    if (!lp?.payload || typeof lp.payload !== 'object') {
      window.alert('This formal proposal has no saved PDF data. Ask Golf Sol Ireland to re-send from the admin tool.')
      return
    }

    try {
      setLinkedProposalPdfLoadingBuildId(build.id)
      const res = await fetch('/api/proposal-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lp.payload)
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

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `golf-sol-ireland-${lp.proposal_id.replace(/[^\w.-]+/g, '-')}.pdf`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Download failed.')
    } finally {
      setLinkedProposalPdfLoadingBuildId(null)
    }
  }

  const handleDownloadProposalPdf = async (row: ProposalRow) => {
    if (!row.payload || typeof row.payload !== 'object') {
      window.alert('This proposal has no saved PDF data. Ask Golf Sol to re-send from the admin proposal tool.')
      return
    }

    try {
      setProposalPdfLoadingId(row.id)
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

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `golf-sol-ireland-${row.proposal_id.replace(/[^\w.-]+/g, '-')}.pdf`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Download failed.')
    } finally {
      setProposalPdfLoadingId(null)
    }
  }

  const persistTripDraft = (next: TripWorkspaceDraft) => {
    saveTripWorkspaceDraft(next)
    setTripDraft(next)
  }

  const handleTripStageToggle = (key: TripStageKey) => () => {
    if (!tripDraft) {
      return
    }
    persistTripDraft({
      ...tripDraft,
      stages: { ...tripDraft.stages, [key]: !tripDraft.stages[key] }
    })
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
    setTeamMessagingOpen(true)
    window.requestAnimationFrame(() => {
      document.getElementById('portal-interest')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const openInterestModal = (category: PortalInterestCategory) => {
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

  if (isLoading || !session) {
    return <DashboardLoadingShell label="Loading your dashboard…" />
  }

  const clientDisplayFullName = resolveClientDisplayFullName(session, profile)
  const clientDisplayPhone = resolveClientPhone(session, profile)
  const accountRef = profile?.account_reference_id?.trim() ?? ''
  const contactOnboardingDone = Boolean(profile?.portal_contact_completed_at)
  const hasImportedContactDetails =
    Boolean(profile?.full_name?.trim()) && Boolean(profile?.phone?.trim())
  const needsManualContactForm = !contactOnboardingDone && !hasImportedContactDetails
  const needsConfirmImportedContact = !contactOnboardingDone && hasImportedContactDetails
  const greetingFirst =
    profile?.full_name?.trim().split(/\s+/).filter(Boolean)[0] ??
    clientDisplayFullName.split(/\s+/).filter(Boolean)[0] ??
    ''
  const dashboardTitle = greetingFirst ? `Hello, ${greetingFirst}` : 'Hello'
  const hasAdminPricedPackage = packageBuilds.some((row) => {
    const c = parseAnyPackageBuildRowConfig(row.config)
    return c?.type === 'manual' || c?.type === 'calculator'
  })
  const showProposalsPortal =
    profile?.portal_proposals_enabled === true || profile?.portal_pdf_library_enabled === true
  const showFormalProposalsList = profile?.portal_proposals_enabled === true
  const showPdfLibraryOnDashboard =
    profile?.portal_pdf_library_enabled === true && (documentAccess.terms || documentAccess.welcome)
  const selectedBuildRow = selectedBuildId ? (packageBuilds.find((b) => b.id === selectedBuildId) ?? null) : null
  const selectedBuildParsed = selectedBuildRow ? parseAnyPackageBuildRowConfig(selectedBuildRow.config) : null
  const selectedTripIsManualQuote = selectedBuildParsed?.type === 'manual'
  const selectedTripIsWebsiteForm = selectedBuildParsed?.type === 'website_form'

  const tripIllustrative =
    tripDraft && (tripDraft.stages.transfer || tripDraft.stages.golf || tripDraft.stages.hotel)
      ? illustrativeTripPriceRangeEur(tripDraft)
      : null

  const interestHeroAdornment =
    contactOnboardingDone && hasUnreadInterestReplies ? (
      <button
        className="group relative flex max-w-full cursor-pointer items-center gap-3 rounded-2xl border border-emerald-400/45 bg-gradient-to-br from-emerald-900/80 via-[#0c3d2c]/85 to-gs-green/90 px-4 py-2.5 text-left shadow-[0_0_0_1px_rgba(255,199,44,0.12),0_12px_40px_rgba(16,185,129,0.28)] ring-1 ring-white/10 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-gs-gold/50 hover:shadow-[0_0_0_1px_rgba(255,199,44,0.35),0_16px_48px_rgba(16,185,129,0.35)]"
        onClick={() => openTeamMessagingAndScroll()}
        type="button"
      >
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
          <MessageCircle className="relative z-[1] h-5 w-5 text-emerald-50 drop-shadow-sm" aria-hidden />
          <span className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400/25 blur-md" aria-hidden />
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300/90 opacity-80" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-400 ring-2 ring-emerald-950/80" />
          </span>
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.22em] text-emerald-100/95">New reply</span>
          <span className="block truncate text-sm font-bold leading-snug text-white">In your interest messages</span>
        </span>
      </button>
    ) : null

  return (
    <DashboardLayout
      kicker="Your client area"
      subtitle="Your transfers, golf, and hotel packages appear below when published. Your website enquiry snapshot is shown on each line; trip notes unlock after we publish a priced package for you."
      title={dashboardTitle}
      titleAdornment={interestHeroAdornment}
      variant="client"
    >
      {tripDraft ? (
        <section className="mb-12 rounded-[2rem] border border-fairway-200/90 bg-gradient-to-br from-offwhite via-white to-[#f4faf6] p-6 shadow-soft md:p-9">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Enquiry workspace</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">Build on your enquiry</h2>
              <p className="mt-2 max-w-2xl text-sm text-forest-600">
                Reference <span className="font-mono font-semibold text-forest-900">{tripDraft.referenceId}</span> — choose
                what you want quoted next. This saves to this browser until we connect it to your account in the database;
                use <span className="font-medium">Save preferences</span> after each change. Your team at Golf Sol Ireland sees
                the full enquiry from your original form email.
              </p>
            </div>
            <LuxuryButton className="shrink-0" onClick={handleClearTripWorkspace} type="button" variant="outline">
              Clear workspace
            </LuxuryButton>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">What should we quote?</p>
              <div className="flex flex-col gap-3">
                {tripStageOptionRows.map(([key, title, hint]) => (
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
                      <span className="block text-sm font-semibold text-forest-950">{title}</span>
                      <span className="mt-0.5 block text-xs text-forest-600">{hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gold-600" htmlFor="trip-party">
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
            </div>

            <div className="space-y-5">
              {tripDraft.stages.golf ? (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gold-600" htmlFor="trip-courses">
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
                  <LuxuryButton className="mt-2" href="/golf-map" variant="outline">
                    Open interactive map
                  </LuxuryButton>
                </div>
              ) : null}

              {tripDraft.stages.hotel ? (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gold-600" htmlFor="trip-hotel">
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
            <LuxuryButton onClick={() => openTeamMessagingAndScroll()} type="button" variant="outline">
              Message the team
            </LuxuryButton>
          </div>
        </section>
      ) : null}

      <section className="relative mb-10 rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Your contact details</p>
        <h2 className="font-display mt-2 text-xl font-semibold text-forest-950 md:text-2xl">How we reach you</h2>

        {needsManualContactForm ? (
          <>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              You signed in directly — add your name and phone once so we can reach you. Your email is the one you used to sign
              in. Website enquiries you submit later with the same email still show as packages below.
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
                <p className="text-sm text-forest-700">
                  Assigned automatically when you save — same style as enquiry references (e.g. GSI-…).
                </p>
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
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              We imported your name and phone from your website enquiry. Confirm they are correct for this account — we then
              assign your account number and unlock messaging the team.
            </p>
            <dl className="mt-5 grid gap-4 text-sm text-forest-800 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-500">Name</dt>
                <dd className="mt-1 font-medium text-forest-950">{profile?.full_name?.trim() || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-500">Email</dt>
                <dd className="mt-1 font-medium text-forest-950">{profile?.email ?? session.user.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-500">Phone</dt>
                <dd className="mt-1 font-medium text-forest-950">{profile?.phone?.trim() || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-500">Account number</dt>
                <dd className="mt-1 font-mono text-base font-semibold text-forest-950">Assigned when you confirm</dd>
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
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-500">Name</dt>
              <dd className="mt-1 font-medium text-forest-950">{clientDisplayFullName || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-500">Email</dt>
              <dd className="mt-1 font-medium text-forest-950">{profile?.email ?? session.user.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-500">Phone</dt>
              <dd className="mt-1 font-medium text-forest-950">{clientDisplayPhone || '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-500">Account number</dt>
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

      {contactOnboardingDone ? (
        <section className="relative mb-10 rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Message the team</p>
              <h2 className="font-display mt-2 text-xl font-semibold text-forest-950 md:text-2xl">Interest tickets</h2>
              <p className="mt-1 max-w-2xl text-sm text-forest-600">
                Open a ticket for transfers, golf courses, or hotels — we reply in the thread below.
              </p>
            </div>
            <LuxuryButton
              aria-expanded={teamMessagingOpen}
              onClick={() => setTeamMessagingOpen((o) => !o)}
              type="button"
              variant="outline"
            >
              {teamMessagingOpen ? 'Hide ticketing' : 'Open ticketing'}
            </LuxuryButton>
          </div>
          {teamMessagingOpen ? (
            <div className="mt-6 scroll-mt-28 border-t border-forest-100 pt-6" id="portal-interest" tabIndex={-1}>
              <div className="mt-4 flex flex-wrap gap-3">
                <LuxuryButton onClick={() => openInterestModal('transfers')} type="button" variant="secondary">
                  Transfers
                </LuxuryButton>
                <LuxuryButton onClick={() => openInterestModal('golf_courses')} type="button" variant="secondary">
                  Golf courses
                </LuxuryButton>
                <LuxuryButton onClick={() => openInterestModal('hotels')} type="button" variant="secondary">
                  Hotels
                </LuxuryButton>
              </div>
              {interestTicketsError ? (
                <p className="mt-3 text-sm text-amber-900" role="alert">
                  {interestTicketsError}
                </p>
              ) : null}
              {interestTickets.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {interestTickets.map((t) => (
                    <li key={t.id}>
                      <button
                        className="w-full rounded-xl border border-forest-100 bg-offwhite/80 px-4 py-3 text-left text-sm text-forest-800 transition-colors hover:border-fairway-300 hover:bg-white"
                        onClick={() => {
                          setInterestThreadTicketId(t.id)
                          setInterestFollowUp('')
                          setInterestFollowUpError(null)
                        }}
                        type="button"
                      >
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
      ) : null}

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
              <h3 className="font-display pr-16 text-lg font-semibold text-forest-950 md:text-xl" id="interest-thread-title">
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
              {interestThreadLoading ? (
                <p className="mt-4 text-sm text-forest-600">Loading messages…</p>
              ) : (
                <>
                  <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto text-sm">
                    {interestThreadMessages.map((m) => (
                      <li
                        className={`rounded-xl border px-3 py-2 ${
                          m.author_kind === 'admin' ? 'border-fairway-200 bg-fairway-50/60' : 'border-forest-100 bg-offwhite/90'
                        }`}
                        key={m.id}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-forest-500">
                          {m.author_kind === 'admin' ? 'Golf Sol Ireland' : 'You'}
                        </p>
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
                    <LuxuryButton disabled={interestFollowUpBusy} onClick={closeInterestThread} type="button" variant="outline">
                      Done
                    </LuxuryButton>
                  </div>
                </>
              )}
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
                <LuxuryButton disabled={interestSubmitBusy} onClick={closeInterestModal} type="button" variant="outline">
                  Cancel
                </LuxuryButton>
              </div>
            </div>
          </div>
        ) : null}

      <section className="mb-10 rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Messages &amp; files</p>
        <h2 className="font-display mt-2 text-xl font-semibold text-forest-950 md:text-2xl">From Golf Sol Ireland</h2>
        <p className="mt-2 max-w-2xl text-sm text-forest-600">
          When we send you a branded email from the studio (with optional PDFs), it is logged here so this dashboard stays your
          single timeline alongside packages and proposals.
        </p>
        {portalUpdatesError ? (
          <p className="mt-4 text-sm text-amber-900" role="alert">
            {portalUpdatesError}
          </p>
        ) : null}
        {!portalUpdatesError && portalUpdates.length === 0 ? (
          <p className="mt-4 text-sm text-forest-600">
            No studio sends recorded yet. You will still receive the real email in your inbox — this list fills automatically when
            we message you from admin.
          </p>
        ) : null}
        {portalUpdates.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {portalUpdates.map((u) => {
              const names = Array.isArray(u.attachment_filenames) ? (u.attachment_filenames as string[]) : []
              return (
                <li
                  className="rounded-2xl border border-forest-100 bg-offwhite/90 px-5 py-4 text-sm text-forest-800 shadow-sm"
                  key={u.id}
                >
                  <p className="font-display text-base font-semibold text-forest-950">{u.title}</p>
                  <p className="mt-1 text-xs text-forest-500">
                    {new Date(u.created_at).toLocaleString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {u.template_key ? (
                      <span className="ml-2 text-forest-400">
                        · Site template
                      </span>
                    ) : null}
                  </p>
                  {u.summary?.trim() ? <p className="mt-2 text-forest-700">{u.summary.trim()}</p> : null}
                  {names.length > 0 ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
                      PDFs: {names.join(', ')}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-forest-500">No PDF attachments on this send.</p>
                  )}
                </li>
              )
            })}
          </ul>
        ) : null}
      </section>

      {listLoading ? (
        <p className="text-sm font-medium text-forest-600">Loading your account…</p>
      ) : (
        <div className="space-y-14 md:space-y-16">
          <section>
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Your packages</p>
                <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">Transfers, golf courses &amp; hotel</h2>
                <p className="mt-2 max-w-2xl text-sm text-forest-600">
                  Each line is a snapshot of what you submitted or what we published for you — website forms show every field.
                  Trip notes (below) unlock after we publish a calculator or quoted package with pricing.
                </p>
              </div>
              <LuxuryButton onClick={() => openTeamMessagingAndScroll()} type="button" variant="outline">
                Message the team
              </LuxuryButton>
            </div>

            {buildsError ? (
              <div className="rounded-3xl border border-amber-200/90 bg-amber-50/90 px-6 py-4 text-sm text-amber-950 shadow-soft">
                <p className="font-medium">Could not load saved packages.</p>
                <p className="mt-2 text-amber-900/85">{buildsError}</p>
                <p className="mt-2 text-xs text-amber-900/70">
                  Open <code className="rounded bg-white/80 px-1">supabase/run-in-sql-editor-add-client-details.sql</code> in this
                  repo, copy it into Supabase → SQL → Run. That adds <code className="rounded bg-white/80 px-1">client_details</code>{' '}
                  and the delete policy.
                </p>
              </div>
            ) : packageBuilds.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-forest-200 bg-offwhite px-6 py-10 text-center text-sm text-forest-900 md:px-10">
                No packages on your dashboard yet. When Golf Sol Ireland publishes your transfers, golf course options, or hotel
                quote, they will appear here. Use message the team if you would like a follow-up.
              </div>
            ) : (
              <>
                <ul className="mb-8 overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                  {packageBuilds.map((row, index) => {
                    const cfg = parseAnyPackageBuildRowConfig(row.config)
                    const reopenHref = cfg?.type === 'calculator' ? packagesPagePathFromConfig(cfg.config) : null
                    const total =
                      cfg?.type === 'calculator' ? cfg.config.totals.estimatedGroupTotal : cfg?.type === 'manual' ? cfg.config.priceEur : undefined
                    const hasLinkedFormal = Boolean(row.linked_proposal?.payload && typeof row.linked_proposal.payload === 'object')
                    const expanded = expandedFormalProposalBuildId === row.id
                    let manualSummaryPreview: string | null = null
                    let websiteFormEntries: [string, unknown][] | null = null
                    if (cfg?.type === 'manual' && cfg.config.summary.trim()) {
                      const s = cfg.config.summary.trim()
                      manualSummaryPreview = s.slice(0, 160) + (s.length > 160 ? '…' : '')
                    } else if (cfg?.type === 'website_form') {
                      websiteFormEntries = Object.entries(cfg.config.fields ?? {})
                    }

                    return (
                      <li
                        className={cx(
                          'border-b border-forest-100/80 last:border-b-0',
                          index % 2 === 1 ? 'bg-offwhite/90' : 'bg-white'
                        )}
                        key={row.id}
                      >
                        <div className="flex flex-col gap-4 px-5 py-5 md:px-7 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-lg font-semibold text-forest-950">
                              {row.label?.trim() || 'Package'}
                            </p>
                            <p className="mt-1 text-xs text-forest-500">
                              {packageBuildDbSourceLabel(row.source)} ·{' '}
                              {new Date(row.created_at).toLocaleString(undefined, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {manualSummaryPreview ? (
                              <p className="mt-2 line-clamp-2 text-sm text-forest-700">{manualSummaryPreview}</p>
                            ) : null}
                            {websiteFormEntries && websiteFormEntries.length > 0 ? (
                              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                                {websiteFormEntries.map(([key, val]) => (
                                  <div
                                    className="min-w-0 rounded-xl border border-forest-100/90 bg-offwhite/60 px-3 py-2.5"
                                    key={key}
                                  >
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-gold-700">
                                      {formatWebsiteFormFieldLabel(key)}
                                    </dt>
                                    <dd className="mt-0.5 whitespace-pre-wrap break-words text-forest-800">
                                      {websiteFormFieldValueText(val)}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            ) : cfg?.type === 'website_form' ? (
                              <p className="mt-2 text-sm text-forest-600">No form fields stored for this submission.</p>
                            ) : null}
                            {typeof total === 'number' ? (
                              <p className="mt-2 text-sm font-medium text-forest-700">
                                {cfg?.type === 'manual' ? 'Quoted total' : 'Group estimate'} {formatEur(total)}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {hasLinkedFormal ? (
                              <LuxuryButton
                                aria-expanded={expanded}
                                onClick={() =>
                                  setExpandedFormalProposalBuildId((prev) => (prev === row.id ? null : row.id))
                                }
                                type="button"
                                variant="outline"
                              >
                                {expanded ? 'Hide formal proposal' : 'View formal proposal'}
                              </LuxuryButton>
                            ) : null}
                            {reopenHref ? (
                              <LuxuryButton href={reopenHref} variant="primary">
                                Open in calculator
                              </LuxuryButton>
                            ) : null}
                          </div>
                        </div>
                        {expanded && hasLinkedFormal && row.linked_proposal ? (
                          <div className="border-t border-forest-100/80 bg-white px-5 pb-6 pt-2 md:px-7">
                            <FormalProposalPayloadSummary
                              onDownloadPdf={() => handleDownloadLinkedBuildProposalPdf(row)}
                              payload={row.linked_proposal.payload as FormalProposalPayload}
                              pdfLoading={linkedProposalPdfLoadingBuildId === row.id}
                              proposalIdText={row.linked_proposal.proposal_id}
                            />
                          </div>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>

                {hasAdminPricedPackage ? (
                <div className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Trip details</p>
                  <h3 className="font-display mt-2 text-xl font-semibold text-forest-950 md:text-2xl">
                    Proposal-style information (saved to your account)
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-forest-600">
                    {selectedTripIsManualQuote
                      ? 'Package name and pricing on this quote were set by Golf Sol Ireland — those lines are read-only here. You can edit the other fields and save; we will see your updates on our side.'
                      : selectedTripIsWebsiteForm
                        ? 'This card was created from a form you submitted on golfsolirl.com while signed in. The form snapshot and enquiry reference are fixed; add dates, notes, and anything else below and save so the team sees it on file.'
                        : 'Package, stay, group size, nights, rounds, and pricing come from your saved package snapshot — those are read-only here. Everything else you can edit and save; Golf Sol Ireland can adjust locked fields if needed.'}
                  </p>

                  <form className="mt-8 space-y-6" noValidate onSubmit={handleSaveTripDetails}>
                    <div>
                      <label className={labelClass} htmlFor="trip-select">
                        Select saved trip
                      </label>
                      <select
                        className={cx(inputClass, 'appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10')}
                        id="trip-select"
                        onChange={(e) => {
                          setSelectedBuildId(e.target.value)
                          setDetailsStatus('idle')
                          setDetailsMessage(null)
                        }}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a5c49'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                        }}
                        value={selectedBuildId}
                      >
                        <option value="">Choose a saved trip…</option>
                        {packageBuilds.map((row) => (
                          <option key={row.id} value={row.id}>
                            {(row.label ?? 'Build').slice(0, 72)}
                            {' · '}
                            {new Date(row.created_at).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedBuildId ? (
                      <>
                        <div className="space-y-10">
                          {TRIP_DETAILS_SECTIONS.map((section) => (
                            <div className="space-y-4" key={section.title}>
                              <h4 className="border-b border-orange-200/80 pb-2 font-display text-base font-semibold text-forest-900">
                                {section.title}
                              </h4>
                              {section.title === 'Trip shape' ? (
                                <p className="text-sm font-medium text-forest-700">
                                  Trip shape: {tripForm.nights.trim() || '0'} nights / {tripForm.rounds.trim() || '0'} rounds
                                  <span className="ml-2 font-normal text-forest-500">
                                    {selectedTripIsManualQuote
                                      ? '(from your Golf Sol Ireland package — read-only)'
                                      : selectedTripIsWebsiteForm
                                        ? '(website form snapshot — read-only)'
                                        : '(from saved package — read-only)'}
                                  </span>
                                </p>
                              ) : null}
                              <div className="grid gap-5 md:grid-cols-2">
                                {section.fields.map((field) => {
                                  const id = `td-${field.key}`
                                  const isMultiline = TRIP_DETAILS_MULTILINE_KEYS.has(field.key)
                                  const locked = isCalculatorLockedTripField(field.key, selectedBuildRow?.source ?? null)
                                  const displayValue = tripForm[field.key].trim() || '—'

                                  return (
                                    <div className={field.key === 'notesForGsol' ? 'md:col-span-2' : ''} key={field.key}>
                                      <span className={labelClass} id={`${id}-label`}>
                                        {field.label}
                                      </span>
                                      {locked ? (
                                        <div>
                                          <div
                                            aria-labelledby={`${id}-label`}
                                            className={readOnlyCalcClass}
                                            role="group"
                                          >
                                            {displayValue}
                                          </div>
                                          <p className={readOnlyCalcHintClass}>
                                            {selectedTripIsManualQuote
                                              ? 'Set by Golf Sol Ireland — contact us if this needs to change.'
                                              : selectedTripIsWebsiteForm
                                                ? 'Captured from your website form — contact us if the reference is wrong.'
                                                : 'From your saved package — admin can change if required.'}
                                          </p>
                                        </div>
                                      ) : isMultiline ? (
                                        <textarea
                                          aria-labelledby={`${id}-label`}
                                          className={cx(inputClass, 'min-h-[100px] resize-y')}
                                          id={id}
                                          onChange={handleTripFieldChange(field.key)}
                                          value={tripForm[field.key]}
                                        />
                                      ) : (
                                        <input
                                          aria-labelledby={`${id}-label`}
                                          autoComplete={
                                            field.key === 'leadGuestName'
                                              ? 'name'
                                              : field.key === 'contactPhone'
                                                ? 'tel'
                                                : undefined
                                          }
                                          className={inputClass}
                                          id={id}
                                          onChange={handleTripFieldChange(field.key)}
                                          value={tripForm[field.key]}
                                        />
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 flex flex-col gap-4 border-t border-forest-100 pt-8 sm:flex-row sm:flex-wrap sm:items-center">
                          <LuxuryButton disabled={detailsStatus === 'saving'} type="submit" variant="primary">
                            {detailsStatus === 'saving' ? 'Saving…' : 'Save trip details'}
                          </LuxuryButton>
                        </div>

                        {detailsMessage ? (
                          <p
                            ref={detailsMessageRef}
                            className={cx(
                              'text-sm font-medium',
                              detailsStatus === 'error' ? 'text-red-700' : 'text-forest-800'
                            )}
                            role={detailsStatus === 'error' ? 'alert' : 'status'}
                          >
                            {detailsMessage}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="mt-4 text-sm text-forest-600">Select a trip above to edit and save details.</p>
                    )}
                  </form>
                </div>
                ) : (
                  <div className="rounded-[2rem] border border-dashed border-forest-200 bg-offwhite/80 p-6 text-sm text-forest-700 shadow-soft md:p-8">
                    <p className="font-medium text-forest-900">Trip details</p>
                    <p className="mt-2 max-w-2xl">
                      After Golf Sol Ireland publishes a calculator build or a fixed-price quote for your trip, you can add dates,
                      notes, and other details here. Website-only enquiries stay in the package list above until we add pricing.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>

          {showProposalsPortal ? (
            <section>
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Proposals &amp; PDFs</p>
                  <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">Documents from Golf Sol Ireland</h2>
                  <p className="mt-2 max-w-2xl text-sm text-forest-600">
                    Formal proposals and your PDF library are controlled separately by Golf Sol Ireland. Terms and thank-you
                    links only appear when this area is on for your account and we have granted access.
                  </p>
                </div>
              </div>

              {showPdfLibraryOnDashboard ? (
              <div className="mb-8 rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Your PDF library</p>
                <h3 className="font-display mt-2 text-lg font-semibold text-forest-950">Terms and thank-you</h3>
                <p className="mt-2 max-w-xl text-sm text-forest-600">
                  Open a page, then use <strong className="font-medium text-forest-800">Save PDF</strong> for a print-ready copy
                  with the same header and footer as our main website.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {documentAccess.terms ? (
                    <LuxuryButton href="/documents/terms" variant="white">
                      Terms and conditions
                    </LuxuryButton>
                  ) : null}
                  {documentAccess.welcome ? (
                    <LuxuryButton href="/documents/welcome" variant="white">
                      Thank you — Golf Sol Ireland
                    </LuxuryButton>
                  ) : null}
                </div>
              </div>
            ) : null}

            {!showPdfLibraryOnDashboard &&
            profile?.portal_pdf_library_enabled === true &&
            !(documentAccess.terms || documentAccess.welcome) ? (
              <div className="mb-8 rounded-[2rem] border border-forest-100 bg-offwhite/90 px-6 py-5 text-sm text-forest-700 shadow-soft">
                <p className="font-medium text-forest-900">PDF library</p>
                <p className="mt-1 max-w-xl">
                  This area is enabled for your account; when we send you terms or our thank-you document, download links will
                  appear here.
                </p>
              </div>
            ) : null}

            {showFormalProposalsList ? (
              <>
            {proposalsError ? (
              <div className="rounded-3xl border border-red-200/80 bg-red-50/90 px-6 py-4 text-sm text-red-900 shadow-soft">
                {proposalsError}
              </div>
            ) : proposals.length === 0 ? (
              <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                <div
                  aria-hidden="true"
                  className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-gold-400 via-fairway-500 to-forest-700"
                />
                <div className="px-6 py-10 md:px-10 md:py-12">
                  <h3 className="font-display text-xl font-semibold text-forest-950">No formal proposals yet</h3>
                  <p className="mt-4 max-w-lg text-forest-600">
                    When we email you a proposal from our admin tools, it will show up here with a download button. Terms and
                    thank-you PDFs appear in your PDF library when that option is on for your account. Your published packages stay
                    in the section above.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                {proposals.map((row, index) => (
                  <li
                    className={cx(
                      'flex flex-col gap-3 border-b border-forest-100/80 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between md:px-7',
                      index % 2 === 1 ? 'bg-offwhite/90' : 'bg-white'
                    )}
                    key={row.id}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-semibold text-forest-950">
                        {row.title?.trim() || row.proposal_id}
                      </p>
                      <p className="mt-1 font-mono text-xs text-forest-500">{row.proposal_id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {row.payload ? (
                        <LuxuryButton
                          className="!px-5 !py-2.5 !text-xs"
                          disabled={proposalPdfLoadingId === row.id}
                          onClick={() => handleDownloadProposalPdf(row)}
                          type="button"
                          variant="primary"
                        >
                          {proposalPdfLoadingId === row.id ? 'Preparing…' : 'Download PDF'}
                        </LuxuryButton>
                      ) : null}
                      <span
                        className={cx(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize',
                          statusStyles[row.status] ?? 'bg-forest-800 text-white ring-1 ring-forest-600/80'
                        )}
                      >
                        {row.status}
                      </span>
                      <span className="text-xs font-medium text-forest-400">
                        {new Date(row.created_at).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
              </>
            ) : profile?.portal_proposals_enabled !== true && profile?.portal_pdf_library_enabled === true ? (
              <div className="rounded-[2rem] border border-forest-100 bg-offwhite/90 px-6 py-8 text-sm text-forest-700 md:px-10">
                <p className="font-semibold text-forest-900">Formal proposals</p>
                <p className="mt-2 max-w-2xl">
                  Your PDF library can be shown separately. Formal proposal downloads stay hidden until Golf Sol Ireland enables
                  that option for your account.
                </p>
              </div>
            ) : null}
            </section>
          ) : (
            <section className="rounded-[2rem] border border-forest-100 bg-offwhite/80 px-6 py-8 text-sm text-forest-700 md:px-10">
              <p className="font-semibold text-forest-900">Proposals and PDF library</p>
              <p className="mt-2 max-w-2xl">
                This area stays hidden until Golf Sol Ireland turns on formal proposals and/or your PDF library for your
                account.
              </p>
            </section>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
