import { m } from 'framer-motion'
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GeDualPhoneFinalCtaRow } from '../components/ge-dual-phone-contact'
import { contactInfo, finalCtaCopy } from '../data/copy'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
} as const

const PROMISES = [
  'Quote within 24 hours',
  'No booking fees',
  'One Irish team, start to finish'
] as const

export function GeFinalCta() {
  return (
    <section id="final-ask" className="ge-on-dark relative overflow-hidden bg-[#04291a] px-5 py-20 sm:px-8 sm:py-28">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(14,122,86,0.2),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1180px] text-center">
        <m.p className="font-ge text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-emerald-300" {...fadeUp}>
          Ready when you are
        </m.p>
        <m.h2
          className="mx-auto mt-4 max-w-4xl font-ge text-[2.2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-[3rem] lg:text-[3.4rem]"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.06 }}
        >
          {finalCtaCopy.title}
        </m.h2>
        <m.p
          className="mx-auto mt-5 max-w-2xl font-ge text-[1rem] leading-relaxed text-white/65 sm:text-[1.12rem]"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
        >
          Dates, how many of you, and where you want to stay. We reply with a clear plan — no obligation, no fees.
        </m.p>

        <m.div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.14 }}>
          {PROMISES.map((text) => (
            <span key={text} className="inline-flex items-center gap-2 font-ge text-[0.85rem] text-white/70">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={2} aria-hidden />
              {text}
            </span>
          ))}
        </m.div>

        <m.div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.18 }}>
          <GeButton href="/contact" variant="gs-green" size="lg">
            {finalCtaCopy.cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </GeButton>
          <a
            href={`tel:${contactInfo.phoneTel}`}
            className="inline-flex h-14 items-center justify-center gap-2.5 rounded-md border border-white/20 bg-white/[0.06] px-6 font-ge text-[0.9rem] font-semibold text-white backdrop-blur-sm transition-all hover:border-white/35 hover:bg-white/[0.1]"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {contactInfo.phoneDisplay}
          </a>
        </m.div>

        <m.div className="mt-8" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.22 }}>
          <GeDualPhoneFinalCtaRow />
        </m.div>
      </div>
    </section>
  )
}
