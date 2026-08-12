import { m } from 'framer-motion'

export function CookieBanner({
  hidden,
  onAccept
}: {
  readonly hidden: boolean
  readonly onAccept: () => void
}) {
  if (hidden) {
    return null
  }

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className="gsol-cookie-banner fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[55] rounded-2xl border border-forest-200 bg-white p-4 text-forest-950 shadow-[0_12px_40px_rgba(6,32,22,0.14)] sm:inset-x-auto sm:left-4 sm:max-w-md"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="relative z-10">
        <p className="font-ge text-xs font-extrabold uppercase tracking-[0.14em] text-brand-700">Cookie notice</p>
        <p className="mt-2 text-base leading-relaxed text-forest-800">
          We use cookies to improve your experience, understand site traffic, and keep booking smooth.
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <button
            className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center rounded-xl bg-brand-800 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-700 sm:flex-none"
            onClick={onAccept}
            type="button"
          >
            Accept cookies
          </button>
          <button
            className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center rounded-xl border-2 border-forest-200 bg-white px-4 py-2.5 text-base font-semibold text-forest-900 transition-colors hover:border-fairway-400 hover:bg-fairway-50 sm:flex-none"
            onClick={onAccept}
            type="button"
          >
            Dismiss
          </button>
        </div>
      </div>
    </m.div>
  )
}
