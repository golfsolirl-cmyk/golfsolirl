import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Copy, Link2, RefreshCw, ShieldOff } from 'lucide-react'
import { AdminTripadvisorUrlPanel } from '../components/admin-tripadvisor-url-panel'
import { BrandKitGallery } from '../components/brand-kit-gallery'
import { TowAdminShell } from '../components/tow-admin/tow-admin-bar'
import { BRAND_ASSET_PACK_ZIP } from '../lib/brand-logo-kit'
import { BRAND_KIT_ADMIN_PATH, brandKitSharePath } from '../lib/brand-kit-catalog'
import { ensureAdminSession } from '../lib/tow-admin-api'

type ShareState = {
  shareToken: string
  shareEnabled: boolean
  sharePath: string | null
}

async function brandKitAdmin(action: string, body: Record<string, unknown> = {}) {
  const res = await fetch('/api/brand-kit', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body })
  })
  const data = (await res.json().catch(() => ({}))) as ShareState & { message?: string; ok?: boolean }
  if (!res.ok) {
    throw new Error(data.message || 'Request failed.')
  }
  return data
}

/** Admin Brand Kit — logos, social media plates, downloads, share-link controls. */
export function AdminBrandKitPage() {
  const [authChecking, setAuthChecking] = useState(true)
  const [share, setShare] = useState<ShareState | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const shareUrl = useMemo(() => {
    if (!share?.shareToken || !share.shareEnabled) return null
    if (typeof window === 'undefined') return brandKitSharePath(share.shareToken)
    return `${window.location.origin}${brandKitSharePath(share.shareToken)}`
  }, [share])

  useEffect(() => {
    document.title = 'Brand Kit — Admin · Golf Sol Ireland'
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const ok = await ensureAdminSession(BRAND_KIT_ADMIN_PATH)
      if (!ok || cancelled) return
      try {
        const kit = await brandKitAdmin('get')
        if (!cancelled) {
          setShare({
            shareToken: kit.shareToken || '',
            shareEnabled: Boolean(kit.shareEnabled),
            sharePath: kit.sharePath ?? null
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load Brand Kit.')
        }
      } finally {
        if (!cancelled) setAuthChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const copyLink = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', shareUrl)
    }
  }, [shareUrl])

  const regenerate = async () => {
    setBusy(true)
    setError(null)
    try {
      const kit = await brandKitAdmin('regenerate')
      setShare({
        shareToken: kit.shareToken || '',
        shareEnabled: Boolean(kit.shareEnabled),
        sharePath: kit.sharePath ?? null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not regenerate link.')
    } finally {
      setBusy(false)
    }
  }

  const toggleEnabled = async (enabled: boolean) => {
    setBusy(true)
    setError(null)
    try {
      const kit = await brandKitAdmin('setEnabled', { enabled })
      setShare({
        shareToken: kit.shareToken || '',
        shareEnabled: Boolean(kit.shareEnabled),
        sharePath: kit.sharePath ?? null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update link.')
    } finally {
      setBusy(false)
    }
  }

  if (authChecking) {
    return (
      <TowAdminShell active="brand">
        <p className="font-ge text-sm text-slate-500">Checking admin session…</p>
      </TowAdminShell>
    )
  }

  return (
    <TowAdminShell active="brand">
      <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-gs-green">Brand Kit</p>
      <h1 className="mt-2 font-ge text-[1.85rem] font-extrabold tracking-tight text-gs-dark sm:text-[2.15rem]">
        Logos &amp; social media assets
      </h1>
      <p className="mt-2 max-w-2xl font-ge text-[1rem] leading-7 text-slate-600">
        Every Golf Sol logo, favicon, and branded social plate (Facebook, Instagram, LinkedIn, X, YouTube, Google
        Business). Preview, download one-by-one, or grab the full ZIP. WhatsApp and TikTok can use the square profile
        / story files below.
      </p>

      <div className="mt-8">
        <AdminTripadvisorUrlPanel />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-ge text-[1.05rem] font-extrabold text-gs-dark">Shareable link</h2>
        <p className="mt-1 font-ge text-sm text-slate-600">
          Partners open the same kit without admin access. Regenerate or turn off anytime.
        </p>
        {error ? <p className="mt-3 font-ge text-sm text-red-700">{error}</p> : null}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-ge text-sm text-gs-dark">
            {shareUrl || (share?.shareEnabled === false ? 'Link disabled' : '—')}
          </code>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!shareUrl || busy}
              onClick={() => void copyLink()}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-gs-dark px-4 py-2 font-ge text-sm font-semibold text-white disabled:opacity-50"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void regenerate()}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-ge text-sm font-semibold text-gs-dark"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              New token
            </button>
            {share?.shareEnabled ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void toggleEnabled(false)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-ge text-sm font-semibold text-gs-dark"
              >
                <ShieldOff className="h-4 w-4" aria-hidden />
                Disable
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void toggleEnabled(true)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-gs-green/30 bg-gs-green/10 px-4 py-2 font-ge text-sm font-semibold text-gs-green"
              >
                <Link2 className="h-4 w-4" aria-hidden />
                Enable
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gs-green px-5 py-2.5 font-ge text-sm font-extrabold uppercase tracking-[0.1em] text-white"
          download={BRAND_ASSET_PACK_ZIP.downloadName}
          href={BRAND_ASSET_PACK_ZIP.href}
        >
          Download all (social pack ZIP)
        </a>
      </div>

      <div className="mt-10">
        <BrandKitGallery />
      </div>
    </TowAdminShell>
  )
}
