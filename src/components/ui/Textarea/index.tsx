import { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type TextareaValidationState = 'default' | 'valid' | 'error' | 'warning';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  helperText?: string;
  validationState?: TextareaValidationState;
  required?: boolean;
  optional?: boolean;
  maxLength?: number;
  showCount?: boolean;
  id?: string;
};

/**
 * Textarea — multi-line text. Min height 88px. Optional maxLength + showCount.
 * States: default, focus, disabled, error, valid, warning. See docs/COMPONENT-LIBRARY.md.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      validationState = 'default',
      required,
      optional,
      maxLength,
      showCount = !!maxLength,
      id,
      className,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const textareaId = id ?? props.name ?? label.toLowerCase().replace(/\s/g, '-');
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;
    const describedBy = [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(' ') || undefined;

    const ringColor =
      validationState === 'error'
        ? 'focus:ring-error border-error'
        : validationState === 'warning'
          ? 'focus:ring-warning border-warning'
          : validationState === 'valid'
            ? 'focus:ring-success border-success'
            : 'focus:ring-2 focus:ring-[var(--color-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] border-[var(--color-border)]';

    const setRef = (el: HTMLTextAreaElement | null) => {
      (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    };

    useEffect(() => {
      const el = textareaRef.current;
      if (!el || !props.rows) return;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
    }, [value, defaultValue, props.rows]);

    const currentLength = typeof value === 'string' ? value.length : (defaultValue as string)?.length ?? 0;

    return (
      <div className="space-y-1">
        <label
          htmlFor={textareaId}
          className="block text-sm font-semibold uppercase tracking-wide text-neutral-800 dark:text-neutral-200"
        >
          {label}
          {required && <span className="text-error ml-0.5" aria-hidden>*</span>}
          {optional && (
            <span className="ml-1.5 text-neutral-500 font-normal normal-case text-xs" aria-hidden>
              (optional)
            </span>
          )}
        </label>
        <textarea
          ref={setRef}
          id={textareaId}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-[var(--color-surface-raised)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] resize-y min-h-[88px]',
            'focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-[var(--duration-normal)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            ringColor,
            error && 'border-error focus:ring-error',
            className
          )}
          aria-invalid={!!error || validationState === 'error'}
          aria-describedby={describedBy}
          {...props}
        />
        {(error || helperText || showCount) && (
          <div className="flex justify-between items-start gap-2">
            <div>
              {error && (
                <p id={errorId} className="text-sm text-error" role="alert">
                  {error}
                </p>
              )}
              {helperText && !error && (
                <p id={helperId} className="text-sm text-neutral-500 dark:text-neutral-400">
                  {helperText}
                </p>
              )}
            </div>
            {showCount && maxLength !== undefined && (
              <span className="text-xs text-neutral-500 shrink-0" aria-live="polite">
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/*
Usage:
  <Textarea label="Message" rows={5} error={errors.message?.message} maxLength={2000} showCount {...register('message')} />
*/
