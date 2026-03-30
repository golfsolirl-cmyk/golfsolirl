import { useEffect, useState } from 'react'
import { DashboardLayout, DashboardLoadingShell } from '../components/dashboard-layout'
import { hasMeaningfulTripDetails, parsePackageBuildConfig } from '../lib/package-build'
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
  draft: 'bg-forest-100 text-forest-800',
  sent: 'bg-fairway-100 text-fairway-800',
  accepted: 'bg-gold-50 text-gold-700',
  archived: 'bg-forest-50 text-forest-600'
}

export function AdminDashboardPage() {
  const { session, profile, isLoading } = useAuth()
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([])
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [packageBuilds, setPackageBuilds] = useState<PackageBuildAdminRow[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [buildsLoadError, setBuildsLoadError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)

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
        supabase
          .from('package_builds')
          .select('id, owner_id, label, source, config, client_details, created_at, profiles(email, full_name)')
          .order('created_at', { ascending: false })
          .limit(100)
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
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Enquiries</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Recent form submissions</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              Rows appear after the SQL migration and when the dev server has{' '}
              <code className="rounded-md bg-forest-100 px-1.5 py-0.5 text-xs text-forest-800">SUPABASE_SERVICE_ROLE_KEY</code>{' '}
              set for <code className="rounded-md bg-forest-100 px-1.5 py-0.5 text-xs text-forest-800">/api/enquiry</code>.
            </p>

            {enquiries.length === 0 ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-forest-200 bg-forest-50/50 px-6 py-10 text-center text-sm text-forest-600 md:px-10">
                No enquiries yet — submit the get-in-touch form locally to test the pipeline.
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-forest-950 text-xs font-semibold uppercase tracking-[0.12em] text-gold-200">
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Ref</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Name</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Email</th>
                      <th className="hidden px-4 py-4 md:table-cell md:px-6 lg:table-cell">Interest</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100">
                    {enquiries.map((row, index) => (
                      <tr
                        className={cx('text-forest-800', index % 2 === 1 ? 'bg-forest-50/35' : 'bg-white')}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                  Run the <code className="rounded bg-white/80 px-1">package_builds</code> migration, or fix the{' '}
                  <code className="rounded bg-white/80 px-1">profiles</code> relationship in the select if PostgREST reports
                  ambiguity.
                </p>
              </div>
            ) : packageBuilds.length === 0 ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-forest-200 bg-forest-50/50 px-6 py-10 text-center text-sm text-forest-600 md:px-10">
                No client-saved package builds yet.
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-forest-950 text-xs font-semibold uppercase tracking-[0.12em] text-gold-200">
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">When</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Customer</th>
                      <th className="px-4 py-4 md:px-6">Build</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Source</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Trip form</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Group total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100">
                    {packageBuilds.map((row, index) => {
                      const prof = profileFromRow(row)
                      const parsed = parsePackageBuildConfig(row.config)
                      const total = parsed?.totals.estimatedGroupTotal

                      return (
                        <tr
                          className={cx('text-forest-800', index % 2 === 1 ? 'bg-forest-50/35' : 'bg-white')}
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
              <div className="mt-6 rounded-[2rem] border border-dashed border-forest-200 bg-forest-50/50 px-6 py-10 text-center text-sm text-forest-600 md:px-10">
                No proposal rows in the database yet.
              </div>
            ) : (
              <ul className="mt-6 overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                {proposals.map((row, index) => (
                  <li
                    className={cx(
                      'flex flex-col gap-3 border-b border-forest-100/80 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between md:px-7',
                      index % 2 === 1 ? 'bg-forest-50/40' : 'bg-white'
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
                          proposalStatusStyles[row.status] ?? 'bg-forest-50 text-forest-700'
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
    </DashboardLayout>
  )
}
