'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { SectionWave } from '@/components/ui/SectionWave';

const MAIN_IMAGE =
  'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&q=85';
const SECOND_IMAGE =
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=320&q=85';

/**
 * Costa del Sol only — Visual Storyteller: expertise + place.
 * Narrative: "They know this region." Editorial collage = crafted; badge "We do the rest!" = confidence.
 * See docs/VISUAL-NARRATIVE.md.
 */
export function RepeatHeadline() {
  return (
    <section
      id="costa-del-sol"
      className="py-24 md:py-32 pb-20 bg-background relative overflow-hidden"
      aria-labelledby="costa-del-sol-heading"
    >
      {/* Bold decorative shape instead of tiny motifs — gives the section a focal anchor */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -right-[20%] w-[70%] max-w-[700px] h-[140%] min-h-[500px] rounded-[50%_30%_60%_40%] bg-primary opacity-[0.06] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-yellow opacity-[0.08] -translate-x-1/2 translate-y-1/2 pointer-events-none"
        aria-hidden
      />

      <Container className="grid md:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
        <div className="reveal">
          <span className="section-label dark:text-[#2d6b3a]">Design your golf package</span>
          <h2 id="costa-del-sol-heading" className="section-title">Costa del Sol — only</h2>
          <span className="section-script">
            courses, accommodation & transfers for Irish golfers
          </span>
          <p className="text-base text-muted leading-relaxed mb-7">
            The Costa del Sol has more than 70 golf courses — the highest
            density in Europe — between Málaga and Gibraltar. We have
            preferential green-fee rates and access to tee times across the
            region. We only do Costa del Sol, so we&apos;re the specialists for
            Irish golfers who want to play there.
          </p>
          <p className="text-base text-muted leading-relaxed mb-7">
            Choose your dates. We suggest courses and accommodation. You
            receive a custom itinerary. Then you fly and play.
          </p>
          <Button href="#contact" variant="primary" size="md">
            Enquire now
          </Button>
        </div>

        {/* Editorial-style image collage: overlapping tilted frames + badge */}
        <div
          className="reveal reveal-delay-1 relative flex justify-center items-center min-h-[340px] md:min-h-[420px]"
          aria-hidden
        >
          <div className="repeat-headline-collage relative w-full max-w-[420px]">
            {/* Main image — tilted left, shadow, rounded */}
            <div className="relative w-full aspect-[4/3] max-h-[320px] md:max-h-[380px] rounded-2xl overflow-hidden shadow-xl border-4 border-white rotate-[-4deg] transition-transform duration-300 hover:rotate-[-2deg] hover:scale-[1.02]">
              <Image
                src={MAIN_IMAGE}
                alt="Costa del Sol golf course at golden hour, fairway and sea view."
                fill
                className="object-cover"
                sizes="(max-width: 768px) 90vw, 420px"
              />
            </div>
            {/* Secondary image — overlapping, tilted right */}
            <div className="absolute bottom-0 left-0 w-[42%] aspect-square rounded-xl overflow-hidden shadow-lg border-4 border-white rotate-[8deg] translate-x-2 -translate-y-4 transition-transform duration-300 hover:rotate-[10deg] hover:scale-105">
              <Image
                src={SECOND_IMAGE}
                alt="Golf holiday in the sun, Mediterranean coast."
                fill
                className="object-cover"
                sizes="180px"
              />
            </div>
            {/* "We do the rest!" — ribbon/badge overlapping main */}
            <div
              className="absolute -bottom-2 -right-2 md:right-2 bg-yellow text-primary font-script text-lg md:text-xl font-bold text-center leading-snug py-3 px-5 rounded-tl-2xl rounded-br-2xl shadow-lg rotate-3 border-2 border-white/80"
              aria-hidden
            >
              We do the rest!
            </div>
          </div>
        </div>
      </Container>

      <SectionWave variant="cream" />
    </section>
  );
}
