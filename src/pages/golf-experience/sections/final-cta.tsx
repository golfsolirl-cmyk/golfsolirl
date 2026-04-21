import { MessageCircle } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { contactInfo, finalCtaCopy } from '../data/copy'
import { buildWhatsAppHref, createHomeWhatsAppMessage } from '../lib/whatsapp'

interface GeFinalCtaProps {
  readonly whatsappMessage?: string
}

export function GeFinalCta({ whatsappMessage = createHomeWhatsAppMessage() }: GeFinalCtaProps) {
  const whatsappHref = buildWhatsAppHref(whatsappMessage)

  return (
    <GeSection id="enquire" background="ink" className="pt-24 pb-24">
      <div className="text-center">
        <h2 className="font-ge text-[2.05rem] font-extrabold uppercase leading-[1.1] tracking-[0.03em] text-white sm:text-[2.6rem]">
          {finalCtaCopy.title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl font-ge text-[1.03rem] leading-7 text-white/86 sm:text-[1.1rem] sm:leading-8">
          Send your dates and group size and we will come back with a clear plan, quickly.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          <GeButton href={`mailto:${contactInfo.email}`} variant="gs-gold" size="lg">
            {finalCtaCopy.cta}
          </GeButton>
          <GeButton href={whatsappHref} target="_blank" rel="noopener noreferrer" variant="gs-green" size="lg">
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp us
          </GeButton>
          <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-gs-white" size="lg">
            Call {contactInfo.phoneDisplay}
          </GeButton>
        </div>
      </div>
    </GeSection>
  )
}
