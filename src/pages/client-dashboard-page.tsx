import { useEffect, useState } from 'react'
import { DashboardLayout, DashboardLoadingShell } from '../components/dashboard-layout'
import { LuxuryButton } from '../components/ui/button'
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

const statusStyles: Record<string, string> = {
  draft: 'bg-forest-100 text-forest-800 ring-1 ring-forest-200/80',
  sent: 'bg-fairway-50 text-fairway-800 ring-1 ring-fairway-200/80',
  accepted: 'bg-gold-50 text-gold-700 ring-1 ring-gold-200/80',
  archived: 'bg-forest-50 text-forest-600 ring-1 ring-forest-100'
}

export function ClientDashboardPage() {
  const { session, profile, isLoading } = useAuth()
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!session) {
      window.location.replace('/login')
      return
    }

    if (profile?.role === 'admin') {
      window.location.replace('/dashboard/admin')
    }
  }, [isLoading, session, profile?.role])

  useEffect(() => {
    if (!session?.user || profile?.role === 'admin') {
      return
    }

    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      setListLoading(false)
      setListError('Supabase is not configured.')
      return
    }

    let cancelled = false

    const load = async () => {
      setListLoading(true)
      const { data, error } = await supabase
        .from('proposals')
        .select('id, proposal_id, title, status, created_at')
        .order('created_at', { ascending: false })

      if (cancelled) {
        return
      }

      if (error) {
        setListError(error.message)
        setProposals([])
      } else {
        setListError(null)
        setProposals((data ?? []) as ProposalRow[])
      }

      setListLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id, profile?.role])

  if (isLoading || !session) {
    return <DashboardLoadingShell label="Loading your dashboard…" />
  }

  return (
    <DashboardLayout
      kicker="Your trip hub"
      subtitle="Proposals linked to your account appear below. Packages, courses, and planning stay on the main site — same look, one brand."
      title="Your dashboard"
      variant="client"
    >
      {listLoading ? (
        <p className="text-sm font-medium text-forest-600">Loading your proposals…</p>
      ) : listError ? (
        <div className="rounded-3xl border border-red-200/80 bg-red-50/90 px-6 py-5 text-sm text-red-800 shadow-soft">
          {listError}
        </div>
      ) : proposals.length === 0 ? (
        <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-gold-400 via-fairway-500 to-forest-700" aria-hidden="true" />
          <div className="px-6 py-10 md:px-10 md:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Proposals</p>
            <h2 className="font-display mt-3 text-2xl font-semibold text-forest-950 md:text-3xl">Nothing here yet</h2>
            <p className="mt-4 max-w-lg text-forest-600">
              When we prepare a proposal for you, it will show up in this list so you can track it in one place.
            </p>
            <LuxuryButton className="mt-8" href="/packages" variant="primary">
              Browse packages
            </LuxuryButton>
          </div>
        </div>
      ) : (
        <section>
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Proposals</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">Your documents</h2>
            </div>
          </div>
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
        </section>
      )}
    </DashboardLayout>
  )
}
