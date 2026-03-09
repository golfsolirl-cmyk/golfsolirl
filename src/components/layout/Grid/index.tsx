import { cn } from '@/lib/utils';

export type GridProps = {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
};

const gapMap = { none: 'gap-0', sm: 'gap-2', md: 'gap-4', lg: 'gap-6' };
const colsMap: Record<NonNullable<GridProps['cols']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

/**
 * Grid — CSS Grid with cols (1–12) and gap. Override with className (e.g. sm:grid-cols-2 lg:grid-cols-3).
 */
export function Grid({ children, cols = 1, gap = 'md', className }: GridProps) {
  return <div className={cn('grid', colsMap[cols], gapMap[gap], className)}>{children}</div>;
}
