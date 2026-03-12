import { cn } from '@/lib/utils';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section';
};

/**
 * Container — 8pt grid, max 1280px. Use for section content (not full-bleed bg).
 * Padding: 16px mobile, 24px sm, 32px lg, 40px xl (aligns with UX-ARCHITECTURE.md).
 */
export function Container({ children, className, as: Component = 'div' }: ContainerProps) {
  return (
    <Component className={cn('max-w-content mx-auto px-4 sm:px-6 lg:px-8 xl:px-10', className)}>
      {children}
    </Component>
  );
}
