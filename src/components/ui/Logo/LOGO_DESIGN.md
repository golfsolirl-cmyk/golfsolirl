# Logo Design — Analysis & Lockup Concepts

## 1. Logo image analysis (`public/logo.svg`)

| Aspect | Finding |
|--------|--------|
| **Geometry** | Vector paths with organic curves; complex Bézier shapes; 1024×1024 viewBox. |
| **Palette** | `#07190A` (deep green-black), `#044E19` (dark green), `#FEF495` (warm cream/yellow). |
| **Gradients** | Flat fills; no SVG gradients—depth implied by layered path colours. |
| **Style** | Premium leisure, nature/golf; substantial visual weight; not minimal or tech-flat. |
| **Visual weight** | Heavy (filled shapes); icon reads as emblem/badge. |
| **Proportions** | Square format; icon works at small and large sizes. |

**Brand personality:** Premium product / top-tier leisure brand (golf holidays, Irish audience, Costa del Sol). Trust, clarity, and a touch of luxury—not playful or gaming.

---

## 2. Brand text design (wordmark)

- **Match to icon:** Green family for primary text; warm cream/yellow only as accent (e.g. dark mode glow) so the wordmark doesn’t compete with the icon’s yellow.
- **Typography:** Three concepts use different fonts for distinct lockup personalities (see below).
- **Design elements used:**
  - Custom letter spacing (tighter for SaaS, wider for Tech/Premium).
  - Font weight contrast (GolfSol bold, Ireland slightly lighter or same depending on concept).
  - Gradient text (Tech + Premium in light mode).
  - Subtle glow (drop-shadow and optional soft text-shadow in dark).
  - Icon alignment: baseline-aligned with “GolfSol” and “Ireland”; tagline below with consistent gap.
  - Vertical balance: icon given slight negative margin on header so optical centre aligns with first line of text.

**Font pairing:**

- **Concept 1 (SaaS):** DM Sans — clean, modern, highly readable.
- **Concept 2 (Tech):** Outfit — geometric, bold, startup/tech feel.
- **Concept 3 (Premium):** Playfair Display — serif, elegant, luxury.

---

## 3. Three logo lockup concepts

### Concept 1 — Clean SaaS

- **Goal:** Simple, modern, highly readable.
- **Layout:** Icon + text; tight gap (`gap-2` / `gap-2.5`).
- **Typography:** DM Sans, font-weight 600–700; minimal letter-spacing; no gradient (solid green).
- **Responsive:** Same hierarchy at all breakpoints; tagline scales down on small screens.
- **Use case:** Navbar, hero, mobile; when the product should feel “product-led” and clear.

### Concept 2 — Bold Tech

- **Goal:** Stronger typography, gradient, slight futuristic feel.
- **Layout:** Slightly larger gap between icon and text (`gap-3` / `gap-4`).
- **Typography:** Outfit, extra-bold; increased letter-spacing; green gradient + soft green glow in light mode.
- **Responsive:** Gradient and glow scale with size; hover increases glow and letter-spacing slightly.
- **Use case:** Hero, landing; when the brand should feel like a top-tier tech/startup product.

### Concept 3 — Premium

- **Goal:** Elegant spacing, luxury feel.
- **Layout:** Balanced gap (`gap-2` / `gap-3`); icon and text feel “breathing”.
- **Typography:** Playfair Display, black weight; green gradient in light; subtle drop-shadow; slight letter-spacing increase on hover.
- **Responsive:** Works in navbar, hero, and mobile without feeling cramped.
- **Use case:** Default for Golf Sol Ireland — premium golf holidays; trust and elegance.

---

## 4. Reusable component

- **File:** `src/components/ui/Logo/index.tsx`
- **Props:** `variant` (header | footer | hero), `concept` (saas | tech | premium), `className`, `asLink`, `onClick`.
- **Behaviour:** Icon + wordmark + tagline; responsive sizing via Tailwind; works in navbar, hero, and footer; mobile scaling via size maps (e.g. smaller icon and text on header mobile).

---

## 5. Micro design enhancements

- **Hover:** Slight increase in letter-spacing and glow (Tech/Premium); SaaS gets a small letter-spacing bump only.
- **Gradient:** Static in light mode; no animated gradient to keep the look premium and not flashy.
- **Transitions:** `filter`, `letter-spacing`, `opacity` on wordmark and tagline (0.2–0.3s).
- **Active:** Logo link scales down slightly on click (`scale(0.99)`) for feedback.

---

## 6. Deliverables

| Deliverable | Location |
|-------------|----------|
| Improved logo + text layout | `Logo` component + `globals.css` (`.logo-lockup-*`, `.logo-wordmark`, `.logo-tagline`) |
| Typography | Playfair Display, DM Sans, Outfit — loaded in `layout.tsx`; Tailwind `font-display`, `font-body`, `font-outfit` |
| 3 design variations | `concept="saas"`, `concept="tech"`, `concept="premium"` on `<Logo />` |
| Design reasoning | This file + comments in `Logo/index.tsx` |

**Usage:**

```tsx
<Logo variant="header" concept="premium" />   // default: elegant
<Logo variant="hero" concept="tech" />       // bold gradient for hero
<Logo variant="footer" concept="saas" />     // clean in footer
```

Goal: a single, memorable, modern logo lockup that fits a top-tier tech startup or premium product, with three on-brand options (clean, bold, premium).
