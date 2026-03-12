'use client';

import Link from 'next/link';
import { useState, useCallback, useRef, useEffect } from 'react';
import { NAV_ITEMS } from '@/lib/constants';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Header — Design system spec
 * - 8pt spacing grid: 8px, 16px, 24px, 32px, 40px (Tailwind 2,4,6,8,10)
 * - Min touch target: 44px (--touch-min) for all interactive elements
 * - States: default, hover, active, focus-visible (2px outline offset 2px)
 * - Breakpoints: 640 / 768 / 1024 / 1280 (sm / md / lg / xl)
 * - ARIA: banner, nav aria-label, aria-expanded on menu button, focus trap when mobile open
 * - Contrast: nav text on header bg meets WCAG AA (4.5:1); focus ring uses --color-focus-ring
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(typeof window !== 'undefined' && window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = menuRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>('a[href], button');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
        return;
      }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeMenu]);

  return (
    <header
      className={cn(
        'sticky top-0 z-[var(--header-z)] min-h-[var(--nav-height)] flex items-center border-b overflow-visible',
        'transition-[background-color,border-color] duration-200 ease-[var(--ease-in-out)]',
        'backdrop-blur-md',
        scrolled ? 'bg-[var(--header-bg-scrolled)] border-[var(--header-border)] shadow-[var(--shadow-1)]' : 'bg-[var(--header-bg)] border-[var(--header-border)]'
      )}
      style={{ paddingTop: 'var(--header-padding-y)', paddingBottom: 'var(--header-padding-y)' }}
      role="banner"
    >
      <nav
        className="max-w-content mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between min-h-[var(--nav-height)] gap-4 max-md:gap-2"
        aria-label="Main navigation"
      >
        {/* Logo — flex-shrink-0 so it doesn’t collapse; min-w-0 on wrapper for truncation */}
        <div className="flex items-center min-w-0 flex-shrink-0 overflow-hidden md:flex-shrink-0">
          <Logo variant="header" concept="irish-script" className="min-w-0" onClick={closeMenu} />
          <span
            className="hidden md:inline-block flex-shrink-0"
            style={{ width: 'clamp(28rem, 38vw, 44rem)' }}
            aria-hidden
          />
        </div>

        {/* Mobile menu button — 44×44px min, full state set */}
        <button
          ref={menuButtonRef}
          type="button"
          className={cn(
            'md:hidden flex items-center justify-center rounded-lg border-2 min-h-[var(--touch-min)] min-w-[var(--touch-min)] flex-shrink-0 order-last',
            'bg-[var(--color-neutral-100)] border-[var(--color-neutral-300)] text-[var(--color-text-primary)]',
            'hover:bg-[var(--color-neutral-200)] hover:border-[var(--color-neutral-400)]',
            'active:bg-[var(--color-neutral-300)] active:scale-[0.98]',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]',
            'transition-colors duration-[var(--duration-normal)] ease-[var(--ease-in-out)]',
            'dark:bg-white/10 dark:border-white/20 dark:text-white',
            'dark:hover:bg-white/20 dark:hover:border-white/30'
          )}
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Desktop nav + mobile panel */}
        <div
          ref={menuRef}
          id="nav-menu"
          aria-label="Main menu"
          className={cn(
            'md:flex md:flex-1 md:items-center md:justify-end md:min-w-0 md:ml-auto md:pl-16 lg:pl-20 xl:pl-24 md:gap-6 lg:gap-10',
            'max-md:absolute max-md:top-full max-md:left-0 max-md:right-0 max-md:flex-col max-md:gap-0',
            'max-md:py-6 max-md:px-6 max-md:shadow-[var(--shadow-3)] max-md:border-b max-md:border-[var(--header-border)]',
            'max-md:bg-[var(--color-background-elevated)]',
            open ? 'max-md:flex' : 'max-md:hidden'
          )}
        >
          {/* Desktop nav links — 8pt vertical padding, hover underline, focus ring */}
          <ul className="hidden md:flex md:items-center md:gap-6 lg:gap-8 text-[15px] font-semibold list-none m-0 p-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative block py-2 px-1 min-h-[var(--touch-min)] flex items-center box-border',
                    'text-[var(--color-primary-500)] dark:text-white',
                    'hover:text-[var(--color-primary-400)] dark:hover:text-yellow',
                    'active:text-[var(--color-primary-500)] active:opacity-90',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:rounded',
                    'transition-colors duration-[var(--duration-normal)] whitespace-nowrap',
                    'group'
                  )}
                  onClick={closeMenu}
                >
                  {item.label}
                  <span
                    className="absolute bottom-1 left-0 w-0 h-0.5 bg-[var(--color-primary-400)] dark:bg-yellow transition-all duration-200 group-hover:w-full"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: Enquire + Theme toggle — 8pt gap, 44px touch on toggle */}
          <div className="hidden md:flex md:items-center md:gap-4 md:flex-shrink-0 md:pl-2">
            <Button variant="primary" size="md" href="/#contact" onClick={closeMenu}>
              Enquire
            </Button>
            <ThemeToggle />
          </div>

          {/* Mobile menu links + CTA — 8pt spacing, 44px min touch */}
          <ul className="flex flex-col md:hidden gap-0 list-none m-0 p-0 text-primary dark:text-white">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'block py-4 px-1 min-h-[var(--touch-min)] flex items-center font-medium',
                    'text-primary dark:text-white',
                    'hover:text-primary-400 dark:hover:text-yellow hover:bg-neutral-100 dark:hover:bg-white/5',
                    'active:bg-neutral-200 dark:active:bg-white/10',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:rounded',
                    'transition-colors duration-[var(--duration-normal)]'
                  )}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-6 flex gap-4 items-center">
              <Button variant="primary" size="lg" href="/#contact" className="flex-1 min-h-[var(--touch-min)]" onClick={closeMenu}>
                Enquire
              </Button>
              <span className="flex items-center justify-center min-h-[var(--touch-min)] min-w-[var(--touch-min)]" aria-hidden>
                <ThemeToggle />
              </span>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
