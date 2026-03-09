import { cn } from '@/lib/utils';

export type PageWrapperProps = {
  children: React.ReactNode;
  className?: string;
  /** Max width: default 1280px (content), or 'full' */
  maxWidth?: 'content' | 'full';
  /** Horizontal padding: responsive 20px mobile → 40px desktop */
  padding?: boolean;
  /** Min height (e.g. min-h-screen for full page) */
  minHeight?: string;
};

/**
 * PageWrapper — wraps page content with max-width and responsive padding.
 * Use for inner page layout; Header/Footer sit outside.
 */
export function PageWrapper({
  children,
  className,
  maxWidth = 'content',
  padding = true,
  minHeight,
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        maxWidth === 'content' && 'max-w-content mx-auto',
        padding && 'px-5 md:px-10',
        minHeight,
        className
      )}
    >
      {children}
    </div>
  );
}
