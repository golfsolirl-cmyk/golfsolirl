import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import { cx } from '../../../lib/utils'
import { GeButton } from '../components/ge-button'
import { GeLogo } from '../components/ge-logo'
import { primaryNav, type GeNavLink } from '../data/nav'

export function GeNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen])

  return (
    <div className="sticky top-0 z-40 border-b border-ge-gray100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-3">
        <a href="#top" aria-label="Golf Experience home" className="shrink-0">
          <GeLogo />
        </a>

        <nav aria-label="Primary navigation" className="hidden items-center gap-5 lg:flex">
          {primaryNav.slice(0, 9).map((link) => (
            <DesktopNavItem key={link.label} link={link} />
          ))}
          <GeButton href="#enquire" size="sm" variant="orange">
            Enquire
          </GeButton>
        </nav>

        <button
          type="button"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded border border-ge-gray200 text-ge-ink transition-colors hover:border-ge-teal hover:text-ge-teal lg:hidden"
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="border-t border-ge-gray100 bg-white lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="mx-auto max-w-[1180px] px-5 py-4">
              <ul className="flex flex-col divide-y divide-ge-gray100">
                {primaryNav.map((link) => (
                  <li key={link.label}>
                    {link.children?.length ? (
                      <div>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between py-3 text-left font-ge text-sm font-bold uppercase tracking-[0.1em] text-ge-ink"
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
                                    className="block py-2 text-sm text-ge-gray500 hover:text-ge-teal"
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
                        className="block py-3 font-ge text-sm font-bold uppercase tracking-[0.1em] text-ge-ink hover:text-ge-teal"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <GeButton href="#enquire" size="md" variant="orange" className="w-full">
                  Enquire Now
                </GeButton>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function DesktopNavItem({ link }: { readonly link: GeNavLink }) {
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
        className="inline-flex items-center gap-1 font-ge text-[0.78rem] font-bold uppercase tracking-[0.12em] text-ge-ink transition-colors hover:text-ge-teal"
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
            className="absolute left-1/2 top-full z-50 mt-3 w-52 -translate-x-1/2 rounded-sm border border-ge-gray100 bg-white py-2 shadow-lg"
          >
            {link.children.map((child) => (
              <a
                key={child.label}
                href={child.href}
                className="block px-4 py-2 font-ge text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ge-ink hover:bg-ge-gray50 hover:text-ge-teal"
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
