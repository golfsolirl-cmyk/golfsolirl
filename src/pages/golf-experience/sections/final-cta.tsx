import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { finalCtaCopy } from '../data/copy'

export function GeFinalCta() {
  return (
    <GeSection
      id="enquire"
      background="teal"
      className="pt-20 pb-20"
      topDivider={{ fill: '#f3f3f3', variant: 'simple' }}
    >
      <div className="text-center">
        <h2 className="font-ge text-[1.85rem] font-extrabold uppercase leading-tight tracking-[0.04em] text-white sm:text-[2.4rem]">
          {finalCtaCopy.title}
        </h2>
        <div className="mt-8 flex justify-center">
          <GeButton href="mailto:info@golfexperience.net" variant="orange" size="lg">
            {finalCtaCopy.cta}
          </GeButton>
        </div>
      </div>
    </GeSection>
  )
}
