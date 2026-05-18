/** Hero for `/business-cards` — staff press suite. */
import { businessCardContact, businessCardPerson, businessCardPersonGreg } from '../../../lib/business-cards-config'

const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
const CARD_HERO_IMG = `${base}images/88054e80-6dd1-483f-8557-cdc45caa2442.png`

export function BusinessCardsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f0ebe2]" aria-labelledby="business-cards-hero-title" id="top">
      <div className="relative">
        {/* Background layers */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,#08120d_0%,#0a3024_42%,#1a3d2d_100%)]" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-1/4 top-0 h-full w-[70%] opacity-[0.14]"
          style={{
            backgroundImage: `url(${CARD_HERO_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            maskImage: 'linear-gradient(90deg, transparent, black 45%)'
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(19, 96, 71,0.12),transparent_50%)]" />

        <div className="ge-on-dark relative z-10 mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
          <div>
            <p className="font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.28em]" data-keep-color style={{ color: '#fbe8b5' }}>Print-ready</p>
            <h1
              id="business-cards-hero-title"
              className="mt-4 font-ge text-[2rem] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[2.65rem] lg:text-[3.1rem]"
              style={{ color: '#ffffff' }}
            >
              Cards for the people guests actually meet.
            </h1>
            <p className="mt-5 max-w-xl font-ge text-base font-medium leading-relaxed sm:text-lg" style={{ color: 'rgba(255,255,255,0.92)' }}>
              Portrait and landscape faces in Classic and Dark Edition styles — high-contrast type and a large <span className="whitespace-nowrap">golfsol-crest-brand.webp</span> crest, tuned so nothing clips at export. Sixteen layouts below: Martin Kelly and Greg McDonald share one number set and web presence.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-ge text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white">
                {businessCardPerson.name}
              </span>
              <span className="rounded-full border border-[#136047]/35 bg-[#136047]/15 px-4 py-2 font-ge text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#fdf6bf]">
                {businessCardPersonGreg.name}
              </span>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#business-card-catalog-title"
                className="inline-flex items-center justify-center rounded-full bg-[#136047] px-6 py-3 font-ge text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-[#fbe8b5] hover:text-[#03150f]"
              >
                View all cards
              </a>
              <a
                href={`tel:${businessCardContact.phoneIe.replace(/\s/g, '')}`}
                className="inline-flex items-center justify-center rounded-full border-2 border-white/35 px-6 py-3 font-ge text-sm font-extrabold text-white transition hover:bg-white/10"
              >
                {businessCardContact.phoneIe}
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[2rem] bg-[#136047]/10 blur-2xl sm:-inset-10"
            />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#f4f1ea] shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  alt=""
                  className="h-full w-full object-cover object-bottom"
                  decoding="async"
                  fetchPriority="high"
                  src={CARD_HERO_IMG}
                />
              </div>
              <div className="border-t border-[#08120d]/10 bg-[#f4f1ea] px-5 py-4 sm:px-6 sm:py-5" data-keep-color>
                <p className="font-ge text-[0.62rem] font-black uppercase tracking-[0.28em]" data-keep-color style={{ color: '#08120d', WebkitTextFillColor: '#08120d' }}>Custom press</p>
                <p className="mt-2 font-ge text-sm font-semibold leading-relaxed" data-keep-color style={{ color: '#1a2a24', WebkitTextFillColor: '#1a2a24' }}>
                  Custom-made business cards designed exclusively for Golf Sol Ireland — premium stock,
                  brand crest, and fleet imagery tailored for the team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
