/**
 * What to do with the 3-day pay clock when an admin saves a price.
 * Withdrawing the price must clear the clock. Leaving a past deadline in place
 * cancels the next quote on the following sweep, including a trip that can no longer be reopened.
 * A deadline that is already set stays put, so editing the amount does not add more days.
 * @param {number | null} price
 * @param {string | null | undefined} unpaidDeadlineAt
 * @returns {'clear' | 'stamp' | 'keep'}
 */
export const planUnpaidDeadlineOnPriceSave = (price, unpaidDeadlineAt) => {
  const live = typeof price === 'number' && Number.isFinite(price) && price >= 0.5
  if (!live) return 'clear'
  if (unpaidDeadlineAt) return 'keep'
  return 'stamp'
}
