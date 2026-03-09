'use client';

import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { SectionWave } from '@/components/ui/SectionWave';

/* SVG icons — dark green, used in step cards */
const IconDestination = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconGolf = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 22L20 22" />
    <path d="M12 22V12" />
    <path d="M12 12C12 12 16 8 20 6 20 10 16 12 12 12Z" />
    <path d="M12 12C12 12 8 8 4 6 4 10 8 12 12 12Z" />
  </svg>
);
const IconAccommodation = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 21h18" />
    <path d="M5 21V11l7-4 7 4v10" />
    <path d="M9 21v-6h6v6" />
  </svg>
);
const IconRest = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M5 21l2-6 2 2 2-6" />
    <path d="M19 21l-2-6-2 2-2-6" />
  </svg>
);

const DESIGN_STEPS = [
  { step: 1, title: 'Your chosen destination', subtitle: 'Costa del Sol', href: '#courses', Icon: IconDestination },
  { step: 2, title: 'Choose your golf course', subtitle: '70+ courses', href: '#courses', Icon: IconGolf },
  { step: 3, title: 'Choose your accommodation', subtitle: 'Hotels & resorts', href: '#accommodation', Icon: IconAccommodation },
  { step: 4, title: 'Let us do the rest!', subtitle: 'Custom itinerary', href: '#contact', Icon: IconRest },
];

/** Design Your Golf Package — 4 creative step cards with animation */
export function GolfPackages() {
  return (
    <section id="packages" className="py-24 md:py-32 pb-20 bg-background relative overflow-hidden" aria-labelledby="packages-heading">
      <div
        className="blob-animate absolute top-0 -right-20 w-[560px] h-[500px] bg-green-putting rounded-[40%_60%_55%_45%_/_50%_45%_55%_50%] opacity-90 z-0 pointer-events-none"
        aria-hidden
      />
      <div
        className="blob-animate absolute bottom-0 left-0 w-[320px] h-[300px] bg-green-lime rounded-[55%_45%_50%_50%_/_50%_55%_45%_55%] opacity-70 z-0 pointer-events-none"
        aria-hidden
        style={{ animationDelay: '-3s' }}
      />
      <Container className="relative z-10">
        {/* Intro: keep existing copy */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start mb-16">
          <div className="reveal">
            <span className="section-label">
              Your tailor-made golf holiday starts here
            </span>
            <h2 id="packages-heading" className="section-title text-primary">
              Golf packages
            </h2>
            <span className="font-script text-lg md:text-xl text-muted block mb-5">
              Choose your golf course. Choose your accommodation. Let us do the rest.
            </span>
            <p className="text-base text-muted leading-relaxed mb-7">
              Costa del Sol only. We handle tee times, hotels, and transfers. Pick one of our packages or tell us your dates and we’ll design an itinerary for you.
            </p>
            <Button href="#contact" variant="primary" size="md">
              Enquire now
            </Button>
          </div>
          {/* Design your golf package — simple cards, no step branding */}
          <div className="reveal reveal-delay-1">
            <h3 className="text-h3 font-display font-bold text-primary dark:text-[#2d6b3a] tracking-tight mb-6 text-center md:text-left">
              Design your golf package
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {DESIGN_STEPS.map((item) => (
                <Link
                  key={item.step}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-xl bg-white/80 hover:bg-white p-4 md:p-5 border border-border/50 hover:border-primary/25 hover:shadow-card transition-all duration-200 text-left"
                  aria-label={`${item.title}: ${item.subtitle}`}
                >
                  <span className="flex-shrink-0 w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors" aria-hidden>
                    <item.Icon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold text-primary text-sm md:text-base">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
      <SectionWave variant="cream" />
    </section>
  );
}
