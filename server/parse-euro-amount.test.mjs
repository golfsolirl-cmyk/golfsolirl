import assert from 'node:assert/strict'
import test from 'node:test'
import { parseEuroAmount } from '../shared/parse-euro-amount.mjs'

test('thousands commas stay whole euros', () => {
  assert.equal(parseEuroAmount('1,200'), 1200)
  assert.equal(parseEuroAmount('4,800'), 4800)
  assert.equal(parseEuroAmount('1,200,000'), 1200000)
  assert.equal(parseEuroAmount('€1,200'), 1200)
  assert.equal(parseEuroAmount('1 200'), 1200)
})

test('decimal commas and dots stay cents', () => {
  assert.equal(parseEuroAmount('12,50'), 12.5)
  assert.equal(parseEuroAmount('12.50'), 12.5)
  assert.equal(parseEuroAmount('1,20'), 1.2)
  assert.equal(parseEuroAmount('0,50'), 0.5)
})

test('mixed separators use the last mark as the decimal', () => {
  assert.equal(parseEuroAmount('1,200.50'), 1200.5)
  assert.equal(parseEuroAmount('1.200,50'), 1200.5)
})

test('numbers pass through and junk is rejected', () => {
  assert.equal(parseEuroAmount(1200), 1200)
  assert.equal(parseEuroAmount('1.200'), 1.2)
  assert.ok(Number.isNaN(parseEuroAmount('')))
  assert.ok(Number.isNaN(parseEuroAmount('1,200,50')))
  assert.ok(Number.isNaN(parseEuroAmount('abc')))
  assert.ok(Number.isNaN(parseEuroAmount(null)))
})
