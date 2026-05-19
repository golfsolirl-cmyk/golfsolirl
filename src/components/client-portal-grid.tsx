import type { ReactNode } from 'react'
import { cx } from '../lib/utils'

type ClientPortalGridProps = {
  readonly greeting: ReactNode
  readonly cards: ReactNode
  readonly expandedPanel: ReactNode | null
}

export function ClientPortalGrid({ greeting, cards, expandedPanel }: ClientPortalGridProps) {
  return (
    <div className="mb-12 md:mb-14">
      {greeting}

      <div
        className={cx(
          'grid gap-4 sm:grid-cols-2 sm:gap-5',
          expandedPanel ? 'xl:grid-cols-2' : 'xl:grid-cols-3'
        )}
      >
        {cards}
      </div>

      {expandedPanel ? (
        <div className="mt-6 md:mt-8" id="client-portal-expanded-panel">
          {expandedPanel}
        </div>
      ) : null}
    </div>
  )
}
