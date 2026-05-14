import { ExternalLink, Loader2, Mail, Printer, Share2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LuxuryButton } from './ui/button'
import { cx } from '../lib/utils'

export interface ProposalRowLite {
  readonly id: string
  readonly proposal_id: string
  readonly title: string | null
  readonly status: string
  readonly created_at: string
  readonly payload: unknown | null
}

export type TransferPortalDocumentRow = {
  readonly id: string
  readonly transfer_booking_id: string
  readonly document_kind:
    | 'form_submission'
    | 'vat_quote'
    | 'terms_summary'
    | 'deposit_receipt'
    | 'payment_confirmation'
  readonly title: string
  readonly storage_path: string
  readonly created_at: string
}

type DocumentAccess = { readonly terms: boolean; readonly welcome: boolean }

type Selection =
  | { readonly kind: 'terms' }
  | { readonly kind: 'welcome' }
  | { readonly kind: 'proposal'; readonly row: ProposalRowLite }
  | { readonly kind: 'transfer_portal'; readonly row: TransferPortalDocumentRow }

function selectionKey(s: Selection | null): string | null {
  if (!s) {
    return null
  }
  if (s.kind === 'terms') {
    return 'terms'
  }
  if (s.kind === 'welcome') {
    return 'welcome'
  }
  if (s.kind === 'transfer_portal') {
    return `transfer:${s.row.id}`
  }
  return `proposal:${s.row.id}`
}

function transferDocKindOrder(k: TransferPortalDocumentRow['document_kind']): number {
  if (k === 'vat_quote') {
    return 0
  }
  if (k === 'form_submission') {
    return 1
  }
  if (k === 'deposit_receipt') {
    return 2
  }
  if (k === 'payment_confirmation') {
    return 3
  }
  return 4
}

function parseSelectionKey(
  key: string | null,
  access: DocumentAccess,
  showPdf: boolean,
  proposals: ProposalRowLite[],
  showProposals: boolean,
  transferPortalDocuments: readonly TransferPortalDocumentRow[]
): Selection | null {
  if (!key) {
    return null
  }
  if (key.startsWith('transfer:')) {
    const id = key.slice('transfer:'.length)
    const row = transferPortalDocuments.find((r) => r.id === id)
    if (row) {
      return { kind: 'transfer_portal', row }
    }
    return null
  }
  if (key === 'terms' && showPdf && access.terms) {
    return { kind: 'terms' }
  }
  if (key === 'welcome' && showPdf && access.welcome) {
    return { kind: 'welcome' }
  }
  if (key.startsWith('proposal:') && showProposals) {
    const id = key.slice('proposal:'.length)
    const row = proposals.find((p) => p.id === id)
    if (row?.payload && typeof row.payload === 'object') {
      return { kind: 'proposal', row }
    }
  }
  return null
}

function firstAvailableSelection(
  transferPortalDocuments: readonly TransferPortalDocumentRow[],
  access: DocumentAccess,
  showPdf: boolean,
  proposals: ProposalRowLite[],
  showProposals: boolean
): Selection | null {
  if (transferPortalDocuments.length > 0) {
    const rows = [...transferPortalDocuments]
    rows.sort((a, b) => {
      const t = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (t !== 0) {
        return t
      }
      return transferDocKindOrder(a.document_kind) - transferDocKindOrder(b.document_kind)
    })
    return { kind: 'transfer_portal', row: rows[0] }
  }
  if (showPdf && access.terms) {
    return { kind: 'terms' }
  }
  if (showPdf && access.welcome) {
    return { kind: 'welcome' }
  }
  if (showProposals) {
    const row = proposals.find((p) => p.payload && typeof p.payload === 'object')
    if (row) {
      return { kind: 'proposal', row }
    }
  }
  return null
}

export type PortalClientProposalsPdfViewerProps = {
  readonly documentAccess: DocumentAccess
  readonly proposals: ProposalRowLite[]
  readonly proposalsError: string | null
  readonly showFormalProposalsList: boolean
  readonly showPdfLibraryOnDashboard: boolean
  readonly profilePortalPdfEnabled: boolean
  readonly loadProposalPdf: (row: ProposalRowLite) => Promise<Blob>
  readonly transferPortalDocuments?: readonly TransferPortalDocumentRow[]
  readonly loadTransferPortalPdf?: (row: TransferPortalDocumentRow) => Promise<Blob>
}

