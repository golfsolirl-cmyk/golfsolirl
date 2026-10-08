import assert from 'node:assert/strict'

import { syncTransferBookingFromPaidPortalInvoice } from '../server/portal-invoice-transfer-sync.mjs'

const clone = (value) => (value == null ? value : JSON.parse(JSON.stringify(value)))

class MockQuery {
  constructor(db, table) {
    this.db = db
    this.table = table
    this.filters = []
    this.inFilters = []
    this.orderSpec = null
    this.limitCount = null
    this.operation = 'select'
    this.payload = null
  }

  select() {
    return this
  }

  eq(column, value) {
    this.filters.push((row) => row[column] === value)
    return this
  }

  ilike(column, value) {
    const expected = String(value ?? '').toLowerCase()
    this.filters.push((row) => String(row[column] ?? '').toLowerCase() === expected)
    return this
  }

  in(column, values) {
    const allowed = new Set(values)
    this.inFilters.push((row) => allowed.has(row[column]))
    return this
  }

  order(column, opts = {}) {
    this.orderSpec = { column, ascending: Boolean(opts.ascending) }
    return this
  }

  limit(count) {
    this.limitCount = count
    return this
  }

  insert(payload) {
    this.operation = 'insert'
    this.payload = Array.isArray(payload) ? payload : [payload]
    return this
  }

  update(payload) {
    this.operation = 'update'
    this.payload = payload
    return this
  }

  delete() {
    this.operation = 'delete'
    return this
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject)
  }

  async maybeSingle() {
    const { data, error } = await this.execute()
    return { data: Array.isArray(data) ? (data[0] ?? null) : data, error }
  }

  async single() {
    const { data, error } = await this.execute()
    return { data: Array.isArray(data) ? data[0] : data, error }
  }

  rows() {
    let rows = this.db.tables[this.table] ?? []
    for (const filter of [...this.filters, ...this.inFilters]) {
      rows = rows.filter(filter)
    }
    if (this.orderSpec) {
      const { column, ascending } = this.orderSpec
      rows = [...rows].sort((a, b) => {
        const av = String(a[column] ?? '')
        const bv = String(b[column] ?? '')
        return ascending ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    if (typeof this.limitCount === 'number') {
      rows = rows.slice(0, this.limitCount)
    }
    return rows
  }

  async execute() {
    const table = (this.db.tables[this.table] ??= [])

    if (this.operation === 'insert') {
      const inserted = this.payload.map((row) => {
        const next = {
          id: row.id ?? `${this.table}-${table.length + 1}`,
          created_at: row.created_at ?? new Date().toISOString(),
          ...clone(row)
        }
        table.push(next)
        return clone(next)
      })
      return { data: inserted, error: null }
    }

    if (this.operation === 'update') {
      const matched = this.rows()
      for (const row of matched) {
        Object.assign(row, clone(this.payload))
      }
      return { data: clone(matched), error: null }
    }

    if (this.operation === 'delete') {
      const matched = new Set(this.rows())
      this.db.tables[this.table] = table.filter((row) => !matched.has(row))
      return { data: null, error: null }
    }

    return { data: clone(this.rows()), error: null }
  }
}

class MockSupabase {
  constructor(tables) {
    this.tables = tables
    this.storage = {
      from: () => ({
        upload: async () => ({ error: null })
      })
    }
  }

  from(table) {
    return new MockQuery(this, table)
  }
}

const tables = {
  portal_invoices: [
    {
      id: 'invoice-new-ref',
      status: 'paid',
      amount_cents: 0,
      enquiry_id: null,
      enquiry_reference_id: 'GSI-NEW',
      profile_id: 'profile-1',
      paid_at: '2026-06-20T10:00:00.000Z'
    }
  ],
  profiles: [
    {
      id: 'profile-1',
      email: 'guest@example.com',
      full_name: 'Guest One',
      phone: '+353871234567',
      phone_e164: '+353871234567'
    }
  ],
  transfer_bookings: [
    {
      id: 'old-booking',
      client_user_id: 'profile-1',
      client_email: 'guest@example.com',
      pickup_label: 'Old pickup',
      dropoff_label: 'Old dropoff',
      payment_status: 'unpaid',
      admin_price_eur: 400,
      deposit_percent: 20,
      enquiry_reference_id: 'GSI-OLD',
      created_at: '2026-06-20T09:59:00.000Z'
    }
  ],
  transfer_booking_events: [],
  portal_client_updates: [],
  enquiries: [],
  portal_client_transfer_documents: [],
  package_builds: []
}

const supabase = new MockSupabase(tables)
const result = await syncTransferBookingFromPaidPortalInvoice(supabase, 'invoice-new-ref')

assert.equal(result.synced, true)
assert.equal(result.created, true)
assert.notEqual(result.bookingId, 'old-booking')

const oldBooking = tables.transfer_bookings.find((row) => row.id === 'old-booking')
assert.equal(oldBooking.payment_status, 'unpaid')
assert.equal(oldBooking.stripe_checkout_session_id, undefined)

const newBooking = tables.transfer_bookings.find((row) => row.id === result.bookingId)
assert.ok(newBooking)
assert.equal(newBooking.enquiry_reference_id, 'GSI-NEW')
assert.equal(newBooking.payment_status, 'paid')

assert.equal(tables.transfer_booking_events.length, 1)
assert.equal(tables.transfer_booking_events[0].booking_id, result.bookingId)
assert.equal(tables.portal_client_updates.length, 1)
assert.equal(tables.portal_client_updates[0].owner_id, 'profile-1')

console.log('verify-critical-bug-fixes: portal invoice sync did not mutate an unrelated transfer booking')
