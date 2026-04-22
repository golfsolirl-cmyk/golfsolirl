import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, Phone } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GeRentalBagEmbroideredLogo } from '../components/ge-rental-bag-embroidered-logo'
import { contactInfo } from '../data/copy'

export interface RentalEditorialHeroProps {
  readonly eyebrow: string
  readonly title: string
  readonly subtitle: string
  readonly heroImage: string
  readonly heroAlt: string
}

const ease = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
} as const

/**
 * Neutral editorial hero — white field, restrained typography, clear dual CTAs.
 */
export function RentalEditorialHero({ eyebrow, title, subtitle, heroImage, heroAlt }: RentalEditorialHeroProps) {
  return (
    <section
      className="relative isolate border-b border-neutral-200 bg-neutral-50 text-neutral-900"
      aria-labelledby="rental-clean-hero-heading"
      id="rental-top"
    >
      <div aria-hidden className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />

      <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pb-14 sm:pt-8 md:px-8 md:pb-16 md:pt-10">
        <div className="grid items-start gap-10 md:grid-cols-2 md:items-center md:gap-14 lg:gap-16">
          <motion.div {...ease} className="order-2 md:order-1">
            <p className="font-ge text-[0.68rem] font-bold uppercase tracking-[0.2em] text-neutral-500">{eyebrow}</p>
            <h1
              id="rental-clean-hero-heading"
              className="mt-3 font-ge text-[clamp(1.85rem,5.5vw,2.85rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-neutral-900"
            >
              {title}
            </h1>
            <p className="mt-4 max-w-xl font-ge text-[1.02rem] leading-relaxed text-neutral-600 sm:text-[1.06rem] sm:leading-7">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <GeButton href="#ge-enquiry-form" variant="ink" size="lg" className="w-full min-h-[52px] sm:w-auto sm:min-w-[220px]">
                Request rental options
                <ArrowRight className="h-4 w-4" aria-hidden />
              </GeButton>
              <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-ink" size="lg" className="w-full min-h-[52px] sm:w-auto">
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                <span className="whitespace-nowrap tabular-nums normal-case tracking-normal">
                  {contactInfo.phoneDisplay}
                </span>
              </GeButton>
            </div>

            <p className="mt-5 font-ge text-sm text-neutral-500">Irish-owned · Hotel delivery · Fast replies</p>

            <a
              href="#rental-content"
              className="mt-8 inline-flex items-center gap-2 font-ge text-sm font-semibold text-neutral-600 underline decoration-neutral-300 decoration-2 underline-offset-4 transition-colors hover:text-neutral-900"
            >
              How rental works
              <ArrowDown className="h-4 w-4 text-neutral-400" aria-hidden />
            </a>
          </motion.div>

          <motion.div {...ease} className="order-1 md:order-2">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm ring-1 ring-neutral-950/[0.04] sm:rounded-[1.35rem]">
              <div className="relative">
                <img
                  src={heroImage}
                  alt={heroAlt}
                  className="aspect-[5/4] w-full object-cover object-center sm:aspect-[16/10] md:min-h-[min(360px,44vh)] md:aspect-auto"
                  fetchPriority="high"
                  decoding="async"
                  width={2200}
                  height={1100}
                />
                <GeRentalBagEmbroideredLogo />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
