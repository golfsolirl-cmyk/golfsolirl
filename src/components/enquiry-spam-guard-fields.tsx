import { useEffect, useState } from 'react'
import {
  ENQUIRY_HONEYPOT_NAME,
  RECAPTCHA_ACTIONS,
  buildSpamGuardPayload,
  readRecaptchaSiteKey,
  type EnquirySpamGuardPayload,
  type RecaptchaAction
} from '../lib/enquiry-spam-guard'

type EnquirySpamGuardFieldsProps = {
  readonly honeypot: string
  readonly onHoneypotChange: (value: string) => void
  /** reCAPTCHA v3 action for this form (executed on submit). */
  readonly action?: RecaptchaAction | string
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

const RECAPTCHA_SRC = (key: string) =>
  `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`

function ensureScript(src: string, id: string): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  const existing = document.getElementById(id)
  if (existing) {
    return new Promise((resolve) => {
      if ((existing as HTMLScriptElement).dataset.loaded === '1') {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
    })
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.id = id
    s.src = src
    s.async = true
    s.onload = () => {
      s.dataset.loaded = '1'
      resolve()
    }
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

async function executeRecaptchaV3(action: string): Promise<string | null> {
  const siteKey = readRecaptchaSiteKey()
  if (!siteKey) return null
  try {
    await ensureScript(RECAPTCHA_SRC(siteKey), 'grecaptcha-v3-script')
    if (!window.grecaptcha) return null
    return await new Promise<string | null>((resolve) => {
      window.grecaptcha?.ready(() => {
        void window.grecaptcha
          ?.execute(siteKey, { action })
          .then((token) => resolve(token))
          .catch(() => resolve(null))
      })
    })
  } catch (err) {
    console.warn('[enquiry-spam] reCAPTCHA execute skipped:', err)
    return null
  }
}

/**
 * Invisible spam fields: honeypot + optional Google reCAPTCHA v3 (no visible challenge).
 */
export function EnquirySpamGuardFields({
  honeypot,
  onHoneypotChange,
  action = RECAPTCHA_ACTIONS.tripQuote
}: EnquirySpamGuardFieldsProps) {
  const siteKey = readRecaptchaSiteKey()

  useEffect(() => {
    if (!siteKey) return
    let cancelled = false
    ;(async () => {
      try {
        await ensureScript(RECAPTCHA_SRC(siteKey), 'grecaptcha-v3-script')
        if (cancelled || !window.grecaptcha) return
        // Warm the script; token is fetched fresh on submit.
        window.grecaptcha.ready(() => {
          void window.grecaptcha?.execute(siteKey, { action }).catch(() => undefined)
        })
      } catch (err) {
        console.warn('[enquiry-spam] reCAPTCHA load skipped:', err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [siteKey, action])

  return (
    <div
      aria-hidden="true"
      className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
      style={{ position: 'absolute', left: '-9999px', height: 1, width: 1, overflow: 'hidden' }}
    >
      <label htmlFor={ENQUIRY_HONEYPOT_NAME}>Company website</label>
      <input
        autoComplete="off"
        id={ENQUIRY_HONEYPOT_NAME}
        name={ENQUIRY_HONEYPOT_NAME}
        onChange={(e) => onHoneypotChange(e.target.value)}
        tabIndex={-1}
        type="text"
        value={honeypot}
      />
    </div>
  )
}

/** Hook-friendly state bundle for forms. */
export function useEnquirySpamGuardState(action: RecaptchaAction | string = RECAPTCHA_ACTIONS.tripQuote) {
  const [honeypot, setHoneypot] = useState('')
  const [formOpenedAt] = useState(() => Date.now())

  const spamGuard = async (): Promise<EnquirySpamGuardPayload> => {
    const recaptchaToken = await executeRecaptchaV3(action)
    return buildSpamGuardPayload({
      honeypot,
      formOpenedAt,
      recaptchaToken,
      recaptchaAction: action
    })
  }

  const fieldsProps = {
    honeypot,
    onHoneypotChange: setHoneypot,
    action
  }

  return { spamGuard, fieldsProps, formOpenedAt, action }
}
