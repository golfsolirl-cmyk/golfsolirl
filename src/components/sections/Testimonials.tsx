'use client';

import Image from 'next/image';
import { TESTIMONIALS } from '@/lib/constants';
import { Container } from '@/components/layout/Container';
import { SectionWave } from '@/components/ui/SectionWave';

function StarRating({ stars = 5 }: { stars?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${stars} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className="w-5 h-5 text-yellow"
          fill={i < (stars ?? 5) ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32 pb-20 bg-cream relative overflow-hidden" aria-labelledby="testimonials-heading">
      <Container className="relative">
        <div className="reveal text-center max-w-2xl mx-auto mb-14">
          <span className="section-label">Real stories</span>
          <h2 id="testimonials-heading" className="section-title text-primary mt-1">
            What Irish golfers say
          </h2>
          <p className="mt-4 text-base text-muted">
            Don&apos;t just take our word for it — hear from golfers who&apos;ve booked with us.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={i}
              className="reveal bg-white rounded-2xl p-8 shadow-card hover:shadow-cardHover transition-all duration-normal border border-border/50 flex flex-col"
            >
              <StarRating stars={t.stars} />
              <p className="mt-5 text-base text-muted leading-relaxed italic flex-1">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-6 flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-alt flex-shrink-0">
                  {t.avatar ? (
                    <Image
                      src={t.avatar}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <span className="flex w-full h-full items-center justify-center text-primary font-bold text-lg">
                      {t.author.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <cite className="not-italic font-bold text-primary">{t.author}</cite>
                  <p className="text-sm text-muted">{t.location}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
      <SectionWave fill="#123811" />
    </section>
  );
}
