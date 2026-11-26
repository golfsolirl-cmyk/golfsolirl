import { m, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cx } from '../../lib/utils'
import {
  createWhatsAppLink,
  trackWhatsAppClick,
  WHATSAPP_DISPLAY,
  WHATSAPP_MESSAGES
} from '../../lib/whatsapp'
import { WhatsAppIcon } from './WhatsAppIcon'

const MESSAGE = WHATSAPP_MESSAGES.booking_help
const DISMISS_KEY = 'gsol-whatsapp-fab-dismissed'

function currentPath() {
  if (typeof window === 'undefined') return '/'
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

function cookieBannerOpen() {
  const banner = document.querySelector<HTMLElement>('.gsol-cookie-banner')
  if (!banner) return false
  const rect = banner.getBoundingClientRect()
  return rect.width > 8 && rect.height > 8 && rect.bottom > 0 && rect.top < window.innerHeight
}

/** Raise the button above a short bottom bar. Never use this to jump over a full-height banner. */
function obstacleLift() {
  const zoneLeft = window.innerWidth - 120
  let lift = 0
  const nodes = document.querySelectorAll<HTMLElement>('.portal-bottom-nav')
  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect()
    if (rect.width < 8 || rect.height < 8 || rect.height > window.innerHeight * 0.45) return
    const reachesButton = rect.right > zoneLeft && rect.left < window.innerWidth - 8
    const pinnedToBottom = rect.bottom >= window.innerHeight - 12 && rect.top < window.innerHeight
    if (!reachesButton || !pinnedToBottom) return
    lift = Math.max(lift, Math.ceil(window.innerHeight - rect.top) + 12)
  })
  return lift
}

function fieldIsFocused() {
  const active = document.activeElement
  if (!(active instanceof HTMLElement)) return false
  return active.matches('input, textarea, select, [contenteditable="true"]')
}

function readDismissed() {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export function FloatingWhatsApp() {
  const reduceMotion = useReducedMotion()
  const [bottom, setBottom] = useState(16)
  const [hidden, setHidden] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [ready, setReady] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setDismissed(readDismissed())
  }, [])

  useEffect(() => {
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const mobile = window.innerWidth < 768
        const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
        const buttonBlock = 56
        const maxBottom = Math.max(12, Math.floor(window.innerHeight - Math.max(0, headerBottom) - buttonBlock - 8))
        // Keep the compact FAB visible even when the cookie bar is open — only hide for focused fields.
        const nextHidden = mobile && fieldIsFocused()
        const cookieLift = mobile && cookieBannerOpen() ? 72 : 0
        const nextBottom = Math.min(maxBottom, Math.max(12, obstacleLift() + cookieLift))
        setHidden((current) => (current === nextHidden ? current : nextHidden))
        setBottom((current) => (current === nextBottom ? current : nextBottom))
        setReady(true)
      })
    }

    measure()
    const root = document.getElementById('root') ?? document.body
    const observer = new MutationObserver((mutations) => {
      const relevant = mutations.some((mutation) =>
        [...mutation.addedNodes, ...mutation.removedNodes].some((node) => {
          if (!(node instanceof HTMLElement)) return false
          return (
            node.matches('.gsol-cookie-banner, .portal-bottom-nav, header') ||
            Boolean(node.querySelector('.gsol-cookie-banner, .portal-bottom-nav, header'))
          )
        })
      )
      if (relevant) measure()
    })
    observer.observe(root, { childList: true, subtree: true })
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    document.addEventListener('focusin', measure)
    document.addEventListener('focusout', measure)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
      document.removeEventListener('focusin', measure)
      document.removeEventListener('focusout', measure)
    }
  }, [])

  if (dismissed) return null

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore quota / private mode */
    }
    setDismissed(true)
  }

  return (
    <div
      style={{ bottom: `max(${bottom}px, env(safe-area-inset-bottom))` }}
      className={cx(
        'fixed right-3 z-[30] flex flex-col items-end gap-2 md:z-[54]',
        (hidden || !ready) && 'pointer-events-none invisible'
      )}
    >
      {expanded ? (
        <m.div
          initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          className="relative max-w-[min(15rem,calc(100vw-1.5rem))] rounded-2xl border border-[#d9be7a]/80 bg-[#062016] p-3 text-white shadow-[0_10px_24px_rgba(6,32,22,0.28)]"
        >
          <button
            type="button"
            aria-label="Close WhatsApp help"
            onClick={dismiss}
            className="absolute -right-1.5 -top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#0b3d2e] text-white hover:bg-[#12523d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4dfa6]"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
          <p className="pr-5 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-[#f4dfa6]">
            Prefer a call?
          </p>
          <a
            href={createWhatsAppLink(MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block font-ge text-sm font-bold leading-snug text-white underline-offset-2 hover:underline"
            onClick={() =>
              trackWhatsAppClick({
                sourcePage: currentPath(),
                componentVariant: 'floating',
                enquiryType: 'booking_help'
              })
            }
          >
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
          <button
            type="button"
            className="mt-2 font-ge text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-white/70 hover:text-white"
            onClick={() => setExpanded(false)}
          >
            Minimise
          </button>
        </m.div>
      ) : null}

      <div className="relative">
        <m.a
          href={createWhatsAppLink(MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp GolfSol Ireland on ${WHATSAPP_DISPLAY}`}
          data-whatsapp-fab="true"
          onClick={() =>
            trackWhatsAppClick({
              sourcePage: currentPath(),
              componentVariant: 'floating',
              enquiryType: 'booking_help'
            })
          }
          className={cx(
            'inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#25D366] text-[#062016] shadow-[0_8px_20px_rgba(6,32,22,0.28)]',
            'hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4dfa6] focus-visible:ring-offset-2 focus-visible:ring-offset-white'
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeOut' }}
        >
          <WhatsAppIcon className="h-6 w-6" />
        </m.a>
        <button
          type="button"
          aria-label="Dismiss WhatsApp button"
          onClick={dismiss}
          className="absolute -left-1.5 -top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-forest-800/20 bg-white text-forest-900 shadow-sm hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
        {!expanded ? (
          <button
            type="button"
            aria-label="Show WhatsApp number"
            onClick={() => setExpanded(true)}
            className="sr-only"
          >
            Show number
          </button>
        ) : null}
      </div>
    </div>
  )
}
