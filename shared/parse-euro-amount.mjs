/**
 * Parse an admin-typed euro amount.
 * A comma used as a thousands separator must not become a decimal point:
 * `1,200` is 1200, not 1.20. `12,50` and `12.50` stay twelve euro fifty.
 * @param {unknown} raw
 * @returns {number} Finite euros, or NaN when the text is not an amount.
 */
export const parseEuroAmount = (raw) => {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : NaN
  if (typeof raw !== 'string') return NaN

  let text = raw.trim().replace(/\s+/g, '')
  if (!text) return NaN
  text = text.replace(/^(?:€|eur)/i, '')
  if (!/^\d+(?:[.,]\d+)*$/.test(text)) return NaN

  const commaCount = text.split(',').length - 1
  const dotCount = text.split('.').length - 1
  let normalized = text

  if (commaCount > 0 && dotCount > 0) {
    normalized =
      text.lastIndexOf(',') > text.lastIndexOf('.')
        ? text.replace(/\./g, '').replace(',', '.')
        : text.replace(/,/g, '')
  } else if (commaCount > 0) {
    const groups = text.split(',')
    const thousands =
      groups[0].length >= 1 &&
      groups[0].length <= 3 &&
      groups.slice(1).every((part) => part.length === 3)
    if (thousands) {
      normalized = groups.join('')
    } else if (groups.length === 2) {
      normalized = `${groups[0]}.${groups[1]}`
    } else {
      return NaN
    }
  } else if (dotCount > 1) {
    return NaN
  }

  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : NaN
}
