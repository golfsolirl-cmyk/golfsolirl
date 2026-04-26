import { useMemo, useState } from 'react'
import { Check, Copy, Mail, Smartphone } from 'lucide-react'
import { getGolfSolBrandedEmailHtml, golfSolEmailSubject } from '../lib/golfsol-email-template'

export function EmailTemplatePreviewPage() {
  const emailHtml = useMemo(() => getGolfSolBrandedEmailHtml(), [])
  const [copied, setCopied] = useState(false)

  async function copyHtml() {
    await navigator.clipboard.writeText(emailHtml)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main className="min-h-screen bg-[#063B2A] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(circle at 16% 0%, rgba(255,199,44,0.24), transparent 28%), radial-gradient(circle at 82% 18%, rgba(255,255,255,0.12), transparent 28%), linear-gradient(180deg, #063B2A 0%, #082F23 100%)'
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <section className="rounded-[2rem] border border-white/12 bg-white/[0.08] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFC72C]/45 bg-[#FFC72C]/12 px-3 py-1.5 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[#FFC72C]">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                Email template preview
              </div>
              <h1 className="mt-4 max-w-3xl font-ge text-[2.35rem] font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-[4rem]">
                Branded GolfSol Ireland email.
              </h1>
              <p className="mt-4 max-w-2xl font-ge text-base leading-7 text-white/76 sm:text-lg">
                Subject: <span className="font-bold text-white">{golfSolEmailSubject}</span>. The email uses inline styles, table layout,
                mobile media queries, hidden preheader text and Outlook-safe display settings.
              </p>
            </div>

            <button
              type="button"
              onClick={copyHtml}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#FFC72C] px-5 py-3 font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-[#16231D] shadow-[0_18px_40px_rgba(255,199,44,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_54px_rgba(255,199,44,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#063B2A]"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? 'HTML copied' : 'Copy email HTML'}
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-[2rem] border border-white/12 bg-[#F7F0E2] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:p-5">
            <div className="mb-3 flex items-center justify-between px-2 font-ge text-xs font-extrabold uppercase tracking-[0.18em] text-[#063B2A]/70">
              <span>Desktop email client</span>
              <span>640px shell</span>
            </div>
            <iframe
              title="GolfSol branded email desktop preview"
              srcDoc={emailHtml}
              className="h-[860px] w-full rounded-[1.5rem] border border-[#E9D9B6] bg-white"
            />
          </div>

          <div className="rounded-[2rem] border border-white/12 bg-[#102F24] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.24)]">
            <div className="mb-3 flex items-center justify-between px-1 font-ge text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">
              <span className="inline-flex items-center gap-2">
                <Smartphone className="h-4 w-4" aria-hidden />
                Mobile preview
              </span>
              <span>375px</span>
            </div>
            <div className="mx-auto max-w-[375px] rounded-[2rem] border-[10px] border-black bg-black shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
              <iframe
                title="GolfSol branded email mobile preview"
                srcDoc={emailHtml}
                className="h-[760px] w-full rounded-[1.25rem] border-0 bg-white"
              />
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4 font-ge text-sm leading-6 text-white/72">
              <p className="font-extrabold uppercase tracking-[0.16em] text-[#FFC72C]">Recommended send settings</p>
              <p className="mt-2">
                Send as full HTML, keep images absolute if added later, preserve the hidden preheader, avoid external fonts, and test in
                Gmail, Apple Mail and Outlook before campaign use.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
