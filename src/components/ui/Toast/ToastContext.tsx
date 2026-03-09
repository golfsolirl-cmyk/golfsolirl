'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  description?: string;
  duration?: number;
  createdAt: number;
};

export type ToastOptions = {
  type?: ToastType;
  title?: string;
  description?: string;
  duration?: number;
};

type ToastContextValue = {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 5000;

let idCounter = 0;
function generateId() {
  return `toast-${++idCounter}-${Date.now()}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const t = timeoutsRef.current.get(id);
    if (t) clearTimeout(t);
    timeoutsRef.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (options: ToastOptions) => {
      const id = generateId();
      const duration = options.duration ?? DEFAULT_DURATION;
      const toast: Toast = {
        id,
        type: options.type ?? 'info',
        title: options.title,
        description: options.description,
        duration,
        createdAt: Date.now(),
      };
      setToasts((prev) => {
        const next = [...prev, toast].slice(-MAX_TOASTS);
        return next;
      });
      if (duration > 0) {
        const t = setTimeout(() => removeToast(id), duration);
        timeoutsRef.current.set(id, t);
      }
      return id;
    },
    [removeToast]
  );

  const value: ToastContextValue = { toasts, addToast, removeToast };
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
