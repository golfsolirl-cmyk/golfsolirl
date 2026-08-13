# Image Audit — Golf Sol Ireland

Completed: 2026-08-13  
Scope: full public marketing surface (sitemap + GE content routes + SEO landings).  
Stack note: Vite + React (not Next.js). Heroes use existing `PremiumPageHero` / `<picture>` responsive WebP — no `next/image`.

---

## Existing Images Protected

Approved library heroes and brand assets were **not modified, replaced, renamed, cropped, or overwritten**.

Pages / surfaces left on their existing approved imagery include:

| Surface | Existing imagery kept |
|---|---|
| `/` homepage | Fleet hero set (`816cf7dc-…`) |
| `/packages` | `packages-hero-v3-*` |
| `/services/transport` | `transport-hero-coastal-drive-*` |
| Twilight routes | `twilight-golf-hero-*` |
| Legal / privacy / terms | `ge-premium-trust-legal-hero-*` |
| About / IAGTO | `about-golfsol-hero-*` |
| News / newsletter | `ge-premium-editorial-travel-news.webp` |
| Testimonials | group testimonial plate (via kind) |
| Accommodation hub + hotel cards | resort hotel hero + `/images/hotels/*` cards |
| FAQ | `transport-moment-arrivals.webp` |
| Contact / booking category pages | fleet cover family |
| Logos / crest / favicons / business-card art | unchanged |

---

## Missing Images Found

Destination, Ireland-departure, package-type, transfer, and course-corridor SEO pages were sharing a handful of generic plates (`imgFairway` / `imgHotel` / `imgGroup` / `imgFleet` / coastal transfer). That made doorway-style pages visually identical.

| URL | Page | Section | Why an image was appropriate |
|---|---|---|---|
| `/golf-holidays` | Golf holidays hub | Hero | Needs Ireland→Sol travel identity |
| `/golf-holidays/costa-del-sol` | Costa del Sol hub | Hero | Destination overview |
| `/golf-holidays/malaga` | Málaga holidays | Hero | Was mis-classified as transport; needs destination golf imagery |
| `/golf-holidays/marbella` | Marbella | Hero | Destination-specific scenery |
| `/golf-holidays/mijas` | Mijas | Hero | Destination-specific scenery |
| `/golf-holidays/estepona` | Estepona | Hero | Western-corridor destination |
| `/golf-holidays/fuengirola` | Fuengirola | Hero | Town/seafront identity (was generic hotel) |
| `/golf-holidays/benalmadena` | Benalmádena | Hero | Marina/resort identity |
| `/golf-holidays/torremolinos` | Torremolinos | Hero | Airport-convenient coast identity |
| `/golf-holidays-spain-from-ireland` (+ Dublin/Cork/Shannon/Belfast) | Ireland departures | Hero | Distinct departure intent |
| `/golf-packages/*` night + society/group/bespoke | Package types | Hero | Distinct trip-length / group intent |
| `/transfers/malaga-airport-golf-transfers` | AGP transfers | Hero | Transfer-specific (reused approved asset) |
| `/transfers/golf-group-transfers` | Group transfers | Hero | Group vehicle logistics |
| `/golf-courses/marbella-golf-valley` | Course corridor | Hero | Corridor-specific |
| `/golf-courses/mijas-fuengirola` | Course corridor | Hero | Corridor-specific |
| `/golf-courses/sotogrande` | Course corridor | Hero | Corridor-specific |

Also fixed: kind inference treated any path containing `malaga` as transport, so `/golf-holidays/malaga` could not show a destination hero.

---

## New Images Added

All new files live under `public/images/{destinations,departures,packages,courses,transfers}/` with base + `-desktop` / `-tablet` / `-mobile` WebP variants (~1536×1024 source → 1920 / 1200 / 900×1200 crops).

### Destinations

| Page URL | Filename (base) | Format | Approx. desktop | Alt (summary) | Purpose |
|---|---|---|---|---|---|
| `/golf-holidays` | `destinations/golf-holidays-costa-del-sol-hub.webp` | WebP | 1536×1024 | Ireland→Sol golf travel arrival | Hub hero |
| `/golf-holidays/costa-del-sol` | `destinations/costa-del-sol-golf-holiday-overview.webp` | WebP | 1536×1024 | Coastal Costa del Sol golf overview | Destination hero |
| `/golf-holidays/malaga` | `destinations/malaga-golf-holiday-costa-del-sol.webp` | WebP | 1536×1024 | Eastern Sol coastal fairway near Málaga | Destination hero |
| `/golf-holidays/marbella` | `destinations/marbella-golf-holiday-costa-del-sol.webp` | WebP | 1536×1024 | Marbella championship fairway | Destination hero |
| `/golf-holidays/mijas` | `destinations/mijas-golf-holiday-costa-del-sol.webp` | WebP | 1536×1024 | Mijas hillside golf | Destination hero |
| `/golf-holidays/estepona` | `destinations/estepona-golf-holiday-costa-del-sol.webp` | WebP | 1536×1024 | Estepona western Sol golf | Destination hero |
| `/golf-holidays/fuengirola` | `destinations/fuengirola-golf-holiday-costa-del-sol.webp` | WebP | 1536×1024 | Fuengirola seafront | Destination hero |
| `/golf-holidays/benalmadena` | `destinations/benalmadena-golf-holiday-costa-del-sol.webp` | WebP | 1536×1024 | Benalmádena marina hills | Destination hero |
| `/golf-holidays/torremolinos` | `destinations/torremolinos-golf-holiday-costa-del-sol.webp` | WebP | 1536×1024 | Torremolinos beach coast | Destination hero |

