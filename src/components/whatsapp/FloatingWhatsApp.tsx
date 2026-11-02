import { m, useReducedMotion } from 'framer-motion'
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
  const zoneLeft = window.innerWidth - 300
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

export function FloatingWhatsApp() {
  const reduceMotion = useReducedMotion()
  const [bottom, setBottom] = useState(20)
  const [hidden, setHidden] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const mobile = window.innerWidth < 768
        const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
        const buttonBlock = mobile ? 88 : 72
        const maxBottom = Math.max(16, Math.floor(window.innerHeight - Math.max(0, headerBottom) - buttonBlock - 8))
        const nextHidden = (mobile && fieldIsFocused()) || (mobile && cookieBannerOpen())
        const nextBottom = Math.min(maxBottom, Math.max(16, obstacleLift()))
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

  return (
    <m.a
      href={createWhatsAppLink(MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      aria-label={`Not tech savvy? WhatsApp GolfSol Ireland on ${WHATSAPP_DISPLAY}`}
      data-whatsapp-fab="true"
      onClick={() =>
        trackWhatsAppClick({
          sourcePage: currentPath(),
          componentVariant: 'floating',
          enquiryType: 'booking_help'
        })
      }
      style={{ bottom: `max(${bottom}px, env(safe-area-inset-bottom))` }}
      className={cx(
        'group fixed right-3 z-[30] inline-flex min-h-14 max-w-[min(16rem,calc(100vw-1.5rem))] items-center gap-2.5 rounded-[1.8rem_1.15rem_1.7rem_1.05rem] border border-[#d9be7a] bg-[#062016] py-2 pl-2.5 pr-4 text-white shadow-[0_12px_30px_rgba(6,32,22,0.28)]',
        'hover:bg-[#0b3d2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4dfa6] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'md:z-[54]',
        hidden && 'pointer-events-none invisible'
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: ready || reduceMotion ? 1 : 0, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-[#062016]">
        <WhatsAppIcon className="h-6 w-6" />
      </span>
      <span className="min-w-0 text-left">
        <span className="block font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#f4dfa6]">
          Not tech savvy?
        </span>
        <span className="block font-ge text-base font-bold leading-tight text-white">{WHATSAPP_DISPLAY}</span>
      </span>
    </m.a>
  )
}
