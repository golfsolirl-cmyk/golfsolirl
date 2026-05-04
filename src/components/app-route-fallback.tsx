import { golfsolCrestFooterPng } from '../pages/golf-experience/data/brand-assets'

/** Shown while lazy route chunks load — crest + short line, no motion. */
export function AppRouteFallback() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-offwhite bg-[radial-gradient(ellipse_at_50%_32%,rgba(11,107,69,0.09)_0%,transparent_52%)] px-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">Loading page…</p>

      <div className="flex flex-col items-center gap-8">
        <img
          src={golfsolCrestFooterPng}
          alt=""
          width={800}
          height={533}
          decoding="async"
          fetchPriority="high"
          aria-hidden
          className="h-[min(24vh,188px)] w-auto max-w-[min(88vw,440px)] select-none object-contain drop-shadow-[0_14px_32px_rgba(6,59,42,0.22)]"
        />

        <p className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.28em] text-gs-dark/50">
          Teeing up…
        </p>
      </div>
    </div>
  )
}
