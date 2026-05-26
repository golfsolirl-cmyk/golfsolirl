import type { LucideIcon } from 'lucide-react'
import { cx } from '../lib/utils'

export type PortalBottomNavItem<T extends string> = {
  readonly id: T
  readonly label: string
  readonly icon: LucideIcon
  readonly badge?: boolean
}

type PortalBottomNavProps<T extends string> = {
  readonly items: readonly PortalBottomNavItem<T>[]
  readonly activeId: T
  readonly onChange: (id: T) => void
  readonly ariaLabel: string
}

export function PortalBottomNav<T extends string>({
  items,
  activeId,
  onChange,
  ariaLabel
}: PortalBottomNavProps<T>) {
  return (
    <nav
      aria-label={ariaLabel}
      className="portal-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-forest-100/90 bg-white/97 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-12px_40px_rgba(6,32,22,0.08)] backdrop-blur-md lg:hidden"
    >
      <ul
        className={cx(
          'mx-auto grid max-w-lg list-none gap-0 p-0',
          items.length === 2 && 'grid-cols-2',
          items.length === 3 && 'grid-cols-3',
          items.length >= 4 && 'grid-cols-4'
        )}
      >
        {items.map((item) => {
          const Icon = item.icon
          const active = item.id === activeId
          return (
            <li key={item.id}>
              <button
                className={cx(
                  'relative flex w-full flex-col items-center gap-1 px-1 py-2.5 text-center transition',
                  active ? 'text-brand-700' : 'text-forest-600 hover:text-forest-900'
                )}
                onClick={() => onChange(item.id)}
                type="button"
              >
                {active ? (
                  <span aria-hidden className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-full bg-brand-600" />
                ) : null}
                <span className="relative inline-flex">
                  <Icon aria-hidden className={cx('h-6 w-6', active && 'text-brand-700')} strokeWidth={active ? 2.25 : 2} />
                  {item.badge ? (
                    <span className="absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
                  ) : null}
                </span>
                <span className={cx('max-w-full truncate px-0.5 text-[0.8125rem] font-bold leading-tight', active && 'text-brand-800')}>
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
