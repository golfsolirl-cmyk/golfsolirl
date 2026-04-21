import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { GeFooter } from '../../pages/golf-experience/sections/ge-footer'
import { GeNavbar } from '../../pages/golf-experience/sections/ge-navbar'
import { WhatsappFab } from '../../pages/golf-experience/components/whatsapp-fab'

const COOKIE_STORAGE_KEY = 'gsol-cookie-banner-dismissed'

interface PublicSiteShellProps {
  readonly children: ReactNode
  readonly mainId?: string
  readonly pageClassName?: string
  readonly showFooter?: boolean
  readonly showWhatsAppFab?: boolean
}

export function PublicSiteShell({
  children,
  mainId = 'main',
  pageClassName,
  showFooter = true,
  showWhatsAppFab = true
}: PublicSiteShellProps) {
  const [cookieDismissed, setCookieDismissed] = useState(true)

  useEffect(() => {
    setCookieDismissed(window.localStorage.getItem(COOKIE_STORAGE_KEY) === 'true')
  }, [])

  const handleDismissCookies = () => {
    window.localStorage.setItem(COOKIE_STORAGE_KEY, 'true')
    setCookieDismissed(true)
  }

  return (
    <div className={['ge-page min-h-screen overflow-x-hidden bg-white', pageClassName].filter(Boolean).join(' ')}>
      <a
        href={`#${mainId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-gs-gold focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
      >
        Skip to content
      </a>
      <GeNavbar />
      <main id={mainId}>{children}</main>
      {showFooter ? <GeFooter /> : null}
      {showWhatsAppFab ? <WhatsappFab /> : null}
      {cookieDismissed ? null : <CookieBanner onDismiss={handleDismissCookies} />}
    </div>
  )
}

function CookieBanner({ onDismiss }: { readonly onDismiss: () => void }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="fixed bottom-4 left-4 right-4 z-[110] rounded-[1.75rem] border border-white/40 bg-gs-dark/94 p-4 text-white shadow-[0_20px_60px_rgba(6,59,42,0.34)] backdrop-blur-xl md:left-6 md:right-auto md:max-w-[460px]"
      aria-label="Cookie notice"
    >
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-gs-gold">Cookie notice</p>
      <p className="mt-2 text-sm leading-6 text-white/82">
        We use cookies for analytics, performance, and a smoother enquiry journey across the site.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffc72c_0%,#ffe27a_100%)] px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-gs-dark"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white"
        >
          Dismiss
        </button>
      </div>
    </motion.aside>
  )
}
