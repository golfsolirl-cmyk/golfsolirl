import { m, type Variants } from 'framer-motion'
import { Flag, Sparkles, ArrowRight } from 'lucide-react'
import { GeGoldDividerLine } from '../../../components/ge-gold-divider-line'
import { GeButton } from '../components/ge-button'
import { GeCourseCard } from '../components/course-card'
import { courseListsCopy } from '../data/copy'
import { coursesSpain } from '../data/courses'

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

export function GeCoursesSpain() {
  return (
    <section
      id="golf-courses-spain"
      aria-labelledby="golf-courses-spain-title"
      className="relative isolate overflow-hidden bg-cream text-gs-dark"
    >
      <div className="relative mx-auto max-w-[1180px] px-5 pb-24 pt-20 sm:px-8 sm:pt-24">
        <m.div
          className="mx-auto max-w-4xl text-center"
          variants={heroContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <m.span
            variants={heroItemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-brand-700/30 bg-white px-3.5 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-gs-green shadow-[0_8px_20px_rgba(6,59,42,0.06)] sm:text-[0.72rem]"
          >
            <Flag className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
            {courseListsCopy.kicker}
          </m.span>

          <m.h2
            id="golf-courses-spain-title"
            variants={heroItemVariants}
            className="mt-6 text-balance font-ge text-[1.85rem] font-extrabold leading-[1.12] tracking-[-0.02em] text-gs-dark sm:text-[2.35rem] lg:text-[2.55rem]"
          >
            <span className="text-gs-dark">Costa del Sol</span>{' '}
            <span className="text-gs-green">Golf courses</span>
          </m.h2>

          <GeGoldDividerLine className="mt-5" />

          <m.p
            variants={heroItemVariants}
            className="mt-5 text-balance font-ge text-[0.92rem] font-semibold uppercase tracking-[0.12em] text-gs-green sm:text-[0.98rem]"
          >
            {courseListsCopy.lead}
          </m.p>

          <m.p
            variants={heroItemVariants}
            className="mx-auto mt-5 max-w-3xl font-ge text-base leading-relaxed text-ge-gray500 sm:text-[1.06rem] sm:leading-8"
          >
            {courseListsCopy.body}{' '}
            <span className="font-semibold text-gs-dark">{courseListsCopy.bodyEmphasis}</span>
          </m.p>
        </m.div>

        <m.ul
          className="mx-auto mt-10 grid max-w-4xl list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3"
          variants={heroContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {courseListsCopy.signals.map((signal) => (
            <m.li
              key={signal.label}
              variants={heroItemVariants}
              className="rounded-2xl border border-ge-gray100 bg-white p-4 text-left shadow-[0_8px_24px_rgba(6,59,42,0.07)] transition-shadow duration-300 hover:shadow-[0_14px_36px_rgba(6,59,42,0.11)] sm:p-5"
            >
              <p className="flex items-start gap-2 font-ge text-[0.95rem] font-extrabold leading-snug text-gs-dark sm:text-[1rem]">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
                {signal.label}
              </p>
              <p className="mt-2 font-ge text-[0.92rem] leading-6 text-ge-gray500">
                {signal.detail}
              </p>
            </m.li>
          ))}
        </m.ul>

        <div className="relative mt-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[8%] top-0 hidden h-px bg-gradient-to-r from-transparent via-gs-dark/12 to-transparent lg:block"
          />
          <ul className="grid list-none gap-7 p-0 md:grid-cols-3">
            {coursesSpain.map((course, index) => (
              <m.li
                key={course.name}
                className="flex"
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.05 }}
              >
                <GeCourseCard course={course} />
              </m.li>
            ))}
          </ul>
        </div>

        <m.p
          {...fadeUp}
          className="mt-10 text-center font-ge text-base leading-8 text-ge-gray500 sm:text-[1.06rem]"
        >
          {courseListsCopy.manyMore}
        </m.p>

        <m.div
          {...fadeUp}
          className="mx-auto mt-10 flex max-w-3xl flex-col items-stretch gap-3 rounded-[1.5rem] border border-ge-gray100 bg-white px-5 py-6 text-center shadow-[0_16px_40px_rgba(6,59,42,0.08)] sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:px-8"
        >
          <GeButton href="/contact" variant="gs-green" size="md" className="w-full min-w-[12rem] sm:w-auto">
            {courseListsCopy.cta}
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </GeButton>
          <GeButton
            href="/#design-package"
            variant="outline-gs-green"
            size="md"
            className="w-full min-w-[12rem] sm:w-auto"
          >
            {courseListsCopy.secondaryCta}
          </GeButton>
        </m.div>
      </div>
    </section>
  )
}
