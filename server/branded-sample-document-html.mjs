import { buildBrandedTransactionalEmailHtml, emailFonts, gs } from './branded-email-shell.mjs'

/**
 * Full HTML using the same shell as `enquiry-customer` / transactional email — for browser preview
 * (use Print → Save as PDF) or side-by-side layout checks.
 */
export const getBrandedSampleDocumentPreviewHtml = () => {
  const row = (label, value) =>
    `<tr>
      <td style="padding:14px 18px;font-family:${emailFonts.sans};font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${gs.green};width:38%;border-bottom:1px solid rgba(6,59,42,0.1);vertical-align:top;">${label}</td>
      <td style="padding:14px 18px;font-family:${emailFonts.sans};font-size:16px;font-weight:700;color:${gs.text};border-bottom:1px solid rgba(6,59,42,0.1);vertical-align:top;">${value}</td>
    </tr>`

  const mainCardInnerHtml = `
    <p style="margin:0;font-family:${emailFonts.sans};font-size:11px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:${gs.green};">Sample document</p>
    <h2 class="section-title" style="margin:12px 0 8px 0;font-family:${emailFonts.sans};color:${gs.text};font-size:32px;line-height:1.12;letter-spacing:-0.03em;font-weight:800;">Invoice-style preview</h2>
    <p style="margin:0 0 24px 0;font-family:${emailFonts.sans};color:${gs.muted};font-size:16px;line-height:1.65;max-width:520px;">Fictional line items for layout review. The header, cards, fleet band, and footer match every Resend email sent from this codebase.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(13,61,46,0.12);border-radius:20px;overflow:hidden;margin-bottom:20px;">
      <tr style="background:${gs.rowA};">
        ${row('Reference', 'SAMPLE-INV-2026-001')}
      </tr>
      <tr style="background:#fff;">
        ${row('Bill to', 'Sample Society · Dublin')}
      </tr>
      <tr style="background:${gs.rowA};">
        ${row('Service', 'Private Malaga Airport transfer (V-Class) — golf bags')}
      </tr>
      <tr style="background:#fff;">
        ${row('Amount (sample)', '€180.00')}
      </tr>
    </table>
    <p style="margin:0;font-family:${emailFonts.sans};font-size:13px;line-height:1.6;color:${gs.muted};">No payment is due. This file exists only to prove PDF/print and email chrome stay aligned with the <code style="font-size:12px;background:${gs.rowA};padding:2px 6px;border-radius:6px;">enquiry-customer</code> template.</p>`

  return buildBrandedTransactionalEmailHtml({
    documentTitle: 'Sample invoice layout · Golf Sol Ireland',
    preheader: 'Sample only — not a real invoice. Same shell as all Golf Sol Ireland emails.',
    heroKicker: 'Layout sample',
    heroTitle: 'Branded document preview',
    heroLead:
      'Open in your browser, then use Print → Save as PDF. Colours, typography, and section rhythm match the enquiry confirmation email family.',
    heroMetaHtml: `<p style="margin:0;"><strong>Reference</strong> · SAMPLE-INV-2026-001</p><p style="margin:8px 0 0 0;">Not legally binding</p>`,
    mainCardInnerHtml,
    footerDisclaimerHtml:
      'Sample document for brand and layout review only. Not an invoice, quote, or contract. If you did not open this on purpose, you can ignore it.'
  })
}
