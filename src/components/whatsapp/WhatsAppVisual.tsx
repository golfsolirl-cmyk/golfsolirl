import type { MouseEvent } from 'react'
import { useId } from 'react'
import { cx } from '../../lib/utils'
import { createWhatsAppLink, trackWhatsAppClick, type WhatsAppClickContext } from '../../lib/whatsapp'

type WhatsAppVisualProps = {
  readonly message: string
  readonly context: WhatsAppClickContext
  readonly className?: string
}

/**
 * Branded organic seal. The whole shape is the WhatsApp link.
 */
export function WhatsAppVisual({ message, context, className }: WhatsAppVisualProps) {
  const rawId = useId().replace(/:/g, '')
  const forest = `wa-forest-${rawId}`
  const gold = `wa-gold-${rawId}`
  const cream = `wa-cream-${rawId}`
  const glow = `wa-glow-${rawId}`
  const crestClip = `wa-crest-${rawId}`
  const href = createWhatsAppLink(message)

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    trackWhatsAppClick(context)
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label="Not tech savvy? WhatsApp GolfSol Ireland on 086 600 6202. Opens WhatsApp."
      className={cx(
        'group relative mx-auto block w-full max-w-[28rem] rounded-[2.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4dfa6] focus-visible:ring-offset-4 focus-visible:ring-offset-[#062016]',
        className
      )}
    >
      <style>{`
        .gsol-wa-blob-float { animation: gsol-wa-blob 7.5s ease-in-out infinite; }
        @keyframes gsol-wa-blob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gsol-wa-blob-float { animation: none !important; }
        }
      `}</style>
      <svg
        viewBox="0 0 560 640"
        className="gsol-wa-blob-float h-auto w-full drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)]"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={glow} cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#f4dfa6" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#128C7E" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#062016" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={forest} x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor="#146b52" />
            <stop offset="42%" stopColor="#0b3d2e" />
            <stop offset="100%" stopColor="#04140f" />
          </linearGradient>
          <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff4d2" />
            <stop offset="45%" stopColor="#d9be7a" />
            <stop offset="100%" stopColor="#8d7040" />
          </linearGradient>
          <linearGradient id={cream} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="100%" stopColor="#e7d7b0" />
          </linearGradient>
          <clipPath id={crestClip}>
            <circle cx="280" cy="150" r="48" />
          </clipPath>
        </defs>

        <ellipse cx="280" cy="320" rx="250" ry="280" fill={`url(#${glow})`} />

        <path
          d="M292 78c92-18 196 28 214 132 18 108-18 176-8 246 12 78-48 132-138 150-86 18-150-6-206-58-62-58-92-150-74-246 16-92 112-206 212-224z"
          fill="#d9be7a"
          opacity="0.35"
          transform="translate(10 12)"
        />

        <path
          className="transition-[stroke] duration-300 group-hover:stroke-[#fff6d8]"
          d="M286 64c98-16 208 36 222 142 14 112-22 184-8 252 16 78-58 140-152 156-92 16-168-10-226-70-64-66-96-168-74-268C70 152 176 82 286 64z"
          fill={`url(#${forest})`}
          stroke={`url(#${gold})`}
          strokeWidth="7"
        />

        <path
          d="M196 430c54-36 128-28 184 18 42 34 48 86-8 112-62 30-150 22-196-16-36-30-34-82 20-114z"
          fill="#25D366"
          opacity="0.16"
        />
        <path
          d="M214 448c46-24 104-16 146 20 28 24 24 58-12 74-48 22-118 14-152-18-26-24-22-58 18-76z"
          fill={`url(#${cream})`}
          opacity="0.92"
        />

        <circle cx="280" cy="150" r="54" fill="#f7f3ea" />
        <circle cx="280" cy="150" r="54" fill="none" stroke={`url(#${gold})`} strokeWidth="3" />
        <image
          href="/favicon-96x96.png"
          x="232"
          y="102"
          width="96"
          height="96"
          clipPath={`url(#${crestClip})`}
          preserveAspectRatio="xMidYMid slice"
        />

        <g transform="translate(448 468)">
          <circle cx="0" cy="0" r="28" fill="#075E54" stroke="#f4dfa6" strokeWidth="2" />
          <path
            fill="#ffffff"
            transform="translate(-13 -13) scale(0.82)"
            d="M16.002 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.255.59 4.464 1.713 6.41L3.2 28.8l6.55-1.713a12.78 12.78 0 0 0 6.252 1.602h.005c7.07 0 12.8-5.73 12.8-12.8 0-3.42-1.332-6.635-3.752-9.054A12.711 12.711 0 0 0 16.002 3.2zm5.84 15.382c-.32-.16-1.894-.934-2.187-1.04-.293-.107-.507-.16-.72.16-.214.32-.827 1.04-1.014 1.253-.187.214-.374.24-.694.08-.32-.16-1.353-.499-2.578-1.59-.953-.85-1.597-1.9-1.784-2.22-.187-.32-.02-.494.14-.654.144-.143.32-.374.48-.56.16-.187.214-.32.32-.534.107-.214.054-.4-.026-.56-.08-.16-.72-1.736-.987-2.378-.26-.624-.524-.54-.72-.55l-.614-.012c-.214 0-.56.08-.854.4-.293.32-1.12 1.094-1.12 2.668 0 1.575 1.146 3.097 1.306 3.31.16.214 2.255 3.444 5.464 4.83.764.33 1.36.527 1.825.674.767.243 1.466.21 2.018.128.616-.092 1.894-.774 2.16-1.522.267-.747.267-1.388.187-1.522-.08-.134-.293-.214-.614-.374z"
          />
        </g>

        <text
          x="278"
          y="248"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="Open Sans, Arial, sans-serif"
          fontSize="18"
          fontWeight="800"
          letterSpacing="3.2"
        >
          NOT TECH SAVVY?
        </text>
        <text
          x="278"
          y="292"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="Open Sans, Arial, sans-serif"
          fontSize="40"
          fontWeight="800"
        >
          WhatsApp
        </text>
        <text
          x="278"
          y="328"
          textAnchor="middle"
          fill="#f7f3ea"
          fontFamily="Open Sans, Arial, sans-serif"
          fontSize="22"
          fontWeight="700"
        >
          GolfSol Ireland
        </text>
        <rect x="118" y="352" width="320" height="56" rx="28" fill="#f7f3ea" />
        <text
          x="278"
          y="388"
          textAnchor="middle"
          fill="#062016"
          fontFamily="Open Sans, Arial, sans-serif"
          fontSize="28"
          fontWeight="800"
        >
          086 600 6202
        </text>
        <rect x="178" y="476" width="200" height="36" rx="18" fill="#f7f3ea" />
        <text
          x="278"
          y="500"
          textAnchor="middle"
          fill="#062016"
          fontFamily="Open Sans, Arial, sans-serif"
          fontSize="16"
          fontWeight="800"
        >
          Tap to chat
        </text>
      </svg>
    </a>
  )
}
