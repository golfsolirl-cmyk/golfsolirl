'use client';

import Link from 'next/link';
import { Logo, type LogoConcept } from '@/components/ui/Logo';
import { LogoTextDesigns } from '@/components/ui/LogoTextDesigns';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const CONCEPTS: { id: LogoConcept; label: string; description: string }[] = [
  { id: 'saas', label: '1. Clean SaaS', description: 'DM Sans, minimal, tight spacing' },
  { id: 'tech', label: '2. Bold Tech', description: 'Outfit, gradient, glow' },
  { id: 'premium', label: '3. Premium', description: 'Playfair Display, elegant serif' },
  { id: 'retro', label: '4. Retro', description: '70s warmth, amber/orange tint, rounded feel' },
  { id: 'neon', label: '5. Neon', description: 'Electric green glow, high contrast' },
  { id: 'minimal', label: '6. Minimal', description: 'Light weight, wide letter-spacing' },
  { id: 'script', label: '7. Script', description: 'Dancing Script, flowing cursive' },
  { id: 'badge', label: '8. Badge', description: 'Pill background, compact lockup' },
  { id: 'outline', label: '9. Outline', description: 'Stroked text, no fill' },
  { id: 'stacked', label: '10. Stacked', description: 'Icon on top, vertical layout' },
  { id: 'brutalist', label: '11. Brutalist', description: 'Heavy black, uppercase, stark' },
  { id: 'luxe', label: '12. Luxe', description: 'Gold gradient, wide tracking, luxury' },
  { id: 'gradient-mesh', label: '13. Gradient mesh', description: 'Green → gold → green, hover shift' },
  { id: 'irish-script', label: '14. Irish Heritage Script (header/footer)', description: 'Clean SaaS spacing + Dancing Script, green gradient + gold' },
];

export default function LogoPreviewPage() {
  return (
    <div className="min-h-screen bg-background text-neutral-foreground">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="text-primary hover:underline text-sm">
            ← Back to home
          </Link>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-display font-bold text-primary mb-2">Logo lockup concepts</h1>
        <p className="text-muted mb-10">
          14 concepts in header style. Toggle dark mode to see both themes.
        </p>
        <div className="space-y-14">
          {CONCEPTS.map(({ id, label, description }) => (
            <section key={id} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-primary">{label}</h2>
                <p className="text-sm text-muted">{description}</p>
              </div>
              <div className="p-8 rounded-xl bg-background-elevated border border-border flex flex-wrap items-center justify-center gap-6 min-h-[140px]">
                <Logo variant="header" concept={id} asLink={false} />
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-muted">
          Use any concept in Header/Footer: <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">concept=&quot;neon&quot;</code>,{' '}
          <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">concept=&quot;stacked&quot;</code>, etc.
        </p>

        <hr className="my-16 border-border" />

        <h1 className="text-2xl font-display font-bold text-primary mb-2">10 Logo Text Designs</h1>
        <p className="text-muted mb-10">
          Typographic treatments for &quot;Golf Sol Ireland&quot; inspired by the crest: Irish green, gold, golf premium, traditional yet modern.
        </p>
        <LogoTextDesigns />
      </div>
    </div>
  );
}
