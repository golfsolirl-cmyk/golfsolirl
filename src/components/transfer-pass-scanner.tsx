import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Camera, Keyboard } from 'lucide-react'
import { cx } from '../lib/utils'

type TransferPassScannerProps = {
  readonly onScan: (value: string) => void
  readonly className?: string
}

export function TransferPassScanner({ onScan, className }: TransferPassScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualValue, setManualValue] = useState('')
  const manualId = useId()

  useEffect(() => {
    if (!cameraOn) {
      return
    }
    let cancelled = false
    let controls: { stop: () => void } | null = null

    const start = async () => {
      setCameraError(null)
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader()
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        })
        if (cancelled || !videoRef.current) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result) {
            onScan(result.getText())
          }
          if (err && !(err as { name?: string }).name?.includes('NotFound')) {
            /* continuous scan noise */
          }
        })
      } catch (e) {
        setCameraError(e instanceof Error ? e.message : 'Camera unavailable on this device.')
        setCameraOn(false)
      }
    }

    void start()

    return () => {
      cancelled = true
      controls?.stop()
      const video = videoRef.current
      const stream = video?.srcObject
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((t) => t.stop())
      }
      if (video) {
        video.srcObject = null
      }
    }
  }, [cameraOn, onScan])

  const submitManual = useCallback(() => {
    const v = manualValue.trim()
    if (v) {
      onScan(v)
    }
  }, [manualValue, onScan])

  return (
    <div className={cx('space-y-5', className)}>
      <div className="overflow-hidden rounded-[1.75rem] border border-forest-100 bg-forest-950 shadow-soft">
        <div className="relative aspect-[4/3] w-full bg-black">
          {cameraOn ? (
            <video className="h-full w-full object-cover" muted playsInline ref={videoRef} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
              <Camera aria-hidden className="h-12 w-12 text-emerald-200/80" />
              <p className="text-lg font-semibold">Scan guest trip pass</p>
              <p className="max-w-xs text-base leading-relaxed text-emerald-100/85">
                Point at the barcode on the client&apos;s phone — confirms transfer payment before pickup.
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 border-t border-white/10 p-4">
          <button
            className="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-2xl bg-brand-600 px-4 py-3 text-base font-bold text-white"
            onClick={() => setCameraOn((v) => !v)}
            type="button"
          >
            {cameraOn ? 'Stop camera' : 'Start camera'}
          </button>
        </div>
      </div>

      {cameraError ? (
        <p className="text-lg font-semibold text-red-800" role="alert">
          {cameraError}
        </p>
      ) : null}

      <div className="rounded-[1.75rem] border border-forest-100 bg-white p-5">
        <label className="flex items-center gap-2 font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-brand-600" htmlFor={manualId}>
          <Keyboard aria-hidden className="h-4 w-4" />
          Enter pass code manually
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            className="min-h-[3rem] flex-1 rounded-2xl border-2 border-forest-200 px-4 py-3 font-mono text-base text-forest-950"
            id={manualId}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder="GSOLPAY|…"
            value={manualValue}
          />
          <button
            className="inline-flex min-h-[3rem] items-center justify-center rounded-2xl bg-forest-900 px-6 py-3 text-base font-bold text-white"
            onClick={submitManual}
            type="button"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  )
}
