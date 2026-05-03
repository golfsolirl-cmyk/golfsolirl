/**
 * Public enquiry forms: group size and passenger counts are capped at vehicle
 * messaging (1–8). Use these options everywhere selects appear.
 */
export const MAX_ENQUIRY_PEOPLE = 8

export const golferGroupSizeSelectOptions = Array.from({ length: MAX_ENQUIRY_PEOPLE }, (_, i) => {
  const n = i + 1
  const suffix = n === 1 ? 'golfer' : 'golfers'
  return { label: `${n} ${suffix}`, value: `${n} ${suffix}` }
})

export const passengerCountSelectOptions = Array.from({ length: MAX_ENQUIRY_PEOPLE }, (_, i) => {
  const n = i + 1
  return {
    label: n === 1 ? '1 passenger' : `${n} passengers`,
    value: n === 1 ? '1 passenger' : `${n} passengers`
  }
})

export function clampEnquiryPeopleCount(value: number, fallback = 4): number {
  if (Number.isNaN(value)) {
    return Math.min(MAX_ENQUIRY_PEOPLE, Math.max(1, fallback))
  }
  return Math.min(MAX_ENQUIRY_PEOPLE, Math.max(1, value))
}
