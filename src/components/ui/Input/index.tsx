import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type InputValidationState = 'default' | 'valid' | 'error' | 'warning';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
  validationState?: InputValidationState;
  required?: boolean;
  optional?: boolean;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  id?: string;
  labelClassName?: string;
  errorClassName?: string;
};

/**
 * Input — text, email, number, search. Use with react-hook-form via forwardRef.
 * Validation: error message (role=alert), helperText, validationState (valid | error | warning).
 * Optional password type with show/hide toggle when type="password".
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      validationState = 'default',
      required,
      optional,
      leftAdornment,
      rightAdornment,
      id,
      labelClassName,
      errorClassName,
      type = 'text',
      className,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s/g, '-');
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const describedBy = [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(' ') || undefined;

    const inputType = isPassword && showPassword ? 'text' : type;

    const ringColor =
      validationState === 'error'
        ? 'focus:ring-error border-error'
        : validationState === 'warning'
          ? 'focus:ring-warning border-warning'
          : validationState === 'valid'
            ? 'focus:ring-success border-success'
            : 'focus:ring-2 focus:ring-[var(--color-focus-ring)] border-[var(--color-border)]';

    const inputClasses = cn(
      'w-full rounded-lg border bg-[var(--color-surface-raised)] text-[var(--color-text)] placeholder-[var(--color-text-muted)]',
      'focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-normal',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      leftAdornment ? 'pl-10' : 'px-4',
      (rightAdornment || isPassword) ? 'pr-10' : 'px-4',
      'py-3 min-h-[44px]',
      ringColor,
      error && 'border-error focus:ring-error',
      className
    );

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-semibold uppercase tracking-wide text-neutral-800 dark:text-neutral-200',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-error ml-0.5" aria-hidden>*</span>}
          {optional && (
            <span className="ml-1.5 text-neutral-500 font-normal normal-case text-xs" aria-hidden>
              (optional)
            </span>
          )}
        </label>
        <div className="relative">
          {leftAdornment && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" aria-hidden>
              {leftAdornment}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={inputClasses}
            aria-invalid={!!error || validationState === 'error'}
            aria-describedby={describedBy}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M4.5 12h.01m15 0h.01" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
          {rightAdornment && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" aria-hidden>
              {rightAdornment}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className={cn('text-sm text-error', errorClassName)} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/*
Usage:
  <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
  <Input label="Password" type="password" required />
  <Input label="Search" leftAdornment={<SearchIcon />} rightAdornment={<ClearButton />} />
*/
