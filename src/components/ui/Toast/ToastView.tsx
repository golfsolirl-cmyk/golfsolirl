'use client';

import { useToast, type Toast as ToastType, type ToastType as ToastTypeName } from './ToastContext';
import { cn } from '@/lib/utils';

const typeStyles: Record<ToastTypeName, string> = {
  success: 'bg-success text-success-foreground border-success',
  error: 'bg-error text-error-foreground border-error',
  warning: 'bg-warning text-warning-foreground border-warning',
  info: 'bg-info text-info-foreground border-info',
};

const Icon = ({ type }: { type: ToastTypeName }) => {
  const c = 'w-5 h-5 shrink-0';
  if (type === 'success')
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  if (type === 'error')
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  if (type === 'warning')
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  return (
    <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

function SingleToast({ toast }: { toast: ToastType }) {
  const { removeToast } = useToast();
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-3 min-w-[320px] max-w-[420px]',
        typeStyles[toast.type]
      )}
    >
      <Icon type={toast.type} />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
        {toast.description && <p className={cn('text-sm opacity-95', toast.title && 'mt-0.5')}>{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className="p-1 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export type ToastViewProps = {
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-left';
  className?: string;
};

const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

export function ToastView({ position = 'top-right', className }: ToastViewProps) {
  const { toasts } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div
      className={cn('fixed z-[200] flex flex-col gap-2', positionStyles[position], className)}
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <SingleToast key={t.id} toast={t} />
      ))}
    </div>
  );
}
