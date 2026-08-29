/**
 * Strip dangerous markup from Gmail HTML before admin rendering.
 * Not a full HTML parser — blocks the common XSS vectors in email.
 */

const SCRIPT_RE = /<script\b[\s\S]*?<\/script>/gi
const STYLE_RE = /<style\b[\s\S]*?<\/style>/gi
const IFRAME_RE = /<iframe\b[\s\S]*?<\/iframe>/gi
const OBJECT_RE = /<(object|embed|applet|form|input|button|textarea|select|meta|link|base)\b[\s\S]*?>/gi
const EVENT_RE = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi
const JS_URL_RE = /(href|src)\s*=\s*(['"]?)\s*javascript:[^'"\s>]*/gi
const DATA_HTML_RE = /(href|src)\s*=\s*(['"]?)\s*data:text\/html[^'"\s>]*/gi
const IMG_RE = /<img\b[^>]*>/gi

const fromCodePointSafe = (n) =>
  Number.isFinite(n) && n > 31 && n < 0x110000 && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : ''

const stripMailNoise = (value) =>
  String(value ?? '').replace(/[\u200B-\u200D\uFEFF\u00AD\u034F\u2060\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')

/**
 * @param {string} html
 * @param {{ allowImages?: boolean }} [opts]
 */
export const sanitizeEmailHtml = (html, opts = {}) => {
  let s = stripMailNoise(html)
  s = s.replace(SCRIPT_RE, '')
  s = s.replace(STYLE_RE, '')
  s = s.replace(IFRAME_RE, '')
  s = s.replace(OBJECT_RE, '')
  s = s.replace(EVENT_RE, '')
  s = s.replace(JS_URL_RE, '$1=$2')
  s = s.replace(DATA_HTML_RE, '$1=$2')
  if (!opts.allowImages) {
    s = s.replace(IMG_RE, '<span style="color:#6b7280;font-size:12px;">[image blocked]</span>')
  }
  return s
}

export const decodeMailPreview = (value) =>
  stripMailNoise(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => fromCodePointSafe(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => fromCodePointSafe(Number(dec)))
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()

export const htmlToPlainPreview = (html, max = 160) => {
  const text = decodeMailPreview(
    String(html ?? '')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}
