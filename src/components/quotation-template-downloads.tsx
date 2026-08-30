import { QUOTATION_TEMPLATE_FILES } from '../lib/quotation-template-files'

type Props = {
  readonly compact?: boolean
  readonly attachBusy?: boolean
  readonly onAttachPdf?: (href: string, filename: string) => void
}

export function QuotationTemplateDownloads({ compact = false, attachBusy = false, onAttachPdf }: Props) {
  return (
    <div className={compact ? 'space-y-3' : 'grid gap-4 lg:grid-cols-2'}>
      {QUOTATION_TEMPLATE_FILES.map((file) => (
        <article
          className={
            compact
              ? 'rounded-2xl border border-forest-100 bg-white p-4'
              : 'rounded-[1.75rem] border border-forest-100 bg-white p-5 shadow-soft sm:p-6'
          }
          key={file.id}
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            {file.id === 'blank' ? 'Blank template' : 'Branded template'}
          </p>
          <h3 className="font-display mt-1 text-lg font-semibold text-forest-950 sm:text-xl">{file.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-forest-700">{file.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              className="inline-flex items-center rounded-full bg-forest-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-800"
              download={file.pdfName}
              href={file.pdfHref}
            >
              Download PDF
            </a>
            <a
              className="inline-flex items-center rounded-full border border-forest-200 bg-white px-5 py-2.5 text-sm font-semibold text-forest-900 hover:bg-forest-50"
              download={file.docxName}
              href={file.docxHref}
            >
              Download Word
            </a>
            {onAttachPdf ? (
              <button
                className="inline-flex items-center rounded-full border border-forest-200 bg-fairway-50 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-forest-50 disabled:opacity-60"
                disabled={attachBusy}
                onClick={() => onAttachPdf(file.pdfHref, file.pdfName)}
                type="button"
              >
                Attach PDF to email
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}
