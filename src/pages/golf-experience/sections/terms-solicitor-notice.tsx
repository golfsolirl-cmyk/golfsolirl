import { Scale } from 'lucide-react'

/**
 * Pre-launch legal reminder on the public terms page (for the business owner and their solicitor).
 */
export function TermsSolicitorNotice() {
  return (
    <aside
      className="border-y border-amber-700/35 bg-[#fff8e8] px-5 py-5 sm:px-8 sm:py-6"
      aria-labelledby="terms-solicitor-notice-heading"
    >
      <div className="mx-auto flex max-w-[1180px] gap-4 sm:items-start">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-800 text-white shadow-[0_8px_20px_rgba(120,53,15,0.25)]">
          <Scale className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2
            id="terms-solicitor-notice-heading"
            className="font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.16em] text-amber-950"
          >
            Legal review required before go-live
          </h2>
          <p className="mt-2 max-w-3xl font-ge text-[1rem] leading-7 text-amber-950/90 sm:text-[1.04rem]">
            These terms and conditions must be read and approved by a qualified solicitor before this website goes live
            for public bookings. Do not treat the copy below as final legal advice until your solicitor has signed it off.
          </p>
        </div>
      </div>
    </aside>
  )
}
