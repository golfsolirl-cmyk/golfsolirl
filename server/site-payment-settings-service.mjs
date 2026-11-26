import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

const blank = (v) => (typeof v === 'string' ? v.trim() : '')

/** @param {Record<string, unknown> | null | undefined} row */
export const mapSitePaymentSettingsPublic = (row) => {
  if (!row) {
    return null
  }
  const iban = blank(row.monzo_iban)
  const accountName = blank(row.monzo_account_name)
  if (!iban || !accountName) {
    return null
  }
  const ibanDisplay = blank(row.monzo_iban_display) || iban.replace(/(.{4})/g, '$1 ').trim()
  return {
    accountName,
    bankName: blank(row.monzo_bank_name) || 'Monzo Bank',
    iban,
    ibanDisplay,
    bic: blank(row.monzo_bic)
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 */
export const getSitePaymentSettingsRow = async (admin) => {
  const { data, error } = await admin.from('site_payment_settings').select('*').eq('id', 1).maybeSingle()
  if (error) {
    throwStatus(error.message, 500)
  }
  return data
}

/**
 * @param {import('node:process').ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleSitePaymentSettings = async (env = process.env, meta = {}) => {
  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Server is not configured.', 500)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const raw = typeof meta.authHeader === 'string' ? meta.authHeader.trim() : ''
  const token = raw.toLowerCase().startsWith('bearer ') ? raw.slice(7).trim() : ''

  if (meta.method === 'GET') {
    if (!token) {
      throwStatus('Sign in required.', 401)
    }
    const { data: userData, error: userErr } = await admin.auth.getUser(token)
    if (userErr || !userData?.user?.id) {
      throwStatus('Invalid or expired session.', 401)
    }
    const row = await getSitePaymentSettingsRow(admin)
    return { ok: true, settings: mapSitePaymentSettingsPublic(row), configured: Boolean(mapSitePaymentSettingsPublic(row)) }
  }

  if (meta.method !== 'POST') {
    throwStatus('Method not allowed.', 405)
  }

  const auth = await requireAdminFromBearer(meta.authHeader, env, { cookieHeader: meta.cookieHeader })
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const body = meta.body && typeof meta.body === 'object' ? meta.body : {}
  const action = typeof body.action === 'string' ? body.action.trim() : 'update'

  if (action === 'get') {
    const row = await getSitePaymentSettingsRow(admin)
    return {
      ok: true,
      settings: mapSitePaymentSettingsPublic(row),
      raw: {
        monzo_account_name: blank(row?.monzo_account_name),
        monzo_bank_name: blank(row?.monzo_bank_name) || 'Monzo Bank',
        monzo_iban: blank(row?.monzo_iban),
        monzo_bic: blank(row?.monzo_bic),
        monzo_iban_display: blank(row?.monzo_iban_display)
      }
    }
  }

  if (action !== 'update') {
    throwStatus('Unknown action.', 400)
  }

  const patch = {
    monzo_account_name: typeof body.monzoAccountName === 'string' ? body.monzoAccountName.trim() : '',
    monzo_bank_name:
      typeof body.monzoBankName === 'string' && body.monzoBankName.trim() ? body.monzoBankName.trim() : 'Monzo Bank',
    monzo_iban: typeof body.monzoIban === 'string' ? body.monzoIban.replace(/\s+/g, '').trim().toUpperCase() : '',
    monzo_bic: typeof body.monzoBic === 'string' ? body.monzoBic.replace(/\s+/g, '').trim().toUpperCase() : '',
    monzo_iban_display: typeof body.monzoIbanDisplay === 'string' ? body.monzoIbanDisplay.trim() : '',
    updated_at: new Date().toISOString()
  }

  if (patch.monzo_iban && !patch.monzo_iban_display) {
    patch.monzo_iban_display = patch.monzo_iban.replace(/(.{4})/g, '$1 ').trim()
  }

  const { error: uErr } = await admin.from('site_payment_settings').upsert({ id: 1, ...patch }, { onConflict: 'id' })
  if (uErr) {
    throwStatus(uErr.message, 500)
  }

  const row = await getSitePaymentSettingsRow(admin)
  return {
    ok: true,
    settings: mapSitePaymentSettingsPublic(row),
    raw: {
      monzo_account_name: blank(row?.monzo_account_name),
      monzo_bank_name: blank(row?.monzo_bank_name) || 'Monzo Bank',
      monzo_iban: blank(row?.monzo_iban),
      monzo_bic: blank(row?.monzo_bic),
      monzo_iban_display: blank(row?.monzo_iban_display)
    }
  }
}