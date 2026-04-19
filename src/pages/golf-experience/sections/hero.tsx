import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { heroCopy } from '../data/copy'

const heroBg =
  'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=2200&q=80'

export function GeHero() {
  return (
    <section
      className="relative isolate flex min-h-[88vh] items-center justify-center overflow-hidden bg-ge-ink text-white"
      aria-labelledby="ge-hero-title"
      id="top"
    >
      {/* Hero background image — eager-loaded as it's LCP. */}
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        decoding="async"
      />
      {/* Scrim for AA contrast on title text */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.42)_45%,rgba(0,0,0,0.6)_100%)]"
      />
      {/* Centered radial scrim to lift the H1 above the bright sky */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.18)_45%,transparent_70%)]"
      />

      <motion.div
        className="relative z-20 mx-auto flex max-w-[1180px] flex-col items-center px-6 pb-24 pt-32 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h1
          id="ge-hero-title"
          className="font-ge text-3xl font-extrabold uppercase leading-tight tracking-[0.04em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl lg:text-[3.6rem]"
        >
          {heroCopy.title}
        </h1>

        <p className="mt-6 max-w-2xl font-ge text-base text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] md:text-lg">
          Tailor-made golf trips for groups, couples, and societies — built around your dates,
          your courses, and your accommodation.
        </p>

        <div className="mt-9">
          <GeButton href="#enquire" variant="blue" size="lg">
            {heroCopy.cta}
          </GeButton>
        </div>
      </motion.div>

      {/* Animated scroll-down chevron */}
      <motion.a
        href="#design-package"
        aria-label="Scroll to next section"
        className="absolute bottom-12 left-1/2 z-10 inline-flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white/80 text-white transition-colors hover:border-white hover:bg-white/15"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
      >
        <ChevronDown className="h-5 w-5" />
      </motion.a>
    </section>
  )
}
