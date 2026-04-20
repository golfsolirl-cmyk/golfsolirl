import { GeButton } from '../components/ge-button'
import { GeHotelCard } from '../components/hotel-card'
import { GeSection } from '../components/ge-section'
import { hotelListsCopy } from '../data/copy'
import { hotelsPortugal } from '../data/hotels'

export function GeAccommodationPortugal() {
  return (
    <GeSection background="gray" id="accommodation-portugal" className="pt-12 pb-14">
      <div className="text-center">
        <h2 className="font-ge text-[1.85rem] font-extrabold uppercase tracking-[0.04em] text-gs-green sm:text-[2.2rem]">
          {hotelListsCopy.portugalHeading}
        </h2>
        <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gs-green" />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {hotelsPortugal.map((hotel) => (
          <GeHotelCard key={hotel.name} hotel={hotel} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <GeButton href="#" variant="blue" size="md">
          {hotelListsCopy.cta}
        </GeButton>
      </div>
    </GeSection>
  )
}
