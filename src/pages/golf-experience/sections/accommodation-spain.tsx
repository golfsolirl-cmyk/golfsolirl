import { SmartEnquiryButton } from '../components/smart-enquiry-button'
import { GeHotelCard } from '../components/hotel-card'
import { GeSection } from '../components/ge-section'
import { hotelListsCopy } from '../data/copy'
import { hotelsSpain } from '../data/hotels'

export function GeAccommodationSpain() {
  return (
    <GeSection background="white" id="accommodation-spain" className="pt-16 pb-16 sm:pt-20 sm:pb-20">
      <div className="text-center">
        <h2 className="font-ge text-[2rem] font-extrabold uppercase leading-tight tracking-[0.04em] text-gs-green sm:text-[2.35rem]">
          {hotelListsCopy.spainHeading}
        </h2>
        <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gs-gold" />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {hotelsSpain.map((hotel) => (
          <GeHotelCard key={hotel.name} hotel={hotel} />
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-3">
        <SmartEnquiryButton
          intent="accommodation"
          sourceLabel="Homepage accommodation section"
          label={hotelListsCopy.cta}
          notes="Need hotel and stay-and-play ideas"
          variant="gs-gold"
          size="md"
        />
        <p className="max-w-xl text-center font-ge text-sm leading-6 text-ge-gray500">
          Smart hotel brief opens with dates, group size, and preferred base already framed for WhatsApp.
        </p>
      </div>
    </GeSection>
  )
}
