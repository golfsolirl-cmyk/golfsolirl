import { motion } from 'framer-motion'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { aboutCopy } from '../data/copy'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

export function GeAboutBlock() {
  return (
    <GeSection background="gray" className="pt-20 pb-20 sm:pt-24 sm:pb-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div
          className="relative isolate h-[min(460px,72vw)] w-full min-h-[280px] overflow-hidden rounded-sm shadow-[0_18px_40px_rgba(0,0,0,0.1)] sm:h-[min(460px,56vw)] sm:min-h-[320px] lg:h-[420px]"
          {...fadeUp}
        >
          <img
            src={aboutCopy.image}
            alt="Sunlit golf fairways on the Costa del Sol"
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 z-[1] bg-gradient-to-br from-black/55 via-black/25 to-[#0a2e12]/50"
            aria-hidden
          />
          <div className="relative z-[2] flex h-full w-full items-center justify-center p-8">
            <div className="-rotate-[3.5deg] rounded-full bg-white/92 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-[3px] ring-white/70 ring-offset-4 ring-offset-black/20 backdrop-blur-[2px] sm:p-7">
              <img
                src="/golf-sol-ireland-logo.svg"
                alt="GolfSol Ireland"
                width={220}
                height={120}
                loading="lazy"
                decoding="async"
                className="h-auto w-[min(72vw,220px)] max-w-full object-contain sm:w-[min(56vw,240px)]"
              />
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeUp}>
          <p className="font-ge text-sm font-bold uppercase tracking-[0.2em] text-ge-orange sm:text-[0.85rem]">
            {aboutCopy.eyebrow}
          </p>
          <h2 className="mt-4 font-ge text-[2.2rem] font-extrabold uppercase leading-[1.08] tracking-[0.01em] text-gs-green sm:text-[2.6rem]">
            {aboutCopy.title}
          </h2>
          <div className="mt-6 space-y-4">
            {aboutCopy.paragraphs.map((paragraph) => (
              <p key={paragraph} className="font-ge text-base leading-7 text-ge-gray500 sm:text-[1rem]">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-10">
            <GeButton href="/contact" variant="gs-gold" size="lg">
              {aboutCopy.cta}
            </GeButton>
          </div>
        </motion.div>
      </div>
    </GeSection>
  )
}
