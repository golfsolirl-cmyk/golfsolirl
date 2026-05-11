import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, MapPin, MapPinned, MessageSquareText, Sparkles, UserRound } from 'lucide-react'
import {
  buildEnquiryFormDetailRows,
  buildPackageBuildDetailRows,
  enquirySnapshotKicker,
  findFirstEnquiryForReference,
  resolveEnquiryReferenceForTransferBooking,
  resolveFirstWebsiteFormPackageBuildForTransfer,
  type ClientDataCardRow,
  type ClientEnquiryRowLite,
  type ClientPackageBuildLite
} from '../lib/client-data-card'
import { formatDateTimeDdMmYy } from '../lib/date-format-ie'
import {
  PORTAL_INTEREST_LABELS,
  type PortalInterestCategory,
  type PortalInterestTicketMessageRow,
  type PortalInterestTicketRow
} from '../lib/portal-interest-tickets'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import {
  PORTAL_ADD_ON_ICON_STROKE,
  portalAddOnPremiumIcon,
  portalAddOnPremiumTileClass
} from '../lib/portal-add-on-premium-icons'
import { humanizeFormKey, parseAnyPackageBuildRowConfig } from '../lib/package-build'
import {
  clientTransferOperationalStatusLabel,
  clientTransferPaymentBadgeKind
} from '../lib/transfer-payment-breakdown'
import { cx } from '../lib/utils'

export type PortalTransferRequestBooking = {
  readonly id: string
  readonly pickup_label: string
  readonly dropoff_label: string
  readonly status: string
  readonly scheduled_at: string | null
  readonly payment_status?: string | null
  readonly package_build_id?: string | null
  readonly enquiry_reference_id?: string | null
  readonly created_at?: string | null
}

const GOLF_SOL_LOGO_SRC = '/golf-sol-ireland-logo.svg'

const cardKicker = (
  build: ClientPackageBuildLite | null,
  enquiryRef: string | undefined,
  fallbackEnquiry: ClientEnquiryRowLite | null
): string => {
  const ref = (enquiryRef ?? '').trim()
  if (build) {
    const parsed = parseAnyPackageBuildRowConfig(build.config)
    if (parsed?.type === 'website_form') {
      const fk = humanizeFormKey(parsed.config.formKey.replace(/_/g, ' '))
      const idRef = (parsed.config.enquiryReferenceId ?? '').trim() || ref
      return idRef ? `Saved package · ${fk} · ${idRef}` : `Saved package · ${fk}`
    }
    const lbl = build.label?.trim()
    return lbl ? `Saved package · ${lbl}` : ref ? `Saved package · ${ref}` : 'Saved package'
  }
  if (fallbackEnquiry) {
    return enquirySnapshotKicker(fallbackEnquiry)
  }
  return ref ? `Transfer · ${ref}` : 'Transfer request'
}

const DetailGrid = ({ rows }: { readonly rows: readonly ClientDataCardRow[] }) => (
  <dl className="grid gap-0 divide-y divide-emerald-900/15 sm:grid-cols-2">
    {rows.map((row, idx) => (
      <div key={`${idx}-${row.label}`} className="px-4 py-3 sm:px-5">
        <dt className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-emerald-200/90">{row.label}</dt>
        <dd className="mt-1.5 text-sm font-medium leading-relaxed text-white/95">{row.value}</dd>
      </div>
    ))}
  </dl>
)

