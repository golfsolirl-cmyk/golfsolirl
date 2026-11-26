/**
 * Load Monzo / site payment settings for transactional emails (service role).
 * Returns null when unset so callers can omit the bank block.
 */
import { createClient } from '@supabase/supabase-js'
import { mapSitePaymentSettingsPublic } from './site-payment-settings-service.mjs'
import { formatIbanGroupsOf4 } from '../shared/format-iban.mjs'

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {Promise<{
 *   accountName: string
 *   bankName: string
 *   iban: string
 *   ibanDisplay: string
 *   bic: string
 * } | null>}
 */
export const loadSitePaymentForEmail = async (env = process.env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  try {
    const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data, error } = await admin.from('site_payment_settings').select('*').eq('id', 1).maybeSingle()
    if (error || !data) return null
    const mapped = mapSitePaymentSettingsPublic(data)
    if (!mapped) return null
    return {
      ...mapped,
      ibanDisplay: mapped.ibanDisplay || formatIbanGroupsOf4(mapped.iban)
    }
  } catch (err) {
    console.warn('[load-site-payment-for-email]', err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * @param {Awaited<ReturnType<typeof loadSitePaymentForEmail>>} settings
 * @param {{ paymentReference?: string | null, amountDueEur?: number | null }} [hint]
 */
export const paymentBlockFromSettings = (settings, hint = {}) => {
  if (!settings) return null
  const amount =
    typeof hint.amountDueEur === 'number' && Number.isFinite(hint.amountDueEur) && hint.amountDueEur > 0
      ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(hint.amountDueEur)
      : null
  return {
    accountName: settings.accountName,
    bankName: settings.bankName,
    iban: settings.iban,
    ibanDisplay: settings.ibanDisplay,
    bic: settings.bic,
    paymentReference: hint.paymentReference ?? null,
    amountDueLabel: amount
  }
}
