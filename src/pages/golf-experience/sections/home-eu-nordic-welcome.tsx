/**
 * Subtle home-only strip: EU + Scandinavian flags and a short line for
 * visitors from those markets planning golf on the Costa del Sol.
 */
function FlagEu({ className }: { className?: string }) {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 12
    const cx = 15 + 5.5 * Math.cos(angle)
    const cy = 10 + 5.5 * Math.sin(angle)
    return <circle key={i} cx={cx} cy={cy} r={0.85} fill="#FC0" />
  })
  return (
    <svg className={className} viewBox="0 0 30 20" aria-hidden>
      <rect width="30" height="20" fill="#039" rx={1.5} />
      {stars}
    </svg>
  )
}

/** Danish Dannebrog — white cross offset toward hoist reads clearly at small sizes. */
function FlagDenmark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 37 28" aria-hidden>
      <rect width="37" height="28" fill="#C8102E" rx={1.5} />
      <rect x="11" y="0" width="5" height="28" fill="#fff" />
      <rect x="0" y="11.5" width="37" height="5" fill="#fff" />
    </svg>
  )
}

function FlagNorway({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 16" aria-hidden>
      <rect width="22" height="16" fill="#EF2B2D" rx={1.5} />
      <rect x="6" width="4" height="16" fill="#fff" />
      <rect y="6" width="22" height="4" fill="#fff" />
      <rect x="7" width="2" height="16" fill="#002868" />
      <rect y="7" width="22" height="2" fill="#002868" />
    </svg>
  )
}

function FlagSweden({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 10" aria-hidden>
      <rect width="16" height="10" fill="#006AA7" rx={1.5} />
      <rect x="5" width="2" height="10" fill="#FECC00" />
      <rect y="4" width="16" height="2" fill="#FECC00" />
    </svg>
  )
}

const flagClass =
  'h-[26px] w-auto shrink-0 rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] sm:h-[30px] sm:rounded-[4px]'

export function GeHomeEuNordicWelcome() {
  return (
    <section
      className="border-b border-[#e8e4dc] bg-[#faf9f6] text-gs-dark"
      aria-labelledby="home-eu-nordic-welcome-heading"
    >
      <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-center gap-2.5 px-4 py-3 sm:flex-row sm:gap-5 sm:px-8 sm:py-3.5">
        <h2 id="home-eu-nordic-welcome-heading" className="sr-only">
          Golf transfers for visitors from the European Union and Scandinavia
        </h2>
        <div
          className="flex items-center gap-2 sm:gap-2.5"
          role="group"
          aria-label="European Union, Denmark, Norway, Sweden"
        >
          <span title="European Union" className="inline-flex leading-none">
            <FlagEu className={flagClass} />
          </span>
          <span className="select-none font-ge text-[11px] font-bold text-ge-gray300" aria-hidden>
            +
          </span>
          <span title="Denmark" className="inline-flex leading-none">
            <FlagDenmark className={flagClass} />
          </span>
          <span title="Norway" className="inline-flex leading-none">
            <FlagNorway className={flagClass} />
          </span>
          <span title="Sweden" className="inline-flex leading-none">
            <FlagSweden className={flagClass} />
          </span>
        </div>
        <p className="max-w-xl text-center font-display text-[0.8125rem] font-medium leading-relaxed tracking-[-0.012em] text-forest-800 antialiased sm:max-w-2xl sm:text-left sm:text-sm sm:leading-7 sm:tracking-tight">
          <span className="font-semibold text-forest-950">Flying in from the EU or Scandinavia for golf on the Sol?</span>{' '}
          <span className="text-forest-700/95">
            Same{' '}
            <span className="font-semibold text-gs-green">Malaga meet-and-greet</span>
            {' '}and{' '}
            <span className="font-semibold text-gs-green">Mercedes transfers</span>
            {' '}
            — planned in plain English, around your tee times and resort.
          </span>
        </p>
      </div>
    </section>
  )
}
