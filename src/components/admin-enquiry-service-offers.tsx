import { useMemo, useState } from 'react'
import { LuxuryButton } from './ui/button'
import {
  missingTripServiceIds,
  parseTripServices,
  TRIP_SERVICE_LABELS,
  TRIP_SERVICE_ORDER,
  type TripServiceId,
  type TripServiceSelection
} from '../lib/trip-quote-services'
import { AdminEnquiryTransferUpsellModal } from './admin-enquiry-transfer-upsell-modal'
import type { AdminEnquiryCardRow } from './admin-enquiry-card-queue'

type AdminEnquiryServiceOffersProps = {
  readonly row: AdminEnquiryCardRow & { requested_services?: unknown }
  readonly accessToken: string | null
  readonly onServicesUpdated?: (next: TripServiceSelection) => void
}

const OFFER_LABEL: Record<TripServiceId, string> = {
  transfers: 'Offer transfers',
  accommodation: 'Offer accommodation',
  golf_courses: 'Offer golf courses'
}

/**
 * Service chips + missing offers for an enquiry card.
 * Offer actions open the branded email modal (transfers / accommodation / golf).
 */
export function AdminEnquiryServiceOffers({
  row,
  accessToken,
  onServicesUpdated
}: AdminEnquiryServiceOffersProps) {
  const services = useMemo(() => {
    const fromCol = parseTripServices(row.requested_services)
    if (fromCol) return fromCol
    const fields =
      row.form_payload && typeof row.form_payload === 'object' && !Array.isArray(row.form_payload)
        ? (row.form_payload as { fields?: Record<string, string> }).fields
        : undefined
    return (
      parseTripServices(fields?._serviceStages) ?? {
        transfers: String(fields?._addTransfers || '').toLowerCase() === 'yes',
        accommodation: Boolean(fields?.Hotel || fields?.hotel),
        golf_courses: Boolean(fields?.Courses || fields?.Golfers || fields?._bundleSlug)
      }
    )
  }, [row])

  const missing = missingTripServiceIds(services)
  const [offerService, setOfferService] = useState<TripServiceId | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const toggleService = async (id: TripServiceId) => {
    if (!accessToken) {
      setNote('Sign in again as admin.')
      return
    }
    setBusy(true)
    setNote(null)
    const next = { ...services, [id]: !services[id] }
    try {
      const res = await fetch('/api/enquiry-payment-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: 'set_requested_services',
          enquiryId: row.id,
          requestedServices: next
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        setNote(data.message ?? 'Could not update services.')
        return
      }
      onServicesUpdated?.(next)
      setNote('Services updated.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-forest-100 bg-white px-4 py-5 sm:px-5">
      <h4 className="font-display text-lg font-semibold text-forest-950">Trip services</h4>
      <p className="mt-1 text-sm text-forest-700">What they asked for — toggle to add or remove manually.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {TRIP_SERVICE_ORDER.map((id) => {
          const on = services[id]
          return (
            <button
              key={id}
              type="button"
              disabled={busy}
              onClick={() => void toggleService(id)}
              className={
                on
                  ? 'rounded-full bg-forest-900 px-3 py-1.5 text-xs font-semibold text-white'
                  : 'rounded-full border border-dashed border-forest-300 px-3 py-1.5 text-xs font-semibold text-forest-600'
              }
            >
              {on ? '✓ ' : '+ '}
              {TRIP_SERVICE_LABELS[id]}
            </button>
          )
        })}
      </div>

      {missing.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-900">Not requested yet</p>
          <div className="flex flex-wrap gap-2">
            {missing.map((id) => (
              <LuxuryButton
                key={id}
                className="!px-4 !py-2 !text-xs"
                onClick={() => setOfferService(id)}
                type="button"
                variant="outlineOnLight"
              >
                {OFFER_LABEL[id]}
              </LuxuryButton>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-forest-700">All three services are on this enquiry.</p>
      )}

      {note ? <p className="mt-3 text-sm text-forest-800">{note}</p> : null}

      <AdminEnquiryTransferUpsellModal
        accessToken={accessToken}
        offerService={offerService ?? 'transfers'}
        onClose={() => setOfferService(null)}
        row={offerService ? row : null}
      />
    </section>
  )
}
