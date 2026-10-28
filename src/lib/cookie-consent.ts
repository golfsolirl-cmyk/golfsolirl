/** First-party record of a visitor's cookie choice. Not a tracking cookie. */
export const CONSENT_STORAGE_KEY = 'gsol-cookie-consent'
export const CONSENT_COOKIE_NAME = 'gsol_consent'
/** Ask again after six months. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180
/** Bump this when optional cookies are actually added, so old choices are asked again. */
export const CONSENT_VERSION = 1

export const OPEN_COOKIE_SETTINGS_EVENT = 'gsol:open-cookie-settings'

export type CookieConsentChoice = {
  readonly necessary: true
  readonly analytics: false
  readonly marketing: false
  readonly version: number
  readonly decidedAt: string
  readonly choice: 'accept' | 'reject' | 'save'
}

export function openCookieSettings(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
}

function isChoice(value: unknown): value is CookieConsentChoice {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<CookieConsentChoice>
  return (
    record.necessary === true &&
    record.analytics === false &&
    record.marketing === false &&
    record.version === CONSENT_VERSION &&
    (record.choice === 'accept' || record.choice === 'reject' || record.choice === 'save') &&
    typeof record.decidedAt === 'string'
  )
}

function isFresh(decidedAt: string): boolean {
  const decided = Date.parse(decidedAt)
  if (Number.isNaN(decided)) return false
  return Date.now() - decided < CONSENT_MAX_AGE_SECONDS * 1000
}

function readCookie(name: string): string | null {
  const parts = document.cookie.split(';')
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split('=')
    if (rawName === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

export function readCookieConsent(): CookieConsentChoice | null {
  if (typeof window === 'undefined') return null
  const rawSources = [readCookie(CONSENT_COOKIE_NAME), window.localStorage.getItem(CONSENT_STORAGE_KEY)]
  for (const raw of rawSources) {
    if (!raw) continue
    try {
      const parsed: unknown = JSON.parse(raw)
      if (isChoice(parsed) && isFresh(parsed.decidedAt)) return parsed
    } catch {
      /* ignore a broken record and ask again */
    }
  }
  return null
}

export function writeCookieConsent(choice: CookieConsentChoice['choice']): CookieConsentChoice {
  const record: CookieConsentChoice = {
    necessary: true,
    analytics: false,
    marketing: false,
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    choice
  }
  const serialised = JSON.stringify(record)
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, serialised)
  } catch {
    /* private mode */
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(serialised)}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`
  return record
}
