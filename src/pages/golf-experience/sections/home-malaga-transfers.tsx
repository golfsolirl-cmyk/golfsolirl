import { MalagaTransferRequestForm } from '../components/malaga-transfer-request-form'
import { GeSection } from '../components/ge-section'

/** Homepage section — dedicated Málaga Airport transfer request form. */
export function GeHomeMalagaTransfers() {
  return (
    <GeSection
      id="malaga-transfers"
      background="cream"
      innerClassName="relative !pt-16 pb-16 sm:!pt-20 sm:pb-20 scroll-mt-28"
      className="relative isolate overflow-hidden bg-cream"
    >
      <div className="mx-auto max-w-[640px]">
        <MalagaTransferRequestForm />
      </div>
    </GeSection>
  )
}
