'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Observes all .reveal elements and adds .visible when they enter viewport.
 * Re-runs on pathname change so client navigation picks up new content.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
