import { cn } from '@/lib/utils';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost' | 'interactive';

export type CardProps = {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  as?: 'div' | 'article' | 'section';
};

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-background-elevated rounded-xl border border-neutral-300 dark:border-neutral-600 shadow-1',
  elevated: 'bg-background-elevated rounded-xl border border-neutral-200 dark:border-neutral-600 shadow-3',
  outlined: 'bg-transparent rounded-xl border-2 border-neutral-300 dark:border-neutral-600',
  ghost: 'bg-transparent rounded-xl',
  interactive:
    'bg-background-elevated rounded-xl border border-neutral-300 dark:border-neutral-600 shadow-1 hover:shadow-3 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-normal cursor-pointer',
};

/**
 * Card — container with optional Header, Body, Footer, Media.
 * Variants: default | elevated | outlined | ghost | interactive (hover lift).
 */
export function Card({ children, variant = 'default', className, as: Component = 'div' }: CardProps) {
  return (
    <Component className={cn(variantStyles[variant], className)}>
      {children}
    </Component>
  );
}

export type CardHeaderProps = { children: React.ReactNode; className?: string };

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn('px-6 py-4 border-b border-neutral-200 dark:border-neutral-600', className)}>{children}</div>;
}

export type CardBodyProps = { children: React.ReactNode; className?: string };

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export type CardFooterProps = { children: React.ReactNode; className?: string };

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-neutral-200 dark:border-neutral-600', className)}>{children}</div>
  );
}

export type CardMediaProps = {
  children: React.ReactNode;
  aspectRatio?: 'video' | 'square' | '4/3' | '3/4' | 'auto';
  className?: string;
};

const aspectRatios: Record<NonNullable<CardMediaProps['aspectRatio']>, string> = {
  video: 'aspect-video',
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/4': 'aspect-[3/4]',
  auto: '',
};

export function CardMedia({ children, aspectRatio = 'auto', className }: CardMediaProps) {
  return (
    <div className={cn('overflow-hidden rounded-t-xl', aspectRatios[aspectRatio], className)}>{children}</div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Media = CardMedia;

/*
Usage:
  <Card variant="elevated">
    <Card.Media aspectRatio="4/3"><Image ... /></Card.Media>
    <Card.Header><h3>Title</h3></Card.Header>
    <Card.Body>Content</Card.Body>
    <Card.Footer><Button>Action</Button></Card.Footer>
  </Card>
*/
