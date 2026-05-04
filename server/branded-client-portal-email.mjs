import { buildGsolTransactionalEmail, getGsolSiteUrl } from './email-layout.mjs'

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

/**
 * Branded transactional shell for admin → client portal messages (matches enquiry / proposal family).
 * @param {{
 *   subject: string
 *   greetingName: string
 *   bodyParagraphs: string[]
 *   ctaHref: string
 *   ctaLabel: string
 * }} opts — pass plain text; paragraphs are escaped and wrapped.
 */
export const buildBrandedClientPortalEmailHtml = ({ subject, greetingName, bodyParagraphs, ctaHref, ctaLabel }) => {
  const site = getGsolSiteUrl()
  const safeSubject = escapeHtml(subject)
  const safeName = escapeHtml(greetingName || 'there')
  const paragraphsHtml = bodyParagraphs
    .map((p) => `<p style="margin:0 0 16px 0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.75;color:#374151;">${escapeHtml(p)}</p>`)
    .join('')

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:0 0 8px 0;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.75;color:#374151;">Hi ${safeName},</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 22px 0;">
          ${paragraphsHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 28px 0;">
          <a href="${escapeHtml(ctaHref)}" style="display:inline-block;background:#dc5801;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px;font-family:'DM Sans',Arial,sans-serif;">${escapeHtml(ctaLabel)}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:0;border-radius:18px;background:#f7faf6;border:1px solid #dfe7db;">
          <p style="margin:0;padding:16px 18px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.65;color:#4b5e49;">
            <strong style="color:#163a13;">Tip:</strong> Sign in to your <a href="${escapeHtml(`${site}/dashboard`)}" style="color:#2d6a4a;font-weight:600;">client dashboard</a> to see packages we publish for you, form submissions linked to your account, and any formal proposals.
          </p>
        </td>
      </tr>
    </table>`

  const raw = buildGsolTransactionalEmail({
    documentTitle: safeSubject,
    preheader: 'A message from Golf Sol Ireland is waiting in your client area.',
    heroKicker: 'Client portal',
    heroTitle: safeSubject,
    heroLead: 'We have prepared an update for your Costa del Sol golf trip — details are below, with any files attached to this email.',
    heroMetaHtml: `
      <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong style="font-weight:700;">From:</strong> Golf Sol Ireland</p>
      <p style="margin:8px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);"><strong style="font-weight:700;">Replies</strong> go to our team inbox.</p>`,
    bodyHtml
  })

  return raw
}

/**
 * Admin grants terms / welcome PDF access — same transactional shell as enquiry mail.
 * @param {{ greetingName: string; docTitle: string; documentUrl: string }} opts — documentUrl should be magic-link style sign-in URL.
 */
export const buildBrandedClientDocumentInviteEmailHtml = ({ greetingName, docTitle, documentUrl }) => {
  const site = getGsolSiteUrl()
  const safeName = escapeHtml(greetingName || 'there')
  const safeTitle = escapeHtml(docTitle)
  const safeUrl = escapeHtml(documentUrl)

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:0 0 8px 0;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.75;color:#374151;">Hi ${safeName},</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 18px 0;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.75;color:#374151;">
            We have shared <strong style="color:#163a13;">${safeTitle}</strong> with your Golf Sol Ireland client account. Sign in once to open the document page and save a print-ready PDF anytime.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 28px 0;">
          <a href="${safeUrl}" style="display:inline-block;background:#dc5801;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px;font-family:'DM Sans',Arial,sans-serif;">Open your client area</a>
        </td>
      </tr>
      <tr>
        <td style="padding:0;border-radius:18px;background:#f7faf6;border:1px solid #dfe7db;">
          <p style="margin:0;padding:16px 18px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.65;color:#4b5e49;">
            <strong style="color:#163a13;">Link not working?</strong> Copy and paste this URL into your browser:<br />
            <span style="word-break:break-all;color:#2d6a4a;">${safeUrl}</span>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 0 0 0;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.65;color:#4b5e49;">
            After sign-in you can also open your <a href="${escapeHtml(`${site}/dashboard`)}" style="color:#2d6a4a;font-weight:600;">full dashboard</a> for packages and proposals.
          </p>
        </td>
      </tr>
    </table>`

  return buildGsolTransactionalEmail({
    documentTitle: `${docTitle} — Golf Sol Ireland`,
    preheader: `${docTitle} is ready when you sign in to your client area.`,
    heroKicker: 'Your account',
    heroTitle: safeTitle,
    heroLead:
      'We have enabled this document on your profile. One secure sign-in opens the reader-friendly page on golfsolirl.com — same premium layout family as our enquiry confirmations.',
    heroMetaHtml: `
      <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong style="font-weight:700;">Document:</strong> ${safeTitle}</p>
      <p style="margin:8px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);"><strong style="font-weight:700;">Support</strong> — reply to this email if you need help.</p>`,
    bodyHtml
  })
}

/**
 * Admin sends formal proposal PDF — same transactional shell + attachment in send call.
 */
export const buildBrandedProposalAttachedEmailHtml = ({ greetingName, proposalId, dashboardLoginUrl }) => {
  const site = getGsolSiteUrl()
  const safeName = escapeHtml(greetingName || 'there')
  const safeId = escapeHtml(proposalId)
  const safeLogin = escapeHtml(dashboardLoginUrl)

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:0 0 8px 0;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.75;color:#374151;">Hi ${safeName},</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 18px 0;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.75;color:#374151;">
            Your formal package proposal <strong style="color:#163a13;font-family:ui-monospace,Menlo,monospace;">${safeId}</strong> is attached as a PDF (Costa del Sol layout, same visual family as our site). Open on a desktop or tablet for the best read.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 18px 0;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.75;color:#374151;">
            After you sign in, the same proposal also appears under <strong>Proposals &amp; PDFs</strong> on your dashboard whenever we have enabled that area for your account.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 28px 0;">
          <a href="${safeLogin}" style="display:inline-block;background:#dc5801;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px;font-family:'DM Sans',Arial,sans-serif;">Open client dashboard</a>
        </td>
      </tr>
      <tr>
        <td style="padding:0;border-radius:18px;background:#f7faf6;border:1px solid #dfe7db;">
          <p style="margin:0;padding:16px 18px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.65;color:#4b5e49;">
            <strong style="color:#163a13;">Prefer to tweak something?</strong> Reply to this email with dates, courses, rooming, or budget — we will refine the proposal and re-issue if needed.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 0 0 0;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.65;color:#4b5e49;">
            Dashboard: <a href="${escapeHtml(`${site}/dashboard`)}" style="color:#2d6a4a;font-weight:600;">${escapeHtml(`${site}/dashboard`)}</a>
          </p>
        </td>
      </tr>
    </table>`

  return buildGsolTransactionalEmail({
    documentTitle: `Proposal ${proposalId} — Golf Sol Ireland`,
    preheader: `Your Costa del Sol proposal ${proposalId} is attached as a PDF.`,
    heroKicker: 'Formal proposal',
    heroTitle: 'Your proposal is ready',
    heroLead: `Proposal ${proposalId} is attached. Everything below matches the same premium email system we use for enquiries — shamrock hero, forest palette, and print-ready PDF quality.`,
    heroMetaHtml: `
      <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong style="font-weight:700;">Reference:</strong> ${safeId}</p>
      <p style="margin:8px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);"><strong style="font-weight:700;">Golf Sol Ireland</strong> — Costa del Sol golf travel for Irish groups.</p>`,
    bodyHtml
  })
}

/**
 * Passwordless dashboard link — same `buildGsolTransactionalEmail` shell as proposals / portal messages
 * (finalize + CID images at send time).
 * @param {{ actionLink: string; email: string; requestedAtDisplay: string }} opts
 */
export const buildBrandedPortalMagicLinkEmailHtml = ({ actionLink, email, requestedAtDisplay }) => {
  const safeLink = escapeHtml(actionLink)
  const safeEmail = escapeHtml(email)
  const safeWhen = escapeHtml(requestedAtDisplay)
  const emailCell = `<span style="color:#374151;font-weight:700;">${safeEmail}</span>`

  const bodyHtml = `
<tr>
  <td style="padding:36px 40px 44px 40px;" class="p-m">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:0 0 10px 0;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.75;color:#374151;">Hi,</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 20px 0;">
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:16px;line-height:1.65;color:#374151;">
            Tap the button below to open your Golf Sol Ireland client area — passwordless sign-in, same layout family as our proposal and enquiry emails.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 16px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #dfe7db;border-radius:18px;overflow:hidden;">
            <tr style="background:#ffffff;">
              <td style="padding:12px 16px;font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#66736d;width:34%;vertical-align:top;">Signing in as</td>
              <td style="padding:12px 16px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;vertical-align:top;">${emailCell}</td>
            </tr>
            <tr style="background:#f7faf6;">
              <td style="padding:12px 16px;font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#66736d;vertical-align:top;">Method</td>
              <td style="padding:12px 16px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;vertical-align:top;">${escapeHtml('Secure magic link (no password)')}</td>
            </tr>
            <tr style="background:#ffffff;">
              <td style="padding:12px 16px;font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#66736d;vertical-align:top;">Requested</td>
              <td style="padding:12px 16px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;vertical-align:top;">${safeWhen}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 28px 0;">
          <a href="${safeLink}" style="display:inline-block;background:#dc5801;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px;font-family:'DM Sans',Arial,sans-serif;">Sign in to Golf Sol Ireland</a>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 16px 0;border-radius:18px;background:#f7faf6;border:1px solid #dfe7db;">
          <p style="margin:0;padding:16px 18px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.65;color:#4b5e49;">
            <strong style="color:#163a13;">Button not working?</strong><br />
            <span style="word-break:break-all;color:#2d6a4a;">${safeLink}</span>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0;border-radius:18px;background:#fff9ea;border:1px solid #e9d9b6;">
          <p style="margin:0;padding:16px 18px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.65;color:#4b5e49;">
            <strong style="color:#92400e;">Security:</strong> Do not forward this email. The link expires after a short time. If you did not request access, you can ignore this message.
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>`

  return buildGsolTransactionalEmail({
    documentTitle: 'Sign in to Golf Sol Ireland',
    preheader: `Passwordless sign-in for ${safeEmail}. Use the button in this email — link expires shortly.`,
    heroKicker: 'Client portal',
    heroTitle: 'Your secure sign-in link',
    heroLead:
      'Open your dashboard with one tap — same premium Golf Sol Ireland email shell as proposals, terms access, and package updates.',
    heroMetaHtml: `
      <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);"><strong style="font-weight:700;">Magic link only</strong> — we never email passwords.</p>
      <p style="margin:8px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.82);"><strong style="font-weight:700;">Need help?</strong> Reply to this message.</p>`,
    bodyHtml
  })
}
