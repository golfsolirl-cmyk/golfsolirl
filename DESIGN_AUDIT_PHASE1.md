# Phase 1 — Design Audit Report (Read-Only)

*No code changes. Structured list for design system planning.*

---

## 1. Every component file and its current styling approach

| File | Styling approach | Notes |
|------|------------------|--------|
| **UI** | | |
| `src/components/ui/Button.tsx` | Tailwind only (className, cn). Variants/sizes as objects. | No CSS modules, no inline styles. Relies on globals.css for `.btn-animated`. |
| `src/components/ui/Input.tsx` | Tailwind only. | label + input + error paragraph. |
| `src/components/ui/Textarea.tsx` | Tailwind only. | Same pattern as Input. |
| `src/components/ui/SectionWave.tsx` | Tailwind + inline `style={{ minHeight: '5rem' }}`. SVG `fill`/`stroke` from props (string). | Hardcoded `PRIMARY_GREEN = '#123811'`, `getStrokeColor()` returns rgba strings. |
| `src/components/ui/GolfMotif.tsx` | Tailwind (sizes object). Inline SVG with currentColor/opacity. | `opacity-[0.12]` — magic number. |
| **Layout** | | |
| `src/components/layout/Container.tsx` | Tailwind only. | Single component, no subcomponents. |
| `src/components/layout/Header.tsx` | Tailwind only. | Long className strings; dark: variants for theme. |
| `src/components/layout/Footer.tsx` | Tailwind only. | Uses globals.css classes: `.logo-3d`, `.logo-3d--dark`, `.logo-text`, `.logo-text--dark`. |
| **Sections** | | |
| `src/components/sections/Hero.tsx` | Tailwind + globals (blob-animate, hero-headline, hero-subline, etc.). | Many arbitrary values: w-[520px], rounded-[63%_37%_...], min-h-[calc(100vh-72px)]. |
| `src/components/sections/GolfPackages.tsx` | Tailwind + globals (blob-animate). | Inline SVG icons; step cards use Tailwind. |
| `src/components/sections/RepeatHeadline.tsx` | Tailwind + globals (section-label, section-title, section-script). | Arbitrary widths/heights. |
| `src/components/sections/Statement.tsx` | Tailwind + globals (section-label, section-title). | max-w-[680px]. |
| `src/components/sections/GolfCourses.tsx` | Tailwind + globals (blob-animate). | Same section pattern. |
| `src/components/sections/Accommodation.tsx` | Tailwind + globals. | Cards: shadow-card, hover:shadow-cardHover, inline style transitionDelay. |
| `src/components/sections/HowItWorks.tsx` | Tailwind + globals. | Step images; rounded-2xl, shadow-xl. |
| `src/components/sections/Testimonials.tsx` | Tailwind + globals (section-label, section-title). | StarRating inline SVG; card layout. |
| `src/components/sections/Newsletter.tsx` | Tailwind + globals (newsletter-headline-outline, section-title, font-script). | Raw `<input>` and `<button>` — not shared Input/Button in form. |
| `src/components/sections/ContactSection.tsx` | Tailwind + globals (contact-pop-wrap, contact-pop-in, section-label, section-title). | Uses shared Input, Textarea, Button. |
| **App / Other** | | |
| `src/app/globals.css` | CSS custom properties (:root) + Tailwind @apply + raw CSS. | Mix of tokens and one-off rules (animations, logo, hero, newsletter, etc.). |
| `src/app/layout.tsx` | Tailwind (font variables). | Metadata only; body classes. |
| `src/app/login/page.tsx` | Tailwind only. | Raw `<input>` + labels; uses `text-darkgreen`, `dark:text-offwhite`, `dark:bg-darkgreen/10` — see token gap below. |
| `src/app/signup/page.tsx` | Same as login. | Raw inputs. |
| `src/app/forgot-password/page.tsx` | Same as login. | Raw inputs. |
| `src/app/profile/page.tsx` | Tailwind only. | No form inputs; placeholder content. |
| `src/components/ErrorBoundary.tsx` | Tailwind only. | Fallback UI. |
| `src/components/Providers.tsx` | No styling. | Wraps ThemeProvider + ScrollReveal. |
| `src/components/ScrollReveal.tsx` | No styling. | Uses .reveal class from globals. |

**Summary:** Styling is **Tailwind-first** with a large **globals.css** (animations, section typography, logo, buttons, blobs). No CSS modules. Inline styles only in SectionWave (minHeight) and Accommodation (transitionDelay). Auth pages and Newsletter use **raw HTML form controls**; ContactSection uses shared **Input/Textarea/Button**.

---

