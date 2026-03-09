'use client';

/**
 * 10 creative logo text designs for "Golf Sol Ireland".
 * Inspired by: Irish green, gold highlights, golf crest, premium sports badge, traditional yet modern.
 */

const ShamrockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <ellipse cx="12" cy="6" rx="5" ry="7" transform="rotate(-10 12 6)" />
    <ellipse cx="6.5" cy="14" rx="5" ry="7" transform="rotate(50 6.5 14)" />
    <ellipse cx="17.5" cy="14" rx="5" ry="7" transform="rotate(-50 17.5 14)" />
    <path d="M11 14v6c0 .5.4 1 1 1s1-.5 1-1v-6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

const DESIGNS: { id: string; label: string; description: string; children: React.ReactNode }[] = [
  {
    id: 'classic-serif',
    label: '1. Classic Golf Club Serif',
    description: 'Playfair Display, dark Irish green, traditional serif, premium club feel',
    children: (
      <div className="logo-text-design logo-text-design--classic-serif">
        <span className="logo-text-design-main">Golf Sol</span>
        <span className="logo-text-design-ireland">
          <ShamrockIcon className="w-5 h-5" />
          Ireland
        </span>
      </div>
    ),
  },
  {
    id: 'luxury-gold',
    label: '2. Luxury Gold Gradient',
    description: 'Gold-to-amber gradient, serif, championship luxury',
    children: (
      <div className="logo-text-design logo-text-design--luxury-gold">
        <span className="logo-text-design-main">Golf Sol</span>
        <span className="logo-text-design-ireland">
          <ShamrockIcon className="w-5 h-5" />
          Ireland
        </span>
      </div>
    ),
  },
  {
    id: 'modern-minimal',
    label: '3. Modern Minimal Golf Brand',
    description: 'DM Sans, clean, tight tracking, single green',
    children: (
      <div className="logo-text-design logo-text-design--modern-minimal">
        <span className="logo-text-design-main">Golf Sol</span>
        <span className="logo-text-design-ireland">
          <ShamrockIcon className="w-4 h-4" />
          Ireland
        </span>
      </div>
    ),
  },
  {
    id: 'irish-script',
    label: '4. Irish Heritage Script',
    description: 'Dancing Script, flowing cursive, green with gold accent',
    children: (
      <div className="logo-text-design logo-text-design--irish-script">
        <span className="logo-text-design-main">Golf Sol</span>
        <span className="logo-text-design-ireland">
          <ShamrockIcon className="w-5 h-5" />
          Ireland
        </span>
      </div>
    ),
  },
  {
    id: 'championship-badge',
    label: '5. Championship Badge',
    description: 'Bold caps, badge background, white on green',
    children: (
      <div className="logo-text-design logo-text-design--championship-badge">
        <span className="logo-text-design-main">GOLF SOL</span>
        <span className="logo-text-design-ireland">
          <ShamrockIcon className="w-4 h-4" />
          IRELAND
        </span>
      </div>
    ),
  },
  {
    id: 'crest-emblem',
    label: '6. Crest Emblem',
    description: 'Serif small caps + script line, gold and green',
    children: (
      <div className="logo-text-design logo-text-design--crest-emblem">
        <span className="logo-text-design-main">GOLF SOL</span>
        <span className="logo-text-design-ireland">
          <ShamrockIcon className="w-4 h-4" />
          Ireland
        </span>
      </div>
    ),
  },
  {
    id: 'sport-premium',
    label: '7. Sport Premium',
    description: 'Outfit, heavy weight, gradient green, sharp',
    children: (
      <div className="logo-text-design logo-text-design--sport-premium">
        <span className="logo-text-design-main">Golf Sol</span>
        <span className="logo-text-design-ireland">
          <ShamrockIcon className="w-5 h-5" />
          Ireland
        </span>
      </div>
    ),
  },
  {
    id: 'traditional-double',
    label: '8. Traditional Double Line',
    description: 'Serif with subtle stroke, classic club engraving',
    children: (
      <div className="logo-text-design logo-text-design--traditional-double">
        <span className="logo-text-design-main">Golf Sol</span>
        <span className="logo-text-design-ireland">
          <ShamrockIcon className="w-5 h-5" />
          Ireland
        </span>
      </div>
    ),
  },
  {
    id: 'celtic-gold',
    label: '9. Celtic Gold',
    description: 'Gold fill, dark green stroke, ornamental',
    children: (
      <div className="logo-text-design logo-text-design--celtic-gold">
        <span className="logo-text-design-main">Golf Sol</span>
        <span className="logo-text-design-ireland">
          <ShamrockIcon className="w-5 h-5" />
          Ireland
        </span>
      </div>
    ),
  },
  {
    id: 'fairway-fresh',
    label: '10. Fairway Fresh',
    description: 'Light green gradient, modern sans, airy',
    children: (
      <div className="logo-text-design logo-text-design--fairway-fresh">
        <span className="logo-text-design-main">Golf Sol</span>
        <span className="logo-text-design-ireland">
          <ShamrockIcon className="w-5 h-5" />
          Ireland
        </span>
      </div>
    ),
  },
];

export function LogoTextDesigns() {
  return (
    <div className="space-y-14">
      {DESIGNS.map(({ id, label, description, children }) => (
        <section key={id} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">{label}</h2>
            <p className="text-sm text-muted">{description}</p>
          </div>
          <div className="p-8 rounded-xl bg-background-elevated border border-border flex flex-wrap items-center justify-center min-h-[120px]">
            {children}
          </div>
        </section>
      ))}
    </div>
  );
}
