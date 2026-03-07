'use client';

import { Container } from '@/components/layout/Container';
import { SectionWave } from '@/components/ui/SectionWave';

export function Statement() {
  return (
    <section className="py-20 md:py-24 pb-20 bg-cream relative overflow-hidden" aria-label="Brand statement">
      <Container className="text-center relative">
        <div className="reveal max-w-[680px] mx-auto">
          <span className="section-label">Step 1 — Let&apos;s tee off</span>
          <h2 className="section-title">Sun. Fairways. No hassle.</h2>
          <p className="text-base text-muted leading-relaxed mt-4">
            Costa del Sol only. We take care of tee times, accommodation, and transfers. You choose your dates and courses — then you fly and play.
          </p>
        </div>
      </Container>
      <SectionWave fill="#C8DCF0" />
    </section>
  );
}
