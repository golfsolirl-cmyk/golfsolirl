import { useState, type ReactNode } from 'react'
import { Download, Loader2, Mail, Printer, Save } from 'lucide-react'
import { LuxuryButton } from '../ui/button'
import { ClientDocumentA4 } from './client-document-a4'
import {
  CLIENT_DOCUMENT_TYPES,
  DEFAULT_CLIENT_DOCUMENT_PAYMENT,
  DEFAULT_CLIENT_DOCUMENT_TERMS,
  emptyPricingLine,
  formatClientDocumentEuro,
  calculateClientDocumentPricing,
  type ClientDocumentDraft,
  type ClientDocumentPricingLine,
  type ClientDocumentSections,
  type ClientDocumentTypeId
} from '../../lib/client-enquiry-document'
import { cx } from '../../lib/utils'

type ClientDocumentEditorProps = {
  readonly draft: ClientDocumentDraft
  readonly onChange: (next: ClientDocumentDraft) => void
  readonly onBack: () => void
  readonly onSave: () => void
  readonly onDownloadWord: () => void
  readonly onDownloadPdf: () => void
  readonly onPrint: () => void
  readonly onEmail: (opts: { to: string; subject: string; message: string; attach: 'pdf' | 'word' | 'both' }) => void
  readonly busy: string | null
  readonly notice: string | null
  readonly error: string | null
}

const fieldClass =
  'w-full rounded-xl border-2 border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60'
const labelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600'

function Field({
  label,
  children
}: {
  readonly label: string
  readonly children: ReactNode
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  )
}

