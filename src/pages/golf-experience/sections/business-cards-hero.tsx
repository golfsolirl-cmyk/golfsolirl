/** Hero for `/business-cards` — PDF-derived card proofing page. */
const FRONT_CARD_IMG = '/images/business-cards/golfsol-business-card-front.png'
const BACK_CARD_IMG = '/images/business-cards/golfsol-business-card-back.png'

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
              src="/golfsol-crest.svg"
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

      <div className="relative overflow-hidden">
        {/* Mustard-green hairline — sampled from the supplied PDF */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-[5] h-[3px] bg-[#D5C600]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(213,198,0,0.18),transparent_28%),linear-gradient(135deg,#063B2A_0%,#182B16_48%,#3E522D_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent"
        />

        <div className="relative z-10 mx-auto grid min-h-[560px] max-w-[1180px] items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
          <div>
            <span className="inline-flex rounded-full border border-[#D5C600]/45 bg-[#063B2A]/65 px-5 py-2.5 font-ge text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#EBE486]">
              PDF proof · Front and back
            </span>
            <h1
              id="business-cards-hero-title"
              className="font-ge mt-6 max-w-3xl text-[2.15rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.45)] sm:text-4xl md:text-[3.15rem]"
            >
              Business cards matched to the supplied artwork.
            </h1>
            <p
              className="mt-5 max-w-2xl font-ge text-base font-semibold leading-relaxed sm:text-lg"
              style={{ color: 'rgba(255,255,255,0.86)' }}
            >
              The old card catalogue is gone. This page now shows the exact PDF front and back in portrait, plus landscape
              versions generated from the same source artwork.
            </p>
          </div>

          <div className="relative mx-auto flex w-full max-w-[470px] justify-center lg:max-w-none">
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D5C600]/20 blur-3xl"
            />
            <img
              alt="GolfSol Ireland business card front from supplied PDF"
              className="relative z-10 w-[42%] min-w-[150px] rotate-[-7deg] rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.45)] ring-1 ring-white/20"
              decoding="async"
              fetchPriority="high"
              src={FRONT_CARD_IMG}
            />
            <img
              alt="GolfSol Ireland business card back from supplied PDF"
              className="relative z-20 -ml-[12%] mt-[13%] w-[42%] min-w-[150px] rotate-[7deg] rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.45)] ring-1 ring-white/20"
              decoding="async"
              fetchPriority="high"
              src={BACK_CARD_IMG}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
