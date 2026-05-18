import { PageIdentityBar } from '../components/page-identity-bar'
import { HOMEPAGE_CLIENT_PDF_SAMPLE_FILENAME } from '../lib/homepage-client-pdf'

/**
 * Homepage-style branded client PDF — approve before attaching to emails.
 * Regenerate: npm run generate:homepage-client-pdf
 */
export function HomepageBrandedPdfSamplePage() {
  const pdfSrc = `${window.location.origin}/samples/${HOMEPAGE_CLIENT_PDF_SAMPLE_FILENAME}`

  return (
    <div className="min-h-screen bg-offwhite px-4 py-8 text-gs-dark md:px-8">
      <PageIdentityBar
        compact
        label="Homepage client PDF"
        eyebrow="Branded document · email attachment"
        description="Same visual story as the homepage: fleet hero, three services, trip desk summary, and quote band. Regenerate: npm run generate:homepage-client-pdf"
        className="-mx-4 -mt-8 mb-6 md:-mx-8"
      />
      <div className="mx-auto max-w-5xl space-y-5">
        <p className="font-ge text-base leading-relaxed text-forest-700">
          Review the PDF below. If the frame is empty, run{' '}
          <code className="rounded bg-white px-2 py-1 text-sm font-semibold text-forest-900">
            npm run generate:homepage-client-pdf
          </code>{' '}
          once, then refresh. Live data PDFs can be generated via{' '}
          <code className="rounded bg-white px-2 py-1 text-sm">POST /api/homepage-client-pdf</code>.
        </p>
        <div className="overflow-hidden rounded-2xl border border-forest-200 bg-forest-950/10 shadow-[0_24px_80px_rgba(6,59,42,0.12)]">
          <iframe
            className="h-[min(90vh,1000px)] w-full bg-neutral-900"
            src={pdfSrc}
            title="Golf Sol Ireland homepage-branded client document PDF"
          />
        </div>
      </div>
    </div>
  )
}
