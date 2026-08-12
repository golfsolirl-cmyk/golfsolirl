import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Copy, Download, ExternalLink, Link2, Printer } from 'lucide-react'
import { BrandLogoPicture } from '../components/brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import {
  BRAND_ASSET_PACK_ZIP,
  BRAND_LOGO_KIT,
  BRAND_LOGO_KIT_CANONICAL_URL,
  BRAND_LOGO_KIT_PAGE_PATH,
  BRAND_LOGO_MASTER_SRC,
  SOCIAL_LOGO_EXPORTS,
  type BrandLogoKitItem,
  type SocialLogoExport
} from '../lib/brand-logo-kit'
import { cx } from '../lib/utils'

function previewSurfaceClass(bg: BrandLogoKitItem['previewBg']): string {
  if (bg === 'forest') return 'bg-forest-950'
  if (bg === 'white') return 'bg-white'
  if (bg === 'cream') return 'bg-[#f7f3e8]'
  return 'bg-[length:18px_18px] bg-[linear-gradient(45deg,#e8e4d8_25%,transparent_25%),linear-gradient(-45deg,#e8e4d8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e8e4d8_75%),linear-gradient(-45deg,transparent_75%,#e8e4d8_75%)] bg-[position:0_0,0_9px,9px_-9px,-9px_0] bg-white'
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.decoding = 'async'
  img.src = src
  await img.decode()
  return img
}

