/**
 * Home-only strip: Europe + Scandinavian flags and a short line for visitors
 * from those markets planning golf on the Costa del Sol.
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
  'h-[22px] w-auto shrink-0 rounded-[3px] shadow-[0_2px_8px_rgba(0,0,0,0.28)] ring-1 ring-white/25 sm:h-[26px] sm:rounded-[4px]'

export function GeHomeEuNordicWelcome() {
  return (
    <section
      className="relative border-b border-chrome-300/60 bg-cream text-gs-dark"
      aria-labelledby="home-eu-nordic-welcome-heading"
    >
      <div className="relative mx-auto max-w-[1180px] px-4 py-3 sm:px-8 sm:py-4">
        <div className="flex flex-col items-center gap-3 rounded-[1.25rem] border border-chrome-300/80 bg-white/90 px-4 py-3.5 shadow-[0_8px_24px_rgba(6,32,22,0.05)] sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:py-4">
          <h2 id="home-eu-nordic-welcome-heading" className="sr-only">
            Golf transfers for visitors from the European Union and Scandinavia
          </h2>

          <div
            className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-chrome-300 bg-cream/80 px-4 py-2 sm:gap-3 sm:px-4 sm:py-2.5"
            role="group"
            aria-label="Europe, Denmark, Norway, Sweden"
          >
            <span className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-gs-green sm:text-[0.68rem]">
              Europe
            </span>
            <span title="Europe" className="inline-flex leading-none">
              <FlagEu className={flagClass} />
            </span>
            <span className="select-none font-ge text-xs font-bold text-ge-gray500" aria-hidden>
              +
            </span>
            <span className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-gs-green sm:text-[0.68rem]">
              Nordics
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

          <div className="hidden h-8 w-px shrink-0 bg-chrome-300 sm:block" aria-hidden />

          <p className="max-w-2xl text-center font-ge text-[0.875rem] leading-relaxed text-ge-gray500 sm:text-left sm:text-[0.9rem] sm:leading-7">
            <span className="font-extrabold text-gs-dark">
              Flying in from Europe or Scandinavia for golf on the Sol?
            </span>{' '}
            <span>
              We offer{' '}
              <span className="font-semibold text-brand-700">Málaga meet-and-greet and airport transfers</span>, all
              planned around your resort and tee times.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
