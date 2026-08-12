/** Default idle minutes before auto sign-out (no mouse/keyboard/touch). */
const DEFAULT_IDLE_MINUTES_CLIENT = 45
const DEFAULT_IDLE_MINUTES_ADMIN = 30
const DEFAULT_IDLE_MINUTES_DRIVER = 45

type IdleRole = 'client' | 'admin' | 'driver'

const parseMinutes = (raw: unknown, fallback: number): number => {
  if (typeof raw !== 'string' || !raw.trim()) {
    return fallback
  }
  const n = Number(raw.trim())
  if (!Number.isFinite(n) || n < 5 || n > 24 * 60) {
    return fallback
  }
  return Math.round(n)
}

/** Resolve idle timeout in milliseconds for the signed-in role. */
export const idleTimeoutMsForRole = (role: IdleRole | null | undefined): number => {
  const shared = parseMinutes(import.meta.env.VITE_IDLE_LOGOUT_MINUTES, NaN)
  if (Number.isFinite(shared)) {
    return shared * 60_000
  }

  if (role === 'admin') {
    return parseMinutes(import.meta.env.VITE_IDLE_LOGOUT_MINUTES_ADMIN, DEFAULT_IDLE_MINUTES_ADMIN) * 60_000
  }
  if (role === 'driver') {
    return parseMinutes(import.meta.env.VITE_IDLE_LOGOUT_MINUTES_DRIVER, DEFAULT_IDLE_MINUTES_DRIVER) * 60_000
  }
  return parseMinutes(import.meta.env.VITE_IDLE_LOGOUT_MINUTES_CLIENT, DEFAULT_IDLE_MINUTES_CLIENT) * 60_000
}

export const IDLE_ACTIVITY_EVENTS = [
  'pointerdown',
  'keydown',
  'touchstart',
  'scroll',
  'mousemove'
] as const
