import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarOff, Sparkles } from 'lucide-react'
import { formatBookedDayShortLabel, upcomingBookedDaysSorted } from '../lib/booked-service-days'
import { getLocalDateIso } from '../lib/local-date-iso'

export type BookedNoticeTone = 'golf' | 'forest'

export interface BookedDatesAvailabilityNoticeProps {
  readonly bookedDays: ReadonlySet<string>
  /** Any yyyy-mm-dd (or datetime) strings the user has entered — highlights clashes. */
  readonly watchDates?: readonly (string | null | undefined)[]
  readonly tone?: BookedNoticeTone
  readonly className?: string
}

function sliceDay(raw: string | null | undefined) {
  if (typeof raw !== 'string') {
    return ''
  }
  return raw.trim().slice(0, 10)
}

export function BookedDatesAvailabilityNotice({
  bookedDays,
  watchDates = [],
  tone = 'golf',
  className = ''
}: BookedDatesAvailabilityNoticeProps) {
  const today = getLocalDateIso()
  const upcoming = useMemo(() => upcomingBookedDaysSorted(bookedDays, today, 16), [bookedDays, today])

  const conflictingDays = useMemo(() => {
    const out: string[] = []
    for (const raw of watchDates) {
      const d = sliceDay(raw)
      if (d.length === 10 && bookedDays.has(d) && !out.includes(d)) {
        out.push(d)
      }
    }
    return out
  }, [watchDates, bookedDays])

  if (bookedDays.size === 0) {
    return null
  }

  const shell =
    tone === 'forest'
      ? 'border border-amber-200/90 bg-gradient-to-br from-amber-50/95 via-white to-[#f4faf6] text-forest-900 shadow-[0_12px_40px_rgba(180,130,20,0.12)]'
      : 'border border-gs-gold/40 bg-gradient-to-br from-[#fffdf8] via-white to-[#eef8f3] text-gs-dark shadow-[0_14px_44px_rgba(6,59,42,0.1)]'

  const chip =
    tone === 'forest'
      ? 'border border-amber-300/70 bg-white/90 text-forest-900'
      : 'border border-gs-green/20 bg-white/95 text-gs-dark'

  const clashShell =
    tone === 'forest'
      ? 'border border-rose-200 bg-rose-50/90 text-rose-950'
      : 'border border-ge-orange/40 bg-orange-50/95 text-gs-dark'

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <AnimatePresence initial={false}>
        {conflictingDays.length > 0 ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 ${clashShell}`}
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: -6 }}
            key="clash"
            role="alert"
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <p className="flex items-start gap-2 font-ge text-sm font-bold leading-snug sm:text-[0.95rem]">
              <CalendarOff className="mt-0.5 h-4 w-4 shrink-0 text-ge-orange" aria-hidden />
              <span>
                That date is on our <span className="text-ge-orange">fully booked</span> list — the form won&apos;t send until you pick
                open dates. Call or WhatsApp us if you need an exception.
              </span>
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5 pl-6 font-ge text-xs font-semibold sm:text-[0.82rem]">
              {conflictingDays.map((d) => (
                <li className={`rounded-full px-2.5 py-0.5 ${chip}`} key={d}>
                  {formatBookedDayShortLabel(d)}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {upcoming.length > 0 ? (
        <div className={`rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 ${shell}`}>
          <div className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                tone === 'forest'
                  ? 'bg-gradient-to-br from-gold-400/95 to-amber-200/90 text-forest-950'
                  : 'bg-gradient-to-br from-gs-gold/90 to-amber-200/80 text-gs-dark'
              }`}
            >
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-ge-orange sm:text-[0.7rem]">
                Diary snapshot
              </p>
              <p className="mt-1 font-ge text-sm leading-relaxed text-ge-gray600 sm:text-[0.95rem]">
                We&apos;re <strong className="font-semibold text-gs-dark">fully booked</strong> for new enquiries on the dates below.
                Choose other travel dates, or reach out — we&apos;ll see what we can do.
              </p>
              <ul
                className="mt-3 flex max-h-[5.5rem] flex-wrap gap-1.5 overflow-y-auto pr-1 font-ge text-[0.78rem] font-semibold sm:max-h-none sm:text-[0.8rem]"
                aria-label="Fully booked dates"
              >
                {upcoming.map((d) => (
                  <li className={`rounded-full px-2.5 py-1 ${chip}`} key={d}>
                    {formatBookedDayShortLabel(d)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
