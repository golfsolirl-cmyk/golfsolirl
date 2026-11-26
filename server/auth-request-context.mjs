/** Per-request cookie header for admin cookie auth inside gateway handlers. */
let activeCookieHeader = ''

/** @param {import('http').IncomingMessage} req */
export const bindRequestCookieHeader = (req) => {
  activeCookieHeader = typeof req.headers?.cookie === 'string' ? req.headers.cookie : ''
}

export const clearRequestCookieHeader = () => {
  activeCookieHeader = ''
}

export const activeRequestCookieHeader = () => activeCookieHeader