import { useState } from 'react'
import { CLIENT_BANK_HOW_TO_PAY_INTRO, CLIENT_BANK_PAYMENT } from '../lib/client-enquiry-document'

const DETAILS = [
  { label: 'Account name', value: CLIENT_BANK_PAYMENT.accountName, copy: CLIENT_BANK_PAYMENT.accountName },
  { label: 'Bank', value: CLIENT_BANK_PAYMENT.bankName, copy: CLIENT_BANK_PAYMENT.bankName },
  { label: 'IBAN', value: CLIENT_BANK_PAYMENT.ibanDisplay, copy: CLIENT_BANK_PAYMENT.iban },
  { label: 'BIC', value: CLIENT_BANK_PAYMENT.bic, copy: CLIENT_BANK_PAYMENT.bic }
] as const

type BankTransferPayCardProps = {
  readonly audience: 'client' | 'admin'
}

export function BankTransferPayCard({ audience }: BankTransferPayCardProps) {
  const [copied, setCopied] = useState<string | null>(null)

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
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {DETAILS.map((row) => (
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
