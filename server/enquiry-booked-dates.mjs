/**
 * Driver diary blocks (`driver_calendar_bookings`) — align server-side checks with public forms.
 * Mirrors client handlers in transport / quick enquiry / continue trip forms.
 */

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

const STRUCT = {
  travelDateFrom: '_travelDateFrom',
  travelDateTo: '_travelDateTo',
  alreadyAtMalagaAgp: '_alreadyAtMalagaAgp'
}

const WEBSITE_FORM = {
  transportServicePage: 'transport_service_page',
  contentQuickEnquiry: 'content_quick_enquiry',
  courseMap: 'course_map',
  continueTrip: 'continue_trip',
  homepageHotelBookedSnapshot: 'homepage_hotel_booked_snapshot',
  packageBuilder: 'package_builder'
}

function parseLeadingIsoDay(value) {
  if (typeof value !== 'string') {
    return ''
  }
  const m = value.trim().match(/^(\d{4}-\d{2}-\d{2})/)
  return m && ISO_DAY.test(m[1]) ? m[1] : ''
}

/** Same normalization idea as `addDriverBookedRpcRowsToSet` in src/lib/booked-service-days.ts */
function addRpcBookedRowsToSet(data, out) {
  if (data == null) {
    return
  }
  const rows = Array.isArray(data) ? data : [data]
  for (const row of rows) {
    if (typeof row === 'string') {
      const head = row.trim().slice(0, 10)
      if (ISO_DAY.test(head)) {
        out.add(head)
      }
      continue
    }
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      for (const v of Object.values(row)) {
        if (typeof v === 'string') {
          const d = parseLeadingIsoDay(v)
          if (d) {
            out.add(d)
          }
        }
      }
    }
  }
}

export async function loadDriverBookedIsoDaySet(sb) {
  const out = new Set()
  const { data, error } = await sb.from('driver_booked_service_days_public').select('service_day')
  if (error) {
    return { booked: out, rpcFailed: true, rpcMessage: String(error.message ?? '') }
  }
  addRpcBookedRowsToSet(data, out)
  return { booked: out, rpcFailed: false, rpcMessage: '' }
}

/**
 * Calendar days from this enquiry that must not appear on the driver diary block list.
 */
export function collectEnquiryBookableIsoDays(enquiry) {
  const fp = enquiry.formPayload
  if (!fp || typeof fp !== 'object' || Array.isArray(fp)) {
    return []
  }
  const form = typeof fp.form === 'string' ? fp.form.trim() : ''
  const fieldsRaw = fp.fields
  if (!fieldsRaw || typeof fieldsRaw !== 'object' || Array.isArray(fieldsRaw)) {
    return []
  }
  const fields = fieldsRaw

  const df = parseLeadingIsoDay(fields[STRUCT.travelDateFrom])
  const dt = parseLeadingIsoDay(fields[STRUCT.travelDateTo])
  const asap = fields.ASAP === 'yes' || fields.ASAP === 'Yes'
  const hideCollection =
    typeof fields['Public form'] === 'string' && fields['Public form'].toLowerCase().includes('hidden')
  const alreadyHere = fields[STRUCT.alreadyAtMalagaAgp] === 'yes'

  if (form === WEBSITE_FORM.transportServicePage) {
    const acc = []
    if (!asap && !alreadyHere) {
      if (df) {
        acc.push(df)
      }
      if (dt) {
        acc.push(dt)
      }
    }
    if (!asap && alreadyHere) {
      const svc = parseLeadingIsoDay(fields['Service date (already here)'])
      if (svc) {
        acc.push(svc)
      }
    }
    if (!hideCollection && !asap) {
      const ct = parseLeadingIsoDay(fields['Collection timing'] ?? '')
      if (ct) {
        acc.push(ct)
      }
    }
    return [...new Set(acc)]
  }

  if (
    form === WEBSITE_FORM.contentQuickEnquiry ||
    form === WEBSITE_FORM.courseMap ||
    form === WEBSITE_FORM.continueTrip ||
    form === WEBSITE_FORM.homepageHotelBookedSnapshot ||
    form === WEBSITE_FORM.packageBuilder
  ) {
    const acc = []
    if (df) {
      acc.push(df)
    }
    if (dt) {
      acc.push(dt)
    }
    return [...new Set(acc)]
  }

  const fallback = []
  if (df) {
    fallback.push(df)
  }
  if (dt) {
    fallback.push(dt)
  }
  return [...new Set(fallback)]
}

function bookedDayMessage(isoDay) {
  return `We're fully booked on ${isoDay}. Please choose another date or contact us and we'll check options.`
}

/**
 * @throws {Error} statusCode 400 when a submitted date is blocked and RPC succeeded.
 */
export async function assertEnquiryDriverDatesNotBlocked(sb, enquiry) {
  const days = collectEnquiryBookableIsoDays(enquiry)
  if (days.length === 0) {
    return
  }

  const { booked, rpcFailed, rpcMessage } = await loadDriverBookedIsoDaySet(sb)
  if (rpcFailed) {
    console.warn('[enquiry-booked-dates] driver_booked_service_days_public failed — skipping server block check:', rpcMessage)
    return
  }

  for (const d of days) {
    if (booked.has(d)) {
      const err = new Error(bookedDayMessage(d))
      err.statusCode = 400
      throw err
    }
  }
}
