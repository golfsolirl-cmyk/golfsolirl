import { useEffect, useState } from 'react'

type PublicOffer = {
  headline: string
  placesLeft: number
  deadlineAt: string | null
}

/** Slim public banner when /admin/offer is enabled. */
export function SiteLaunchOfferBanner() {
  const [offer, setOffer] = useState<PublicOffer | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/launch-offer', { method: 'GET' })
        const data = (await res.json().catch(() => ({}))) as { offer?: PublicOffer | null }
        if (!cancelled && data.offer) setOffer(data.offer)
      } catch {
        /* silent */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!offer) return null

  const deadline =
    offer.deadlineAt != null
      ? new Date(offer.deadlineAt).toLocaleString('en-IE', {
          timeZone: 'Europe/Dublin',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      : null

  return (
    <div className="bg-gs-dark text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
        <p className="font-ge text-sm font-semibold">
          {offer.headline}
          <span className="ml-2 font-normal text-emerald-200">
            {offer.placesLeft} left
            {deadline ? ` · until ${deadline}` : ''}
          </span>
        </p>
        <a
          href="/quote"
          className="rounded-lg bg-white px-3 py-1.5 font-ge text-xs font-bold uppercase tracking-wider text-gs-dark"
        >
          Get a quote
        </a>
      </div>
    </div>
  )
}
