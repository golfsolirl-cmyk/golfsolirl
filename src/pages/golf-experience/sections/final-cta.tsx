import { GeButton } from '../components/ge-button'
import { GeDualPhoneFinalCtaRow } from '../components/ge-dual-phone-contact'
import { GeSection } from '../components/ge-section'
import { finalCtaCopy } from '../data/copy'

export function GeFinalCta() {
  return (
    <GeSection id="final-ask" background="white" className="pt-20 pb-24 sm:pt-24">
      <div className="relative overflow-hidden rounded-2xl border border-black/[0.04] bg-[#f7faf8] px-6 py-14 text-center shadow-[0_4px_16px_rgba(0,0,0,0.04)] sm:px-12 sm:py-16">
        <div className="relative">
          <p className="font-ge text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-gs-green sm:text-[0.76rem]">
            Ready when you are
          </p>
          <h2 className="mx-auto mt-4 max-w-4xl font-ge text-[2rem] font-extrabold leading-[1.1] tracking-[-0.025em] text-gs-dark sm:text-[2.6rem]">
            {finalCtaCopy.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-ge text-[0.95rem] leading-7 text-ge-gray500 sm:text-[1.05rem] sm:leading-8">
            Dates, how many of you, and where you want to stay. We reply with a clear plan.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4">
            <GeButton href="/contact" variant="gs-green" size="lg">
              {finalCtaCopy.cta}
            </GeButton>
            <GeDualPhoneFinalCtaRow />
          </div>
        </div>
      </div>
    </GeSection>
  )
}
