'use client';

import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { SectionWave } from '@/components/ui/SectionWave';

const BULLETS = [
  { icon: '🚐', title: 'Mercedes Vans', text: 'Comfortable, air-conditioned, premium vehicles' },
  { icon: '🇮🇪', title: 'Irish Drivers', text: 'Your driver is Irish, knows the craic' },
  { icon: '💬', title: 'Managed Tips Welcome', text: 'No awkward moments' },
  { icon: '🛡️', title: 'Fully Insured', text: 'Peace of mind from the moment you land' },
  { icon: '✈️', title: 'Málaga Airport Pickup & Drop-off', text: 'Included in every package' },
];

/** Mercedes van icon — simple SVG for "animated driving" (CSS can add subtle motion) */
const VanIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 32" fill="none" aria-hidden>
    <rect x="4" y="12" width="40" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="var(--color-surface-raised)" />
    <rect x="44" y="10" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="var(--color-surface-raised)" />
    <circle cx="14" cy="26" r="3" fill="var(--color-text-muted)" />
    <circle cx="34" cy="26" r="3" fill="var(--color-text-muted)" />
    <circle cx="52" cy="26" r="3" fill="var(--color-text-muted)" />
  </svg>
);

export function Transfers() {
  return (
    <section id="transfers" className="py-24 md:py-32 pb-20 bg-surface-alt relative overflow-hidden" aria-labelledby="transfers-heading">
      <Container className="relative z-10">
        <div className="reveal text-center max-w-3xl mx-auto mb-12 md:mb-14">
          <span className="section-label">✈️ Transfers included</span>
          <h2 id="transfers-heading" className="section-title text-primary mt-1">
            Door to Door — Málaga Airport to the Course
          </h2>
          <div className="mt-8 flex justify-center">
            <span className="inline-block text-primary motion-safe:animate-pulse" style={{ animationDuration: '2s' }}>
              <VanIcon className="w-24 h-12 md:w-32 md:h-16 text-primary" />
            </span>
          </div>
        </div>
        <ul className="reveal grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          {BULLETS.map((item, i) => (
            <li key={item.title} className="flex gap-4 items-start p-4 rounded-xl bg-background/80 border border-border/50" style={{ transitionDelay: `${i * 0.05}s` }}>
              <span className="text-2xl md:text-3xl flex-shrink-0" aria-hidden>{item.icon}</span>
              <div>
                <h3 className="font-display font-bold text-primary text-lg">{item.title}</h3>
                <p className="text-muted text-sm md:text-base mt-1">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="reveal text-center font-script text-xl md:text-2xl text-primary mt-10 md:mt-12">
          Land at Málaga. Your Irish driver is already waiting.
        </p>
        <div className="reveal mt-10 text-center">
          <Button href="/transfers" variant="primary" size="md">
            More about transfers
          </Button>
        </div>
      </Container>
      <SectionWave variant="surfaceAlt" />
    </section>
  );
}
