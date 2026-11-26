/**
 * Canonical enquiry FORM TYPE / source for admin badges, filters, CSV, and email subjects.
 * Categories match the product desk language (Quote, Booking, Trip builder, …).
 */

/** @typedef {'quote'|'booking'|'trip_builder'|'package_bundle'|'golf_map'|'contact'|'callback'|'seo_landing'|'unknown'} EnquiryFormTypeId */

/** @type {{ id: EnquiryFormTypeId, label: string, shortLabel: string, badgeClass: string }[]} */
export const ENQUIRY_FORM_TYPES = [
  { id: 'quote', label: 'Quote request', shortLabel: 'Quote', badgeClass: 'bg-emerald-100 text-emerald-900' },
  { id: 'booking', label: 'Booking', shortLabel: 'Booking', badgeClass: 'bg-sky-100 text-sky-900' },
  { id: 'trip_builder', label: 'Trip builder', shortLabel: 'Trip builder', badgeClass: 'bg-violet-100 text-violet-900' },
  { id: 'package_bundle', label: 'Package / bundle', shortLabel: 'Package', badgeClass: 'bg-amber-100 text-amber-950' },
  { id: 'golf_map', label: 'Golf map course', shortLabel: 'Golf map', badgeClass: 'bg-lime-100 text-lime-900' },
  { id: 'contact', label: 'Contact', shortLabel: 'Contact', badgeClass: 'bg-slate-200 text-slate-800' },
  { id: 'callback', label: 'Callback', shortLabel: 'Callback', badgeClass: 'bg-orange-100 text-orange-950' },
  { id: 'seo_landing', label: 'SEO landing page', shortLabel: 'SEO', badgeClass: 'bg-indigo-100 text-indigo-900' },
  { id: 'unknown', label: 'Unknown', shortLabel: 'Unknown', badgeClass: 'bg-slate-100 text-slate-500' }
]

const BY_ID = Object.fromEntries(ENQUIRY_FORM_TYPES.map((t) => [t.id, t]))

export const enquiryFormTypeMeta = (id) => BY_ID[id] || BY_ID.unknown

const blank = (v) => (typeof v === 'string' ? v.trim() : '')

/** Path prefixes that mark SEO / guide / transfer landings when Page path is known. */
const SEO_PATH_PREFIXES = [
  '/golf-holidays',
  '/golf-holidays-spain',
  '/golf-packages/',
  '/guides/',
  '/transfers/',
  '/golf-courses/'
]

const isSeoPath = (path) => {
  const p = blank(path).split('?')[0].replace(/\/+$/, '') || '/'
  if (p === '/' || p === '/quote' || p === '/bundles' || p === '/packages' || p === '/continue-trip') return false
  if (p === '/services/transport' || p === '/contact' || p === '/about') return false
  return SEO_PATH_PREFIXES.some((pre) => p === pre.replace(/\/+$/, '') || p.startsWith(pre))
}

