import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  id?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const textareaId = id ?? props.name ?? label.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="space-y-2">
        <label htmlFor={textareaId} className="block text-sm font-semibold uppercase text-navy">
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-5 py-3.5 rounded border bg-white text-navy placeholder-placeholderGray resize-y',
            'focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all',
            'border-borderGray',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
