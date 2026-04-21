import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { contactInfo } from '../data/copy'
import { getGeContentPage } from '../data/content-pages'
import {
  buildContentPageWhatsAppMessage,
  buildGeneralWhatsAppMessage,
  buildTransportWhatsAppMessage,
  buildWhatsAppHref
} from '../../../lib/smart-enquiry'

/**
 * Floating WhatsApp action button.
 *
 * Visibility rules:
 *   • Desktop / tablet (>= 768px): always visible.
 *   • Mobile (< 768px): hidden until the user has scrolled past the
 *     "Contact Us" block in the footer (id="contact-us"). This keeps the
 *     mobile viewport clean while the user is reading the page, and only
 *     surfaces the FAB once they've reached the bottom and clearly want
 *     to get in touch.
 *
 * Visual treatment:
 *   • Dark forest-green fill so it sits flush with the brand.
 *   • Gold hairline ring (matches the gold ribbons elsewhere on the page).
 *   • Subtle outer gold glow + gentle "ping" pulse to draw the eye without
 *     screaming for attention.
 */

const WHATSAPP_NUMBER = contactInfo.phoneTel.replace(/[^0-9]/g, '')
const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`

const MOBILE_BREAKPOINT_PX = 768

function WhatsappGlyph({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M16.002 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.255.59 4.464 1.713 6.41L3.2 28.8l6.55-1.713a12.78 12.78 0 0 0 6.252 1.602h.005c7.07 0 12.8-5.73 12.8-12.8 0-3.42-1.332-6.635-3.752-9.054A12.711 12.711 0 0 0 16.002 3.2zm0 23.36h-.004a10.62 10.62 0 0 1-5.41-1.482l-.388-.23-3.88 1.014 1.036-3.778-.252-.4a10.61 10.61 0 0 1-1.626-5.683c0-5.872 4.78-10.65 10.654-10.65 2.846 0 5.52 1.11 7.532 3.122a10.583 10.583 0 0 1 3.118 7.532c0 5.873-4.78 10.654-10.78 10.654zm5.84-7.978c-.32-.16-1.894-.934-2.187-1.04-.293-.107-.507-.16-.72.16-.214.32-.827 1.04-1.014 1.253-.187.214-.374.24-.694.08-.32-.16-1.353-.499-2.578-1.59-.953-.85-1.597-1.9-1.784-2.22-.187-.32-.02-.494.14-.654.144-.143.32-.374.48-.56.16-.187.214-.32.32-.534.107-.214.054-.4-.026-.56-.08-.16-.72-1.736-.987-2.378-.26-.624-.524-.54-.72-.55l-.614-.012c-.214 0-.56.08-.854.4-.293.32-1.12 1.094-1.12 2.668 0 1.575 1.146 3.097 1.306 3.31.16.214 2.255 3.444 5.464 4.83.764.33 1.36.527 1.825.674.767.243 1.466.21 2.018.128.616-.092 1.894-.774 2.16-1.522.267-.747.267-1.388.187-1.522-.08-.134-.293-.214-.614-.374z" />
    </svg>
  )
}

export function WhatsappFab() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const whatsappHref = useMemo(() => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/'

    if (path === '/services/transport') {
      return buildWhatsAppHref(
        WHATSAPP_BASE_URL,
        buildTransportWhatsAppMessage({
          sourceLabel: 'transport page'
        })
      )
    }

    const contentPage = getGeContentPage(path)
    if (contentPage) {
      return buildWhatsAppHref(
        WHATSAPP_BASE_URL,
        buildContentPageWhatsAppMessage({
          pageTitle: contentPage.title,
          interestPreset: contentPage.interestPreset
        })
      )
    }

    return buildWhatsAppHref(
      WHATSAPP_BASE_URL,
      buildGeneralWhatsAppMessage({
        intro: "I'm interested in planning a Costa del Sol golf trip.",
        detailLines: [
          'Trip type: Golf holiday quote',
          'Group size: 1 to 8 golfers',
          'Help needed: Courses, hotel, and transfers'
        ],
        closing: 'Please send me the best next step.'
      })
    )
  }, [])

  // Track viewport size + scroll position to decide visibility.
  useEffect(() => {
    if (typeof window === 'undefined') return

    const evaluateVisibility = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT_PX
      setIsMobile(mobile)

      if (!mobile) {
        // Desktop / tablet: always show.
        setIsVisible(true)
        return
      }

      // Mobile: show only once the Contact Us block has scrolled into view.
      const contactBlock = document.getElementById('contact-us')
      if (!contactBlock) {
        setIsVisible(false)
        return
      }
      const rect = contactBlock.getBoundingClientRect()
      // "Past Contact Us" = the top of the block has crossed the bottom of
      // the viewport (i.e. the user has actually reached it).
      const reachedContact = rect.top <= window.innerHeight - 40
      setIsVisible(reachedContact)
    }

    evaluateVisibility()
    window.addEventListener('scroll', evaluateVisibility, { passive: true })
    window.addEventListener('resize', evaluateVisibility)
    return () => {
      window.removeEventListener('scroll', evaluateVisibility)
      window.removeEventListener('resize', evaluateVisibility)
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          key="whatsapp-fab"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat with GolfSol Ireland on WhatsApp at ${contactInfo.phoneDisplay}`}
          className="group fixed bottom-5 right-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-gs-dark text-gs-gold shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,199,44,0.55)] ring-1 ring-gs-gold/70 transition-all duration-300 hover:scale-105 hover:bg-[#063B2A] hover:text-gs-gold-light hover:shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_0_2px_rgba(255,226,122,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-gold focus-visible:ring-offset-2 focus-visible:ring-offset-gs-dark sm:bottom-6 sm:right-6 md:h-16 md:w-16"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          data-mobile={isMobile ? 'true' : 'false'}
        >
          {/* Gold hairline halo ping — drawn behind the button itself */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-gs-gold/60"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 animate-ping rounded-full ring-1 ring-gs-gold/40"
            style={{ animationDuration: '2.6s' }}
          />
          <WhatsappGlyph className="relative h-7 w-7 drop-shadow-[0_2px_6px_rgba(255,199,44,0.45)] md:h-8 md:w-8" />

          {/* Optional label that only appears on hover, desktop+ */}
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md border border-gs-gold/40 bg-gs-dark/95 px-3 py-1.5 font-ge text-xs font-extrabold uppercase tracking-[0.16em] text-gs-gold opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 md:block">
            Smart WhatsApp quote
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
