import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { PlaneLanding, X } from 'lucide-react'
import { LuxuryButton } from './ui/button'
import { ENQUIRY_STRUCTURED_FIELD_KEYS } from '../lib/enquiry-form-registry'
import {
  defaultTransferUpsellBodyPlainForEnquiry,
  defaultTransferUpsellSubject
} from '../lib/enquiry-transfer-upsell-copy'

type TransferUpsellTarget = {
  readonly id: string
  readonly reference_id: string
  readonly email: string
  readonly full_name: string
  readonly form_payload?: unknown
}

type AdminEnquiryTransferUpsellModalProps = {
  readonly accessToken: string | null
  readonly row: TransferUpsellTarget | null
  readonly onClose: () => void
  readonly onSent?: (sentAtIso: string) => void
}

function readSentAt(formPayload: unknown): string | null {
  if (!formPayload || typeof formPayload !== 'object' || Array.isArray(formPayload)) {
    return null
  }
  const fields = (formPayload as { fields?: Record<string, unknown> }).fields
  if (!fields || typeof fields !== 'object') {
    return null
  }
  const v =
    fields[ENQUIRY_STRUCTURED_FIELD_KEYS.transferUpsellEmailSentAt] ??
    fields._transferUpsellEmailSentAt
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

export function AdminEnquiryTransferUpsellModal({
  accessToken,
  row,
  onClose,
  onSent
}: AdminEnquiryTransferUpsellModalProps) {
  const [subject, setSubject] = useState('')
  const [bodyPlain, setBodyPlain] = useState('')
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewPlain, setPreviewPlain] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [sentAt, setSentAt] = useState<string | null>(null)

  const resetCopy = useCallback(() => {
    if (!row) {
      return
    }
    setSubject(defaultTransferUpsellSubject(row.reference_id))
    setBodyPlain(defaultTransferUpsellBodyPlainForEnquiry(row.full_name, row.reference_id))
  }, [row])

  useEffect(() => {
    if (!row) {
      return
    }
    resetCopy()
    setPreviewHtml(null)
    setPreviewPlain(null)
    setNote(null)
    setSentAt(readSentAt(row.form_payload))
  }, [resetCopy, row])

  const post = async (action: 'preview' | 'send') => {
    if (!row || !accessToken) {
      setNote('Sign in again as admin.')
      return
    }
    setBusy(action)
    setNote(null)
    try {
      const res = await fetch('/api/enquiry-transfer-upsell-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action,
          enquiryId: row.id,
          subject,
          bodyPlain
        })
      })
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        html?: string
        plainText?: string
        sentAt?: string
      }
      if (!res.ok) {
        setNote(data.message ?? 'Request failed.')
        return
      }
      if (action === 'preview') {
        setPreviewHtml(typeof data.html === 'string' ? data.html : null)
        setPreviewPlain(typeof data.plainText === 'string' ? data.plainText : null)
        if (typeof data.sentAt === 'string') {
          setSentAt(data.sentAt)
        }
        setNote('Preview updated.')
        return
      }
      if (typeof data.sentAt === 'string') {
        setSentAt(data.sentAt)
        onSent?.(data.sentAt)
      }
      setNote(`Email sent to ${row.email}.`)
    } finally {
      setBusy(null)
    }
  }

  if (!row) {
    return null
  }

  return (
    <div
      aria-labelledby="transfer-upsell-title"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-end justify-center bg-forest-950/50 p-4 sm:items-center"
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <ModalPanel className="relative z-[81] w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-forest-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-forest-100 bg-gradient-to-br from-fairway-50 to-white px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-white">
              <PlaneLanding aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-forest-950" id="transfer-upsell-title">
                Airport & hotel transfers email
              </h3>
              <p className="mt-0.5 text-sm text-forest-700">
                To <span className="font-medium">{row.email}</span> · {row.reference_id}
              </p>
              {sentAt ? (
                <p className="mt-1 text-xs font-semibold text-emerald-900">
                  Last sent {new Date(sentAt).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              ) : null}
            </div>
          </div>
          <button
            className="rounded-full border border-forest-200 p-2 text-forest-800 hover:bg-cream"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[min(72vh,640px)] space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor="upsell-subject">
              Subject
            </label>
            <input
              className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900"
              id="upsell-subject"
              onChange={(e) => setSubject(e.target.value)}
              value={subject}
            />
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor="upsell-body">
                Message (plain text)
              </label>
              <button
                className="text-xs font-semibold text-brand-700 underline-offset-2 hover:underline"
                onClick={resetCopy}
                type="button"
              >
                Reset to default copy
              </button>
            </div>
            <textarea
              className="min-h-[200px] w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 font-mono text-sm leading-relaxed text-forest-900"
              id="upsell-body"
              onChange={(e) => setBodyPlain(e.target.value)}
              value={bodyPlain}
            />
          </div>

          {previewHtml ? (
            <PreviewPanel className="rounded-xl border border-forest-100 bg-offwhite/80 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">HTML preview</p>
              <iframe
                className="mt-2 h-64 w-full rounded-lg border border-forest-100 bg-white"
                srcDoc={previewHtml}
                title="Transfer upsell email preview"
              />
              {previewPlain ? (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-forest-700">Plain-text version</summary>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-xs text-forest-900">
                    {previewPlain}
                  </pre>
                </details>
              ) : null}
            </PreviewPanel>
          ) : null}

          {note ? (
            <p className="text-sm text-forest-800" role="status">
              {note}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-forest-100 bg-offwhite/60 px-5 py-4">
          <LuxuryButton disabled={Boolean(busy)} onClick={() => void post('preview')} type="button" variant="outline">
            {busy === 'preview' ? 'Previewing…' : 'Preview'}
          </LuxuryButton>
          <LuxuryButton disabled={Boolean(busy)} onClick={() => void post('send')} type="button" variant="primary">
            {busy === 'send' ? 'Sending…' : 'Send email'}
          </LuxuryButton>
          <LuxuryButton onClick={onClose} type="button" variant="outline">
            Close
          </LuxuryButton>
        </div>
      </ModalPanel>
    </div>
  )
}

/** Wrapper keeps modal shell valid without importing framer-motion. */
function ModalPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

function PreviewPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}