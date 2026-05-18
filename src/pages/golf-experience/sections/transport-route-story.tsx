import { m, type Variants } from 'framer-motion'
import { ArrowRight, MapPin, Sparkles } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { transportRouteStory } from '../data/transport-service'

const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 }
  }
}

const heroItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }
  }
}

const cardStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }
  }
}

/**
 * Three editorial moments — Plane → Hotel → Week.
 *
 * Premium dark-base pattern (matches homepage extras-strip / facts-cta closer):
 *   • Forest gradient surface with editorial halos top-left + bottom-right
 *   • Gold kicker pill ("The route") with Sparkles icon
 *   • Two-tone headline (white + gold-gradient)
 *   • Lead + body in white / 92% white
 *   • Step cards: gold-rim forest gradient with gold accent badge,
 *     white headlines, white body, gold accent bullet — NO dark forest
 *     text on dark forest background.
 */
export function TransportRouteStory() {
  return (
    <GeSection
      id="transport-journey"
      background="brandDark"
      innerClassName="transport-route relative !pt-24 pb-24 sm:!pt-28 sm:pb-28 scroll-mt-28"
      className="ge-on-dark relative bg-[linear-gradient(180deg,#0d3a2a_0%,#0a2d20_50%,#08231a_100%)]"
    >
      {/* Editorial halos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,190,122,0.18),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-[-6rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(11,107,69,0.32),transparent_72%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#f4dfa6]/55 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-16 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f4dfa6]/35 to-transparent"
      />

      {/* —— Editorial header —— */}
      <m.div
        className="relative mx-auto max-w-3xl text-center"
        variants={heroContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <m.span
          variants={heroItem}
          className="ge-on-dark-kicker inline-flex items-center gap-2 rounded-full border border-[#f4dfa6]/55 bg-white/[0.08] px-4 py-2 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.24em] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_24px_rgba(217,190,122,0.18)] backdrop-blur-sm sm:text-[0.74rem]"
          data-keep-color
          style={{ color: '#fbe8b5' }}
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden style={{ color: '#fbe8b5' }} />
          The route
        </m.span>

        <m.span
          aria-hidden="true"
          variants={heroItem}
          className="mx-auto mt-6 block h-[3px] w-24 rounded-full bg-gradient-to-r from-transparent via-[#f4dfa6] to-transparent"
        />

        <m.h2
          variants={heroItem}
          className="mt-6 font-ge text-[2rem] font-extrabold uppercase leading-[1.06] tracking-[0.01em] drop-shadow-[0_3px_18px_rgba(0,0,0,0.55)] sm:text-[2.4rem] lg:text-[2.7rem]"
          style={{ color: '#ffffff' }}
        >
          <span style={{ color: '#ffffff' }}>Plane to fairway, </span>
          <span
            className="bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg, #fff5cf 0%, #f4dfa6 45%, #d9be7a 100%)',
              color: 'transparent',
              WebkitTextFillColor: 'transparent'
            }}
          >
            in three calm beats.
          </span>
        </m.h2>

        <m.p
          variants={heroItem}
          className="mx-auto mt-5 max-w-2xl font-ge text-[0.96rem] font-semibold uppercase tracking-[0.16em] drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] sm:text-[1rem]"
          style={{ color: '#ffffff' }}
        >
          One Irish crew · One Mercedes fleet · One choreography
        </m.p>

        <m.p
          variants={heroItem}
          className="mx-auto mt-5 max-w-2xl font-ge text-[1.04rem] leading-[1.72] sm:text-[1.08rem]"
          style={{ color: 'rgba(255,255,255,0.92)' }}
        >
          We run the same proven choreography for every Irish group — so the
          only thing you&rsquo;re thinking about by Tuesday lunch is the back nine.
        </m.p>
      </m.div>

      {/* —— Step cards — gold-rim forest cards on the dark base —— */}
      <m.div
        className="relative mt-16 grid gap-7 md:grid-cols-3"
        variants={cardStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {transportRouteStory.map((step, i) => (
          <m.article
            key={step.badge}
            variants={cardItem}
            className="group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-[#f4dfa6]/45 bg-[linear-gradient(135deg,#0d3a2a_0%,#0a2d20_50%,#08231a_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(217,190,122,0.12)] ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(0,0,0,0.6),0_0_36px_rgba(217,190,122,0.22)]"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={step.image}
                alt={step.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                width={1200}
                height={1500}
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
              />
              {/* Photo scrim — bottom-heavy so the badge reads cleanly */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04130c]/92 via-[#04130c]/35 to-transparent"
              />
              {/* Gold accent strip across photo bottom */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(217,190,122,0.55) 18%, #136047 38%, #f4dfa6 50%, #136047 62%, rgba(217,190,122,0.55) 82%, transparent 100%)'
                }}
              />
              {/* Gold step badge — was forest-on-dark, now gold-on-dark */}
              <span
                className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#f4dfa6]/55 bg-[#06150f]/80 px-3 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.2em] backdrop-blur-md shadow-[0_8px_18px_rgba(0,0,0,0.45)] sm:text-[0.74rem]"
                data-keep-color
                style={{ color: '#fbe8b5' }}
              >
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_10px_rgba(244,223,166,0.7)]"
                  style={{ backgroundColor: '#f4dfa6' }}
                />
                {step.badge}
              </span>
            </div>

            <div className="relative flex flex-1 flex-col px-6 pb-7 pt-6 sm:px-7 sm:pb-8 sm:pt-7">
              {/* Top hairline inside the card */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-[#f4dfa6]/45 to-transparent"
              />

              <h3
                className="font-ge text-[1.32rem] font-extrabold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-[1.5rem]"
                style={{ color: '#ffffff' }}
              >
                {step.title}
              </h3>
              <p
                className="mt-3 flex-1 font-ge text-[1rem] leading-[1.7] sm:text-[1.04rem]"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                {step.body}
              </p>

              {/* Bullet line — was text-brand-700 (forest = invisible);
                  now gold-cream so it actually reads on the dark card. */}
              <p
                className="mt-5 inline-flex items-center gap-2 border-t border-[#f4dfa6]/22 pt-4 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.16em] sm:text-[0.82rem]"
                data-keep-color
                style={{ color: '#fbe8b5' }}
              >
                <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {step.bullet}
              </p>
            </div>
          </m.article>
        ))}
      </m.div>

      {/* —— Aside line below the grid —— */}
      <m.p
        className="relative mt-12 flex items-center justify-center gap-2 font-ge text-[0.74rem] font-extrabold uppercase tracking-[0.22em] drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] sm:text-[0.78rem]"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
        style={{ color: 'rgba(255,255,255,0.85)' }}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden style={{ color: '#fbe8b5' }} />
        Málaga AGP → Marbella · Estepona · Sotogrande · Finca Cortesín
      </m.p>
    </GeSection>
  )
}
