/** Hero for `/business-cards` — matches enquiry-email shell: turf page context + emerald band + gold accents. */
const HERO_IMG = '/images/business-cards-studio-hero.png'

export function BusinessCardsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F4F7F5]" aria-labelledby="business-cards-hero-title" id="top">
      {/* Top strip — same rhythm as email header row */}
      <div className="relative border-b border-[#d9d2c1]/60 bg-[#F4F7F5] px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              alt=""
              className="h-10 w-auto shrink-0 object-contain sm:h-11"
              decoding="async"
              src="/images/golfsol-header-logo-bitmap.png"
            />
            <span className="hidden font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.28em] text-[#063B2A]/75 sm:inline">
              Irish-owned · Costa del Sol · Golf concierge
            </span>
          </div>
          <a
            className="shrink-0 font-ge text-sm font-extrabold text-[#063B2A] no-underline hover:text-[#0B6B45]"
            href="tel:+353874464766"
          >
            +353 87 446 4766
          </a>
        </div>
      </div>

      <div className="relative w-full max-sm:aspect-[9/14] sm:aspect-[2/1] lg:aspect-[21/9]">
        {/* Gold hairline — enquiry hero accent */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-[5] h-[3px] bg-[#FFC72C]"
        />
        <img
          alt="Luxury embossed business cards with gold foil highlights on deep green velvet, brand studio photography."
          className="absolute inset-0 h-full w-full object-cover object-center"
          decoding="async"
          fetchPriority="high"
          src={HERO_IMG}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#063B2A]/78 via-[#063B2A]/45 to-emerald-950/40"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/88 via-[#063B2A]/35 to-transparent sm:from-black/82"
        />

        <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end px-5 pb-12 pt-16 sm:min-h-0 sm:pb-14 sm:pt-20 lg:px-10 lg:pb-16">
          <div className="mx-auto w-full max-w-[1180px]">
            <span className="inline-flex rounded-full border border-[#FFC72C]/45 bg-[#063B2A]/65 px-5 py-2.5 font-ge text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#FFE27A]">
              Brand studio · Executive cards
            </span>
            <h1
              id="business-cards-hero-title"
              className="font-ge mt-6 max-w-3xl text-[2.05rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.45)] sm:text-4xl md:text-[3rem]"
            >
              Premium print layouts — concierge to corporate
            </h1>
            <p className="mt-5 max-w-2xl font-ge text-base font-medium leading-relaxed text-white/74 sm:text-lg">
              Duplex suites with restrained typography and front/back hierarchy, plus the full GolfSol craft library — same
              turf, emerald, and gold system as our mail, built for{' '}
              <span className="font-extrabold text-white">Martin Kelly</span> and Ireland–Spain desks.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
