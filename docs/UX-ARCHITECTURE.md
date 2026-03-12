# Golf Sol Ireland — UX Architecture (Step 2)

**Step 2 (UX Architect):** Information architecture, layout system, navigation, heading hierarchy, and ARIA landmarks. Structure-first; styling uses Brand (Step 1) and UI Designer tokens.

---

## 1. Information architecture

### Site map

| Page | Purpose | Key sections / content |
|------|---------|-------------------------|
| **Home** | Convert visitors: understand offer → enquire | Hero, Packages, Costa del Sol, Statement, Courses, Accommodation, How it works, Testimonials, Newsletter, Contact |
| **Login** | Returning user auth | Form only |
| **Signup** | New user registration | Form only |
| **Forgot password** | Password reset | Form only |
| **Profile** | User account (post-login) | Profile content |
| **Logo preview** | Internal: logo concept showcase | N/A |

### Homepage content hierarchy

1. **Hero** — Single h1: “Your tailor-made golf holiday”. Primary CTAs: Enquire, Design your package.
2. **Golf packages** (`#packages`) — h2. Intro + 4-step cards. CTA: Enquire now.
3. **Costa del Sol only** (`#costa-del-sol`) — h2. Supporting copy + imagery. Reinforces “only Costa del Sol”.
4. **Statement** — h2 “Sun. Fairways. No hassle.” Short value prop.
5. **Golf courses** (`#courses`) — h2. Course list/cards. Link to contact.
6. **Accommodation** (`#accommodation`) — h2. Accommodation cards. h3 per card title.
7. **How it works** (`#how-it-works`) — h2. Steps. h3 per step.
8. **Testimonials** (`#testimonials`) — h2. Quotes.
9. **Newsletter** (`#newsletter`) — h2. Signup form.
10. **Contact** (`#contact`) — h2. Contact copy + form. h3 for “Send us a message”.

### Heading hierarchy rules

- **One h1 per page** — Home: in Hero only.
- **Section titles = h2** — Each major section has one h2 with a stable `id` for deep-linking and `aria-labelledby` on the section.
- **Subsections = h3** — e.g. step titles, card titles, “Send us a message”.
- Do not skip levels (no h2 → h4).

---

## 2. Layout structure

### Breakpoints (mobile-first)

| Token | Min width | Use |
|-------|-----------|-----|
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets, nav becomes horizontal |
| `lg` | 1024px | Small desktop |
| `xl` | 1280px | Desktop, max content width |

### Container

- **Role:** Constrain content width and add horizontal padding.
- **Max width:** `--container-max` (1280px) = Tailwind `max-w-content`.
- **Padding:** 8pt grid. Mobile 16px, sm 24px, lg 32px, xl 40px (align with `--header-padding-x` where appropriate).
- **Usage:** Wrap section content; do not use for full-bleed backgrounds. Section has background; inner content uses `Container`.

### Grid (CSS Grid)

- **Component:** `Grid` in `layout/Grid`.
- **Columns:** 1 | 2 | 3 | 4 | 6 | 12. Prefer responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- **Gap:** `none` (0) | `sm` (8px) | `md` (16px) | `lg` (24px). Use 8pt multiples.
- **When to use:** Two-column layouts, card grids, form layouts.

### Stack (flex column)

- **Component:** `Stack` in `layout/Stack`.
- **Gap:** Same as Grid. Use for vertical rhythm (e.g. form fields, list of cards).
- **When to use:** Vertical content blocks, narrow columns.

### Section spacing

- **Vertical:** Consistent section padding. Use `py-24 md:py-32` (96px / 128px) for main sections; `pb-20` before wave/divider where used.
- **Token:** `--section-py` (tokens.css) = 96px. Can add `--section-py-lg: 128px` for larger sections.

---

## 3. Navigation system

- **Header:** Sticky; main nav + Enquire + theme toggle. Implemented in Step 1 (UI Designer).
- **Desktop (≥768px):** Horizontal nav links, right-aligned; logo left; spacer between logo and nav.
- **Mobile (<768px):** Hamburger; drawer with same links + Enquire + theme toggle. Focus trap and Escape close.
- **Nav items:** Home, Golf Packages, Golf Courses, Accommodation, Plan Your Trip, Contact. All hash links to homepage sections.
- **Footer:** Same links in “Menu” column; Contact column; Legal (e.g. Privacy). Social links.
- **Landmarks:** `<header role="banner">`, `<nav aria-label="Main navigation">`, `<main id="main">`, `<footer role="contentinfo">`. Skip link targets `#main`.

---

## 4. ARIA landmarks and semantics

| Landmark | Element | Notes |
|----------|---------|------|
| Banner | `<header role="banner">` | One per page |
| Main nav | `<nav aria-label="Main navigation">` | Header nav |
| Main | `<main id="main">` | One per page; skip link target |
| Content info | `<footer role="contentinfo">` | One per page |
| Regions | `<section id="..." aria-labelledby="...-heading">` | Each section with a visible h2 gets an id and aria-labelledby pointing to that h2 |

**Section pattern:**

- Section has `id="section-name"` for deep-linking.
- Section has `aria-labelledby="section-name-heading"`.
- Section contains exactly one h2 with `id="section-name-heading"`.

Example:  
`<section id="packages" aria-labelledby="packages-heading">` … `<h2 id="packages-heading">Golf packages</h2>` …

---

## 5. Spacing and typographic hierarchy

- **Spacing:** 8pt grid (4, 8, 16, 24, 32, 48, 64, 96, 128px). Use Tailwind or `--spacing-*` from tokens.
- **Section padding:** 96px vertical default; 128px on large screens for key sections.
- **Typography scale:** Headings use `--font-display` (Playfair); body uses `--font-body` (DM Sans). Scale: section title = clamp(2rem, 4vw, 3.25rem); h3 = clamp(1.15rem, 2vw, 1.4rem). See theme/tokens and `section-title`, `section-label`, `text-h3` in Tailwind.

---

## 6. Implementation checklist

- [x] One h1 per page (Hero).
- [x] All major sections have id + aria-labelledby + h2.
- [x] Container max-width and padding defined; sections use Container for inner content.
- [x] Grid and Stack components; 8pt gap options.
- [x] Header/footer nav and landmarks documented.
- [x] Add `#costa-del-sol` and `#statement` to sections; aria-labelledby on both.
- [x] Container: 8pt padding (px-4 sm:px-6 lg:px-8 xl:px-10).
- [x] Layout tokens: --section-py, --section-py-lg in tokens.css.
- Use **Container** for section content; use **PageWrapper** for full-page layouts (login, profile).
