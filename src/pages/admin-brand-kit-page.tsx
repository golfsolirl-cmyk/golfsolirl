import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Copy, Link2, RefreshCw, ShieldOff } from 'lucide-react'
import { BrandKitGallery } from '../components/brand-kit-gallery'
import { BrandLogoPicture } from '../components/brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import { BRAND_ASSET_PACK_ZIP } from '../lib/brand-logo-kit'
import { BRAND_KIT_ADMIN_PATH, brandKitSharePath } from '../lib/brand-kit-catalog'

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

/** Admin Brand Kit — previews, downloads, and share-link controls. */
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
      try {
        const res = await fetch('/api/admin-session-check', { method: 'GET', credentials: 'include' })
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean }
        if (!data.ok) {
          window.location.replace(`/admin/login?next=${encodeURIComponent(BRAND_KIT_ADMIN_PATH)}`)
          return
        }
        if (cancelled) return
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
      <div className="flex min-h-screen items-center justify-center bg-cream font-ge text-sm text-ge-gray600">
        Checking admin session…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-gs-dark">
      <header className="border-b border-chrome-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="/dashboard/admin" className="inline-flex items-center gap-3">
            <BrandLogoPicture
              alt="GolfSol Ireland"
              className="h-12 w-auto"
              height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
              width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
            />
            <span className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-ge-gray500">
              Admin
            </span>
          </a>
          <a
            href="/dashboard/admin"
            className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.12em] text-gs-green hover:text-gs-dark"
          >
            Back to desk
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-gs-green">Brand Kit</p>
        <h1 className="mt-2 font-ge text-[1.85rem] font-extrabold tracking-tight text-gs-dark sm:text-[2.15rem]">
          Logos, icons, and brand plates
        </h1>
        <p className="mt-2 max-w-2xl font-ge text-[1rem] leading-7 text-ge-gray600">
          Existing Golf Sol assets only — preview, download individually, or grab the social pack ZIP. Share a private
          link with partners when you need to.
        </p>

        <section className="mt-8 rounded-2xl border border-chrome-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-ge text-[1.05rem] font-extrabold text-gs-dark">Shareable link</h2>
          <p className="mt-1 font-ge text-sm text-ge-gray600">
            Partners open the same kit without admin access. Regenerate or turn off anytime.
          </p>
          {error ? <p className="mt-3 font-ge text-sm text-red-700">{error}</p> : null}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 truncate rounded-xl border border-chrome-200 bg-cream px-3 py-2.5 font-ge text-sm text-gs-dark">
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
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-chrome-300 bg-white px-4 py-2 font-ge text-sm font-semibold text-gs-dark"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                New token
              </button>
              {share?.shareEnabled ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void toggleEnabled(false)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-chrome-300 bg-white px-4 py-2 font-ge text-sm font-semibold text-gs-dark"
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
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-chrome-300 bg-white px-5 py-2.5 font-ge text-sm font-semibold text-gs-dark"
            href="/brand-logos"
          >
            Legacy logo kit page
          </a>
        </div>

        <div className="mt-10">
          <BrandKitGallery />
        </div>
      </main>
    </div>
  )
}
