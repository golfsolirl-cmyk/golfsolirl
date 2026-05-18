import { m, type Variants } from 'framer-motion'
import { ArrowRight, ChevronDown, Clock3, PlaneLanding, ShieldCheck } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GeDualPhoneHeroButtons } from '../components/ge-dual-phone-contact'
import { transportHeroCopy } from '../data/transport-service'
import { handleScrollToFormTarget } from '../../../lib/scroll-to-form-target'

const heroContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } }
}

const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }
  }
}

/**
 * Two-tone headline — splits {@link transportHeroCopy.title} at the comma so
 * "Concierge transfers," stays white and "built for Irish golfers." renders
 * as a soft cream→gold gradient text-clip. Falls back to a single white
 * span if the copy ever loses the comma.
 */
function HeroHeadline({ className }: { readonly className?: string }) {
  const raw = transportHeroCopy.title
  const idx = raw.indexOf(',')
  const lead = idx >= 0 ? raw.slice(0, idx + 1) : raw
  const accent = idx >= 0 ? raw.slice(idx + 1).trimStart() : ''
  return (
    <h2 className={className}>
      <span style={{ color: '#ffffff' }}>{lead}</span>
      {accent ? (
        <>
          {' '}
          <span
            className="bg-clip-text"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #fff5cf 0%, #f4dfa6 45%, #d9be7a 100%)',
              color: 'transparent',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {accent}
          </span>
        </>
      ) : null}
    </h2>
  )
}

const HERO_KICKER_LINE = 'Met in arrivals · Door to door · One Irish crew'

/**
 * Cinematic transport hero — full-bleed coastal Mercedes V-Class image,
 * deep editorial overlay (eyebrow, big headline, lead, dual CTAs), gold
 * frame chrome consistent with the rest of the site, and a chevron pointing
 * to the promise section. Same navbar spacer as homepage hero.
 */
