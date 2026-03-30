import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { DashboardLayout, DashboardLoadingShell } from '../components/dashboard-layout'
import { LuxuryButton } from '../components/ui/button'
import {
  emptyTripDetailsForm,
  mergeTripDetailsWithSaved,
  packagesPagePathFromConfig,
  parsePackageBuildConfig,
  serializeTripDetailsForDb,
  tripDetailsFromConfig,
  type PackageTripDetailsForm
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
  'w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 placeholder:text-forest-400 outline-none ring-gold-400/30 focus:border-fairway-500 focus:ring-2'

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-gold-600'

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
    const [propRes, buildRes] = await Promise.all([
      supabase.from('proposals').select('id, proposal_id, title, status, created_at').order('created_at', { ascending: false }),
      fetchPackageBuildsClientList(supabase, 40)
    ])

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

  const handleTripFieldChange = (field: keyof PackageTripDetailsForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleRemoveBuild = async (id: string) => {
    if (!window.confirm('Remove this saved package from your account? This cannot be undone.')) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    setDeletingId(id)
    const { error } = await supabase.from('package_builds').delete().eq('id', id)
    setDeletingId(null)

    if (error) {
      window.alert(error.message)
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
                            className="border-red-200/80 text-red-800 hover:bg-red-50"
                            disabled={deletingId === row.id}
                            onClick={() => handleRemoveBuild(row.id)}
                            type="button"
                            variant="outline"
                          >
                            {deletingId === row.id ? 'Removing…' : 'Remove'}
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
                    Matches the fields used on the printable proposal. Values start from your calculator; edit and save anytime.
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
                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className={labelClass} htmlFor="td-package">
                              Package style
                            </label>
                            <input className={inputClass} id="td-package" onChange={handleTripFieldChange('packageName')} value={tripForm.packageName} />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="td-stay">
                              Stay level
                            </label>
                            <input className={inputClass} id="td-stay" onChange={handleTripFieldChange('stayName')} value={tripForm.stayName} />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass} htmlFor="td-transfer">
                              Transfer style
                            </label>
                            <input className={inputClass} id="td-transfer" onChange={handleTripFieldChange('transferName')} value={tripForm.transferName} />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="td-group">
                              Group size
                            </label>
                            <input className={inputClass} id="td-group" inputMode="numeric" onChange={handleTripFieldChange('groupSize')} value={tripForm.groupSize} />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="td-nights">
                              Nights
                            </label>
                            <input className={inputClass} id="td-nights" inputMode="numeric" onChange={handleTripFieldChange('nights')} value={tripForm.nights} />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="td-rounds">
                              Rounds
                            </label>
                            <input className={inputClass} id="td-rounds" inputMode="numeric" onChange={handleTripFieldChange('rounds')} value={tripForm.rounds} />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="td-pp">
                              Est. per person
                            </label>
                            <input className={inputClass} id="td-pp" onChange={handleTripFieldChange('perPersonPrice')} value={tripForm.perPersonPrice} />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="td-total">
                              Est. group total
                            </label>
                            <input className={inputClass} id="td-total" onChange={handleTripFieldChange('groupTotal')} value={tripForm.groupTotal} />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="td-dep">
                              Deposit
                            </label>
                            <input className={inputClass} id="td-dep" onChange={handleTripFieldChange('depositAmount')} value={tripForm.depositAmount} />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="td-rem">
                              Remaining balance
                            </label>
                            <input className={inputClass} id="td-rem" onChange={handleTripFieldChange('remainingBalance')} value={tripForm.remainingBalance} />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="td-lead">
                              Lead guest name
                            </label>
                            <input
                              autoComplete="name"
                              className={inputClass}
                              id="td-lead"
                              onChange={handleTripFieldChange('leadGuestName')}
                              value={tripForm.leadGuestName}
                            />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="td-phone">
                              Phone / WhatsApp
                            </label>
                            <input
                              autoComplete="tel"
                              className={inputClass}
                              id="td-phone"
                              onChange={handleTripFieldChange('contactPhone')}
                              value={tripForm.contactPhone}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass} htmlFor="td-dates">
                              Preferred travel dates
                            </label>
                            <input className={inputClass} id="td-dates" onChange={handleTripFieldChange('preferredTravelDates')} value={tripForm.preferredTravelDates} />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass} htmlFor="td-notes">
                              Notes for Golf Sol Ireland
                            </label>
                            <textarea className={cx(inputClass, 'min-h-[120px] resize-y')} id="td-notes" onChange={handleTripFieldChange('notesForGsol')} value={tripForm.notesForGsol} />
                          </div>
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

                        <LuxuryButton disabled={detailsStatus === 'saving'} type="submit" variant="primary">
                          {detailsStatus === 'saving' ? 'Saving…' : 'Save trip details'}
                        </LuxuryButton>
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
              </div>
            </div>

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
                    When we issue a proposal for your group, it will appear here. Your own saved calculator builds stay in
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
