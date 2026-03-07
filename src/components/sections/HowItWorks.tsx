'use client';

import Image from 'next/image';
import Link from 'next/link';
import { STEPS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { SectionWave } from '@/components/ui/SectionWave';

const STEP_SUBTITLES: Record<number, string> = {
  1: 'Tell us your dates',
  2: '70+ courses to choose from',
  3: 'Resorts & hotels we work with',
  4: 'We handle the rest',
};

const STEP_IMAGES: Record<number, { src: string; alt: string }> = {
  1: {
    src: '/images/choose-your-dates.jpg',
    alt: 'Beach and sun — choose your dates',
  },
  2: {
    src: '/images/choose-costa-del-sol-courses.jpg',
    alt: 'Golf course — choose your Costa del Sol courses',
  },
  3: {
    src: '/images/accommodation-step.jpg',
    alt: 'Resort — choose your accommodation',
  },
  4: {
    src: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&q=80',
    alt: 'Golf and coast — you fly and play',
  },
};

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&q=85';

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32 pb-20 bg-surface-alt relative overflow-hidden"
      aria-labelledby="how-heading"
    >
      {/* Decorative shapes — keep subtle but add one strong accent */}
      <div
        className="absolute top-0 right-0 w-[min(80%,420px)] h-72 bg-primary opacity-[0.05] rounded-bl-[40%] pointer-events-none z-0"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 bg-yellow opacity-[0.08] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none z-0"
        aria-hidden
      />

      <Container className="relative z-10">
        {/* Hero image block — editorial, sets the mood */}
        <div className="reveal mb-12 md:mb-16">
          <div className="relative w-full aspect-[21/9] min-h-[200px] max-h-[280px] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority={false}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"
              aria-hidden
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
              <span className="text-sm font-bold tracking-widest uppercase text-yellow/95">
                Simple as 1–2–3–4
              </span>
              <h2
                id="how-heading"
                className="font-display font-black uppercase text-2xl md:text-4xl leading-tight mt-1 drop-shadow-sm"
              >
                Plan your golf trip
              </h2>
              <p className="mt-2 text-sm md:text-base text-white/90 max-w-xl">
                Choose your dates. We suggest Costa del Sol courses and
                accommodation. You receive a custom itinerary. Then you fly and
                play.
              </p>
            </div>
          </div>
        </div>

        {/* Step cards — 2x2 grid on desktop, each card has image + content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {STEPS.map((step) => {
            const img = STEP_IMAGES[step.number];
            return (
              <div
                key={step.number}
                className="reveal how-it-works-card group"
              >
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-card border-2 border-transparent hover:shadow-cardHover hover:border-primary/20 transition-all duration-300 hover:-translate-y-2 flex flex-col min-h-[280px]">
                  {/* Card image strip */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-primary/5">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Step number badge on image */}
                    <span
                      className="absolute top-3 left-3 flex w-12 h-12 rounded-full bg-white text-primary items-center justify-center text-lg font-black shadow-lg border-2 border-white"
                      aria-hidden
                    >
                      {step.number}
                    </span>
                  </div>
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-primary text-base uppercase leading-snug">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted flex-1">
                      {STEP_SUBTITLES[step.number]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="reveal mt-12 text-center">
          <Link href="#contact" aria-label="Send golf trip enquiry">
            <Button variant="primary" size="md">
              Enquire now
            </Button>
          </Link>
        </div>
      </Container>
      <SectionWave fill="#F5F0E8" />
    </section>
  );
}
