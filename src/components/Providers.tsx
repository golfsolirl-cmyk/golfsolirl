'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ToastProvider, ToastView } from '@/components/ui/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ScrollReveal />
        {children}
        <ToastView position="top-right" />
      </ToastProvider>
    </ThemeProvider>
  );
}
