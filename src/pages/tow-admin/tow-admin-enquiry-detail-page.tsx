import { useEffect, useMemo, useState } from 'react'
import { AdminPaymentRequestModeToggle } from '../../components/admin-payment-request-mode-toggle'
import { TowAdminShell } from '../../components/tow-admin/tow-admin-bar'
import { TripTrackerPanel } from '../../components/tow-admin/trip-tracker-panel'
import { ensureAdminSession, towAdmin } from '../../lib/tow-admin-api'
import {
  ENQUIRY_ADMIN_STATUSES,
  FORM_TYPE_BADGE_CLASS,
  PAID_VIA_OPTIONS,
  formatEuro,
  formatIrishDateTime,
  formTypeLabel,
  type TripStepStatus
} from '../../lib/tow-admin-constants'
import {
  calcDeposit20Eur,
  roundMoney2,
  type PaymentRequestMode
} from '../../lib/payment-request-mode'

type Enquiry = {
  id: string
  reference: string
  createdAt: string
  name: string
  email: string
  phone: string
  interest: string
  message: string
  formKey: string
  formType?: string
  formTypeLabel?: string
  formSourcePage?: string
  adminStatus: string
  adminPrivateNotes: string
  paymentUi: string
  amountDue: number | null
  paidVia: string | null
  tripTracker: Record<string, TripStepStatus>
  emailTripOnStepChange: boolean
  tripStepEmailLog: { at: string; stepId: string; status: string; to?: string; subject?: string }[]
  fields: Record<string, unknown>
  requestedServices: unknown
}

