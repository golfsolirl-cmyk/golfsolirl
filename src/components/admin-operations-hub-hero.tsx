import { ADMIN_SIDEBAR_ITEMS, type AdminPortalSectionId } from './admin-sidebar'

type SectionGuide = {
  readonly kicker: string
  readonly summary: string
  readonly steps: readonly string[]
}

const SECTION_GUIDES: Record<AdminPortalSectionId, SectionGuide> = {
  customers: {
    kicker: 'Customers',
    summary: 'Open a customer, then send a quote or an invoice. Their payments sit on the same screen.',
    steps: ['Find the customer.', 'Send a quote or an invoice.', 'Accept emails a pay button. Decline holds the price.']
  },
  desk: {
    kicker: 'Pay & replies',
    summary: 'Reply to a guest, check what has been paid, then add a priced line to their trip.',
    steps: ['Reply to a guest message.', 'Check payments that have cleared.', 'Add a priced line to their trip.']
  },
  forms: {
    kicker: 'New quotes',
    summary: 'Each card is one website form. Open it, set the trip, then send a price.',
    steps: ['Open a new quote card.', 'Add transfers, golf, and the hotel.', 'Send a deposit or the full price.']
  },
  clientDocs: {
    kicker: 'Letters',
    summary: 'Pick a PDF, write the letter, then download or email it.',
    steps: ['Pick the PDF (quote, invoice, or trip pack).', 'Write the message. The preview updates as you type.', 'Download, print, or email it.']
  },
  scan: {
    kicker: 'Check a pass',
    summary: 'Scan or type the barcode on a guest’s trip pass to see if they have paid.',
    steps: ['Ask for the trip pass barcode.', 'Scan or type the code.', 'Confirm payment before they travel.']
  },
  testimonials: {
    kicker: 'Reviews',
    summary: 'Approve a review to show it on the homepage. Hide or delete the ones you do not want public.',
    steps: ['Read reviews waiting for a decision.', 'Approve the ones for the homepage.', 'Hide or delete the rest.']
  },
  transfers: {
    kicker: 'Transfers',
    summary: 'Quotes you price show up here. When the guest has paid in full, confirm the trip and send the driver.',
    steps: ['Find the quoted job.', 'When it is paid in full, confirm the route.', 'Send the driver — they get the job by email.']
  },
  packages: {
    kicker: 'Trip prices',
    summary: 'When a guest builds transfers, golf, and a hotel on their dashboard, it waits here for a price.',
    steps: ['Open a build that needs a price.', 'Check transfers, golf, and the hotel.', 'Save the price so it shows on their dashboard.']
  },
  proposals: {
    kicker: 'Send a PDF',
    summary: 'Choose a PDF, add the guest, write a short note, and send it to their email and dashboard.',
    steps: ['Choose the PDF.', 'Enter their email or account number.', 'Send it. They get the email and a dashboard note.']
  },
  portal: {
    kicker: 'Guest logins',
    summary: 'Make a dashboard login, or look up a guest to set their account number.',
    steps: ['Create a login with name and email.', 'Look up their email to set the account number.', 'Use Advanced only if you need to reset a login.']
  },
  emails: {
    kicker: 'Trip emails',
    summary: 'Send a branded note about a quote, the airport transfer, or the group.',
    steps: ['Pick a ready-made note, or write your own.', 'Send it to their login email.', 'It is saved under their messages.']
  },
  mail: {
    kicker: 'Email inbox',
    summary: 'Read customer email here. Reply in the thread, or send a Golf Sol email with a PDF.',
    steps: ['Connect Gmail once.', 'Open a conversation.', 'Reply, or send a Golf Sol email with a PDF.']
  },
  drivers: {
    kicker: 'Driver diary',
    summary: 'See paid airport and hotel runs by day. Close a date when the vans are full, and print the day sheet.',
    steps: ['Click a day to see the pickups.', 'Mark that date full on the website when you cannot take more.', 'Print the day sheet for the driver.']
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
    <div className="mb-6 rounded-2xl border border-black/[0.06] bg-white px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] sm:px-7 sm:py-6" id="admin-hub-welcome">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Icon aria-hidden className="h-5 w-5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="font-ge text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">{guide.kicker}</p>
          <p className="mt-1 max-w-3xl text-[0.95rem] leading-relaxed text-gray-600">{guide.summary}</p>
          {name ? <p className="mt-1 text-sm font-medium text-gray-400">Signed in as {name}</p> : null}
        </div>
      </div>
      <ol className="mt-4 grid gap-3 lg:grid-cols-3">
        {guide.steps.map((step, index) => (
          <li className="flex gap-3 rounded-xl border border-black/[0.04] bg-[#f9fafb] px-4 py-3 text-[0.9rem] leading-snug text-gray-700" key={step}>
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
