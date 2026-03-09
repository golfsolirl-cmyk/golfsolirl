import Link from 'next/link';
import { cn } from '@/lib/utils';

/** @typedef {'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'} ButtonVariant */
/** @typedef {'xs' | 'sm' | 'md' | 'lg' | 'xl'} ButtonSize */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'submit' | 'white' | 'green';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  animated?: boolean;
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  iconOnly?: boolean;
  'aria-label'?: string;
  onClick?: () => void;
};

const base =
  'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition-all duration-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] cursor-pointer rounded-lg disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground border-none hover:bg-primary-400 active:scale-[0.98] shadow-3-primary hover:shadow-4-primary hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-neutral-200 text-neutral-900 border border-neutral-300 hover:bg-neutral-300 active:scale-[0.98] dark:bg-neutral-700 dark:text-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-600',
  ghost:
    'bg-transparent text-primary border-none hover:bg-primary-100 active:scale-[0.98] dark:hover:bg-primary-200 dark:text-primary-400',
  danger:
    'bg-error text-error-foreground border-none hover:opacity-90 active:scale-[0.98] shadow-2',
  success:
    'bg-success text-success-foreground border-none hover:opacity-90 active:scale-[0.98] shadow-2',
  outline:
    'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]',
  submit:
    'bg-primary text-primary-foreground border-none hover:bg-primary-400 active:scale-[0.98] shadow-3-primary',
  white:
    'bg-white text-primary border-none hover:bg-neutral-100 active:scale-[0.98] shadow-2 hover:-translate-y-0.5 dark:bg-neutral-200 dark:text-primary',
  green:
    'bg-primary text-primary-foreground border-none hover:bg-primary-400 active:scale-[0.98] shadow-3-primary hover:-translate-y-0.5',
};

const sizes: Record<ButtonSize, string> = {
  xs: 'text-xs py-2 px-3 min-h-[32px] min-w-[32px]',
  sm: 'text-xs py-2.5 px-5 min-h-[40px] min-w-[40px]',
  md: 'text-sm py-3 px-7 min-h-[44px] min-w-[44px]',
  lg: 'text-base py-3.5 px-8 min-h-[48px] min-w-[48px]',
  xl: 'text-lg py-4 px-10 min-h-[52px] min-w-[52px]',
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

/**
 * Button — primary actions, links that look like buttons, form submit.
 * Variants: primary | secondary | ghost | danger | success | outline (+ submit, white, green for backward compat).
 * Sizes: xs | sm | md | lg | xl. Use iconLeading/iconTrailing or iconOnly with aria-label.
 * Loading state shows spinner + "Loading…" and preserves dimensions.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  href,
  type = 'button',
  disabled,
  loading = false,
  animated = true,
  iconLeading,
  iconTrailing,
  iconOnly = false,
  'aria-label': ariaLabel,
  onClick,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const sizeClass = size;
  const variantClass = variants[variant];
  const sizeStyles = sizes[sizeClass];

  const classes = cn(
    base,
    variantClass,
    sizeStyles,
    iconOnly && 'p-0',
    animated && 'relative overflow-hidden',
    className
  );

  const content = (
    <>
      {loading ? (
        <>
          <Spinner className="w-5 h-5 shrink-0" />
          <span className="relative z-10">Loading…</span>
        </>
      ) : (
        <>
          {iconLeading && <span className="shrink-0 [&>svg]:w-5 [&>svg]:h-5" aria-hidden>{iconLeading}</span>}
          {!iconOnly && <span className={cn(animated && 'relative z-10')}>{children}</span>}
          {iconTrailing && <span className="shrink-0 [&>svg]:w-5 [&>svg]:h-5" aria-hidden>{iconTrailing}</span>}
        </>
      )}
    </>
  );

  if (href && !isDisabled) {
    return (
      <Link href={href} className={classes} aria-label={iconOnly ? ariaLabel : undefined} aria-busy={loading}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-label={iconOnly ? ariaLabel : undefined}
      aria-busy={loading}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

/*
Usage:
  <Button variant="primary" size="md">Save</Button>
  <Button variant="outline" href="#contact">Enquire</Button>
  <Button variant="danger" loading>Delete</Button>
  <Button iconOnly aria-label="Close" iconTrailing={<XIcon />} />
*/
