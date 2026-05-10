import { PageIdentityBar } from '../components/page-identity-bar'

/**
 * Master PDF shell preview — same generator as `public/samples/golfsol-unified-document-template.pdf`.
 * Regenerate: `node scripts/generate-gsol-unified-pdf-sample.mjs`
 */
export function UnifiedPdfSamplePage() {
  const pdfSrc = `${window.location.origin}/samples/golfsol-unified-document-template.pdf`

  return (
    <div className="min-h-screen bg-[#f7f0e2] px-4 py-8 text-forest-900 md:px-8">
      <PageIdentityBar
        compact
        label="Unified PDF template"
        eyebrow="Branded PDF shell"
        description="One header, section rhythm, tables, and footer for form copies, quotes, policies, and invoices. Regenerate from repo root: node scripts/generate-gsol-unified-pdf-sample.mjs"
        className="-mx-4 -mt-8 mb-6 md:-mx-8"
      />
      <div className="mx-auto max-w-5xl space-y-4">
        <p className="text-sm text-forest-700">
          If the frame is empty, run the script once so{' '}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">public/samples/golfsol-unified-document-template.pdf</code> exists,
          then refresh.
        </p>
        <div className="overflow-hidden rounded-2xl border border-forest-200 bg-forest-950/10 shadow-lg">
          <iframe
            className="h-[min(88vh,960px)] w-full bg-neutral-900"
            src={pdfSrc}
            title="Golf Sol Ireland unified PDF template sample"
          />
        </div>
      </div>
    </div>
  )
}
