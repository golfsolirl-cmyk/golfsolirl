import { useCallback, useEffect, useState } from 'react'
import { Copy, FilePlus, Pencil, Trash2 } from 'lucide-react'
import { LuxuryButton } from '../ui/button'
import { ClientDocumentEditor } from './client-document-editor'
import {
  documentTypeLabel,
  formatClientDocumentEuro,
  formatClientDocumentLongDate,
  type ClientDocumentDraft,
  type ClientDocumentListRow
} from '../../lib/client-enquiry-document'
import { clientDocumentRequest, downloadClientDocumentFile } from '../../lib/client-enquiry-document-api'
import { cx } from '../../lib/utils'

type ClientDocumentDeskProps = {
  readonly accessToken: string | null
  readonly seedEnquiryId?: string | null
  readonly onSeedConsumed?: () => void
}

type View = 'list' | 'editor'

const statusClass = (status: string) => {
  if (status === 'sent') return 'bg-emerald-50 text-emerald-900 ring-emerald-200'
  if (status === 'completed') return 'bg-fairway-50 text-forest-900 ring-fairway-200'
  return 'bg-forest-50 text-forest-800 ring-forest-200'
}

export function ClientDocumentDesk({ accessToken, seedEnquiryId, onSeedConsumed }: ClientDocumentDeskProps) {
  const [view, setView] = useState<View>('list')
  const [rows, setRows] = useState<ClientDocumentListRow[]>([])
  const [draft, setDraft] = useState<ClientDocumentDraft | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const loadList = useCallback(async () => {
    if (!accessToken) return
    setBusy('list')
    setError(null)
    try {
      const data = await clientDocumentRequest<{ documents: ClientDocumentListRow[] }>(accessToken, { action: 'list' })
      setRows(data.documents ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load documents.')
    } finally {
      setBusy(null)
    }
  }, [accessToken])

  useEffect(() => {
    void loadList()
  }, [loadList])

  const openDraft = (next: ClientDocumentDraft) => {
    setDraft(next)
    setView('editor')
    setError(null)
    setNotice(null)
  }

  useEffect(() => {
    if (!seedEnquiryId || !accessToken) return
    let cancelled = false
    const run = async () => {
      setBusy('from-enquiry')
      setError(null)
      try {
        const data = await clientDocumentRequest<{ draft: ClientDocumentDraft }>(accessToken, {
          action: 'from-enquiry',
          enquiryId: seedEnquiryId
        })
        if (!cancelled) openDraft(data.draft)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to open that enquiry.')
      } finally {
        if (!cancelled) {
          setBusy(null)
          onSeedConsumed?.()
        }
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [seedEnquiryId, accessToken, onSeedConsumed])

  const createBlank = async () => {
    if (!accessToken) {
      setError('Sign in again as admin.')
      return
    }
    setBusy('blank')
    setError(null)
    try {
      const data = await clientDocumentRequest<{ draft: ClientDocumentDraft }>(accessToken, { action: 'blank' })
      openDraft(data.draft)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to create a blank document.')
    } finally {
      setBusy(null)
    }
  }

  const save = async () => {
    if (!accessToken || !draft) return
    setBusy('save')
    setError(null)
    setNotice(null)
    try {
      const data = await clientDocumentRequest<{ draft: ClientDocumentDraft }>(accessToken, { action: 'save', draft })
      setDraft(data.draft)
      setNotice('Document saved.')
      void loadList()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save this document.')
    } finally {
      setBusy(null)
    }
  }

  const download = async (kind: 'pdf' | 'docx') => {
    if (!accessToken || !draft) return
    setBusy(kind)
    setError(null)
    try {
      await downloadClientDocumentFile(
        kind === 'pdf' ? '/api/client-enquiry-document-pdf' : '/api/client-enquiry-document-docx',
        accessToken,
        draft,
        kind === 'pdf' ? 'document.pdf' : 'document.docx',
        kind === 'pdf' ? 'Unable to generate the PDF. Please try again.' : 'Unable to generate the Word document. Please try again.'
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed.')
    } finally {
      setBusy(null)
    }
  }

  const printDoc = () => {
    const cleanup = () => document.documentElement.classList.remove('client-document-printing')
    window.addEventListener('afterprint', cleanup, { once: true })
    document.documentElement.classList.add('client-document-printing')
    window.print()
    window.setTimeout(cleanup, 2000)
  }

  const emailDoc = async (opts: { to: string; subject: string; message: string; attach: 'pdf' | 'word' | 'both' }) => {
    if (!accessToken || !draft) return
    setBusy('email')
    setError(null)
    setNotice(null)
    try {
      const data = await clientDocumentRequest<{ message: string; draft: ClientDocumentDraft }>(
        accessToken,
        {
          to: opts.to,
          subject: opts.subject,
          message: opts.message,
          attach: opts.attach,
          draft
        },
        '/api/client-enquiry-document-email'
      )
      if (data.draft) setDraft(data.draft)
      setNotice(data.message ?? 'Email sent.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to send the email.')
    } finally {
      setBusy(null)
    }
  }

  const downloadSaved = async (id: string, kind: 'pdf' | 'docx') => {
    if (!accessToken) return
    setBusy(kind)
    setError(null)
    try {
      const data = await clientDocumentRequest<{ draft: ClientDocumentDraft }>(accessToken, { action: 'get', id })
      await downloadClientDocumentFile(
        kind === 'pdf' ? '/api/client-enquiry-document-pdf' : '/api/client-enquiry-document-docx',
        accessToken,
        data.draft,
        kind === 'pdf' ? 'document.pdf' : 'document.docx',
        kind === 'pdf' ? 'Unable to generate the PDF. Please try again.' : 'Unable to generate the Word document. Please try again.'
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed.')
    } finally {
      setBusy(null)
    }
  }

  const editRow = async (id: string) => {
    if (!accessToken) return
    setBusy('get')
    setError(null)
    try {
      const data = await clientDocumentRequest<{ draft: ClientDocumentDraft }>(accessToken, { action: 'get', id })
      openDraft(data.draft)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to open that document.')
    } finally {
      setBusy(null)
    }
  }

  const duplicateRow = async (id: string) => {
    if (!accessToken) return
    setBusy('duplicate')
    setError(null)
    try {
      const data = await clientDocumentRequest<{ draft: ClientDocumentDraft }>(accessToken, { action: 'duplicate', id })
      openDraft(data.draft)
      setNotice('Duplicated as a new draft with a new reference number.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to duplicate that document.')
    } finally {
      setBusy(null)
    }
  }

  const deleteRow = async (row: ClientDocumentListRow) => {
    if (!accessToken) return
    if (!window.confirm(`Remove ${row.reference}? This does not delete the original enquiry.`)) return
    setBusy('delete')
    setError(null)
    try {
      await clientDocumentRequest(accessToken, { action: 'delete', id: row.id })
      setNotice('Document removed.')
      void loadList()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to remove that document.')
    } finally {
      setBusy(null)
    }
  }

  if (view === 'editor' && draft) {
    return (
      <ClientDocumentEditor
        busy={busy}
        draft={draft}
        error={error}
        notice={notice}
        onBack={() => {
          setView('list')
          setDraft(null)
          void loadList()
        }}
        onChange={setDraft}
        onDownloadPdf={() => void download('pdf')}
        onDownloadWord={() => void download('docx')}
        onEmail={(opts) => void emailDoc(opts)}
        onPrint={printDoc}
        onSave={() => void save()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-brand-600">Client documents</p>
          <h2 className="font-display mt-1 text-2xl font-semibold text-forest-950">Quotes, letters and enquiry replies</h2>
          <p className="mt-2 max-w-2xl text-sm text-forest-600">
            Open a website form and choose Create document, or start a blank letter here. Preview on A4, then download Word or PDF.
          </p>
        </div>
        <LuxuryButton className="!px-5 !py-2.5" disabled={Boolean(busy)} onClick={() => void createBlank()} type="button">
          <span className="inline-flex items-center gap-2">
            <FilePlus aria-hidden className="h-4 w-4" />
            Create blank document
          </span>
        </LuxuryButton>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-forest-200 bg-fairway-50 px-4 py-3 text-sm text-forest-900" role="status">
          {notice}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-forest-200 bg-offwhite px-6 py-10 text-center text-sm text-forest-800">
          No saved documents yet. Create one from a website form, or start a blank document.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-forest-100 bg-white shadow-soft">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-forest-950 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Enquiry</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-100">
              {rows.map((row, i) => (
                <tr className={cx(i % 2 === 1 ? 'bg-offwhite/90' : 'bg-white')} key={row.id}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-forest-900">{row.reference}</td>
                  <td className="px-4 py-3 text-forest-900">{row.customerName}</td>
                  <td className="px-4 py-3">{documentTypeLabel(row.documentType, row.documentTitle)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatClientDocumentLongDate(row.documentDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {typeof row.total === 'number' && row.total > 0 ? formatClientDocumentEuro(row.total) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1', statusClass(row.status))}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{row.enquiryReference || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800" onClick={() => void editRow(row.id)} type="button">
                        <Pencil aria-hidden className="h-3.5 w-3.5" />
                        View / edit
                      </button>
                      <button
                        className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800"
                        onClick={() => void downloadSaved(row.id, 'docx')}
                        type="button"
                      >
                        Word
                      </button>
                      <button
                        className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800"
                        onClick={() => void downloadSaved(row.id, 'pdf')}
                        type="button"
                      >
                        PDF
                      </button>
                      <button className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800" onClick={() => void duplicateRow(row.id)} type="button">
                        <Copy aria-hidden className="h-3.5 w-3.5" />
                        Duplicate
                      </button>
                      <button className="inline-flex items-center gap-1 text-xs font-semibold text-red-800" onClick={() => void deleteRow(row)} type="button">
                        <Trash2 aria-hidden className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