export function PortalClientProposalsPdfViewer({
  documentAccess,
  proposals,
  proposalsError,
  showFormalProposalsList,
  showPdfLibraryOnDashboard,
  profilePortalPdfEnabled,
  loadProposalPdf,
  transferPortalDocuments = [],
  loadTransferPortalPdf
}: PortalClientProposalsPdfViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [proposalBlobUrl, setProposalBlobUrl] = useState<string | null>(null)
  const [proposalLoadError, setProposalLoadError] = useState<string | null>(null)
  const [proposalLoading, setProposalLoading] = useState(false)

  const hasTransferShelf = transferPortalDocuments.length > 0 && typeof loadTransferPortalPdf === 'function'
  const hasAnyDoc =
    hasTransferShelf ||
    showPdfLibraryOnDashboard ||
    (showFormalProposalsList && proposals.some((p) => p.payload && typeof p.payload === 'object'))

  const sortedTransferDocs = useMemo(() => {
    const rows = [...transferPortalDocuments]
    rows.sort((a, b) => {
      const t = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (t !== 0) {
        return t
      }
      return transferDocKindOrder(a.document_kind) - transferDocKindOrder(b.document_kind)
    })
    return rows
  }, [transferPortalDocuments])

  const syncSelection = useCallback(() => {
    const next = firstAvailableSelection(
      transferPortalDocuments,
      documentAccess,
      showPdfLibraryOnDashboard,
      proposals,
      showFormalProposalsList
    )
    setSelection((prev) => {
      const pk = selectionKey(prev)
      if (
        pk &&
        parseSelectionKey(
          pk,
          documentAccess,
          showPdfLibraryOnDashboard,
          proposals,
          showFormalProposalsList,
          transferPortalDocuments
        )
      ) {
        return prev
      }
      return next
    })
  }, [documentAccess, proposals, showFormalProposalsList, showPdfLibraryOnDashboard, transferPortalDocuments])

  useEffect(() => {
    syncSelection()
  }, [syncSelection])

  const embedSrc = useMemo(() => {
    if (!selection || selection.kind === 'proposal' || selection.kind === 'transfer_portal') {
      return null
    }
    if (typeof window === 'undefined') {
      return null
    }
    const origin = window.location.origin.replace(/\/+$/, '')
    if (selection.kind === 'terms') {
      return `${origin}/documents/terms?embed=1`
    }
    return `${origin}/documents/welcome?embed=1`
  }, [selection])

  useEffect(() => {
    if (!selection || (selection.kind !== 'proposal' && selection.kind !== 'transfer_portal')) {
      setProposalBlobUrl((u) => {
        if (u) {
          URL.revokeObjectURL(u)
        }
        return null
      })
      setProposalLoadError(null)
      setProposalLoading(false)
      return
    }

    if (selection.kind === 'transfer_portal' && !loadTransferPortalPdf) {
      setProposalLoadError('Document loader is not available.')
      setProposalLoading(false)
      return
    }

    let cancelled = false
    setProposalLoading(true)
    setProposalLoadError(null)
    setProposalBlobUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev)
      }
      return null
    })

    void (async () => {
      try {
        const blob =
          selection.kind === 'proposal'
            ? await loadProposalPdf(selection.row)
            : await loadTransferPortalPdf!(selection.row)
        if (cancelled) {
          return
        }
        const url = URL.createObjectURL(blob)
        setProposalBlobUrl(url)
      } catch (e) {
        if (!cancelled) {
          setProposalLoadError(e instanceof Error ? e.message : 'Could not load PDF.')
        }
      } finally {
        if (!cancelled) {
          setProposalLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selection, loadProposalPdf, loadTransferPortalPdf])

  useEffect(() => {
    return () => {
      setProposalBlobUrl((u) => {
        if (u) {
          URL.revokeObjectURL(u)
        }
        return null
      })
    }
  }, [])

  const viewerTitle = useMemo(() => {
    if (!selection) {
      return 'Documents'
    }
    if (selection.kind === 'terms') {
      return 'Terms & conditions'
    }
    if (selection.kind === 'welcome') {
      return 'Thank you — Golf Sol Ireland'
    }
    if (selection.kind === 'transfer_portal') {
      return selection.row.title.trim() || 'Document'
    }
    return selection.row.title?.trim() || selection.row.proposal_id
  }, [selection])

  const iframeSrc =
    selection?.kind === 'proposal' || selection?.kind === 'transfer_portal' ? proposalBlobUrl : embedSrc

  /** Chrome blocks the internal PDF viewer inside a sandboxed iframe ("This page has been blocked by Chrome"). */
  const iframeSandbox =
    iframeSrc && iframeSrc.startsWith('blob:')
      ? undefined
      : 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads'

  const handlePrint = () => {
    const win = iframeRef.current?.contentWindow
    if (!win) {
      return
    }
    try {
      win.focus()
      win.print()
    } catch {
      window.print()
    }
  }

  const dashboardLink = typeof window !== 'undefined' ? `${window.location.origin.replace(/\/+$/, '')}/dashboard` : ''

  const shareBody = useMemo(() => {
    const lines = [
      `Golf Sol Ireland — ${viewerTitle}.`,
      `Open your client dashboard to read or print this document: ${dashboardLink}`
    ]
    return lines.join('\n')
  }, [viewerTitle, dashboardLink])

  const openWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareBody)}`, '_blank', 'noopener,noreferrer')
  }

  const openEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(`Golf Sol Ireland — ${viewerTitle}`)}&body=${encodeURIComponent(shareBody)}`
  }

  const openInNewTab = () => {
    if (!iframeSrc) {
      return
    }
    window.open(iframeSrc, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadProposal = async () => {
    if (!proposalBlobUrl) {
      return
    }
    if (selection?.kind === 'proposal') {
      const a = document.createElement('a')
      a.href = proposalBlobUrl
      a.download = `golf-sol-ireland-${selection.row.proposal_id.replace(/[^\w.-]+/g, '-')}.pdf`
      a.click()
      return
    }
    if (selection?.kind === 'transfer_portal') {
      const leaf = selection.row.storage_path.split('/').pop() ?? 'document.pdf'
      const safe = leaf.replace(/[^\w.-]+/g, '-') || 'document.pdf'
      const a = document.createElement('a')
      a.href = proposalBlobUrl
      a.download = safe
      a.click()
    }
  }

  const pick = (key: string) => {
    const s = parseSelectionKey(
      key,
      documentAccess,
      showPdfLibraryOnDashboard,
      proposals,
      showFormalProposalsList,
      transferPortalDocuments
    )
    if (s) {
      setSelection(s)
    }
  }

  if (proposalsError && showFormalProposalsList && !hasTransferShelf) {
    return (
      <div className="mb-8 rounded-3xl border border-red-200/80 bg-red-50/90 px-6 py-4 text-base text-red-900 shadow-soft">
        {proposalsError}
      </div>
    )
  }

  if (!hasAnyDoc) {
    if (profilePortalPdfEnabled && !showPdfLibraryOnDashboard && !hasTransferShelf) {
      return (
        <div className="mb-8 rounded-[2rem] border border-forest-100 bg-offwhite/90 px-6 py-5 text-base text-forest-700 shadow-soft">
          <p className="font-medium text-forest-900">PDF library</p>
          <p className="mt-1 max-w-xl">
            This area is enabled for your account; when we send you terms or our thank-you document, they will appear in the
            viewer below.
          </p>
        </div>
      )
    }
    if (showFormalProposalsList && proposals.length === 0 && !proposalsError && !hasTransferShelf) {
      return (
        <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-gold-400 via-fairway-500 to-forest-700"
          />
          <div className="px-6 py-10 md:px-10 md:py-12">
            <h3 className="font-display text-xl font-semibold text-forest-950">No formal proposals yet</h3>
            <p className="mt-4 max-w-lg text-forest-600">
              When we email you a proposal from our admin tools, it will show here in the preview. You can print or share a link
              to this dashboard from the toolbar.
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const activeKey = selectionKey(selection)

  return (
    <div className="mb-8 overflow-hidden rounded-[2rem] border border-forest-200/90 bg-[linear-gradient(165deg,#fffefb_0%,#f4faf6_40%,#eef6f0_100%)] shadow-[0_20px_60px_rgba(15,42,12,0.08)]">
      {proposalsError ? (
        <div className="border-b border-red-200/80 bg-red-50/90 px-5 py-3 text-base text-red-900" role="alert">
          {proposalsError}
        </div>
      ) : null}

      <div className="grid gap-0 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <aside className="border-b border-forest-100/90 bg-white/80 p-4 lg:border-b-0 lg:border-r lg:border-forest-100/90 lg:p-5">
          {hasTransferShelf ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Your paper trail</p>
              <p className="mt-1 text-sm leading-snug text-forest-500">
                Snapshot of your request, VAT quote PDF, and a short terms summary when your price is saved; deposit and paid-in-full
                card receipts appear here after successful online payment.
              </p>
              <ul className="mt-3 max-h-[min(40vh,22rem)] space-y-1 overflow-y-auto pr-1">
                {sortedTransferDocs.map((row) => {
                  const k = `transfer:${row.id}`
                  return (
                    <li key={row.id}>
                      <button
                        className={cx(
                          'flex w-full flex-col rounded-xl px-3 py-2.5 text-left text-base font-semibold transition',
                          activeKey === k
                            ? 'bg-gradient-to-r from-emerald-950 to-forest-900 text-white shadow-md'
                            : 'text-forest-800 hover:bg-forest-50'
                        )}
                        onClick={() => pick(k)}
                        type="button"
                      >
                        <span className="leading-snug">{row.title}</span>
                        <span
                          className={cx(
                            'mt-0.5 text-sm font-normal capitalize',
                            activeKey === k ? 'text-emerald-100/90' : 'text-forest-500'
                          )}
                        >
                          {row.document_kind.replace(/_/g, ' ')}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : null}

          <p className={cx('text-xs font-bold uppercase tracking-[0.18em] text-gold-600', hasTransferShelf ? 'mt-6' : '')}>
            Library
          </p>
          <ul className="mt-3 space-y-1.5">
            {showPdfLibraryOnDashboard && documentAccess.terms ? (
              <li>
                <button
                  className={cx(
                    'flex w-full items-center rounded-xl px-3 py-2.5 text-left text-base font-semibold transition',
                    activeKey === 'terms'
                      ? 'bg-gradient-to-r from-emerald-950 to-forest-900 text-white shadow-md'
                      : 'text-forest-800 hover:bg-forest-50'
                  )}
                  onClick={() => pick('terms')}
                  type="button"
                >
                  Terms & conditions
                </button>
              </li>
            ) : null}
            {showPdfLibraryOnDashboard && documentAccess.welcome ? (
              <li>
                <button
                  className={cx(
                    'flex w-full items-center rounded-xl px-3 py-2.5 text-left text-base font-semibold transition',
                    activeKey === 'welcome'
                      ? 'bg-gradient-to-r from-emerald-950 to-forest-900 text-white shadow-md'
                      : 'text-forest-800 hover:bg-forest-50'
                  )}
                  onClick={() => pick('welcome')}
                  type="button"
                >
                  Thank you letter
                </button>
              </li>
            ) : null}
          </ul>

          {showFormalProposalsList && proposals.length > 0 ? (
            <>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Formal proposals</p>
              <ul className="mt-2 max-h-[min(40vh,22rem)] space-y-1 overflow-y-auto pr-1">
                {proposals.map((row) => {
                  const hasPayload = Boolean(row.payload && typeof row.payload === 'object')
                  const k = `proposal:${row.id}`
                  return (
                    <li key={row.id}>
                      <button
                        className={cx(
                          'flex w-full flex-col rounded-xl px-3 py-2.5 text-left text-base transition',
                          activeKey === k
                            ? 'bg-gradient-to-r from-emerald-950 to-forest-900 text-white shadow-md'
                            : hasPayload
                              ? 'text-forest-800 hover:bg-forest-50'
                              : 'cursor-not-allowed text-forest-400'
                        )}
                        disabled={!hasPayload}
                        onClick={() => hasPayload && pick(k)}
                        type="button"
                      >
                        <span className="font-semibold leading-snug">{row.title?.trim() || row.proposal_id}</span>
                        <span
                          className={cx(
                            'mt-0.5 text-sm',
                            activeKey === k ? 'text-emerald-100/90' : 'text-forest-500'
                          )}
                        >
                          {row.proposal_id}
                          <span className="mx-1 opacity-60">·</span>
                          <span className="capitalize">{row.status}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : null}
        </aside>

        <div className="flex min-h-0 flex-col bg-white/60">
          <div className="flex flex-col gap-3 border-b border-forest-100/90 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:px-6">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Preview</p>
              <h3 className="font-display mt-1 truncate text-xl font-semibold text-forest-950">{viewerTitle}</h3>
              <p className="mt-1 text-sm text-forest-500">Read-only — use print or share below.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LuxuryButton
                className="!gap-1.5 !rounded-full !px-4 !py-2.5 !text-sm"
                disabled={!iframeSrc || proposalLoading}
                onClick={handlePrint}
                type="button"
                variant="primary"
              >
                <Printer className="h-3.5 w-3.5" aria-hidden />
                Print
              </LuxuryButton>
              <LuxuryButton
                className="!gap-1.5 !rounded-full !border-forest-200 !bg-white !px-4 !py-2.5 !text-sm !text-forest-900 shadow-sm hover:!bg-forest-50"
                disabled={!iframeSrc || proposalLoading}
                onClick={openInNewTab}
                type="button"
                variant="white"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                New tab
              </LuxuryButton>
              {selection?.kind === 'proposal' || selection?.kind === 'transfer_portal' ? (
                <LuxuryButton
                  className="!gap-1.5 !rounded-full !border-forest-200 !bg-white !px-4 !py-2.5 !text-sm !text-forest-900 shadow-sm hover:!bg-forest-50"
                  disabled={!proposalBlobUrl || proposalLoading}
                  onClick={() => void handleDownloadProposal()}
                  type="button"
                  variant="white"
                >
                  Download PDF
                </LuxuryButton>
              ) : null}
              <LuxuryButton
                className="!gap-1.5 !rounded-full !border-forest-200 !bg-white !px-4 !py-2.5 !text-sm !text-forest-900 shadow-sm hover:!bg-forest-50"
                onClick={openWhatsApp}
                type="button"
                variant="white"
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-700" aria-hidden />
                WhatsApp
              </LuxuryButton>
              <LuxuryButton
                className="!gap-1.5 !rounded-full !border-forest-200 !bg-white !px-4 !py-2.5 !text-sm !text-forest-900 shadow-sm hover:!bg-forest-50"
                onClick={openEmail}
                type="button"
                variant="white"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden />
                Email
              </LuxuryButton>
            </div>
          </div>

          <div className="relative min-h-[min(72vh,52rem)] flex-1 p-3 md:p-5">
            {proposalLoading ? (
              <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-700" aria-hidden />
                <p className="text-base font-medium text-forest-700">Preparing PDF…</p>
              </div>
            ) : null}
            {proposalLoadError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-base text-red-900" role="alert">
                {proposalLoadError}
              </div>
            ) : null}

            {iframeSrc && !proposalLoadError ? (
              <div className="relative h-[min(72vh,52rem)] overflow-hidden rounded-2xl border-2 border-forest-200/80 bg-forest-950/5 shadow-inner ring-1 ring-gold-200/30">
                <iframe
                  ref={iframeRef}
                  className="h-full w-full bg-white"
                  src={iframeSrc}
                  title={viewerTitle}
                  {...(iframeSandbox ? { sandbox: iframeSandbox } : {})}
                />
              </div>
            ) : !proposalLoading && !proposalLoadError ? (
              <div className="flex h-[min(40vh,24rem)] items-center justify-center rounded-2xl border border-dashed border-forest-200 bg-offwhite/80 px-6 text-center text-base text-forest-600">
                Choose a document from the list.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
