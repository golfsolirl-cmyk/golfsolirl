import { cn } from '@/lib/utils';

export type StackProps = {
  children: React.ReactNode;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  as?: 'div' | 'section' | 'main';
};

const gapMap = { none: 'gap-0', sm: 'gap-2', md: 'gap-4', lg: 'gap-6' };

/**
 * Stack — vertical flex layout with gap.
 */
export function Stack({ children, gap = 'md', className, as: Component = 'div' }: StackProps) {
  return <Component className={cn('flex flex-col', gapMap[gap], className)}>{children}</Component>;
}
