import Link from 'next/link';
import { cn } from '@/lib/utils';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'submit' | 'white' | 'green';
  size?: 'sm' | 'md';
  className?: string;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  animated?: boolean;
  'aria-label'?: string;
  onClick?: () => void;
};

/** Primary = green (brand). Accent = orange. All support .btn-animated for lift + ripple. */
const base =
  'inline-flex items-center justify-center min-h-[44px] text-sm font-bold tracking-wide uppercase transition-all duration-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer rounded-lg';
const variants = {
  primary:
    'bg-primary text-primary-foreground py-3 px-7 border-none hover:bg-muted shadow-button hover:-translate-y-0.5',
  outline:
    'bg-transparent text-primary border-2 border-primary py-2.5 px-6 hover:bg-primary hover:text-primary-foreground',
  submit: 'bg-primary text-primary-foreground py-3 px-6 border-none hover:bg-muted shadow-button',
  white: 'bg-white text-primary py-3 px-7 border-none hover:bg-cream hover:-translate-y-0.5 shadow-card',
  green:
    'bg-primary text-primary-foreground py-3 px-7 border-none hover:bg-muted shadow-button hover:-translate-y-0.5',
};
const sizes = {
  sm: 'text-xs py-2.5 px-5 min-h-[40px]',
  md: 'text-sm py-3 px-7',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  href,
  type = 'button',
  disabled,
  animated = true,
  'aria-label': ariaLabel,
  onClick,
}: ButtonProps) {
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    animated && 'btn-animated relative overflow-hidden',
    className
  );

  const content = animated ? <span className="relative z-10">{children}</span> : children;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
