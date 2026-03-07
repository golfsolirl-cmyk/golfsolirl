'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { ScrollReveal } from '@/components/ScrollReveal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ScrollReveal />
      {children}
    </ThemeProvider>
  );
}
