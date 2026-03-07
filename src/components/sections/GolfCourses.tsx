'use client';

import Image from 'next/image';
import { COURSES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { SectionWave } from '@/components/ui/SectionWave';

/* Generated graphics: Costa del Sol golf — main, overlap bottom-right, overlap top-left */
const COURSE_IMAGE = '/golf-courses-main.jpg';
const COURSE_IMAGE_2 = '/golf-courses-overlap-1.jpg';
const COURSE_IMAGE_3 = '/golf-courses-overlap-2.jpg';

export function GolfCourses() {
  return (
    <section id="courses" className="py-24 md:py-32 pb-20 bg-surface-alt relative overflow-hidden" aria-labelledby="courses-heading">
      <div className="blob-animate absolute top-0 right-0 w-[300px] h-[280px] rounded-[50%_50%_45%_55%_/_55%_45%_50%_50%] bg-green-fairway opacity-50 -translate-y-20 translate-x-16 z-0" aria-hidden />
      <div className="blob-animate absolute bottom-0 left-0 w-[200px] h-[180px] rounded-[55%_45%_50%_50%_/_50%_55%_45%_55%] bg-green-mid opacity-40 z-0" aria-hidden style={{ animationDelay: '-4s' }} />
      <Container className="relative z-10">
        {/* Eyebrow + headline block */}
        <div className="reveal text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="section-label">70+ courses · One region</span>
          <h2 id="courses-heading" className="section-title text-primary mt-1">
            Choose your Costa del Sol golf courses
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Between Málaga and Gibraltar — the highest concentration in Europe. Preferential rates and tee times on all of them.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-12 lg:gap-16">
          {/* Image stack: main image tilted + overlapping smaller image */}
          <div className="reveal flex-shrink-0 relative order-2 lg:order-1 lg:w-[45%] flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div
                className="relative w-[85%] mx-auto lg:mx-0 lg:ml-auto aspect-[4/5] rounded-2xl overflow-hidden shadow-card border-4 border-white rotate-[-2deg] transition-transform duration-slow hover:rotate-0 hover:shadow-cardHover"
                aria-hidden
              >
                <Image
                  src={COURSE_IMAGE}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 85vw, 45vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-normal pointer-events-none" />
              </div>
              <div
                className="absolute bottom-0 right-0 lg:right-[-8%] w-[50%] aspect-[3/4] rounded-xl overflow-hidden shadow-cardHover border-4 border-white rotate-[4deg] transition-transform duration-slow hover:rotate-2 hover:scale-[1.02] z-10"
                aria-hidden
              >
                <Image
                  src={COURSE_IMAGE_2}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 45vw, 22vw"
                />
              </div>
              {/* Third image: small card with white border */}
              <div
                className="absolute top-[15%] left-0 lg:left-[-5%] w-[38%] aspect-[4/3] rounded-xl overflow-hidden shadow-card border-4 border-white rotate-[-3deg] transition-transform duration-slow hover:rotate-0 hover:scale-[1.02] z-10"
                aria-hidden
              >
                <Image
                  src={COURSE_IMAGE_3}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 38vw, 18vw"
                />
              </div>
              {/* Decorative "70+" badge */}
              <div className="absolute top-4 left-4 lg:left-0 bg-primary text-white px-4 py-2 rounded-lg shadow-card z-20">
                <span className="font-display font-black text-2xl leading-none">70+</span>
                <span className="block text-[10px] uppercase tracking-wider font-semibold opacity-90">courses</span>
              </div>
            </div>
          </div>

          {/* Content: course cards + CTA */}
          <div className="reveal order-1 lg:order-2 flex-1 min-w-0">
            <p className="text-base text-muted leading-relaxed mb-6">
              Championship layouts and coastal rounds. We have access to every course — Costa del Sol only.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 md:gap-4 mb-6">
              {COURSES.map((c) => (
                <div
                  key={c.name}
                  className="group flex items-start gap-4 rounded-xl bg-white/80 hover:bg-white p-4 md:p-5 border border-border/50 hover:border-primary/25 hover:shadow-card transition-all duration-200"
                >
                  <span className="flex-shrink-0 w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors" aria-hidden>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold text-primary text-sm md:text-base">
                      {c.name}
                    </p>
                    <p className="text-sm text-muted mt-1 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted mb-6">
              …and many more. Tell us your dates and we&apos;ll suggest the best fit.
            </p>
            <Button href="#contact" variant="primary" size="md">
              Request your itinerary
            </Button>
          </div>
        </div>
      </Container>
      <SectionWave fill="#F5F0E8" />
    </section>
  );
}

