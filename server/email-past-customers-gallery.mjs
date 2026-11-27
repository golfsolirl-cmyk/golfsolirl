/**
 * Email-safe Past Customers Gallery — curated real trip photos from
 * `public/images/customer-trips/` (captions/alt match `src/data/customer-trip-photos.ts`).
 */
import { getGsolSiteUrl } from './site-url.mjs'

/** Keep in sync with `CUSTOMER_TRIP_PHOTOS` in `src/data/customer-trip-photos.ts`. */
export const EMAIL_PAST_CUSTOMER_PHOTOS = Object.freeze([
  {
    src: '/images/customer-trips/la-reserva-group.jpg',
    caption: 'La Reserva Club',
    alt: 'An Irish golf group beside the white van at La Reserva Club.'
  },
  {
    src: '/images/customer-trips/bags-at-the-kerb.jpg',
    caption: 'Bags at the kerb',
    alt: 'Three golfers with travel bags beside the Golf Sol van on a Costa del Sol street.'
  },
  {
    src: '/images/customer-trips/sotogrande.jpg',
    caption: 'Sotogrande',
    alt: 'The white Sotogrande hotel entrance under a clear blue sky.'
  },
  {
    src: '/images/customer-trips/sunset-bag-drop.jpg',
    caption: 'Last light drop-off',
    alt: 'Golfers unloading bags from the van beside a clubhouse at sunset.'
  }
])

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const siteOrigin = () => getGsolSiteUrl().replace(/\/+$/, '')

const photoUrl = (src) => {
  const path = String(src || '')
  if (/^https?:\/\//i.test(path)) return path
  return `${siteOrigin()}${path.startsWith('/') ? path : `/${path}`}`
}

const galleryHref = () => `${siteOrigin()}/#past-customers`

/**
 * Plain-text mention for multipart / text-only sends.
 */
export const pastCustomersGalleryPlainText = () => {
  const lines = EMAIL_PAST_CUSTOMER_PHOTOS.map((p) => `• ${p.caption}`)
  return [
    'Past customers on tour',
    'Real Golf Sol Ireland groups on the Costa del Sol:',
    ...lines,
    `See more trip photos: ${galleryHref()}`
  ].join('\n')
}

/**
 * Table-based 2×2 gallery for Gmail / Apple Mail / Outlook / iOS Mail.
 * @param {{
 *   fontFamily?: string
 *   forest?: string
 *   cream?: string
 *   gold?: string
 *   muted?: string
 *   ink?: string
 *   border?: string
 *   card?: string
 * }} [theme]
 */
export const buildPastCustomersGalleryHtml = (theme = {}) => {
  const font =
    theme.fontFamily ||
    "'Open Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
  const forest = theme.forest || '#0B3D2E'
  const forestDeep = theme.forestDeep || '#0A2E23'
  const cream = theme.cream || '#F5F0E6'
  const gold = theme.gold || '#D4A843'
  const muted = theme.muted || '#5a6b62'
  const ink = theme.ink || '#16231d'
  const border = theme.border || '#e3ebe6'
  const card = theme.card || '#ffffff'
  const moreHref = escapeHtml(galleryHref())

  const cells = EMAIL_PAST_CUSTOMER_PHOTOS.map((photo) => {
    const src = escapeHtml(photoUrl(photo.src))
    const alt = escapeHtml(photo.alt)
    const caption = escapeHtml(photo.caption)
    return `
<td class="pcg-cell" width="50%" valign="top" style="width:50%;padding:6px;vertical-align:top;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:${card};border:1px solid ${border};border-radius:14px;overflow:hidden;">
    <tr>
      <td style="line-height:0;font-size:0;background:${forestDeep};">
        <a href="${moreHref}" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none;">
          <img src="${src}" width="268" height="168" alt="${alt}" style="display:block;width:100%;max-width:100%;height:168px;object-fit:cover;border:0;outline:none;">
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:10px 12px 12px;background:${cream};">
        <p style="margin:0;font-family:${font};font-size:12px;line-height:16px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${forest};">${caption}</p>
      </td>
    </tr>
  </table>
</td>`
  })

  const row1 = `<tr>${cells[0]}${cells[1]}</tr>`
  const row2 = `<tr>${cells[2]}${cells[3]}</tr>`

  return `
<table role="presentation" class="pcg-wrap" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;margin:0;background:${cream};border:1px solid ${border};border-radius:16px;overflow:hidden;">
  <tr>
    <td style="height:4px;line-height:4px;font-size:0;background:${gold};">&nbsp;</td>
  </tr>
  <tr>
    <td style="padding:22px 20px 8px;background:${cream};">
      <p style="margin:0;font-family:${font};font-size:12px;line-height:16px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${forest};">Past customers on tour</p>
      <p style="margin:10px 0 0;font-family:${font};font-size:20px;line-height:26px;font-weight:800;letter-spacing:-0.02em;color:${ink};">Recent Golf Sol Ireland trips</p>
      <p style="margin:8px 0 0;font-family:${font};font-size:14px;line-height:20px;color:${muted};">Real groups on the Costa del Sol — vans, hotels, and courses.</p>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 14px 8px;background:${cream};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
        ${row1}
        ${row2}
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:8px 20px 22px;background:${cream};">
      <a href="${moreHref}" target="_blank" rel="noopener noreferrer" style="display:inline-block;font-family:${font};font-size:14px;line-height:20px;font-weight:700;color:${forest};text-decoration:underline;text-underline-offset:3px;">View more past-customer photos →</a>
    </td>
  </tr>
</table>`
}
