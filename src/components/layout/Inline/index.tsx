import { cn } from '@/lib/utils';

export type InlineProps = {
  children: React.ReactNode;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  wrap?: boolean;
  align?: 'start' | 'center' | 'end' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between';
  className?: string;
};

const gapMap = { none: 'gap-0', sm: 'gap-2', md: 'gap-4', lg: 'gap-6' };
const alignMap = { start: 'items-start', center: 'items-center', end: 'items-end', baseline: 'items-baseline' };
const justifyMap = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between' };

/**
 * Inline — horizontal flex with gap, wrap, alignment.
 */
export function Inline({
  children,
  gap = 'md',
  wrap = false,
  align = 'center',
  justify = 'start',
  className,
}: InlineProps) {
  return (
    <div
      className={cn(
        'flex flex-row',
        gapMap[gap],
        alignMap[align],
        justifyMap[justify],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}
