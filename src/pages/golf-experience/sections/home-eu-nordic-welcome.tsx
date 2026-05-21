/**
 * Home-only strip: EU + Scandinavian flags and a short line for visitors
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
      className="ge-on-dark relative isolate overflow-hidden border-y border-[#d9be7a]/30 bg-[#0a2d20] text-white"
      aria-labelledby="home-eu-nordic-welcome-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9be7a]/55 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_12%_50%,rgba(19,96,71,0.22),transparent_55%),radial-gradient(ellipse_70%_100%_at_88%_50%,rgba(217,190,122,0.08),transparent_50%)]"
      />

      <div className="relative mx-auto max-w-[1180px] px-4 py-4 sm:px-8 sm:py-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
          <h2 id="home-eu-nordic-welcome-heading" className="sr-only">
            Golf transfers for visitors from the European Union and Scandinavia
          </h2>

          <div
            className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:gap-3 sm:px-5 sm:py-3"
            role="group"
            aria-label="European Union, Denmark, Norway, Sweden"
          >
            <span className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-[#f4dfa6] sm:text-[0.68rem]">
              EU
            </span>
            <span title="European Union" className="inline-flex leading-none">
              <FlagEu className={flagClass} />
            </span>
            <span className="select-none font-ge text-xs font-bold text-white/40" aria-hidden>
              +
            </span>
            <span className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-[#f4dfa6] sm:text-[0.68rem]">
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

          <div className="hidden h-10 w-px shrink-0 bg-gradient-to-b from-transparent via-[#d9be7a]/45 to-transparent sm:block" aria-hidden />

          <p className="max-w-2xl text-center font-ge text-[0.875rem] leading-relaxed text-white/92 sm:text-left sm:text-[0.9375rem] sm:leading-7">
            <span className="font-extrabold text-white">
              Flying in from the EU or Scandinavia for golf on the Sol?
            </span>{' '}
            <span className="text-white/85">
              Same{' '}
              <span className="font-semibold text-[#f4dfa6]">Malaga meet-and-greet</span>
              {' '}and{' '}
              <span className="font-semibold text-[#f4dfa6]">Mercedes transfers</span>
              {' '}
              — planned in plain English, around your tee times and resort.
            </span>
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d9be7a]/35 to-transparent"
      />
    </section>
  )
}