const humanizePath = (path) => {
  const p = blank(path).split('?')[0].replace(/\/+$/, '')
  if (!p || p === '/') return ''
  const last = p.split('/').filter(Boolean).pop() || ''
  return last
    .split('-')
    .filter(Boolean)
    .map((w) => (w.toLowerCase() === 'agp' ? 'AGP' : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

/**
 * Extract a likely source page path from form_payload fields / interest text.
 * @param {Record<string, unknown> | null | undefined} fields
 * @param {string} [interest]
 */
export const extractEnquirySourcePage = (fields, interest = '') => {
  const f = fields && typeof fields === 'object' ? fields : {}
  const candidates = [
    blank(f._sourcePage),
    blank(f.sourcePage),
    blank(f.source_page),
    blank(f.Page),
    blank(f.page)
  ]
  for (const c of candidates) {
    if (c.startsWith('/')) return c.split(/\s|\(/)[0].replace(/\/+$/, '') || c
    const m = c.match(/\((\/[^)]+)\)/)
    if (m) return m[1].replace(/\/+$/, '')
  }
  const interestText = blank(interest)
  const pathInInterest = interestText.match(/(?:Page:\s*)?(\/[a-z0-9\-/]+)/i)
  if (pathInInterest) return pathInInterest[1].replace(/\/+$/, '')
  return ''
}

/**
 * Resolve canonical form type from an enquiry row or draft payload.
 * @param {{
 *   formKey?: string | null
 *   formPayload?: { form?: string, fields?: Record<string, unknown> } | null
 *   source?: string | null
 *   interest?: string | null
 *   formType?: string | null
 *   formTypeLabel?: string | null
 *   formSourcePage?: string | null
 * }} input
 */
export const resolveEnquiryFormType = (input = {}) => {
  if (input.formType && BY_ID[input.formType] && input.formType !== 'unknown') {
    const meta = enquiryFormTypeMeta(input.formType)
    const page = blank(input.formSourcePage)
    const label =
      blank(input.formTypeLabel) ||
      (input.formType === 'seo_landing' && page
        ? `SEO landing · ${humanizePath(page) || page}`
        : meta.label)
    return {
      id: /** @type {EnquiryFormTypeId} */ (input.formType),
      label,
      shortLabel: meta.shortLabel,
      badgeClass: meta.badgeClass,
      sourcePage: page,
      formKey: blank(input.formKey) || blank(input.formPayload?.form) || ''
    }
  }

  const fp = input.formPayload && typeof input.formPayload === 'object' ? input.formPayload : {}
  const fields = fp.fields && typeof fp.fields === 'object' ? fp.fields : {}
  const formKey = blank(input.formKey) || blank(fp.form) || blank(input.source) || ''
  const interest = blank(input.interest)
  const sourcePage = blank(input.formSourcePage) || extractEnquirySourcePage(fields, interest)
  const pageLabel = blank(fields.Page) || blank(fields.page) || humanizePath(sourcePage)
  const interestLower = interest.toLowerCase()
  const pageLower = `${pageLabel} ${sourcePage}`.toLowerCase()

  /** @type {EnquiryFormTypeId} */
  let id = 'unknown'

  if (formKey === 'course_map' || /golf map|course map/i.test(interest)) {
    id = 'golf_map'
  } else if (formKey === 'bundle_quote' || /bundle|package deal/i.test(formKey)) {
    id = 'package_bundle'
  } else if (formKey === 'package_builder' || formKey === 'continue_trip') {
    id = 'trip_builder'
  } else if (
    formKey === 'malaga_airport_transfer' ||
    formKey === 'transport_service_page' ||
    formKey === 'homepage_hotel_booked_snapshot'
  ) {
    id = 'booking'
  } else if (formKey === 'trip_service_cta') {
    id = 'quote'
  } else if (
    formKey === 'callback_request' ||
    /callback|call me|request a call|phone back/i.test(interestLower) ||
    /callback/i.test(formKey)
  ) {
    id = 'callback'
  } else if (
    formKey === 'contact' ||
    /\/contact|\/footer|contact form/i.test(pageLower) ||
    blank(fields.enquiryType) === 'contact'
  ) {
    id = 'contact'
  } else if (isSeoPath(sourcePage) || (formKey === 'content_quick_enquiry' && isSeoPath(sourcePage))) {
    id = 'seo_landing'
  } else if (
    formKey === 'content_quick_enquiry' ||
    formKey === 'website_form' ||
    formKey === 'quote' ||
    !formKey
  ) {
    // Content quick enquiry on home /quote without SEO path → quote request
    if (isSeoPath(sourcePage)) id = 'seo_landing'
    else if (/booking|book now|already booked/i.test(interestLower)) id = 'booking'
    else id = formKey || interest ? 'quote' : 'unknown'
  } else {
    id = 'quote'
  }

  // If still unknown but we have any form key, treat as quote rather than Unknown when key is present
  if (id === 'unknown' && formKey && formKey !== 'enquiry') {
    id = 'quote'
  }
  if (!formKey && !interest && !sourcePage) {
    id = 'unknown'
  }

  const meta = enquiryFormTypeMeta(id)
  let label = meta.label
  if (id === 'seo_landing') {
    const pageBit = pageLabel || humanizePath(sourcePage) || sourcePage
    label = pageBit ? `SEO landing · ${pageBit}` : meta.label
  } else if (id === 'golf_map' && pageLabel) {
    label = `Golf map · ${pageLabel.replace(/\s*\(\/.*\)\s*$/, '')}`
  } else if (id === 'package_bundle' && (blank(fields._bundleName) || blank(fields.Bundle))) {
    label = `Package · ${blank(fields._bundleName) || blank(fields.Bundle)}`
  }

  return {
    id,
    label,
    shortLabel: meta.shortLabel,
    badgeClass: meta.badgeClass,
    sourcePage,
    formKey
  }
}

/** Subject prefix e.g. `[Booking]` or `[SEO · Marbella]`. */
export const enquiryFormTypeSubjectTag = (resolved) => {
  if (!resolved || resolved.id === 'unknown') return '[Enquiry]'
  if (resolved.id === 'seo_landing') {
    const page = resolved.sourcePage ? humanizePath(resolved.sourcePage) : ''
    return page ? `[SEO · ${page}]` : '[SEO landing]'
  }
  return `[${resolved.shortLabel}]`
}
