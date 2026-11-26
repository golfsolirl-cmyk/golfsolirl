import { useCallback, useEffect, useState } from 'react'
import { Hourglass } from 'lucide-react'

type AwaitingRow = {
  id: string
  reference_id: string
  full_name: string
  email: string
  amount_due_eur: number | null
  deposit_eur: number | null
  amount_received_eur: number | null
  payment_reference: string | null
  created_at: string
}

type AdminAwaitingBankPaymentsPanelProps = {
  readonly accessToken: string | null
  readonly onOpenReference?: (referenceId: string) => void
}

const formatEur = (n: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(n)

export function AdminAwaitingBankPaymentsPanel({ accessToken, onOpenReference }: AdminAwaitingBankPaymentsPanelProps) {
  const [items, setItems] = useState<AwaitingRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) {
      setError('Sign in as admin to load awaiting bank transfers.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/enquiry-payment-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ action: 'list_awaiting', limit: 40 })
      })
      const data = (await res.json().catch(() => ({}))) as { items?: AwaitingRow[]; message?: string }
      if (!res.ok) {
        throw new Error(data.message || 'Unable to load queue.')
      }
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load queue.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section className="rounded-2xl border border-forest-100 bg-offwhite/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-900 text-white">
            <Hourglass aria-hidden className="h-4 w-4" />
          </span>
          <div>
            <h4 className="font-display text-lg font-semibold text-forest-950">Awaiting bank transfer</h4>
            <p className="text-sm text-forest-600">Enquiries with payment status awaiting_payment.</p>
          </div>
        </div>
        <button
          className="rounded-full border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-900 hover:bg-cream"
          disabled={loading}
          onClick={() => void load()}
          type="button"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {items.length === 0 && !loading ? (
        <p className="mt-4 text-sm text-forest-700">No enquiries are waiting on a manual transfer right now.</p>
      ) : (
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {items.map((row) => {
            const received = Number(row.amount_received_eur) || 0
            const due = row.amount_due_eur != null ? Number(row.amount_due_eur) : null
            const outstanding = due != null ? Math.max(0, due - received) : null
            return (
              <li className="rounded-xl border border-forest-100 bg-white px-3 py-2.5 text-sm" key={row.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    className="font-mono text-xs font-semibold text-brand-700 underline-offset-2 hover:underline"
                    onClick={() => onOpenReference?.(row.reference_id)}
                    type="button"
                  >
                    {row.reference_id}
                  </button>
                  <span className="text-xs text-forest-600">{row.full_name}</span>
                </div>
                <p className="mt-1 text-xs text-forest-700">
                  {due != null && due > 0 ? `Due ${formatEur(due)}` : 'No amount due set'}
                  {outstanding != null && outstanding > 0 ? ` · Outstanding ${formatEur(outstanding)}` : ''}
                  {row.payment_reference?.trim() ? ` · Ref ${row.payment_reference.trim()}` : ''}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}