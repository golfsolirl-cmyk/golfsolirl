import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuxuryButton } from '../ui/button'
import { Logo } from '../ui/logo'
import { integrationRegistry } from '../../config/integrations'
import { isFooterArticlePath } from '../../data/footer-article-pages'
import { cx } from '../../lib/utils'
import { useAuth } from '../../providers/auth-provider'

interface NavbarProps {
  readonly links: readonly string[]
  readonly primaryCta: string
}

export function Navbar({ links, primaryCta }: NavbarProps) {
  const { session, profile, isLoading: authLoading } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const showAuthNav = integrationRegistry.supabase.enabled
  const dashboardHref = profile?.role === 'admin' ? '/dashboard/admin' : '/dashboard'
  const normalizedPath = window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/+$/, '')
  const isHome = normalizedPath === '/'
  const isPublicPackagePage = normalizedPath === '/packages' || normalizedPath === '/package'
  const isAdminPackagePage = normalizedPath === '/packages-admin' || normalizedPath === '/package-admin'
  const isPackagesRoute = isPublicPackagePage || isAdminPackagePage
  const isArticlePage = isFooterArticlePath(normalizedPath)
  const homeHref = isPackagesRoute || isArticlePage ? '/' : isHome ? '#home' : '/'
  const navHrefForLink = (link: string) => (isHome ? `#${link.toLowerCase()}` : `/#${link.toLowerCase()}`)
  const primaryHref = isPackagesRoute ? '#plan-trip' : '/packages'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      setIsMenuOpen(false)
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  const handleToggleMenu = () => {
    setIsMenuOpen((currentValue) => !currentValue)
  }

  const handleCloseMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6">
      <div
        className={cx(
          'mx-auto max-w-7xl border px-4 py-2.5 transition-all duration-300 md:rounded-full md:px-6',
          isMenuOpen
            ? 'rounded-[2rem] border-white/10 bg-forest-900/98 shadow-soft backdrop-blur-md'
            : isScrolled
              ? 'rounded-full border-white/10 bg-forest-900/95 shadow-soft backdrop-blur-md'
              : 'rounded-full border-white/10 bg-white/5 backdrop-blur-sm'
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <a
            aria-label="Go to Golf Sol Ireland homepage"
            className="max-w-[calc(100%-4.5rem)] transition-all duration-300"
            href={homeHref}
          >
            <Logo tone={isScrolled || isMenuOpen ? 'scrolled' : 'hero'} />
          </a>

          <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <a
                key={link}
                className="text-sm tracking-wide text-white/80 transition-colors hover:text-gold-400"
                href={navHrefForLink(link)}
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {showAuthNav && !authLoading ? (
              session ? (
                <LuxuryButton className="!px-5 !py-2.5 !text-xs" href={dashboardHref} variant="outline">
                  Dashboard
                </LuxuryButton>
              ) : (
                <LuxuryButton className="!px-5 !py-2.5 !text-xs" href="/login" variant="outline">
                  Sign in
                </LuxuryButton>
              )
            ) : null}
            <LuxuryButton href={primaryHref}>{primaryCta}</LuxuryButton>
          </div>

          <button
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:border-gold-400 hover:text-gold-400 md:hidden"
            onClick={handleToggleMenu}
            type="button"
          >
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-forest-900/95 px-4 pb-4 pt-4 shadow-soft backdrop-blur-md md:hidden"
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {links.map((link) => (
                <a
                  key={link}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80 transition-colors hover:border-gold-400/40 hover:text-gold-400"
                  href={navHrefForLink(link)}
                  onClick={handleCloseMenu}
                >
                  {link}
                </a>
              ))}
              {showAuthNav && !authLoading ? (
                session ? (
                  <LuxuryButton className="w-full justify-center !py-3" href={dashboardHref} onClick={handleCloseMenu} variant="outline">
                    Dashboard
                  </LuxuryButton>
                ) : (
                  <LuxuryButton className="w-full justify-center !py-3" href="/login" onClick={handleCloseMenu} variant="outline">
                    Sign in
                  </LuxuryButton>
                )
              ) : null}
              <LuxuryButton href={primaryHref} onClick={handleCloseMenu}>
                {primaryCta}
              </LuxuryButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  )
}
