const ADMIN_OPERATIONS_HERO_SRC = `${import.meta.env.BASE_URL}images/admin-operations-hero.png`

export function AdminOperationsHubHero(props: { readonly adminFirstName: string }) {
  const name = props.adminFirstName.trim()

  return (
    <div
      className="mb-8 overflow-hidden rounded-2xl border border-forest-100/90 bg-white shadow-sm ring-1 ring-forest-900/[0.04]"
      id="admin-hub-welcome"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)]">
        <div className="flex flex-col justify-center px-6 py-6 sm:px-8 sm:py-7">
          <p className="font-ge text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">Trip desk</p>
          <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-forest-950 sm:text-3xl">
            {name ? `Hello, ${name}` : 'Welcome to operations'}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-forest-700 md:text-base">
            Use the menu on the left to open one area at a time — forms, transfers, packages, and client portal tools stay
            organised instead of one long scroll.
          </p>
          <ol className="mt-4 space-y-2 text-sm text-forest-800">
            <li>
              <strong className="font-semibold text-forest-900">Forms</strong> — read what guests sent from the website.
            </li>
            <li>
              <strong className="font-semibold text-forest-900">Packages &amp; prices</strong> — update totals on the client dashboard.
            </li>
            <li>
              <strong className="font-semibold text-forest-900">Drivers</strong> — assign transfers when a booking is live.
            </li>
          </ol>
        </div>
        <div className="relative min-h-[140px] bg-gradient-to-br from-[#0f3d24]/95 via-[#143d28] to-[#0a2416] lg:min-h-0">
          <img
            alt=""
            className="h-full min-h-[140px] w-full object-cover object-center opacity-95 lg:min-h-full"
            decoding="async"
            loading="eager"
            src={ADMIN_OPERATIONS_HERO_SRC}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a2416]/90 via-transparent to-transparent lg:bg-gradient-to-l"
          />
        </div>
      </div>
    </div>
  )
}

