const PICKUP_FREE_TEXT = 'free_text'

/**
 * Display value for PDF rows (mirrors client `formatWebsiteFormFieldValueForDisplay`).
 * @param {string} key
 * @param {string} raw
 */
export const pdfFieldValueDisplay = (key, raw) => {
  const k = String(key ?? '')
    .replace(/^form\./i, '')
    .trim()
  const v = String(raw ?? '').trim()
  if (k === '_pickupType' && v === PICKUP_FREE_TEXT) {
    return 'Mercedes fleet: E-Class, V-Class and Sprinter — matched to your group and bag count.'
  }
  return String(raw ?? '')
}

/**
 * Plain labels for website form `fields` keys (mirrors client `getWebsiteFormFieldLabel` — keep in sync for PDFs).
 * @param {string} key
 */
export const pdfFieldLabel = (key) => {
  const k = String(key ?? '')
    .replace(/^form\./i, '')
    .trim()
  const map = {
    _pax: 'Passengers',
    _pickupType: 'Pickup type',
    _pickupId: 'Pickup reference',
    _pickupLabel: 'Pickup location',
    _dropoffType: 'Drop-off type',
    _dropoffId: 'Drop-off reference',
    _dropoffLabel: 'Drop-off location',
    _quoteIntent: 'Quote intent',
    _travelDateFrom: 'Travel start date',
    _travelDateTo: 'Travel end date',
    _alreadyAtMalagaAgp: 'Already at Málaga (AGP)',
    Passengers: 'Passengers',
    'Trip timing': 'Trip timing',
    'Collection point': 'Collection point',
    Destination: 'Destination',
    'Collection timing': 'Collection timing',
    ASAP: 'ASAP',
    'Travel start date': 'Travel start date',
    'Travel end date': 'Travel end date',
    'Service date (already here)': 'Service date (already here)',
    'Public form': 'Public form',
    Interest: 'Interest'
  }
  if (map[k]) {
    return map[k]
  }
  if (k.startsWith('_')) {
    const rest = k.slice(1).replace(/_/g, ' ')
    return rest.replace(/\b\w/g, (c) => c.toUpperCase())
  }
  if (/[\s/]/.test(k) || /^[A-Z][a-z]/.test(k)) {
    return k
  }
  return k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
