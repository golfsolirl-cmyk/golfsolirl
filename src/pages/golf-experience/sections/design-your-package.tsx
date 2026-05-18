import { m, type Variants } from 'framer-motion'
import { ArrowRight, MapPin, Sparkles } from 'lucide-react'
import { GeAlreadyBookedFlightPanel } from '../components/already-booked-flight-panel'
import { TriangleDivider } from '../components/triangle-divider'
import { designYourPackage, homeTripSnapshotBand } from '../data/copy'

interface StepCard {
  readonly badge: string
  readonly title: string
  readonly body: string
  readonly image: string
  readonly link: string
}

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

const heroContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } }
}

const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: 'easeOut' } }
}

export function GeDesignYourPackage() {
  const steps: readonly StepCard[] = [
    {
      badge: designYourPackage.step1.eyebrow,
      title: designYourPackage.step1.title,
      body: designYourPackage.step1.body,
      image: designYourPackage.step1.image,
      link: designYourPackage.step1.link
    },
    {
      badge: designYourPackage.step2.eyebrow,
      title: designYourPackage.step2.title,
      body: designYourPackage.step2.body,
      image: designYourPackage.step2.image,
      link: designYourPackage.step2.link
    },
    {
      badge: designYourPackage.step3.eyebrow,
      title: designYourPackage.step3.title,
      body: designYourPackage.step3.body,
      image: designYourPackage.step3.image,
      link: designYourPackage.step3.link
    },
    {
      badge: designYourPackage.step4.eyebrow,
      title: designYourPackage.step4.title,
      body: designYourPackage.step4.body,
      image: designYourPackage.step4.image,
      link: designYourPackage.step4.link
    }
  ]

  return (
    <section
      id="design-package"
      aria-labelledby="design-package-title"
      className="relative overflow-hidden bg-[#eef2ef] text-gs-dark"
    >
      <TriangleDivider fill="#eef2ef" position="top" variant="layered" height={72} className="z-[1]" />

      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 8% 0%, rgba(19,96,71,0.22), transparent 30%), radial-gradient(circle at 92% 12%, rgba(217,190,122,0.14), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(246,240,226,0.98) 38%, rgba(235,227,207,0.97) 100%)'
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[4.5rem] h-px origin-center bg-gradient-to-r from-transparent via-brand-700/55 to-transparent sm:top-[5.25rem]"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-32 h-56 w-[min(70rem,90vw)] -translate-x-1/2 rounded-full bg-gs-dark/[0.07] blur-3xl"
      />

      <m.div
        className="relative mx-auto max-w-[1180px] px-5 pb-24 pt-20 sm:px-8 sm:pt-24"
        {...fadeUp}
      >
        <m.div
          className="design-package-hero relative overflow-hidden rounded-[2rem] border border-white/30 bg-[linear-gradient(128deg,var(--brand-800)_0%,#0f4f3c_42%,var(--brand-700)_100%)] px-6 py-10 text-center shadow-[0_32px_90px_rgba(11,77,59,0.32)] sm:px-10 sm:py-14"
          variants={heroContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_88%_100%,rgba(0,0,0,0.12),transparent_30%)]"
          />
          <m.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[6%] top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            variants={heroItemVariants}
          />
          <m.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-700/25 blur-2xl"
            variants={heroItemVariants}
          />

          <div className="relative">
            <m.span
              variants={heroItemVariants}
              className="design-package-hero-kicker inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-4 py-2 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.24em] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] sm:text-[0.72rem]"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
              {designYourPackage.kicker}
            </m.span>
            <m.h2
              id="design-package-title"
              variants={heroItemVariants}
              className="design-package-hero-title mx-auto mt-5 max-w-[18ch] text-balance font-ge text-[2.1rem] font-extrabold leading-[1.04] tracking-[-0.02em] drop-shadow-[0_4px_20px_rgba(0,0,0,0.24)] sm:max-w-4xl sm:text-[2.85rem] lg:text-[3.35rem]"
            >
              {designYourPackage.title}
            </m.h2>
            <m.p
              variants={heroItemVariants}
              className="design-package-hero-lead mx-auto mt-5 max-w-3xl text-balance font-ge text-[0.82rem] font-semibold uppercase tracking-[0.2em] text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)] sm:text-[0.94rem]"
            >
              {designYourPackage.lead}
            </m.p>
            <m.p
              variants={heroItemVariants}
              className="design-package-hero-body mx-auto mt-4 max-w-2xl font-ge text-[1.02rem] leading-[1.75] text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.16)] sm:text-[1.1rem] sm:leading-8"
            >
              {designYourPackage.closer}{' '}
              <span className="design-package-hero-body-emphasis font-semibold text-white">
                {designYourPackage.bodyEmphasis}
              </span>
            </m.p>
          </div>
        </m.div>

        <div className="relative mt-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[8%] top-0 hidden h-px bg-gradient-to-r from-transparent via-gs-dark/15 to-transparent lg:block"
          />
          <ol className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {steps.map((step, index) => (
              <m.li
                key={step.badge}
                className="group relative flex"
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.06 }}
              >
                <article className="relative flex flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/92 text-gs-dark shadow-[0_20px_50px_rgba(6,32,22,0.12)] ring-1 ring-chrome-300/80 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_64px_rgba(6,32,22,0.18)]">
                  <m.div
                    className="relative aspect-[16/10] overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  >
                    <img
                      src={step.image}
                      alt={step.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/75 via-gs-dark/18 to-transparent"
                    />
                    <span className="absolute left-3 top-3 inline-flex min-h-[34px] items-center rounded-full border border-brand-700/35 bg-white/95 px-3.5 py-1.5 font-ge text-[0.74rem] font-extrabold uppercase tracking-[0.14em] text-gs-dark shadow-[0_10px_26px_rgba(12,32,24,0.16)] sm:min-h-[32px] sm:py-1 sm:text-[0.72rem]">
                      {step.badge}
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-gs-dark/55 font-ge text-[0.82rem] font-extrabold text-white backdrop-blur-sm"
                    >
                      {index + 1}
                    </span>
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-5 bottom-4 h-px bg-gradient-to-r from-white/0 via-brand-700/90 to-white/0"
                    />
                  </m.div>
                  <div className="flex flex-1 flex-col p-5 sm:p-[1.35rem]">
                    <p className="font-ge text-[0.68rem] font-bold uppercase tracking-[0.24em] text-gs-green">
                      {designYourPackage.stepCardEyebrow}
                    </p>
                    <h3 className="mt-2 font-ge text-[1.18rem] font-extrabold leading-snug text-gs-dark sm:text-[1.22rem]">
                      {step.title}
                    </h3>
                    <p className="mt-3 flex-1 font-ge text-[0.98rem] leading-7 text-ge-gray500 sm:text-[0.96rem]">
                      {step.body}
                    </p>
                    <a
                      href={step.link}
                      className="mt-5 inline-flex min-h-[48px] items-center gap-2 self-start rounded-full border border-gs-dark/10 bg-gs-dark px-4 py-2.5 font-ge text-[0.88rem] font-bold uppercase tracking-[0.1em] text-white transition-all duration-300 hover:border-brand-700/50 hover:bg-brand-700 hover:text-gs-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 sm:min-h-[44px] sm:py-2 sm:text-[0.8rem]"
                    >
                      {designYourPackage.stepCta}
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                    </a>
                  </div>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-brand-800 via-[#136047] to-[#d9be7a] transition-transform duration-500 group-hover:scale-x-100"
                  />
                </article>
              </m.li>
            ))}
          </ol>
        </div>

        <m.div
          className="relative mx-auto mt-16 max-w-3xl overflow-hidden rounded-[1.5rem] border border-gs-dark/10 bg-white/94 px-6 py-6 text-center shadow-[0_22px_56px_rgba(6,59,42,0.1)] backdrop-blur-sm sm:px-8 sm:py-7"
          {...fadeUp}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[18%] top-0 h-px bg-gradient-to-r from-transparent via-brand-700/70 to-transparent"
          />
          <p className="inline-flex items-center justify-center gap-2 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-gs-green">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {homeTripSnapshotBand.title}
          </p>
          <p className="mt-3 font-ge text-sm font-medium leading-relaxed text-gs-dark/88 sm:text-[0.96rem] sm:leading-7">
            {homeTripSnapshotBand.body}
          </p>
        </m.div>

        <GeAlreadyBookedFlightPanel />
      </m.div>
    </section>
  )
}
