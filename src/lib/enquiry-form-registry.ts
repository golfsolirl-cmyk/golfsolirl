/**
 * Central registry for every `formPayload.form` value POSTed to `/api/enquiry`.
 * Server: all of these are handled by `handleEnquirySubmission` in `server/enquiry-service.mjs` (one PDF + email pipeline).
 * Keep in sync with submit handlers; import these constants instead of string literals.
 *
 * | Form key | Source component |
 * |----------|------------------|
 * | `content_quick_enquiry` | `GeQuickEnquiryForm` (home + content pages) |
 * | `transport_service_page` | `TransportHeroEnquiryForm` |
 * | `course_map` | `GeCoursesInteractiveCorridor` |
 * | `homepage_hotel_booked_snapshot` | `GeAlreadyBookedFlightPanel` |
 * | `continue_trip` | `ContinueTripPage` |
 * | `package_builder` | `CustomerPackagePage` |
 *
 * Trip timing: forms collect `tripArrivalMode` (`planned` | `already_at_agp`) plus optional ISO `travelDateFrom` / `travelDateTo`, mirrored in `fields` via `ENQUIRY_STRUCTURED_FIELD_KEYS`.
 */
export const WEBSITE_ENQUIRY_FORM = {
  contentQuickEnquiry: 'content_quick_enquiry',
  transportServicePage: 'transport_service_page',
  courseMap: 'course_map',
  homepageHotelBookedSnapshot: 'homepage_hotel_booked_snapshot',
  continueTrip: 'continue_trip',
  packageBuilder: 'package_builder'
} as const

export type WebsiteEnquiryFormKey = (typeof WEBSITE_ENQUIRY_FORM)[keyof typeof WEBSITE_ENQUIRY_FORM]

/**
 * Machine-readable keys inside `formPayload.fields` (underscore prefix avoids clashes with human labels).
 * Admin `extractManualHintsFromFormPayload` and transfer tooling read these.
 */
export const ENQUIRY_STRUCTURED_FIELD_KEYS = {
  /** Stable GSI id for this contact email (server; all submissions for same email share it). */
  accountAnchorRef: '_accountAnchorRef',
  pax: '_pax',
  pickupType: '_pickupType',
  pickupId: '_pickupId',
  pickupLabel: '_pickupLabel',
  dropoffType: '_dropoffType',
  dropoffId: '_dropoffId',
  dropoffLabel: '_dropoffLabel',
  /** From home quick form when user picks “Airport transfers only”. */
  quoteIntent: '_quoteIntent',
  /** ISO date `yyyy-mm-dd` when client has planned dates. */
  travelDateFrom: '_travelDateFrom',
  travelDateTo: '_travelDateTo',
  /** `yes` when client is already at Málaga (AGP); `no` for planned trips with dates. */
  alreadyAtMalagaAgp: '_alreadyAtMalagaAgp',
  /** `yes` when the client ticked terms acceptance on a website form. */
  termsAccepted: '_termsAccepted',
  /** ISO timestamp when terms were accepted at submit. */
  termsAcceptedAt: '_termsAcceptedAt'
} as const

/** Stored in `fields` / structured payload for select `tripArrivalMode`. */
export const TRIP_ARRIVAL_MODE = {
  planned: 'planned',
  alreadyAtAgp: 'already_at_agp'
} as const

/** Values for `ENQUIRY_STRUCTURED_FIELD_KEYS.pickupType` / `dropoffType` when structured. */
export const PICKUP_DROPOFF_TYPES = {
  malagaAirport: 'malaga_airport',
  hotel: 'hotel',
  golfCourse: 'golf_course',
  freeText: 'free_text'
} as const

export const QUOTE_INTENTS = {
  airportOnly: 'airport_only',
  fullTrip: 'full_trip',
  golfTeeTimes: 'golf_tee_times'
} as const
