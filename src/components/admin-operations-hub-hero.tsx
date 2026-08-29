import { ADMIN_SIDEBAR_ITEMS, type AdminPortalSectionId } from './admin-sidebar'

const ADMIN_OPERATIONS_HERO_SRC = `${import.meta.env.BASE_URL}images/admin-operations-hero.webp`

type SectionGuide = {
  readonly kicker: string
  readonly title: string
  readonly summary: string
  readonly steps: readonly string[]
}

const SECTION_GUIDES: Record<AdminPortalSectionId, SectionGuide> = {
  desk: {
    kicker: 'Desk',
    title: 'Payments, messages & publish',
    summary: 'Start here for money in, guest replies, and adding a priced line to their trip.',
    steps: [
      'Check payments that have cleared.',
      'Reply to guest messages from their dashboard.',
      'Publish a priced update when you’re ready.'
    ]
  },
  forms: {
    kicker: 'Website forms',
    title: 'New guest forms',
    summary: 'Each card is one website form. Open it, build their trip, set a price, then message them.',
    steps: [
      'Open a new form card.',
      'Build transfers, golf, and hotel on their trip.',
      'Send a deposit or full price (portal + email + Stripe).'
    ]
  },
  clientDocs: {
    kicker: 'Client documents',
    title: 'Letters, quotes and replies',
    summary: 'Write a branded response or quotation, preview it on A4, then download Word or PDF — or print company stationery.',
    steps: [
      'Open a website form and choose Create document, or start a blank letter.',
      'Add your message or prices. The A4 preview updates as you type.',
      'Download Word or PDF, print, or email the customer.'
    ]
  },
  scan: {
    kicker: 'Scan trip pass',
    title: 'Check a guest pass',
    summary: 'Scan or enter the barcode from a guest’s trip pass to confirm payment status.',
    steps: [
      'Ask the guest for their trip pass barcode.',
      'Scan or type the code here.',
      'Confirm whether payment is valid before travel.'
    ]
  },
  testimonials: {
    kicker: 'Guest reviews',
    title: 'Homepage reviews',
    summary: 'New reviews wait here. Approve to show on the homepage, hide to take them off, or delete them.',
    steps: [
      'Read reviews waiting for approval.',
      'Approve the ones you want on the homepage.',
      'Hide or delete anything you don’t want public.'
    ]
  },
  transfers: {
    kicker: 'Transfers & drivers',
    title: 'Quotes & driver dispatch',
    summary: 'Prices you send from Website forms land here first. When the guest pays in full, confirm the trip and dispatch a driver.',
    steps: [
      'Find quoted jobs from Website forms (awaiting payment).',
      'When paid in full, confirm golf, hotel, and route.',
      'Dispatch the driver — they get the job by email.'
    ]
  },
  packages: {
    kicker: 'Packages',
    title: 'Client trip builds',
    summary: 'When a guest sends transfers, golf, and accommodation from their trip builder, it appears here for you to price.',
    steps: [
      'Check the bell for builds that need a price.',
      'Open the build — see their 3 stages.',
      'Add a price and save so it shows on their dashboard.'
    ]
  },
  proposals: {
    kicker: 'Documents & proposals',
    title: 'Send PDFs to clients',
    summary: 'Pick a house PDF (quote, confirmation, terms, checklist…), add the client ID, write a message, and send by email + dashboard.',
    steps: [
      'Choose the PDF type from the list.',
      'Enter their GSI- / account ID or email.',
      'Write your message and send — they get email + dashboard note.'
    ]
  },
  portal: {
    kicker: 'Client accounts',
    title: 'Logins & access',
    summary: 'Create a dashboard login, set their account number, or reset / clear a portal when testing.',
    steps: [
      'Create a login with name + email (optional magic link).',
      'Load their email to set account number and what they see.',
      'Use Advanced only to clear, copy login links, or block an email.'
    ]
  },
  emails: {
    kicker: 'Guest emails',
    title: 'Trip-shaped messages',
    summary: 'Send branded Golf Sol notes for quotes, AGP transfers, packing, and groups — then unlock terms or thank-you PDFs.',
    steps: [
      'Pick a quick-start template (or write your own).',
      'Send to their login email — it logs under Messages & files.',
      'When booked, unlock terms / thank-you on their dashboard.'
    ]
  },
  mail: {
    kicker: 'Gmail',
    title: 'Gmail inbox',
    summary: 'Connect Gmail here. Read customer mail, reply on the same thread, or send a Golf Sol branded email with a PDF.',
    steps: [
      'Connect Gmail once (tokens stay on the server).',
      'Open a conversation, match it to a website form, then Reply via Gmail or Send branded email.',
      'Keep EMAIL_SEND_ENABLED off while testing so nothing leaves the building.'
    ]
  },
  drivers: {
    kicker: 'Run calendar',
    title: 'Busy days on the Costa',
    summary: 'See paid AGP and hotel runs by day (Madrid time), close the website when vans are full, and print a day sheet for the driver.',
    steps: [
      'Click a day — paid pickups and routes show on the right.',
      'Block that date on public forms when you’re at capacity.',
      'Print the day sheet once passenger details are on the diary.'
    ]
  }
}

export function AdminOperationsHubHero(props: {
  readonly adminFirstName: string
  readonly activeSection: AdminPortalSectionId
}) {
  const name = props.adminFirstName.trim()
  const guide = SECTION_GUIDES[props.activeSection]
  const navItem = ADMIN_SIDEBAR_ITEMS.find((item) => item.id === props.activeSection)
  const Icon = navItem?.icon

  return (
    <div
      className="mb-8 overflow-hidden rounded-2xl border border-forest-100/90 bg-white shadow-sm ring-1 ring-forest-900/[0.04]"
      id="admin-hub-welcome"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)]">
        <div className="flex flex-col justify-center px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-wrap items-center gap-2">
            {Icon ? (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-fairway-800 text-white">
                <Icon aria-hidden className="h-4 w-4" />
              </span>
            ) : null}
            <p className="font-ge text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">{guide.kicker}</p>
          </div>
          <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-forest-950 sm:text-3xl">
            {guide.title}
          </h2>
          {name ? (
            <p className="mt-1 text-sm font-medium text-forest-600">Signed in as {name}</p>
          ) : null}
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-forest-700 md:text-base">{guide.summary}</p>
          <ol className="mt-4 space-y-2 text-sm text-forest-800">
            {guide.steps.map((step, index) => (
              <li className="flex gap-2" key={step}>
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fairway-100 text-[11px] font-bold text-fairway-900">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative min-h-[140px] bg-gradient-to-br from-[#0f3d24]/95 via-[#143d28] to-[#0a2416] lg:min-h-0">
          <img
            alt=""
            className="h-full min-h-[140px] w-full object-cover object-center opacity-95 lg:min-h-full"
            decoding="async"
            loading="eager"
            src={ADMIN_OPERATIONS_HERO_SRC}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a2416]/90 via-transparent to-transparent lg:bg-gradient-to-l"
          />
        </div>
      </div>
    </div>
  )
}
