import { useEffect, useState } from 'react'
import { TowAdminShell } from '../../components/tow-admin/tow-admin-bar'
import { ensureAdminSession } from '../../lib/tow-admin-api'
import {
  GMAIL_SIGNATURE_STEPS,
  compactSignatureHtml,
  fullSignatureHtml
} from '../../lib/golfsol-email-signature'

export function TowAdminSignaturePage() {
  const [ready, setReady] = useState(false)
  const [copied, setCopied] = useState<'full' | 'compact' | null>(null)

  useEffect(() => {
    document.title = 'Email signature · Admin · Golf Sol Ireland'
    let cancelled = false
    void (async () => {
      const ok = await ensureAdminSession('/admin/signature')
      if (!cancelled) setReady(Boolean(ok))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const copy = async (variant: 'full' | 'compact') => {
    const html = variant === 'full' ? fullSignatureHtml() : compactSignatureHtml()
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        const item = new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()], {
            type: 'text/plain'
          })
        })
        await navigator.clipboard.write([item])
      } else {
        await navigator.clipboard.writeText(html)
      }
      setCopied(variant)
      window.setTimeout(() => setCopied(null), 2500)
    } catch {
      setCopied(null)
    }
  }

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Loading…</div>
  }

  return (
    <TowAdminShell active="signature">
      <h1 className="font-ge text-3xl font-extrabold text-gs-dark">Email signature</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Copy a branded signature and paste it into Gmail Settings → Signature. The logo is a public image on your
        website, which Gmail needs in order to show it.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SignatureCard
          title="Full signature"
          blurb="Best for new emails. Includes name, tagline, email, phone, WhatsApp, website and the Irish-team line."
          html={fullSignatureHtml()}
          copied={copied === 'full'}
          onCopy={() => void copy('full')}
        />
        <SignatureCard
          title="Compact signature"
          blurb="A shorter version for replies and forwards, with email, phone, WhatsApp and the website."
          html={compactSignatureHtml()}
          copied={copied === 'compact'}
          onCopy={() => void copy('compact')}
        />
      </div>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-ge text-lg font-extrabold text-gs-dark">How to add it in Gmail</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          {GMAIL_SIGNATURE_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-slate-500">
          Paste as rich text (Ctrl+V / Cmd+V), not as plain text — otherwise the logo and colours will be lost. Send
          yourself a test email to confirm the hosted crest appears. If you change the signature on this page later,
          copy and re-paste it into Gmail rather than editing the Gmail copy by hand.
        </p>
      </section>
    </TowAdminShell>
  )
}

function SignatureCard({
  title,
  blurb,
  html,
  copied,
  onCopy
}: {
  title: string
  blurb: string
  html: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="font-ge text-lg font-extrabold text-gs-dark">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{blurb}</p>
      <button
        type="button"
        onClick={onCopy}
        className="mt-4 rounded-xl bg-gs-green px-4 py-2.5 font-ge text-sm font-semibold text-white hover:bg-[#0f4d38]"
      >
        {copied ? 'Copied' : 'Copy signature'}
      </button>
      <p className="mt-5 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Preview on white</p>
      <div
        className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">On a dark background</p>
      <div
        className="mt-2 overflow-x-auto rounded-xl bg-[#0b1f17] p-4 [&_a]:!text-emerald-200 [&_div]:!text-emerald-50 [&_strong]:!text-white"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  )
}