export function TransportHero() {
  const mobileHighlights = [
    { icon: PlaneLanding, label: 'Flight tracking from Ireland' },
    { icon: ShieldCheck, label: 'Golf-bag friendly Mercedes fleet' },
    { icon: Clock3, label: 'Fast quote turnaround' }
  ] as const

  return (
    <section
      className="relative isolate z-[38] overflow-hidden bg-gs-dark text-white"
      aria-labelledby="transport-hero-title"
      id="transport-top"
    >
      {/* z-[38]: above PageIdentityBar (z-20); below GeNavbar (z-40). */}
      <h1 id="transport-hero-title" className="sr-only">
        {transportHeroCopy.title}
      </h1>

      <div className="relative w-full overflow-hidden bg-gs-dark">
        {/* Image — full GolfSol fleet (V-Class, E-Class, Sprinter) on a Costa
            del Sol property with Sierra Blanca behind. Dedicated mobile stage
            + locked editorial aspect on tablet+. */}
        <picture className="block md:absolute md:inset-0 md:h-full md:w-full">
          <img
            src="/images/88054e80-6dd1-483f-8557-cdc45caa2442.png"
            alt="GolfSol Ireland Mercedes fleet — V-Class, E-Class and Sprinter parked on a Costa del Sol forecourt with the Sierra Blanca mountains and a manicured fairway behind them."
            className="block h-[58vh] min-h-[380px] w-full select-none object-cover object-[50%_55%] md:absolute md:inset-0 md:h-full md:min-h-0 md:w-full md:object-[center_55%]"
            fetchPriority="high"
            decoding="async"
            width={2400}
            height={1350}
          />
        </picture>

        {/* Aspect frame for tablet+ — keeps editorial proportions */}
        <div className="relative w-full pb-8 md:aspect-[16/9] md:pb-0 lg:aspect-[21/9]">
          <div aria-hidden className="absolute inset-x-0 top-0 z-[5] h-[54vh] min-h-[360px] bg-gradient-to-t from-gs-dark via-gs-dark/15 to-transparent md:hidden" />

          {/* Mobile composition — detached content card to avoid cramped overlays */}
          <div className="relative z-[12] -mt-16 px-4 md:hidden">
            <m.div
              className="transport-hero mx-auto w-full max-w-[34rem] overflow-hidden rounded-[1.75rem] border border-[#f4dfa6]/45 p-5 shadow-[0_26px_60px_rgba(1,16,12,0.62),0_0_30px_rgba(217,190,122,0.16)] backdrop-blur-xl"
              variants={heroContainer}
              initial="hidden"
              animate="visible"
              style={{
                background:
                  'linear-gradient(135deg, rgba(13,58,42,0.96) 0%, rgba(10,45,32,0.96) 50%, rgba(8,35,26,0.97) 100%)'
              }}
            >
              {/* Inner gold hairline */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#f4dfa6]/55 to-transparent"
              />

              <m.span
                variants={heroItem}
                className="inline-flex items-center gap-2 rounded-full border border-[#f4dfa6]/55 bg-white/[0.08] px-3 py-1.5 font-ge text-[0.66rem] font-extrabold uppercase tracking-[0.2em] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
                data-keep-color
                style={{ color: '#fbe8b5' }}
              >
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_10px_rgba(244,223,166,0.7)]"
                  style={{ backgroundColor: '#f4dfa6' }}
                />
                {transportHeroCopy.eyebrow}
              </m.span>

              <m.span
                aria-hidden="true"
                variants={heroItem}
                className="mt-4 block h-[3px] w-20 rounded-full bg-gradient-to-r from-transparent via-[#f4dfa6] to-transparent"
              />

              <m.div variants={heroItem}>
                <HeroHeadline className="mt-4 font-ge text-[2rem] font-extrabold leading-[1.04] tracking-[-0.005em] drop-shadow-[0_3px_18px_rgba(0,0,0,0.55)]" />
              </m.div>

              <m.p
                variants={heroItem}
                className="mt-3 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.18em]"
                data-keep-color
                style={{ color: '#fbe8b5' }}
              >
                {HERO_KICKER_LINE}
              </m.p>

              <m.p
                variants={heroItem}
                className="mt-3 font-ge text-[1.02rem] leading-7"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                {transportHeroCopy.subtitle}
              </m.p>

              <m.ul variants={heroItem} className="mt-5 space-y-2">
                {mobileHighlights.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 rounded-xl border border-[#f4dfa6]/30 bg-white/[0.05] px-3 py-2 font-ge text-[0.82rem] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: 'rgba(255,255,255,0.92)' }}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0"
                      aria-hidden
                      style={{ color: '#fbe8b5' }}
                    />
                    {label}
                  </li>
                ))}
              </m.ul>

              <m.div variants={heroItem} className="mt-5 flex flex-col gap-3">
                <GeButton href="#transport-enquire" variant="gs-green" size="lg" className="w-full">
                  {transportHeroCopy.primaryCta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </GeButton>
                <GeDualPhoneHeroButtons tone="dark" className="w-full" />
              </m.div>

              <m.p
                variants={heroItem}
                className="mt-4 font-ge text-[0.74rem] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                Irish-owned · Mercedes fleet · Replies inside 2 hours
              </m.p>
            </m.div>
          </div>

          {/* Vignette + readability scrims (left-anchored copy).
              Stronger than before because the new fleet hero image is
              shot in bright daylight — without this the white headline
              would lose contrast. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] hidden md:block"
            style={{
              background:
                'linear-gradient(90deg, rgba(6,30,22,0.92) 0%, rgba(6,30,22,0.74) 38%, rgba(6,30,22,0.32) 62%, rgba(6,30,22,0.05) 100%)'
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] hidden bg-gradient-to-t from-gs-dark/82 via-transparent to-gs-dark/35 md:block"
          />

          {/* Gold hairline frame */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[7] hidden h-[3px] md:block"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(230,207,38,0.52) 12%, #136047 28%, #d9be7a 50%, #136047 72%, rgba(230,207,38,0.52) 88%, transparent 100%)'
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] hidden h-[3px] md:block"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(230,207,38,0.48) 14%, #136047 30%, #d9be7a 50%, #136047 70%, rgba(230,207,38,0.48) 86%, transparent 100%)'
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[10%] left-0 top-[10%] z-[7] hidden w-px bg-gradient-to-b from-transparent via-brand-700/55 to-transparent md:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[10%] right-0 top-[10%] z-[7] hidden w-px bg-gradient-to-b from-transparent via-brand-700/45 to-transparent md:block"
          />

          {/* Overlay copy */}
          <div className="absolute inset-0 z-[12] hidden items-end pb-12 sm:items-center sm:pb-0 md:flex md:pt-8 lg:pt-12">
            <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
              <m.div
                className="transport-hero max-w-2xl"
                variants={heroContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Kicker pill */}
                <m.span
                  variants={heroItem}
                  className="inline-flex items-center gap-2 rounded-full border border-[#f4dfa6]/55 bg-white/[0.08] px-4 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.22em] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_24px_rgba(217,190,122,0.18)] sm:text-[0.74rem]"
                  data-keep-color
                  style={{ color: '#fbe8b5' }}
                >
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_10px_rgba(244,223,166,0.7)]"
                    style={{ backgroundColor: '#f4dfa6' }}
                  />
                  {transportHeroCopy.eyebrow}
                </m.span>

                {/* Brand-green→gold accent bar (matches every other premium hero) */}
                <m.span
                  aria-hidden="true"
                  variants={heroItem}
                  className="mt-5 block h-[3px] w-24 rounded-full bg-gradient-to-r from-transparent via-[#f4dfa6] to-transparent"
                />

                {/* Two-tone editorial headline — white + gold gradient */}
                <m.div variants={heroItem}>
                  <HeroHeadline className="mt-5 font-ge text-[2.25rem] font-extrabold leading-[1.04] tracking-[-0.005em] drop-shadow-[0_3px_22px_rgba(0,0,0,0.55)] sm:text-[3rem] md:text-[3.4rem] lg:text-[3.85rem]" />
                </m.div>

                {/* Supporting uppercase kicker line — punchy three-beat rhythm */}
                <m.p
                  variants={heroItem}
                  className="mt-5 font-ge text-[0.84rem] font-extrabold uppercase tracking-[0.2em] drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)] sm:text-[0.92rem]"
                  data-keep-color
                  style={{ color: '#fbe8b5' }}
                >
                  {HERO_KICKER_LINE}
                </m.p>

                <m.p
                  variants={heroItem}
                  className="mt-5 max-w-xl font-ge text-base leading-7 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-[1.05rem] sm:leading-8 lg:text-[1.125rem]"
                  style={{ color: 'rgba(255,255,255,0.92)' }}
                >
                  {transportHeroCopy.subtitle}
                </m.p>

                <m.div
                  variants={heroItem}
                  className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
                >
                  <GeButton href="#transport-enquire" variant="gs-green" size="lg">
                    {transportHeroCopy.primaryCta}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </GeButton>
                  <GeDualPhoneHeroButtons tone="dark" className="w-full min-w-0 sm:w-auto sm:flex-1" />
                </m.div>

                <m.p
                  variants={heroItem}
                  className="mt-5 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.2em] drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-[0.82rem]"
                  style={{ color: 'rgba(255,255,255,0.92)' }}
                >
                  Irish-owned · Mercedes fleet · Replies inside 2 hours
                </m.p>
              </m.div>
            </div>
          </div>

          <m.a
            href="#transport-promise"
            onClick={(event) => handleScrollToFormTarget(event, '#transport-promise')}
            aria-label="Scroll to the GolfSol Ireland transport promise"
            className="absolute bottom-4 right-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/85 bg-gs-dark/55 text-white backdrop-blur-md transition-colors hover:border-[#f4dfa6] hover:bg-gs-dark/75 hover:text-[#fbe8b5] md:bottom-6 md:left-1/2 md:right-auto md:h-12 md:w-12 md:-translate-x-1/2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          >
            <ChevronDown className="h-5 w-5" />
          </m.a>
        </div>
      </div>
    </section>
  )
}
