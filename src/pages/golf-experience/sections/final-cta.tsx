import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { contactInfo, finalCtaCopy } from '../data/copy'

export function GeFinalCta() {
  return (
    <GeSection id="enquire" background="ink" className="pt-20 pb-20">
      <div className="text-center">
        <h2 className="font-ge text-[1.85rem] font-extrabold uppercase leading-tight tracking-[0.04em] text-white sm:text-[2.4rem]">
          {finalCtaCopy.title}
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