export function TowAdminEnquiryDetailPage() {
  const id = useMemo(() => {
    const parts = window.location.pathname.replace(/\/+$/, '').split('/')
    return parts[parts.length - 1] || ''
  }, [])
  const [ready, setReady] = useState(false)
  const [enq, setEnq] = useState<Enquiry | null>(null)
  const [linked, setLinked] = useState<{ id: string; account_reference_id?: string; portal_token?: string } | null>(null)
  const [notes, setNotes] = useState('')
  const [amount, setAmount] = useState('')
  const [deposit, setDeposit] = useState('')
  const [paymentRequestMode, setPaymentRequestMode] = useState<PaymentRequestMode>('deposit_20')
  const [depositTouched, setDepositTouched] = useState(false)
  const [paySeg, setPaySeg] = useState<'awaiting_payment' | 'customer_reported' | 'paid_in_full'>('awaiting_payment')
  const [paidVia, setPaidVia] = useState('monzo')
  const [emailReceipt, setEmailReceipt] = useState(true)
  const [emailOnStep, setEmailOnStep] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    const res = await towAdmin<{ enquiry: Enquiry; linkedProfile: typeof linked }>('enquiries_get', { id })
    setEnq(res.enquiry)
    setLinked(res.linkedProfile)
    setNotes(res.enquiry.adminPrivateNotes || '')
    setAmount(res.enquiry.amountDue != null ? String(res.enquiry.amountDue) : '')
    const autoDep = calcDeposit20Eur(res.enquiry.amountDue)
    if (autoDep != null && !depositTouched) setDeposit(String(autoDep))
    setEmailOnStep(res.enquiry.emailTripOnStepChange !== false)
    const ui = res.enquiry.paymentUi
    if (ui === 'customer_reported' || ui === 'paid_in_full' || ui === 'awaiting_payment') setPaySeg(ui)
    if (res.enquiry.paidVia) setPaidVia(res.enquiry.paidVia)
  }

  const setTripStep = async (stepId: string, status: TripStepStatus) => {
    setBusy(true)
    setMsg(null)
    setError(null)
    try {
      const res = await towAdmin<{ stepEmail?: { sent?: boolean; reason?: string } }>('enquiries_patch', {
        id,
        tripStep: { id: stepId, status },
        emailTripOnStepChange: emailOnStep
      })
      if (emailOnStep) {
        setMsg(res.stepEmail?.sent ? 'Step saved and stage email sent.' : `Step saved. Email: ${res.stepEmail?.reason || 'not sent'}`)
      } else {
        setMsg('Step saved (customer email off).')
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Step update failed')
    } finally {
      setBusy(false)
    }
  }

  const toggleStepEmail = async (on: boolean) => {
    setEmailOnStep(on)
    setBusy(true)
    try {
      await towAdmin('enquiries_patch', { id, emailTripOnStepChange: on })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save preference')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    document.title = 'Enquiry · Admin · Golf Sol Ireland'
    let cancelled = false
    void (async () => {
      const ok = await ensureAdminSession(`/admin/enquiries/${id}`)
      if (!ok || cancelled) return
      try {
        await load()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const saveNotes = async () => {
    setBusy(true)
    setMsg(null)
    try {
      await towAdmin('enquiries_patch', { id, adminPrivateNotes: notes, adminStatus: enq?.adminStatus })
      setMsg('Notes saved.')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const savePayment = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await towAdmin<{ receipt?: { ok?: boolean; message?: string } }>('enquiries_patch', {
        id,
        paymentUi: paySeg,
        paidVia: paySeg === 'paid_in_full' ? paidVia : undefined,
        amountDueEur: amount ? Number(amount) : undefined,
        emailReceipt: emailReceipt && paySeg === 'paid_in_full'
      })
      if (emailReceipt && paySeg === 'paid_in_full') {
        setMsg(res.receipt?.message || (res.receipt?.ok === false ? 'Marked paid; receipt email failed.' : 'Marked paid and receipt emailed.'))
      } else {
        setMsg('Payment updated.')
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const tripTotalEur = roundMoney2(amount) ?? (enq?.amountDue ?? 0)

  useEffect(() => {
    if (depositTouched || paymentRequestMode !== 'deposit_20') return
    const auto = calcDeposit20Eur(tripTotalEur)
    if (auto != null) setDeposit(String(auto))
  }, [tripTotalEur, paymentRequestMode, depositTouched])

  const sendDoc = async (kind: 'quote' | 'invoice' | 'receipt') => {
    if (!enq?.email) {
      setError('Enquiry needs an email to send documents.')
      return
    }
    setBusy(true)
    setMsg(null)
    setError(null)
    try {
      const due = new Date()
      due.setDate(due.getDate() + 14)
      const valid = due.toISOString().slice(0, 10)
      const res = await towAdmin<{ message?: string; payUrl?: string; reference?: string }>('send_document', {
        kind,
        enquiryId: id,
        email: enq.email,
        name: enq.name,
        phone: enq.phone,
        amountEur: amount ? Number(amount) : enq.amountDue || 0,
        depositEur: deposit ? Number(deposit) : undefined,
        title:
          kind === 'quote'
            ? 'Trip quote'
            : kind === 'invoice'
              ? paymentRequestMode === 'deposit_20'
                ? 'Deposit invoice (20%)'
                : 'Trip invoice'
              : 'Payment receipt',
        summary: enq.interest || '',
        validUntil: kind === 'quote' ? valid : undefined,
        dueDate: kind === 'invoice' ? valid : undefined,
        paidVia,
        paymentRequestMode,
        invoiceMode: paymentRequestMode === 'deposit_20' ? 'deposit' : 'full'
      })
      setMsg(res.message || `${kind} sent.`)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setBusy(false)
    }
  }

  const saveAmount = async () => {
    setBusy(true)
    try {
      await towAdmin('enquiries_patch', { id, amountDueEur: Number(amount) || 0 })
      setMsg('Amount saved.')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const deleteEnquiry = async () => {
    if (!confirm('Delete this enquiry permanently (GDPR erasure)?')) return
    setBusy(true)
    try {
      await towAdmin('enquiries_delete', { id })
      window.location.href = '/admin'
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
      setBusy(false)
    }
  }

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Loading…</div>
  }
  if (!enq) {
    return (
      <TowAdminShell active="enquiries">
        <p className="text-rose-700">{error || 'Enquiry not found.'}</p>
        <a href="/admin" className="mt-4 inline-block text-gs-green underline">
          ← All enquiries
        </a>
      </TowAdminShell>
    )
  }

  const rows: [string, React.ReactNode][] = [
    ['Reference', <span key="r" className="font-mono">{enq.reference || enq.id.slice(0, 8)}</span>],
    ['Received', `${formatIrishDateTime(enq.createdAt)} (Irish time)`],
    ['Amount due', <span key="a" className="font-bold">{formatEuro(enq.amountDue)}</span>],
    ['Payment', enq.paymentUi.replace(/_/g, ' ')],
    [
      'Form type',
      <span
        key="ft"
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${FORM_TYPE_BADGE_CLASS[enq.formType || ''] || FORM_TYPE_BADGE_CLASS.unknown}`}
      >
        {formTypeLabel(enq.formType, enq.formTypeLabel)}
        {enq.formSourcePage ? ` · ${enq.formSourcePage}` : ''}
      </span>
    ],
    ['Form key', enq.formKey],
    ['Name', enq.name],
    [
      'Email',
      enq.email ? (
        <a key="e" href={`mailto:${enq.email}`} className="text-gs-green underline">
          {enq.email}
        </a>
      ) : (
        '—'
      )
    ],
    ...(enq.phone
      ? ([
          [
            'Phone',
            <a key="p" href={`tel:${enq.phone.replace(/\s/g, '')}`} className="text-gs-green underline">
              {enq.phone}
            </a>
          ]
        ] as [string, React.ReactNode][])
      : []),
    ['What they need', enq.interest || '—']
  ]

  const portalPath = linked?.portal_token ? `/portal/${linked.portal_token}` : null

  return (
    <TowAdminShell active="enquiries">
      <a href="/admin" className="text-sm text-slate-500 hover:text-gs-dark">
        ← All enquiries
      </a>
      <h1 className="mt-2 font-ge text-3xl font-extrabold text-gs-dark">{enq.name}</h1>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-slate-500">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${FORM_TYPE_BADGE_CLASS[enq.formType || ''] || FORM_TYPE_BADGE_CLASS.unknown}`}
        >
          {formTypeLabel(enq.formType, enq.formTypeLabel)}
        </span>
        <span>{enq.formKey}</span>
      </p>
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
      {msg ? <p className="mt-3 text-sm text-emerald-700">{msg}</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <dl className="divide-y divide-slate-100">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr]">
                <dt className="text-sm text-slate-500">{k}</dt>
                <dd className="break-words">{v}</dd>
              </div>
            ))}
          </dl>
          {enq.message ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Message</p>
              <p className="mt-1 whitespace-pre-wrap">{enq.message}</p>
            </div>
          ) : null}
          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <p className="font-ge text-sm font-extrabold text-gs-dark">Client portal</p>
            <p className="mt-1 text-sm text-slate-600">
              Private trip desk link (email + booking reference). No 6-digit code.
            </p>
            {portalPath ? (
              <a href={portalPath} target="_blank" rel="noreferrer" className="mt-2 block break-all text-gs-green underline">
                {portalPath}
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Create a customer record to issue a portal link.</p>
            )}
            {linked?.account_reference_id ? (
              <p className="mt-1 font-mono text-sm text-slate-600">Ref {linked.account_reference_id}</p>
            ) : null}
          </div>

          <div className="mt-6">
            <TripTrackerPanel
              tripTracker={enq.tripTracker || {}}
              emailOnStepChange={emailOnStep}
              emailLog={enq.tripStepEmailLog || []}
              busy={busy}
              onToggleEmail={(on) => void toggleStepEmail(on)}
              onStepChange={(stepId, status) => void setTripStep(stepId, status)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <a
            href={linked ? `/admin/customers/${linked.id}` : '/admin/customers'}
            className="block rounded-xl bg-gs-green px-4 py-3 text-center font-ge font-semibold text-white hover:bg-[#0f4d38]"
          >
            {linked ? 'Open customer record' : 'Create customer record (accounts + payments)'}
          </a>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="font-ge font-extrabold text-gs-dark">Send documents</p>
            <p className="mt-1 text-sm text-slate-500">
              Quote, invoice (Monzo pay page), or receipt — PDF + Golf Sol email. Logged on the customer record.
            </p>
            <div className="mt-3">
              <AdminPaymentRequestModeToggle
                amountReceivedEur={0}
                depositEur={roundMoney2(deposit)}
                idPrefix={`tow-enq-${id}`}
                mode={paymentRequestMode}
                onModeChange={(next) => {
                  setPaymentRequestMode(next)
                  if (next === 'deposit_20' && !depositTouched) {
                    const auto = calcDeposit20Eur(tripTotalEur)
                    if (auto != null) setDeposit(String(auto))
                  }
                }}
                tripTotalEur={tripTotalEur > 0 ? tripTotalEur : null}
              />
            </div>
            {paymentRequestMode === 'deposit_20' ? (
              <label className="mt-3 block text-sm font-semibold text-slate-600">
                Deposit (EUR)
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  inputMode="decimal"
                  onChange={(e) => {
                    setDepositTouched(true)
                    setDeposit(e.target.value)
                  }}
                  value={deposit}
                />
              </label>
            ) : null}
            <div className="mt-3 flex flex-col gap-2">
              {(
                [
                  ['quote', 'Create & send QUOTE'],
                  ['invoice', 'Create & send INVOICE'],
                  ['receipt', 'Send RECEIPT']
                ] as const
              ).map(([kind, label]) => (
                <button
                  key={kind}
                  type="button"
                  disabled={busy || !enq.email}
                  onClick={() => void sendDoc(kind)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
            {!enq.email ? <p className="mt-2 text-xs text-rose-600">Needs an email on the enquiry.</p> : null}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="font-ge text-2xl font-extrabold text-gs-dark">{formatEuro(enq.amountDue)}</p>
            <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-center text-xs font-semibold sm:text-sm">
              {(
                [
                  ['awaiting_payment', 'Awaiting'],
                  ['customer_reported', 'Reported'],
                  ['paid_in_full', 'Paid']
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaySeg(id)}
                  className={`rounded-lg px-2 py-2 ${paySeg === id ? (id === 'awaiting_payment' ? 'bg-amber-400 text-amber-950' : id === 'paid_in_full' ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white') : 'text-slate-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={emailReceipt} onChange={(e) => setEmailReceipt(e.target.checked)} />
              Email receipt when marked Paid
            </label>
            <fieldset className="mt-3">
              <legend className="text-sm font-semibold text-slate-600">Paid via</legend>
              <div className="mt-1 flex flex-wrap gap-3 text-sm">
                {PAID_VIA_OPTIONS.filter((o) => ['monzo', 'revolut', 'bank_transfer'].includes(o.id)).map((o) => (
                  <label key={o.id} className="inline-flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="paidVia"
                      checked={paidVia === o.id}
                      onChange={() => setPaidVia(o.id)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              type="button"
              disabled={busy}
              onClick={() => void savePayment()}
              className="mt-4 w-full rounded-xl bg-gs-dark px-4 py-2.5 font-semibold text-white"
            >
              Save payment
            </button>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <label className="block text-sm font-semibold text-slate-600">Status</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              value={enq.adminStatus}
              onChange={(e) => setEnq({ ...enq, adminStatus: e.target.value })}
            >
              {ENQUIRY_ADMIN_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <label className="mt-3 block text-sm font-semibold text-slate-600">Private notes</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              rows={4}
              placeholder="Call notes, quote sent, next steps…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveNotes()}
              className="mt-3 w-full rounded-xl bg-gs-dark px-4 py-2.5 font-semibold text-white"
            >
              Save notes
            </button>
          </div>

          {enq.email ? (
            <a
              href={`mailto:${enq.email}?subject=${encodeURIComponent(`Your Golf Sol enquiry (${enq.reference || ''})`)}`}
              className="block rounded-xl bg-gs-green px-4 py-3 text-center font-semibold text-white"
            >
              Reply by email
            </a>
          ) : null}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            <p className="font-ge font-extrabold text-gs-dark">GDPR / data requests</p>
            <p className="mt-1">
              For access or erasure requests emailed to info@golfsolirl.com: use Export CSV on the enquiries list for
              a copy of this row’s fields, delete this enquiry here, and also remove any linked portal login / packages
              from Admin → Clients if the person asks for full erasure. Respond within 1 month.
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void deleteEnquiry()}
            className="w-full rounded-xl border border-rose-400 px-4 py-3 font-semibold text-rose-700 hover:bg-rose-50"
          >
            Delete enquiry (GDPR erasure)
          </button>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="font-ge font-extrabold text-gs-dark">Amount on the pay page</p>
            <p className="mt-1 text-sm text-slate-500">Sets what the customer sees as due.</p>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveAmount()}
              className="mt-3 w-full rounded-xl bg-gs-dark px-4 py-2.5 font-semibold text-white"
            >
              Save amount
            </button>
          </div>
        </div>
      </div>
    </TowAdminShell>
  )
}
