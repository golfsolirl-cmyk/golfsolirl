/**
 * True when collection / pickup text looks like Málaga AGP or another airport keyword.
 * Used to show inbound flight number on transfer forms.
 */
export const isMalagaAirportCollectionPoint = (value: string): boolean => {
  const raw = value.trim()
  if (!raw) {
    return false
  }
  const s = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')

  if (/\bagp\b/.test(s)) {
    return true
  }
  if (/malaga|málaga/.test(s) && /airport|aeropuerto|terminal|arrival|arrivals|flight/.test(s)) {
    return true
  }
  if (/costa del sol airport|aeropuerto costa|malaga airport|aeropuerto de malaga/.test(s)) {
    return true
  }
  if (/\bairport\b|\baeropuerto\b/.test(s) && /malaga|málaga|agp|gibraltar|jerez|almeria|almería/.test(s)) {
    return true
  }
  return false
}
