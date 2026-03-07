'use client';

/** Solid wavy line at bottom of section — no gradient, no animation. */
type SectionWaveProps = {
  /** Next section background color (wave fill) */
  fill: string;
  className?: string;
};

const MAIN_PATH = 'M0 32 Q150 0 300 32 T600 32 T900 32 T1200 32 L1200 64 L0 64 Z';
const DEPTH_PATH = 'M0 40 Q200 8 400 40 T800 40 T1200 40 L1200 64 L0 64 Z';
/** Top edge curve only — for the stroke line */
const TOP_CURVE = 'M0 32 Q150 0 300 32 T600 32 T900 32 T1200 32';
const PRIMARY_GREEN = '#123811';

/** Contrasting stroke so the line is visible on both light and dark wave fills */
function getStrokeColor(fill: string): string {
  return fill.toLowerCase() === PRIMARY_GREEN.toLowerCase()
    ? 'rgba(255,255,255,0.6)'
    : 'rgba(18,56,17,0.45)';
}

export function SectionWave({ fill, className = '' }: SectionWaveProps) {
  const strokeColor = getStrokeColor(fill);
  return (
    <div
      className={`section-wave absolute bottom-0 left-0 right-0 z-10 h-20 w-full overflow-visible pointer-events-none ${className}`}
      aria-hidden
    >
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-full"
        style={{ minHeight: '5rem' }}
        viewBox="0 0 1200 64"
        preserveAspectRatio="none"
        fill="none"
      >
        <path className="section-wave-path" d={MAIN_PATH} fill={fill} />
        <path className="section-wave-path section-wave-path-2" d={DEPTH_PATH} fill={fill} fillOpacity="0.35" />
        {/* Line along top of wave — contrasting so it’s visible in every section */}
        <path
          d={TOP_CURVE}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
