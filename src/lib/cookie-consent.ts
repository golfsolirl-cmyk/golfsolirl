/** First-party record of a visitor's cookie choice. Not a tracking cookie. */
export const CONSENT_STORAGE_KEY = 'gsol-cookie-consent'
export const CONSENT_COOKIE_NAME = 'gsol_consent'
/** Ask again after six months. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180
/**
 * Bump when optional cookie categories change or the consent UX is revised,
 * so previous choices are asked again under Irish DPC / ePrivacy rules.
 */
export const CONSENT_VERSION = 2

export const OPEN_COOKIE_SETTINGS_EVENT = 'gsol:open-cookie-settings'

export const PRIVACY_POLICY_PATH = '/privacy-policy'
export const COOKIE_POLICY_PATH = '/cookie-policy'

/**
 * Categories this site can record. Analytics and marketing stay off until
 * optional scripts are actually introduced and gated behind this record.
 */
export type CookieConsentPreferences = {
  readonly necessary: true
  readonly analytics: boolean
  readonly marketing: boolean
}

export type CookieConsentChoice = CookieConsentPreferences & {
  readonly version: number
  readonly decidedAt: string
  readonly choice: 'accept' | 'reject' | 'custom'
}

/** True when optional tracking scripts may load (none exist on the site today). */
export function hasOptionalConsent(record: CookieConsentChoice | null): {
  analytics: boolean
  marketing: boolean
} {
  if (!record || record.version !== CONSENT_VERSION) {
    return { analytics: false, marketing: false }
  }
  return { analytics: record.analytics === true, marketing: record.marketing === true }
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
    typeof record.analytics === 'boolean' &&
    typeof record.marketing === 'boolean' &&
    record.version === CONSENT_VERSION &&
    (record.choice === 'accept' || record.choice === 'reject' || record.choice === 'custom') &&
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
  /**
   * Optional categories are not used on the live site yet. Accept / reject /
   * custom all keep analytics and marketing off so nothing non-essential loads.
   * When optional tools are added, gate them on `hasOptionalConsent` and allow
   * true values only after an explicit opt-in (never pre-ticked).
   */
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

/** Clear consent so the banner returns immediately (withdrawal). */
export function clearCookieConsent(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
  } catch {
    /* private mode */
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax${secure}`
}
