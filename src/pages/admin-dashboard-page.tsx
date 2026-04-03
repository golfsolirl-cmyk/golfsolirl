import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { DashboardLayout, DashboardLoadingShell } from '../components/dashboard-layout'
import { LuxuryButton } from '../components/ui/button'
import { fetchPackageBuildsAdminList, isMissingClientDetailsColumnError } from '../lib/fetch-package-builds'
import {
  emptyTripDetailsForm,
  hasMeaningfulTripDetails,
  mergeTripDetailsWithSaved,
  parsePackageBuildConfig,
  serializeTripDetailsForDb,
  TRIP_DETAILS_MULTILINE_KEYS,
  TRIP_DETAILS_SECTIONS,
  tripDetailsFromConfig,
  type PackageTripDetailsForm,
  type TripDetailsFieldKey
} from '../lib/package-build'
import { integrationRegistry } from '../config/integrations'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { useAuth } from '../providers/auth-provider'
import { cx } from '../lib/utils'

interface EnquiryRow {
  id: string
  reference_id: string
  email: string
  full_name: string
  interest: string | null
  phone_whatsapp: string | null
  best_time_to_call: string | null
  created_at: string
}

interface ProposalRow {
  id: string
  proposal_id: string
  title: string | null
  status: string
  created_at: string
}

interface ProfileEmbed {
  email: string | null
  full_name: string | null
}

interface PackageBuildAdminRow {
  id: string
  owner_id: string
  label: string | null
  source: string
  config: unknown
  client_details: unknown
  created_at: string
  profiles: ProfileEmbed | ProfileEmbed[] | null
}

const profileFromRow = (row: PackageBuildAdminRow): ProfileEmbed | null => {
  const p = row.profiles
  if (!p) {
    return null
  }

  return Array.isArray(p) ? p[0] ?? null : p
}

const formatEur = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)

const proposalStatusStyles: Record<string, string> = {
  draft: 'bg-forest-800 text-white',
  sent: 'bg-fairway-700 text-white',
  accepted: 'bg-gold-50 text-gold-700',
  archived: 'bg-forest-800 text-white'
}

const adminTripLabelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-gold-600'

const adminTripInputClass =
  'w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900 outline-none transition-[border-color,box-shadow] focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/70'

