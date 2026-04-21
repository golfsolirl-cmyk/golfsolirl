export type FooterArticleSection = {
  readonly title: string
  readonly body: string
  readonly bullets?: readonly string[]
}

export type FooterArticleContent = {
  readonly metaTitle: string
  readonly metaDescription?: string
  readonly kicker: string
  readonly heroTitle: string
  readonly heroBody: string
  readonly sections: readonly FooterArticleSection[]
  readonly asideQuote?: { readonly text: string; readonly attribution: string }
  readonly formTitle?: string
  readonly formLead?: string
  readonly interestPreset?: string
  readonly enquiryType?: 'booking' | 'legal' | 'newsletter' | 'testimonial' | 'support'
}

export const footerArticlePages: Record<string, FooterArticleContent> = {
  '/golf-packages': {
    metaTitle: 'Golf packages | Golf Sol Ireland',
    metaDescription:
      'Explore Costa del Sol golf packages built for Irish golfers, with joined-up planning across golf, hotels, and airport transfers.',
    kicker: 'Explore — shaped for Irish golfers',
    heroTitle: 'Golf packages that feel joined-up, not bolted together',
    heroBody:
      'We build Costa del Sol trips as one coherent plan: the right courses, a base that matches your group, and transfers that do not waste daylight. No brochure filler — just a cleaner route from enquiry to first tee.',
    sections: [
      {
        title: 'Package thinking, not catalogue picking',
        body: 'Every package starts from how you actually travel: group size, appetite for nightlife versus quiet evenings, and how many rounds feel right before fatigue wins. From there we align hotel tier, course mix, and transfer rhythm so the week has a natural pace.',
        bullets: [
          'Society-friendly pacing with buffer around key tee times',
          'Clear inclusions so the group knows what is covered',
          'Room to upgrade or tighten without starting from scratch'
        ]
      },
      {
        title: 'What you see before you book',
        body: 'You get a readable outline: suggested courses, stay level, transfer style, and indicative pricing — so the committee or WhatsApp group can decide without decoding spreadsheets. When you are ready, we move to formal confirmation and deposits.',
        bullets: ['Transparent trip shape before money changes hands', 'Irish-led follow-up on phone or WhatsApp', 'Adjustments until the plan feels right']
      }
    ],
    asideQuote: {
      text: 'The best weeks are not the busiest — they are the ones where every day has a reason.',
      attribution: 'Golf Sol Ireland'
    },
    formTitle: 'Ask about golf packages',
    formLead: 'Tell us your dates, group size, and preferred package style. We will come back with a sharper next step.',
    interestPreset: 'Golf packages',
    enquiryType: 'booking'
  },
  '/featured-courses': {
    metaTitle: 'Featured courses | Golf Sol Ireland',
    metaDescription:
      'See featured Costa del Sol golf courses recommended for Irish golf trips, with routing and availability context that helps groups decide faster.',
    kicker: 'Explore — championship calibre',
    heroTitle: 'Featured courses worth building a week around',
    heroBody:
      'The Costa del Sol is dense with courses. We spotlight layouts that reward Irish travellers: memorable conditioning, sensible routing from your base, and variety across links feel, parkland polish, and stadium tests.',
    sections: [
      {
        title: 'Course-first shortlists',
        body: 'We group options by character and drive time, not by brochure prestige alone. You might blend a marquee round with quieter tracks that photograph badly but play brilliantly — the mix is what makes the trip feel bespoke.',
        bullets: ['Marbella to Sotogrande routing without dead mileage', 'Alternatives if tee sheets shift', 'Respect for handicap spread across the group']
      },
      {
        title: 'Tee time reality',
        body: 'Prime slots move fast. We work with preferred supplier relationships where they help, and we are honest when a date needs flex. The goal is confirmed golf you can trust — not a pretty PDF with asterisks.',
        bullets: ['Early visibility on high-demand courses', 'Rain and wind contingencies where practical', 'Clear notes on dress code and buggy rules']
      }
    ],
    asideQuote: {
      text: 'A great trip is a playlist, not a single track on repeat.',
      attribution: 'Course planning notes'
    },
    formTitle: 'Ask for a course shortlist',
    formLead: 'Share your base, dates, and handicap spread and we will suggest rounds that suit your group.',
    interestPreset: 'Featured golf courses',
    enquiryType: 'booking'
  },
  '/accommodation-tiers': {
    metaTitle: 'Accommodation tiers | Golf Sol Ireland',
    metaDescription:
      'Compare Costa del Sol accommodation tiers for Irish golf trips, from smart social bases to full five-star resort stays.',
    kicker: 'Explore — stay that matches the trip',
    heroTitle: 'Accommodation tiers from smart bases to full luxury',
    heroBody:
      'Your hotel is more than a bed — it sets the social rhythm, the breakfast energy, and how far you haul clubs each morning. We work in clear tiers so budgets and expectations stay aligned.',
    sections: [
      {
        title: 'Three to five star, explained honestly',
        body: 'Tiers map to service level, location strength, and how the property handles groups — not just star stickers. We tell you where a four-star punches above its weight and where a five-star earns the premium.',
        bullets: ['Sea-view versus golf-view trade-offs', 'Twin and double room mixes for societies', 'Late-bar noise versus quiet wings']
      },
      {
        title: 'Matching stay to your group',
        body: 'A Cork society on a first Costa trip often wants different energy than a couples escape. We match base, board, and proximity to dining so evenings feel easy after 36 holes.',
        bullets: ['Half-board when early tee times dominate', 'Apartment-style options for longer stays', 'Parking and bag storage practicalities']
      }
    ],
    formTitle: 'Get matched stay options',
    formLead: 'Tell us the trip style and budget you have in mind and we will shortlist the right accommodation level.',
    interestPreset: 'Accommodation tiers',
    enquiryType: 'booking'
  },
  '/airport-transfers': {
    metaTitle: 'Airport transfers | Golf Sol Ireland',
    metaDescription:
      'Plan Malaga airport transfers for Costa del Sol golf groups, with vehicles sized for golf bags, route timing, and week-long movement support.',
    kicker: 'Explore — Malaga and beyond',
    heroTitle: 'Airport transfers that start the trip calmly',
    heroBody:
      'Malaga is the usual front door, but not every group lands there. We plan meet-and-greet flow, vehicle size for bags and people, and realistic timing so nobody is sprinting from the belt to the minibus.',
    sections: [
      {
        title: 'Right vehicle, right door',
        body: 'Golf bags change the maths fast. We specify vehicles that fit clubs without Tetris stress, and we align pickup zones with how each terminal actually works — especially in peak season.',
        bullets: ['Named driver contact where available', 'Child seats and accessibility requests flagged early', 'Flight delay buffer built into quotes']
      },
      {
        title: 'Beyond the airport run',
        body: 'Return transfers, golf-day hops, and a mid-week base change are often part of the same puzzle. We prefer one coherent transfer plan over a patchwork of apps and receipts.',
        bullets: ['Golf-day timing aligned with tee sheets', 'Hotel-to-hotel moves without double-paying', 'Clear per-leg pricing for the treasurer']
      }
    ],
    asideQuote: {
      text: 'The holiday starts when the airport stress ends.',
      attribution: 'Transfer planning'
    },
    formTitle: 'Plan airport transfers',
    formLead: 'Send us your airport, group size, and destination so we can map the cleanest arrival flow.',
    interestPreset: 'Airport transfers',
    enquiryType: 'booking'
  },
  '/tailored-itinerary': {
    metaTitle: 'Tailored itinerary | Golf Sol Ireland',
    metaDescription:
      'Build a tailored Costa del Sol golf itinerary with balanced pacing, realistic routing, and clear travel-week structure for Irish groups.',
    kicker: 'Plan your trip — bespoke pacing',
    heroTitle: 'Tailored itineraries with breathing room',
    heroBody:
      'A strong itinerary protects the best rounds with sensible gaps, builds in one slow morning without guilt, and keeps dinners within reach. We draft for real humans, not robots with unlimited energy.',
    sections: [
      {
        title: 'Day-by-day flow',
        body: 'You will see suggested order of play, travel times in plain language, and notes on sunset dinners or early nights. Tweaks are expected — the first draft is a conversation starter, not a contract.',
        bullets: ['36-hole days only where the group wants them', 'Pool or spa windows for non-golfers', 'Backup plans when weather misbehaves']
      },
      {
        title: 'Locked when it matters',
        body: 'Once deposits land and suppliers confirm, we freeze what must not move and keep flexibility where it helps. You always know which parts are firm and which are still adjustable.',
        bullets: ['Single timeline the whole group can share', 'WhatsApp-friendly summaries', 'PDF outline for the club committee']
      }
    ],
    formTitle: 'Start your itinerary brief',
    formLead: 'Share the outline of your trip and we will help shape a day-by-day plan that works in the real world.',
    interestPreset: 'Tailored itinerary',
    enquiryType: 'booking'
  },
  '/course-shortlist': {
    metaTitle: 'Course shortlist | Golf Sol Ireland',
    metaDescription:
      'Request a Costa del Sol course shortlist based on your base, dates, and handicap range, with practical advice for Irish golf groups.',
    kicker: 'Plan your trip — decisive golf',
    heroTitle: 'A course shortlist that respects your handicap spread',
    heroBody:
      'We narrow dozens of options to a tight list with rationale: why each course fits your dates, your base, and your mix of low and high handicappers. You spend less time scrolling and more time imagining the shots.',
    sections: [
      {
        title: 'How we cut the list',
        body: 'Distance from base, tee sheet pressure, walking policy, and post-round vibe all score points. We are happy to defend every pick — and to swap if your gut says otherwise.',
        bullets: ['A-list and B-list courses for flexibility', 'Notes on slope, length, and forced carries', 'Photogenic finales without punishing fronts']
      },
      {
        title: 'From shortlist to booked',
        body: 'Once the group signs off, we chase availability in the right order so you do not lose a keystone round while debating the fourth name on the list.',
        bullets: ['Parallel holds where suppliers allow', 'Clear expiry times on options', 'Deposit triggers explained upfront']
      }
    ],
    formTitle: 'Request a course shortlist',
    formLead: 'Tell us where you are staying and what level of golf you want and we will narrow the right options.',
    interestPreset: 'Course shortlist',
    enquiryType: 'booking'
  },
  '/hotel-matching': {
    metaTitle: 'Hotel matching | Golf Sol Ireland',
    metaDescription:
      'Get Costa del Sol hotel matching for your golf trip, based on budget, group personality, evenings, and logistics that actually matter.',
    kicker: 'Plan your trip — the right base',
    heroTitle: 'Hotel matching tied to how you use the evenings',
    heroBody:
      'Some groups want rooftop cocktails and walkable old town; others want early nights and a quiet corridor. We match property style, board basis, and location to the personality of your trip.',
    sections: [
      {
        title: 'Questions that matter',
        body: 'We ask about noise tolerance, breakfast urgency, parking, and whether anyone needs elevator-close rooms. Those answers steer the shortlist more than brand names alone.',
        bullets: ['Rooming lists handled with diplomacy', 'Interconnecting or adjacent rooms on request', 'Loyalty programme notes where useful']
      },
      {
        title: 'When tiers shift mid-plan',
        body: 'If budget or dates move, we remap quickly — swapping a base without unraveling the whole golf plan is part of the job.',
        bullets: ['Apples-to-apples comparisons', 'Refund and change rules summarised', 'No shame in downgrading to win on golf spend']
      }
    ],
    formTitle: 'Get hotel matching help',
    formLead: 'Share your group style, budget, and preferred base and we will recommend a better-fit hotel shortlist.',
    interestPreset: 'Hotel matching',
    enquiryType: 'booking'
  },
  '/group-preferences': {
    metaTitle: 'Group preferences | Golf Sol Ireland',
    metaDescription:
      'Capture group preferences for Costa del Sol golf travel, from rooming and mobility needs to extras and budgeting for Irish societies.',
    kicker: 'Plan your trip — societies & friends',
    heroTitle: 'Group preferences captured without the chaos',
    heroBody:
      'Societies, work outings, and mixed friend groups all carry different politics. We capture preferences once, reconcile conflicts early, and give the organiser language they can forward to the chat.',
    sections: [
      {
        title: 'Who decides what',
        body: 'We help clarify whether the treasurer, captain, or rotating committee holds the final say — so changes do not ping-pong. Deadlines for names, deposits, and dietary needs are spelled out.',
        bullets: ['Single spreadsheet-style summary on request', 'Deposit collection strategies that do not embarrass anyone', 'Dietary and mobility notes passed to hotels']
      },
      {
        title: 'Fairness on extras',
        body: 'Buggies, caddies, and premium replay rounds split groups if not agreed early. We surface typical costs so nobody feels blindsided at the pro shop.',
        bullets: ['Optional extras flagged before travel', 'Kit hire and shoe rental reminders', 'Tipping customs in plain English']
      }
    ],
    asideQuote: {
      text: 'Good group travel is half logistics, half diplomacy.',
      attribution: 'Group planning'
    },
    formTitle: 'Tell us about your group',
    formLead: 'Share the group type, likely numbers, and any sensitivities and we will help shape the trip around them.',
    interestPreset: 'Group preferences',
    enquiryType: 'booking'
  },
  '/irish-group-planning': {
    metaTitle: 'Irish group planning | Golf Sol Ireland',
    metaDescription:
      'Golf trip planning for Irish groups travelling to the Costa del Sol, with departure patterns, budgets, and booking style handled properly.',
    kicker: 'Travel support — Irish lens',
    heroTitle: 'Irish group planning with Costa del Sol fluency',
    heroBody:
      'We speak the same society-captain and WhatsApp-treasurer language you do — while knowing which bases actually work for Irish departure patterns and jet lag.',
    sections: [
      {
        title: 'Departure realism',
        body: 'Dublin, Shannon, and Cork timings shape how we set first-day golf. We avoid cruel 6am tee times after late arrivals unless your group insists on pain.',
        bullets: ['Flight-first or golf-first builds', 'Baggage and club carriage reminders', 'Insurance nudges without fear-mongering']
      },
      {
        title: 'Money clarity',
        body: 'Irish groups often split costs in specific ways. We quote in euros with plain-English notes on what is per person, per room, or per vehicle so the treasurer stays sane.',
        bullets: ['VAT-inclusive framing where relevant', 'FX awareness without pretending to predict rates', 'Receipt trails for committees']
      }
    ],
    formTitle: 'Plan an Irish group trip',
    formLead: 'Tell us where your group is flying from and how you usually plan, and we will help with a cleaner Costa del Sol setup.',
    interestPreset: 'Irish group planning',
    enquiryType: 'booking'
  },
  '/costa-del-sol-routing': {
    metaTitle: 'Costa del Sol routing | Golf Sol Ireland',
    metaDescription:
      'Understand Costa del Sol routing for golf trips, with realistic drive times, corridor planning, and less dead mileage across the week.',
    kicker: 'Travel support — geography that saves time',
    heroTitle: 'Costa del Sol routing that trims dead miles',
    heroBody:
      'The coast looks compact on a map until you are stuck in summer traffic with clubs in the back. We sequence rounds and nights so you are not bouncing between extremes without reason.',
    sections: [
      {
        title: 'Corridor thinking',
        body: 'Marbella, Nueva Andalucía, Estepona, and Sotogrande all have different rush-hour personalities. We route days around realistic drive bands, not best-case GPS fantasies.',
        bullets: ['Lunch stops that do not wreck tee times', 'Beach detours that fit 9-hole personalities', 'Night moves timed for tolls and events']
      },
      {
        title: 'When the plan should zigzag',
        body: 'Sometimes two longer drives unlock unbeatable golf pairings. We flag those trade-offs openly so you choose with eyes open.',
        bullets: ['Scenic versus fast motorway choices', 'Toll costs folded into comparisons', 'Parking realities at popular clubs']
      }
    ],
    formTitle: 'Get routing help',
    formLead: 'Share the courses or areas you are considering and we will advise on a cleaner route across the week.',
    interestPreset: 'Costa del Sol routing',
    enquiryType: 'booking'
  },
  '/transfer-coordination': {
    metaTitle: 'Transfer coordination | Golf Sol Ireland',
    metaDescription:
      'Coordinate Costa del Sol golf transfers around tee times, hotel pickups, and group luggage with one joined-up movement plan.',
    kicker: 'Travel support — seamless movement',
    heroTitle: 'Transfer coordination that survives real-world delays',
    heroBody:
      'Drivers, hotels, and pro shops only line up when someone owns the clock. We coordinate pick-ups against tee times, build slack where motorways fail, and keep contacts in one place.',
    sections: [
      {
        title: 'Single thread of truth',
        body: 'You should not chase five WhatsApps to find today’s driver. We consolidate confirmations and share what the captain needs — without drowning the group in PDFs.',
        bullets: ['24-hour contact paths where available', 'Hotel concierge briefed when helpful', 'Replay of changes after weather moves']
      },
      {
        title: 'Golf bags are awkward cargo',
        body: 'Vans, trailers, and roof boxes behave differently. We specify what fits so nobody learns at the kerb that the third bag will not close the door.',
        bullets: ['Club protection basics on the road', 'Shared versus private transfer trade-offs', 'Last-minute size changes escalated fast']
      }
    ],
    formTitle: 'Coordinate transfers',
    formLead: 'Send your golf-day movements and hotel details and we will help map the transfer plan.',
    interestPreset: 'Transfer coordination',
    enquiryType: 'booking'
  },
  '/booking-follow-up': {
    metaTitle: 'Booking follow-up | Golf Sol Ireland',
    metaDescription:
      'See how Golf Sol Ireland handles booking follow-up, deposit momentum, and pre-departure clarity for Costa del Sol golf groups.',
    kicker: 'Travel support — after you say yes',
    heroTitle: 'Booking follow-up that keeps momentum',
    heroBody:
      'The dangerous gap is between “we’re in” and paid deposits. We follow up with clear steps, who owes what, and when options expire — respectful nudges, not spam.',
    sections: [
      {
        title: 'What happens next',
        body: 'You get a concise checklist: deposit amount, balance schedule, names required, and any passport or dietary deadlines. We mirror this on email and WhatsApp if you prefer.',
        bullets: ['Named invoices where suppliers require them', 'Reminder timing before deadlines', 'Escalation if tee holds are melting']
      },
      {
        title: 'Pre-departure polish',
        body: 'Closer to travel we recap transfers, tee times, and hotel contacts. The goal is a calm group chat the night before flights, not a scavenger hunt.',
        bullets: ['Final rooming checks', 'Local emergency numbers', 'Simple map pins for meet points']
      }
    ],
    asideQuote: {
      text: 'Momentum is a luxury — we protect it after you commit.',
      attribution: 'Client care'
    },
    formTitle: 'Ask about booking follow-up',
    formLead: 'If your group is already moving toward a booking, we can help clarify the next milestones.',
    interestPreset: 'Booking follow-up',
    enquiryType: 'support'
  },
  '/deposit-upfront': {
    metaTitle: '20% deposit upfront | Golf Sol Ireland',
    metaDescription:
      'Understand how the upfront deposit works for Costa del Sol golf trips, including what it secures and how group changes are handled.',
    kicker: 'Booking details — how deposits work',
    heroTitle: '20% deposit upfront to lock real inventory',
    heroBody:
      'Hotels and courses release holds quickly in peak season. The deposit secures what we have quoted against real availability — not a hypothetical basket that evaporates overnight.',
    sections: [
      {
        title: 'What the deposit covers',
        body: 'Typically it confirms your core land package: accommodation allocation, agreed rounds, and planned transfers as outlined. Flights stay separate unless we explicitly include them — which is rare.',
        bullets: ['Supplier-specific deposit rules summarised', 'Non-refundable angles explained before you pay', 'Receipts issued for treasurers']
      },
      {
        title: 'If someone drops out',
        body: 'Groups change. We walk through how substitutions work, whether empty beds carry a penalty, and when names must be final for the hotel.',
        bullets: ['Name-change windows where flexible', 'Minimum numbers for contracted rates', 'Good-faith efforts to refill beds']
      }
    ],
    formTitle: 'Ask about deposits',
    formLead: 'Send your booking question and we will clarify how deposits work before you commit.',
    interestPreset: 'Deposit upfront',
    enquiryType: 'support'
  },
  '/final-balance-terms': {
    metaTitle: 'Final balance terms | Golf Sol Ireland',
    metaDescription:
      'Review final balance timing and payment terms for Costa del Sol golf trips, translated into plain English for Irish groups.',
    kicker: 'Booking details — balances',
    heroTitle: 'Final balance terms without spreadsheet shock',
    heroBody:
      'Balance timing follows supplier contracts — usually a clear date before travel. We translate contract language into dates and amounts your group can plan around.',
    sections: [
      {
        title: 'Typical schedule',
        body: 'After deposit, the remaining balance is often due several weeks before arrival — sometimes tighter for peak weeks. You will see exact dates on your written proposal before you commit.',
        bullets: ['Currency and payment method options', 'Reminder timing before deadlines', 'What happens if a payment is late']
      },
      {
        title: 'Extras after balance',
        body: 'Buggies, spa, and pro-shop spend usually stay on personal cards. We flag likely extras so nobody confuses them with the package balance.',
        bullets: ['Estimated spend bands for common extras', 'Club policies on cash versus card', 'Tips and service charges in context']
      }
    ],
    formTitle: 'Ask about balance timing',
    formLead: 'If you need clarity on payment dates or balance terms, send a quick question here.',
    interestPreset: 'Final balance terms',
    enquiryType: 'support'
  },
  '/no-obligation-enquiry': {
    metaTitle: 'No-obligation enquiry | Golf Sol Ireland',
    metaDescription:
      'Start a no-obligation Costa del Sol golf enquiry with Golf Sol Ireland and get thoughtful guidance before any booking commitment.',
    kicker: 'Booking details — start easy',
    heroTitle: 'No-obligation enquiry — ask without pressure',
    heroBody:
      'Tell us dates, group size, and how you like to travel. We respond with thoughtful guidance first — not a hard sell. If the fit is not there, we will say so.',
    sections: [
      {
        title: 'What to send',
        body: 'Rough dates, departure airport, handicap spread, and hotel appetite are enough to start. Budget range helps — even a wide band — so we do not pitch the wrong tier.',
        bullets: ['Phone or WhatsApp if you prefer voice', 'Committee-friendly summaries on request', 'Honest “not this year” answers when needed']
      },
      {
        title: 'When it becomes binding',
        body: 'Nothing is a confirmed booking until deposits are accepted and suppliers confirm in writing. Until then, you are exploring — we keep the tone calm and clear.',
        bullets: ['Written milestones for each step', 'Cooling-off clarity where applicable', 'Data handled for enquiry only — see privacy notes on the site']
      }
    ],
    asideQuote: {
      text: 'The best enquiries feel like a chat at the bar, not a tribunal.',
      attribution: 'First contact'
    },
    formTitle: 'Start a no-obligation enquiry',
    formLead: 'Tell us the outline of your trip and we will come back with calm, useful guidance.',
    interestPreset: 'No-obligation enquiry',
    enquiryType: 'booking'
  },
  '/terms-and-conditions': {
    metaTitle: 'Terms & conditions | Golf Sol Ireland',
    metaDescription:
      'Read the plain-language terms and conditions overview for Golf Sol Ireland golf travel planning and Costa del Sol bookings.',
    kicker: 'Booking details — legal clarity',
    heroTitle: 'Terms & conditions — plain-language overview',
    heroBody:
      'This page summarises how Golf Sol Ireland approaches bookings, changes, and liability. It is not a substitute for the formal terms attached to your proposal — read those carefully before you pay.',
    sections: [
      {
        title: 'Agency role',
        body: 'We arrange travel elements with third-party suppliers. Contracts for flights, hotels, golf, and transport typically sit between you and those suppliers once confirmed, while we coordinate on your behalf.',
        bullets: ['Supplier rules on changes and refunds win where they exist', 'We pass through material updates as soon as we receive them', 'Questions on a live booking go through your named contact']
      },
      {
        title: 'Pricing & changes',
        body: 'Quotes reflect availability at the time of enquiry. Until deposit and written confirmation, prices and inventory can move — especially for prime tee times and peak weeks.',
        bullets: ['Taxes and resort fees disclosed when known', 'Force majeure handled per supplier policy', 'Travel insurance strongly recommended']
      },
      {
        title: 'Full wording',
        body: 'Your proposal and confirmation emails contain the enforceable terms for your specific trip, including cancellation and payment clauses. Keep them with your travel documents.',
        bullets: ['Ask us to explain any clause you are unsure about', 'Escalate disputes early — dates rarely improve when delayed', 'Irish and EU consumer frameworks may apply depending on services booked']
      }
    ],
    formTitle: 'Ask a terms question',
    formLead: 'If anything in the terms needs clarification, send your question and we will explain it plainly.',
    interestPreset: 'Terms and conditions',
    enquiryType: 'legal'
  }
}

export const isFooterArticlePath = (path: string): boolean => path in footerArticlePages

export const getFooterArticlePage = (path: string): FooterArticleContent | null => footerArticlePages[path] ?? null
