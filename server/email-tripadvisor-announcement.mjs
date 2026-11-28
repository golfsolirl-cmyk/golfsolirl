/**
 * Customer-facing Tripadvisor “now live” card for transactional emails.
 * Shown with the Past Customers Gallery (admin/ops mail opts out via
 * includePastCustomersGallery: false). No invented ratings or review counts.
 */
import {
  resolveTripadvisorUrlsFromEnv
} from '../shared/tripadvisor-url.mjs'
import { getGsolSiteUrl } from './site-url.mjs'

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const siteOrigin = () => getGsolSiteUrl().replace(/\/+$/, '')

/** Hosted owl mark (PNG) — SVG is unreliable in Gmail. */
const owlMarkUrl = () => `${siteOrigin()}/images/tripadvisor-owl.png`

/**
 * Plain-text lines for multipart / text-only customer emails.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [env]
 */
export const tripadvisorAnnouncementPlainText = (env = process.env) => {
  const { listingUrl, writeReviewUrl } = resolveTripadvisorUrlsFromEnv(env)
  return [
    'Golf Sol Ireland is now on Tripadvisor.',
    `See our listing: ${listingUrl}`,
    `Travelled with us? Leave a review: ${writeReviewUrl}`
  ].join('\n')
}

/**
 * Cream/gold table card — email-client-safe inline styles.
 * @param {{
 *   fontFamily?: string
 *   forest?: string
 *   cream?: string
 *   gold?: string
 *   muted?: string
 *   ink?: string
 *   border?: string
 *   card?: string
 *   env?: NodeJS.ProcessEnv | Record<string, string | undefined>
 * }} [theme]
 */
export const buildTripadvisorAnnouncementHtml = (theme = {}) => {
  const font =
    theme.fontFamily ||
    "'Open Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
  const forest = theme.forest || '#0B3D2E'
  const cream = theme.cream || '#F5F0E6'
  const gold = theme.gold || '#D4A843'
  const muted = theme.muted || '#5a6b62'
  const ink = theme.ink || '#16231d'
  const border = theme.border || '#e3ebe6'
  const card = theme.card || '#ffffff'
  const taGreen = '#34E0A1'

  const { listingUrl, writeReviewUrl } = resolveTripadvisorUrlsFromEnv(theme.env || process.env)
  const listing = escapeHtml(listingUrl)
  const write = escapeHtml(writeReviewUrl)
  const owl = escapeHtml(owlMarkUrl())

  return `
<table role="presentation" class="gsol-ta-announce" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;margin:0;background:${cream};border:1px solid ${border};border-radius:16px;overflow:hidden;">
  <tr>
    <td style="height:4px;line-height:4px;font-size:0;background:${gold};">&nbsp;</td>
  </tr>
  <tr>
    <td style="padding:20px 20px 8px;background:${cream};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td width="44" valign="top" style="width:44px;padding:0 12px 0 0;vertical-align:top;">
            <img src="${owl}" width="40" height="40" alt="Tripadvisor" style="display:block;width:40px;height:40px;border:0;outline:none;">
          </td>
          <td valign="middle" style="vertical-align:middle;">
            <p style="margin:0;font-family:${font};font-size:12px;line-height:16px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${forest};">We're now on Tripadvisor</p>
            <p style="margin:8px 0 0;font-family:${font};font-size:17px;line-height:24px;font-weight:800;letter-spacing:-0.01em;color:${ink};">Golf Sol Ireland is now on Tripadvisor</p>
          </td>
        </tr>
      </table>
      <p style="margin:12px 0 0;font-family:${font};font-size:14px;line-height:20px;color:${muted};">Honest feedback from Irish golfers helps the next group travel with confidence.</p>
    </td>
  </tr>
  <tr>
    <td style="padding:4px 20px 20px;background:${cream};">
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:0 10px 8px 0;">
            <a href="${listing}" target="_blank" rel="noopener noreferrer" style="display:inline-block;font-family:${font};font-size:14px;line-height:20px;font-weight:700;color:${forest};text-decoration:underline;text-underline-offset:3px;">See our listing</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0;">
            <a href="${write}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 16px;font-family:${font};font-size:14px;line-height:20px;font-weight:700;color:${ink};text-decoration:none;background:${taGreen};border-radius:10px;">Travelled with us? Leave a review</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}
