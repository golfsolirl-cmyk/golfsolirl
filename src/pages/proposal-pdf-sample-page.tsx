import { PageIdentityBar } from '../components/page-identity-bar'

/**
 * Static sample of the server-rendered proposal PDF (`public/samples/sample-proposal.pdf`).
 * Regenerate the file with: `node scripts/generate-sample-proposal-pdf.mjs`
 */
export function ProposalPdfSamplePage() {
  const pdfSrc = `${window.location.origin}/samples/sample-proposal.pdf`

  return (
    <div className="min-h-screen bg-[#f7f0e2] px-4 py-8 text-forest-900 md:px-8">
      <PageIdentityBar
        compact
        label="Proposal PDF sample"
        eyebrow="Branded PDF preview"
        description="Same generator as admin “Preview proposal PDF” and client emails. Regenerate the file from the repo root with: node scripts/generate-sample-proposal-pdf.mjs"
        className="-mx-4 -mt-8 mb-6 md:-mx-8"
      />
      <div className="mx-auto max-w-5xl space-y-4">
        <p className="text-sm text-forest-700">
          If the frame is empty, run the script once so <code className="rounded bg-white px-1.5 py-0.5 text-xs">public/samples/sample-proposal.pdf</code> exists, then refresh.
        </p>
        <div className="overflow-hidden rounded-2xl border border-forest-200 bg-forest-950/10 shadow-lg">
          <iframe
            className="h-[min(88vh,960px)] w-full bg-neutral-900"
            src={pdfSrc}
            title="Sample Golf Sol Ireland proposal PDF"
          />
        </div>
      </div>
    </div>
  )
}
