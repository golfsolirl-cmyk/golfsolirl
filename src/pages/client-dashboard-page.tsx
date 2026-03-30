import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { DashboardLayout, DashboardLoadingShell } from '../components/dashboard-layout'
import { LuxuryButton } from '../components/ui/button'
import {
  emptyTripDetailsForm,
  isCalculatorLockedTripField,
  mergeTripDetailsWithSaved,
  packagesPagePathFromConfig,
  parsePackageBuildConfig,
  serializeTripDetailsForDb,
  TRIP_DETAILS_MULTILINE_KEYS,
  TRIP_DETAILS_SECTIONS,
  tripDetailsFromConfig,
  type PackageTripDetailsForm,
  type TripDetailsFieldKey
} from '../lib/package-build'
import { fetchPackageBuildsClientList, isMissingClientDetailsColumnError } from '../lib/fetch-package-builds'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { useAuth } from '../providers/auth-provider'
import { cx } from '../lib/utils'

interface ProposalRow {
  id: string
  proposal_id: string
  title: string | null
  status: string
  created_at: string
  payload: unknown | null
}

interface PackageBuildRow {
  id: string
  label: string | null
  source: string
  config: unknown
  client_details: unknown
  created_at: string
}

const statusStyles: Record<string, string> = {
  draft: 'bg-forest-100 text-forest-800 ring-1 ring-forest-200/80',
  sent: 'bg-fairway-50 text-fairway-800 ring-1 ring-fairway-200/80',
  accepted: 'bg-gold-50 text-gold-700 ring-1 ring-gold-200/80',
  archived: 'bg-forest-50 text-forest-600 ring-1 ring-forest-100'
}

const formatEur = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)

const inputClass =
  'w-full rounded-2xl border-2 border-orange-400 bg-white px-4 py-3 text-sm text-forest-900 placeholder:text-forest-400 outline-none transition-[border-color,box-shadow] focus:border-orange-500 focus:ring-2 focus:ring-orange-300/70'

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-gold-600'

const readOnlyCalcClass =
  'w-full rounded-2xl border-2 border-forest-200/90 bg-forest-50/70 px-4 py-3 text-sm text-forest-800'

const readOnlyCalcHintClass = 'mt-1 text-xs text-forest-500'

