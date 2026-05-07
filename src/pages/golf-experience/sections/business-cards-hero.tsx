/** Hero for `/business-cards` — premium stack-of-cards photography + overlay copy. */
const HERO_IMG = '/images/business-cards-studio-hero.png'

export function BusinessCardsHero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-gs-dark"
      aria-labelledby="business-cards-hero-title"
      id="top"
    >
      <div
        aria-hidden="true"
        className="h-[150px] w-full bg-white max-sm:h-[152px] sm:h-[156px] md:h-[168px] lg:h-[130px] xl:h-[142px]"
      />

      <div className="relative w-full max-sm:aspect-[9/14] sm:aspect-[2/1] lg:aspect-[21/9]">
        <img
          alt="Luxury embossed business cards with gold foil highlights on deep green velvet, brand studio photography."
          className="absolute inset-0 h-full w-full object-cover object-center"
          decoding="async"
          fetchPriority="high"
          src={HERO_IMG}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-gs-dark/75 via-forest-950/35 to-emerald-950/40"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/88 via-gs-dark/40 to-transparent sm:from-black/82"
        />

        <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end px-5 pb-12 pt-16 sm:min-h-0 sm:pb-14 sm:pt-20 lg:px-10 lg:pb-16">
          <div className="mx-auto w-full max-w-[1180px]">
            <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.38em] text-emerald-200/95">
              Golf Sol Ireland · brand studio
            </p>
            <h1
              id="business-cards-hero-title"
              className="font-display mt-4 max-w-3xl text-[2.1rem] font-bold leading-[1.08] tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.45)] sm:text-4xl md:text-5xl"
            >
              Luxury business card concepts
            </h1>
            <p className="mt-5 max-w-2xl font-ge text-base leading-relaxed text-emerald-50/95 sm:text-lg">
              Print-ready designs for <span className="font-semibold text-white">Martin Kelly</span> — elevated
              layouts, Irish–Spanish contact lines, and Golf Sol Ireland craft in every wave.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