### Ireland departures

| Page URL | Filename (base) |
|---|---|
| `/golf-holidays-spain-from-ireland` | `departures/golf-holidays-spain-from-ireland.webp` |
| `/golf-holidays-spain-from-dublin` | `departures/golf-holidays-spain-from-dublin.webp` |
| `/golf-holidays-spain-from-cork` | `departures/golf-holidays-spain-from-cork.webp` |
| `/golf-holidays-spain-from-shannon` | `departures/golf-holidays-spain-from-shannon.webp` |
| `/golf-holidays-spain-from-belfast` | `departures/golf-holidays-spain-from-belfast.webp` |

### Packages

| Page URL | Filename (base) |
|---|---|
| `/golf-packages/3-night-golf-breaks` | `packages/3-night-golf-break-costa-del-sol.webp` |
| `/golf-packages/4-night-golf-breaks` | `packages/4-night-golf-break-costa-del-sol.webp` |
| `/golf-packages/5-night-golf-holidays` | `packages/5-night-golf-holiday-costa-del-sol.webp` |
| `/golf-packages/7-night-golf-holidays` | `packages/7-night-golf-holiday-costa-del-sol.webp` |
| `/golf-packages/golf-society-packages` | `packages/golf-society-packages-costa-del-sol.webp` |
| `/golf-packages/group-golf-holidays` | `packages/group-golf-holidays-costa-del-sol.webp` |
| `/golf-packages/bespoke-golf-packages` | `packages/bespoke-golf-packages-costa-del-sol.webp` |

### Course corridors

| Page URL | Filename (base) |
|---|---|
| `/golf-courses/marbella-golf-valley` | `courses/marbella-golf-valley-corridor.webp` |
| `/golf-courses/mijas-fuengirola` | `courses/mijas-fuengirola-golf-corridor.webp` |
| `/golf-courses/sotogrande` | `courses/sotogrande-golf-corridor.webp` |

### Transfers

| Page URL | Filename (base) | Notes |
|---|---|---|
| `/transfers/malaga-airport-golf-transfers` | `transfers/malaga-airport-golf-transfers.webp` | **Reused** from approved `hero-malaga-transfer-desktop.webp` (new copies only) |
| `/transfers/golf-group-transfers` | `transfers/golf-group-transfers-costa-del-sol.webp` | New generated group-transfer scene |

Wiring: `src/data/seo-landing-pages.ts`, course overrides in `src/pages/golf-experience/data/content-pages.ts`, hero preference in `content-page-hero-config.ts` + `content-page-context.ts`, responsive base registry in `page-hero-images.ts`.

---

## Pages Left Without Images (intentionally)

| Page type | Reason |
|---|---|
| Legal / privacy / terms | Trust/legal desk plate is sufficient; lifestyle photos would mislead |
| FAQ / dress-code guides | Utility/Q&A; existing functional imagery is enough |
| News / newsletter | Editorial plate is enough |
| Auth, dashboards, driver, PDF samples, brand tools | Not public marketing; robots.txt disallows many |
| SEO guides (`/guides/best-*`, trip guide, FAQ guide) | Kept shared fairway/group plates — guide intent is informational; unique heroes reserved for destination/commerce pages |
| Society organisation guide | Kept shared group plate (society package page has the unique society hero) |

---

## Broken Images Fixed

1. **`heroImageSetFromBase` 404 risk** — previously always appended `-desktop/-tablet/-mobile` even when siblings did not exist (e.g. fairway plate). Now only uses responsive siblings for verified bases; otherwise reuses the base file.
2. **`/golf-holidays/malaga` kind override** — `malaga` substring forced the transport coastal hero over the page’s destination image. Destination `/golf-holidays*` paths now stay on page-owned heroes.
3. **SEO landing hero overrides** — category kind inference no longer replaces page-specific SEO heroes (and course-corridor pages).

No pre-existing image binary was edited or overwritten.

---

## Implementation notes

- Vite project: responsive `<picture>` via `PremiumPageHero` (not Next.js `Image`).
- `robots.txt` allows `/` and does not block `/images/`; `sitemap-images.xml` is already referenced.
- Helper script: `scripts/process-audit-hero-images.mjs` (generation pipeline only; safe to keep).
