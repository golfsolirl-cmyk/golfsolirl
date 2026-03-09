'use client';

import { useTheme } from '@/context/ThemeContext';

/** Solid wavy line at bottom of section. Theme-aware fill/stroke so waves update when theme toggles. */
export type SectionWaveVariant = 'cream' | 'primary' | 'surfaceAlt';

type SectionWaveProps = {
  /** Which section background the wave matches (next section). */
  variant: SectionWaveVariant;
  className?: string;
};

const MAIN_PATH = 'M0 32 Q150 0 300 32 T600 32 T900 32 T1200 32 L1200 64 L0 64 Z';
const DEPTH_PATH = 'M0 40 Q200 8 400 40 T800 40 T1200 40 L1200 64 L0 64 Z';
const TOP_CURVE = 'M0 32 Q150 0 300 32 T600 32 T900 32 T1200 32';

/** Explicit colours per theme — match tokens, easy on the eye. */
const WAVE_COLORS = {
  light: {
    cream: { fill: '#ffffff', stroke: 'rgba(26,46,26,0.18)' },
    primary: { fill: '#123811', stroke: 'rgba(255,255,255,0.5)' },
    surfaceAlt: { fill: '#f8f6f2', stroke: 'rgba(26,46,26,0.25)' },
  },
  dark: {
    cream: { fill: '#2d3630', stroke: 'rgba(240,235,227,0.15)' },
    primary: { fill: '#2d6b3a', stroke: 'rgba(255,255,255,0.45)' },
    surfaceAlt: { fill: '#2d3630', stroke: 'rgba(255,255,255,0.2)' },
  },
} as const;

export function SectionWave({ variant, className = '' }: SectionWaveProps) {
  const { theme } = useTheme();
  const colors = WAVE_COLORS[theme][variant];
  const fill = colors.fill;
  const stroke = colors.stroke;
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
        <path
          d={TOP_CURVE}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
