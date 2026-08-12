import { useMemo, useState } from 'react'
import { AIRPORT_CORRIDOR_HOTELS } from '../data/airport-corridor-hotels'
import { COURSES } from '../data/coastal-golf-data'
import { cx } from '../lib/utils'
import { LuxuryButton } from './ui/button'
import type { AdminEnquiryCardRow } from './admin-enquiry-card-queue'

export type EnquiryTripPlan = {
  includeTransfers: boolean
  includeGolf: boolean
  includeHotel: boolean
  partySize: number
  courseIds: string[]
  hotelSlug: string
}

const defaultPlan = (): EnquiryTripPlan => ({
  includeTransfers: true,
  includeGolf: false,
  includeHotel: false,
  partySize: 4,
  courseIds: [],
  hotelSlug: ''
})

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8] as const

type AdminEnquiryTripBuilderProps = {
  readonly row: AdminEnquiryCardRow
  readonly accessToken: string | null
  readonly priceEurInput: string
  readonly onNote: (message: string) => void
}

export function AdminEnquiryTripBuilder({
  row,
  accessToken,
  priceEurInput,
  onNote
}: AdminEnquiryTripBuilderProps) {
  const [plan, setPlan] = useState<EnquiryTripPlan>(() => defaultPlan())
  const [busy, setBusy] = useState(false)
  const [courseFilter, setCourseFilter] = useState('')
  const [hotelFilter, setHotelFilter] = useState('')

  const courseNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of COURSES) {
      map.set(c.id, c.name)
    }
    return map
  }, [])

  const filteredCourses = useMemo(() => {
    const q = courseFilter.trim().toLowerCase()
    if (!q) {
      return COURSES
    }
    return COURSES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)
    )
  }, [courseFilter])

  const filteredHotels = useMemo(() => {
    const q = hotelFilter.trim().toLowerCase()
    if (!q) {
      return AIRPORT_CORRIDOR_HOTELS
    }
    return AIRPORT_CORRIDOR_HOTELS.filter((h) => h.name.toLowerCase().includes(q))
  }, [hotelFilter])

  const selectedHotelName = AIRPORT_CORRIDOR_HOTELS.find((h) => h.slug === plan.hotelSlug)?.name ?? ''
  const selectedCourseNames = plan.courseIds
    .map((id) => courseNameById.get(id))
    .filter((n): n is string => Boolean(n))

  const summaryLines = () => {
    const lines: string[] = [
      `Party size: ${plan.partySize} ${plan.partySize === 1 ? 'golfer' : 'golfers'}`,
      `Enquiry: ${row.reference_id}`
    ]
    if (plan.includeTransfers) {
      lines.push('Transfers: included')
    } else {
      lines.push('Transfers: not included')
    }
    if (plan.includeGolf) {
      lines.push(
        selectedCourseNames.length
          ? `Golf courses: ${selectedCourseNames.join(', ')}`
          : 'Golf courses: included (courses to confirm)'
      )
    } else {
      lines.push('Golf courses: not included')
    }
    if (plan.includeHotel) {
      lines.push(selectedHotelName ? `Accommodation: ${selectedHotelName}` : 'Accommodation: included (hotel to confirm)')
    } else {
      lines.push('Accommodation: not included')
    }
    return lines
  }

  const toggleCourse = (id: string) => {
    setPlan((prev) => {
      const has = prev.courseIds.includes(id)
      return {
        ...prev,
        courseIds: has ? prev.courseIds.filter((x) => x !== id) : [...prev.courseIds, id]
      }
    })
  }

  const saveTripToGuest = async () => {
    if (!accessToken) {
      onNote('Sign in again as admin.')
      return
    }
    if (!plan.includeTransfers && !plan.includeGolf && !plan.includeHotel) {
      onNote('Turn on at least one of: transfers, golf, or accommodation.')
      return
    }
    if (plan.includeGolf && plan.courseIds.length === 0) {
      onNote('Pick at least one golf course, or turn golf off.')
      return
    }
    if (plan.includeHotel && !plan.hotelSlug) {
      onNote('Pick a hotel, or turn accommodation off.')
      return
    }

    const price = Number(String(priceEurInput).replace(/,/g, '.').trim())
    if (!Number.isFinite(price) || price < 0.5) {
      onNote('Enter a total price above (Add a price) before saving the trip to the guest.')
      return
    }

    const email = row.email.trim().toLowerCase()
    if (!email.includes('@')) {
      onNote('This form has no email — cannot publish to a guest dashboard.')
      return
    }

    const lines = summaryLines()
    const summary = lines.join('\n')
    const titleParts = [
      plan.includeTransfers ? 'Transfers' : null,
      plan.includeGolf ? 'Golf' : null,
      plan.includeHotel ? 'Hotel' : null
    ].filter(Boolean)
    const title = `${titleParts.join(' · ')} · ${plan.partySize}p · ${row.reference_id}`

    // One publish line for the guest dashboard (primary kind = first included service)
    const kind = plan.includeTransfers ? 'transfer' : plan.includeGolf ? 'golf' : 'hotel'

    setBusy(true)
    try {
      const res = await fetch('/api/package-build-admin-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          clientEmail: email,
          kind,
          title,
          summary,
          priceEur: price
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        onNote(data.message ?? 'Could not publish trip to guest dashboard.')
        return
      }

      // Also leave a clear note in their message thread
      await fetch('/api/enquiry-admin-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          enquiryId: row.id,
          category: plan.includeTransfers ? 'transfers' : plan.includeGolf ? 'golf_courses' : 'hotels',
          body: `Trip update for ${row.reference_id}:\n\n${summary}\n\nTotal quote: €${price.toFixed(2)}`
        })
      }).catch(() => null)

      onNote('Trip choices saved — guest dashboard updated and a message was added to their thread.')
    } catch (e) {
      onNote(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-forest-100 bg-white px-4 py-5 shadow-sm sm:px-5">
      <h4 className="font-display text-lg font-semibold text-forest-950">Build their trip</h4>
      <p className="mt-1 text-sm text-forest-600">
        Tick what to include, pick people / courses / hotel, then save to their dashboard.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {(
          [
            ['includeTransfers', 'Transfers'],
            ['includeGolf', 'Golf courses'],
            ['includeHotel', 'Accommodation']
          ] as const
        ).map(([key, label]) => {
          const on = plan[key]
          return (
            <button
              className={cx(
                'rounded-xl border px-3 py-3 text-left text-sm font-semibold transition',
                on
                  ? 'border-fairway-500 bg-fairway-50 text-forest-950'
                  : 'border-forest-200 bg-offwhite/70 text-forest-500'
              )}
              key={key}
              onClick={() => setPlan((p) => ({ ...p, [key]: !p[key] }))}
              type="button"
            >
              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">
                {on ? 'Included' : 'Not included'}
              </span>
              {label}
            </button>
          )
        })}
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700">People (1–8)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PARTY_SIZES.map((n) => (
            <button
              className={cx(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition',
                plan.partySize === n
                  ? 'bg-forest-900 text-white'
                  : 'border border-forest-200 bg-white text-forest-800 hover:bg-fairway-50'
              )}
              key={n}
              onClick={() => setPlan((p) => ({ ...p, partySize: n }))}
              type="button"
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {plan.includeGolf ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700">
              Golf courses {plan.courseIds.length ? `(${plan.courseIds.length})` : ''}
            </p>
            <input
              className="w-full max-w-xs rounded-lg border border-forest-200 bg-offwhite px-3 py-2 text-sm outline-none focus:border-fairway-500 sm:w-auto"
              onChange={(e) => setCourseFilter(e.target.value)}
              placeholder="Search courses…"
              type="search"
              value={courseFilter}
            />
          </div>
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-forest-100 bg-offwhite/50 p-2">
            {filteredCourses.map((c) => {
              const checked = plan.courseIds.includes(c.id)
              return (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-white">
                    <input
                      checked={checked}
                      className="mt-0.5 h-4 w-4 rounded border-forest-300 text-fairway-600"
                      onChange={() => toggleCourse(c.id)}
                      type="checkbox"
                    />
                    <span>
                      <span className="font-medium text-forest-950">{c.name}</span>
                      <span className="mt-0.5 block text-xs text-ge-gray500">{c.region}</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {plan.includeHotel ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700">Accommodation</p>
            <input
              className="w-full max-w-xs rounded-lg border border-forest-200 bg-offwhite px-3 py-2 text-sm outline-none focus:border-fairway-500 sm:w-auto"
              onChange={(e) => setHotelFilter(e.target.value)}
              placeholder="Search hotels…"
              type="search"
              value={hotelFilter}
            />
          </div>
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-forest-100 bg-offwhite/50 p-2">
            {filteredHotels.map((h) => {
              const checked = plan.hotelSlug === h.slug
              return (
                <li key={h.slug}>
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-white">
                    <input
                      checked={checked}
                      className="mt-0.5 h-4 w-4 border-forest-300 text-fairway-600"
                      name={`hotel-${row.id}`}
                      onChange={() => setPlan((p) => ({ ...p, hotelSlug: h.slug }))}
                      type="radio"
                    />
                    <span>
                      <span className="font-medium text-forest-950">{h.name}</span>
                      <span className="mt-0.5 block text-xs text-ge-gray500">
                        {h.stars}★ · rating {h.rating}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 rounded-xl border border-forest-100 bg-offwhite/80 px-3 py-3 text-sm text-forest-800">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">Summary</p>
        <ul className="mt-2 list-disc space-y-0.5 pl-5">
          {summaryLines().map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <LuxuryButton
        className="!mt-4 !px-5 !py-2.5"
        disabled={busy}
        onClick={() => void saveTripToGuest()}
        type="button"
        variant="primary"
      >
        {busy ? 'Saving…' : 'Save trip to guest dashboard'}
      </LuxuryButton>
    </section>
  )
}
