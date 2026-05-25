import { m, type Variants } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { aboutCopy } from '../data/copy'
import { brandLogoAssetUrl, GOLFSOL_BRAND_LOGO_SOURCE } from '../../../lib/brand-logo-assets'
import { useHomepageTestLogo } from '../../../providers/homepagetest-variant'
import { cx } from '../../../lib/utils'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

const heroContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } }
}

const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.46, ease: 'easeOut' } }
}

function AboutTitle() {
  const t = aboutCopy.title
  const idx = t.indexOf('GolfSol')
  if (idx === -1) {
    return (
      <h2 className="font-ge text-[2.05rem] font-extrabold uppercase leading-[1.06] tracking-[0.02em] text-gs-dark sm:text-[2.55rem]">
        {t}
      </h2>
    )
  }
  const before = t.slice(0, idx)
  const after = t.slice(idx + 'GolfSol'.length)
  return (
    <h2 className="font-ge text-[2.05rem] font-extrabold uppercase leading-[1.06] tracking-[0.02em] sm:text-[2.55rem]">
      <span className="text-gs-dark">{before}</span>
      <span className="relative inline-block text-gs-green">
        GolfSol
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-brand-800/30 via-brand-700 to-brand-700/30 sm:-bottom-1.5"
        />
      </span>
      <span className="text-gs-dark">{after}</span>
    </h2>
  )
}

