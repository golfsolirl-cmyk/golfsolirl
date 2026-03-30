import { useEffect, useState } from 'react'
import { DashboardLayout, DashboardLoadingShell } from '../components/dashboard-layout'
import { LuxuryButton } from '../components/ui/button'
import { packagesPagePathFromConfig, parsePackageBuildConfig } from '../lib/package-build'
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

export function ClientDashboardPage() {
  const { session, isLoading } = useAuth()
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [packageBuilds, setPackageBuilds] = useState<PackageBuildRow[]>([])
  const [proposalsError, setProposalsError] = useState<string | null>(null)
  const [buildsError, setBuildsError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!session) {
      window.location.replace('/login')
      return
    }
  }, [isLoading, session])

  useEffect(() => {
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

    let cancelled = false

    const load = async () => {
      setListLoading(true)
      const [propRes, buildRes] = await Promise.all([
        supabase.from('proposals').select('id, proposal_id, title, status, created_at').order('created_at', { ascending: false }),
        supabase
          .from('package_builds')
          .select('id, label, source, config, created_at')
          .order('created_at', { ascending: false })
          .limit(40)
      ])

      if (cancelled) {
        return
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
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

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
                  Re-open any build on the packages page to tweak it, save another version, or share the printable proposal.
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
                  If this is a new feature, run the latest Supabase migration that creates the <code className="rounded bg-white/80 px-1">package_builds</code> table.
                </p>
              </div>
            ) : packageBuilds.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-forest-200 bg-forest-50/50 px-6 py-10 text-center text-sm text-forest-600 md:px-10">
                No saved builds yet — use the live calculator on the packages page and choose &quot;Save to my account&quot;.
              </div>
            ) : (
              <ul className="overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                {packageBuilds.map((row, index) => {
                  const parsed = parsePackageBuildConfig(row.config)
                  const reopenHref = parsed ? packagesPagePathFromConfig(parsed) : '/packages'
                  const total = parsed?.totals.estimatedGroupTotal

                  return (
                    <li
                      className={cx(
                        'flex flex-col gap-4 border-b border-forest-100/80 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between md:px-7',
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
                      <LuxuryButton href={reopenHref} variant="primary">
                        Open in calculator
                      </LuxuryButton>
                    </li>
                  )
                })}
              </ul>
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
