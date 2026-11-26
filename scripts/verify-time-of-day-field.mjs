/**
 * Regression: arrival / collection times normalize to HH:mm and land in enquiry fields.
 * Run: node scripts/verify-time-of-day-field.mjs
 */
import assert from 'node:assert/strict'
import {
  arrivalTimeFormFields,
  isValidTimeOfDay,
  joinTimeOfDay,
  normalizeTimeOfDay,
  splitTimeOfDay,
  timeOfDayHourOptions,
  timeOfDayMinuteOptions
} from '../shared/time-of-day.mjs'

assert.equal(normalizeTimeOfDay('9:5'), '09:05')
assert.equal(normalizeTimeOfDay('14:30'), '14:30')
assert.equal(normalizeTimeOfDay('14:30:00'), '14:30')
assert.equal(normalizeTimeOfDay('  7:00 '), '07:00')
assert.equal(normalizeTimeOfDay(''), '')
assert.equal(normalizeTimeOfDay('25:00'), '')
assert.equal(normalizeTimeOfDay('12:60'), '')
assert.equal(normalizeTimeOfDay('noon'), '')

assert.equal(isValidTimeOfDay('09:05'), true)
assert.equal(isValidTimeOfDay('9:5'), true)
assert.equal(isValidTimeOfDay(''), false)

assert.deepEqual(splitTimeOfDay('14:30'), { hour: '14', minute: '30' })
assert.deepEqual(splitTimeOfDay(''), { hour: '', minute: '' })
assert.equal(joinTimeOfDay('9', '5'), '09:05')
assert.equal(joinTimeOfDay('', '05'), '')
assert.equal(joinTimeOfDay('14', ''), '')

const hours = timeOfDayHourOptions()
assert.equal(hours.length, 24)
assert.equal(hours[0], '00')
assert.equal(hours[23], '23')

const mins = timeOfDayMinuteOptions(5)
assert.ok(mins.includes('00'))
assert.ok(mins.includes('55'))
assert.equal(mins.length, 12)

const minsWithOdd = timeOfDayMinuteOptions(5, '23')
assert.ok(minsWithOdd.includes('23'), 'off-step minute must stay selectable')

const fields = arrivalTimeFormFields('9:5')
assert.deepEqual(fields, { 'Arrival time': '09:05' })
assert.deepEqual(arrivalTimeFormFields(''), {})

/** Simulate quote / transfer form payload merge used before postWebsiteEnquiry. */
function buildTransferEnquiryFields({ arrivalDate, arrivalTime, flightNo, passengers, destination }) {
  const arrivalHhmm = normalizeTimeOfDay(arrivalTime)
  const pickupLabel = `Málaga Airport (AGP)${flightNo ? ` · Flight ${flightNo}` : ''}${
    arrivalHhmm ? ` · ${arrivalHhmm}` : ''
  }`
  return {
    'Arrival date': arrivalDate,
    Passengers: passengers,
    Destination: destination,
    pickupLabel,
    ...arrivalTimeFormFields(arrivalHhmm),
    ...(flightNo ? { 'Flight number': flightNo } : {})
  }
}

const payload = buildTransferEnquiryFields({
  arrivalDate: '2026-12-10',
  arrivalTime: '14:35',
  flightNo: 'EI582',
  passengers: '4',
  destination: 'Marbella'
})
assert.equal(payload['Arrival time'], '14:35')
assert.match(payload.pickupLabel, /14:35/)
assert.equal(payload['Flight number'], 'EI582')

const emptyTime = buildTransferEnquiryFields({
  arrivalDate: '2026-12-10',
  arrivalTime: '',
  flightNo: '',
  passengers: '2',
  destination: 'Estepona'
})
assert.equal(Object.hasOwn(emptyTime, 'Arrival time'), false)

console.log('verify-time-of-day-field: ok')
