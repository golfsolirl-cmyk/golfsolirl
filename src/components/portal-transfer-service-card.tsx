/**
 * Printable-style transfer summary matching the dashboard hero “Your transfers” panel.
 */

const formatEur = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export type PortalTransferServiceCardModel = {
  enquiryReferenceId: string | null
  createdAt: string | null
  pickupLabel: string
  dropoffLabel: string
  status: string
  scheduledAt: string | null
  bookingSource: string | null
  packageBuildId: string | null
  paymentStatus: string | null
  depositPercent: number | null
  adminPriceEur: number | null
}

export function PortalTransferServiceCard(props: { readonly transfer: PortalTransferServiceCardModel }) {
  const t = props.transfer
  const ref = (t.enquiryReferenceId ?? '').trim() || '—'
  const created =
    t.createdAt && !Number.isNaN(new Date(t.createdAt).getTime())
      ? new Date(t.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : '—'
  const pay = (t.paymentStatus ?? 'unpaid').toLowerCase()
  const payLabel = pay === 'paid' ? 'Paid' : pay === 'deposit' ? 'Deposit' : 'Unpaid'
  const when = t.scheduledAt
    ? new Date(t.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Timing TBC'
  const src =
    t.bookingSource === 'website_enquiry'
      ? 'Website'
      : t.bookingSource === 'client_dashboard' && t.packageBuildId
        ? 'Trip planner'
        : 'Dashboard'

  return (
    <div className="text-forest-950">
      <p className="font-display text-lg font-semibold tracking-tight text-forest-950 md:text-xl">
        Transport Service Page · <span className="font-mono text-base font-semibold md:text-lg">{ref}</span>
      </p>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-forest-100 pb-3">
        <p className="text-sm font-medium text-forest-700">{created}</p>
        <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-emerald-800">Your transfers</p>
      </div>

      <p className="mt-2 font-ge text-xs text-forest-600">Live status from our operations desk.</p>

      <div className="mt-5 overflow-hidden rounded-2xl border-2 border-gs-gold/35 bg-gradient-to-br from-[#0f3d24] via-[#143d28] to-[#0a2416] p-5 text-white shadow-[0_20px_50px_rgba(11,73,52,0.28)] ring-1 ring-white/10">
        <p className="font-ge text-sm font-semibold leading-snug text-white">
          {t.pickupLabel} → {t.dropoffLabel}
        </p>
        <p className="mt-1.5 font-ge text-[0.7rem] text-emerald-100/85">
          {src} · {t.status.replace(/_/g, ' ')} · {when}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <span className="rounded-full bg-white/12 px-3 py-1 font-ge text-[0.68rem] font-bold uppercase tracking-wide text-amber-100">
            {payLabel}
          </span>
          {typeof t.adminPriceEur === 'number' && Number.isFinite(t.adminPriceEur) ? (
            <span className="font-display text-2xl font-bold tracking-tight text-amber-100">{formatEur(t.adminPriceEur)}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
