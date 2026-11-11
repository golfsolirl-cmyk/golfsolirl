import assert from 'node:assert/strict'
import test from 'node:test'
import { ilikeExact } from './desk-quote-service.mjs'

/** Postgres ILIKE, including backslash escapes. */
const sqlIlike = (pattern, candidate) => {
  let regex = ''
  for (let i = 0; i < pattern.length; i += 1) {
    const ch = pattern[i]
    if (ch === '\\' && i + 1 < pattern.length) {
      regex += pattern[i + 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      i += 1
      continue
    }
    if (ch === '%') regex += '.*'
    else if (ch === '_') regex += '.'
    else regex += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${regex}$`, 'i').test(candidate)
}

test('an underscore in a customer email is not a wildcard', () => {
  const typed = 'mary_okeeffe@gmail.com'
  const other = 'mary.okeeffe@gmail.com'
  assert.equal(sqlIlike(typed, other), true)
  const exact = ilikeExact(typed)
  assert.equal(sqlIlike(exact, other), false)
  assert.equal(sqlIlike(exact, typed), true)
})
