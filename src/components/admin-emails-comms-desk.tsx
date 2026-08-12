import type { FormEvent, RefObject } from 'react'
import { Mail, Plane, FileCheck, MessageSquare } from 'lucide-react'
import { LuxuryButton } from './ui/button'
import { cx } from '../lib/utils'

export type StudioEmailTemplate = {
  readonly id: string
  readonly label: string
  readonly blurb: string
  readonly subject: string
  readonly body: string
}

/** Golf Sol Ireland — everyday guest messages ready to send. */
export const STUDIO_EMAIL_TEMPLATES: readonly StudioEmailTemplate[] = [
  {
    id: 'quote-ready',
    label: 'Quote ready',
    blurb: 'Transfers + golf + stay',
    subject: 'Your Costa del Sol golf trip quote — Golf Sol Ireland',
    body: [
      'Thanks for getting in touch — we’ve put together your Costa del Sol trip options.',
      'Open your Golf Sol dashboard to review transfers, golf, and accommodation, then reply here or in Messages if you’d like anything adjusted.',
      'Looking forward to getting your group on the fairways.',
      '— Golf Sol Ireland'
    ].join('\n\n')
  },
  {
    id: 'transfer-confirmed',
    label: 'Transfer confirmed',
    blurb: 'Málaga pickup',
    subject: 'Your Málaga airport transfer is confirmed',
    body: [
      'Your private transfer is booked and confirmed.',
      'We’ll meet you in Arrivals at Málaga (AGP) with a Golf Sol sign. Please have your flight number and hotel name handy — golf bags are welcome.',
      'Any flight change? Reply to this email as soon as you can and we’ll update the driver.',
      '— Golf Sol Ireland'
    ].join('\n\n')
  },
  {
    id: 'packing',
    label: 'Packing notes',
    blurb: 'Before you fly',
    subject: 'Before you fly — Costa packing notes from Golf Sol',
    body: [
      'A few practical notes for your Costa del Sol trip:',
      '• Soft-shell golf travel cover if you can — easier in the transfer vehicle\n• Light layers for evenings; sun cream and a cap for midday rounds\n• EU adapters and a photocopy (or phone photo) of passports\n• Keep your Golf Sol account number handy for pickups',
      'Safe travels — see you on the Sol.',
      '— Golf Sol Ireland'
    ].join('\n\n')
  },
  {
    id: 'group-organiser',
    label: 'Group organiser',
    blurb: 'Societies & mates',
    subject: 'For the group organiser — one dashboard for everyone',
    body: [
      'Thanks for coordinating the trip. Your Golf Sol desk is the single place for transfers, golf, and accommodation for the whole group.',
      'Share the login (or ask us to add another email) if someone else needs to see quotes and PDFs. We’ll keep pricing and documents in one timeline under Messages & files.',
      'Happy to tweak tee times or hotel nights — just reply.',
      '— Golf Sol Ireland'
    ].join('\n\n')
  },
  {
    id: 'balance-due',
    label: 'Balance reminder',
    blurb: 'Friendly nudge',
    subject: 'Friendly reminder — balance due for your Costa trip',
    body: [
      'Just a quick note that the remaining balance on your Golf Sol booking is due before travel.',
      'You can pay from your client dashboard (or reply if you’d like a payment link by email). Once settled, we’ll lock in drivers and any last tee-time details.',
      'Questions about the breakdown? We’re happy to walk through it.',
      '— Golf Sol Ireland'
    ].join('\n\n')
  },
  {
    id: 'welcome-sol',
    label: 'Welcome to the Sol',
    blurb: 'Post-arrival',
    subject: 'Welcome to the Costa — we’re here if you need us',
    body: [
      'Welcome to the Costa del Sol — hope the transfer was smooth and the bags made it in one piece.',
      'If you need an extra course run, a dinner transfer, or a last-minute tee-time tweak, message us from your dashboard or reply here. Enjoy the sunshine and the golf.',
      '— Golf Sol Ireland'
    ].join('\n\n')
  }
]

