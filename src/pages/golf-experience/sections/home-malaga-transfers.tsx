import { WEBSITE_ENQUIRY_FORM } from '../../../lib/enquiry-form-registry'
import { SmartTripQuoteForm } from '../components/smart-trip-quote-form'
import { GeSection } from '../components/ge-section'

/** Homepage section — Malaga transfers via shared trip-builder (transfers preselected). */
export function GeHomeMalagaTransfers() {
  return (
    <GeSection
      id="malaga-transfers"
      background="cream"
      innerClassName="relative !pt-16 pb-16 sm:!pt-20 sm:pb-20 scroll-mt-28"
      className="relative isolate overflow-hidden bg-cream"
    >
      <div className="mx-auto max-w-[640px]">
        <SmartTripQuoteForm
          formId="malaga-transfer-form"
          lead="Airport transfers preselected — add accommodation or golf if you need them."
          preset={{
            services: { transfers: true, accommodation: false, golf_courses: false },
            pageLabel: '/',
            formKey: WEBSITE_ENQUIRY_FORM.malagaAirportTransfer
          }}
          title="Transfers from Málaga Airport"
        />
      </div>
    </GeSection>
  )
}
