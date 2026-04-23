import { GeSection } from '../components/ge-section'
import { accommodationIntroCopy } from '../data/copy'

export function GeAccommodationIntro() {
  return (
    <GeSection background="soft" className="pt-16 pb-16 sm:pt-20 sm:pb-20">
      <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gs-green/14 bg-white px-4 py-2 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-gs-green shadow-[0_12px_24px_rgba(6,59,42,0.08)]">
            Costa del Sol stays
          </span>
          <p className="mt-5 font-ge text-[0.94rem] font-bold uppercase tracking-[0.16em] text-gs-green/70 sm:text-[0.98rem]">
            {accommodationIntroCopy.eyebrow}
          </p>
          <h2 className="mt-3 max-w-[14ch] font-ge text-[2rem] font-extrabold uppercase leading-tight tracking-[0.02em] text-gs-dark sm:text-[2.25rem]">
            {accommodationIntroCopy.title}
          </h2>
        </div>
        <div className="rounded-[1.8rem] border border-white/80 bg-white/92 p-6 shadow-[0_24px_50px_rgba(69,53,24,0.08)] ring-1 ring-[#e8dfcc] backdrop-blur-sm sm:p-7">
          <div aria-hidden="true" className="h-[3px] w-20 rounded-full bg-gradient-to-r from-gs-gold via-gs-gold-light to-transparent" />
          <p className="mt-5 font-ge text-[1.08rem] leading-8 text-ge-gray500 sm:text-[1.12rem]">
            {accommodationIntroCopy.body}
          </p>
        </div>
      </div>
    </GeSection>
  )
}
