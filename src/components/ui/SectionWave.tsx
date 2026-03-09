'use client';

/** Solid wavy line at bottom of section. Colours from CSS variables so wave matches section and theme switches without re-render. */
export type SectionWaveVariant = 'cream' | 'primary' | 'surfaceAlt';

type SectionWaveProps = {
  /** Which section background the wave matches (next section). */
  variant: SectionWaveVariant;
  className?: string;
};

const MAIN_PATH = 'M0 32 Q150 0 300 32 T600 32 T900 32 T1200 32 L1200 64 L0 64 Z';
const DEPTH_PATH = 'M0 40 Q200 8 400 40 T800 40 T1200 40 L1200 64 L0 64 Z';
const TOP_CURVE = 'M0 32 Q150 0 300 32 T600 32 T900 32 T1200 32';

export function SectionWave({ variant, className = '' }: SectionWaveProps) {
  return (
    <div
      className={`section-wave section-wave--${variant} absolute bottom-0 left-0 right-0 z-10 h-20 w-full overflow-visible pointer-events-none ${className}`}
      aria-hidden
    >
      <svg
        className="section-wave-svg absolute bottom-0 left-0 right-0 w-full h-full"
        style={{ minHeight: '5rem' }}
        viewBox="0 0 1200 64"
        preserveAspectRatio="none"
        fill="none"
      >
        <path className="section-wave-path" d={MAIN_PATH} />
        <path className="section-wave-path section-wave-path-2" d={DEPTH_PATH} fillOpacity="0.35" />
        <path
          className="section-wave-stroke"
          d={TOP_CURVE}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
