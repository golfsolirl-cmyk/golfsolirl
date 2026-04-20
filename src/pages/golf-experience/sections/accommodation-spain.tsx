import { GeButton } from '../components/ge-button'
import { GeHotelCard } from '../components/hotel-card'
import { GeSection } from '../components/ge-section'
import { hotelListsCopy } from '../data/copy'
import { hotelsSpain } from '../data/hotels'

export function GeAccommodationSpain() {
  return (
    <GeSection background="white" id="accommodation-spain" className="pt-14 pb-14">
      <div className="text-center">
        <h2 className="font-ge text-[1.85rem] font-extrabold uppercase tracking-[0.04em] text-gs-green sm:text-[2.2rem]">
          {hotelListsCopy.spainHeading}
        </h2>
        <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gs-gold" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {hotelsSpain.map((hotel) => (
          <GeHotelCard key={hotel.name} hotel={hotel} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <GeButton href="/#enquire" variant="gs-gold" size="md">
          {hotelListsCopy.cta}
        </GeButton>
      </div>
    </GeSection>
  )
}
