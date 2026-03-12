'use client';

import { memo } from 'react';
import { Container } from '@/components/layout/Container';
import { SectionWave } from '@/components/ui/SectionWave';

/**
 * Statement — Visual Storyteller: confidence + calm. No image; type and space only.
 * "Sun. Fairways. No hassle." = three-word promise. See docs/VISUAL-NARRATIVE.md.
 */
export const Statement = memo(function Statement() {
  return (
    <section id="statement" className="py-20 md:py-24 pb-20 bg-background relative overflow-hidden" aria-labelledby="statement-heading">
      <Container className="text-center relative">
        <div className="reveal max-w-[680px] mx-auto">
          <span className="section-label">Step 1 — Let&apos;s tee off</span>
          <h2 id="statement-heading" className="section-title">Sun. Fairways. No hassle.</h2>
          <p className="text-base text-muted leading-relaxed mt-4">
            Costa del Sol only. We take care of tee times, accommodation, and transfers. You choose your dates and courses — then you fly and play.
          </p>
        </div>
      </Container>
      <SectionWave variant="surfaceAlt" />
    </section>
  );
});
