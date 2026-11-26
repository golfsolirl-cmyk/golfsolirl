import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { Resend } from 'resend'
import {
  buildLeanTransactionalEmailHtml,
  finalizeGsolEmailHtml
} from './email-layout.mjs'
import { loadSitePaymentForEmail, paymentBlockFromSettings } from './load-site-payment-for-email.mjs'
import { resolveResendToAddress, resendSandboxRecipientHint } from './resend-delivery-email.mjs'
import { buildWebsiteQuotePdfBytes } from './website-quote-pdf.mjs'
import { getGsolSiteUrl } from './site-url.mjs'

const fmtEur = (n) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(Number(n) || 0)

/**
 * Admin saves a website-form quote → lean branded email + PDF + Monzo block.
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
  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!supabaseUrl || !serviceKey) {
    const err = new Error('Supabase is not configured on the server.')
    err.statusCode = 500
    throw err
  }
  if (!resendKey || !fromEmail) {
    const err = new Error('Resend is not configured.')
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
  const first = String(clientProfile.full_name || 'there').trim().split(/\s+/)[0] || 'there'
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
  const bank = await loadSitePaymentForEmail(env)
  const payment = paymentBlockFromSettings(bank, {
    paymentReference: ref,
    amountDueEur: Number.isFinite(dep) && dep > 0 ? dep : Number.isFinite(gross) ? gross : null
  })
  const site = getGsolSiteUrl().replace(/\/+$/, '')

  const subject = `Your Golf Sol Ireland quote — ${ref}`
  const html = finalizeGsolEmailHtml(
    buildLeanTransactionalEmailHtml({
      documentTitle: subject,
      preheader: `Your quote ${ref} · ${fmtEur(gross)} total.`,
      kicker: `Quote · ${ref}`,
      title: `Your quote is ready, ${first}.`,
      lead: 'A PDF is attached. Pay the deposit by bank transfer using the reference below, or open your trip desk.',
      rows: [
        ['Total (incl. Irish VAT)', fmtEur(gross)],
        ['Deposit due', fmtEur(dep)],
        ['Balance', fmtEur(bal)],
        ['Reference', ref]
      ],
      payment,
      cta: { href: `${site}/dashboard`, label: 'Open your trip desk' }
    })
  )

  const to = resolveResendToAddress(clientEmail, env)
  const resend = new Resend(resendKey)
  const { error: sendErr } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject,
    html,
    attachments: [
      {
        filename,
        content: Buffer.from(pdfBytes).toString('base64'),
        contentType: 'application/pdf'
      }
    ]
  })
  if (sendErr) {
    const hint = resendSandboxRecipientHint(fromEmail, to)
    const err = new Error(sendErr.message + (hint ? ` ${hint}` : ''))
    err.statusCode = 502
    throw err
  }

  return { ok: true, to, subject, reference: ref }
}
