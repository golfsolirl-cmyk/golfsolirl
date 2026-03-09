'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  /** Optional id for aria-labelledby on the dialog */
  'aria-labelledby'?: string;
  /** Optional id for aria-describedby */
  'aria-describedby'?: string;
};

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
  full: 'max-w-[100vw] max-h-[100vh] m-0 rounded-none',
};

/**
 * Modal — dialog with backdrop, close on ESC/backdrop, focus trap, entry animation.
 * Sizes: sm (400px) | md (560px) | lg (720px) | xl (960px) | full.
 */
export function Modal({
  open,
  onClose,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!closeOnEscape || e.key !== 'Escape') return;
      onClose();
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  const content = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-normal"
      style={{ backgroundColor: 'var(--color-surface-overlay)' }}
      onClick={handleOverlayClick}
    >
      <div
        ref={panelRef}
        className={cn(
          'relative w-full max-h-[90vh] overflow-hidden rounded-xl shadow-xl',
          'transition-all duration-normal',
          size !== 'full' && sizeStyles[size],
          className
        )}
        style={{ backgroundColor: 'var(--color-surface-raised)', boxShadow: 'var(--shadow-xl)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}

export type ModalHeaderProps = {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
};

export function ModalHeader({ children, onClose, className }: ModalHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 px-6 py-4 border-b border-neutral-200 dark:border-neutral-600', className)}>
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export type ModalBodyProps = { children: React.ReactNode; className?: string; scrollable?: boolean };

export function ModalBody({ children, className, scrollable = true }: ModalBodyProps) {
  return (
    <div className={cn(scrollable && 'overflow-y-auto max-h-[60vh]', 'px-6 py-4', className)}>{children}</div>
  );
}

export type ModalFooterProps = { children: React.ReactNode; className?: string };

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-600', className)}>
      {children}
    </div>
  );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

/*
Usage:
  <Modal open={open} onClose={() => setOpen(false)} size="md" aria-labelledby="modal-title">
    <Modal.Header onClose={() => setOpen(false)}><h2 id="modal-title">Title</h2></Modal.Header>
    <Modal.Body>Content</Modal.Body>
    <Modal.Footer><Button onClick={() => setOpen(false)}>Cancel</Button><Button>Confirm</Button></Modal.Footer>
  </Modal>
*/
