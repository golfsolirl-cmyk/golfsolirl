# Golf Sol Ireland — Master Build Plan implementation status

Reference: Master Plan PDF (GolfSolIreland-Master-Plan.pdf) and Section 15 implementation order.

## Phase 1 — Foundation ✅

- [x] **1.** Install dependencies — run: `npm install @prisma/client prisma resend stripe @stripe/stripe-js @stripe/react-stripe-js leaflet react-leaflet react-icons @lottiefiles/react-lottie-player react-day-picker date-fns next-auth @auth/prisma-adapter` and `npm install -D @types/leaflet`
- [x] **2.** Prisma schema + DB connection — `prisma/schema.prisma`, `src/lib/db.ts`
- [x] **3.** Phone number sitewide — `087 446 4766` / `tel:+353874464766` in `src/lib/constants.ts`
- [x] **4.** Logo shamrock + hero bubble — Shamrock uses `text-primary` (brand green). Hero tagline: "Costa del Sol" wrapped in `.animate-bubble` with CSS keyframe in `globals.css`
- [x] **5.** Bunny Fonts — Google Fonts removed from `layout.tsx`; Bunny link added; `--font-playfair`, `--font-dm-sans`, `--font-dancing`, `--font-outfit` in `globals.css`
- [x] **6.** Transfers section on landing — `src/components/sections/Transfers.tsx` between Accommodation and How It Works

## Phase 2 — Pages ✅

- [x] **7.** About Us — `src/app/about/page.tsx`
- [x] **8.** Transfers page — `src/app/transfers/page.tsx`
- [x] **9.** Courses page + Leaflet map — `src/app/courses/page.tsx`, `CoursesMapClient.tsx`, `src/components/courses/CoursesMap.tsx`, `src/lib/courses-data.ts`
- [x] **10.** Packages page — `src/app/packages/page.tsx` (Starter / Classic / Premium, mock pricing)
- [x] **11.** Contact page + Resend — `src/app/contact/page.tsx`, `ContactForm.tsx`, `src/app/api/contact/route.ts`
- [x] **12.** Complaint page — `src/app/complaint/page.tsx`, `ComplaintForm.tsx`, `src/app/api/complaint/route.ts`
- [x] **13.** Navbar + Footer — `NAV_ITEMS` and footer links updated; Bluesky added to social; Complaint link in footer

**Booking page:** `src/app/booking/page.tsx` stub with placeholder (full form in Phase 3).

## Phase 3 — Auth & Booking ✅

- [x] **14.** next-auth with Resend magic link — `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/login/page.tsx`, SessionProvider, Prisma Account/Session/VerificationToken
- [x] **15.** Multi-step booking form — `src/components/booking/BookingForm.tsx` (5 steps: details, package/dates, courses, accommodation, review & pay)
- [x] **16.** Booking API + DB write — `src/app/api/booking/create/route.ts` (creates User if needed, Booking, Stripe session)
- [x] **17.** Stripe checkout (deposit only) — same route, `src/lib/stripe.ts`
- [x] **18.** Stripe webhook — `src/app/api/webhooks/stripe/route.ts` (checkout.session.completed → DEPOSIT_PAID, send emails)
- [x] **19.** Booking confirmation page — `src/app/booking/confirmation/page.tsx`

## Phase 4 — Emails ✅

- [x] **20.** React Email template — `src/emails/BookingConfirmation.tsx` (booking ref, dates, deposit/balance)
- [x] **21.** Wire confirmation + admin notification in Stripe webhook; contact/complaint already use Resend
- [ ] **22.** Test all email flows (manual)

## Phase 5 — Admin Dashboard ✅

- [x] **23.** Admin layout + auth guard — `src/app/admin/layout.tsx` (getServerSession, ADMIN only)
- [x] **24.** Bookings table + detail — `src/app/admin/bookings/page.tsx`, `src/app/admin/bookings/[id]/page.tsx`
- [x] **25.** Enquiries — `src/app/admin/enquiries/page.tsx`; contact form saves to Enquiry table
- [x] **26.** Stats dashboard — `src/app/admin/page.tsx` (total bookings, deposits, balance outstanding, this month, unread enquiries)
- [x] **27.** CSV export — `src/app/admin/bookings/export/route.ts`

## Phase 6 — User Dashboard ✅

- [x] **28.** User dashboard — `src/app/user/page.tsx` (my bookings), `src/app/user/layout.tsx` (auth guard)
- [x] **29.** Magic link login — login page uses callbackUrl (e.g. /admin or /user)

## Phase 7 — Extras ✅

- [x] **30.** WhatsApp floating button — `src/components/layout/WhatsAppButton.tsx` (fixed bottom-right), added to root layout
- [ ] **31.** WhatsApp chatbot (Twilio) — optional; not implemented (add `app/api/whatsapp/route.ts` when needed)
- [x] **32.** Balance reminder cron — `src/app/api/cron/balance-reminder/route.ts`, `vercel.json` (daily 09:00 UTC); set CRON_SECRET in Vercel
- [ ] **33.** QA + mobile check (manual)

---

**Env:** Copy `.env.example` to `.env.local`. Contact and Complaint APIs send email only when `RESEND_API_KEY` is set.

**DB:** After `npm install`, run `npx prisma generate`. Use `npx prisma db push` (dev) or `npx prisma migrate deploy` (prod) when `DATABASE_URL` is set.
