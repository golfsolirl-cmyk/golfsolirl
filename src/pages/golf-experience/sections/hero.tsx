import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { handleScrollToFormTarget } from '../../../lib/scroll-to-form-target'

/**
 * Hero displays the brand Málaga → Costa del Sol creative at 2:1
 * (`public/images/hero-sample-sunny-mercedes-03.webp`, PNG fallback)
 * directly under the white navbar.
 *
 * The image is fully self-contained: headline, CTA, checklist, 24/7 seal,
 * phone number, and wayfinding badges are all part of the composition.
 */
export function GeHero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-gs-dark"
      aria-labelledby="ge-hero-title"
      id="top"
    >
      {/* Spacer for the fixed navbar — sized to match the larger sticky
          crest heights (mobile 110px + py-1.5 ≈ 134px; md peaks at 152px;
          lg shrinks back so the desktop nav menu fits comfortably). */}
      <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />

      <div className="relative w-full">
        <picture>
          <source type="image/webp" srcSet="/images/hero-sample-sunny-mercedes-03.webp" />
          <img
            src="/images/hero-sample-sunny-mercedes-03.png"
            alt="GolfSol Ireland — From plane to fairway. Meet-and-greet at Málaga, golf-bag friendly Mercedes transfers, tee times pre-booked. Call +353 87 446 4766."
            className="block h-auto w-full select-none"
            fetchPriority="high"
            decoding="async"
            width={1600}
            height={800}
          />
        </picture>

        {/* Hidden semantic H1 for SEO + AA — the visible headline lives in
            the composed image as raster art. */}
        <h1 id="ge-hero-title" className="sr-only">
          From Plane to Fairway — GolfSol Ireland Málaga to Costa del Sol golf transfers
        </h1>

        {/* Animated scroll-down chevron, anchored to the right edge so it
            doesn't collide with the phone number on portrait mobile. */}
        <motion.a
          href="#design-package"
          onClick={(event) => handleScrollToFormTarget(event, '#design-package')}
          aria-label="Scroll to next section"
          className="absolute bottom-4 right-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/85 bg-gs-dark/55 text-white backdrop-blur-md transition-colors hover:border-gs-gold hover:bg-gs-dark/75 hover:text-gs-gold md:bottom-6 md:left-1/2 md:right-auto md:h-12 md:w-12 md:-translate-x-1/2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.a>
      </div>
    </section>
  )
}
