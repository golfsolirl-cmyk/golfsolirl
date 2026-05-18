import { Car, MapPin, Package, Sparkles, Wallet } from 'lucide-react'
import { cx } from '../lib/utils'

/** Public asset — same URL as dev `http://localhost:5173/images/admin-operations-hero.png` when `base` is `/`. */
const ADMIN_OPERATIONS_HERO_SRC = `${import.meta.env.BASE_URL}images/admin-operations-hero.png`

const JUMP_LINKS: readonly { readonly id: string; readonly label: string; readonly hint: string }[] = [
  { id: 'admin-hub-payments', label: 'Desk & inbox', hint: 'Admin card, Stripe note, threads' },
  { id: 'admin-hub-forms', label: 'Website forms', hint: 'Who wrote in' },
  { id: 'admin-hub-packages', label: 'Saved packages', hint: 'Calculator + portal rows' },
  { id: 'admin-hub-publish', label: 'Publish lines', hint: 'Golf / hotel / transfer' },
  { id: 'admin-hub-portal', label: 'Account & PDFs', hint: 'Account number, access' },
  { id: 'admin-transfer-pipeline', label: 'Drivers', hint: 'Assign Irish Driver' }
]

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function AdminOperationsHubHero(props: { readonly adminFirstName: string }) {
  const name = props.adminFirstName.trim()
  return (
    <div
      className="mb-10 overflow-hidden rounded-[2rem] border-2 border-brand-700/40 bg-gradient-to-br from-white via-white to-[#f0faf4] shadow-[0_22px_56px_rgba(11,73,52,0.08)] ring-1 ring-forest-900/[0.06]"
      id="admin-hub-welcome"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)]">
        <div className="order-2 flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-9 lg:order-1 lg:pr-4">
          <p className="font-ge text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600 sm:text-sm">Trip desk — today</p>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-forest-950 sm:text-4xl">
            {name ? `Hello, ${name}` : 'Welcome to operations'}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-forest-700 md:text-lg">
            Work in the same order your client sees on their dashboard: check who paid, open their saved trip, then use drivers when
            a transfer is ready. Use the buttons below to jump — no need to scroll hunting.
          </p>
          <ol className="mt-5 space-y-2.5 text-base text-forest-800 md:text-lg">
            <li className="flex gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fairway-800 text-sm font-bold text-white">
                1
              </span>
              <span>
                <strong className="font-semibold text-forest-900">Forms</strong> — read what the guest sent from the website.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fairway-800 text-sm font-bold text-white">
                2
              </span>
              <span>
                <strong className="font-semibold text-forest-900">Packages &amp; prices</strong> — set totals so the client dashboard updates.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fairway-800 text-sm font-bold text-white">
                3
              </span>
              <span>
                <strong className="font-semibold text-forest-900">Drivers</strong> — when a transfer is live, allocate in Operations.
              </span>
            </li>
          </ol>
          <nav aria-label="Jump to dashboard section" className="mt-6">
            <p className="font-ge text-xs font-extrabold uppercase tracking-[0.16em] text-forest-500 sm:text-sm">Jump to</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {JUMP_LINKS.map((item) => (
                <li key={item.id}>
                  <button
                    className={cx(
                      'inline-flex max-w-full flex-col items-start rounded-2xl border-2 border-forest-200/90 bg-white px-3.5 py-2 text-left transition',
                      'hover:border-fairway-500 hover:bg-fairway-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fairway-400'
                    )}
                    onClick={() => scrollToId(item.id)}
                    type="button"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-bold text-forest-900">
                      {item.id === 'admin-hub-payments' ? (
                        <Wallet className="h-3.5 w-3.5 shrink-0 text-fairway-700" aria-hidden />
                      ) : item.id === 'admin-hub-forms' ? (
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-fairway-700" aria-hidden />
                      ) : item.id === 'admin-hub-packages' || item.id === 'admin-hub-publish' ? (
                        <Package className="h-3.5 w-3.5 shrink-0 text-fairway-700" aria-hidden />
                      ) : item.id === 'admin-transfer-pipeline' ? (
                        <Car className="h-3.5 w-3.5 shrink-0 text-fairway-700" aria-hidden />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-fairway-700" aria-hidden />
                      )}
                      {item.label}
                    </span>
                    <span className="text-xs font-medium leading-snug text-forest-500 sm:text-sm">{item.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="relative order-1 min-h-[200px] bg-gradient-to-br from-[#0f3d24]/95 via-[#143d28] to-[#0a2416] lg:order-2 lg:min-h-0">
          <img
            alt=""
            className="h-full min-h-[200px] w-full object-cover object-center opacity-95 lg:min-h-full"
            decoding="async"
            loading="eager"
            src={ADMIN_OPERATIONS_HERO_SRC}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a2416]/90 via-transparent to-transparent lg:bg-gradient-to-l"
          />
          <p className="pointer-events-none absolute bottom-4 left-4 right-4 font-ge text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/90 sm:text-sm lg:bottom-6 lg:left-6">
            Same colours as the client portal — familiar for you and for guests.
          </p>
        </div>
      </div>
    </div>
  )
}