export function AdminDashboardPage() {
  const { session, profile, isLoading } = useAuth()
  const [crmDocEmail, setCrmDocEmail] = useState('')
  const [crmDocSending, setCrmDocSending] = useState<'idle' | 'terms' | 'welcome'>('idle')
  const [crmDocMessage, setCrmDocMessage] = useState<string | null>(null)
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([])
  const [enquiriesSectionVisible, setEnquiriesSectionVisible] = useState(true)
  const [enquiryDeletingId, setEnquiryDeletingId] = useState<string | null>(null)
  const [enquiryDeletingAll, setEnquiryDeletingAll] = useState(false)
  const [enquiryDeleteMessage, setEnquiryDeleteMessage] = useState<string | null>(null)
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [packageBuilds, setPackageBuilds] = useState<PackageBuildAdminRow[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [buildsLoadError, setBuildsLoadError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [detailBuildId, setDetailBuildId] = useState<string | null>(null)
  const [adminTripForm, setAdminTripForm] = useState<PackageTripDetailsForm>(() => emptyTripDetailsForm())
  const [adminSaveStatus, setAdminSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [adminSaveMessage, setAdminSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!session) {
      window.location.replace('/login')
      return
    }

    if (profile?.role !== 'admin') {
      window.location.replace('/dashboard')
    }
  }, [isLoading, session, profile?.role])

  useEffect(() => {
    if (!session || profile?.role !== 'admin') {
      return
    }

    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      setListLoading(false)
      setLoadError('Supabase is not configured.')
      return
    }

    let cancelled = false

    const load = async () => {
      setListLoading(true)
      const [enqRes, propRes, buildRes] = await Promise.all([
        supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('proposals').select('id, proposal_id, title, status, created_at').order('created_at', { ascending: false }).limit(100),
        fetchPackageBuildsAdminList(supabase, 100)
      ])

      if (cancelled) {
        return
      }

      const errMsg = enqRes.error?.message ?? propRes.error?.message ?? null
      setLoadError(errMsg)
      setEnquiries((enqRes.data ?? []) as EnquiryRow[])
      setProposals((propRes.data ?? []) as ProposalRow[])

      if (buildRes.error) {
        setBuildsLoadError(buildRes.error.message)
        setPackageBuilds([])
      } else {
        setBuildsLoadError(null)
        setPackageBuilds((buildRes.data ?? []) as PackageBuildAdminRow[])
      }

      setListLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id, profile?.role])

  const detailRow = detailBuildId ? packageBuilds.find((b) => b.id === detailBuildId) ?? null : null
  const detailParsed = detailRow ? parsePackageBuildConfig(detailRow.config) : null

  const detailMergedTrip = useMemo(() => {
    if (!detailRow) {
      return emptyTripDetailsForm()
    }

    const parsed = parsePackageBuildConfig(detailRow.config)
    const defaults = parsed ? tripDetailsFromConfig(parsed) : emptyTripDetailsForm()
    return mergeTripDetailsWithSaved(detailRow.client_details, defaults)
  }, [detailRow])

  useEffect(() => {
    if (!detailRow) {
      return
    }

    setAdminTripForm(detailMergedTrip)
    setAdminSaveStatus('idle')
    setAdminSaveMessage(null)
  }, [detailMergedTrip, detailRow])

  const handleAdminTripFieldChange = (field: TripDetailsFieldKey) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAdminTripForm((prev) => ({ ...prev, [field]: event.target.value }))
    setAdminSaveStatus('idle')
    setAdminSaveMessage(null)
  }

  const handleAdminSaveBuildDetails = async (event: FormEvent) => {
    event.preventDefault()
    if (!detailRow) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setAdminSaveMessage('Supabase is not configured.')
      setAdminSaveStatus('error')
      return
    }

    setAdminSaveStatus('saving')
    setAdminSaveMessage(null)

    const payload = serializeTripDetailsForDb(adminTripForm)
    const { error } = await supabase
      .from('package_builds')
      .update({
        client_details: payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', detailRow.id)

    if (error) {
      setAdminSaveStatus('error')
      setAdminSaveMessage(
        isMissingClientDetailsColumnError(error)
          ? 'Database is missing client_details. Run supabase/run-in-sql-editor-add-client-details.sql in Supabase SQL.'
          : error.message
      )
      return
    }

    setAdminSaveStatus('saved')
    setAdminSaveMessage('Trip details saved.')
    setPackageBuilds((prev) =>
      prev.map((b) => (b.id === detailRow.id ? { ...b, client_details: payload } : b))
    )
  }

  const handleCloseBuildDetail = useCallback(() => {
    setDetailBuildId(null)
    setAdminSaveStatus('idle')
    setAdminSaveMessage(null)
  }, [])

  useEffect(() => {
    if (!detailBuildId) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseBuildDetail()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [detailBuildId, handleCloseBuildDetail])

  const handleSendCrmDocument = async (documentKind: 'terms' | 'welcome') => {
    if (!integrationRegistry.supabase.enabled) {
      setCrmDocMessage('Supabase is not configured.')
      return
    }

    if (!session?.access_token) {
      setCrmDocMessage('Session expired. Sign in again.')
      return
    }

    const email = crmDocEmail.trim().toLowerCase()

    if (!email.includes('@')) {
      setCrmDocMessage('Enter the client account email (same as their magic-link login).')
      return
    }

    try {
      setCrmDocSending(documentKind)
      setCrmDocMessage(null)

      const res = await fetch('/api/send-client-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ clientEmail: email, documentKind })
      })

      const data = (await res.json().catch(() => ({}))) as { message?: string; alreadyHadAccess?: boolean }

      if (!res.ok) {
        throw new Error(data.message || 'Send failed.')
      }

      const label = documentKind === 'terms' ? 'Terms and conditions' : 'Thank-you'

      setCrmDocMessage(
        data.alreadyHadAccess
          ? `${label}: email sent again (they already had access).`
          : `${label}: access granted and email sent. They will see it on their dashboard after sign-in.`
      )
    } catch (e) {
      setCrmDocMessage(e instanceof Error ? e.message : 'Send failed.')
    } finally {
      setCrmDocSending('idle')
    }
  }

  const handleRemoveEnquiry = async (row: EnquiryRow) => {
    if (
      !window.confirm(
        `Remove enquiry ${row.reference_id} for ${row.full_name}? This cannot be undone.`
      )
    ) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setEnquiryDeleteMessage('Supabase is not configured.')
      return
    }

    setEnquiryDeletingId(row.id)
    setEnquiryDeleteMessage(null)

    const { error } = await supabase.from('enquiries').delete().eq('id', row.id)

    setEnquiryDeletingId(null)

    if (error) {
      setEnquiryDeleteMessage(
        error.message.includes('policy') || error.code === '42501'
          ? 'Delete blocked by database policy. Run supabase/run-in-sql-editor-enquiries-delete-admin.sql (or apply the latest migration) in Supabase.'
          : error.message
      )
      return
    }

    setEnquiries((prev) => prev.filter((e) => e.id !== row.id))
  }

  const handleRemoveAllEnquiries = async () => {
    if (enquiries.length === 0) {
      return
    }

    if (
      !window.confirm(
        `Delete all ${enquiries.length} enquiry row(s) in this list? This cannot be undone.`
      )
    ) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setEnquiryDeleteMessage('Supabase is not configured.')
      return
    }

    setEnquiryDeletingAll(true)
    setEnquiryDeleteMessage(null)

    const ids = enquiries.map((e) => e.id)
    const { error } = await supabase.from('enquiries').delete().in('id', ids)

    setEnquiryDeletingAll(false)

    if (error) {
      setEnquiryDeleteMessage(
        error.message.includes('policy') || error.code === '42501'
          ? 'Delete blocked by database policy. Run supabase/run-in-sql-editor-enquiries-delete-admin.sql (or apply the latest migration) in Supabase.'
          : error.message
      )
      return
    }

    setEnquiries([])
  }

  if (isLoading || !session || profile?.role !== 'admin') {
    return <DashboardLoadingShell label="Loading admin dashboard…" />
  }

  return (
    <DashboardLayout
      kicker="Operations"
      subtitle="Enquiries, client-saved package builds from the live calculator, and CRM proposal rows — all in Supabase."
      title="Admin dashboard"
      variant="admin"
    >
      {loadError ? (
        <div className="mb-8 rounded-3xl border border-red-200/80 bg-red-50/90 px-6 py-4 text-sm text-red-800 shadow-soft">
          {loadError}
        </div>
      ) : null}

      {listLoading ? (
        <p className="text-sm font-medium text-forest-600">Loading data…</p>
      ) : (
        <div className="space-y-14 md:space-y-16">
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Enquiries</p>
                <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Recent form submissions</h2>
                <p className="mt-2 max-w-2xl text-sm text-forest-600">
                  Rows appear after the SQL migration and when the dev server has{' '}
                  <code className="rounded-md bg-forest-900 px-1.5 py-0.5 text-xs text-white">SUPABASE_SERVICE_ROLE_KEY</code>{' '}
                  set for <code className="rounded-md bg-forest-900 px-1.5 py-0.5 text-xs text-white">/api/enquiry</code>.
                  Each submitter also gets a confirmation email with their enquiry PDF at the address they entered (Resend, same
                  run as your internal notification).
                </p>
              </div>
              {enquiries.length > 0 ? (
                <div className="flex shrink-0 flex-col gap-2 self-start sm:flex-row sm:items-center">
                  <LuxuryButton
                    className="!px-5 !py-2.5 !text-xs"
                    onClick={() => setEnquiriesSectionVisible((v) => !v)}
                    type="button"
                    variant="outline"
                  >
                    {enquiriesSectionVisible ? 'Hide table' : 'Show table'}
                  </LuxuryButton>
                  <LuxuryButton
                    className="!border-red-300 !px-5 !py-2.5 !text-xs !text-red-800 hover:!bg-red-50"
                    disabled={enquiryDeletingAll || enquiryDeletingId !== null}
                    onClick={() => void handleRemoveAllEnquiries()}
                    type="button"
                    variant="outline"
                  >
                    {enquiryDeletingAll ? 'Removing…' : 'Remove all enquiries'}
                  </LuxuryButton>
                </div>
              ) : null}
            </div>

            {enquiryDeleteMessage ? (
              <div
                className="mt-4 rounded-2xl border border-red-200/90 bg-red-50/90 px-4 py-3 text-sm text-red-900"
                role="alert"
              >
                {enquiryDeleteMessage}
              </div>
            ) : null}

            {!enquiriesSectionVisible ? (
              <div className="mt-6 rounded-[2rem] border border-forest-200 bg-offwhite px-6 py-8 text-center text-sm text-forest-900 md:px-10">
                <p>Recent form submissions are hidden. Use <span className="font-medium text-forest-900">Show table</span> to view them again.</p>
              </div>
            ) : enquiries.length === 0 ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-forest-200 bg-offwhite px-6 py-10 text-center text-sm text-forest-900 md:px-10">
                No enquiries yet — submit the get-in-touch form locally to test the pipeline.
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-forest-950 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Ref</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Name</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Email</th>
                      <th className="hidden px-4 py-4 md:table-cell md:px-6 lg:table-cell">Interest</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">When</th>
                      <th className="whitespace-nowrap px-4 py-4 text-right md:px-6">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100">
                    {enquiries.map((row, index) => (
                      <tr
                        className={cx('text-forest-900', index % 2 === 1 ? 'bg-offwhite/90' : 'bg-white')}
                        key={row.id}
                      >
                        <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-forest-700 md:px-6">
                          {row.reference_id}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-medium md:px-6">{row.full_name}</td>
                        <td className="px-4 py-4 md:px-6">
                          <a
                            className="font-medium text-fairway-700 underline-offset-2 transition-colors hover:text-fairway-800 hover:underline"
                            href={`mailto:${row.email}`}
                          >
                            {row.email}
                          </a>
                        </td>
                        <td className="hidden max-w-xs truncate px-4 py-4 text-forest-600 md:table-cell md:px-6 lg:table-cell">
                          {row.interest ?? '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs text-forest-500 md:px-6">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right md:px-6">
                          <button
                            aria-label={`Remove enquiry ${row.reference_id}`}
                            className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-800 transition-colors hover:bg-red-50 disabled:opacity-50"
                            disabled={enquiryDeletingId !== null || enquiryDeletingAll}
                            onClick={() => void handleRemoveEnquiry(row)}
                            type="button"
                          >
                            {enquiryDeletingId === row.id ? 'Removing…' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">CRM — client PDFs</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Terms and thank-you documents</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              Send branded terms or the thank-you page to a client&apos;s login email. They only see these links on their
              dashboard after you send. Requires table{' '}
              <code className="rounded-md bg-forest-900 px-1.5 py-0.5 text-xs text-white">client_document_access</code>{' '}
              — run <code className="rounded-md bg-forest-900 px-1.5 py-0.5 text-xs text-white">supabase/run-in-sql-editor-client-document-access.sql</code> if needed.
            </p>

            <div className="mt-6 rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gold-600" htmlFor="crm-doc-email">
                Client account email
              </label>
              <input
                autoComplete="email"
                className="mb-6 w-full max-w-md rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                id="crm-doc-email"
                onChange={(e) => {
                  setCrmDocEmail(e.target.value)
                  setCrmDocMessage(null)
                }}
                placeholder="client@example.com"
                type="email"
                value={crmDocEmail}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  aria-label="Send terms and conditions to client email"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
                  disabled={crmDocSending !== 'idle'}
                  onClick={() => handleSendCrmDocument('terms')}
                  type="button"
                >
                  {crmDocSending === 'terms' ? 'Sending…' : 'Email terms PDF access'}
                </button>
                <button
                  aria-label="Send thank you document to client email"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[#dc5801] bg-white px-6 py-3 text-sm font-semibold text-[#b34701] transition-colors hover:bg-[#dc5801]/10 disabled:opacity-60"
                  disabled={crmDocSending !== 'idle'}
                  onClick={() => handleSendCrmDocument('welcome')}
                  type="button"
                >
                  {crmDocSending === 'welcome' ? 'Sending…' : 'Email thank-you PDF access'}
                </button>
              </div>

              {crmDocMessage ? (
                <p className="mt-4 text-sm font-medium text-forest-800" role="status">
                  {crmDocMessage}
                </p>
              ) : null}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Client package builds</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Calculator saves</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              Customers save builds from the packages page (or homepage flow). Use this to see who priced what before they
              enquire.
            </p>

            {buildsLoadError ? (
              <div className="mt-6 rounded-3xl border border-amber-200/90 bg-amber-50/90 px-6 py-4 text-sm text-amber-950 shadow-soft">
                <p className="font-medium">Package builds could not be loaded.</p>
                <p className="mt-2 text-amber-900/85">{buildsLoadError}</p>
                <p className="mt-2 text-xs text-amber-900/70">
                  If the error mentions <code className="rounded bg-white/80 px-1">client_details</code>, run{' '}
                  <code className="rounded bg-white/80 px-1">supabase/run-in-sql-editor-add-client-details.sql</code> in Supabase
                  SQL. Otherwise check the <code className="rounded bg-white/80 px-1">package_builds</code> migration and the{' '}
                  <code className="rounded bg-white/80 px-1">profiles</code> join if PostgREST reports ambiguity.
                </p>
              </div>
            ) : packageBuilds.length === 0 ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-forest-200 bg-offwhite px-6 py-10 text-center text-sm text-forest-900 md:px-10">
                No client-saved package builds yet.
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-forest-950 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">When</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Customer</th>
                      <th className="px-4 py-4 md:px-6">Build</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Source</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Trip form</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Group total</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100">
                    {packageBuilds.map((row, index) => {
                      const prof = profileFromRow(row)
                      const parsed = parsePackageBuildConfig(row.config)
                      const total = parsed?.totals.estimatedGroupTotal

                      return (
                        <tr
                          className={cx('text-forest-900', index % 2 === 1 ? 'bg-offwhite/90' : 'bg-white')}
                          key={row.id}
                        >
                          <td className="whitespace-nowrap px-4 py-4 text-xs text-forest-500 md:px-6">
                            {new Date(row.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 md:px-6">
                            <p className="font-medium text-forest-900">{prof?.full_name?.trim() || '—'}</p>
                            {prof?.email ? (
                              <a
                                className="text-xs font-medium text-fairway-700 underline-offset-2 hover:underline"
                                href={`mailto:${prof.email}`}
                              >
                                {prof.email}
                              </a>
                            ) : (
                              <p className="mt-1 font-mono text-[11px] text-forest-400">{row.owner_id.slice(0, 8)}…</p>
                            )}
                          </td>
                          <td className="max-w-xs px-4 py-4 md:max-w-md md:px-6">
                            <p className="font-medium text-forest-900">{row.label ?? 'Package build'}</p>
                            {parsed ? (
                              <p className="mt-1 text-xs text-forest-600">
                                {parsed.packageStyle} · {parsed.groupSize} pax · {parsed.nights}n / {parsed.rounds} rounds
                              </p>
                            ) : null}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-xs capitalize text-forest-600 md:px-6">
                            {row.source === 'landing' ? 'Homepage' : 'Packages'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-forest-700 md:px-6">
                            {hasMeaningfulTripDetails(row.client_details) ? 'Yes' : '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 font-medium text-forest-900 md:px-6">
                            {typeof total === 'number' ? formatEur(total) : '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 md:px-6">
                            <LuxuryButton
                              className="!px-5 !py-2.5 !text-xs"
                              onClick={() => setDetailBuildId(row.id)}
                              type="button"
                              variant="white"
                            >
                              View
                            </LuxuryButton>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Proposals</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">CRM records</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              Populated when you insert rows (or automate later). Owners see their own rows on the client dashboard.
            </p>

            {proposals.length === 0 ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-forest-200 bg-offwhite px-6 py-10 text-center text-sm text-forest-900 md:px-10">
                No proposal rows in the database yet.
              </div>
            ) : (
              <ul className="mt-6 overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                {proposals.map((row, index) => (
                  <li
                    className={cx(
                      'flex flex-col gap-3 border-b border-forest-100/80 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between md:px-7',
                      index % 2 === 1 ? 'bg-offwhite/90' : 'bg-white'
                    )}
                    key={row.id}
                  >
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold text-forest-950">
                        {row.title?.trim() || row.proposal_id}
                      </p>
                      <p className="mt-1 font-mono text-xs text-forest-500">{row.proposal_id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={cx(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-black/5',
                          proposalStatusStyles[row.status] ?? 'bg-forest-800 text-white'
                        )}
                      >
                        {row.status}
                      </span>
                      <span className="text-xs font-medium text-forest-400">
                        {new Date(row.created_at).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {detailRow ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center sm:p-6">
          <button
            aria-label="Close build details"
            className="absolute inset-0 bg-forest-950/55 backdrop-blur-[2px]"
            onClick={handleCloseBuildDetail}
            type="button"
          />
          <div
            aria-labelledby="admin-build-detail-title"
            aria-modal="true"
            className="relative z-10 flex max-h-[min(90vh,920px)] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="border-b border-forest-100 bg-offwhite px-6 py-5 md:px-8">
              <h2 className="font-display text-xl font-semibold text-forest-950 md:text-2xl" id="admin-build-detail-title">
                Client build and trip form
              </h2>
              <p className="mt-1 text-sm text-forest-600">
                {detailRow.label?.trim() || 'Package build'} · saved{' '}
                {new Date(detailRow.created_at).toLocaleString()}
              </p>
              {(() => {
                const prof = profileFromRow(detailRow)
                return prof?.email || prof?.full_name ? (
                  <p className="mt-2 text-sm font-medium text-forest-800">
                    {prof.full_name?.trim() ? <span>{prof.full_name.trim()}</span> : null}
                    {prof.full_name?.trim() && prof.email ? <span className="text-forest-400"> · </span> : null}
                    {prof.email ? (
                      <a className="text-fairway-700 underline-offset-2 hover:underline" href={`mailto:${prof.email}`}>
                        {prof.email}
                      </a>
                    ) : null}
                  </p>
                ) : (
                  <p className="mt-2 font-mono text-xs text-forest-500">Owner {detailRow.owner_id}</p>
                )
              })()}
            </div>

            <form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={handleAdminSaveBuildDetails}>
              <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
                {detailParsed ? (
                  <div className="mb-8 rounded-2xl border border-forest-100 bg-white px-4 py-4 text-sm text-forest-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Calculator config (reference)</p>
                    <p className="mt-2 font-medium">
                      {detailParsed.packageStyle} · {detailParsed.groupSize} golfers · {detailParsed.nights} nights /{' '}
                      {detailParsed.rounds} rounds
                    </p>
                    <p className="mt-1 text-xs text-forest-600">
                      Stay: {detailParsed.stayName} · Transfer: {detailParsed.transferName}
                    </p>
                    <p className="mt-2 text-xs text-forest-600">
                      Source: {detailRow.source === 'landing' ? 'Homepage' : 'Packages page'}
                    </p>
                  </div>
                ) : null}

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Trip details (editable)</p>
                <p className="mt-1 text-sm text-forest-600">
                  Clients cannot edit calculator-sourced package, stay, group size, nights, rounds, or pricing on their dashboard
                  — update those here.{' '}
                  {hasMeaningfulTripDetails(serializeTripDetailsForDb(adminTripForm))
                    ? 'Extra client-entered fields are included below.'
                    : 'Most lines are still calculator defaults until the client adds trip notes.'}
                </p>

                <div className="mt-6 space-y-8">
                  {TRIP_DETAILS_SECTIONS.map((section) => (
                    <div className="space-y-4" key={section.title}>
                      <h3 className="border-b border-orange-200/90 pb-2 font-display text-base font-semibold text-forest-900">
                        {section.title}
                      </h3>
                      {section.title === 'Trip shape' ? (
                        <p className="text-sm text-forest-700">
                          Trip shape: {adminTripForm.nights.trim() || '0'} nights / {adminTripForm.rounds.trim() || '0'} rounds
                        </p>
                      ) : null}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {section.fields.map((field) => {
                          const id = `adm-td-${field.key}`
                          const isLong = TRIP_DETAILS_MULTILINE_KEYS.has(field.key)

                          return (
                            <div className={field.key === 'notesForGsol' ? 'sm:col-span-2' : ''} key={field.key}>
                              <label className={adminTripLabelClass} htmlFor={id}>
                                {field.label}
                              </label>
                              {isLong ? (
                                <textarea
                                  className={cx(adminTripInputClass, 'min-h-[100px] resize-y')}
                                  id={id}
                                  onChange={handleAdminTripFieldChange(field.key)}
                                  value={adminTripForm[field.key]}
                                />
                              ) : (
                                <input
                                  className={adminTripInputClass}
                                  id={id}
                                  onChange={handleAdminTripFieldChange(field.key)}
                                  value={adminTripForm[field.key]}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-forest-100 bg-white px-6 py-4 md:flex-row md:flex-wrap md:items-center md:px-8">
                <LuxuryButton disabled={adminSaveStatus === 'saving'} type="submit" variant="primary">
                  {adminSaveStatus === 'saving' ? 'Saving…' : 'Save trip details'}
                </LuxuryButton>
                <LuxuryButton onClick={handleCloseBuildDetail} type="button" variant="white">
                  Close
                </LuxuryButton>
                {adminSaveMessage ? (
                  <p
                    className={cx(
                      'text-sm font-medium',
                      adminSaveStatus === 'error' ? 'text-red-700' : 'text-fairway-800'
                    )}
                    role={adminSaveStatus === 'error' ? 'alert' : 'status'}
                  >
                    {adminSaveMessage}
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  )
}
