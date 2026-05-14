import { useState } from 'react'
import { Copy, Check, FileText, CreditCard, BadgeCheck } from 'lucide-react'
import {
  balanceAmountEur,
  clientTransferOperationalStatusLabel,
  depositAmountEur,
  formatBalanceDueLine,
  normalizedDepositPercent,
  transferPaymentFullUpfront
} from '../lib/transfer-payment-breakdown'
import { cx } from '../lib/utils'

const formatEurInline = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export type ClientPortalTransferHeroRow = {
  readonly id: string
  readonly pickup_label: string
  readonly dropoff_label: string
  readonly status: string
  readonly scheduled_at: string | null
  readonly admin_price_eur?: number | null
  readonly admin_price_vat_treatment?: string | null
  readonly deposit_percent?: number | null
  readonly payment_status?: string | null
  readonly next_available_driver?: boolean | null
  readonly booking_source?: string | null
  readonly package_build_id?: string | null
  readonly enquiry_reference_id?: string | null
  readonly created_at?: string | null
  /** ISO timestamp — used for paid-invoice “systems updated” hint */
  readonly updated_at?: string | null
}

export function ClientPortalIdentityHero(props: {
  readonly firstName: string
  /** Used in “Hello, …” — profile display name, else first name from the first website enquiry for this login email. */
  readonly signedInAs: string
  readonly accountNumber: string | null
  readonly accountEmail: string | null
  readonly transfers: readonly ClientPortalTransferHeroRow[]
  /** Stripe return — pulse ring on this booking row */
  readonly emphasizeTransferBookingId?: string | null
  readonly onDownloadTransferQuotePdf?: (transfer: ClientPortalTransferHeroRow) => void | Promise<void>
  readonly onDownloadTransferPaidInvoicePdf?: (transfer: ClientPortalTransferHeroRow) => void | Promise<void>
  readonly onPayTransfer?: (
    transfer: ClientPortalTransferHeroRow,
    phase: 'deposit' | 'balance' | 'full'
  ) => void | Promise<void>
  /** Opens full-screen transfer summary (Transport Service card) */
  readonly onViewTransferCard?: (transfer: ClientPortalTransferHeroRow) => void | Promise<void>
  /** Merged onto the root card — e.g. `mb-0` when a sibling banner sits directly below */
  readonly className?: string
}) {
  const [copied, setCopied] = useState(false)
  const [quotePdfBusyId, setQuotePdfBusyId] = useState<string | null>(null)
  const [paidInvoiceBusyId, setPaidInvoiceBusyId] = useState<string | null>(null)
  const [payBusyId, setPayBusyId] = useState<string | null>(null)
  const [payBusyPhase, setPayBusyPhase] = useState<'deposit' | 'balance' | 'full' | null>(null)
  const ref = props.accountNumber?.trim() ?? ''
  const emailDisplay = (props.accountEmail ?? '').trim()
  const signedInLabel = props.signedInAs.trim() || emailDisplay || '—'

  const copyRef = async () => {
    if (!ref) {
      return
    }
    try {
      await navigator.clipboard.writeText(ref)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={cx(
        'mb-10 overflow-hidden rounded-[2rem] border-2 border-gs-gold/45 bg-gradient-to-br from-[#0f3d24] via-[#143d28] to-[#0a2416] p-6 text-white shadow-[0_24px_60px_rgba(11,73,52,0.35)] ring-1 ring-white/10 sm:p-8',
        props.className
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-5">
          <div>
            <p className="font-ge text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-200/90 sm:text-sm">Your account</p>
            <h2 className="font-display mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {props.firstName.trim() ? <>Hello, {props.firstName.trim()}</> : <>Hello</>}
            </h2>
            <p className="mt-2 font-ge text-base leading-relaxed text-emerald-50/90">
              Signed in as{' '}
              <span className="break-all font-semibold text-white">{signedInLabel}</span>
            </p>
          </div>

          {emailDisplay || ref ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {emailDisplay ? (
                <div className="rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3.5 backdrop-blur-sm">
                  <p className="font-ge text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200/85 sm:text-sm">Account email</p>
                  <p className="mt-1.5 break-all font-ge text-base font-semibold leading-snug text-white">{emailDisplay}</p>
                </div>
              ) : null}
              {ref ? (
                <div className="rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3.5 backdrop-blur-sm">
                  <p className="font-ge text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200/85 sm:text-sm">
                    Account number
                  </p>
                  <p className="mt-1.5 font-mono text-xl font-bold tracking-wide text-amber-100 sm:text-2xl">{ref}</p>
                  <button
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-400/15 px-3 py-2 font-ge text-xs font-bold uppercase tracking-[0.12em] text-amber-100 transition hover:bg-amber-400/25 sm:text-sm"
                    onClick={() => void copyRef()}
                    type="button"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/12 bg-black/15 px-4 py-3.5">
                  <p className="font-ge text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200/85 sm:text-sm">
                    Account number
                  </p>
                  <p className="mt-1.5 font-ge text-sm leading-relaxed text-emerald-100/85 sm:text-base">
                    Your personal account number appears after you submit a website form with this login email — same ref as on your
                    enquiry PDFs.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="max-w-xl font-ge text-base leading-relaxed text-emerald-100/85 sm:text-lg">
              Your personal <strong className="font-semibold text-white">account email</strong> and{' '}
              <strong className="font-semibold text-white">account number</strong> show here once your profile is linked.
            </p>
          )}
        </div>

        {props.transfers.length > 0 ? (
          <div className="w-full shrink-0 rounded-2xl border border-white/12 bg-black/20 p-5 lg:max-w-md">
            <p className="font-ge text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-200/85 sm:text-sm">Your transfers</p>
            <p className="mt-1 font-ge text-sm text-emerald-100/75 sm:text-base">Live status from our operations desk.</p>
            <ul className="mt-4 space-y-3">
              {props.transfers.slice(0, 5).map((t) => {
                const pay = (t.payment_status ?? 'unpaid').toLowerCase()
                const isPaid = pay === 'paid'
                const payLabel =
                  pay === 'paid' ? 'Paid in full' : pay === 'deposit' ? 'Deposit paid' : 'Unpaid'
                const when = t.scheduled_at
                  ? new Date(t.scheduled_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                  : 'ASAP / next available driver'
                const src =
                  t.booking_source === 'website_enquiry'
                    ? 'Website'
                    : t.booking_source === 'client_dashboard' && t.package_build_id
                      ? 'Trip planner'
                      : 'Dashboard'
                const gross =
                  typeof t.admin_price_eur === 'number' && Number.isFinite(t.admin_price_eur) ? t.admin_price_eur : null
                const fullUpfront = transferPaymentFullUpfront(t)
                const pct = normalizedDepositPercent(t.deposit_percent)
                const depEur = gross !== null ? depositAmountEur(gross, pct) : null
                const balEur = gross !== null ? balanceAmountEur(gross, pct) : null
                const dueLine = !fullUpfront ? formatBalanceDueLine(t.scheduled_at) : null
                const showPay = gross !== null && gross >= 0.5 && typeof props.onPayTransfer === 'function' && !isPaid
                const payBusy = payBusyId === t.id
                const emphasized = props.emphasizeTransferBookingId === t.id
                return (
                  <li
                    className={`rounded-xl border px-3 py-2.5 transition-[box-shadow] duration-500 ${
                      emphasized
                        ? 'border-amber-300/75 bg-amber-400/[0.14] shadow-[0_0_0_1px_rgba(213,198,0,0.35),0_12px_40px_rgba(213,198,0,0.15)]'
                        : 'border-white/10 bg-white/[0.06]'
                    }`}
                    key={t.id}
                  >
                    <p className="font-ge text-base font-semibold leading-snug text-white">
                      {t.pickup_label} → {t.dropoff_label}
                    </p>
                    <p className="mt-1 font-ge text-sm text-emerald-100/80">
                      {src} · {clientTransferOperationalStatusLabel(t)} · {when}
                    </p>
                    {gross !== null ? (
                      <div className="mt-2 space-y-0.5 font-ge text-xs leading-snug text-emerald-50/95 sm:text-sm">
                        <p>
                          <span className="text-emerald-200/80">Total (VAT incl.):</span>{' '}
                          <span className="font-semibold text-amber-100">{formatEurInline(gross)}</span>
                        </p>
                        {fullUpfront ? (
                          <p className="text-emerald-100/85">Full payment — no split deposit (ASAP / next available).</p>
                        ) : (
                          <>
                            <p>
                              <span className="text-emerald-200/80">{pct}% deposit:</span>{' '}
                              <span className="font-semibold text-amber-100">{formatEurInline(depEur!)}</span>
                            </p>
                            <p>
                              <span className="text-emerald-200/80">Balance:</span>{' '}
                              <span className="font-semibold text-amber-100">{formatEurInline(balEur!)}</span>
                            </p>
                            {dueLine ? <p className="text-emerald-100/85">{dueLine}</p> : null}
                          </>
                        )}
                      </div>
                    ) : null}
                    <p className="mt-2 flex flex-wrap items-center gap-2 font-ge text-sm text-emerald-50/90">
                      <span className="rounded-full bg-white/10 px-2 py-0.5 font-bold uppercase tracking-wide text-amber-100/95">
                        {payLabel}
                      </span>
                      {showPay && fullUpfront ? (
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300/50 bg-emerald-500/25 px-2 py-1 font-ge text-xs font-bold uppercase tracking-[0.1em] text-emerald-50 transition hover:bg-emerald-500/40 disabled:opacity-50"
                          disabled={payBusy}
                          onClick={() => {
                            setPayBusyId(t.id)
                            setPayBusyPhase('full')
                            void Promise.resolve(props.onPayTransfer?.(t, 'full')).finally(() => {
                              setPayBusyId(null)
                              setPayBusyPhase(null)
                            })
                          }}
                          type="button"
                        >
                          <CreditCard className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {payBusy && payBusyPhase === 'full' ? 'Redirecting…' : `Pay in full ${formatEurInline(gross!)}`}
                        </button>
                      ) : null}
                      {showPay && !fullUpfront && pay === 'unpaid' ? (
                        <>
                          <button
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300/50 bg-emerald-500/25 px-2 py-1 font-ge text-xs font-bold uppercase tracking-[0.1em] text-emerald-50 transition hover:bg-emerald-500/40 disabled:opacity-50"
                            disabled={payBusy}
                            onClick={() => {
                              setPayBusyId(t.id)
                              setPayBusyPhase('deposit')
                              void Promise.resolve(props.onPayTransfer?.(t, 'deposit')).finally(() => {
                                setPayBusyId(null)
                                setPayBusyPhase(null)
                              })
                            }}
                            type="button"
                          >
                            <CreditCard className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            {payBusy && payBusyPhase === 'deposit' ? 'Redirecting…' : `Pay deposit ${formatEurInline(depEur!)}`}
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 font-ge text-xs font-bold uppercase tracking-[0.1em] text-emerald-100/50"
                            disabled
                            title="Pay the deposit first. Balance opens after your deposit is received."
                            type="button"
                          >
                            Pay balance {formatEurInline(balEur!)}
                          </button>
                        </>
                      ) : null}
                      {showPay && !fullUpfront && pay === 'deposit' ? (
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300/50 bg-emerald-500/25 px-2 py-1 font-ge text-xs font-bold uppercase tracking-[0.1em] text-emerald-50 transition hover:bg-emerald-500/40 disabled:opacity-50"
                          disabled={payBusy}
                          onClick={() => {
                            setPayBusyId(t.id)
                            setPayBusyPhase('balance')
                            void Promise.resolve(props.onPayTransfer?.(t, 'balance')).finally(() => {
                              setPayBusyId(null)
                              setPayBusyPhase(null)
                            })
                          }}
                          type="button"
                        >
                          <CreditCard className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {payBusy && payBusyPhase === 'balance' ? 'Redirecting…' : `Pay balance ${formatEurInline(balEur!)}`}
                        </button>
                      ) : null}
                      {typeof t.admin_price_eur === 'number' &&
                      Number.isFinite(t.admin_price_eur) &&
                      !isPaid &&
                      props.onDownloadTransferQuotePdf ? (
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-300/40 bg-amber-400/10 px-2 py-1 font-ge text-xs font-bold uppercase tracking-[0.12em] text-amber-100 transition hover:bg-amber-400/20 disabled:opacity-50"
                          disabled={quotePdfBusyId === t.id}
                          onClick={() => {
                            setQuotePdfBusyId(t.id)
                            void Promise.resolve(props.onDownloadTransferQuotePdf?.(t)).finally(() =>
                              setQuotePdfBusyId(null)
                            )
                          }}
                          type="button"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {quotePdfBusyId === t.id ? 'PDF…' : 'Quote PDF'}
                        </button>
                      ) : null}
                      {typeof t.admin_price_eur === 'number' &&
                      Number.isFinite(t.admin_price_eur) &&
                      isPaid &&
                      props.onDownloadTransferPaidInvoicePdf ? (
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300/55 bg-emerald-500/25 px-2 py-1 font-ge text-xs font-bold uppercase tracking-[0.12em] text-emerald-50 transition hover:bg-emerald-500/40 disabled:opacity-50"
                          disabled={paidInvoiceBusyId === t.id}
                          onClick={() => {
                            setPaidInvoiceBusyId(t.id)
                            void Promise.resolve(props.onDownloadTransferPaidInvoicePdf?.(t)).finally(() =>
                              setPaidInvoiceBusyId(null)
                            )
                          }}
                          type="button"
                        >
                          <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {paidInvoiceBusyId === t.id ? 'PDF…' : 'Paid invoice'}
                        </button>
                      ) : null}
                    </p>
                    {typeof props.onViewTransferCard === 'function' ? (
                      <button
                        className="mt-2 font-ge text-xs font-bold uppercase tracking-[0.14em] text-emerald-200/95 underline decoration-emerald-400/45 underline-offset-2 transition hover:text-white"
                        onClick={() => void Promise.resolve(props.onViewTransferCard?.(t))}
                        type="button"
                      >
                        View transfer card
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ul>
            {props.transfers.length > 5 ? (
              <p className="mt-3 font-ge text-sm text-emerald-200/80">+{props.transfers.length - 5} more in your full list below.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
