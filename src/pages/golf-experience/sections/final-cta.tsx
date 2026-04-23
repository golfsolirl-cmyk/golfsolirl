import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { contactInfo, finalCtaCopy } from '../data/copy'

export function GeFinalCta() {
  return (
    <GeSection id="enquire" background="soft" className="pt-24 pb-24">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#d9d2c1] bg-white px-6 py-10 text-center shadow-[0_26px_70px_rgba(40,33,19,0.12)] sm:px-10 sm:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,199,44,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(6,59,42,0.08),_transparent_28%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-gs-gold/90 to-transparent"
        />
        <div className="relative">
          <p className="font-ge text-[0.82rem] font-bold uppercase tracking-[0.22em] text-gs-green sm:text-[0.86rem]">
            Ready when you are
          </p>
          <h2 className="mx-auto mt-4 max-w-4xl font-ge text-[2.05rem] font-extrabold uppercase leading-[1.08] tracking-[0.03em] text-gs-dark sm:text-[2.6rem]">
            {finalCtaCopy.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-ge text-[1.03rem] leading-7 text-ge-gray500 sm:text-[1.1rem] sm:leading-8">
            Send your dates and group size and we will come back with a clear plan, quickly.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <GeButton href={`mailto:${contactInfo.email}`} variant="gs-gold" size="lg">
              {finalCtaCopy.cta}
            </GeButton>
            <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-gs-green" size="lg">
              <span className="sm:hidden">Call us</span>
              <span className="hidden sm:inline">Call {contactInfo.phoneDisplay}</span>
            </GeButton>
          </div>
        </div>
      </div>
    </GeSection>
  )
}
