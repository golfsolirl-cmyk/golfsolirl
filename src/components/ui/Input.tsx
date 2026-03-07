import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  id?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-sm font-semibold uppercase text-navy">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-5 py-3.5 rounded border bg-white text-navy placeholder-placeholderGray',
            'focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all',
            'border-borderGray',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
