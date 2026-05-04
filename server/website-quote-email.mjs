import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { handleSendClientPortalEmail } from './client-portal-email-service.mjs'
import { buildWebsiteQuotePdfBytes } from './website-quote-pdf.mjs'

const fmtEur = (n) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(
    Number(n) || 0
  )

/**
 * Admin saves a website-form quote → email client branded message + PDF attachment (reuses portal email pipeline).
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleSendWebsiteQuoteEmail = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    const err = new Error(auth.message)
    err.statusCode = auth.statusCode
    throw err
  }

  const supabaseUrl = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!supabaseUrl || !serviceKey) {
    const err = new Error('Supabase is not configured on the server.')
    err.statusCode = 500
    throw err
  }

  const packageBuildId = typeof body?.packageBuildId === 'string' ? body.packageBuildId.trim() : ''
  if (!packageBuildId) {
    const err = new Error('packageBuildId is required.')
    err.statusCode = 400
    throw err
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data: build, error: buildErr } = await supabase
    .from('package_builds')
    .select('id, owner_id, label, config, source')
    .eq('id', packageBuildId)
    .maybeSingle()

  if (buildErr || !build) {
    const err = new Error(buildErr?.message ?? 'Package build not found.')
    err.statusCode = 404
    throw err
  }

  if (build.source !== 'website_form') {
    const err = new Error('Only website form package rows can use this quote email.')
    err.statusCode = 400
    throw err
  }

  const cfg = build.config
  if (!cfg || typeof cfg !== 'object' || cfg.version !== 3 || !cfg.adminQuote) {
    const err = new Error('Save a quote on this build before sending the email.')
    err.statusCode = 400
    throw err
  }

  const { data: clientProfile, error: profErr } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', build.owner_id)
    .maybeSingle()

  if (profErr || !clientProfile?.email?.trim()) {
    const err = new Error('Client profile has no email on file.')
    err.statusCode = 400
    throw err
  }

  const clientEmail = clientProfile.email.trim().toLowerCase()
  const ref =
    typeof cfg.enquiryReferenceId === 'string' && cfg.enquiryReferenceId.trim()
      ? cfg.enquiryReferenceId.trim()
      : build.id.slice(0, 12)

  const gross = Number(cfg.adminQuote.grossTotalEur)
  const dep = Number(cfg.adminQuote.deposit20Eur)
  const bal = Number(cfg.adminQuote.balance80Eur)

  const pdfBytes = await buildWebsiteQuotePdfBytes({
    label: typeof build.label === 'string' ? build.label : null,
    config: /** @type {Record<string, unknown>} */ (cfg)
  })

  const filename = `golf-sol-quote-${ref.replace(/[^\w.-]+/g, '-')}.pdf`
  const contentBase64 = Buffer.from(pdfBytes).toString('base64')

  const subject = `Your Golf Sol Ireland quote — ${ref}`

  const message = [
    `Your trip is quoted under reference ${ref}.`,
    '',
    `Total (including Irish VAT): ${fmtEur(gross)}. Deposit due: ${fmtEur(dep)}. Remaining balance: ${fmtEur(bal)}.`,
    '',
    'A PDF quote is attached to this email. You can also open your client dashboard for the full interactive view and another PDF download if you need it.'
  ].join('\n')

  return handleSendClientPortalEmail(
    {
      clientEmail,
      subject,
      message,
      attachments: [{ filename, contentBase64, contentType: 'application/pdf' }]
    },
    env,
    meta
  )
}
