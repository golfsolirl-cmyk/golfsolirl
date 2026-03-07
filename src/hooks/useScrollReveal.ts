'use client';

import { useEffect, useRef } from 'react';

/**
 * Adds .visible when element enters viewport (scroll reveal).
 * Use with class "reveal" on the element.
 */
export function useScrollReveal<T extends HTMLElement>(opts?: { rootMargin?: string; threshold?: number }) {
  const ref = useRef<T>(null);
  const rootMargin = opts?.rootMargin ?? '0px 0px -60px 0px';
  const threshold = opts?.threshold ?? 0.1;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return ref;
}
