'use client';

/** Subtle golf-themed SVG graphics for section decoration. Low opacity, not interactive. */
const motifs = {
  ball: (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.9" />
      <circle cx="16" cy="10" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="20" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="16" cy="18" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 32" fill="none" className="w-full h-full" aria-hidden>
      <path d="M4 2v28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M4 2l14 6-14 6V2z" fill="currentColor" opacity="0.6" />
    </svg>
  ),
  tee: (
    <svg viewBox="0 0 24 32" fill="none" className="w-full h-full" aria-hidden>
      <path d="M12 4L8 28h8L12 4z" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.7" />
      <ellipse cx="12" cy="28" rx="5" ry="2" fill="currentColor" opacity="0.5" />
    </svg>
  ),
  hole: (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="16" cy="16" r="6" fill="currentColor" opacity="0.35" />
    </svg>
  ),
};

type MotifType = keyof typeof motifs;

type GolfMotifProps = {
  type?: MotifType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };

export function GolfMotif({ type = 'ball', className = '', size = 'md' }: GolfMotifProps) {
  const Motif = motifs[type];
  return (
    <span
      className={`inline-block text-primary opacity-[0.12] ${sizes[size]} ${className}`}
      aria-hidden
    >
      {Motif}
    </span>
  );
}
