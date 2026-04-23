import { GeSection } from '../components/ge-section'
import { accommodationIntroCopy } from '../data/copy'

export function GeAccommodationIntro() {
  return (
    <GeSection background="blue" className="pt-14 pb-14">
      <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
        <div>
          <p className="font-ge text-[0.94rem] font-bold uppercase tracking-[0.16em] text-white/90 sm:text-[0.98rem]">
            {accommodationIntroCopy.eyebrow}
          </p>
          <h2 className="mt-3 font-ge text-[2rem] font-extrabold uppercase leading-tight tracking-[0.02em] text-white sm:text-[2.2rem]">
            {accommodationIntroCopy.title}
          </h2>
        </div>
        <p className="font-ge text-[1.08rem] leading-8 text-white/95 sm:text-[1.12rem]">
          {accommodationIntroCopy.body}
        </p>
      </div>
    </GeSection>
  )
}