type AdminEmailsCommsDeskProps = {
  readonly guestEmail: string
  readonly onGuestEmailChange: (value: string) => void
  readonly studioSubject: string
  readonly onStudioSubjectChange: (value: string) => void
  readonly studioBody: string
  readonly onStudioBodyChange: (value: string) => void
  readonly studioBusy: boolean
  readonly studioMessage: string | null
  readonly onSendStudio: (event: FormEvent<HTMLFormElement>) => void
  readonly attachmentsRef: RefObject<HTMLInputElement | null>
  readonly crmSending: 'idle' | 'terms' | 'welcome'
  readonly crmMessage: string | null
  readonly onSendCrm: (kind: 'terms' | 'welcome') => void
  readonly inputClass: string
  readonly labelClass: string
}

export function AdminEmailsCommsDesk({
  guestEmail,
  onGuestEmailChange,
  studioSubject,
  onStudioSubjectChange,
  studioBody,
  onStudioBodyChange,
  studioBusy,
  studioMessage,
  onSendStudio,
  attachmentsRef,
  crmSending,
  crmMessage,
  onSendCrm,
  inputClass,
  labelClass
}: AdminEmailsCommsDeskProps) {
  const applyTemplate = (t: StudioEmailTemplate) => {
    onStudioSubjectChange(t.subject)
    onStudioBodyChange(t.body)
  }

  return (
    <div className="space-y-8" id="admin-hub-emails">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Guest messaging</p>
        <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">
          Emails that match the trip
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-forest-600">
          Write a branded note for Irish groups on the Costa — transfers, golf, and stay — then unlock terms or thank-you
          PDFs on their dashboard when the trip is real.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: MessageSquare,
            title: 'Branded inbox',
            text: 'Sends look like Golf Sol mail and land under Messages & files on their desk.'
          },
          {
            icon: Plane,
            title: 'Trip-shaped copy',
            text: 'Start from a template: quote, AGP pickup, packing, group organiser, balance.'
          },
          {
            icon: FileCheck,
            title: 'PDF library keys',
            text: 'Terms & thank-you unlock the documents they see after sign-in — not a random attachment.'
          }
        ].map((card) => (
          <div
            className="rounded-2xl border border-forest-100 bg-gradient-to-br from-white to-offwhite/90 px-4 py-4 shadow-soft"
            key={card.title}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-forest-900 text-white">
              <card.icon aria-hidden className="h-4 w-4" />
            </span>
            <p className="mt-3 text-sm font-semibold text-forest-950">{card.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-forest-600">{card.text}</p>
          </div>
        ))}
      </div>

      <section className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">1 · Write & send</p>
        <h3 className="font-display mt-1 text-xl font-semibold text-forest-950">Branded email to their login</h3>
        <p className="mt-1 text-sm text-forest-600">
          Optional PDF attachments (quotes, hotel letters). They get the real email; the same note is logged on their
          dashboard.
        </p>

        <div className="mt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600">Quick start</p>
          <div className="flex flex-wrap gap-2">
            {STUDIO_EMAIL_TEMPLATES.map((t) => (
              <button
                className={cx(
                  'rounded-full border-2 border-forest-200 bg-offwhite/90 px-3.5 py-1.5 text-left text-xs font-semibold text-forest-900',
                  'transition-colors hover:border-fairway-400 hover:bg-white'
                )}
                key={t.id}
                onClick={() => applyTemplate(t)}
                type="button"
              >
                <span className="block">{t.label}</span>
                <span className="block text-[10px] font-medium text-forest-500">{t.blurb}</span>
              </button>
            ))}
          </div>
        </div>

        <form className="mt-6 max-w-2xl space-y-4" noValidate onSubmit={onSendStudio}>
          <div>
            <label className={labelClass} htmlFor="studio-email-to">
              Guest login email
            </label>
            <input
              autoComplete="email"
              className={inputClass}
              id="studio-email-to"
              onChange={(e) => onGuestEmailChange(e.target.value)}
              placeholder="Same email they use to sign in"
              type="email"
              value={guestEmail}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="studio-email-subject">
              Subject
            </label>
            <input
              className={inputClass}
              id="studio-email-subject"
              onChange={(e) => onStudioSubjectChange(e.target.value)}
              placeholder="e.g. Your Marbella transfer quote"
              type="text"
              value={studioSubject}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="studio-email-body">
              Message
            </label>
            <textarea
              className={cx(inputClass, 'min-h-[180px] resize-y')}
              id="studio-email-body"
              onChange={(e) => onStudioBodyChange(e.target.value)}
              placeholder="Write in paragraphs. Blank lines become separate paragraphs."
              value={studioBody}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="studio-email-files">
              PDF attachments (optional, max 4 × 4 MB)
            </label>
            <input
              accept="application/pdf,.pdf"
              className="mt-2 block w-full text-sm text-forest-800 file:mr-4 file:rounded-full file:border-0 file:bg-forest-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-forest-800"
              id="studio-email-files"
              multiple
              ref={attachmentsRef}
              type="file"
            />
          </div>
          <LuxuryButton disabled={studioBusy} type="submit" variant="primary">
            {studioBusy ? 'Sending…' : 'Send branded email'}
          </LuxuryButton>
          {studioMessage ? (
            <p className="text-sm font-medium text-forest-800" role="status">
              {studioMessage}
            </p>
          ) : null}
        </form>
      </section>

      <section className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">2 · Unlock dashboard PDFs</p>
        <h3 className="font-display mt-1 text-xl font-semibold text-forest-950">Terms & thank-you access</h3>
        <p className="mt-1 max-w-2xl text-sm text-forest-600">
          Turns on the PDF library pages for this login and emails them a link. Use after a booking is confirmed — not
          instead of a custom quote PDF (those live under Documents & proposals).
        </p>

        <label className="mb-2 mt-5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="crm-doc-email">
          Same guest email
        </label>
        <input
          autoComplete="email"
          className={cx(inputClass, 'mb-5 max-w-md')}
          id="crm-doc-email"
          onChange={(e) => onGuestEmailChange(e.target.value)}
          placeholder="client@example.com"
          type="email"
          value={guestEmail}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            aria-label="Email terms and conditions PDF access"
            className="flex flex-col items-start rounded-2xl border-2 border-forest-200 bg-offwhite/70 px-5 py-4 text-left transition-colors hover:border-fairway-400 hover:bg-white disabled:opacity-60"
            disabled={crmSending !== 'idle'}
            onClick={() => onSendCrm('terms')}
            type="button"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-forest-900 text-white">
              <FileCheck aria-hidden className="h-4 w-4" />
            </span>
            <span className="mt-3 text-sm font-semibold text-forest-950">
              {crmSending === 'terms' ? 'Sending…' : 'Send terms access'}
            </span>
            <span className="mt-1 text-xs text-forest-600">Booking conditions they can reopen anytime.</span>
          </button>
          <button
            aria-label="Email thank you document PDF access"
            className="flex flex-col items-start rounded-2xl border-2 border-forest-200 bg-offwhite/70 px-5 py-4 text-left transition-colors hover:border-fairway-400 hover:bg-white disabled:opacity-60"
            disabled={crmSending !== 'idle'}
            onClick={() => onSendCrm('welcome')}
            type="button"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#136047] text-white">
              <Mail aria-hidden className="h-4 w-4" />
            </span>
            <span className="mt-3 text-sm font-semibold text-forest-950">
              {crmSending === 'welcome' ? 'Sending…' : 'Send thank-you access'}
            </span>
            <span className="mt-1 text-xs text-forest-600">Warm close after a confirmed Costa trip.</span>
          </button>
        </div>

        {crmMessage ? (
          <p className="mt-4 text-sm font-medium text-forest-800" role="status">
            {crmMessage}
          </p>
        ) : null}
      </section>

      <p className="text-sm text-forest-600">
        Need a formal booking confirmation, quote letter, or packing checklist PDF? Use{' '}
        <strong className="font-medium text-forest-900">Documents &amp; proposals</strong> in the left menu — that desk
        builds and sends the file. This tab is for everyday branded notes and unlocking the library.
      </p>
    </div>
  )
}
