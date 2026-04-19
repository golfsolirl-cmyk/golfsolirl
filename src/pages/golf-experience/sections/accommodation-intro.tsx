import { GeSection } from '../components/ge-section'
import { accommodationIntroCopy } from '../data/copy'

export function GeAccommodationIntro() {
  return (
    <GeSection background="teal" className="pt-14 pb-14">
      <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
        <div>
          <p className="font-ge text-[0.85rem] font-bold uppercase tracking-[0.18em] text-white/85">
            {accommodationIntroCopy.eyebrow}
          </p>
          <h2 className="mt-3 font-ge text-[1.7rem] font-extrabold uppercase leading-tight tracking-[0.02em] text-white sm:text-[2rem]">
            {accommodationIntroCopy.title}
          </h2>
        </div>
        <p className="font-ge text-base leading-8 text-white/95">
          {accommodationIntroCopy.body}
        </p>
      </div>
    </GeSection>
  )
}
