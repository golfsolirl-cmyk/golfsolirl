import { getLocalDateIso } from './local-date-iso'

const ISO_LEN = 10

function sliceIso(raw: string) {
  return raw.trim().slice(0, ISO_LEN)
}

/** Earliest selectable travel start (local today). */
export function travelStartMinIso(now = new Date()): string {
  return getLocalDateIso(now)
}

/** Earliest selectable travel end: not before today and not before travel start. */
export function travelEndMinIso(travelStartIso: string, now = new Date()): string {
  const today = getLocalDateIso(now)
  const start = sliceIso(travelStartIso)
  if (start.length !== ISO_LEN || start < today) {
    return today
  }
  return start
}

/** For planned trips with both ISO dates set; returns a user-facing error or null. */
export function plannedTravelDatesErrorMessage(df: string, dt: string, now = new Date()): string | null {
  const today = getLocalDateIso(now)
  const dff = sliceIso(df)
  const dtt = sliceIso(dt)
  if (dff.length !== ISO_LEN || dtt.length !== ISO_LEN) {
    return null
  }
  if (dff < today) {
    return 'Travel start date cannot be in the past.'
  }
  if (dtt < today) {
    return 'Travel end date cannot be in the past.'
  }
  if (dtt < dff) {
    return 'Travel end date must be on or after the travel start date.'
  }
  return null
}
