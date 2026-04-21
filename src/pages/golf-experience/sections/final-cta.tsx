import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { contactInfo, finalCtaCopy } from '../data/copy'
import { buildGeneralWhatsAppMessage, buildWhatsAppHref } from '../../../lib/smart-enquiry'

export function GeFinalCta() {
  const whatsappHref = buildWhatsAppHref(
    `https://wa.me/${contactInfo.phoneTel.replace(/[^0-9]/g, '')}`,
    buildGeneralWhatsAppMessage({
      intro: "I'm enquiring from the homepage and would like help planning a Costa del Sol golf trip.",
      detailLines: [
        'Trip type: Golf holiday quote',
        'Group size: 1 to 8 golfers',
        'Help needed: Courses, hotel, and transfers'
      ],
      closing: 'Please send me the best next step.'
    })
  )

  return (
    <GeSection id="enquire" background="ink" className="pt-24 pb-24">
      <div className="text-center">
        <h2 className="font-ge text-[2.05rem] font-extrabold uppercase leading-[1.1] tracking-[0.03em] text-white sm:text-[2.6rem]">
          {finalCtaCopy.title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl font-ge text-[1.03rem] leading-7 text-white/86 sm:text-[1.1rem] sm:leading-8">
          Send your dates and group size and we will come back with a clear plan, quickly.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <GeButton href={whatsappHref} variant="gs-gold" size="lg" rel="noreferrer" target="_blank">
            Smart WhatsApp Quote
          </GeButton>
          <GeButton href={`mailto:${contactInfo.email}`} variant="gs-gold" size="lg">
            {finalCtaCopy.cta}
          </GeButton>
          <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-gs-white" size="lg">
            Call {contactInfo.phoneDisplay}
          </GeButton>
        </div>
      </div>
    </GeSection>
  )
}
