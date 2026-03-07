'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import { NAV_ITEMS, SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

/** Pa'lais homepage: topbar + nav 68px, white bg, border, logo Playfair, links hover orange underline, nav CTA navy */
export function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = useCallback(() => setOpen(false), []);

  return (
    <header
      className="sticky top-0 z-[99] bg-white/95 backdrop-blur-sm border-b border-border min-h-[72px] py-4 flex items-center shadow-elevation"
      role="banner"
    >
      <nav
        className="max-w-content mx-auto w-full px-6 md:px-10 flex items-center justify-between gap-4"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 md:gap-3 py-2 min-w-0 flex-shrink-0"
          aria-label={`${SITE_NAME} home`}
          onClick={closeMenu}
        >
          <span className="logo-3d flex-shrink-0">
            <span className="logo-3d-inner block">
              <Image
                src="/logo.svg"
                alt=""
                width={200}
                height={200}
                className="h-16 md:h-20 w-auto object-contain block"
              />
            </span>
          </span>
          <span className="logo-text flex-shrink-0">
            <span className="logo-text-main">GolfSol</span>
            <span className="logo-text-ireland">
              <svg className="logo-shamrock" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <ellipse cx="12" cy="6" rx="5" ry="7" transform="rotate(-10 12 6)" />
                <ellipse cx="6.5" cy="14" rx="5" ry="7" transform="rotate(50 6.5 14)" />
                <ellipse cx="17.5" cy="14" rx="5" ry="7" transform="rotate(-50 17.5 14)" />
                <path d="M11 14v6c0 .5.4 1 1 1s1-.5 1-1v-6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
              Ireland
            </span>
            <span className="logo-text-sub">The future of your golf trip</span>
          </span>
        </Link>

        <button
          type="button"
          className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-primary hover:bg-cream rounded-lg transition-colors"
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
          id="nav-menu"
          className={cn(
            'hidden md:flex md:flex-1 md:items-center md:justify-between md:min-w-0 md:pl-8 lg:pl-12',
            'max-md:absolute max-md:top-full max-md:left-0 max-md:right-0 max-md:bg-white max-md:py-8 max-md:px-6 max-md:flex-col max-md:gap-2 max-md:shadow-card max-md:border-b max-md:border-border',
            open && 'max-md:flex'
          )}
        >
          <ul className="hidden md:flex md:flex-1 md:justify-evenly md:items-center md:gap-2 text-sm font-semibold text-primary">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative py-2 px-1 block text-muted hover:text-primary transition-colors group whitespace-nowrap"
                  onClick={closeMenu}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-normal group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/#contact"
            className="btn-animated hidden md:inline-flex items-center justify-center flex-shrink-0 min-h-[44px] bg-primary text-primary-foreground py-3 px-6 rounded-lg text-sm font-bold tracking-wide uppercase hover:bg-muted transition-colors duration-normal shadow-button ml-4"
            onClick={closeMenu}
          >
            <span className="relative z-10">Enquire</span>
          </Link>
          {/* Mobile: show nav links as list */}
          <ul className="flex flex-col gap-2 md:hidden">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative py-3 block text-muted hover:text-primary transition-colors"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/#contact"
                className="btn-animated inline-flex items-center justify-center min-h-[44px] w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg text-sm font-bold tracking-wide uppercase"
                onClick={closeMenu}
              >
                <span className="relative z-10">Enquire</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
