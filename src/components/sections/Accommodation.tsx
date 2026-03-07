'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ACCOMMODATIONS } from '@/lib/constants';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { SectionWave } from '@/components/ui/SectionWave';

export function Accommodation() {
  return (
    <section id="accommodation" className="py-24 md:py-32 pb-20 bg-cream relative overflow-hidden" aria-labelledby="accommodation-heading">
      {/* Soft gold / sand blobs for luxury feel */}
      <div className="blob-animate absolute w-[400px] h-[360px] -right-24 top-0 rounded-[55%_45%_60%_40%_/_50%_55%_45%_55%] bg-yellow/20 opacity-90 pointer-events-none z-0" aria-hidden style={{ animationDelay: '-6s' }} />
      <div className="blob-animate absolute w-[280px] h-[260px] bottom-20 left-0 rounded-[60%_40%_55%_45%_/_45%_55%_45%_55%] bg-green-pale/40 pointer-events-none z-0" aria-hidden style={{ animationDelay: '-2s' }} />
      <Container className="relative z-10">
        <div className="reveal text-center max-w-3xl mx-auto mb-14 md:mb-16">
          <span className="section-label">Where you&apos;ll stay</span>
          <h2 id="accommodation-heading" className="section-title text-primary mt-1">
            Choose your accommodation
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted leading-relaxed">
            Browse the highest-quality golf and beach hotels on the Costa del Sol. Preferential rates and better cancellation terms. We match where you stay to your trip and your courses.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {ACCOMMODATIONS.map((acc, i) => (
            <div
              key={acc.title}
              className="reveal group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-normal border border-border/50 hover:border-primary/20"
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={acc.image}
                  alt={acc.imageAlt}
                  fill
                  className="object-cover img-zoom"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-normal" aria-hidden />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 text-primary text-xs font-bold uppercase tracking-wider shadow-sm">
                  {acc.title}
                </span>
              </div>
              <div className="p-6 md:p-8">
                <h3 className="font-display font-bold text-primary text-lg uppercase tracking-tight">
                  {acc.title}
                </h3>
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  {acc.description}
                </p>
                <Link
                  href="#contact"
                  className="mt-5 inline-block text-sm font-bold uppercase text-primary tracking-wider hover:text-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-label={`Enquire about ${acc.title}`}
                >
                  Enquire →
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="reveal mt-12 text-center">
          <Button href="#contact" variant="outline" size="md">
            See where you&apos;ll stay — get a quote
          </Button>
        </div>
      </Container>
      <SectionWave fill="#C8DCF0" />
    </section>
  );
}
