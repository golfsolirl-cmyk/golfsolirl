import { useMemo, useState } from 'react'
import { FileText, Send } from 'lucide-react'
import { ADMIN_DOCUMENT_CATALOG } from '../lib/admin-document-catalog'
import { LuxuryButton } from './ui/button'
import { cx } from '../lib/utils'

type AdminDocumentSendDeskProps = {
  readonly accessToken: string | null
}

export function AdminDocumentSendDesk({ accessToken }: AdminDocumentSendDeskProps) {
  const [documentType, setDocumentType] = useState(ADMIN_DOCUMENT_CATALOG[0]?.id ?? 'custom_letter')
  const [clientRef, setClientRef] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selected = useMemo(
    () => ADMIN_DOCUMENT_CATALOG.find((d) => d.id === documentType) ?? ADMIN_DOCUMENT_CATALOG[0],
    [documentType]
  )

  const send = async () => {
    if (!accessToken) {
      setError('Sign in again as admin.')
      return
    }
    if (!clientRef.trim() && !clientEmail.trim()) {
      setError('Enter a client / booking ID (GSI-…) or their login email.')
      return
    }
    setBusy(true)
    setError(null)
    setStatus(null)
    try {
      const res = await fetch('/api/admin-send-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          documentType,
          clientRef: clientRef.trim() || undefined,
          clientEmail: clientEmail.trim() || undefined,
          subject: subject.trim() || undefined,
          message: message.trim()
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        setError(data.message ?? res.statusText)
        return
      }
      setStatus(data.message ?? 'Document sent.')
      setMessage('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      aria-label="Send a PDF document to a client"
      className="scroll-mt-28 overflow-hidden rounded-[2rem] border-2 border-forest-200/80 bg-gradient-to-br from-white via-offwhite/80 to-fairway-50/40 p-6 shadow-soft sm:p-8"
      id="admin-hub-document-send"
    >
      <div className="flex flex-wrap items-start gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-white shadow-md">
          <FileText aria-hidden className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-brand-600">
            Documents
          </p>
          <h2 className="font-display mt-1 text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
            Send a PDF to a client
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-forest-600">
            Pick a document from your house PDF list, add the client ID or email, write a message, and send. They get the
            PDF by email and a note on their dashboard Messages.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">1 · Choose PDF</p>
          <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {ADMIN_DOCUMENT_CATALOG.map((item) => {
              const active = item.id === documentType
              return (
                <li key={item.id}>
                  <button
                    className={cx(
                      'w-full rounded-xl border px-4 py-3 text-left transition',
                      active
                        ? 'border-fairway-500 bg-fairway-50/90 ring-1 ring-fairway-200'
                        : 'border-forest-100 bg-white hover:border-fairway-300'
                    )}
                    onClick={() => setDocumentType(item.id)}
                    type="button"
                  >
                    <span className="block text-sm font-semibold text-forest-950">{item.label}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-forest-600">{item.description}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">2 · Client &amp; message</p>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600">
              Client / booking ID
            </span>
            <input
              className="w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-2.5 font-mono text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
              onChange={(e) => setClientRef(e.target.value)}
              placeholder="GSI-… or account number"
              type="text"
              value={clientRef}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600">
              Login email (if no ID, or to confirm)
            </span>
            <input
              className="w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-2.5 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="guest@email.com"
              type="email"
              value={clientEmail}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600">
              Email subject (optional)
            </span>
            <input
              className="w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-2.5 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
              onChange={(e) => setSubject(e.target.value)}
              placeholder={selected ? `${selected.label} — Golf Sol Ireland` : 'Subject'}
              type="text"
              value={subject}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600">
              Message {selected?.needsMessage ? '(goes on the PDF)' : '(email body)'}
            </span>
            <textarea
              className="min-h-[140px] w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                selected?.needsMessage
                  ? 'e.g. Booking confirmed for 22–25 Oct. Deposit €500 received. Remaining balance due 14 days before travel…'
                  : 'Optional note for the email (the PDF is attached).'
              }
              value={message}
            />
          </label>

          <p className="rounded-xl border border-fairway-200 bg-fairway-50/50 px-3 py-2 text-xs text-forest-700">
            Sends <strong className="font-semibold text-forest-900">{selected?.label}</strong> by email with the PDF
            attached, and lists it under the client’s dashboard Messages.
          </p>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
              {error}
            </p>
          ) : null}
          {status ? (
            <p className="rounded-xl border border-fairway-200 bg-white px-3 py-2 text-sm text-forest-800" role="status">
              {status}
            </p>
          ) : null}

          <LuxuryButton
            className="!px-6 !py-3"
            disabled={busy || !accessToken}
            onClick={() => void send()}
            type="button"
            variant="primary"
          >
            <span className="inline-flex items-center gap-2">
              <Send aria-hidden className="h-4 w-4" />
              {busy ? 'Sending…' : 'Send PDF to client'}
            </span>
          </LuxuryButton>
        </div>
      </div>
    </section>
  )
}
