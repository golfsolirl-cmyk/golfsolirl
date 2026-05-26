import { useEffect, useId, useRef } from 'react'
import { cx } from '../lib/utils'

type PaymentBarcodeProps = {
  readonly value: string
  readonly className?: string
  readonly height?: number
}

/** CODE128 barcode — show driver on pickup to confirm payment. */
export function PaymentBarcode({ value, className, height = 72 }: PaymentBarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const fallbackId = useId()

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      if (!svgRef.current || !value.trim()) {
        return
      }
      try {
        const JsBarcode = (await import('jsbarcode')).default
        if (cancelled || !svgRef.current) {
          return
        }
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          displayValue: false,
          margin: 8,
          height,
          width: 2,
          background: '#ffffff',
          lineColor: '#04140c'
        })
      } catch {
        /* library load failure — human-readable fallback below svg */
      }
    }
    void render()
    return () => {
      cancelled = true
    }
  }, [value, height])

  return (
    <div className={cx('overflow-hidden rounded-2xl bg-white px-2 py-3', className)}>
      <svg
        aria-labelledby={fallbackId}
        className="mx-auto block h-auto w-full max-w-full"
        ref={svgRef}
        role="img"
      />
      <p className="mt-2 break-all text-center font-mono text-base font-semibold tracking-[0.12em] text-forest-950" id={fallbackId}>
        {value.replace(/\|/g, ' · ')}
      </p>
    </div>
  )
}
