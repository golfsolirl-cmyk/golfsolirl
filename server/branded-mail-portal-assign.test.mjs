import assert from 'node:assert/strict'
import test from 'node:test'
import { assignBrandedMailPortal, ilikeExactPattern } from './branded-mail-portal-assign.mjs'
import { discardUnsentPortalInvoice, inFlightSendBlocksRetry, runOncePortalSideEffect } from './branded-mail-send-guard.mjs'

test('ilikeExactPattern treats underscore and percent as literals', () => {
  assert.equal(ilikeExactPattern('pat_ryan@gmail.com'), 'pat\\_ryan@gmail.com')
  assert.equal(ilikeExactPattern('100%_off@golf.test'), '100\\%\\_off@golf.test')
  assert.equal(ilikeExactPattern('a\\b_c@golf.test'), 'a\\\\b\\_c@golf.test')
})

test('portal profile lookup escapes underscore emails before ILIKE', async () => {
  const calls = []
  const admin = {
    from(table) {
      const api = {
        select() {
          return api
        },
        ilike(col, val) {
          calls.push({ table, op: 'ilike', col, val })
          return api
        },
        eq() {
          return api
        },
        update() {
          return api
        },
        insert() {
          return Promise.resolve({ error: null })
        },
        maybeSingle() {
          if (table === 'email_account_anchors') {
            return Promise.resolve({ data: { account_reference_id: 'GSOL-1' }, error: null })
          }
          if (table === 'profiles') {
            return Promise.resolve({
              data: {
                id: 'profile-dot',
                email: 'pat.ryan@gmail.com',
                full_name: 'Pat Ryan',
                account_reference_id: 'GSOL-OLD'
              },
              error: null
            })
          }
          return Promise.resolve({ data: null, error: null })
        },
        then(resolve, reject) {
          return Promise.resolve({ error: null }).then(resolve, reject)
        }
      }
      return api
    }
  }

  const result = await assignBrandedMailPortal(admin, {}, {
    email: 'Pat_Ryan@gmail.com',
    fullName: 'Pat Ryan',
    subject: 'Your quotation',
    quotation: {}
  })

  const profileLookup = calls.find((call) => call.table === 'profiles' && call.op === 'ilike')
  assert.ok(profileLookup)
  assert.equal(profileLookup.val, 'pat\\_ryan@gmail.com')
  assert.equal(result.profileId, 'profile-dot')
  assert.equal(result.invoiceId, null)
})

test('a completed send does not open another portal invoice', async () => {
  let opened = 0
  const outcome = await runOncePortalSideEffect({
    priorStatus: 'sent',
    openInvoice: async () => {
      opened += 1
      return { invoiceId: 'inv-new' }
    },
    work: async () => ({ duplicateCompleted: false }),
    discardInvoice: async () => {
      throw new Error('should not discard')
    }
  })
  assert.equal(opened, 0)
  assert.equal(outcome.skipped, true)
})

test('a rejected send deletes the invoice opened for that attempt', async () => {
  const discarded = []
  await assert.rejects(
    () =>
      runOncePortalSideEffect({
        priorStatus: 'failed',
        openInvoice: async () => ({ invoiceId: 'inv-attempt' }),
        work: async () => {
          throw new Error('provider rejected')
        },
        discardInvoice: async (invoiceId) => {
          discarded.push(invoiceId)
        }
      }),
    /provider rejected/
  )
  assert.deepEqual(discarded, ['inv-attempt'])
})

test('a duplicate completed send drops the extra invoice', async () => {
  const discarded = []
  const outcome = await runOncePortalSideEffect({
    priorStatus: null,
    openInvoice: async () => ({ invoiceId: 'inv-extra' }),
    work: async () => ({ duplicateCompleted: true }),
    discardInvoice: async (invoiceId) => {
      discarded.push(invoiceId)
    }
  })
  assert.equal(outcome.skipped, true)
  assert.deepEqual(discarded, ['inv-extra'])
})

test('a delivered send keeps its portal invoice', async () => {
  const discarded = []
  const outcome = await runOncePortalSideEffect({
    priorStatus: null,
    openInvoice: async () => ({ invoiceId: 'inv-kept' }),
    work: async () => ({ duplicateCompleted: false, response: { ok: true } }),
    discardInvoice: async (invoiceId) => {
      discarded.push(invoiceId)
    }
  })
  assert.equal(outcome.skipped, false)
  assert.deepEqual(discarded, [])
  assert.equal(outcome.result.response.ok, true)
})

test('a fresh in-flight send blocks another invoice', () => {
  const now = Date.parse('2026-10-02T11:00:00.000Z')
  assert.equal(inFlightSendBlocksRetry({ status: 'sending', created_at: '2026-10-02T10:59:30.000Z' }, now), true)
  assert.equal(inFlightSendBlocksRetry({ status: 'sending', created_at: '2026-10-02T10:50:00.000Z' }, now), false)
  assert.equal(inFlightSendBlocksRetry({ status: 'failed', created_at: '2026-10-02T10:59:30.000Z' }, now), false)
  assert.equal(inFlightSendBlocksRetry({ status: 'sent', created_at: '2026-10-02T10:59:30.000Z' }, now), false)
  assert.equal(inFlightSendBlocksRetry({ status: 'sending' }, now), true)
})

test('discardUnsentPortalInvoice deletes only status=sent rows', async () => {
  const filters = []
  const db = {
    from(table) {
      const api = {
        delete() {
          filters.push({ table, op: 'delete' })
          return api
        },
        eq(col, val) {
          filters.push({ table, op: 'eq', col, val })
          return api
        },
        then(resolve, reject) {
          return Promise.resolve({ error: null }).then(resolve, reject)
        }
      }
      return api
    }
  }
  await discardUnsentPortalInvoice(db, 'inv-1')
  await discardUnsentPortalInvoice(db, null)
  assert.deepEqual(filters, [
    { table: 'portal_invoices', op: 'delete' },
    { table: 'portal_invoices', op: 'eq', col: 'id', val: 'inv-1' },
    { table: 'portal_invoices', op: 'eq', col: 'status', val: 'sent' }
  ])
})
