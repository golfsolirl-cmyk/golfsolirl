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
    if (!window.confirm(`Delete the testimonial from ${authorName}? This cannot be undone.`)) {
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
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-700/15 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-brand-800">
          <Clock className="h-3 w-3" aria-hidden />
          Awaiting approval
        </span>
      )
    }
    if (status === 'live') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-fairway-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-fairway-900">
          <Home className="h-3 w-3" aria-hidden />
          Live on homepage
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
              {row.travel_month ? ` · ${row.travel_month}` : ''} · {row.source_page || '/testimonials'}
            </p>
            <p className="mt-2 text-xs text-ge-gray500">
              Submitted {formatDateTimeDdMmYy(row.created_at)}
              {row.published_at ? ` · Published ${formatDateTimeDdMmYy(row.published_at)}` : ''}
            </p>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-semibold text-forest-700">Contact (admin only)</summary>
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
                {busy ? 'Saving…' : 'Approve for homepage'}
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
                {busy ? 'Saving…' : 'Hide from homepage'}
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
                {busy ? 'Saving…' : 'Show on homepage again'}
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
              {busy ? 'Deleting…' : 'Delete permanently'}
            </LuxuryButton>
          </div>
        </div>
      </li>
    )
  }

  return (
    <section id="admin-hub-testimonials" className="scroll-mt-28 space-y-8">
      <div className="rounded-[2rem] border border-forest-100/90 bg-gradient-to-br from-white via-fairway-50/30 to-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-fairway-800 text-white shadow-md">
            <Star className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-ge text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">Homepage reviews</p>
            <h2 className="font-display mt-1 text-2xl font-bold text-forest-950 sm:text-3xl">Testimonials desk</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-forest-700">
              Submissions from <strong className="font-semibold text-forest-900">Give a testimonial</strong> wait here first.
              Approve to show on the homepage, hide to remove from public view, or delete to remove completely.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-center">
            <div className="rounded-xl border border-brand-700/25 bg-white px-4 py-3">
              <p className="font-display text-2xl font-bold text-brand-800">{pendingRows.length}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-forest-600">Pending</p>
            </div>
            <div className="rounded-xl border border-fairway-200/80 bg-white px-4 py-3">
              <p className="font-display text-2xl font-bold text-fairway-900">{liveRows.length}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-forest-600">Live</p>
            </div>
            <div className="rounded-xl border border-forest-200/80 bg-white px-4 py-3">
              <p className="font-display text-2xl font-bold text-forest-800">{hiddenRows.length}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-forest-600">Hidden</p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-forest-600">
          <a
            className="font-semibold text-fairway-800 underline underline-offset-2"
            href="/#tripadvisor-reviews"
            target="_blank"
            rel="noreferrer"
          >
            Open homepage reviews section
          </a>{' '}
          · Only <strong>approved</strong> testimonials appear there.
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-brand-700/40 bg-orange-50 px-4 py-3 text-sm text-forest-900">{message}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-forest-600">Loading testimonials…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-forest-200 bg-forest-50/50 px-5 py-8 text-sm text-forest-700">
          No testimonials yet. When a guest submits the form on{' '}
          <a className="font-semibold underline" href="/testimonials">
            /testimonials
          </a>
          , it will appear here for approval.
        </p>
      ) : (
        <>
          {pendingRows.length > 0 ? (
            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-forest-950">
                <Clock className="h-5 w-5 text-brand-700" aria-hidden />
                Awaiting approval ({pendingRows.length})
              </h3>
              <ul className="mt-4 space-y-4">{pendingRows.map(renderRow)}</ul>
            </div>
          ) : null}
          {liveRows.length > 0 ? (
            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-forest-950">
                <Eye className="h-5 w-5 text-fairway-800" aria-hidden />
                Live on homepage ({liveRows.length})
              </h3>
              <ul className="mt-4 space-y-4">{liveRows.map(renderRow)}</ul>
            </div>
          ) : null}
          {hiddenRows.length > 0 ? (
            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-forest-950">
                <EyeOff className="h-5 w-5 text-forest-600" aria-hidden />
                Hidden ({hiddenRows.length})
              </h3>
              <ul className="mt-4 space-y-4">{hiddenRows.map(renderRow)}</ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
