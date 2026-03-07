import { cn } from '@/lib/utils';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section';
};

export function Container({ children, className, as: Component = 'div' }: ContainerProps) {
  return (
    <Component className={cn('max-w-content mx-auto px-6 md:px-10 lg:px-12', className)}>
      {children}
    </Component>
  );
}
