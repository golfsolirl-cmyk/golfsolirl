import { Flag } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { BrandLogoPicture } from './brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentChoice
} from '../lib/cookie-consent'

const buttonClass =
  'inline-flex min-h-11 w-full items-center justify-center rounded-full px-3 py-2.5 text-center font-ge text-[0.95rem] font-bold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a843] focus-visible:ring-offset-2 sm:px-4'

function ChoiceButtons({ onChoose }: { readonly onChoose: (choice: CookieConsentChoice['choice']) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <button className={`${buttonClass} bg-[#d4a843] text-[#062016] hover:bg-[#e2bc62]`} onClick={() => onChoose('accept')} type="button">
        Accept All
      </button>
      <button
        className={`${buttonClass} border-2 border-[#0b3123] bg-white text-[#0b3123] hover:bg-[#f4f7f5]`}
        onClick={() => onChoose('reject')}
        type="button"
      >
        Reject Optional
      </button>
      <button
        className={`${buttonClass} border-2 border-[#0b3123]/20 bg-[#f7f3ea] text-[#0b3123] hover:border-[#0b3123]/40`}
        onClick={() => onChoose('save')}
        type="button"
      >
        Save My Preferences
      </button>
    </div>
  )
}

export function CookieConsent() {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const panelTitleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [saved, setSaved] = useState<CookieConsentChoice | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    setSaved(readCookieConsent())
    setReady(true)
    if (window.location.hash === '#settings') setPanelOpen(true)
    const open = () => setPanelOpen(true)
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, open)
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, open)
  }, [])

  useEffect(() => {
    if (!panelOpen) return
    const node = panelRef.current
    node?.querySelector<HTMLElement>('button, a')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen])

  if (!ready) return null
  if (saved && !panelOpen) return null

  const choose = (choice: CookieConsentChoice['choice']) => {
    setSaved(writeCookieConsent(choice))
    setPanelOpen(false)
  }

  const motion = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }
  const initial = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }

  return (
    <m.div
      animate={motion}
      className="gsol-cookie-banner pointer-events-none fixed inset-x-0 bottom-0 z-[58] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 md:pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.75rem))] md:pr-28"
      initial={initial}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
    >
      {panelOpen ? (
        <div
          ref={panelRef}
          aria-labelledby={panelTitleId}
          aria-modal="false"
          className="pointer-events-auto mx-auto max-h-[min(78vh,40rem)] max-w-[560px] overflow-y-auto rounded-[1.4rem] border border-[#d4a843]/45 bg-[#fffdf8] p-5 text-[#062016] shadow-[0_22px_60px_rgba(6,32,22,0.22)] sm:p-6"
          role="dialog"
        >
          <div className="flex items-start gap-3">
            <BrandLogoPicture
              alt=""
              className="h-11 w-11 shrink-0 object-contain"
              decoding="async"
              height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
              ignoreTestVariant
              width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
            />
            <div>
              <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-[#8a6a22]">GolfSol Ireland</p>
              <h2 className="mt-1 font-ge text-xl font-bold leading-tight" id={panelTitleId}>
                Cookie preferences
              </h2>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#0b3123]/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-ge text-base font-bold">Strictly necessary</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#3d5248]">
                  Keeps the site working. This covers your cookie choice, and a sign-in session only after you log in to the trip desk or admin desk. Always on.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#0b3123] px-2.5 py-1 font-ge text-[0.68rem] font-bold uppercase tracking-wide text-[#f4e4bc]">
                On
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[#3d5248]">
            We do not use analytics or advertising cookies. Nothing from Google Analytics, Google Ads, or Meta is loaded. Accept all and reject optional do the same thing today. If that ever changes, we will ask again before anything optional is switched on.
          </p>

          <div className="mt-5">
            <ChoiceButtons onChoose={choose} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <a className="font-ge text-sm font-semibold text-[#0b3123] underline decoration-[#d4a843] underline-offset-4" href="/cookie-policy">
              Cookie policy
            </a>
            <button className="font-ge text-sm font-semibold text-[#3d5248] underline-offset-4 hover:underline" onClick={() => setPanelOpen(false)} type="button">
              {saved ? 'Close' : 'Back'}
            </button>
          </div>
        </div>
      ) : (
        <div
          aria-labelledby={titleId}
          className="pointer-events-auto mx-auto max-w-[560px] rounded-[1.4rem] border border-[#d4a843]/50 bg-[#fffdf8] p-4 text-[#062016] shadow-[0_22px_60px_rgba(6,32,22,0.2)] sm:p-5"
          role="dialog"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b3123] text-[#d4a843]" aria-hidden="true">
              <Flag className="h-5 w-5" />
            </span>
            <div>
              <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-[#8a6a22]">GolfSol Ireland</p>
              <h2 className="mt-1 font-ge text-lg font-bold leading-snug sm:text-xl" id={titleId}>
                A little housekeeping before you tee off! <span aria-hidden="true">⛳</span>
              </h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#24362e] sm:text-[0.95rem]">
            We use essential cookies to keep the website working. We do not use optional analytics or advertising cookies. You are in control of this choice.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button className={`${buttonClass} bg-[#d4a843] text-[#062016] hover:bg-[#e2bc62]`} onClick={() => choose('accept')} type="button">
              Accept All
            </button>
            <button
              className={`${buttonClass} border-2 border-[#0b3123] bg-white text-[#0b3123] hover:bg-[#f4f7f5]`}
              onClick={() => choose('reject')}
              type="button"
            >
              Reject Optional
            </button>
            <button
              className={`${buttonClass} border-2 border-[#0b3123]/20 bg-white text-[#0b3123] hover:border-[#d4a843]`}
              onClick={() => setPanelOpen(true)}
              type="button"
            >
              Customise
            </button>
          </div>
          <a className="mt-3 inline-block font-ge text-sm font-semibold text-[#0b3123] underline decoration-[#d4a843] underline-offset-4" href="/cookie-policy">
          Cookie policy
        </a>
      </div>
      )}
    </m.div>
  )
}