export function GeAboutBlock() {
  const testLogo = useHomepageTestLogo()
  const logoSrc = testLogo?.png ?? brandLogoAssetUrl(GOLFSOL_BRAND_LOGO_SOURCE)
  const logoW = testLogo?.width ?? 1020
  const logoH = testLogo?.height ?? 1468

  return (
    <GeSection
      background="soft"
      className="relative isolate overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-24"
      innerClassName="relative z-[1]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-gs-green/[0.08] blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-700/[0.14] blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-700/40 to-transparent"
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:gap-14">
        {/* —— Left: photo plate with solid brand logo card (no glass) —— */}
        <m.div className="relative order-2 lg:order-1" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.04 }}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 rounded-[2.15rem] bg-gradient-to-br from-brand-800/22 via-transparent to-gs-green/18 opacity-70 sm:-inset-4"
          />
          <div className="relative overflow-hidden rounded-[2rem] border border-gs-green/15 bg-gs-dark shadow-[0_28px_70px_rgba(6,59,42,0.25)] ring-1 ring-white/12">
            <div className="relative isolate aspect-[4/5] min-h-[460px] w-full sm:aspect-[5/6] sm:min-h-[520px] lg:aspect-[4/5] lg:min-h-[560px]">
              <img
                src={aboutCopy.image}
                alt="Irish golfer on a sunlit Costa del Sol fairway — GolfSol Ireland's home corridor."
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Lighter scrim — readable, but the photo is no longer drowned. */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#06150f]/85 via-[#06150f]/35 to-transparent"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_55%,rgba(0,0,0,0.32),transparent_72%)]"
              />
              {/* Premium gold + forest accent strip across bottom */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[3px]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(217,190,122,0.45) 14%, #136047 38%, #f4dfa6 50%, #136047 62%, rgba(217,190,122,0.45) 86%, transparent 100%)'
                }}
              />

              <div className="absolute inset-0 z-[1] flex flex-col items-center justify-end px-5 pb-10 pt-12 sm:px-10 sm:pb-14 sm:pt-16">
                {/* Solid cream brand plate — gold rim, chrome ring, no glass.
                    Cream surface lets the dark forest elements of the crest read clearly. */}
                <m.div
                  className="relative rounded-[1.5rem] border-2 border-[#d9be7a]/70 bg-gradient-to-br from-white via-[#fbf6e9] to-[#efe6cd] p-5 shadow-[0_28px_64px_rgba(0,0,0,0.45),0_0_32px_rgba(217,190,122,0.35)] ring-1 ring-chrome-300/80 sm:p-7"
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.12 }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#d9be7a]/75 to-transparent"
                  />
                  <img
                    src={logoSrc}
                    alt="GolfSol Ireland"
                    width={logoW}
                    height={logoH}
                    loading="lazy"
                    decoding="async"
                    className={cx(
                      'block h-auto max-w-full select-none object-contain drop-shadow-[0_8px_22px_rgba(6,32,22,0.22)]',
                      testLogo
                        ? 'w-[min(46vw,200px)] sm:w-[min(34vw,240px)]'
                        : 'w-[min(46vw,180px)] sm:w-[min(34vw,220px)]'
                    )}
                  />
                </m.div>

                <p
                  style={{ color: '#ffffff' }}
                  className="mt-6 max-w-[20rem] text-center font-ge text-[0.78rem] font-extrabold uppercase leading-relaxed tracking-[0.18em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] sm:mt-7 sm:max-w-none sm:text-[0.86rem]"
                >
                  {aboutCopy.imageTagline}
                </p>

                <ul className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-2.5">
                  {aboutCopy.imageStats.map((label) => (
                    <li
                      key={label}
                      style={{ color: '#ffffff' }}
                      className="inline-flex items-center rounded-full border border-white/50 bg-[#06150f]/75 px-3 py-1 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] shadow-[0_0_18px_rgba(217,190,122,0.18)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] sm:text-[0.72rem]"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </m.div>

        {/* —— Right: copy card —— */}
        <m.div
          className="relative order-1 lg:order-2"
          variants={heroContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="relative rounded-[1.85rem] border border-gs-green/12 bg-white p-7 shadow-[0_22px_55px_rgba(6,59,42,0.08)] ring-1 ring-chrome-300/70 sm:p-9 lg:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-700 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 top-24 h-40 w-40 rounded-full bg-brand-700/[0.06] blur-3xl"
            />

            <m.span
              variants={heroItemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-brand-700/30 bg-gs-green/[0.06] px-3.5 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-gs-green sm:text-[0.72rem]"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {aboutCopy.eyebrow}
            </m.span>

            <m.span
              aria-hidden="true"
              variants={heroItemVariants}
              className="mt-4 block h-1 w-12 rounded-full bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700"
            />

            <m.div variants={heroItemVariants} className="mt-6">
              <AboutTitle />
            </m.div>

            <m.p
              variants={heroItemVariants}
              className="mt-5 max-w-2xl font-ge text-[0.94rem] font-semibold uppercase tracking-[0.16em] text-gs-green sm:text-[1rem]"
            >
              {aboutCopy.lead}
            </m.p>

            <div className="mt-7 space-y-5 border-l-2 border-gs-green/30 pl-5 sm:space-y-6 sm:pl-6">
              {aboutCopy.paragraphs.map((paragraph, i) => (
                <m.p
                  key={paragraph}
                  className="font-ge text-[1.04rem] leading-[1.72] text-gs-dark/85 sm:text-[1.08rem]"
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: 0.06 * i, ease: 'easeOut' }}
                >
                  {paragraph}
                </m.p>
              ))}
            </div>

            <m.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.18 }}
              className="mt-6 font-ge text-[1.04rem] font-extrabold uppercase tracking-[0.06em] text-gs-dark sm:text-[1.08rem]"
            >
              {aboutCopy.bodyEmphasis}
            </m.p>

            {/* CTA row — button + aside stacked at every breakpoint so the
                aside line ("Málaga to Sotogrande · One crew") can never
                overflow the card. The chrome rule + aligned column give the
                section a deliberate, magazine-style sign-off. */}
            <div className="mt-10 flex flex-col items-start gap-5 border-t border-gs-green/15 pt-8">
              <GeButton href="/contact" variant="gs-green" size="lg" className="w-full sm:w-auto">
                {aboutCopy.cta}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </GeButton>

              <div className="flex w-full items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-gradient-to-r from-gs-green/35 via-gs-green/15 to-transparent"
                />
                <p className="break-words font-ge text-[0.7rem] font-extrabold uppercase leading-snug tracking-[0.14em] text-gs-green sm:text-[0.74rem]">
                  {aboutCopy.ctaAside}
                </p>
              </div>
            </div>
          </div>
        </m.div>
      </div>
    </GeSection>
  )
}
