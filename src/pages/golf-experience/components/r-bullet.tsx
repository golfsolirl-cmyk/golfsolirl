import type { ReactNode } from 'react'
import { cx } from '../../../lib/utils'

interface RBulletProps {
  readonly title: string
  readonly children: ReactNode
  readonly className?: string
}

/**
 * "R" green-tick bullet used on the source site's "Golf Experience Facts" trio.
 * Renders a circled R glyph in teal, with title + body to the right.
 */
export function RBullet({ title, children, className }: RBulletProps) {
  return (
    <div className={cx('flex items-start gap-4', className)}>
      <span
        aria-hidden="true"
        className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ge-blue font-ge text-base font-extrabold text-white shadow-sm"
      >
        R
      </span>
      <div>
        <h4 className="font-ge text-[1.18rem] font-bold uppercase tracking-[0.06em] text-ge-blue">
          {title}
        </h4>
        <div className="mt-2 font-ge text-[0.96rem] leading-7 text-ge-gray500">
          {children}
        </div>
      </div>
    </div>
  )
}
