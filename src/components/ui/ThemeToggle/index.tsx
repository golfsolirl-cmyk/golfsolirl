'use client';

import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

/**
 * ThemeToggle — Design system spec
 * - Min touch target: 44×44px (WCAG 2.5.5)
 * - States: default, hover, active, focus-visible (2px ring, offset 2px)
 * - Uses design tokens for bg, border, color; dark mode via [data-theme="dark"]
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={cn(
        'flex items-center justify-center rounded-full border-2 min-h-[var(--touch-min)] min-w-[var(--touch-min)]',
        'bg-[var(--color-surface-raised)] border-[var(--color-border)] text-[var(--color-text)]',
        'hover:bg-[var(--color-neutral-200)] hover:border-[var(--color-border-strong)] dark:hover:bg-white/20 dark:hover:border-white/25',
        'active:scale-[0.98] active:bg-[var(--color-neutral-300)] dark:active:bg-white/30',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]',
        'transition-colors duration-[var(--duration-normal)] ease-[var(--ease-in-out)]'
      )}
    >
      <span className="relative w-5 h-5 flex items-center justify-center" aria-hidden>
        <span
          className="absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-[var(--duration-normal)] ease-[var(--ease-default)]"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'rotate(-90deg) scale(0.8)' : 'rotate(0deg) scale(1)',
          }}
        >
          <SunIcon />
        </span>
        <span
          className="absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-[var(--duration-normal)] ease-[var(--ease-default)]"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.8)',
          }}
        >
          <MoonIcon />
        </span>
      </span>
    </button>
  );
}
