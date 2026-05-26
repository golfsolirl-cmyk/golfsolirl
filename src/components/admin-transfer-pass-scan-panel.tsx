import { useCallback, useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import {
  TransferPassVerifyBanner,
  verifyTransferPassAgainstBookings,
  type TransferPassRow
} from './client-transfer-pass-panel'
import { TransferPassScanner } from './transfer-pass-scanner'

export function AdminTransferPassScanPanel() {
  const supabase = getSupabaseBrowserClient()
  const [bookings, setBookings] = useState<TransferPassRow[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [verifyResult, setVerifyResult] = useState<ReturnType<typeof verifyTransferPassAgainstBookings> | null>(null)

  useEffect(() => {
    if (!supabase) {
      setLoadError('Supabase is not configured.')
      return
    }
    let cancelled = false
    const load = async () => {
      const { data, error } = await supabase
        .from('transfer_bookings')
        .select(
          'id, pickup_label, dropoff_label, payment_status, deposit_percent, enquiry_reference_id, scheduled_at, admin_price_eur'
        )
        .order('created_at', { ascending: false })
        .limit(120)
      if (cancelled) {
        return
      }
      if (error) {
        setLoadError(error.message)
        setBookings([])
        return
      }
      setLoadError(null)
      setBookings((data ?? []) as TransferPassRow[])
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [supabase])

  const handleScan = useCallback(
    (raw: string) => {
      setVerifyResult(verifyTransferPassAgainstBookings(raw, bookings))
    },
    [bookings]
  )

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-forest-100 bg-white p-5 shadow-soft sm:p-7">
        <p className="font-ge text-sm font-extrabold uppercase tracking-[0.18em] text-brand-600">Scan trip pass</p>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-forest-950 sm:text-3xl">
          Confirm guest payment before pickup
        </h2>
        <p className="mt-3 max-w-prose text-lg leading-relaxed text-forest-700">
          Scan the barcode from the client&apos;s Trip pass tab — same flow your Costa del Sol drivers use on the road.
        </p>
      </div>

      {loadError ? (
        <p className="text-lg font-semibold text-red-800" role="alert">
          {loadError}
        </p>
      ) : null}

      <TransferPassVerifyBanner result={verifyResult} />
      <TransferPassScanner onScan={handleScan} />
    </div>
  )
}
