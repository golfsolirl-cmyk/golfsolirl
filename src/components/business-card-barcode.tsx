import { useEffect, useId, useRef } from 'react'
import type { BusinessCardRenderMode } from '../lib/business-cards-catalog-types'
import { cx } from '../lib/utils'

type BusinessCardBarcodeProps = {
  readonly value: string
  readonly mode?: BusinessCardRenderMode
  readonly className?: string
}

/** CODE128 barcode for business card backs — encodes website URL for print. */
export function BusinessCardBarcode({ value, mode = 'preview', className }: BusinessCardBarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const fallbackId = useId()
  const isPdf = mode === 'pdf'
  const height = isPdf ? 36 : 32

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
          margin: 4,
          height,
          width: isPdf ? 1.6 : 1.4,
          background: '#ffffff',
          lineColor: '#04140c'
        })
      } catch {
        /* library load failure — sr-only fallback below */
      }
    }
    void render()
    return () => {
      cancelled = true
    }
  }, [value, height, isPdf])

  return (
    <div
      className={cx(
        'overflow-hidden rounded-sm bg-white px-1.5 py-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]',
        isPdf ? 'max-w-[72%]' : 'max-w-[78%]',
        className
      )}
    >
      <svg
        aria-labelledby={fallbackId}
        className="mx-auto block h-auto w-full"
        ref={svgRef}
        role="img"
      />
      <span className="sr-only" id={fallbackId}>
        Barcode: {value}
      </span>
    </div>
  )
}
