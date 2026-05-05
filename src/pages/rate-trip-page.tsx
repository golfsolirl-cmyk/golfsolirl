import { useMemo, useState, type FormEvent } from 'react'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'
import { GeButton } from './golf-experience/components/ge-button'

export function RateTripPage() {
  const params = useMemo(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''), [])
  const bid = params.get('bid')?.trim() ?? ''
  const token = params.get('t')?.trim() ?? ''

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!bid || !token) {
      setMsg('This link is incomplete. Open the review link from your email.')
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/trip-review-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: bid, token, rating, comment, displayName })
      })
      const j = (await res.json()) as { message?: string; alreadySubmitted?: boolean }
      if (!res.ok) {
        setMsg(j.message ?? 'Could not save review.')
        return
      }
      if (j.alreadySubmitted) {
        setMsg('We already have a review for this trip. Thank you.')
      }
      setDone(true)
    } catch {
      setMsg('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ge-page min-h-screen bg-white">
      <GeNavbar />
      <main className="mx-auto max-w-lg px-5 pb-24 pt-32 sm:pt-36">
        <h1 className="font-ge text-3xl font-extrabold text-gs-dark">Rate your transfer</h1>
        <p className="mt-3 font-ge text-sm leading-relaxed text-ge-gray500">
          Honest feedback helps us train partners and celebrate great driving on the Costa del Sol.
        </p>

        {!bid || !token ? (
          <p className="mt-8 text-sm text-red-700">Missing review parameters. Use the link from your completion email.</p>
        ) : done ? (
          <p className="mt-8 font-ge text-lg font-semibold text-gs-green">Thank you — your notes are in.</p>
        ) : (
          <form className="mt-10 space-y-6" onSubmit={(e) => void submit(e)}>
            <label className="block font-ge text-sm font-bold text-gs-dark">
              Star rating
              <select
                className="mt-2 w-full rounded-xl border-2 border-ge-gray200 px-3 py-3 font-ge"
                onChange={(e) => setRating(Number(e.target.value))}
                value={rating}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} — {n === 5 ? 'Excellent' : n === 1 ? 'Poor' : ' '}
                  </option>
                ))}
              </select>
            </label>
            <label className="block font-ge text-sm font-bold text-gs-dark">
              Display name (optional, for testimonials)
              <input
                className="mt-2 w-full rounded-xl border-2 border-ge-gray200 px-3 py-3 font-ge"
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Tom from Dublin"
                value={displayName}
              />
            </label>
            <label className="block font-ge text-sm font-bold text-gs-dark">
              Comments
              <textarea
                className="mt-2 min-h-[120px] w-full rounded-xl border-2 border-ge-gray200 px-3 py-3 font-ge"
                onChange={(e) => setComment(e.target.value)}
                value={comment}
              />
            </label>
            {msg ? <p className="text-sm text-red-700">{msg}</p> : null}
            <GeButton disabled={busy} type="submit" variant="gs-gold">
              {busy ? 'Sending…' : 'Submit review'}
            </GeButton>
          </form>
        )}
      </main>
      <GeFooter />
    </div>
  )
}
