import { ArrowRight } from 'lucide-react'
import { BUNDLE_DURATIONS } from '../../../data/golf-holiday-bundles'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'

/** Homepage: one clear offer — golf holiday bundles. */
export function GeHomeBundlesTeaser() {
  return (
    <GeSection background="cream" className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-gs-green">
          Golf holiday bundles
        </p>
        <h2 className="mt-3 font-ge text-[1.85rem] font-extrabold leading-tight tracking-[-0.02em] text-gs-dark sm:text-[2.35rem]">
          Pick your nights. Pick your rounds. We quote the rest.
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-ge text-[1.02rem] leading-7 text-ge-gray500">
          Three stay lengths, three golf options in each, and Value / Classic / Premium hotels.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
        {BUNDLE_DURATIONS.map((duration) => (
          <a
            key={duration.id}
            href={`/bundles#${duration.id}`}
            className="group rounded-2xl border border-chrome-300/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-700/40 hover:shadow-md"
          >
            <span className="inline-flex rounded-md bg-gs-green/10 px-2.5 py-1 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-gs-green">
              {duration.badge}
            </span>
            <h3 className="mt-3 font-ge text-lg font-extrabold text-gs-dark">{duration.title}</h3>
            <ul className="mt-3 space-y-1.5 font-ge text-sm text-ge-gray600">
              {duration.packages.map((pkg) => (
                <li key={pkg.id}>
                  {pkg.name} · {pkg.rounds} rounds
                </li>
              ))}
            </ul>
            <span className="mt-4 inline-flex items-center gap-1 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700 group-hover:text-gs-dark">
              View bundle
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </a>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <GeButton href="/bundles" variant="gs-green" size="lg">
          View all bundles
          <ArrowRight className="h-4 w-4" aria-hidden />
        </GeButton>
        <GeButton href="/contact" variant="outline-gs-green" size="lg">
          Get a quote
        </GeButton>
      </div>
    </GeSection>
  )
}
