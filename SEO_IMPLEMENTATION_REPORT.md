# SEO Implementation Report — Golf Sol Ireland

## Executive summary

Golf Sol Ireland runs as a **Vite + React 19 SPA** (not Next.js). This phase strengthens organic search for Irish customers researching **Costa del Sol golf holidays** without redesigning page look/feel.

Delivered: homepage metadata + Organization/WebSite schema, a scalable SEO landing-page set (holidays, destinations, Ireland departures, packages, guides, transfers), breadcrumbs + crawlable internal links on content pages, robots/sitemap/image-sitemap upgrades, duplicate-URL 301 redirects, and `npm run seo:audit`.

**Architectural limit:** without prerender/SSR, some crawlers still see `index.html` first. Client `usePageMeta` / JSON-LD update after hydration. Next major upgrade: prerender key SEO URLs.

## Changes implemented

- Homepage title/description aligned to “Costa del Sol Golf Holidays from Ireland”
- Richer Organization / WebSite / WebPage JSON-LD (no fake ratings)
- 28 new intent-led landing pages via existing Ge content shell
- Breadcrumbs + linkified related bullets on content pages
- Sitemap includes footer + SEO routes; alias URLs excluded
- Image sitemap for key commercial URLs
- robots.txt expanded for private/utility paths
- vercel.json permanent redirects for duplicate aliases
- Footer explore links point to new SEO hubs
- `npm run seo:audit`

## Existing issues discovered

- Not Next.js — Metadata API / RSC guidance does not apply directly
- Duplicate marketing aliases (`/package`↔`/packages`, guide URL twins, etc.)
- Footer article routes were live but often missing from sitemap
- Transport page previously lacked `usePageMeta`
- SPA crawlability depends on JS for route-level meta
- Generic Facebook/TripAdvisor root URLs in places (not used in Organization `sameAs`)

## Pages created

See `src/data/seo-landing-page-paths.ts` (28 routes), including:

- `/golf-holidays` + Costa del Sol destination set
- Ireland departure hubs (Ireland/Dublin/Cork/Shannon/Belfast)
- Package length + society/group/bespoke pages
- Guides (courses, best time, trip guide, society how-to, FAQ)
- Transfer pages (AGP + group)

## Pages modified

- `index.html`, homepage meta/schema, content page SEO chrome
- Transport service meta
- Footer link groups
- robots.txt, sitemap generator, vercel redirects
- `site-seo.ts` origin → `https://www.golfsolirl.com`

## Redirects created

Listed in `vercel.json` (`/package`→`/packages`, `/airport-transfers`→new transfers URL, legacy guide aliases, etc.).

## Target keyword / search-intent map

| Intent | Primary URL |
|--------|-------------|
| Costa del Sol golf holidays from Ireland | `/` + `/golf-holidays` |
| Costa del Sol hub | `/golf-holidays/costa-del-sol` |
| Area intents (Málaga/Marbella/Mijas/…) | `/golf-holidays/[area]` |
| From Dublin/Cork/Shannon/Belfast | `/golf-holidays-spain-from-*` |
| Society packages | `/golf-packages/golf-society-packages` |
| Night-length packages | `/golf-packages/*-night-*` |
| AGP golf transfers | `/transfers/malaga-airport-golf-transfers` |
| Guides / PAA | `/guides/*` |

## Internal-link architecture

Hub → destinations → courses/packages/transfers/guides → enquiry. Footer + in-page bullets use descriptive anchors. BreadcrumbList JSON-LD on content pages.

## Structured data implemented

- TravelAgency Organization (phones, address, contactPoints, sameAs)
- WebSite + WebPage on homepage
- WebPage + BreadcrumbList on Ge content pages
- **Not** added: AggregateRating, Review, fake Offer prices

## Image SEO implementation

- `max-image-preview:large` on indexable meta
- Content pages set OG image from hero asset
- Image sitemap for priority URLs
- Location-specific filenames remain TODO until true photos exist (`SEO_CONTACT_TODO.md`)

## Performance improvements

- SEO pages reuse existing content shell (no new heavy templates)
- Path registry imports lightweight path list only
- No new third-party scripts

## Search Console instructions

1. Verify property for `https://www.golfsolirl.com` (Domain or URL-prefix).
2. Submit sitemaps:
   - `https://www.golfsolirl.com/sitemap.xml`
   - `https://www.golfsolirl.com/sitemap-images.xml`
3. Set preferred domain / monitor www vs non-www.
4. Use URL Inspection on priority URLs below after deploy.

## Sitemap URL

- https://www.golfsolirl.com/sitemap.xml
- https://www.golfsolirl.com/sitemap-images.xml

## Priority indexing list

1. `/`
2. `/golf-holidays`
3. `/golf-holidays/costa-del-sol`
4. `/golf-holidays/marbella`
5. `/golf-holidays-spain-from-ireland`
6. `/golf-holidays-spain-from-dublin`
7. `/golf-packages/golf-society-packages`
8. `/transfers/malaga-airport-golf-transfers`
9. `/guides/costa-del-sol-golf-trip-guide`
10. `/guides/how-to-organise-golf-society-trip-spain`
11. `/packages`
12. `/golf-courses`
13. `/contact`

## Content still requiring human verification

- Individual course technical facts before dedicated course-slug SEO engine
- Facebook / TripAdvisor business profile URLs
- Whether hero visible H1 should later match SEO H1 wording (currently left visually unchanged; screen-reader title updated)

## Missing phone/contact information

None for primary lines — verified numbers already in repo and wired into SEO schema/copy. See `SEO_CONTACT_TODO.md` for optional confirmations.

## Missing imagery

True per-destination photography with SEO filenames — temporary reuse of existing fairway/transfer/hotel assets documented in TODO.

## Future content opportunities

- Prerender/SSR for top SEO URLs
- Per-course pages only when facts are verified
- Expand guide cluster with seasonal updates
- Strengthen homepage visible H1 carefully if marketing agrees

## 30-day SEO plan

- Deploy + submit sitemaps
- Request indexing for priority URLs
- Fix Search Console coverage/redirect issues
- Add real social profile URLs to `sameAs` when confirmed

## 60-day SEO plan

- Review queries for new landing pages
- Improve internal links from homepage sections to hubs
- Publish 1–2 genuinely new guide updates from real trip learnings

## 90-day SEO plan

- Evaluate prerender for `/`, `/golf-holidays/*`, Ireland departure pages
- Start verified course-page engine
- Compare Marbella vs Mijas landing conversion

## How to audit locally

```bash
npm run seo:audit
```
