import { motion } from 'framer-motion'
import { ChevronDown, MapPin, Plane } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { heroCopy } from '../data/copy'

// Story diptych: Malaga arrival + Costa del Sol golf course.
// Composed as two side-by-side hero plates with a soft diagonal seam.
const heroLeft =
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1600&q=80'
const heroRight =
  'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1600&q=80'

export function GeHero() {
  return (
    <section
      className="relative isolate flex min-h-[92vh] items-center justify-center overflow-hidden bg-ge-ink text-white"
      aria-labelledby="ge-hero-title"
      id="top"
    >
      {/* ============== Story diptych: arrival → fairway ============== */}
      <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2">
        <div className="relative h-full overflow-hidden">
          <img
            src={heroLeft}
            alt=""
            className="h-full w-full scale-110 object-cover motion-safe:animate-[heroPanLeft_28s_ease-in-out_infinite_alternate]"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="relative h-full overflow-hidden">
          <img
            src={heroRight}
            alt=""
            className="h-full w-full scale-110 object-cover motion-safe:animate-[heroPanRight_28s_ease-in-out_infinite_alternate]"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
      {/* Diagonal seam blending the two plates */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(105deg,transparent_46%,rgba(10,32,8,0.55)_50%,transparent_54%)]"
      />
      {/* Vignette + readability scrim */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.35)_40%,rgba(0,0,0,0.7)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0)_55%)]"
      />

      {/* Plate labels */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        className="pointer-events-none absolute bottom-32 left-8 z-10 hidden max-w-[14rem] gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-2 backdrop-blur-md md:flex md:items-center"
      >
        <Plane className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
        <span className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white">
          Malaga Arrivals
        </span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
        className="pointer-events-none absolute bottom-32 right-8 z-10 hidden max-w-[16rem] gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-2 backdrop-blur-md md:flex md:items-center"
      >
        <MapPin className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
        <span className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white">
          Costa del Sol Tee-Off
        </span>
      </motion.div>

      {/* Story arrow connecting the two plates */}
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 320 60"
        className="absolute left-1/2 top-[44%] z-10 hidden h-12 w-72 -translate-x-1/2 md:block"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ delay: 1.0, duration: 0.7, ease: 'easeOut' }}
      >
        <defs>
          <linearGradient id="arrowGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0" />
            <stop offset="20%" stopColor="#fde68a" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path d="M10 30 L 280 30" stroke="url(#arrowGold)" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 8" />
        <path d="M270 14 L 305 30 L 270 46 Z" fill="#f59e0b" />
      </motion.svg>

      <motion.div
        className="relative z-20 mx-auto flex max-w-[1180px] flex-col items-center px-6 pb-28 pt-44 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 font-ge text-[0.7rem] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-md">
          <Plane className="h-3.5 w-3.5" aria-hidden="true" />
          We meet you at the airport &nbsp;·&nbsp; And off to the course
        </span>

        <h1
          id="ge-hero-title"
          className="font-ge text-3xl font-extrabold uppercase leading-tight tracking-[0.04em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] sm:text-4xl md:text-5xl lg:text-[3.6rem]"
        >
          {heroCopy.title}
        </h1>

        <p className="mt-6 max-w-2xl font-ge text-base text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] md:text-lg">
          Meet-and-greet at Malaga, transfers handled, tee times pre-booked. From baggage carousel
          to first fairway, your group is taken care of.
        </p>

        <div className="mt-9">
          <GeButton href="#enquire" variant="gold" size="lg">
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
