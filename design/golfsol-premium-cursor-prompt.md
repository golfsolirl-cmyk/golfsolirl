# Cursor Master Prompt — GolfSol Ireland Exact Mockup Theme Conversion

You are a senior Vite + React + Tailwind engineer and luxury travel UI designer. Convert the existing GolfSol Ireland app into the exact visual language of the provided mockup while preserving the existing architecture, routes, Supabase logic, forms, dashboards, and business features.

## Non-negotiables
- Do not rebuild from scratch.
- Do not remove routes, Supabase calls, auth logic, form submission logic, admin logic, client dashboard logic, or email/PDF logic.
- Keep the existing layout flow, but completely replace the visual theme.
- Every page must look part of the same design system as the mockup.
- Homepage, admin dashboard, client dashboard, pricing, enquiry forms, transport pages, accommodation pages, golf course pages, testimonials, business cards, and email previews must all share this same cream/green/yellow luxury identity.

## Target feeling
The app must feel like a premium Irish-to-Costa-del-Sol golf concierge and executive Mercedes transfer platform: cinematic, clean, warm, trustworthy, mobile-first, luxury, and conversion-focused.

## Design target from the mockup
- Cream page background.
- Deep forest green brand surfaces.
- Yellow/gold CTA highlights.
- Rounded cards with subtle borders and shadows.
- Crest logo in header.
- Large uppercase hero: “FROM PLANE TO FAIRWAY.”
- Hero uses golf-course + mountain + Mercedes transfer imagery.
- Floating “24/7 Support” badge.
- Floating feature strip under hero.
- Country flags trust strip.
- Airport transfer card section.
- “Design Your Costa del Sol Golf Trip” dark green band.
- Process cards below.
- Premium admin CRM theme.
- Premium client booking portal theme.
- Mobile screens should look like the mockup, not just desktop scaled down.

## Mandatory pages/components to check
Search the codebase for these and restyle them if present:
- hero.tsx
- ge-navbar.tsx
- ge-footer.tsx
- home-enquiry.tsx
- business-cards-page.tsx
- admin-dashboard-page.tsx
- client-dashboard-page.tsx
- pricing pages/components
- enquiry form components
- transport pages/components
- accommodation pages/components
- golf course cards/list pages
- email-template-preview.tsx
- all dashboard cards/tables/forms/buttons

## Exact content style
Use direct, strong conversion copy:
- FROM PLANE TO FAIRWAY.
- Mercedes transfers. Golf-bag friendly.
- Your group looked after, gate to fairway.
- Irish-owned. Golf-bag friendly.
- All transfers fully insured.
- Irish & Spanish phone support.
- 24/7 flight monitoring.
- Arrive in Malaga. Let Us Do The Rest.
- Design Your Costa del Sol Golf Trip.
- Choose your destination. Choose your golf course. Choose your accommodation.
- Leave the rest to us.

## Global CSS / Tailwind direction
Create reusable classes/tokens for:
- .gs-page
- .gs-container
- .gs-card
- .gs-card-soft
- .gs-card-dark
- .gs-button-primary
- .gs-button-secondary
- .gs-pill
- .gs-section-label
- .gs-heading-xl
- .gs-heading-lg
- .gs-input
- .gs-dashboard-card
- .gs-table
- .gs-nav

## Colours
Use these tokens:
- forest: #064b35
- forestDark: #043626
- forestDeep: #012f23
- cream: #f7f1df
- creamSoft: #fbf7ec
- ivory: #fffaf0
- gold: #d7c600
- goldSoft: #eee35a
- olive: #7f8a42
- border: #e7dcc4
- ink: #10231c
- muted: #6f756c
- success: #0f7b45

## Typography
Use:
- Body: Inter or Manrope
- Headings: Inter ExtraBold for the punchy mockup feeling, optionally Playfair/Cormorant for editorial subheadings.
- Hero title: uppercase, extra-bold, tight line height.
- Section labels: uppercase, letter-spaced.

## Homepage implementation details
1. Header
- Cream/nav white surface with crest logo.
- Left brand: “MALAGA · COSTA DEL SOL” and “GOLF TRANSFERS”.
- Desktop nav: Home, Services, Golf Courses, Accommodation, Transport, More.
- Right CTA: Get Quote.
- Mobile nav: crest logo, phone circle, menu circle.

2. Hero
- Height: desktop around 620px; mobile around 520px minimum.
- Background: golf course, mountains, Costa del Sol light.
- Add Mercedes van image layered on right or integrated background.
- Overlay: left-to-right dark green gradient.
- Badge: “Malaga Airport Specialist”.
- Main title: FROM PLANE TO FAIRWAY.
- FARWAY/FAIRWAY word in yellow.
- Bullets with yellow check icons.
- CTAs: Book Your Transfer, Our Services.
- Floating 24/7 Support badge near top right.

3. Feature strip
Four dark green cards/icons:
- Airport Specialist
- Golf Bag Friendly
- Fully Insured
- Irish & Spanish Support

4. Flags strip
EU, UK, Ireland, Spain, Germany, Sweden, Denmark style flags plus text about EU/Scandinavian visitors and Malaga meet-and-greet Mercedes transfers.

5. Airport card section
Two-column desktop.
Left: large cream card with title “Arrive in Malaga. Let Us Do The Rest.” plus image and three mini cards.
Right: “Now Boarding / Airport transfers” live-status card with CTA and two phone buttons.

6. Trip builder band
Dark green rounded band with yellow microcopy and “Start Planning” CTA.
Below: four cards: Pick Your Sol Base, Pick Your Tee Times, Pick Your Hotel, Leave the rest to us.

7. Reviews
White/cream section with Tripadvisor-style cards.

8. Courses/Hotels
Continue with the same cream/green/yellow card system.

## Admin dashboard
Restyle only, do not break logic.
- Cream background.
- Left sidebar with logo/admin profile.
- Active item pale cream highlight.
- Stats cards white/ivory with thin border.
- Revenue chart green line.
- Tables clean, compact, rounded.
- Buttons dark green or gold.
- Inputs cream/white with green focus ring.

## Client dashboard
- Header with crest logo.
- Cream background.
- “My Bookings” heading in dark green.
- Tabs: Upcoming, Completed, Cancelled.
- Booking cards with date tile, route, passengers, vehicle, status badge, view/download buttons.

## Forms
- All form fields should be rounded, cream/white, subtle border.
- Submit buttons gold with dark green text.
- Section heading dark green.
- Use large spacing and labels.
- Keep form handlers and validation intact.

## Business cards
Create landscape and portrait designs matching the site:
- Cream + forest green + gold.
- Crest logo.
- Malaga · Costa del Sol Golf Transfers.
- QR area.
- Mercedes/golf background texture.
- Premium contact layout.

## Quality checks
After making changes:
- Run npm install if needed.
- Run npm run build.
- Run npx tsc --noEmit.
- Fix TypeScript errors caused by changes.
- Check desktop and mobile breakpoints.
- Confirm all pages still load.

## Final success standard
The app should look like the mockup everywhere, not just the homepage. It should feel like a finished premium launch-ready product with cohesive branding across public site, dashboards, forms, email templates, and business cards.
