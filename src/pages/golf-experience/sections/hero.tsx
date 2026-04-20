import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

/**
 * Hero now displays the brand-composed Malaga → Costa del Sol creative
 * (`public/images/hero-malaga-transfers.{webp,jpg}`) at its native 2:1
 * aspect ratio, directly under the white navbar. The crest in the navbar
 * sits flush above the image's gold ribbon banner — same green / gold
 * palette, same shield/banner motifs — so they read as one unified piece.
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

      {/* Full-width brand creative. Two compositions:
          - Portrait 2:3 for narrow viewports (< 768px) — the headline,
            seal, badges, checklist + CTA all stack vertically and remain
            legible at phone width.
          - Landscape 2:1 for tablet+ (>= 768px) — hero-cinema scale. */}
      <div className="relative w-full">
        <picture>
          {/* Mobile portrait — preferred when viewport is narrow */}
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet="/images/hero-malaga-transfers-mobile-720.webp 720w, /images/hero-malaga-transfers-mobile.webp 1080w"
            sizes="100vw"
          />
          <source
            media="(max-width: 767px)"
            type="image/jpeg"
            srcSet="/images/hero-malaga-transfers-mobile-720.jpg 720w, /images/hero-malaga-transfers-mobile.jpg 1080w"
            sizes="100vw"
          />
          {/* Desktop / tablet landscape */}
          <source
            type="image/webp"
            srcSet="/images/hero-malaga-transfers-1600.webp 1600w, /images/hero-malaga-transfers.webp 2200w"
            sizes="100vw"
          />
          <source
            type="image/jpeg"
            srcSet="/images/hero-malaga-transfers-1600.jpg 1600w, /images/hero-malaga-transfers.jpg 2200w"
            sizes="100vw"
          />
          <img
            src="/images/hero-malaga-transfers.jpg"
            alt="GolfSol Ireland — From plane to fairway. Meet-and-greet at Malaga, golf-bag friendly Mercedes transfers, tee times pre-booked. Call +353 87 446 4766."
            className="block h-auto w-full select-none"
            fetchPriority="high"
            decoding="async"
            width={2200}
            height={1100}
          />
        </picture>

        {/* Hidden semantic H1 for SEO + AA — the visible headline lives in
            the composed image as raster art. */}
        <h1 id="ge-hero-title" className="sr-only">
          From Plane to Fairway — GolfSol Ireland Malaga to Costa del Sol golf transfers
        </h1>

        {/* Animated scroll-down chevron, anchored to the right edge so it
            doesn't collide with the phone number on portrait mobile. */}
        <motion.a
          href="#design-package"
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
