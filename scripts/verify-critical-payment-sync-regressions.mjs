import assert from 'node:assert/strict'

import { syncTransferBookingFromPaidPortalInvoice } from '../server/portal-invoice-transfer-sync.mjs'

const clone = (value) => JSON.parse(JSON.stringify(value))

const matchesFilter = (row, filter) => {
  const actual = row?.[filter.column]
  if (filter.kind === 'eq') {
    return actual === filter.value
  }
  if (filter.kind === 'ilike') {
    return String(actual ?? '').toLowerCase() === String(filter.value ?? '').toLowerCase()
  }
  if (filter.kind === 'in') {
    return filter.values.includes(actual)
  }
  return true
}

class Query {
  constructor(db, table) {
    this.db = db
    this.table = table
    this.filters = []
    this.patch = null
    this.insertRow = null
    this.sort = null
    this.max = null
  }

  select() {
    return this
  }

  eq(column, value) {
    this.filters.push({ kind: 'eq', column, value })
    return this
  }

  ilike(column, value) {
    this.filters.push({ kind: 'ilike', column, value })
    return this
  }

  in(column, values) {
    this.filters.push({ kind: 'in', column, values })
    return this
  }

  order(column, opts = {}) {
    this.sort = { column, ascending: opts.ascending !== false }
    return this
  }

  limit(max) {
    this.max = max
    return this
  }

  update(patch) {
    this.patch = patch
    return this
  }

  insert(row) {
    this.insertRow = row
    return this
  }

  async maybeSingle() {
    const rows = this._filteredRows()
    if (this.patch) {
      const row = rows[0]
      if (!row) {
        return { data: null, error: null }
      }
      Object.assign(row, clone(this.patch))
      this.db.operations.updates.push({ table: this.table, id: row.id, patch: clone(this.patch) })
      return { data: clone(row), error: null }
    }
    return { data: rows[0] ? clone(rows[0]) : null, error: null }
  }

  async single() {
    if (this.insertRow) {
      const row = { id: `${this.table}-inserted-${this.db.tables[this.table].length + 1}`, ...clone(this.insertRow) }
      this.db.tables[this.table].push(row)
      this.db.operations.inserts.push({ table: this.table, row: clone(row) })
      return { data: clone(row), error: null }
    }
    return this.maybeSingle()
  }

  _filteredRows() {
    let rows = [...(this.db.tables[this.table] ?? [])].filter((row) =>
      this.filters.every((filter) => matchesFilter(row, filter))
    )
    if (this.sort) {
      const { column, ascending } = this.sort
      rows.sort((a, b) => {
        const av = a?.[column] ?? ''
        const bv = b?.[column] ?? ''
        return ascending ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
    }
    if (typeof this.max === 'number') {
      rows = rows.slice(0, this.max)
    }
    return rows
  }
}

const createMockSupabase = () => {
  const db = {
    tables: {
      portal_invoices: [
        {
          id: 'invoice-b',
          status: 'paid',
          amount_cents: 50000,
          enquiry_id: 'enquiry-b',
          enquiry_reference_id: 'GSI-B',
          profile_id: 'profile-1',
          stripe_payment_intent_id: 'pi_invoice_b',
          stripe_checkout_session_id: 'cs_invoice_b',
          paid_at: '2026-06-18T11:00:00.000Z'
        },
        {
          id: 'invoice-a',
          status: 'paid',
          amount_cents: 30000,
          enquiry_id: 'enquiry-a',
          enquiry_reference_id: 'GSI-A',
          profile_id: 'profile-1',
          stripe_payment_intent_id: 'pi_invoice_a',
          stripe_checkout_session_id: 'cs_invoice_a',
          paid_at: '2026-06-17T11:00:00.000Z'
        }
      ],
      transfer_bookings: [
        {
          id: 'booking-a',
          payment_status: 'unpaid',
          admin_price_eur: 300,
          deposit_percent: 20,
          client_user_id: 'profile-1',
          enquiry_reference_id: 'GSI-A',
          created_at: '2026-06-17T10:00:00.000Z'
        }
      ],
      profiles: [
        {
          id: 'profile-1',
          email: 'client@example.com',
          full_name: 'Client One',
          phone: '+353871234567',
          phone_e164: '+353871234567'
        }
      ],
      enquiries: [
        {
          id: 'enquiry-b',
          reference_id: 'GSI-B',
          email: 'client@example.com',
          full_name: 'Client One',
          phone: '+353871234567',
          interest: 'Trip B'
        }
      ],
      transfer_booking_events: []
    },
    operations: {
      inserts: [],
      updates: []
    }
  }

  return {
    db,
    from(table) {
      if (!db.tables[table]) {
        db.tables[table] = []
      }
      return new Query(db, table)
    }
  }
}

const testInvoiceWithoutMatchingBookingCreatesNewReferenceRow = async () => {
  const supabase = createMockSupabase()

  const result = await syncTransferBookingFromPaidPortalInvoice(supabase, 'invoice-b')

  assert.equal(result.synced, true)
  assert.equal(result.created, true)
  assert.equal(result.bookingId, 'transfer_bookings-inserted-2')
  assert.equal(supabase.db.operations.updates.length, 0)
  assert.equal(supabase.db.tables.transfer_bookings[0].id, 'booking-a')
  assert.equal(supabase.db.tables.transfer_bookings[0].payment_status, 'unpaid')

  const inserted = supabase.db.operations.inserts.find((op) => op.table === 'transfer_bookings')?.row
  assert.ok(inserted)
  assert.equal(inserted.enquiry_reference_id, 'GSI-B')
  assert.equal(inserted.client_user_id, 'profile-1')
  assert.equal(inserted.payment_status, 'paid')
  assert.equal(inserted.stripe_payment_intent_id, 'pi_invoice_b')
}

const testInvoiceWithMatchingBookingDoesNotCreateDuplicate = async () => {
  const supabase = createMockSupabase()
  supabase.db.tables.transfer_bookings[0].payment_status = 'paid'

  const result = await syncTransferBookingFromPaidPortalInvoice(supabase, 'invoice-a')

  assert.equal(result.synced, true)
  assert.equal(result.created, false)
  assert.equal(result.bookingId, 'booking-a')
  assert.equal(result.reason, 'already_paid')
  assert.equal(supabase.db.operations.inserts.length, 0)
  assert.equal(supabase.db.operations.updates.length, 0)
}

await testInvoiceWithoutMatchingBookingCreatesNewReferenceRow()
await testInvoiceWithMatchingBookingDoesNotCreateDuplicate()

console.log('Critical payment sync regressions passed')
