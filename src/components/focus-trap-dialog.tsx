import { useEffect, useRef, type ReactNode } from 'react'

interface FocusTrapDialogProps {
  readonly active: boolean
  readonly children: ReactNode
  readonly className?: string
  readonly labelledBy?: string
  readonly onClose: () => void
  readonly role?: 'dialog' | 'alertdialog'
}

export function FocusTrapDialog({
  active,
  children,
  className,
  labelledBy,
  onClose,
  role = 'dialog'
}: FocusTrapDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) {
      return
    }

    const panel = panelRef.current
    if (!panel) {
      return
    }

    const focusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'))

    const first = focusable()[0]
    first?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const items = focusable()
      if (items.length === 0) {
        return
      }

      const firstEl = items[0]
      const lastEl = items[items.length - 1]

      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault()
        lastEl.focus()
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, onClose])

  if (!active) {
    return null
  }

  return (
    <div
      aria-labelledby={labelledBy}
      aria-modal="true"
      className={className}
      ref={panelRef}
      role={role}
    >
      {children}
    </div>
  )
}
