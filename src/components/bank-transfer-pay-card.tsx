import { useEffect, useState } from 'react'
import { CLIENT_BANK_HOW_TO_PAY_INTRO } from '../lib/client-enquiry-document'
import { fetchSitePaymentSettings, type SiteBankPaymentSettings } from '../lib/site-payment-settings'
import { useAuth } from '../providers/auth-provider'

export type BankTransferPayEnquiryHint = {
  readonly paymentReference?: string | null
  readonly amountDueEur?: number | null
  readonly outstandingEur?: number | null
}

type BankTransferPayCardProps = {
  readonly audience: 'client' | 'admin'
  readonly enquiryHint?: BankTransferPayEnquiryHint | null
  /** Admin desk can pass loaded settings to avoid duplicate fetch. */
  readonly settingsOverride?: SiteBankPaymentSettings | null
}

export function BankTransferPayCard({ audience, enquiryHint, settingsOverride }: BankTransferPayCardProps) {
  const { session } = useAuth()
  const [settings, setSettings] = useState<SiteBankPaymentSettings | null>(settingsOverride ?? null)
  const [loaded, setLoaded] = useState(Boolean(settingsOverride))
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (settingsOverride !== undefined) {
      setSettings(settingsOverride)
      setLoaded(true)
      return
    }
    let cancelled = false
    void (async () => {
      const token = session?.access_token ?? null
      const next = await fetchSitePaymentSettings(token)
      if (!cancelled) {
        setSettings(next)
        setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session?.access_token, settingsOverride])

  if (!loaded) {
    return null
  }

  if (!settings?.iban?.trim() || !settings.accountName?.trim()) {
    return null
  }

  const details = [
    { label: 'Account name', value: settings.accountName, copy: settings.accountName },
    { label: 'Bank', value: settings.bankName, copy: settings.bankName },
    { label: 'IBAN', value: settings.ibanDisplay || settings.iban, copy: settings.iban },
    { label: 'BIC', value: settings.bic, copy: settings.bic }
  ] as const

  const reference = enquiryHint?.paymentReference?.trim() || null
  const amountDue = enquiryHint?.amountDueEur
  const outstanding = enquiryHint?.outstandingEur

  const formatEur = (n: number) =>
    new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(n)

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600)
    } catch {
      setCopied(null)
    }
  }

  return (
    <section
      aria-labelledby="bank-transfer-pay-heading"
      className="rounded-[2rem] border border-[#d4a843]/45 bg-[#063b2a] p-5 text-white shadow-[0_16px_40px_rgba(6,32,22,0.22)] sm:p-7"
    >
      <p className="font-ge text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f3e6c4]">How to pay</p>
      <h3 className="font-display mt-1 text-xl font-semibold text-white sm:text-2xl" id="bank-transfer-pay-heading">
        Bank transfer in euro
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#f7f3ea]">
        {audience === 'admin'
          ? 'Give guests these details when they want to pay by transfer. Ask them to use the invoice, quote, or booking reference.'
          : CLIENT_BANK_HOW_TO_PAY_INTRO}
      </p>
      {reference || (typeof amountDue === 'number' && amountDue > 0) ? (
        <dl className="mt-4 grid gap-3 rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/10 sm:grid-cols-2">
          {reference ? (
            <div>
              <dt className="font-ge text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f3e6c4]">
                Payment reference
              </dt>
              <dd className="mt-1 flex items-start justify-between gap-3">
                <span className="font-mono text-base font-semibold text-white">{reference}</span>
                <button
                  className="shrink-0 rounded-full border border-[#f3e6c4]/50 px-3 py-1 font-ge text-[11px] font-bold uppercase tracking-[0.12em] text-[#f3e6c4] hover:bg-white/10"
                  onClick={() => void copyValue('Payment reference', reference)}
                  type="button"
                >
                  {copied === 'Payment reference' ? 'Copied' : 'Copy'}
                </button>
              </dd>
            </div>
          ) : null}
          {typeof amountDue === 'number' && amountDue > 0 ? (
            <div>
              <dt className="font-ge text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f3e6c4]">Amount due</dt>
              <dd className="mt-1 font-ge text-base font-semibold text-white">{formatEur(amountDue)}</dd>
            </div>
          ) : null}
          {typeof outstanding === 'number' && outstanding > 0.009 ? (
            <div className="sm:col-span-2">
              <dt className="font-ge text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f3e6c4]">
                Outstanding balance
              </dt>
              <dd className="mt-1 font-ge text-base font-semibold text-[#f3e6c4]">{formatEur(outstanding)}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {details.map((row) => (
          <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10" key={row.label}>
            <dt className="font-ge text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f3e6c4]">{row.label}</dt>
            <dd className="mt-1 flex items-start justify-between gap-3">
              <span className="font-ge text-base font-semibold tracking-wide text-white">{row.value}</span>
              <button
                className="shrink-0 rounded-full border border-[#f3e6c4]/50 px-3 py-1 font-ge text-[11px] font-bold uppercase tracking-[0.12em] text-[#f3e6c4] hover:bg-white/10"
                onClick={() => void copyValue(row.label, row.copy)}
                type="button"
              >
                {copied === row.label ? 'Copied' : 'Copy'}
              </button>
            </dd>
          </div>
        ))}
      </dl>
      {audience === 'client' ? (
        <p className="mt-4 text-sm leading-relaxed text-[#f7f3ea]">
          Card payment stays available on this page when a quote is ready to pay.
        </p>
      ) : null}
    </section>
  )
}