import { useEffect, useMemo, useState } from 'react'
import { Download, ExternalLink, FileArchive } from 'lucide-react'
import {
  BRAND_KIT_ASSETS,
  BRAND_KIT_CATEGORY_LABELS,
  type BrandKitAsset,
  type BrandKitCategory
} from '../lib/brand-kit-catalog'
import { cx } from '../lib/utils'

function previewSurfaceClass(bg: BrandKitAsset['previewBg']): string {
  if (bg === 'forest') return 'bg-gs-dark'
  if (bg === 'white') return 'bg-white'
  if (bg === 'cream') return 'bg-[#f7f3e8]'
  return 'bg-[length:18px_18px] bg-[linear-gradient(45deg,#e8e4d8_25%,transparent_25%),linear-gradient(-45deg,#e8e4d8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e8e4d8_75%),linear-gradient(-45deg,transparent_75%,#e8e4d8_75%)] bg-[position:0_0,0_9px,9px_-9px,-9px_0] bg-white'
}

function formatBytes(n: number | null): string {
  if (n == null || !Number.isFinite(n) || n < 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function filenameFromHref(href: string): string {
  try {
    const path = href.split('?')[0] || href
    const parts = path.split('/')
    return parts[parts.length - 1] || href
  } catch {
    return href
  }
}

function BrandKitCard({
  item,
  sizeLabel
}: {
  readonly item: BrandKitAsset
  readonly sizeLabel: string
}) {
  const isPdf = item.format.toLowerCase().includes('pdf')
  const isZip = item.format.toLowerCase().includes('zip')
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-chrome-200 bg-white shadow-sm">
      <div className={cx('flex min-h-[10.5rem] items-center justify-center p-5', previewSurfaceClass(item.previewBg))}>
        {isPdf || isZip ? (
          <div className="flex flex-col items-center gap-2 text-gs-dark/70">
            <FileArchive className="h-10 w-10" aria-hidden />
            <span className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em]">{item.format}</span>
          </div>
        ) : (
          <img
            alt=""
            className="max-h-36 w-auto max-w-full object-contain"
            decoding="async"
            loading="eager"
            src={item.href}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col px-4 py-4 sm:px-5">
        <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-brand-700">{item.format}</p>
        <h3 className="mt-1 font-ge text-[1.05rem] font-extrabold text-gs-dark">{item.name}</h3>
        <p className="mt-1.5 font-ge text-sm leading-6 text-ge-gray600">{item.description}</p>
        <p className="mt-3 break-all font-ge text-[0.78rem] text-ge-gray500">
          {filenameFromHref(item.href)} · {sizeLabel}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-gs-dark px-4 py-2 font-ge text-sm font-semibold text-white transition hover:bg-gs-green"
            download={item.downloadName}
            href={item.href}
          >
            <Download className="h-4 w-4" aria-hidden />
            Download
          </a>
          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-chrome-300 bg-cream px-4 py-2 font-ge text-sm font-semibold text-gs-dark transition hover:bg-white"
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

type BrandKitGalleryProps = {
  readonly compact?: boolean
}

export function BrandKitGallery({ compact = false }: BrandKitGalleryProps) {
  const [sizes, setSizes] = useState<Record<string, number | null>>({})

  const categories = useMemo(() => {
    const order: BrandKitCategory[] = ['logos', 'favicons', 'og', 'heroes', 'email', 'cards', 'packs']
    return order
      .map((category) => ({
        category,
        label: BRAND_KIT_CATEGORY_LABELS[category],
        items: BRAND_KIT_ASSETS.filter((a) => a.category === category)
      }))
      .filter((g) => g.items.length > 0)
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const next: Record<string, number | null> = {}
      await Promise.all(
        BRAND_KIT_ASSETS.map(async (asset) => {
          try {
            const res = await fetch(asset.href, { method: 'HEAD', cache: 'force-cache' })
            const len = res.headers.get('content-length')
            next[asset.id] = len ? Number(len) : null
          } catch {
            next[asset.id] = null
          }
        })
      )
      if (!cancelled) setSizes(next)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className={cx('space-y-10', compact ? 'space-y-8' : 'space-y-12')}>
      {categories.map((group) => (
        <section key={group.category} aria-labelledby={`brand-kit-${group.category}`}>
          <h2
            id={`brand-kit-${group.category}`}
            className="font-ge text-[1.15rem] font-extrabold text-gs-dark sm:text-[1.25rem]"
          >
            {group.label}
          </h2>
          <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <li key={item.id}>
                <BrandKitCard item={item} sizeLabel={formatBytes(sizes[item.id] ?? null)} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
