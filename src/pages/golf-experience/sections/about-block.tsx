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
    <GeSection background="gray" className="pt-16 pb-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <motion.div className="overflow-hidden rounded-sm shadow-[0_18px_40px_rgba(0,0,0,0.1)]" {...fadeUp}>
          <img
            src={aboutCopy.image}
            alt="Meet the Golf Experience team"
            loading="lazy"
            decoding="async"
            className="h-full max-h-[460px] w-full object-cover"
          />
        </motion.div>

        <motion.div {...fadeUp}>
          <p className="font-ge text-[0.85rem] font-bold uppercase tracking-[0.2em] text-ge-orange">
            {aboutCopy.eyebrow}
          </p>
          <h2 className="mt-3 font-ge text-[2rem] font-extrabold uppercase leading-tight tracking-[0.02em] text-ge-blue sm:text-[2.4rem]">
            {aboutCopy.title}
          </h2>
          <div className="mt-6 space-y-4">
            {aboutCopy.paragraphs.map((paragraph) => (
              <p key={paragraph} className="font-ge text-[0.98rem] leading-7 text-ge-gray500">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8">
            <GeButton href="#enquire" variant="outline-blue" size="md">
              {aboutCopy.cta}
            </GeButton>
          </div>
        </motion.div>
      </div>
    </GeSection>
  )
}
