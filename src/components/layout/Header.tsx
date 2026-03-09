'use client';

import Link from 'next/link';
import { useState, useCallback, useRef, useEffect } from 'react';
import { NAV_ITEMS } from '@/lib/constants';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

/** Premium header: strong logo lockup, clear nav hierarchy, Stripe/Linear-level polish. */
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
        'sticky top-0 z-[99] backdrop-blur-md border-b border-border dark:border-white/10 min-h-[80px] flex items-center shadow-sm overflow-visible transition-colors duration-200 pt-4 pb-3',
        scrolled ? 'bg-white dark:bg-surface-raised' : 'bg-white/98 dark:bg-bg/80'
      )}
      role="banner"
    >
      <nav
        className="max-w-content mx-auto w-full pl-4 pr-3 sm:pl-6 sm:pr-5 lg:pl-10 lg:pr-12 flex items-center justify-between min-h-[72px] overflow-visible gap-3 max-md:gap-2"
        aria-label="Main navigation"
      >
        {/* Logo + spacer (on mobile logo can shrink so burger stays visible) */}
        <div className="flex items-center min-w-0 max-md:min-w-0 max-md:flex-shrink md:flex-shrink-0 overflow-hidden">
          <Logo variant="header" concept="irish-script" className="min-w-0" onClick={closeMenu} />
          {/* Fixed-width gap on desktop: inline style so it always applies */}
          <span
            className="hidden md:inline-block flex-shrink-0"
            style={{ width: 'clamp(16rem, 20vw, 24rem)' }}
            aria-hidden
          />
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border-2 border-neutral-300 dark:border-white/30 bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors flex-shrink-0 order-last"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div
          ref={menuRef}
          id="nav-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className={cn(
            'hidden md:flex md:flex-1 md:items-center md:justify-end md:min-w-0 md:ml-auto md:pl-12 lg:pl-16 md:gap-8 lg:gap-10',
            'max-md:absolute max-md:top-full max-md:left-0 max-md:right-0 max-md:bg-white dark:max-md:bg-surface-raised max-md:py-8 max-md:px-6 max-md:flex-col max-md:gap-1 max-md:shadow-lg max-md:border-b max-md:border-border dark:max-md:border-border',
            open && 'max-md:flex'
          )}
        >
          <ul className="hidden md:flex md:items-center md:gap-3 lg:gap-4 text-[15px] font-semibold text-primary dark:text-white">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative py-2.5 px-0.5 block text-primary dark:text-white hover:text-primary-400 dark:hover:text-yellow transition-colors duration-200 group whitespace-nowrap"
                  onClick={closeMenu}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary dark:bg-yellow transition-all duration-200 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="hidden md:flex md:items-center md:gap-3 md:flex-shrink-0 md:pl-2">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide bg-primary text-primary-foreground hover:bg-primary-400 dark:hover:bg-primary-300 transition-colors duration-200 shadow-sm hover:shadow-md"
              onClick={closeMenu}
            >
              Enquire
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile menu */}
          <ul className="flex flex-col md:hidden gap-0 text-primary dark:text-white">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-3.5 px-1 text-primary dark:text-white hover:text-primary-400 dark:hover:text-yellow font-medium transition-colors"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-4 flex gap-3">
              <Link
                href="/#contact"
                className="flex-1 inline-flex items-center justify-center min-h-[48px] rounded-lg text-sm font-bold bg-primary text-primary-foreground"
                onClick={closeMenu}
              >
                Enquire
              </Link>
              <span className="flex items-center justify-center min-h-[48px] min-w-[48px]" onClick={closeMenu} role="presentation">
                <ThemeToggle />
              </span>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