## 2. Hardcoded values → tokens to create

### Colors (hex / rgba in code)

- **globals.css:** `#0d2d0d`, `#b85c28`, `#123811`, `#333`, `#fff`, `#14591b`, `rgba(18,56,17,…)`, `rgba(255,255,255,…)`, `rgba(245,200,66,…)`, `rgba(0,0,0,…)` — many in body, section-label, section-title, logo, hero, package-step-card, step-card-icon, newsletter, shadows.
- **tailwind.config.ts:** Full palette (primary, accent, greens, cream, border, etc.) — **duplicate** of globals :root for primary/accent/cream. No single source of truth.
- **SectionWave.tsx:** `#123811`, `rgba(255,255,255,0.6)`, `rgba(18,56,17,0.45)`.
- **Section components:** `SectionWave fill="#F5F0E8"` (cream), `fill="#C8DCF0"` (light blue), `fill="#123811"` (primary) — hex strings passed as props instead of token references.
- **Auth pages (login/signup/forgot-password/profile):** `text-darkgreen`, `dark:text-offwhite`, `dark:bg-darkgreen/10`, `border-gray-300`, `text-gray-700`, `dark:text-gray-300` — **darkgreen and offwhite are not defined in tailwind.config.ts**; need to be added or replaced with semantic tokens.

### Font sizes

- **globals.css:** `1rem`, `clamp(2rem, 4vw, 3.25rem)`, `clamp(1.65rem, 4.2vw, 2.25rem)`, `clamp(0.85rem, 2.2vw, 1.1rem)`, `clamp(0.65rem, 1.6vw, 0.8rem)` for logo and section titles.
- **tailwind.config.ts:** xs (11px) through 5xl (48px), hero (80px), h1/h2/h3 with clamp — **duplicated** with globals where section-title/section-script exist in both.

### Spacing

- **globals.css:** `--section-py: 96px`, `--section-px: 24px`, `--nav-height: 72px`, `--touch-min: 44px`.
- **tailwind.config.ts:** nav-height (72px), section (96px), section-lg (128px). No 4px grid (4,8,12,16…).
- **Components:** Many arbitrary values: `py-24 md:py-32`, `pb-20`, `gap-12 md:gap-16`, `mb-16`, `px-6 md:px-10`, `min-h-[72px]`, `min-h-[44px]`, `min-h-[40px]`, `max-w-[680px]`, `w-[520px]`, etc. — should map to a spacing scale.

### Border radius

- **globals.css:** `--radius-sm: 6px` through `--radius-xl: 20px`.
- **tailwind.config.ts:** sm (6px), md (12px), lg (16px), xl (20px), 2xl (24px). Components use `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full` — mixed; no single radius scale name (e.g. radius-md) used consistently.

### Shadows

- **globals.css:** Multiple ad-hoc box-shadows and drop-shadows for buttons, logo, package-step-card, newsletter.
- **tailwind.config.ts:** card, cardHover, product, hero, button, elevation — good base but not referenced from CSS vars; dark mode variants not defined.

### Motion

- **globals.css:** `--transition: 0.25s ease`; various keyframes with hardcoded durations (0.6s, 0.35s, 8s, 10s, 4s, etc.).
- **tailwind.config.ts:** fast (150ms), normal (250ms), slow (400ms) — not aligned with globals and not used consistently (e.g. duration-normal vs duration-200 in components).

---

## 3. Duplication and inconsistency

| Issue | Where | Recommendation |
|-------|--------|----------------|
| **Two token sources** | `globals.css` :root vs `tailwind.config.ts` | Single source (e.g. tokens.css + Tailwind extends from it, or Tailwind only). |
| **Logo block duplicated** | Header and Footer both render logo (Image + logo-text + shamrock). | Extract `<SiteLogo variant="header" \| "footer" />`. |
| **Enquire CTA duplicated** | Header: two “Enquire” links (desktop + mobile). Same styling repeated. | Single NavCTA component or shared Button. |
| **Section layout pattern** | Every section: outer section + blob divs + Container + reveal + section-label + section-title + content + SectionWave. | Consider SectionLayout (wrapper with optional blobs + wave) or at least shared section heading component. |
| **Card style repeated** | GolfPackages step cards, Accommodation cards, Testimonials blockquotes, HowItWorks cards — all “white rounded-2xl shadow-card border hover:shadow-cardHover”. | Shared Card component (default + elevated + interactive). |
| **Form inputs** | ContactSection uses Input/Textarea/Button. Login, Signup, Forgot-password use raw `<input>` + Tailwind. Newsletter uses raw `<input>` and `<button>`. | Standardize on shared Input/Textarea/Button (and optional PasswordInput) everywhere. |
| **Blob decorative pattern** | Hero, GolfPackages, ContactSection, Newsletter, etc. — same blob-animate + arbitrary size/position/color. | Tokenize sizes/positions or a single BlobDecoration component with variant/color. |
| **SectionWave fill** | Call sites pass hex strings ("#F5F0E8", "#C8DCF0", "#123811"). | Pass token names or theme variables; SectionWave resolves to actual color. |

