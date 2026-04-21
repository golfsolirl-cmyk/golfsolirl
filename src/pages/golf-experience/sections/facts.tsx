import { motion } from 'framer-motion'
import { IrishOwnedSeal } from '../components/irish-owned-seal'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { RBullet } from '../components/r-bullet'
import { factsCopy } from '../data/copy'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

export function GeFacts() {
  return (
    <GeSection background="white" className="pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="grid gap-12 lg:grid-cols-[0.45fr_0.55fr] lg:items-start">
        <motion.div className="flex flex-col items-center text-center lg:items-start lg:text-left" {...fadeUp}>
          <p className="font-ge text-sm font-bold uppercase tracking-[0.18em] text-ge-orange sm:text-[0.85rem]">
            {factsCopy.eyebrow}
          </p>
          <h2 className="mt-4 font-ge text-[2.2rem] font-extrabold uppercase leading-[1.08] tracking-[0.02em] text-gs-green sm:text-[2.8rem]">
            {factsCopy.title}
          </h2>
          <div className="mt-8">
            <IrishOwnedSeal
              size={180}
              className="drop-shadow-[0_12px_28px_rgba(6,59,42,0.28)]"
            />
          </div>
        </motion.div>

        <div className="flex flex-col gap-8">
          {factsCopy.pillars.map((pillar) => (
            <motion.div key={pillar.title} {...fadeUp}>
              <RBullet title={pillar.title}>{pillar.body}</RBullet>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-6 border-t border-ge-gray100 pt-14 text-center">
        <h3 className="font-ge text-[1.8rem] font-bold uppercase tracking-[0.04em] text-gs-green sm:text-[2rem]">
          {factsCopy.ctaTitle}
        </h3>
        <GeButton href="/contact" variant="orange" size="lg">
          {factsCopy.ctaLabel}
        </GeButton>
      </div>
    </GeSection>
  )
}
