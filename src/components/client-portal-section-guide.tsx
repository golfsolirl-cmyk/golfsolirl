import { CLIENT_SIDEBAR_ITEMS, type ClientPortalSectionId } from './client-sidebar'

type SectionGuide = {
  readonly kicker: string
  readonly title: string
  readonly summary: string
  readonly steps: readonly string[]
}

const SECTION_GUIDES: Record<ClientPortalSectionId, SectionGuide> = {
  home: {
    kicker: 'Your trip',
    title: 'Everything in one place',
    summary: 'Your Costa del Sol trip desk — details, add-ons, and what’s already on file with Golf Sol Ireland.',
    steps: [
      'Check your name, account number, and transfer status above.',
      'Add transfers, golf, or accommodation when you need more.',
      'Pay anything due, or open Messages to talk to us.'
    ]
  },
  pass: {
    kicker: 'Trip pass',
    title: 'Show this to your driver',
    summary: 'Your barcode confirms payment for airport and hotel runs on the Costa.',
    steps: [
      'Open this tab when you meet your driver.',
      'Show the barcode at pickup.',
      'If nothing shows here yet, settle payment under Pay first.'
    ]
  },
  perks: {
    kicker: 'Perks & deals',
    title: 'Extras on the Sol',
    summary: 'Coupons and scan-to-win offers for your trip — separate from transfers and golf.',
    steps: [
      'Browse what’s available.',
      'Save or show a deal when you need it.',
      'Come back anytime — new offers may appear.'
    ]
  },
  trip: {
    kicker: 'Trip builder',
    title: 'Transfers · golf · stay',
    summary: 'Build what you want in three stages, then send it to us for a price on this dashboard.',
    steps: [
      'Turn on Transfers, Golf, and/or Accommodation.',
      'Fill in the details for each stage you need.',
      'Save & send for pricing — we reply with totals here.'
    ]
  },
  payments: {
    kicker: 'Payments',
    title: 'Pay what’s due',
    summary: 'Card checkout for transfers and trip invoices — receipts stay on this page.',
    steps: [
      'Pay a transfer deposit, balance, or full amount.',
      'Pay any open trip invoice.',
      'Download receipts when a payment is complete.'
    ]
  },
  messages: {
    kicker: 'Messages',
    title: 'Ask Golf Sol Ireland',
    summary: 'Message us about transfers, golf courses, or accommodation — we reply in the same thread.',
    steps: [
      'Choose Transfers, Golf, or Hotels.',
      'Send a short note about what you need.',
      'Open the thread when we reply.'
    ]
  },
  contact: {
    kicker: 'Contact',
    title: 'How we reach you',
    summary: 'Your name, phone, and account number for this login — keep them up to date for pickups.',
    steps: [
      'Confirm your name and mobile.',
      'Note your account number (GSI-…) for reference.',
      'Save — we use these details for your trip.'
    ]
  },
  documents: {
    kicker: 'Documents',
    title: 'Quotes & letters from us',
    summary: 'PDFs we send for your trip — quotes, terms, and confirmations — open, print, or download here.',
    steps: [
      'Open a document when it appears.',
      'Print or download if you want a copy.',
      'Check Messages if you’re waiting on something new.'
    ]
  }
}

export function ClientPortalSectionGuide(props: { readonly activeSection: ClientPortalSectionId }) {
  const guide = SECTION_GUIDES[props.activeSection]
  const navItem = CLIENT_SIDEBAR_ITEMS.find((item) => item.id === props.activeSection)
  const Icon = navItem?.icon

  return (
    <section
      aria-label={`${guide.title} — how this page works`}
      className="mb-8 overflow-hidden rounded-[1.75rem] border border-forest-100 bg-gradient-to-br from-white via-offwhite/90 to-fairway-50/40 px-5 py-5 shadow-soft sm:px-7 sm:py-6"
    >
      <div className="flex flex-wrap items-start gap-4">
        {Icon ? (
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest-900 text-white shadow-md">
            <Icon aria-hidden className="h-5 w-5" />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">{guide.kicker}</p>
          <h2 className="font-display mt-1 text-xl font-semibold tracking-tight text-forest-950 sm:text-2xl">
            {guide.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-forest-600 sm:text-base">{guide.summary}</p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-3">
            {guide.steps.map((step, i) => (
              <li
                className="rounded-xl border border-forest-100 bg-white/90 px-3.5 py-3 text-sm leading-snug text-forest-700"
                key={step}
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">
                  {i + 1}
                </span>
                <span className="mt-1 block">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
