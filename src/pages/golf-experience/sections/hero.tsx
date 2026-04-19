import { motion } from 'framer-motion'
import { GeButton } from '../components/ge-button'
import { TriangleDivider } from '../components/triangle-divider'
import { heroCopy } from '../data/copy'

const heroBg =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=80'

export function GeHero() {
  return (
    <section
      className="relative isolate flex min-h-[78vh] items-center justify-center overflow-hidden bg-ge-ink text-white"
      aria-labelledby="ge-hero-title"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0.35)_60%,rgba(0,0,0,0.6))]"
      />

      <motion.div
        className="relative z-10 mx-auto flex max-w-[1180px] flex-col items-center px-6 py-20 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h1
          id="ge-hero-title"
          className="font-ge text-3xl font-extrabold uppercase leading-tight tracking-[0.04em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {heroCopy.title}
        </h1>

        <p className="mt-6 max-w-2xl font-ge text-base text-white/90 md:text-lg">
          Tailor-made golf trips for groups, couples, and societies — built around your dates,
          your courses, and your accommodation.
        </p>

        <div className="mt-8">
          <GeButton href="#enquire" variant="orange" size="lg">
            {heroCopy.cta}
          </GeButton>
        </div>
      </motion.div>

      <TriangleDivider fill="#ffffff" position="bottom" height={100} />
    </section>
  )
}
