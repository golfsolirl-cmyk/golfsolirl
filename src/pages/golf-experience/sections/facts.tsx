import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { MapPin, PhoneCall, Users } from 'lucide-react'
import { IrishOwnedSeal } from '../components/irish-owned-seal'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { factsCopy } from '../data/copy'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

const pillarIcons: readonly LucideIcon[] = [Users, MapPin, PhoneCall]

export function GeFacts() {
  return (
    <GeSection
      background="soft"
      className="relative isolate overflow-hidden pt-24 pb-20 sm:pt-28 sm:pb-24"
      innerClassName="relative z-[1]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-10 h-[min(100vw,28rem)] w-[min(100vw,28rem)] rounded-full bg-gs-green/[0.07] blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-gs-gold/[0.12] blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gs-green/20 to-transparent"
      />

      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
        <motion.div className="flex flex-col items-center text-center lg:items-start lg:text-left" {...fadeUp}>
          <div className="inline-flex flex-col items-center gap-3 lg:items-start">
            <p className="font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.22em] text-gs-green sm:text-[0.82rem]">
              {factsCopy.eyebrow}
            </p>
            <span
              aria-hidden="true"
              className="block h-1 w-14 rounded-full bg-gradient-to-r from-gs-gold via-gs-gold-light to-gs-gold lg:mx-0"
            />
          </div>
          <h2 className="mt-6 max-w-[16ch] font-ge text-[2.05rem] font-extrabold uppercase leading-[1.05] tracking-[0.02em] text-gs-dark sm:text-[2.5rem] lg:max-w-none">
            {factsCopy.title}
          </h2>
          <div className="mt-10">
            <IrishOwnedSeal size={188} className="drop-shadow-[0_16px_40px_rgba(6,59,42,0.22)]" />
          </div>
        </motion.div>

        <div className="flex flex-col gap-5 sm:gap-6">
          {factsCopy.pillars.map((pillar, index) => {
            const Icon = pillarIcons[index] ?? Users
            return (
              <motion.article
                key={pillar.title}
                className="group relative overflow-hidden rounded-[1.65rem] border border-gs-green/10 bg-white/95 p-6 shadow-[0_20px_50px_rgba(6,59,42,0.07)] ring-1 ring-gs-green/[0.04] transition-shadow duration-300 hover:shadow-[0_26px_60px_rgba(6,59,42,0.1)] sm:p-7"
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.05 * index }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gs-gold/[0.06] blur-2xl transition-opacity group-hover:opacity-100"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gs-gold/50 to-transparent opacity-70"
                />
                <div className="relative flex gap-5 sm:items-start sm:gap-6">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gs-gold/35 bg-gradient-to-br from-gs-green to-gs-dark text-gs-gold shadow-[0_12px_28px_rgba(11,107,69,0.35)] sm:h-[3.75rem] sm:w-[3.75rem]">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.25} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-ge text-[1.12rem] font-extrabold uppercase leading-snug tracking-[0.05em] text-gs-green sm:text-[1.22rem]">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 font-ge text-[1.02rem] leading-[1.65] text-ge-gray500 sm:text-[1.05rem]">
                      {pillar.body}
                    </p>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>

      <div className="relative z-[1] mt-16 rounded-[1.5rem] border border-gs-green/12 bg-white/90 px-6 py-10 text-center shadow-[0_18px_48px_rgba(6,59,42,0.06)] sm:px-10 sm:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gs-gold to-transparent"
        />
        <h3 className="mx-auto max-w-xl font-ge text-[1.65rem] font-extrabold uppercase leading-tight tracking-[0.04em] text-gs-dark sm:text-[1.95rem]">
          {factsCopy.ctaTitle}
        </h3>
        <GeButton href="/contact" variant="gs-gold" size="lg" className="mt-8">
          {factsCopy.ctaLabel}
        </GeButton>
      </div>
    </GeSection>
  )
}
