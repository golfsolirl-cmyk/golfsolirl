import { useEffect, useMemo, useState } from 'react'
import { TowAdminShell } from '../../components/tow-admin/tow-admin-bar'
import { ensureAdminSession, towAdmin } from '../../lib/tow-admin-api'

type Offer = {
  enabled: boolean
  totalPlaces: number
  placesClaimed: number
  deadlineAt: string | null
  headline: string
}

function toDatetimeLocalDublin(iso: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Dublin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(d)
    const get = (t: string) => parts.find((p) => p.type === t)?.value || ''
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
  } catch {
    return ''
  }
}

function fromDatetimeLocalDublin(local: string): string | null {
  if (!local.trim()) return null
  // Treat as Europe/Dublin wall time → ISO
  const [date, time] = local.split('T')
  if (!date || !time) return null
  const approx = new Date(`${date}T${time}:00`)
  // Offset for Dublin (handles IST/GMT via Intl)
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Dublin',
    timeZoneName: 'shortOffset'
  })
  const tzPart = fmt.formatToParts(approx).find((p) => p.type === 'timeZoneName')?.value || 'GMT'
  const m = tzPart.match(/GMT([+-]\d{1,2})(?::?(\d{2}))?/)
  let offsetMin = 0
  if (m) {
    const h = Number(m[1])
    const mins = Number(m[2] || 0)
    offsetMin = h * 60 + (h < 0 ? -mins : mins)
  }
  const utc = Date.UTC(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
    Number(time.slice(0, 2)),
    Number(time.slice(3, 5))
  )
  return new Date(utc - offsetMin * 60_000).toISOString()
}

export function TowAdminOfferPage() {
  const [ready, setReady] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [totalPlaces, setTotalPlaces] = useState('25')
  const [placesClaimed, setPlacesClaimed] = useState('0')
  const [deadline, setDeadline] = useState('')
  const [headline, setHeadline] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Launch offer · Admin · Golf Sol Ireland'
    let cancelled = false
    void (async () => {
      const ok = await ensureAdminSession('/admin/offer')
      if (!ok || cancelled) return
      try {
        const res = await towAdmin<{ offer: Offer }>('offer_get')
        if (cancelled) return
        const o = res.offer
        setEnabled(Boolean(o?.enabled))
        setTotalPlaces(String(o?.totalPlaces ?? 25))
        setPlacesClaimed(String(o?.placesClaimed ?? 0))
        setDeadline(toDatetimeLocalDublin(o?.deadlineAt ?? null))
        setHeadline(o?.headline || '')
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const remaining = useMemo(
    () => Math.max(0, (Number(totalPlaces) || 0) - (Number(placesClaimed) || 0)),
    [totalPlaces, placesClaimed]
  )

  const deadlineLabel = useMemo(() => {
    if (!deadline) return ''
    try {
      const iso = fromDatetimeLocalDublin(deadline)
      if (!iso) return ''
      return new Date(iso).toLocaleString('en-IE', {
        timeZone: 'Europe/Dublin',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return ''
    }
  }, [deadline])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    setErr(null)
    try {
      await towAdmin('offer_save', {
        enabled,
        totalPlaces: Number(totalPlaces) || 0,
        placesClaimed: Number(placesClaimed) || 0,
        deadlineAt: fromDatetimeLocalDublin(deadline),
        headline
      })
      setMsg('Saved. The banner updates on the site when the offer is on.')
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Could not save')
    } finally {
      setBusy(false)
    }
  }

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Loading…</div>
  }

  return (
    <TowAdminShell active="offer">
      <h1 className="font-ge text-3xl font-extrabold text-gs-dark">Launch offer</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Scarcity banner for the public site. Places left = total minus claimed. Deadline is Europe/Dublin.
      </p>

      <form onSubmit={(e) => void save(e)} className="mt-8 max-w-xl space-y-6">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-[#136047]"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span>
            <span className="block font-ge font-bold text-gs-dark">Offer is on</span>
            <span className="mt-1 block text-sm text-slate-600">
              Leave this off until the numbers are right. The banner stays hidden while this is off, after the deadline,
              or once there are no places left.
            </span>
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="offer-total" className="mb-1.5 block text-sm font-bold">
              Total places
            </label>
            <input
              id="offer-total"
              type="number"
              min={0}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              value={totalPlaces}
              onChange={(e) => setTotalPlaces(e.target.value)}
            />
            <p className="mt-1 text-sm text-slate-500">Suggested start: 25.</p>
          </div>
          <div>
            <label htmlFor="offer-claimed" className="mb-1.5 block text-sm font-bold">
              Places claimed
            </label>
            <input
              id="offer-claimed"
              type="number"
              min={0}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              value={placesClaimed}
              onChange={(e) => setPlacesClaimed(e.target.value)}
            />
            <p className="mt-1 text-sm text-slate-500">
              You set this yourself. The site does not count claims automatically. {remaining} would show as left.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="offer-deadline" className="mb-1.5 block text-sm font-bold">
            Deadline (Europe/Dublin)
          </label>
          <input
            id="offer-deadline"
            type="datetime-local"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <p className="mt-1 text-sm text-slate-500">
            {deadlineLabel ? `Currently reads as ${deadlineLabel}.` : 'Set a Dublin deadline for the banner.'}
          </p>
        </div>

        <div>
          <label htmlFor="offer-headline" className="mb-1.5 block text-sm font-bold">
            Headline (optional)
          </label>
          <input
            id="offer-headline"
            type="text"
            placeholder={`${totalPlaces || 25} golf trips. Limited places. Then it's over.`}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
          <p className="mt-1 text-sm text-slate-500">Leave blank to use the default, which includes the total places.</p>
        </div>

        {err ? <p className="text-sm text-rose-700">{err}</p> : null}
        {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-gs-dark px-5 py-3 font-ge text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save offer'}
        </button>
      </form>
    </TowAdminShell>
  )
}