export function PortalTransferRequestsSection(props: {
  readonly bookings: readonly PortalTransferRequestBooking[]
  readonly packageBuilds: readonly ClientPackageBuildLite[]
  readonly enquiries?: readonly ClientEnquiryRowLite[]
  readonly interestTickets?: readonly PortalInterestTicketRow[]
}) {
  const baseId = useId()
  const [openId, setOpenId] = useState<string | null>(null)
  const [interestThreadTicketId, setInterestThreadTicketId] = useState<string | null>(null)
  const [interestThreadMessages, setInterestThreadMessages] = useState<PortalInterestTicketMessageRow[]>([])
  const [interestThreadLoading, setInterestThreadLoading] = useState(false)
  const [interestThreadError, setInterestThreadError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const enquiries = props.enquiries ?? []
  const interestTickets = props.interestTickets ?? []

  const loadInterestTicketMessages = useCallback(async (ticketId: string) => {
    setInterestThreadLoading(true)
    setInterestThreadError(null)
    setInterestThreadMessages([])
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setInterestThreadLoading(false)
      setInterestThreadError('Connection unavailable.')
      return
    }
    const { data, error } = await supabase
      .from('portal_interest_ticket_messages')
      .select('id, ticket_id, author_kind, body, created_at')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
    setInterestThreadLoading(false)
    if (error) {
      setInterestThreadError(error.message)
      return
    }
    setInterestThreadMessages((data ?? []) as PortalInterestTicketMessageRow[])
  }, [])

  const toggleInterestTicketThread = useCallback(
    (ticketId: string) => {
      if (interestThreadTicketId === ticketId) {
        setInterestThreadTicketId(null)
        setInterestThreadMessages([])
        setInterestThreadError(null)
        return
      }
      setInterestThreadTicketId(ticketId)
      void loadInterestTicketMessages(ticketId)
    },
    [interestThreadTicketId, loadInterestTicketMessages]
  )

  useEffect(() => {
    if (!openId) {
      return
    }
    const onDoc = (e: MouseEvent) => {
      const el = rootRef.current
      if (el && !el.contains(e.target as Node)) {
        setOpenId(null)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [openId])

  const sortedTickets = interestTickets
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12)

  const hasTransfers = props.bookings.length > 0

  return (
    <section ref={rootRef} aria-label="Linked requests" className="space-y-6">
      <div className="px-1 sm:px-0">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Linked requests</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-forest-700">
          {hasTransfers ? (
            <>
              Other map transfers on the same enquiry reference, plus your golf, hotel, and transfer message threads. Tap an interest
              ticket to read the full conversation (read-only here).
            </>
          ) : (
            <>
              Your golf, hotel, and transfer message threads from <span className="font-semibold text-forest-800">Add to your trip</span>{' '}
              are below — tap a ticket to read the full conversation (read-only here). Map transfer rows will appear here once you
              submit a route from the dashboard or transport flow.
            </>
          )}
        </p>
      </div>

      {hasTransfers ? (
      <div className="overflow-hidden rounded-3xl border-2 border-gs-gold/40 bg-gradient-to-br from-white via-white to-[#f3faf6] shadow-[0_22px_56px_rgba(11,73,52,0.1)] ring-1 ring-gs-green/15">
        <header className="border-b border-ge-gray100 bg-gradient-to-r from-[#0f3d24]/95 via-[#143d28] to-[#0a2416] px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <MapPinned className="h-4 w-4 text-gold-400" aria-hidden />
            <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-emerald-200/90">Transfer requests</p>
          </div>
          <h2 className="font-display mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
            Map requests and saved trip routes
          </h2>
          <p className="mt-2 max-w-2xl font-ge text-xs font-semibold uppercase leading-relaxed tracking-[0.12em] text-emerald-100/80">
            Shared with Golf Sol Ireland — Trip details opens your first submitted form snapshot plus related threads.
          </p>
        </header>

        <ul className="divide-y divide-ge-gray100" aria-label="Transfer request rows">
        {props.bookings.map((b) => {
          const ref = resolveEnquiryReferenceForTransferBooking(b, props.packageBuilds)
          const snapshotBuild = resolveFirstWebsiteFormPackageBuildForTransfer(b, props.packageBuilds)
          const firstEnquiry = findFirstEnquiryForReference(ref, enquiries)
          let detailRows: ClientDataCardRow[] = snapshotBuild ? buildPackageBuildDetailRows(snapshotBuild) : []
          let kickerSource: 'package' | 'enquiry' = snapshotBuild ? 'package' : 'enquiry'
          if (detailRows.length === 0 && firstEnquiry) {
            detailRows = buildEnquiryFormDetailRows(firstEnquiry)
            kickerSource = 'enquiry'
          }
          const kickerBuild = kickerSource === 'package' ? snapshotBuild : null
          const kickerEnquiry = kickerSource === 'enquiry' ? firstEnquiry : null
          const linkedPackageDiffers =
            kickerSource === 'package' &&
            snapshotBuild != null &&
            Boolean(b.package_build_id?.trim()) &&
            snapshotBuild.id !== b.package_build_id?.trim()

          const siblingTransfers = ref
            ? props.bookings.filter((o) => {
                if (o.id === b.id) {
                  return false
                }
                return resolveEnquiryReferenceForTransferBooking(o, props.packageBuilds) === ref
              })
            : []

          const when = b.scheduled_at ? formatDateTimeDdMmYy(b.scheduled_at) : 'ASAP'
          const created = b.created_at ? formatDateTimeDdMmYy(b.created_at) : ''
          const expanded = openId === b.id
          const panelId = `${baseId}-panel-${b.id}`
          const btnId = `${baseId}-btn-${b.id}`

          const snapshotCreated =
            kickerSource === 'package' && snapshotBuild?.created_at
              ? formatDateTimeDdMmYy(snapshotBuild.created_at)
              : kickerSource === 'enquiry' && firstEnquiry
                ? formatDateTimeDdMmYy(firstEnquiry.created_at)
                : ''

          return (
            <li key={b.id} className="relative bg-white/90">
              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-ge text-[0.95rem] font-semibold leading-snug text-forest-950 sm:text-base">
                      {b.pickup_label} → {b.dropoff_label}
                    </p>
                    {(() => {
                      const kind = clientTransferPaymentBadgeKind(b)
                      if (!kind) {
                        return null
                      }
                      const label = kind === 'deposit_paid' ? 'Deposit paid' : 'Paid in full'
                      const pillClass =
                        kind === 'deposit_paid'
                          ? 'border-amber-400/70 bg-amber-50 text-amber-950'
                          : 'border-emerald-500/50 bg-emerald-50 text-emerald-950'
                      return (
                        <span
                          className={cx(
                            'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.12em]',
                            pillClass
                          )}
                        >
                          {label}
                        </span>
                      )
                    })()}
                  </div>
                  <p className="mt-1 text-xs font-medium text-forest-600">
                    <span className="text-forest-800">{clientTransferOperationalStatusLabel(b)}</span>
                    <span className="mx-1.5 text-forest-300">·</span>
                    {when}
                    {created ? (
                      <>
                        <span className="mx-1.5 text-forest-300">·</span>
                        <span className="text-forest-500">Submitted {created}</span>
                      </>
                    ) : null}
                  </p>
                </div>
                <button
                  id={btnId}
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpenId(expanded ? null : b.id)}
                  className={cx(
                    'group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-300',
                    'border-gold-400/70 bg-gradient-to-r from-gold-400 via-[#f0b429] to-gold-300 text-forest-950 shadow-md',
                    'hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2'
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.35)_45%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <Sparkles className="relative h-4 w-4 text-forest-900/80" aria-hidden />
                  <span className="relative">Trip details</span>
                  <ChevronDown
                    className={cx('relative h-4 w-4 transition-transform duration-300', expanded ? 'rotate-180' : '')}
                    aria-hidden
                  />
                </button>
              </div>

              {expanded ? (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="border-t border-forest-100 bg-[linear-gradient(180deg,#0f3d24_0%,#0a2416_100%)] px-3 pb-4 pt-3 sm:px-4"
                >
                  <div className="overflow-hidden rounded-2xl border border-gold-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
                    <div className="border-b border-white/10 bg-gradient-to-r from-emerald-950/90 to-[#0c2810] px-4 py-3 sm:px-5">
                      <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-gold-300/90">First submitted form</p>
                      <p className="mt-1 font-display text-sm font-semibold text-white sm:text-base">
                        {cardKicker(kickerBuild, ref || undefined, kickerEnquiry)}
                      </p>
                      {snapshotCreated ? (
                        <p className="mt-1 text-xs text-emerald-100/80">
                          {kickerSource === 'package' ? 'Snapshot' : 'Submitted'} · {snapshotCreated}
                        </p>
                      ) : null}
                      {linkedPackageDiffers ? (
                        <p className="mt-2 rounded-lg border border-gold-400/25 bg-black/25 px-3 py-2 text-[0.7rem] font-medium leading-snug text-gold-100/95">
                          Showing the earliest saved website snapshot for this reference. A newer package revision may exist in
                          &ldquo;Your packages&rdquo; — fields below match what you first sent.
                        </p>
                      ) : null}
                    </div>
                    {detailRows.length > 0 ? (
                      <DetailGrid rows={detailRows} />
                    ) : (
                      <p className="px-4 py-6 text-center text-sm text-emerald-100/85">
                        No saved website form is linked to this transfer yet. If you submitted from the transport page, it will
                        appear here once the snapshot is on your account — or open <strong className="font-semibold">Your packages</strong>{' '}
                        below.
                      </p>
                    )}

                    <div className="border-t border-white/10 bg-[#071910]/90 px-4 py-4 sm:px-5">
                      {siblingTransfers.length > 0 ? (
                        <div>
                          <p className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-gold-300/90">
                            <MapPin className="h-3.5 w-3.5" aria-hidden />
                            More transfers (same trip ref)
                          </p>
                          <ul className="mt-2 space-y-2">
                            {siblingTransfers.map((t) => (
                              <li
                                key={t.id}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/95 backdrop-blur-sm"
                              >
                                <span className="font-medium">{t.pickup_label}</span>
                                <span className="text-emerald-200/80"> → </span>
                                <span className="font-medium">{t.dropoff_label}</span>
                                <span className="mt-1 block text-xs text-emerald-100/70">
                                  {clientTransferOperationalStatusLabel(t)}
                                  {t.created_at ? ` · ${formatDateTimeDdMmYy(t.created_at)}` : ''}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      <p
                        className={cx(
                          'text-xs leading-relaxed text-emerald-100/75',
                          siblingTransfers.length > 0 ? 'mt-4 border-t border-white/10 pt-4' : ''
                        )}
                      >
                        <a
                          className="font-semibold text-gold-200/95 underline decoration-gold-400/50 underline-offset-2 hover:text-gold-100"
                          href="#portal-linked-interest-tickets"
                        >
                          Interest tickets
                        </a>{' '}
                        for golf, hotels, and transfers live in the box below — tap a row to read the thread (read-only) when you
                        have messages.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
        </ul>
      </div>
      ) : (
        <div
          role="status"
          className="rounded-2xl border border-dashed border-forest-200/90 bg-offwhite/80 px-5 py-4 text-sm text-forest-700 shadow-inner"
        >
          <p className="font-display font-semibold text-forest-900">No transfer requests yet</p>
          <p className="mt-1 leading-relaxed">
            When you request a route from the map or save trip legs, rows appear here with <span className="font-semibold">Trip details</span>.
            Your threads from <span className="font-semibold">Add to your trip</span> stay in <span className="font-semibold">Interest tickets</span> below.
          </p>
        </div>
      )}

      <div
        id="portal-linked-interest-tickets"
        className="relative overflow-hidden rounded-[1.85rem] border border-forest-200/80 bg-[linear-gradient(145deg,#fffefb_0%,#f4faf6_38%,#eef6f0_100%)] px-5 py-6 shadow-[0_20px_50px_-12px_rgba(15,61,46,0.18)] sm:px-7 sm:py-7"
      >
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold-300/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-fairway-600/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-500" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Interest tickets</p>
          </div>
          <div className="mt-2 h-px max-w-[7rem] rounded-full bg-gradient-to-r from-gold-400 via-gold-300/80 to-transparent" />
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forest-700">
            Golf, hotel, and transfer threads from <span className="font-semibold text-forest-800">Add to your trip</span>. Tap a
            row to read the conversation — read-only here; reply via <span className="font-semibold text-forest-800">Message the team</span>.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-1" aria-label="Interest ticket threads">
            {sortedTickets.length === 0 ? (
              <li className="list-none rounded-2xl border border-dashed border-forest-200/90 bg-white/80 px-5 py-10 text-center text-sm leading-relaxed text-forest-600 shadow-inner">
                <p className="font-medium text-forest-800">No tickets yet</p>
                <p className="mt-2">
                  When you use <span className="font-semibold text-forest-900">Add to your trip</span> above, threads show here —
                  tap a row to read messages (read-only).
                </p>
              </li>
            ) : (
              sortedTickets.map((t) => {
                const Icon = portalAddOnPremiumIcon(t.category)
                const threadOpen = interestThreadTicketId === t.id
                return (
                  <li
                    key={t.id}
                    className="overflow-hidden rounded-2xl border border-forest-200/90 bg-white/90 text-sm text-forest-900 shadow-sm ring-1 ring-forest-900/[0.04]"
                  >
                    <button
                      type="button"
                      aria-expanded={threadOpen}
                      onClick={() => toggleInterestTicketThread(t.id)}
                      className={cx(
                        'flex w-full gap-3 px-4 py-3 text-left transition-colors',
                        threadOpen ? 'bg-emerald-50/80' : 'hover:bg-offwhite/90'
                      )}
                    >
                      <span
                        className={cx(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          portalAddOnPremiumTileClass(t.category)
                        )}
                      >
                        <Icon className="h-4 w-4 text-white" strokeWidth={PORTAL_ADD_ON_ICON_STROKE} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-display font-semibold text-forest-950">{PORTAL_INTEREST_LABELS[t.category]}</span>
                          <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-emerald-700/70" aria-hidden />
                        </span>
                        <span className="mt-0.5 block text-xs capitalize text-forest-600">
                          {t.status.replace(/_/g, ' ')} · {formatDateTimeDdMmYy(t.created_at)}
                        </span>
                        <span className="mt-1 block text-[0.65rem] font-medium text-emerald-800/90">
                          {threadOpen ? 'Hide messages' : 'View full messages'}
                        </span>
                      </span>
                      <ChevronDown
                        className={cx(
                          'mt-1 h-4 w-4 shrink-0 text-forest-500 transition-transform',
                          threadOpen ? 'rotate-180' : ''
                        )}
                        aria-hidden
                      />
                    </button>
                    {threadOpen ? (
                      <div className="border-t border-forest-100 bg-offwhite/95 px-4 py-4">
                        <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-gold-700">Your trip messages</p>
                        <p className="mt-1 text-[0.65rem] leading-relaxed text-forest-600">
                          Read-only preview — use <span className="font-semibold text-forest-800">Message the team</span> to reply.
                        </p>
                        {interestThreadLoading ? (
                          <p className="mt-3 text-xs text-forest-600">Loading messages…</p>
                        ) : interestThreadError ? (
                          <p className="mt-3 text-xs text-red-800" role="alert">
                            {interestThreadError}
                          </p>
                        ) : interestThreadMessages.length === 0 ? (
                          <p className="mt-3 text-xs text-forest-600">No messages in this thread yet.</p>
                        ) : (
                          <ul className="mt-3 max-h-[min(55vh,22rem)] space-y-2 overflow-y-auto pr-1">
                            {interestThreadMessages.map((m) => (
                              <li
                                key={m.id}
                                className={cx(
                                  'rounded-xl border px-3 py-2.5 text-left',
                                  m.author_kind === 'admin'
                                    ? 'border-emerald-200/90 bg-emerald-50/90'
                                    : 'border-forest-200/80 bg-white'
                                )}
                              >
                                {m.author_kind === 'admin' ? (
                                  <div className="flex min-h-[1.5rem] items-center gap-2">
                                    <img
                                      src={GOLF_SOL_LOGO_SRC}
                                      alt="Golf Sol Ireland"
                                      className="h-6 w-auto max-w-[7rem] shrink-0 object-contain object-left"
                                    />
                                  </div>
                                ) : (
                                  <p className="flex items-center gap-1.5 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-forest-700">
                                    <UserRound className="h-3.5 w-3.5 shrink-0 text-forest-600" aria-hidden />
                                    You
                                  </p>
                                )}
                                <p className="mt-1.5 whitespace-pre-wrap text-[0.8125rem] font-medium leading-relaxed text-forest-900">
                                  {m.body}
                                </p>
                                <p className="mt-2 text-[0.65rem] tabular-nums text-forest-500">
                                  {formatDateTimeDdMmYy(m.created_at)}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
