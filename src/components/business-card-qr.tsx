import { useEffect, useState } from 'react'
import type { BusinessCardRenderMode } from '../lib/business-cards-catalog-types'
import { cx } from '../lib/utils'

const QR_RENDER_SCALE = 2

type BusinessCardQrProps = {
  readonly value: string
  readonly mode?: BusinessCardRenderMode
  readonly className?: string
  readonly label?: string
  readonly size?: number
  readonly variant?: 'dark' | 'gold' | 'light'
  readonly centerLogoSrc?: string
  readonly centerLogoSize?: number
  readonly labelStyle?: 'below' | 'foil-button' | 'none'
  readonly labelClassName?: string
}

/** Premium QR — 2× raster for sharp modules; crisp local crest in centre. */
export function BusinessCardQr({
  value,
  mode = 'preview',
  className,
  label = 'SCAN TO BOOK',
  size,
  variant = 'light',
  centerLogoSrc,
  centerLogoSize,
  labelStyle = 'below',
  labelClassName
}: BusinessCardQrProps) {
  const isPdf = mode === 'pdf'
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const displaySize = size ?? (isPdf ? 128 : 112)
  const renderSize = Math.round(displaySize * QR_RENDER_SCALE)
  const logoSize = centerLogoSize ?? Math.round(displaySize * 0.22)
  const logoRenderSize = Math.round(logoSize * QR_RENDER_SCALE)
  const logoPad = Math.max(2, Math.round(logoSize * (variant === 'gold' ? 0.07 : 0.18)))
  const badgeSize = logoSize + logoPad * 2

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      if (!value.trim()) return
      try {
        const { default: QRCode } = await import('qrcode')
        if (cancelled) return
        const url = await QRCode.toDataURL(value, {
          errorCorrectionLevel: centerLogoSrc ? 'H' : 'M',
          margin: 1,
          width: renderSize,
          color:
            variant === 'gold'
              ? { dark: '#E8BC55', light: '#FFFFFF' }
              : variant === 'light'
                ? { dark: '#0A0A0A', light: '#FFFFFF' }
                : { dark: '#F7F3E9', light: '#0A0A0A' }
        })
        if (!cancelled) setDataUrl(url)
      } catch {
        if (!cancelled) setDataUrl(null)
      }
    }
    void render()
    return () => {
      cancelled = true
    }
  }, [value, renderSize, variant, centerLogoSrc])

  const frameClass =
    variant === 'gold'
      ? 'rounded-[4px] bg-white p-1 shadow-[0_0_0_2px_#E8BC55,0_0_0_4px_rgba(232,188,85,0.35),0_8px_24px_rgba(0,0,0,0.25)]'
      : variant === 'light'
        ? 'rounded-[4px] bg-white p-1 shadow-[0_0_0_2px_#D4AF37,0_0_0_3px_rgba(212,175,55,0.35)]'
        : 'rounded-sm bg-[#0A0A0A] p-1.5 shadow-[0_0_0_1px_#D4AF37]'

  const ariaLabel = label ? `${label}. QR code for ${value}` : `QR code for ${value}`

  return (
    <div
      className={cx('flex flex-col items-center overflow-visible', className)}
      role="img"
      aria-label={ariaLabel}
    >
      <div className={cx('relative shrink-0', frameClass, isPdf ? 'p-1.5' : 'p-1')}>
        {dataUrl ? (
          <img
            src={dataUrl}
            alt=""
            width={displaySize}
            height={displaySize}
            className="block h-auto w-full max-w-none"
            style={{ width: displaySize, height: displaySize }}
            decoding="async"
            draggable={false}
          />
        ) : (
          <div
            className="animate-pulse bg-[#e8e4dc]"
            style={{ width: displaySize, height: displaySize }}
            aria-hidden
          />
        )}
        {centerLogoSrc && dataUrl ? (
          <div
            className={
              variant === 'gold'
                ? 'pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_0_0_2px_#E8BC55,0_0_0_5px_rgba(232,188,85,0.45),0_6px_16px_rgba(0,0,0,0.28)]'
                : 'pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_#D4AF37,0_2px_8px_rgba(0,0,0,0.2)]'
            }
            style={{
              padding: logoPad,
              width: badgeSize,
              height: badgeSize,
              minWidth: badgeSize,
              minHeight: badgeSize
            }}
          >
            <img
              src={centerLogoSrc}
              alt=""
              width={logoRenderSize}
              height={logoRenderSize}
              className="block max-h-full max-w-full object-contain"
              style={{ width: logoSize, height: logoSize }}
              decoding="async"
              draggable={false}
              fetchPriority="high"
              loading="eager"
            />
          </div>
        ) : null}
      </div>
      {labelStyle === 'foil-button' && label ? (
        <div
          data-keep-color
          className={cx(
            'mt-2.5 w-full max-w-full shrink-0 rounded-[3px] border border-white/35 bg-white/10 px-2 py-1 text-center font-ge font-black uppercase leading-[1.12] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]',
            labelClassName ?? (isPdf ? 'text-[0.36rem] tracking-[0.14em]' : 'text-[clamp(6px,1.6vw,0.36rem)] tracking-[0.14em]')
          )}
          style={{
            color: '#F7F3E9',
            textShadow: '0 1px 0 rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.45)'
          }}
        >
          {label}
        </div>
      ) : null}
      {labelStyle === 'below' && label ? (
        <span
          className={cx(
            'mt-1.5 block font-ge font-extrabold uppercase tracking-[0.14em] drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]',
            labelClassName ?? (isPdf ? 'text-[0.34rem]' : 'text-[clamp(6px,1.6vw,0.34rem)]')
          )}
          style={{ color: '#F7F3E9' }}
        >
          {label}
        </span>
      ) : null}
    </div>
  )
}