---

## 4. Missing component states

| Component | Missing states | Notes |
|-----------|----------------|--------|
| **Button** | **Loading** (spinner + “Loading…”), **icon** (leading/trailing/icon-only). | Has disabled; no loading prop. |
| **Input** | **Success** (valid state styling), **warning**, **helper text slot**, **adornments** (left/right), **password show/hide**. | Has error only. |
| **Textarea** | Same as Input; **auto-resize**, **character count**. | Has error only. |
| **Header** | **Active route** (nav link for current page/section not highlighted). | Hover only. |
| **Footer** | — | Links have hover/focus; no active state needed for footer. |
| **Theme toggle** | **Active/pressed** (subtle). | Has hover/focus. |
| **Mobile menu** | **Focus trap** present; **no visible focus ring** on first focusable inside panel (relies on global focus-visible). | OK but ensure focus ring uses token. |
| **Cards (sections)** | **Focus** for interactive cards (e.g. Accommodation “Enquire →”); **loading** for any async card content. | Hover present. |
| **Auth forms** | **Loading** (button shows “Signing in…” but no spinner); **success** (login redirects; signup shows message). | Error/success text present; no loading spinner. |
| **ContactSection / Newsletter** | **Loading** (button text change only); **success/error** (message below form). | No spinner; no disabled state on inputs during submit. |
| **ErrorBoundary** | — | Fallback has link; no “retry” action. |

---

## 5. Accessibility issues

| Location | Issue | Severity |
|----------|--------|----------|
| **Auth pages** | Use `text-darkgreen` / `dark:text-offwhite` — **darkgreen/offwhite not in Tailwind config**. If not defined, these classes do nothing and contrast may fail. | High (theme + contrast). |
| **Hero** | Background image `alt=""` — acceptable only if purely decorative (ensure no critical content). | Low. |
| **Header** | Theme toggle and hamburger have **aria-label**. Nav menu has **role="dialog"**, **aria-modal="true"**, **aria-label="Main menu"**. Focus trap and Escape implemented. | Good. |
| **Footer** | Social links have **aria-label**. Logo has alt={SITE_NAME}. | Good. |
| **Skip link** | Present in layout; **.skip-link:focus-visible** moves it into view. | Good. |
| **Input / Textarea** | **label** + **htmlFor/id**; **aria-invalid**, **aria-describedby** for error; error has **role="alert"**. | Good. |
| **Newsletter** | Raw input has **label** (sr-only), **aria-invalid**. Submit button has no **aria-label** (text “Get deals” is sufficient). | OK. |
| **Login/Signup/Forgot** | Raw inputs have **label** + **htmlFor/id**. No **aria-invalid** or **aria-describedby** on inputs; error message has **role="alert"**. | Medium (associate error with input for screen readers). |
| **Global focus** | `*:focus-visible` in globals.css — **outline uses var(--color-primary)**. Good. | Good. |
| **Contrast** | Section label color `#b85c28` on cream — should be checked (WCAG AA). Muted text `#0d2d0d` on cream — likely OK. | Verify with contrast checker. |
| **SectionWave** | **aria-hidden** on wrapper — correct (decorative). | Good. |
| **ErrorBoundary** | Fallback has **role="alert"**; “Go home” link could use **aria-label** for clarity. | Low. |

---

## Summary for next phases

- **Tokens:** Introduce a single token system (e.g. `tokens.css` with semantic names and `[data-theme="dark"]`), and align Tailwind and globals to it. Replace all hex/rgba and magic numbers with token references. Add missing colors (e.g. darkgreen/offwhite or map to primary/muted).
- **Components:** Extract Card, SiteLogo, SectionLayout (or section heading), and standardize all forms on Input/Textarea/Button (with loading, success, error, and optional password toggle). Extend Button with loading and icon slots.
- **States:** Add loading (and optional success) to Button and form flows; add success/warning/helper to Input/Textarea; consider active state for nav and theme toggle.
- **A11y:** Fix auth form error association (aria-describedby + id); ensure dark theme colors are defined and meet contrast; keep focus trap and skip link as-is.

Confirm to proceed to Phase 2 (design token system).
