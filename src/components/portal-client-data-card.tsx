import type { ClientDataCardSection } from '../lib/client-data-card'
import { cx } from '../lib/utils'

export function PortalClientDataCard({ sections }: { readonly sections: readonly ClientDataCardSection[] }) {
  if (sections.length === 0) {
    return (
      <div
        className="rounded-3xl border-2 border-gs-gold/35 bg-gradient-to-br from-white to-ge-gray50/80 p-8 shadow-[0_20px_50px_rgba(11,73,52,0.08)] ring-1 ring-gs-green/10"
        role="region"
        aria-label="Your submitted details"
      >
        <p className="font-ge text-sm leading-relaxed text-ge-gray500">
          When you submit forms on the website with this account&apos;s email, your answers will appear here in clear
          sections — nothing is shown until there is something to display.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8" role="region" aria-label="Your submitted details">
      {sections.map((section) => (
        <article
          key={section.id}
          className={cx(
            'overflow-hidden rounded-3xl border-2 border-gs-gold/40 bg-gradient-to-br from-white via-white to-ge-gray50/90',
            'shadow-[0_22px_56px_rgba(11,73,52,0.1)] ring-1 ring-gs-green/15'
          )}
        >
          <header className="border-b border-ge-gray100 bg-ge-gray50/60 px-6 py-5 sm:px-8">
            <h2 className="font-ge text-lg font-extrabold tracking-tight text-gs-dark sm:text-xl">{section.title}</h2>
            {section.subtitle ? (
              <p className="mt-1 font-ge text-xs font-semibold uppercase tracking-[0.16em] text-ge-gray500">
                {section.subtitle}
              </p>
            ) : null}
          </header>
          <dl className="grid gap-0 divide-y divide-ge-gray100 sm:grid-cols-2">
            {section.rows.map((row) => (
              <div key={`${section.id}-${row.label}`} className="px-6 py-4 sm:px-8">
                <dt className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-gs-green">
                  {row.label}
                </dt>
                <dd className="mt-1.5 font-ge text-sm font-medium leading-relaxed text-gs-dark sm:text-[0.95rem]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  )
}
