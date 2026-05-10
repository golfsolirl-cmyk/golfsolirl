import { useCallback, useMemo, useState } from 'react'
import { Check, Copy, Mail, Smartphone } from 'lucide-react'
import { getGolfSolBrandedEmailHtml, golfSolEmailSubject } from '../lib/golfsol-email-template'

type ResendSampleId = 'enquiry-customer' | 'enquiry-admin' | 'terms' | 'portal-invite'

const RESEND_SAMPLES: { id: ResendSampleId | 'legacy'; label: string; subject: string; note: string }[] = [
  {
    id: 'enquiry-customer',
    label: 'Enquiry (customer)',
    subject: 'Your Golf Sol Ireland enquiry confirmation (GSI-SAMPLE-001)',
    note: 'Same HTML as Resend after POST /api/enquiry — to the address the guest entered.'
  },
  {
    id: 'enquiry-admin',
    label: 'Enquiry (internal)',
    subject: 'New Golf Sol Ireland enquiry GSI-SAMPLE-001 from Aoife Murphy',
    note: 'Copy to RESEND_NOTIFICATION_TO. Sample data only.'
  },
  {
    id: 'terms',
    label: 'Terms request',
    subject: 'GolfSol Ireland terms and conditions',
    note: 'Same shell as POST /api/terms-email. Inline images use dev-friendly fallbacks in preview.'
  },
  {
    id: 'portal-invite',
    label: 'Post-enquiry invite',
    subject: 'Your Golf Sol trip desk is open — GSI-SAMPLE-001',
    note: 'Follow-up after enquiry (delayed job). Magic link URL is a sample.'
  },
  {
    id: 'legacy',
    label: 'Legacy marketing demo',
    subject: golfSolEmailSubject,
    note: 'Static template in src/lib/golfsol-email-template.ts — not the live Resend enquiry mail.'
  }
]

export function EmailTemplatePreviewPage() {
  const legacyEmailHtml = useMemo(() => getGolfSolBrandedEmailHtml(), [])
  const [activeId, setActiveId] = useState<ResendSampleId | 'legacy'>('enquiry-customer')
  const [copied, setCopied] = useState(false)

  const iframeSrc =
    activeId === 'legacy'
      ? null
      : `/api/email-preview-html?t=${encodeURIComponent(activeId)}`

  const activeMeta = RESEND_SAMPLES.find((s) => s.id === activeId) ?? RESEND_SAMPLES[0]

  const copyHtml = useCallback(async () => {
    const html =
      activeId === 'legacy'
        ? legacyEmailHtml
        : await fetch(`/api/email-preview-html?t=${encodeURIComponent(activeId)}`).then((r) => {
            if (!r.ok) throw new Error('Could not load preview HTML')
            return r.text()
          })
    await navigator.clipboard.writeText(html)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [activeId, legacyEmailHtml])

  return (
    <main className="min-h-screen bg-[#052A1F] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 120% 70% at 50% -20%, rgba(255,199,44,0.18), transparent 55%), radial-gradient(circle at 12% 22%, rgba(255,255,255,0.08), transparent 32%), radial-gradient(circle at 88% 8%, rgba(11,107,69,0.2), transparent 26%), linear-gradient(180deg, #063B2A 0%, #041F17 100%)'
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <section className="rounded-[2rem] border border-white/14 bg-white/[0.07] p-6 shadow-[0_32px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFC72C]/50 bg-[#FFC72C]/14 px-3.5 py-1.5 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-[#FFE27A]">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                Email template preview
              </div>
              <h1 className="mt-5 max-w-3xl font-ge text-[2.45rem] font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-[3.25rem] lg:text-[3.5rem]">
                Production Resend shell, in the browser.
              </h1>
              <p className="mt-4 max-w-2xl font-ge text-base leading-relaxed text-white/78 sm:text-lg">
                Same HTML as live sends (sample enquiry{' '}
                <span className="font-mono text-white/90">GSI-SAMPLE-001</span>). Subject line:{' '}
                <span className="font-bold text-white">{activeMeta.subject}</span>
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/58">{activeMeta.note}</p>
            </div>

            <button
              type="button"
              onClick={() => void copyHtml()}
              className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#FFC72C] px-6 py-3.5 font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-[#16231D] shadow-[0_20px_48px_rgba(255,199,44,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_60px_rgba(255,199,44,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#052A1F]"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? 'HTML copied' : 'Copy email HTML'}
            </button>
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {RESEND_SAMPLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveId(s.id)}
                className={
                  activeId === s.id
                    ? 'rounded-full border border-[#FFC72C] bg-[#FFC72C]/22 px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#FFE27A] shadow-sm'
                    : 'rounded-full border border-white/18 bg-white/[0.06] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white/82 transition hover:border-white/32 hover:bg-white/10'
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-[2rem] border border-[#063B2A]/12 bg-[#F4F7F5] p-4 shadow-[0_32px_100px_rgba(6,59,42,0.18)] ring-1 ring-black/[0.04] sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[#063B2A]/65">
              <span>Desktop preview</span>
              <span className="rounded-full bg-[#063B2A]/08 px-2.5 py-1 text-[#063B2A]/80">640px · transactional shell</span>
            </div>
            {iframeSrc ? (
              <iframe
                key={iframeSrc}
                title="Email desktop preview"
                src={iframeSrc}
                className="h-[min(920px,88vh)] min-h-[720px] w-full rounded-2xl border border-[#d9d2c1] bg-white shadow-inner"
              />
            ) : (
              <iframe
                title="GolfSol branded email desktop preview"
                srcDoc={legacyEmailHtml}
                className="h-[min(920px,88vh)] min-h-[720px] w-full rounded-2xl border border-[#d9d2c1] bg-white shadow-inner"
              />
            )}
          </div>

          <div className="rounded-[2rem] border border-white/14 bg-[#0c241c] p-5 shadow-[0_32px_100px_rgba(0,0,0,0.32)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-0.5 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-white/65">
              <span className="inline-flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[#FFC72C]/90" aria-hidden />
                Mobile preview
              </span>
              <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-white/75">375px</span>
            </div>
            <div className="mx-auto max-w-[375px] rounded-[2rem] border-[11px] border-[#1a1a1a] bg-[#1a1a1a] shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
              {iframeSrc ? (
                <iframe
                  key={`${iframeSrc}-m`}
                  title="Email mobile preview"
                  src={iframeSrc}
                  className="h-[min(820px,78vh)] min-h-[640px] w-full rounded-[1.35rem] border-0 bg-white"
                />
              ) : (
                <iframe
                  title="GolfSol branded email mobile preview"
                  srcDoc={legacyEmailHtml}
                  className="h-[min(820px,78vh)] min-h-[640px] w-full rounded-[1.35rem] border-0 bg-white"
                />
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-white/12 bg-white/[0.05] p-4 font-ge text-sm leading-relaxed text-white/75">
              <p className="font-extrabold uppercase tracking-[0.16em] text-[#FFC72C]">Open directly</p>
              <p className="mt-2">
                Same previews load at{' '}
                <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs text-[#FFC72C]/90">
                  /api/email-preview-html?t=enquiry-customer
                </code>{' '}
                (swap <span className="font-mono">t</span>). Terms preview swaps{' '}
                <span className="font-mono">cid:</span> images for browser-safe placeholders.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
