import { Flag, Gift, Percent, Sparkles, Sun } from 'lucide-react'
import { COURSES } from '../data/coastal-golf-data'

const PERKS = [
  {
    icon: Percent,
    title: '€10 off your next round',
    detail: 'Book a second Costa course through Golf Sol Ireland within 14 days of your trip — we apply €10 per golfer.',
    badge: 'Member perk',
    tone: 'gold' as const
  },
  {
    icon: Sun,
    title: 'Twilight tee times',
    detail: 'Ask us about late-afternoon rates at Valderrama corridor courses — ideal after a long Irish travel day.',
    badge: 'Seasonal',
    tone: 'green' as const
  },
  {
    icon: Gift,
    title: 'Group society bonus',
    detail: 'Parties of 8+ golfers: complimentary AGP meet-and-greet upgrade when you book transfers + two rounds.',
    badge: 'Groups',
    tone: 'green' as const
  },
  {
    icon: Sparkles,
    title: 'Scan-to-win — €50 green-fee credit',
    detail: 'After your first paid transfer, watch your inbox for a monthly draw. One guest each month wins €50 toward their next round.',
    badge: 'Scan to win',
    tone: 'gold' as const
  }
] as const

const FEATURED_COURSES = COURSES.slice(0, 3)

export function PortalPerksPanel() {
  return (
    <div className="space-y-6">
      <div className="ge-on-dark rounded-[1.75rem] border border-forest-100 bg-gradient-to-br from-brand-800 via-forest-900 to-brand-950 p-5 text-white shadow-soft sm:p-7">
        <p className="font-ge text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-200/90">Perks & deals</p>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">Your Costa del Sol golf rewards</h2>
        <p className="mt-3 max-w-prose text-lg leading-relaxed text-emerald-50/95">
          Exclusive to Golf Sol Ireland trip-desk guests — savings on rounds, twilight tee times, and monthly scan-to-win
          credits. Activate offers by messaging us from your dashboard.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {PERKS.map((perk) => {
          const Icon = perk.icon
          return (
            <li
              className="flex flex-col overflow-hidden rounded-[1.75rem] border border-forest-100 bg-white shadow-[0_12px_32px_rgba(11,73,52,0.08)]"
              key={perk.title}
            >
              <div
                className={
                  perk.tone === 'gold'
                    ? 'bg-gradient-to-r from-[#f5e6a8] to-[#e8c96a] px-5 py-3'
                    : 'bg-gradient-to-r from-fairway-100 to-emerald-50 px-5 py-3'
                }
              >
                <span
                  className={
                    perk.tone === 'gold'
                      ? 'font-ge text-sm font-extrabold uppercase tracking-[0.14em] text-forest-950'
                      : 'font-ge text-sm font-extrabold uppercase tracking-[0.14em] text-brand-800'
                  }
                >
                  {perk.badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-fairway-50 text-brand-700">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold leading-snug text-forest-950">{perk.title}</h3>
                <p className="mt-2 flex-1 text-lg leading-relaxed text-forest-700">{perk.detail}</p>
                <button
                  className="mt-5 inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl border-2 border-brand-700/30 bg-brand-50 px-4 py-3 text-base font-bold text-brand-900 transition hover:bg-brand-100"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('gsol-portal-open-messages'))
                  }}
                  type="button"
                >
                  Request this perk
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <section className="rounded-[1.75rem] border border-forest-100 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Flag aria-hidden className="h-5 w-5 text-brand-600" />
          <h3 className="font-display text-xl font-bold text-forest-950">Featured Sol courses</h3>
        </div>
        <ul className="mt-4 space-y-3">
          {FEATURED_COURSES.map((c) => (
            <li className="rounded-2xl border border-forest-100 bg-fairway-50/50 px-4 py-3" key={c.id}>
              <p className="text-lg font-semibold text-forest-950">{c.name}</p>
              <p className="mt-1 text-base leading-relaxed text-forest-600">
                {c.region} · {c.tier} · ★ {c.rating.toFixed(1)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
