'use client';

import { useTheme } from '@/context/ThemeContext';

const SunIcon = () => (
  <svg className="theme-toggle-sun w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="theme-toggle-moon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

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
      className="theme-toggle-btn flex items-center justify-center w-9 h-9 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-[var(--color-bg)]"
      style={{
        background: 'var(--color-surface-raised)',
        borderColor: 'var(--color-border)',
        color: isDark ? '#fff' : 'var(--color-text)',
        transitionDuration: 'var(--duration-normal)',
      }}
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
