import { SmartWhatsAppPanel } from '../components/smart-whatsapp-panel'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { contactInfo, finalCtaCopy } from '../data/copy'
import { getSmartPageWhatsAppConfig, type SmartEnquiryType, type TransportEnquiryDraft } from '../../../lib/smart-enquiry'

interface GeFinalCtaProps {
  readonly pathname?: string
  readonly pageTitle?: string
  readonly interestPreset?: string
  readonly enquiryType?: SmartEnquiryType
  readonly transportDraft?: TransportEnquiryDraft
}

export function GeFinalCta({
  pathname = '/',
  pageTitle,
  interestPreset,
  enquiryType,
  transportDraft
}: GeFinalCtaProps = {}) {
  const smartWhatsAppConfig = getSmartPageWhatsAppConfig({
    pathname,
    pageTitle,
    interestPreset,
    enquiryType,
    transportDraft
  })

  return (
    <GeSection id="enquire" background="ink" className="pt-24 pb-24">
      <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <div className="text-center lg:text-left">
          <h2 className="font-ge text-[2.05rem] font-extrabold uppercase leading-[1.1] tracking-[0.03em] text-white sm:text-[2.6rem]">
            {finalCtaCopy.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-ge text-[1.03rem] leading-7 text-white/86 sm:text-[1.1rem] sm:leading-8 lg:mx-0">
            Send your dates and group size and we will come back with a clear plan, quickly.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <GeButton href={`mailto:${contactInfo.email}`} variant="gs-gold" size="lg">
              {finalCtaCopy.cta}
            </GeButton>
            <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-gs-white" size="lg">
              Call {contactInfo.phoneDisplay}
            </GeButton>
          </div>
        </div>
        <SmartWhatsAppPanel
          tone="dark"
          eyebrow="Smart quote shortcuts"
          title="Open the right WhatsApp conversation in one tap"
          intro="Choose the shortcut that best matches the kind of trip help you want right now."
          primaryLabel={smartWhatsAppConfig.primaryLabel}
          primaryHelper={smartWhatsAppConfig.primaryHelper}
          primaryMessage={smartWhatsAppConfig.primaryMessage}
          quickActions={smartWhatsAppConfig.quickActions}
        />
      </div>
    </GeSection>
  )
}
