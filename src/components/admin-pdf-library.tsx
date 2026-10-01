import { ExternalLink } from 'lucide-react'
import { ADMIN_PDF_LIBRARY, adminPdfLibraryGroups, type AdminPdfDoc } from '../lib/admin-pdf-library'
import { cx } from '../lib/utils'

export type AdminPdfLivePreview = {
  readonly title: string
  readonly href: string
  readonly detail?: string
}

type AdminPdfLibraryProps = {
  readonly selectedId: string
  readonly onSelect: (id: string) => void
  readonly livePreview: AdminPdfLivePreview | null
  readonly liveSelected: boolean
}

export function AdminPdfLibrary({ selectedId, onSelect, livePreview, liveSelected }: AdminPdfLibraryProps) {
  const groups = adminPdfLibraryGroups()
  const selected = ADMIN_PDF_LIBRARY.find((doc) => doc.id === selectedId) ?? ADMIN_PDF_LIBRARY[0]
  const showingLive = liveSelected && livePreview != null
  const frameTitle = showingLive ? livePreview.title : selected.title
  const frameSrc = showingLive ? livePreview.href : selected.href
  const frameDetail = showingLive ? livePreview.detail : selected.description

  return (
    <section className="overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft" id="admin-pdf-library">
      <div className="border-b border-forest-100 bg-offwhite px-5 py-5 sm:px-7">
        <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-brand-600">PDF library</p>
        <h3 className="font-display mt-1 text-xl font-semibold text-forest-950 sm:text-2xl">All PDF documents</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-forest-700">
          Open any house document in the browser: enquiry pack, proposal, transfer receipts, trip invoice, refund, and official quotation letters.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
        <nav aria-label="PDF documents" className="max-h-[70vh] overflow-y-auto border-b border-forest-100 bg-offwhite/60 p-3 lg:max-h-[min(88vh,960px)] lg:border-b-0 lg:border-r">
          {livePreview ? (
            <div className="mb-3">
              <p className="px-2 pb-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-forest-600">Open from this desk</p>
              <button
                className={cx(
                  'w-full rounded-xl px-3 py-2.5 text-left',
                  showingLive ? 'bg-forest-900 text-white' : 'bg-white text-forest-950 ring-1 ring-forest-200 hover:bg-fairway-50'
                )}
                onClick={() => onSelect('live')}
                type="button"
              >
                <span className="block text-sm font-semibold">{livePreview.title}</span>
                <span className={cx('mt-0.5 block text-xs leading-snug', showingLive ? 'text-fairway-100' : 'text-forest-600')}>
                  {livePreview.detail ?? 'Saved client document'}
                </span>
              </button>
            </div>
          ) : null}
          {groups.map(({ group, docs }) => (
            <div className="mb-3 last:mb-0" key={group}>
              <p className="px-2 pb-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-forest-600">{group}</p>
              <ul className="space-y-1">
                {docs.map((doc) => (
                  <li key={doc.id}>
                    <PdfListButton active={!showingLive && selected.id === doc.id} doc={doc} onSelect={onSelect} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col bg-forest-950/5 p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3 px-1">
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-forest-950">{frameTitle}</p>
              {frameDetail ? <p className="mt-1 text-sm text-forest-700">{frameDetail}</p> : null}
            </div>
            <a
              className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-800"
              href={frameSrc}
              rel="noreferrer"
              target="_blank"
            >
              Open in new tab
              <ExternalLink aria-hidden className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-forest-200 bg-white">
            <iframe className="h-[min(78vh,920px)] w-full bg-neutral-100" src={frameSrc} title={frameTitle} />
          </div>
        </div>
      </div>
    </section>
  )
}

function PdfListButton({
  doc,
  active,
  onSelect
}: {
  readonly doc: AdminPdfDoc
  readonly active: boolean
  readonly onSelect: (id: string) => void
}) {
  return (
    <button
      className={cx(
        'w-full rounded-xl px-3 py-2.5 text-left',
        active ? 'bg-forest-900 text-white' : 'text-forest-950 hover:bg-white'
      )}
      onClick={() => onSelect(doc.id)}
      type="button"
    >
      <span className="block text-sm font-semibold">{doc.title}</span>
      <span className={cx('mt-0.5 block text-xs leading-snug', active ? 'text-fairway-100' : 'text-forest-600')}>{doc.description}</span>
    </button>
  )
}
