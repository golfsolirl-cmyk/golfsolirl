# Golf Sol Ireland — Frontend

Production-ready Next.js frontend for Golf Sol Ireland (Costa del Sol golf holidays for Irish golfers). Design system inspired by [Pa'lais](https://www.palais.bio/); content and palette for Golf Sol Ireland.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (design tokens: container, spacing, colors, typography)
- **React Hook Form** + **Zod** (form validation)
- **next/image** (image optimization)

## Design system

- **Colors:** Off White `#FDFDFC`, Deep Golf Green `#14591B`, Forest `#071E09`, Sunset Orange `#D9540A`, Soft Gold `#DED281`, Grass Olive `#869A35`, cream/sand backgrounds.
- **Layout:** Max width 1200px, section padding `py-28 md:py-32`, grid gaps `gap-12 md:gap-16`.
- **Typography:** Hero 54px/76px font-light, section headings 4xl/5xl, body `text-lg leading-relaxed`.
- **Motion:** Scroll reveal (fade + translateY 600ms), image zoom on hover 700ms, hover transitions 300ms.

## Component hierarchy

```
layout/
  Container      — max-w-content, px-6 md:px-10
  Header         — fixed nav, scroll state, mobile menu
  Footer         — 4 columns, Menu / Plan your trip / Contact / Legal

sections/
  Hero           — two-col, H1/H2, scroll down, CTA, image
  GolfPackages   — headline + 4 image cards with overlay
  RepeatHeadline — same headline + copy + “View golf packages”
  Statement      — centred “Sun. Fairways. No hassle.”
  GolfCourses    — image + text block (courses list)
  Accommodation  — text + image
  HowItWorks     — 4 steps + CTA
  Testimonials   — 3 quotes
  Newsletter     — headline + form (validation, API)
  ContactSection — Martin Kelly + contact form (validation, API)

ui/
  Button         — primary / secondary, sm / md, link or button
  Input          — label, error, a11y
  Textarea       — label, error, a11y
```

## Pages & routing

| Route | Description |
|-------|-------------|
| `/` | Home (all sections) |
| `/contact` | Optional standalone contact (can mirror #contact) |
| `/plan-your-trip` | Optional (can mirror #how-it-works) |
| `/login` | Sign in (placeholder; wire to auth when ready) |
| `/signup` | Create account (placeholder) |
| `/forgot-password` | Reset password (placeholder) |
| `/profile` | User profile (placeholder) |

## State & API

- **Global:** `ThemeContext` (light/dark), persisted in `localStorage`.
- **Local:** Section components use `useState` for form status; `useScrollReveal` and `useNavScroll` for UI.
- **Server/API:** `src/lib/api.ts` — `submitContact`, `submitNewsletter`. Set `NEXT_PUBLIC_API_URL` to point to your backend; until then, calls resolve with success.

## Forms & validation

- **Contact:** name (min 2), email, message (min 10). Zod + react-hook-form.
- **Newsletter:** email. Zod + react-hook-form.
- Error messages and success states in place; ARIA for errors and status.

## Accessibility

- Skip link to main content
- Focus-visible outlines (primary/gold)
- ARIA labels on nav, forms, sections
- Semantic HTML (header, main, footer, section, nav)

## Dark mode

- `ThemeProvider` + `class` on `<html>` (`light` / `dark`).
- CSS variables and Tailwind `dark:` used across components.
- Toggle can be added in Header (e.g. button that calls `useTheme().toggleTheme()`).

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Env

- `NEXT_PUBLIC_API_URL` — optional; base URL for contact/newsletter API. If unset, forms still “succeed” for demo.
