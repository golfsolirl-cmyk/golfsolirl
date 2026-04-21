import { useEffect, useState, type ReactNode } from 'react'
import { GeFooter } from '../../pages/golf-experience/sections/ge-footer'
import { GeNavbar } from '../../pages/golf-experience/sections/ge-navbar'
import { WhatsappFab } from '../../pages/golf-experience/components/whatsapp-fab'
import { cx } from '../../lib/utils'

const COOKIE_BANNER_KEY = 'gsol-cookie-banner-dismissed'

function PublicCookieBanner({
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
    <div className="fixed bottom-4 left-4 right-4 z-[70] sm:right-auto sm:max-w-md">
      <div className="overflow-hidden rounded-2xl border border-gs-dark/10 bg-white/96 shadow-[0_24px_60px_rgba(6,59,42,0.18)] backdrop-blur">
        <div className="h-1 bg-[linear-gradient(90deg,#0B6B45_0%,#1ED760_50%,#FFC72C_100%)]" aria-hidden />
        <div className="space-y-4 p-4 sm:p-5">
          <div>
            <p className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.18em] text-ge-orange">
              Cookies
            </p>
            <p className="mt-2 font-ge text-[0.98rem] leading-7 text-ge-gray500">
              We use cookies to keep the trip-planning journey smooth, remember preferences, and understand what pages help golfers convert.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onAccept}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gs-green px-5 font-ge text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-gs-electric hover:text-gs-dark"
            >
              Accept cookies
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-gs-green px-5 font-ge text-sm font-bold uppercase tracking-[0.12em] text-gs-green transition-colors hover:bg-gs-green hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PublicSiteShell({
  children,
  className,
  withFooter = true,
  withCookieBanner = true,
  withWhatsApp = true,
  withTopSpacer = false,
  topSpacerClassName
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly withFooter?: boolean
  readonly withCookieBanner?: boolean
  readonly withWhatsApp?: boolean
  readonly withTopSpacer?: boolean
  readonly topSpacerClassName?: string
}) {
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(true)

  useEffect(() => {
    try {
      setHasAcceptedCookies(localStorage.getItem(COOKIE_BANNER_KEY) === 'true')
    } catch {
      setHasAcceptedCookies(true)
    }
  }, [])

  const handleAcceptCookies = () => {
    try {
      localStorage.setItem(COOKIE_BANNER_KEY, 'true')
    } catch {
      // Ignore private mode / storage failures and still hide the banner.
    }
    setHasAcceptedCookies(true)
  }

  return (
    <div className={cx('ge-page min-h-screen overflow-x-hidden bg-white', className)}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gs-gold focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
      >
        Skip to content
      </a>
      <GeNavbar />
      {withTopSpacer ? (
        <div
          aria-hidden="true"
          className={cx(
            'h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]',
            topSpacerClassName
          )}
        />
      ) : null}
      {children}
      {withFooter ? <GeFooter /> : null}
      {withWhatsApp ? <WhatsappFab /> : null}
      {withCookieBanner ? (
        <PublicCookieBanner hidden={hasAcceptedCookies} onAccept={handleAcceptCookies} />
      ) : null}
    </div>
  )
}
