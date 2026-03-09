'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback, useRef, useEffect } from 'react';
import { NAV_ITEMS, SITE_NAME } from '@/lib/constants';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

const ShamrockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <ellipse cx="12" cy="6" rx="5" ry="7" transform="rotate(-10 12 6)" />
    <ellipse cx="6.5" cy="14" rx="5" ry="7" transform="rotate(50 6.5 14)" />
    <ellipse cx="17.5" cy="14" rx="5" ry="7" transform="rotate(-50 17.5 14)" />
    <path d="M11 14v6c0 .5.4 1 1 1s1-.5 1-1v-6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

/** Premium header: strong logo lockup, clear nav hierarchy, Stripe/Linear-level polish. */
export function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => {
    setOpen(false);
    menuButtonRef.current?.focus();
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
      className="sticky top-0 z-[99] bg-white/98 dark:bg-black/20 backdrop-blur-md border-b border-border dark:border-white/10 min-h-[80px] flex items-center shadow-sm overflow-visible"
      role="banner"
    >
      <nav
        className="max-w-content mx-auto w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between min-h-[80px] overflow-visible"
        aria-label="Main navigation"
      >
        {/* Logo + fixed spacer so menu never touches logo text */}
        <div className="flex items-center min-w-0 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1 py-2 min-w-0 flex-shrink-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary items-end"
            aria-label={`${SITE_NAME} home`}
            onClick={closeMenu}
          >
            <span className="logo-3d flex-shrink-0 -mb-4 sm:-mb-5 md:-mb-6">
              <span className="logo-3d-inner block">
                <Image
                  src="/logo.svg"
                  alt=""
                  width={120}
                  height={120}
                  className="h-16 w-16 sm:h-[72px] sm:w-[72px] md:h-[104px] md:w-[104px] object-contain block"
                />
              </span>
            </span>
            <span className="flex flex-col justify-center gap-0.5 min-w-0">
              <span className="flex items-baseline gap-2 flex-wrap">
                <span className="font-display font-black text-xl sm:text-2xl md:text-3xl tracking-tight text-primary dark:text-white leading-none">
                  GolfSol
                </span>
                <span className="flex items-center gap-1.5">
                  <ShamrockIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-primary dark:text-white flex-shrink-0" />
                  <span className="font-display font-bold text-sm sm:text-base md:text-lg tracking-tight text-primary dark:text-white leading-none">
                    Ireland
                  </span>
                </span>
              </span>
              <span className="hidden sm:block text-[11px] md:text-xs font-medium tracking-wide text-muted dark:text-white leading-tight">
                The future of your golf trip
              </span>
            </span>
          </Link>
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
          className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-primary dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
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
            'max-md:absolute max-md:top-full max-md:left-0 max-md:right-0 max-md:bg-white dark:max-md:bg-black/30 dark:max-md:backdrop-blur-md max-md:py-8 max-md:px-6 max-md:flex-col max-md:gap-1 max-md:shadow-lg max-md:border-b max-md:border-border dark:max-md:border-white/10',
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
