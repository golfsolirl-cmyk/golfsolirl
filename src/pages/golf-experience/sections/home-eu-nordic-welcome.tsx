/**
 * Homepage welcome strip — crisp SVG flags for major European golf markets.
 * Avoids emoji flags (blurry / missing on Windows).
 */
import type { ReactNode } from 'react'

type FlagProps = { readonly className?: string; readonly title: string }

function FlagShell({
  className,
  title,
  children,
  viewBox
}: FlagProps & { readonly children: ReactNode; readonly viewBox: string }) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {children}
    </svg>
  )
}

function FlagIreland({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 30 20">
      <rect width="10" height="20" fill="#169B62" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#FF883E" />
    </FlagShell>
  )
}

function FlagUk({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 60 30">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="2" />
      <path d="M30 0 V30 M0 15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0 V30 M0 15 H60" stroke="#C8102E" strokeWidth="6" />
    </FlagShell>
  )
}

function FlagSpain({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 30 20">
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
    </FlagShell>
  )
}

function FlagFrance({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 30 20">
      <rect width="10" height="20" fill="#002395" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ED2939" />
    </FlagShell>
  )
}

function FlagGermany({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 30 20">
      <rect width="30" height="6.67" fill="#000" />
      <rect y="6.67" width="30" height="6.67" fill="#D00" />
      <rect y="13.34" width="30" height="6.66" fill="#FFCE00" />
    </FlagShell>
  )
}

function FlagNetherlands({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 30 20">
      <rect width="30" height="6.67" fill="#AE1C28" />
      <rect y="6.67" width="30" height="6.67" fill="#fff" />
      <rect y="13.34" width="30" height="6.66" fill="#21468B" />
    </FlagShell>
  )
}

function FlagSweden({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 16 10">
      <rect width="16" height="10" fill="#006AA7" />
      <rect x="5" width="2" height="10" fill="#FECC00" />
      <rect y="4" width="16" height="2" fill="#FECC00" />
    </FlagShell>
  )
}

function FlagNorway({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 22 16">
      <rect width="22" height="16" fill="#EF2B2D" />
      <rect x="6" width="4" height="16" fill="#fff" />
      <rect y="6" width="22" height="4" fill="#fff" />
      <rect x="7" width="2" height="16" fill="#002868" />
      <rect y="7" width="22" height="2" fill="#002868" />
    </FlagShell>
  )
}

function FlagDenmark({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 37 28">
      <rect width="37" height="28" fill="#C8102E" />
      <rect x="11" y="0" width="5" height="28" fill="#fff" />
      <rect x="0" y="11.5" width="37" height="5" fill="#fff" />
    </FlagShell>
  )
}

function FlagBelgium({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 30 20">
      <rect width="10" height="20" fill="#000" />
      <rect x="10" width="10" height="20" fill="#FAE042" />
      <rect x="20" width="10" height="20" fill="#ED2939" />
    </FlagShell>
  )
}

function FlagSwitzerland({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 20 20">
      <rect width="20" height="20" fill="#FF0000" />
      <rect x="8.2" y="3.5" width="3.6" height="13" fill="#fff" />
      <rect x="3.5" y="8.2" width="13" height="3.6" fill="#fff" />
    </FlagShell>
  )
}

function FlagItaly({ className, title }: FlagProps) {
  return (
    <FlagShell className={className} title={title} viewBox="0 0 30 20">
      <rect width="10" height="20" fill="#009246" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#CE2B37" />
    </FlagShell>
  )
}

function FlagEu({ className, title }: FlagProps) {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 12
    const cx = 15 + 5.5 * Math.cos(angle)
    const cy = 10 + 5.5 * Math.sin(angle)
    return <circle key={i} cx={cx} cy={cy} r={0.85} fill="#FC0" />
  })
  return (
    <FlagShell className={className} title={title} viewBox="0 0 30 20">
      <rect width="30" height="20" fill="#039" />
      {stars}
    </FlagShell>
  )
}

const MARKETS: readonly {
  readonly id: string
  readonly title: string
  readonly Flag: (props: FlagProps) => ReactNode
}[] = [
  { id: 'ie', title: 'Ireland', Flag: FlagIreland },
  { id: 'gb', title: 'United Kingdom', Flag: FlagUk },
  { id: 'es', title: 'Spain', Flag: FlagSpain },
  { id: 'fr', title: 'France', Flag: FlagFrance },
  { id: 'de', title: 'Germany', Flag: FlagGermany },
  { id: 'nl', title: 'Netherlands', Flag: FlagNetherlands },
  { id: 'se', title: 'Sweden', Flag: FlagSweden },
  { id: 'no', title: 'Norway', Flag: FlagNorway },
  { id: 'dk', title: 'Denmark', Flag: FlagDenmark },
  { id: 'be', title: 'Belgium', Flag: FlagBelgium },
  { id: 'ch', title: 'Switzerland', Flag: FlagSwitzerland },
  { id: 'it', title: 'Italy', Flag: FlagItaly },
  { id: 'eu', title: 'European Union', Flag: FlagEu }
]

const flagClass =
  'h-5 w-auto max-w-[2.1rem] shrink-0 overflow-hidden rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.18)] ring-1 ring-black/10 sm:h-6 sm:max-w-[2.4rem]'

export function GeHomeEuNordicWelcome() {
  return (
    <section
      className="home-eu-nordic-welcome relative border-b border-chrome-300/50 bg-[#f4f7f5] text-gs-dark"
      aria-labelledby="home-eu-markets-heading"
    >
      <div className="relative mx-auto max-w-[1180px] px-4 py-4 sm:px-8 sm:py-5">
        <div className="flex flex-col items-center gap-3 text-center sm:gap-3.5">
          <p
            id="home-eu-markets-heading"
            className="home-eu-nordic-welcome__copy max-w-2xl font-ge text-[0.95rem] leading-snug text-forest-800 sm:text-base"
          >
            Welcoming golfers from Ireland, the UK &amp; across Europe
          </p>
          <ul
            className="flex list-none flex-wrap items-center justify-center gap-x-2 gap-y-2.5 p-0 sm:gap-x-2.5"
            aria-label="European markets we welcome"
          >
            {MARKETS.map(({ id, title, Flag }) => (
              <li key={id} className="inline-flex" title={title}>
                <Flag className={flagClass} title={title} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
