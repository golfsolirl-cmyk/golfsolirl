import { m, type Variants } from 'framer-motion'
import { GeGoldDividerLineAbsoluteTop } from '../../../components/ge-gold-divider-line'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Clock,
  FileText,
  MapPin,
  MessageCircle,
  PhoneCall,
  Sparkles,
  Users
} from 'lucide-react'
import { IrishOwnedSeal } from '../components/irish-owned-seal'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { factsCopy } from '../data/copy'

const ctaSignalIcons: readonly LucideIcon[] = [Clock, Users, FileText]

const ctaContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05
    }
  }
}

const ctaItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }
  }
}

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
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-brand-700/[0.12] blur-[90px]"
      />

      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
        <m.div className="flex flex-col items-center text-center lg:items-start lg:text-left" {...fadeUp}>
          <div className="inline-flex flex-col items-center gap-3 lg:items-start">
            <p className="font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.22em] text-gs-green sm:text-[0.82rem]">
              {factsCopy.eyebrow}
            </p>
            <span
              aria-hidden="true"
              className="block h-1 w-14 rounded-full bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700 lg:mx-0"
            />
          </div>
          <h2 className="mt-6 max-w-[16ch] font-ge text-[2.05rem] font-extrabold uppercase leading-[1.05] tracking-[0.02em] text-gs-dark sm:text-[2.5rem] lg:max-w-none">
            {factsCopy.title}
          </h2>
          <div className="mt-10">
            <IrishOwnedSeal size={188} className="drop-shadow-[0_16px_40px_rgba(6,59,42,0.22)]" />
          </div>
        </m.div>

        <div className="flex flex-col gap-5 sm:gap-6">
          {factsCopy.pillars.map((pillar, index) => {
            const Icon = pillarIcons[index] ?? Users
            return (
              <m.article
                key={pillar.title}
                className="group relative overflow-hidden rounded-[1.65rem] border border-gs-green/10 bg-white p-6 shadow-[0_20px_50px_rgba(6,59,42,0.07)] ring-1 ring-gs-green/[0.04] transition-shadow duration-300 hover:shadow-[0_26px_60px_rgba(6,59,42,0.1)] sm:p-7"
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.05 * index }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-700/[0.06] blur-2xl transition-opacity group-hover:opacity-100"
                />
                <div
                  aria-hidden="true"
                  className="mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent"
                />
                <div className="relative flex gap-5 sm:items-start sm:gap-6">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#f4dfa6]/70 bg-gradient-to-br from-[#1a7a59] via-[#136047] to-[#0c3527] text-white shadow-[0_16px_36px_rgba(11,107,69,0.32),0_0_24px_rgba(217,190,122,0.28)] ring-2 ring-white/20 transition-transform duration-500 group-hover:scale-[1.04] sm:h-[3.75rem] sm:w-[3.75rem]">
                    <Icon
                      className="h-6 w-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.45)] sm:h-7 sm:w-7"
                      strokeWidth={2.4}
                      aria-hidden
                    />
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
              </m.article>
            )
          })}
        </div>
      </div>

      {/* —— Closing CTA panel — premium forest-gradient closer ——
          Replaces the previous flat white box with a magazine-style closer:
          editorial halo, kicker pill, two-tone headline, three trust signals,
          dual CTA (primary + WhatsApp), gold/chrome accents. —— */}
      <m.div
        className="ge-on-dark facts-cta relative z-[1] mt-20 overflow-hidden rounded-[2rem] border border-[#d9be7a]/45 bg-[linear-gradient(135deg,#0d3a2a_0%,#0a2d20_45%,#08231a_100%)] px-6 pb-12 pt-14 text-center shadow-[0_36px_90px_rgba(6,32,22,0.42),0_0_36px_rgba(217,190,122,0.18)] ring-1 ring-white/10 sm:px-12 sm:pb-14 sm:pt-16"
        variants={ctaContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Editorial halos behind the headline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,190,122,0.22),transparent_70%)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 bottom-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(11,107,69,0.32),transparent_72%)] blur-3xl"
        />
        <GeGoldDividerLineAbsoluteTop />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-16 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f4dfa6]/40 to-transparent"
        />

        <div className="relative">
          {/* Kicker pill */}
          <m.span
            variants={ctaItem}
            className="ge-on-dark-kicker inline-flex items-center gap-2 rounded-full border border-[#f4dfa6]/55 bg-forest-900 px-4 py-2 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.24em] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_24px_rgba(217,190,122,0.18)] sm:text-[0.74rem]"
            data-keep-color
            style={{ color: '#fbe8b5' }}
          >
            <Sparkles
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden
              style={{ color: '#fbe8b5' }}
            />
            {factsCopy.ctaKicker}
          </m.span>

          {/* Brand-green / gold accent bar */}
          <m.span
            aria-hidden="true"
            variants={ctaItem}
            className="mx-auto mt-6 h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent"
          />

          {/* Two-tone headline (white "Let us design your" + gold "perfect Costa del Sol golf trip.") */}
          <m.h3
            variants={ctaItem}
            className="mx-auto mt-6 max-w-3xl text-balance font-ge text-[1.85rem] font-extrabold uppercase leading-[1.06] tracking-[0.01em] drop-shadow-[0_3px_18px_rgba(0,0,0,0.55)] sm:text-[2.3rem] lg:text-[2.55rem]"
            style={{ color: '#ffffff' }}
          >
            <span style={{ color: '#ffffff' }}>Let us design your </span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #fff5cf 0%, #f4dfa6 45%, #d9be7a 100%)',
                color: 'transparent'
              }}
            >
              perfect Costa del Sol golf trip.
            </span>
          </m.h3>

          {/* Lead line */}
          <m.p
            variants={ctaItem}
            className="mx-auto mt-5 max-w-2xl font-ge text-[0.96rem] font-semibold uppercase tracking-[0.16em] drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] sm:text-[1.02rem]"
            style={{ color: '#ffffff' }}
          >
            {factsCopy.ctaLead}
          </m.p>

          {/* Trust-signal strip — three forest-tile chips */}
          <m.ul
            variants={ctaItem}
            className="mx-auto mt-9 grid max-w-3xl gap-3 sm:grid-cols-3 sm:gap-4"
          >
            {factsCopy.ctaSignals.map((signal, idx) => {
              const Icon = ctaSignalIcons[idx] ?? Clock
              return (
                <m.li
                  key={signal.label}
                  variants={ctaItem}
                  className="group relative overflow-hidden rounded-2xl border border-[#f4dfa6]/45 bg-forest-900 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_8px_22px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-0.5 sm:px-5 sm:py-5"
                >
                  <GeGoldDividerLineAbsoluteTop />
                  <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-3.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d9be7a]/55 bg-gradient-to-br from-[#1a7a59] via-[#136047] to-[#0c3527] shadow-[0_10px_22px_rgba(6,59,42,0.4),0_0_18px_rgba(217,190,122,0.25)] ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-[1.05] sm:h-11 sm:w-11"
                    >
                      <Icon
                        className="h-[1.05rem] w-[1.05rem] text-white sm:h-[1.2rem] sm:w-[1.2rem]"
                        strokeWidth={2.2}
                        aria-hidden
                      />
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <p
                        className="font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.16em] sm:text-[0.84rem]"
                        style={{ color: '#fbe8b5' }}
                      >
                        {signal.label}
                      </p>
                      <p
                        className="mt-1 font-ge text-[0.86rem] leading-snug sm:text-[0.92rem]"
                        style={{ color: '#ffffff' }}
                      >
                        {signal.detail}
                      </p>
                    </div>
                  </div>
                </m.li>
              )
            })}
          </m.ul>

          {/* Dual-CTA row */}
          <m.div
            variants={ctaItem}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <GeButton href="/contact" variant="gs-green" size="lg" className="w-full sm:w-auto">
              {factsCopy.ctaLabel}
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </GeButton>

            <a
              href={factsCopy.ctaWhatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-md border-2 px-6 py-3 font-ge text-[0.86rem] font-extrabold uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-0.5 sm:w-auto sm:text-[0.92rem]"
              style={{
                borderColor: 'rgba(244, 223, 166, 0.6)',
                color: '#fbe8b5',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <MessageCircle
                className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110"
                aria-hidden
                style={{ color: '#5cf08c' }}
              />
              {factsCopy.ctaSecondaryLabel}
            </a>
          </m.div>

          {/* Aside line below CTAs */}
          <m.p
            variants={ctaItem}
            className="mt-7 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] sm:text-[0.76rem]"
            style={{ color: 'rgba(255, 255, 255, 0.85)' }}
          >
            {factsCopy.ctaAside}
          </m.p>
        </div>
      </m.div>
    </GeSection>
  )
}
