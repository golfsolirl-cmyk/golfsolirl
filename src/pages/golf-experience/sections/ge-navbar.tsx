import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import { cx } from '../../../lib/utils'
import { GeButton } from '../components/ge-button'
import { GeLogo } from '../components/ge-logo'
import { primaryNav, type GeNavLink } from '../data/nav'
import { GeTopBar } from './top-bar'

interface GeNavbarProps {
  /** Render mode: 'overlay' floats white text over the hero, 'solid' is a sticky white bar. */
  readonly mode?: 'auto'
}

export function GeNavbar({ mode = 'auto' }: GeNavbarProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen])

  const isOverlay = mode === 'auto' && !isScrolled && !isMenuOpen
  const linkColor = isOverlay ? 'text-white hover:text-white/80' : 'text-ge-ink hover:text-ge-blue'

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        isOverlay
          ? 'bg-transparent'
          : 'bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur'
      )}
    >
      {isOverlay ? <GeTopBar /> : null}
      <div
        className={cx(
          'mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 transition-all duration-300',
          isOverlay ? 'py-3' : 'py-2'
        )}
      >
        <a
          href="#top"
          aria-label="Golf Experience home"
          className="shrink-0 transition-transform duration-300"
        >
          <GeLogo size={isOverlay ? 84 : 60} />
        </a>

        <nav aria-label="Primary navigation" className="hidden items-center gap-x-6 lg:flex">
          {primaryNav.map((link) => (
            <DesktopNavItem key={link.label} link={link} colorClass={linkColor} />
          ))}
          <GeButton href="#enquire" size="sm" variant={isOverlay ? 'outline-white' : 'blue'}>
            Enquire
          </GeButton>
        </nav>

        <button
          type="button"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="ge-mobile-menu"
          className={cx(
            'inline-flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors lg:hidden',
            isOverlay
              ? 'border-white/60 text-white hover:border-white hover:bg-white/15'
              : 'border-ge-gray200 text-ge-ink hover:border-ge-blue hover:text-ge-blue'
          )}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            id="ge-mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="border-t border-ge-gray100 bg-white lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="mx-auto max-w-[1280px] px-5 py-4">
              <ul className="flex flex-col divide-y divide-ge-gray100">
                {primaryNav.map((link) => (
                  <li key={link.label}>
                    {link.children?.length ? (
                      <div>
                        <button
                          type="button"
                          className="flex min-h-[48px] w-full items-center justify-between py-3 text-left font-ge text-sm font-bold uppercase tracking-[0.1em] text-ge-ink"
                          onClick={() =>
                            setOpenSubmenu((current) => (current === link.label ? null : link.label))
                          }
                          aria-expanded={openSubmenu === link.label}
                        >
                          <span>{link.label}</span>
                          <ChevronDown
                            className={cx(
                              'h-4 w-4 transition-transform',
                              openSubmenu === link.label ? 'rotate-180' : ''
                            )}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {openSubmenu === link.label ? (
                            <motion.ul
                              key="sublist"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pb-3 pl-4"
                            >
                              {link.children.map((child) => (
                                <li key={child.label}>
                                  <a
                                    href={child.href}
                                    className="block min-h-[44px] py-2 text-sm text-ge-gray500 hover:text-ge-blue"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    {child.label}
                                  </a>
                                </li>
                              ))}
                            </motion.ul>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <a
                        href={link.href}
                        className="block min-h-[48px] py-3 font-ge text-sm font-bold uppercase tracking-[0.1em] text-ge-ink hover:text-ge-blue"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <GeButton href="#enquire" size="md" variant="blue" className="w-full">
                  Enquire Now
                </GeButton>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

function DesktopNavItem({ link, colorClass }: { readonly link: GeNavLink; readonly colorClass: string }) {
  const [open, setOpen] = useState(false)
  const hasChildren = Boolean(link.children?.length)

  return (
    <div
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
      onFocus={() => hasChildren && setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false)
        }
      }}
    >
      <a
        href={link.href}
        className={cx(
          'inline-flex items-center gap-1 whitespace-nowrap font-ge text-[0.78rem] font-bold uppercase tracking-[0.12em] transition-colors',
          colorClass
        )}
      >
        {link.label}
        {hasChildren ? <ChevronDown className="h-3 w-3" /> : null}
      </a>
      <AnimatePresence>
        {open && hasChildren && link.children ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 rounded-sm border border-ge-gray100 bg-white py-2 shadow-lg"
          >
            {link.children.map((child) => (
              <a
                key={child.label}
                href={child.href}
                className="block px-4 py-2.5 font-ge text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ge-ink hover:bg-ge-gray50 hover:text-ge-blue"
              >
                {child.label}
              </a>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
