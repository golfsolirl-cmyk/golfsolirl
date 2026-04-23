import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { transportPromiseStats } from '../data/transport-service'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

export type GeContentPromiseBandProps = {
  readonly eyebrow: string
  readonly title: string
  readonly body: string
  readonly bullets: readonly string[]
}

/**
 * Same magazine rhythm as {@link TransportPromise}: editorial left column,
 * four stat tiles on the right, confidence ticks across the copy block.
 */
export function GeContentPromiseBand({ eyebrow, title, body, bullets }: GeContentPromiseBandProps) {
  return (
    <GeSection
      id="ge-content-promise"
      background="white"
      innerClassName="!pt-16 pb-14 sm:!pt-20 sm:pb-16 scroll-mt-28"
    >
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <motion.div {...fadeUp}>
          <p className="font-ge text-[0.98rem] font-bold uppercase tracking-[0.16em] text-ge-orange sm:text-[0.9rem]">{eyebrow}</p>
          <h2 className="mt-3 font-ge text-[2.12rem] font-extrabold leading-[1.06] tracking-[0.005em] text-gs-green sm:text-[2.4rem] lg:text-[2.6rem]">{title}</h2>
          <p className="mt-5 font-ge text-[1.06rem] leading-8 text-ge-gray500 sm:text-[1.08rem] sm:leading-8">{body}</p>

          <ul className="mt-7 grid gap-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 font-ge text-[1.04rem] leading-8 text-gs-dark sm:text-[1.02rem]">
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
              <p className="font-ge text-[2.05rem] font-extrabold leading-none tracking-[-0.01em] text-gs-green sm:text-[2.4rem]">{stat.value}</p>
              <p className="mt-2 font-ge text-[0.95rem] font-bold uppercase tracking-[0.12em] text-ge-gray500 sm:text-[0.82rem]">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </GeSection>
  )
}
