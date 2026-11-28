import { ExternalLink } from 'lucide-react'
import { TripadvisorOwlMark } from '../tripadvisor-badge'
import { getTripadvisorWriteReviewHref } from '../../lib/tripadvisor'

/**
 * Compact homepage trust strip — live on Tripadvisor, no invented ratings.
 * Place near past-customers gallery / testimonials, not in the hero.
 */
export function TripadvisorNowLiveCard() {
  const href = getTripadvisorWriteReviewHref()

  return (
    <aside
      aria-label="Tripadvisor"
      className="mx-auto mt-10 max-w-[40rem] border-t border-[#d4a843]/30 pt-8 text-center sm:mt-12"
    >
      <div className="inline-flex items-center justify-center gap-3">
        <TripadvisorOwlMark className="h-9 w-9 shrink-0" />
        <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-[#34E0A1]">
          Now on Tripadvisor
        </p>
      </div>
      <p className="mx-auto mt-3 max-w-[28rem] font-ge text-[1.02rem] leading-7 text-[#f7f3ea]/85">
        Travelled with us? Leave a review — it helps the next Irish golf group choose with confidence.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#34E0A1]/55 bg-[#34E0A1]/12 px-5 py-2.5 font-ge text-[0.92rem] font-extrabold tracking-wide text-[#f7f3ea] transition-colors hover:border-[#34E0A1] hover:bg-[#34E0A1]/22"
      >
        Review us on Tripadvisor
        <ExternalLink className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
      </a>
    </aside>
  )
}