async function downloadSquareExport(spec: SocialLogoExport): Promise<void> {
  const img = await loadImage(BRAND_LOGO_MASTER_SRC)
  const canvas = document.createElement('canvas')
  canvas.width = spec.size
  canvas.height = spec.size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not prepare image export.')
  }

  if (spec.bg === 'white') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, spec.size, spec.size)
  } else if (spec.bg === 'forest') {
    ctx.fillStyle = '#0f2a0c'
    ctx.fillRect(0, 0, spec.size, spec.size)
  }

  const pad = Math.round(spec.size * 0.1)
  const avail = spec.size - pad * 2
  const scale = Math.min(avail / img.naturalWidth, avail / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  ctx.drawImage(img, (spec.size - w) / 2, (spec.size - h) / 2, w, h)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) {
    throw new Error('Could not export PNG.')
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `golfsol-ireland-${spec.id}-${spec.size}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function LogoCard({ item }: { readonly item: BrandLogoKitItem }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-forest-100 bg-white shadow-soft">
      <div className={cx('flex min-h-[11rem] items-center justify-center p-6', previewSurfaceClass(item.previewBg))}>
        <img
          alt={item.name}
          className="max-h-36 w-auto max-w-full object-contain"
          decoding="async"
          loading="lazy"
          src={item.href}
        />
      </div>
      <div className="flex flex-1 flex-col px-5 py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700">{item.format}</p>
        <h3 className="font-display mt-1.5 text-xl font-semibold text-forest-950">{item.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-forest-600">{item.description}</p>
        <p className="mt-3 text-sm font-medium text-forest-800">{item.useFor}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            className="inline-flex items-center gap-2 rounded-full bg-forest-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-900"
            download={item.downloadName}
            href={item.href}
          >
            <Download className="h-4 w-4" aria-hidden />
            Download
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-offwhite px-4 py-2.5 text-sm font-semibold text-forest-900 transition hover:bg-white"
            href={item.href}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Open
          </a>
        </div>
      </div>
    </article>
  )
}

export function BrandLogosPage() {
  const [copied, setCopied] = useState(false)
  const [exportBusy, setExportBusy] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const pageUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return BRAND_LOGO_KIT_CANONICAL_URL
    }
    return `${window.location.origin}${BRAND_LOGO_KIT_PAGE_PATH}`
  }, [])

  useEffect(() => {
    document.title = 'Brand logos — Golf Sol Ireland'
  }, [])

  const copyPageLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', pageUrl)
    }
  }, [pageUrl])

  const runExport = useCallback(async (spec: SocialLogoExport) => {
    setExportError(null)
    setExportBusy(spec.id)
    try {
      await downloadSquareExport(spec)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Export failed.')
    } finally {
      setExportBusy(null)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-forest-950">
      <header className="border-b border-forest-100 bg-forest-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-300">Golf Sol Ireland</p>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Brand logos</h1>
            <p className="mt-3 text-base leading-relaxed text-white/80 sm:text-lg">
              Official logo files for printers, Google and Facebook profiles, email, and other sites. Share this page
              link — no login required.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <BrandLogoPicture
              alt="Golf Sol Ireland"
              className="h-20 w-auto object-contain"
              decoding="async"
              height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
              width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
            />
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-forest-950 transition hover:bg-brand-100"
                onClick={() => void copyPageLink()}
                type="button"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
                {copied ? 'Link copied' : 'Copy page link'}
              </button>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                download={BRAND_ASSET_PACK_ZIP.downloadName}
                href={BRAND_ASSET_PACK_ZIP.href}
              >
                <Download className="h-4 w-4" aria-hidden />
                Download full pack
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-5 py-10 sm:px-8 sm:py-14">
        <section className="rounded-[1.75rem] border border-forest-100 bg-white px-5 py-6 shadow-soft sm:px-7">
          <div className="flex flex-wrap items-start gap-3">
            <Printer className="mt-0.5 h-5 w-5 text-brand-700" aria-hidden />
            <div>
              <h2 className="font-display text-xl font-semibold text-forest-950">For printers &amp; partners</h2>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-forest-700 sm:text-base">
                <li>Use the Primary crest PNG (transparent) or SVG for print.</li>
                <li>Do not screenshot the website — download the file buttons below.</li>
                <li>Share this link: <span className="break-all font-medium text-forest-950">{pageUrl}</span></li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Master files</p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-forest-950 sm:text-3xl">All company logos</h2>
            <p className="mt-2 max-w-2xl text-base text-forest-600">
              Download any format. Prefer the primary crest for new work; white-background versions for systems that
              reject transparency.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {BRAND_LOGO_KIT.map((item) => (
              <LogoCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Social &amp; profiles</p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-forest-950 sm:text-3xl">
              Google, Facebook &amp; more
            </h2>
            <p className="mt-2 max-w-2xl text-base text-forest-600">
              One-click square PNGs sized for common profile uploads. Crest is centred with safe padding for circular
              crops.
            </p>
          </div>

          {exportError ? (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
              {exportError}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOCIAL_LOGO_EXPORTS.map((spec) => (
              <article
                key={spec.id}
                className="flex flex-col rounded-[1.35rem] border border-forest-100 bg-white p-4 shadow-soft"
              >
                <div
                  className={cx(
                    'mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-forest-100',
                    spec.bg === 'forest' ? 'bg-forest-950' : 'bg-white'
                  )}
                >
                  <img
                    alt=""
                    className="h-[78%] w-[78%] object-contain"
                    decoding="async"
                    loading="lazy"
                    src={BRAND_LOGO_MASTER_SRC}
                  />
                </div>
                <h3 className="mt-4 text-base font-semibold text-forest-950">{spec.platform}</h3>
                <p className="mt-1 text-sm text-forest-600">
                  {spec.size}×{spec.size}px · {spec.note}
                </p>
                <button
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-forest-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-900 disabled:opacity-60"
                  disabled={exportBusy === spec.id}
                  onClick={() => void runExport(spec)}
                  type="button"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  {exportBusy === spec.id ? 'Preparing…' : 'Download PNG'}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-forest-100 bg-white px-5 py-6 shadow-soft sm:px-7">
          <h2 className="font-display text-xl font-semibold text-forest-950">Full asset pack</h2>
          <p className="mt-2 max-w-2xl text-base text-forest-600">
            Zip with social covers, posts, and logo sources for campaigns across sites.
          </p>
          <a
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            download={BRAND_ASSET_PACK_ZIP.downloadName}
            href={BRAND_ASSET_PACK_ZIP.href}
          >
            <Download className="h-4 w-4" aria-hidden />
            {BRAND_ASSET_PACK_ZIP.label}
          </a>
        </section>

        <footer className="border-t border-forest-200/80 pt-6 text-sm text-forest-600">
          <p>
            Questions:{' '}
            <a className="font-medium text-forest-950 underline decoration-brand-500/50 underline-offset-2" href="mailto:info@golfsolirl.com">
              info@golfsolirl.com
            </a>
            {' · '}
            <a className="font-medium text-forest-950 underline decoration-brand-500/50 underline-offset-2" href="/">
              golfsolirl.com
            </a>
          </p>
          <button
            className="mt-3 inline-flex items-center gap-2 text-forest-800 transition hover:text-forest-950"
            onClick={() => void copyPageLink()}
            type="button"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden />
            Copy share link again
          </button>
        </footer>
      </main>
    </div>
  )
}