export function ClientDocumentEditor({
  draft,
  onChange,
  onBack,
  onSave,
  onDownloadWord,
  onDownloadPdf,
  onPrint,
  onEmail,
  busy,
  notice,
  error
}: ClientDocumentEditorProps) {
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailTo, setEmailTo] = useState(draft.customer.email)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('Please find your document attached.')
  const [emailAttach, setEmailAttach] = useState<'pdf' | 'word' | 'both'>('pdf')

  const set = (patch: Partial<ClientDocumentDraft>) => onChange({ ...draft, ...patch })
  const setCustomer = (patch: Partial<ClientDocumentDraft['customer']>) =>
    onChange({ ...draft, customer: { ...draft.customer, ...patch } })
  const setSection = (key: keyof ClientDocumentSections, value: boolean) =>
    onChange({ ...draft, sections: { ...draft.sections, [key]: value } })

  const updateLine = (id: string, patch: Partial<ClientDocumentPricingLine>) =>
    onChange({
      ...draft,
      pricingLines: draft.pricingLines.map((line) => (line.id === id ? { ...line, ...patch } : line))
    })

  const actions = (
    <div className="flex flex-wrap gap-2">
      <LuxuryButton className="!px-4 !py-2 !text-xs" disabled={Boolean(busy)} onClick={onSave} type="button">
        <span className="inline-flex items-center gap-2">
          <Save aria-hidden className="h-3.5 w-3.5" />
          {busy === 'save' ? 'Saving…' : draft.id ? 'Save changes' : 'Save draft'}
        </span>
      </LuxuryButton>
      <LuxuryButton
        className="!px-4 !py-2 !text-xs"
        disabled={Boolean(busy)}
        onClick={onDownloadWord}
        type="button"
        variant="outlineOnLight"
      >
        <span className="inline-flex items-center gap-2">
          <Download aria-hidden className="h-3.5 w-3.5" />
          {busy === 'docx' ? 'Preparing…' : 'Download Word'}
        </span>
      </LuxuryButton>
      <LuxuryButton
        className="!px-4 !py-2 !text-xs"
        disabled={Boolean(busy)}
        onClick={onDownloadPdf}
        type="button"
        variant="outlineOnLight"
      >
        <span className="inline-flex items-center gap-2">
          <Download aria-hidden className="h-3.5 w-3.5" />
          {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}
        </span>
      </LuxuryButton>
      <LuxuryButton className="!px-4 !py-2 !text-xs" disabled={Boolean(busy)} onClick={onPrint} type="button" variant="outlineOnLight">
        <span className="inline-flex items-center gap-2">
          <Printer aria-hidden className="h-3.5 w-3.5" />
          Print
        </span>
      </LuxuryButton>
      <LuxuryButton
        className="!px-4 !py-2 !text-xs"
        disabled={Boolean(busy)}
        onClick={() => {
          setEmailTo(draft.customer.email)
          setEmailOpen((o) => !o)
        }}
        type="button"
        variant="outlineOnLight"
      >
        <span className="inline-flex items-center gap-2">
          <Mail aria-hidden className="h-3.5 w-3.5" />
          Email to customer
        </span>
      </LuxuryButton>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="text-sm font-semibold text-forest-800 underline-offset-2 hover:underline"
          onClick={onBack}
          type="button"
        >
          ← All documents
        </button>
        {busy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin text-forest-700" /> : null}
      </div>
      <div className="client-document-no-print">{actions}</div>
      {error ? (
        <p className="client-document-no-print rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="client-document-no-print rounded-xl border border-forest-200 bg-fairway-50 px-4 py-3 text-sm text-forest-900" role="status">
          {notice}
        </p>
      ) : null}

      {emailOpen ? (
        <div className="client-document-no-print space-y-3 rounded-2xl border border-forest-200 bg-white p-4">
          <p className="text-sm font-semibold text-forest-950">Email this document</p>
          <Field label="To">
            <input className={fieldClass} onChange={(e) => setEmailTo(e.target.value)} type="email" value={emailTo} />
          </Field>
          <Field label="Subject">
            <input
              className={fieldClass}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder={`${CLIENT_DOCUMENT_TYPES.find((t) => t.id === draft.documentType)?.label ?? 'Document'} — ${draft.reference}`}
              type="text"
              value={emailSubject}
            />
          </Field>
          <Field label="Short message">
            <textarea className={cx(fieldClass, 'min-h-[88px]')} onChange={(e) => setEmailMessage(e.target.value)} value={emailMessage} />
          </Field>
          <fieldset>
            <legend className={labelClass}>Attachment</legend>
            <div className="flex flex-wrap gap-3 text-sm text-forest-800">
              {(['pdf', 'word', 'both'] as const).map((opt) => (
                <label className="inline-flex items-center gap-2" key={opt}>
                  <input checked={emailAttach === opt} onChange={() => setEmailAttach(opt)} type="radio" />
                  {opt === 'pdf' ? 'PDF' : opt === 'word' ? 'Word' : 'Both'}
                </label>
              ))}
            </div>
          </fieldset>
          <LuxuryButton
            className="!px-4 !py-2 !text-xs"
            disabled={Boolean(busy)}
            onClick={() => onEmail({ to: emailTo, subject: emailSubject, message: emailMessage, attach: emailAttach })}
            type="button"
          >
            {busy === 'email' ? 'Sending…' : 'Send email'}
          </LuxuryButton>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <form className="client-document-no-print space-y-5" onSubmit={(e) => e.preventDefault()}>
          <section className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Document</p>
            <Field label="Type">
              <select
                className={fieldClass}
                onChange={(e) => {
                  const documentType = e.target.value as ClientDocumentTypeId
                  const pricingOn = documentType === 'quotation' || documentType === 'proposal'
                  onChange({
                    ...draft,
                    documentType,
                    sections: {
                      ...draft.sections,
                      pricing: pricingOn || draft.sections.pricing,
                      payment: pricingOn || draft.sections.payment,
                      signature: pricingOn || draft.sections.signature
                    }
                  })
                }}
                value={draft.documentType}
              >
                {CLIENT_DOCUMENT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Field>
            {draft.documentType === 'custom' ? (
              <Field label="Custom title">
                <input className={fieldClass} onChange={(e) => set({ customTitle: e.target.value })} value={draft.customTitle} />
              </Field>
            ) : null}
            <Field label="Reference">
              <input className={cx(fieldClass, 'font-mono')} onChange={(e) => set({ reference: e.target.value })} value={draft.reference} />
            </Field>
            <Field label="Date">
              <input className={fieldClass} onChange={(e) => set({ documentDate: e.target.value })} type="date" value={draft.documentDate} />
            </Field>
            <Field label="Valid until (optional)">
              <input className={fieldClass} onChange={(e) => set({ validUntil: e.target.value })} type="date" value={draft.validUntil} />
            </Field>
            <Field label="Subject">
              <input className={fieldClass} onChange={(e) => set({ subject: e.target.value })} value={draft.subject} />
            </Field>
            <Field label="Status">
              <select className={fieldClass} onChange={(e) => set({ status: e.target.value as ClientDocumentDraft['status'] })} value={draft.status}>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="sent">Sent</option>
              </select>
            </Field>
          </section>

          <section className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Customer</p>
            <Field label="Customer / company name">
              <input className={fieldClass} onChange={(e) => setCustomer({ name: e.target.value })} value={draft.customer.name} />
            </Field>
            <Field label="Company (if different)">
              <input className={fieldClass} onChange={(e) => setCustomer({ company: e.target.value })} value={draft.customer.company} />
            </Field>
            <Field label="Contact name">
              <input className={fieldClass} onChange={(e) => setCustomer({ contactName: e.target.value })} value={draft.customer.contactName} />
            </Field>
            <Field label="Email">
              <input className={fieldClass} onChange={(e) => setCustomer({ email: e.target.value })} type="email" value={draft.customer.email} />
            </Field>
            <Field label="Telephone">
              <input className={fieldClass} onChange={(e) => setCustomer({ phone: e.target.value })} value={draft.customer.phone} />
            </Field>
            <Field label="Address">
              <textarea className={cx(fieldClass, 'min-h-[72px]')} onChange={(e) => setCustomer({ address: e.target.value })} value={draft.customer.address} />
            </Field>
          </section>

          <section className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Include on the document</p>
            {(
              [
                ['enquiry', 'Customer enquiry'],
                ['message', 'Response message'],
                ['pricing', 'Pricing'],
                ['notes', 'Additional notes'],
                ['terms', 'Terms'],
                ['payment', 'Payment information'],
                ['signature', 'Signature area']
              ] as const
            ).map(([key, label]) => (
              <label className="flex items-center gap-2 text-sm text-forest-900" key={key}>
                <input checked={draft.sections[key]} onChange={(e) => setSection(key, e.target.checked)} type="checkbox" />
                {label}
              </label>
            ))}
          </section>

          {draft.sections.enquiry ? (
            <section className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Customer enquiry</p>
              <textarea
                className={cx(fieldClass, 'min-h-[120px]')}
                onChange={(e) => set({ enquirySummary: e.target.value })}
                value={draft.enquirySummary}
              />
            </section>
          ) : null}

          {draft.sections.message ? (
            <section className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Message / response</p>
              <p className="text-xs text-forest-600">
                Use blank lines between paragraphs. Start a line with - for a bullet, or ## for a heading.
              </p>
              <textarea
                className={cx(fieldClass, 'min-h-[180px]')}
                onChange={(e) => set({ message: e.target.value })}
                placeholder="Thank you for your enquiry…"
                value={draft.message}
              />
            </section>
          ) : null}

          {draft.sections.pricing ? (
            <section className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Pricing</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    checked={draft.pricingMode === 'detailed'}
                    onChange={() => set({ pricingMode: 'detailed' })}
                    type="radio"
                  />
                  Detailed pricing
                </label>
                <label className="inline-flex items-center gap-2">
                  <input checked={draft.pricingMode === 'single'} onChange={() => set({ pricingMode: 'single' })} type="radio" />
                  Single price
                </label>
              </div>
              {draft.pricingMode === 'single' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Description">
                    <input
                      className={fieldClass}
                      onChange={(e) => set({ singlePrice: { ...draft.singlePrice, description: e.target.value } })}
                      value={draft.singlePrice.description}
                    />
                  </Field>
                  <Field label="Total (€)">
                    <input
                      className={fieldClass}
                      inputMode="decimal"
                      onChange={(e) => set({ singlePrice: { ...draft.singlePrice, total: Number(e.target.value) || 0 } })}
                      type="number"
                      value={draft.singlePrice.total || ''}
                    />
                  </Field>
                </div>
              ) : (
                <div className="space-y-3">
                  {draft.pricingLines.map((line) => (
                    <div className="grid gap-2 sm:grid-cols-[1fr_4.5rem_6.5rem_auto]" key={line.id}>
                      <input
                        className={fieldClass}
                        onChange={(e) => updateLine(line.id, { description: e.target.value })}
                        placeholder="Description"
                        value={line.description}
                      />
                      <input
                        className={fieldClass}
                        min={0}
                        onChange={(e) => updateLine(line.id, { qty: Number(e.target.value) || 0 })}
                        type="number"
                        value={line.qty}
                      />
                      <input
                        className={fieldClass}
                        min={0}
                        onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) || 0 })}
                        placeholder="Unit €"
                        type="number"
                        value={line.unitPrice || ''}
                      />
                      <button
                        className="text-xs font-semibold text-red-800"
                        onClick={() =>
                          onChange({
                            ...draft,
                            pricingLines: draft.pricingLines.filter((row) => row.id !== line.id)
                          })
                        }
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    className="text-sm font-semibold text-forest-800 underline-offset-2 hover:underline"
                    onClick={() => onChange({ ...draft, pricingLines: [...draft.pricingLines, emptyPricingLine()] })}
                    type="button"
                  >
                    Add row
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input checked={draft.vatEnabled} onChange={(e) => set({ vatEnabled: e.target.checked })} type="checkbox" />
                Include VAT
              </label>
              {draft.vatEnabled ? (
                <Field label="VAT %">
                  <input
                    className={fieldClass}
                    min={0}
                    onChange={(e) => set({ vatPercent: Number(e.target.value) || 0 })}
                    type="number"
                    value={draft.vatPercent}
                  />
                </Field>
              ) : null}
              <p className="text-sm font-semibold text-forest-900">
                Total {formatClientDocumentEuro(calculateClientDocumentPricing(draft).total)}
              </p>
            </section>
          ) : null}

          {draft.sections.notes ? (
            <section className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Additional notes</p>
              <textarea className={cx(fieldClass, 'min-h-[88px]')} onChange={(e) => set({ notes: e.target.value })} value={draft.notes} />
            </section>
          ) : null}

          {draft.sections.terms ? (
            <section className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Terms</p>
                <button
                  className="text-xs font-semibold text-forest-800 underline-offset-2 hover:underline"
                  onClick={() => set({ terms: DEFAULT_CLIENT_DOCUMENT_TERMS })}
                  type="button"
                >
                  Reset to default terms
                </button>
              </div>
              <textarea className={cx(fieldClass, 'min-h-[140px]')} onChange={(e) => set({ terms: e.target.value })} value={draft.terms} />
            </section>
          ) : null}

          {draft.sections.payment ? (
            <section className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Payment information</p>
                <button
                  className="text-xs font-semibold text-forest-800 underline-offset-2 hover:underline"
                  onClick={() => set({ paymentDetails: DEFAULT_CLIENT_DOCUMENT_PAYMENT })}
                  type="button"
                >
                  Reset to default
                </button>
              </div>
              <textarea
                className={cx(fieldClass, 'min-h-[120px]')}
                onChange={(e) => set({ paymentDetails: e.target.value })}
                value={draft.paymentDetails}
              />
            </section>
          ) : null}
        </form>

        <div className="client-document-a4-stage min-w-0">
          <p className="client-document-no-print mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">
            Live A4 preview
          </p>
          <ClientDocumentA4 draft={draft} />
        </div>
      </div>

      <div className="client-document-no-print pt-2">{actions}</div>
    </div>
  )
}
