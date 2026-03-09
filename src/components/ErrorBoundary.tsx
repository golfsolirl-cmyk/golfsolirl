'use client';

import { Component, type ReactNode } from 'react';
import Link from 'next/link';

type Props = { children: ReactNode; fallback?: ReactNode };

type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (typeof window !== 'undefined' && (window as unknown as { __errorReporter?: (e: unknown, info?: unknown) => void }).__errorReporter) {
      (window as unknown as { __errorReporter: (e: unknown, info?: unknown) => void }).__errorReporter(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-6 p-8 text-center" role="alert">
          <h2 className="text-xl font-bold text-primary">Something went wrong</h2>
          <p className="text-muted max-w-md">We&apos;ve been notified. Please try again or return home.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm uppercase"
          >
            Go home
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
