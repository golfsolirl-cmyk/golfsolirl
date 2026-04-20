import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { transportPromiseCopy, transportPromiseStats } from '../data/transport-service'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

/**
 * Editorial promise band that sits directly under the hero. Magazine layout:
 * eyebrow + big headline + lead on the left, four magazine-style stats on
 * the right, three confidence bullets across the bottom. White surface so
 * the gs-gray50 sections under it feel like a deliberate page rhythm.
 */
export function TransportPromise() {
  return (
    <GeSection
      id="transport-promise"
      background="white"
      innerClassName="!pt-16 pb-14 sm:!pt-20 sm:pb-16 scroll-mt-28"
    >
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <motion.div {...fadeUp}>
          <p className="font-ge text-sm font-bold uppercase tracking-[0.18em] text-ge-orange sm:text-[0.85rem]">
            {transportPromiseCopy.eyebrow}
          </p>
          <h2 className="mt-3 font-ge text-[2rem] font-extrabold leading-[1.08] tracking-[0.01em] text-gs-green sm:text-[2.4rem] lg:text-[2.6rem]">
            {transportPromiseCopy.title}
          </h2>
          <p className="mt-5 font-ge text-base leading-7 text-ge-gray500 sm:text-[1.05rem] sm:leading-8">
            {transportPromiseCopy.body}
          </p>

          <ul className="mt-7 grid gap-3">
            {transportPromiseCopy.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 font-ge text-base leading-7 text-gs-dark sm:text-[1rem]">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gs-green text-white shadow-sm">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
        >
          {transportPromiseStats.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-ge-gray100 bg-ge-gray50/80 p-5 shadow-[0_10px_30px_rgba(6,59,42,0.06)] sm:p-6"
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gs-gold via-gs-gold-light to-gs-gold"
              />
              <p className="font-ge text-[2rem] font-extrabold leading-none tracking-[-0.01em] text-gs-green sm:text-[2.4rem]">
                {stat.value}
              </p>
              <p className="mt-2 font-ge text-sm font-bold uppercase tracking-[0.14em] text-ge-gray500 sm:text-[0.8rem]">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </GeSection>
  )
}
