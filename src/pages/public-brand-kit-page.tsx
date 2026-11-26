import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { BrandKitGallery } from '../components/brand-kit-gallery'
import { BrandLogoPicture } from '../components/brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import { BRAND_ASSET_PACK_ZIP } from '../lib/brand-logo-kit'
import { BRAND_KIT_PUBLIC_BASE_PATH, parseBrandKitTokenFromPath } from '../lib/brand-kit-catalog'

/** Public share page — `/brand/<token>` when the admin link is enabled. */
export function PublicBrandKitPage() {
  const token = parseBrandKitTokenFromPath(window.location.pathname)
  const [status, setStatus] = useState<'loading' | 'ok' | 'bad' | 'missing'>(token ? 'loading' : 'missing')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Brand Kit — Golf Sol Ireland'
  }, [])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/brand-kit?token=${encodeURIComponent(token)}`, { method: 'GET' })
        const data = (await res.json().catch(() => ({}))) as { message?: string; ok?: boolean }
        if (cancelled) return
        if (!res.ok || !data.ok) {
          setStatus('bad')
          setMessage(data.message || 'This Brand Kit link is not available.')
          return
        }
        setStatus('ok')
      } catch {
        if (!cancelled) {
          setStatus('bad')
          setMessage('Unable to open Brand Kit right now.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream font-ge text-sm text-ge-gray600">
        Opening Brand Kit…
      </div>
    )
  }

  if (status === 'missing' || status === 'bad') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 text-center">
        <BrandLogoPicture
          alt="GolfSol Ireland"
          className="h-16 w-auto"
          height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
          width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
        />
        <h1 className="mt-6 font-ge text-[1.5rem] font-extrabold text-gs-dark">Brand Kit link required</h1>
        <p className="mt-2 max-w-md font-ge text-sm leading-6 text-ge-gray600">
          {message ||
            `Ask Golf Sol Ireland for a private share URL (${BRAND_KIT_PUBLIC_BASE_PATH}/…).`}
        </p>
        <a href="/" className="mt-6 font-ge text-sm font-bold text-gs-green underline-offset-4 hover:underline">
          Back to homepage
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f4ec] text-gs-dark">
      <header className="border-b border-chrome-200/80 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="inline-flex items-center gap-3">
            <BrandLogoPicture
              alt="GolfSol Ireland"
              className="h-14 w-auto"
              height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
              width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
            />
            <div>
              <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-gs-green">Brand Kit</p>
              <p className="font-ge text-sm text-ge-gray600">Official assets for partners & press</p>
            </div>
          </div>
          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-gs-dark px-4 py-2 font-ge text-sm font-semibold text-white"
            download={BRAND_ASSET_PACK_ZIP.downloadName}
            href={BRAND_ASSET_PACK_ZIP.href}
          >
            <Download className="h-4 w-4" aria-hidden />
            Download pack
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-ge text-[1.75rem] font-extrabold tracking-tight text-gs-dark sm:text-[2rem]">
          Golf Sol Ireland brand assets
        </h1>
        <p className="mt-2 max-w-2xl font-ge text-[1rem] leading-7 text-ge-gray600">
          Logos, favicons, share images, and hero plates used on the live site. Download what you need — please do not
          invent new marks.
        </p>
        <div className="mt-10">
          <BrandKitGallery compact />
        </div>
      </main>
    </div>
  )
}
