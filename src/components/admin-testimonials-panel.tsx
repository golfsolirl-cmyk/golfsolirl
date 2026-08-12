import { Clock, Eye, EyeOff, Home, Star, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuxuryButton } from './ui/button'
import { StarRow } from './home/tripadvisor-review-card'
import { formatDateTimeDdMmYy } from '../lib/date-format-ie'
import { getSupabaseBrowserClient } from '../lib/supabase-client'

export type WebsiteTestimonialAdminRow = {
  id: string
  author_name: string
  email: string
  phone: string
  trip_type: string
  travel_month: string | null
  quote_text: string
  rating: number
  source_page: string
  published_at: string | null
  hidden_at: string | null
  created_at: string
}

type RowStatus = 'pending' | 'live' | 'hidden'

type AdminTestimonialsPanelProps = {
  readonly sessionToken: string | null
}

export function AdminTestimonialsPanel({ sessionToken }: AdminTestimonialsPanelProps) {
  const [rows, setRows] = useState<WebsiteTestimonialAdminRow[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const sb = getSupabaseBrowserClient()
    if (!sb || !sessionToken) {
      setLoading(false)
      return
    }
    setLoading(true)
    setMessage(null)
    const { data, error } = await sb
      .from('website_testimonials')
      .select(
        'id, author_name, email, phone, trip_type, travel_month, quote_text, rating, source_page, published_at, hidden_at, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(80)
    if (error) {
      setMessage(error.message)
      setRows([])
    } else {
      setRows((data ?? []) as WebsiteTestimonialAdminRow[])
    }
    setLoading(false)
  }, [sessionToken])

  useEffect(() => {
    void load()
  }, [load])

  const rowStatus = (row: WebsiteTestimonialAdminRow): RowStatus => {
    if (!row.published_at) return 'pending'
    if (row.hidden_at) return 'hidden'
    return 'live'
  }

  const pendingRows = useMemo(() => rows.filter((r) => !r.published_at), [rows])
  const liveRows = useMemo(() => rows.filter((r) => r.published_at && !r.hidden_at), [rows])
  const hiddenRows = useMemo(() => rows.filter((r) => r.published_at && r.hidden_at), [rows])

  const publish = async (id: string) => {
    const sb = getSupabaseBrowserClient()
    if (!sb) return
    setBusyId(id)
    setMessage(null)
    const { error } = await sb
      .from('website_testimonials')
      .update({ published_at: new Date().toISOString(), hidden_at: null })
      .eq('id', id)
    setBusyId(null)
    if (error) {
      setMessage(error.message)
      return
    }
    await load()
  }

  const setHidden = async (id: string, hide: boolean) => {
    const sb = getSupabaseBrowserClient()
    if (!sb) return
    setBusyId(id)
    setMessage(null)
    const { error } = await sb
      .from('website_testimonials')
      .update({ hidden_at: hide ? new Date().toISOString() : null })
      .eq('id', id)
    setBusyId(null)
    if (error) {
      setMessage(error.message)
      return
    }
    await load()
  }

  const remove = async (id: string, authorName: string) => {
    if (!window.confirm(`Delete ${authorName}’s review permanently? This cannot be undone.`)) {
      return
    }
    const sb = getSupabaseBrowserClient()
    if (!sb) return
    setBusyId(id)
    setMessage(null)
    const { error } = await sb.from('website_testimonials').delete().eq('id', id)
    setBusyId(null)
    if (error) {
      setMessage(error.message)
      return
    }
    await load()
  }

  const statusBadge = (status: RowStatus) => {
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-amber-950">
          <Clock className="h-3 w-3" aria-hidden />
          Needs approval
        </span>
      )
    }
    if (status === 'live') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-fairway-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-fairway-900">
          <Home className="h-3 w-3" aria-hidden />
          On homepage
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-forest-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-forest-700">
        <EyeOff className="h-3 w-3" aria-hidden />
        Hidden
      </span>
    )
  }

  const renderRow = (row: WebsiteTestimonialAdminRow) => {
    const status = rowStatus(row)
    const busy = busyId === row.id

    return (
      <li
        key={row.id}
        className="rounded-[1.35rem] border border-forest-100/90 bg-white p-5 shadow-sm ring-1 ring-forest-900/[0.03]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg font-semibold text-forest-950">{row.author_name}</p>
              {statusBadge(status)}
            </div>
            <div className="mt-2">
              <StarRow count={row.rating} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-forest-800">“{row.quote_text}”</p>
            <p className="mt-3 text-xs text-forest-600">
              {row.trip_type}
              {row.travel_month ? ` · ${row.travel_month}` : ''}
            </p>
            <p className="mt-2 text-xs text-ge-gray500">
              Sent {formatDateTimeDdMmYy(row.created_at)}
              {row.published_at ? ` · Approved ${formatDateTimeDdMmYy(row.published_at)}` : ''}
            </p>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-semibold text-forest-700">Guest contact</summary>
              <p className="mt-2 font-mono text-xs text-forest-600">
                {row.email}
                {row.phone ? ` · ${row.phone}` : ''}
              </p>
            </details>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            {status === 'pending' ? (
              <LuxuryButton
                className="!text-xs"
                disabled={busy}
                onClick={() => void publish(row.id)}
                type="button"
                variant="primary"
              >
                {busy ? 'Saving…' : 'Approve → homepage'}
              </LuxuryButton>
            ) : null}
            {status === 'live' ? (
              <LuxuryButton
                className="!text-xs"
                disabled={busy}
                onClick={() => void setHidden(row.id, true)}
                type="button"
                variant="outline"
              >
                {busy ? 'Saving…' : 'Hide from site'}
              </LuxuryButton>
            ) : null}
            {status === 'hidden' ? (
              <LuxuryButton
                className="!text-xs"
                disabled={busy}
                onClick={() => void setHidden(row.id, false)}
                type="button"
                variant="outline"
              >
                {busy ? 'Saving…' : 'Show on homepage'}
              </LuxuryButton>
            ) : null}
            <LuxuryButton
              className="!text-xs text-red-800"
              disabled={busy}
              onClick={() => void remove(row.id, row.author_name)}
              type="button"
              variant="outline"
            >
              <Trash2 className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              {busy ? 'Deleting…' : 'Delete'}
            </LuxuryButton>
          </div>
        </div>
      </li>
    )
  }

  return (
    <section id="admin-hub-testimonials" className="scroll-mt-28 space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-forest-100 bg-offwhite/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-center min-w-[5.5rem]">
            <p className="font-display text-xl font-bold text-amber-950">{pendingRows.length}</p>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-forest-600">Waiting</p>
          </div>
          <div className="rounded-xl border border-fairway-200 bg-white px-3.5 py-2.5 text-center min-w-[5.5rem]">
            <p className="font-display text-xl font-bold text-fairway-900">{liveRows.length}</p>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-forest-600">On homepage</p>
          </div>
          <div className="rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-center min-w-[5.5rem]">
            <p className="font-display text-xl font-bold text-forest-800">{hiddenRows.length}</p>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-forest-600">Hidden</p>
          </div>
        </div>
        <a
          className="inline-flex items-center gap-2 text-sm font-semibold text-fairway-800 underline underline-offset-2"
          href="/#tripadvisor-reviews"
          rel="noreferrer"
          target="_blank"
        >
          <Star className="h-4 w-4" aria-hidden />
          Preview homepage reviews
        </a>
      </div>

      {message ? (
        <p className="rounded-xl border border-brand-700/40 bg-orange-50 px-4 py-3 text-sm text-forest-900">{message}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-forest-600">Loading reviews…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-forest-200 bg-offwhite px-5 py-10 text-center">
          <p className="font-display text-lg font-semibold text-forest-950">No reviews yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-forest-600">
            When a guest submits a review on the website, it appears here for you to approve.
          </p>
        </div>
      ) : (
        <>
          {pendingRows.length > 0 ? (
            <div>
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-forest-950">
                <Clock className="h-5 w-5 text-amber-700" aria-hidden />
                Waiting for approval ({pendingRows.length})
              </h3>
              <p className="mt-1 text-sm text-forest-600">These are not on the homepage yet.</p>
              <ul className="mt-4 space-y-4">{pendingRows.map(renderRow)}</ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-fairway-200 bg-fairway-50/40 px-4 py-4 text-sm text-forest-700">
              Nothing waiting — you’re up to date on new reviews.
            </div>
          )}
          {liveRows.length > 0 ? (
            <div>
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-forest-950">
                <Eye className="h-5 w-5 text-fairway-800" aria-hidden />
                On the homepage ({liveRows.length})
              </h3>
              <ul className="mt-4 space-y-4">{liveRows.map(renderRow)}</ul>
            </div>
          ) : null}
          {hiddenRows.length > 0 ? (
            <div>
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-forest-950">
                <EyeOff className="h-5 w-5 text-forest-600" aria-hidden />
                Hidden ({hiddenRows.length})
              </h3>
              <p className="mt-1 text-sm text-forest-600">Approved before, but taken off the public site.</p>
              <ul className="mt-4 space-y-4">{hiddenRows.map(renderRow)}</ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