export function ClientDashboardPage() {
  const { session, isLoading } = useAuth()
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [packageBuilds, setPackageBuilds] = useState<PackageBuildRow[]>([])
  const [proposalsError, setProposalsError] = useState<string | null>(null)
  const [buildsError, setBuildsError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [selectedBuildId, setSelectedBuildId] = useState('')
  const [tripForm, setTripForm] = useState<PackageTripDetailsForm>(() => emptyTripDetailsForm())
  const [detailsStatus, setDetailsStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [detailsMessage, setDetailsMessage] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [proposalPdfLoadingId, setProposalPdfLoadingId] = useState<string | null>(null)
  const [documentAccess, setDocumentAccess] = useState<{ terms: boolean; welcome: boolean }>({
    terms: false,
    welcome: false
  })

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
    const [propRes, buildRes, docRes] = await Promise.all([
      supabase.from('proposals').select('id, proposal_id, title, status, created_at, payload').order('created_at', { ascending: false }),
      fetchPackageBuildsClientList(supabase, 40),
      supabase.from('client_document_access').select('document_kind').eq('owner_id', session.user.id)
    ])

    if (docRes.error) {
      setDocumentAccess({ terms: false, welcome: false })
    } else {
      const kinds = new Set((docRes.data ?? []).map((r) => r.document_kind))
      setDocumentAccess({ terms: kinds.has('terms'), welcome: kinds.has('welcome') })
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
      setPackageBuilds((buildRes.data ?? []) as PackageBuildRow[])
    }

    setListLoading(false)
  }, [session?.user])

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
    if (!selectedBuildId) {
      setTripForm(emptyTripDetailsForm())
      return
    }

    const row = packageBuilds.find((b) => b.id === selectedBuildId)
    if (!row) {
      return
    }

    const parsed = parsePackageBuildConfig(row.config)
    const defaults = parsed ? tripDetailsFromConfig(parsed) : emptyTripDetailsForm()
    setTripForm(mergeTripDetailsWithSaved(row.client_details, defaults))
  }, [selectedBuildId, packageBuilds])

  useEffect(() => {
    if (selectedBuildId && !packageBuilds.some((b) => b.id === selectedBuildId)) {
      setSelectedBuildId('')
      setDetailsStatus('idle')
      setDetailsMessage(null)
    }
  }, [packageBuilds, selectedBuildId])

  const handleTripFieldChange = (field: TripDetailsFieldKey) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTripForm((prev) => ({ ...prev, [field]: event.target.value }))
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

  const handleRemoveBuild = async (id: string) => {
    if (!window.confirm('Remove this saved package from your account? This cannot be undone.')) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    setRemoveError(null)
    setDeletingId(id)
    const { error } = await supabase.from('package_builds').delete().eq('id', id)
    setDeletingId(null)

    if (error) {
      const msg = error.message
      const hint =
        /permission|policy|rls|42501/i.test(msg) || msg.toLowerCase().includes('row-level security')
          ? ' Ask your admin to run supabase/run-in-sql-editor-add-client-details.sql (delete policy) in Supabase SQL.'
          : ''
      setRemoveError(`${msg}${hint}`)
      return
    }

    if (selectedBuildId === id) {
      setSelectedBuildId('')
    }

    await loadData()
  }

  if (isLoading || !session) {
    return <DashboardLoadingShell label="Loading your dashboard…" />
  }

  return (
    <DashboardLayout
      kicker="Your trip hub"
      subtitle="Saved package builds from the calculator and formal proposals from Golf Sol Ireland — all in one place."
      title="Your dashboard"
      variant="client"
    >
      {listLoading ? (
        <p className="text-sm font-medium text-forest-600">Loading your account…</p>
      ) : (
        <div className="space-y-14 md:space-y-16">
          <section>
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Package builds</p>
                <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">Your saved calculator trips</h2>
                <p className="mt-2 max-w-2xl text-sm text-forest-600">
                  Remove builds you don&apos;t need. Use the dropdown to pick a trip and fill in proposal-style details —
                  we save everything you enter to your account.
                </p>
              </div>
              <LuxuryButton href="/packages" variant="outline">
                New package build
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
              <div className="rounded-[2rem] border border-dashed border-forest-200 bg-forest-50/50 px-6 py-10 text-center text-sm text-forest-600 md:px-10">
                No saved builds yet — use the live calculator on the packages page and choose &quot;Save to my account&quot;.
              </div>
            ) : (
              <>
                {removeError ? (
                  <div
                    className="mb-6 rounded-2xl border-2 border-red-300 bg-red-50/95 px-5 py-4 text-sm text-red-900"
                    role="alert"
                  >
                    <p className="font-semibold">Could not remove package</p>
                    <p className="mt-1">{removeError}</p>
                  </div>
                ) : null}

                <ul className="mb-8 overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                  {packageBuilds.map((row, index) => {
                    const parsed = parsePackageBuildConfig(row.config)
                    const reopenHref = parsed ? packagesPagePathFromConfig(parsed) : '/packages'
                    const total = parsed?.totals.estimatedGroupTotal

                    return (
                      <li
                        className={cx(
                          'flex flex-col gap-4 border-b border-forest-100/80 px-5 py-5 last:border-b-0 lg:flex-row lg:items-center lg:justify-between md:px-7',
                          index % 2 === 1 ? 'bg-forest-50/40' : 'bg-white'
                        )}
                        key={row.id}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-lg font-semibold text-forest-950">
                            {row.label?.trim() || 'Package build'}
                          </p>
                          <p className="mt-1 text-xs text-forest-500">
                            {row.source === 'landing' ? 'From homepage calculator' : 'From packages page'} ·{' '}
                            {new Date(row.created_at).toLocaleString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {typeof total === 'number' ? (
                            <p className="mt-2 text-sm font-medium text-forest-700">Group estimate {formatEur(total)}</p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <LuxuryButton href={reopenHref} variant="primary">
                            Open in calculator
                          </LuxuryButton>
                          <LuxuryButton
                            aria-label={`Remove saved package ${row.label?.trim() || 'build'}`}
                            className="!border-2 !border-red-600 !bg-white !text-red-800 hover:!bg-red-50"
                            disabled={deletingId === row.id}
                            onClick={() => handleRemoveBuild(row.id)}
                            type="button"
                            variant="outline"
                          >
                            {deletingId === row.id ? 'Removing…' : 'Remove from account'}
                          </LuxuryButton>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Trip details</p>
                  <h3 className="font-display mt-2 text-xl font-semibold text-forest-950 md:text-2xl">
                    Proposal-style information (saved to your account)
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-forest-600">
                    Package, stay, group size, nights, rounds, and pricing come from your saved calculator — those are read-only
                    here. Everything else you can edit and save; Golf Sol Ireland can adjust calculator fields if needed.
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
                                  <span className="ml-2 font-normal text-forest-500">(from calculator — read-only)</span>
                                </p>
                              ) : null}
                              <div className="grid gap-5 md:grid-cols-2">
                                {section.fields.map((field) => {
                                  const id = `td-${field.key}`
                                  const isMultiline = TRIP_DETAILS_MULTILINE_KEYS.has(field.key)
                                  const locked = isCalculatorLockedTripField(field.key)
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
                                          <p className={readOnlyCalcHintClass}>From calculator — admin can change if required.</p>
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
                          <LuxuryButton
                            aria-label="Remove the selected saved package"
                            className="!border-2 !border-red-600 !bg-white !text-red-800 hover:!bg-red-50"
                            disabled={deletingId === selectedBuildId}
                            onClick={() => handleRemoveBuild(selectedBuildId)}
                            type="button"
                            variant="outline"
                          >
                            {deletingId === selectedBuildId ? 'Removing…' : 'Remove this package'}
                          </LuxuryButton>
                        </div>

                        {detailsMessage ? (
                          <p
                            className={cx(
                              'text-sm font-medium',
                              detailsStatus === 'error' ? 'text-red-700' : 'text-fairway-800'
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
              </>
            )}
          </section>

          <section>
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Proposals</p>
                <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">Documents from Golf Sol Ireland</h2>
                <p className="mt-2 max-w-2xl text-sm text-forest-600">
                  Formal proposals we send appear below with a PDF download. Terms and thank-you pages only show here after
                  Golf Sol Ireland enables them for your account.
                </p>
              </div>
            </div>

            {documentAccess.terms || documentAccess.welcome ? (
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
                    When we email you a proposal from our admin tools, it will show up here with a download button. If we send
                    you terms or our thank-you document, those links will appear above this box. Your calculator saves stay in
                    the section above.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                {proposals.map((row, index) => (
                  <li
                    className={cx(
                      'flex flex-col gap-3 border-b border-forest-100/80 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between md:px-7',
                      index % 2 === 1 ? 'bg-forest-50/40' : 'bg-white'
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
                          statusStyles[row.status] ?? 'bg-forest-50 text-forest-700 ring-1 ring-forest-100'
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
          </section>
        </div>
      )}
    </DashboardLayout>
  )
}
