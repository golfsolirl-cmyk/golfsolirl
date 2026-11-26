import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
}

const blank = (v) => (typeof v === 'string' ? v.trim() : '')

const mintToken = () => randomBytes(18).toString('hex')

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 */
const getRow = async (admin) => {
  const { data, error } = await admin.from('site_brand_kit_settings').select('*').eq('id', 1).maybeSingle()
  if (error) {
    throwStatus(error.message, 500)
  }
  return data
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 */
const ensureRow = async (admin) => {
  let row = await getRow(admin)
  if (row) {
    return row
  }
  const token = mintToken()
  const { error } = await admin.from('site_brand_kit_settings').upsert(
    {
      id: 1,
      share_token: token,
      share_enabled: true,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'id' }
  )
  if (error) {
    throwStatus(error.message, 500)
  }
  row = await getRow(admin)
  if (!row) {
    throwStatus('Unable to initialise brand kit settings.', 500)
  }
  return row
}

/**
 * @param {import('node:process').ProcessEnv} env
 * @param {{ method?: string; authHeader?: string; cookieHeader?: string; body?: Record<string, unknown> }} meta
 */
export const handleBrandKit = async (env = process.env, meta = {}) => {
  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Server is not configured.', 500)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const method = meta.method || 'POST'
  const body = meta.body && typeof meta.body === 'object' ? meta.body : {}
  const action = typeof body.action === 'string' ? body.action.trim() : ''

  // Public: validate share token (no admin auth).
  if (method === 'GET' || action === 'public') {
    const shareToken = blank(typeof meta.token === 'string' ? meta.token : '') || blank(typeof body.token === 'string' ? body.token : '')
    if (!shareToken) {
      throwStatus('Share link required.', 401)
    }
    const row = await getRow(admin)
    if (!row?.share_enabled || blank(row.share_token) !== shareToken) {
      throwStatus('This Brand Kit link is invalid or has been turned off.', 403)
    }
    return { ok: true, enabled: true }
  }

  if (method !== 'POST') {
    throwStatus('Method not allowed.', 405)
  }

  const auth = await requireAdminFromBearer(meta.authHeader, env, { cookieHeader: meta.cookieHeader })
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  if (action === 'get' || !action) {
    const row = await ensureRow(admin)
    return {
      ok: true,
      shareToken: blank(row.share_token),
      shareEnabled: Boolean(row.share_enabled),
      sharePath: blank(row.share_token) ? `/brand/${blank(row.share_token)}` : null,
      updatedAt: row.updated_at ?? null
    }
  }

  if (action === 'regenerate') {
    const token = mintToken()
    const { error } = await admin.from('site_brand_kit_settings').upsert(
      {
        id: 1,
        share_token: token,
        share_enabled: true,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    )
    if (error) {
      throwStatus(error.message, 500)
    }
    return {
      ok: true,
      shareToken: token,
      shareEnabled: true,
      sharePath: `/brand/${token}`
    }
  }

  if (action === 'setEnabled') {
    const enabled = Boolean(body.enabled)
    const row = await ensureRow(admin)
    const { error } = await admin
      .from('site_brand_kit_settings')
      .update({ share_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('id', 1)
    if (error) {
      throwStatus(error.message, 500)
    }
    const token = blank(row.share_token)
    return {
      ok: true,
      shareToken: token,
      shareEnabled: enabled,
      sharePath: token ? `/brand/${token}` : null
    }
  }

  throwStatus('Unknown action.', 400)
}
