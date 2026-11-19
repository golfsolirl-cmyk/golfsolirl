import assert from 'node:assert/strict'
import test from 'node:test'
import { claimDeskQuoteDecline, DESK_QUOTE_DECLINE_FROM } from './desk-quote-decline.mjs'

/**
 * One desk quote row. The status filter is applied the way Postgres does:
 * an update whose `.in('status', …)` does not include the current status matches nothing.
 */
const mockDb = (initialStatus) => {
  let status = initialStatus
  const updates = []
  const api = {
    from() {
      const state = { op: 'select', patch: null, statusIn: null }
      const chain = {
        update(patch) {
          state.op = 'update'
          state.patch = patch
          return chain
        },
        select() {
          return chain
        },
        eq() {
          return chain
        },
        in(column, values) {
          if (column === 'status') state.statusIn = values
          return chain
        },
        maybeSingle() {
          if (state.op === 'update') {
            const allowed = state.statusIn || []
            if (!allowed.includes(status)) {
              updates.push({ applied: false, from: status })
              return Promise.resolve({ data: null, error: null })
            }
            status = state.patch.status
            updates.push({ applied: true, to: status })
            return Promise.resolve({ data: { id: 'quote-1' }, error: null })
          }
          return Promise.resolve({ data: { id: 'quote-1', status }, error: null })
        }
      }
      return chain
    }
  }
  return { api, updates, current: () => status }
}

test('a decline is only allowed to replace an open quote', () => {
  assert.deepEqual(DESK_QUOTE_DECLINE_FROM, ['sent', 'accepted', 'invoiced'])
  assert.equal(DESK_QUOTE_DECLINE_FROM.includes('paid'), false)
})

test('a payment that lands before the decline write keeps the quote paid', async () => {
  const db = mockDb('paid')
  const result = await claimDeskQuoteDecline(db.api, { id: 'quote-1', status: 'invoiced' })
  assert.equal(result.claimed, false)
  assert.equal(result.status, 'paid')
  assert.equal(db.current(), 'paid')
  assert.equal(db.updates[0].applied, false)
})

test('an unpaid accepted quote can still be declined', async () => {
  const db = mockDb('invoiced')
  const result = await claimDeskQuoteDecline(db.api, { id: 'quote-1', status: 'invoiced' })
  assert.equal(result.claimed, true)
  assert.equal(result.status, 'declined')
  assert.equal(db.current(), 'declined')
})
