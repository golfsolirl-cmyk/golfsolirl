import { GeHotelCard } from '../components/hotel-card'
import { GeSection } from '../components/ge-section'
import { hotelListsCopy } from '../data/copy'
import { hotelsSpain } from '../data/hotels'

export function GeAccommodationSpain() {
  return (
    <GeSection background="white" id="accommodation-spain" className="pt-14 pb-12">
      <div className="text-center">
        <h2 className="font-ge text-[1.85rem] font-extrabold uppercase tracking-[0.04em] text-ge-teal sm:text-[2.2rem]">
          {hotelListsCopy.spainHeading}
        </h2>
        <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-16 rounded-full bg-ge-orange" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {hotelsSpain.map((hotel) => (
          <GeHotelCard key={hotel.name} hotel={hotel} />
        ))}
      </div>
    </GeSection>
  )
}
